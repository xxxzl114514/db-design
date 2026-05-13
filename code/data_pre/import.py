import pandas as pd
import pymysql
from sqlalchemy import create_engine
import uuid
from datetime import datetime
import re

class FishingVesselDataImporter:
    def __init__(self, db_config):
        """初始化数据库连接"""
        self.db_connection = create_engine(
            f"mysql+pymysql://{db_config['user']}:{db_config['password']}@{db_config['host']}/{db_config['database']}?charset={db_config['charset']}"
        )
        self.raw_connection = pymysql.connect(**db_config)
        
    def extract_vessel_type(self, vessel_name):
        """从船舶名称中提取船舶类型"""
        if not vessel_name:
            return None
            
        vessel_name_lower = vessel_name.lower()
        
        # 根据关键词匹配船舶类型
        type_mapping = {
            '客轮': ['客轮', '客船', '客运'],
            '渔船': ['渔', '捕捞', '渔运'],
            '拖船': ['拖', ' tug'],
            '集装箱船': ['集装箱', '货柜'],
            '货轮': ['货轮', '货船'],
            '散货船': ['散货', 'bulk'],
            '油轮': ['油轮', '油船', 'tanker'],
            '邮轮': ['邮轮', '游轮']
        }
        
        for type_name, keywords in type_mapping.items():
            if any(keyword in vessel_name_lower for keyword in keywords):
                return type_name
        return '货轮'  # 默认类型

    def parse_anchorage_info(self, anchorage_name):
        """解析锚地信息，提取类型、区域和编号"""
        if not anchorage_name:
            return {'type': None, 'area': None, 'zone_number': None}
            
        anchorage_name = str(anchorage_name)
        
        # 锚地类型识别
        anchorage_type = None
        type_keywords = {
            '港口': ['港', '港口'],
            '码头': ['码头', '泊位'],
            '停泊区': ['停泊区', '停泊点'],
            '锚地': ['锚地', '锚区']
        }
        
        for type_name, keywords in type_keywords.items():
            if any(keyword in anchorage_name for keyword in keywords):
                anchorage_type = type_name
                break
        
        # 区域和编号提取
        area = None
        zone_number = None
        
        # 匹配模式如 "南区1号"、"西区2号锚地"
        area_pattern = r'([东南西北中])区'
        zone_pattern = r'(\d+)[号]'
        
        area_match = re.search(area_pattern, anchorage_name)
        zone_match = re.search(zone_pattern, anchorage_name)
        
        if area_match:
            area = area_match.group(1) + '区'
        if zone_match:
            zone_number = zone_match.group(1)
            
        return {
            'type': anchorage_type or '锚地',
            'area': area,
            'zone_number': zone_number
        }

    def import_csv_data(self, csv_file_path):
        """主导入函数"""
        connection = None
        try:
            # 获取数据库连接用于事务处理
            connection = self.raw_connection
            connection.begin()
            
            # 读取CSV文件
            print("正在读取CSV文件...")
            df = pd.read_csv(csv_file_path)
            print(f"成功读取 {len(df)} 行数据")
            
            # 数据清洗
            df = self.clean_data(df)
            
            # 分步导入数据（在事务中执行）
            vessel_type_mapping = self.import_vessel_types()
            vessel_mapping = self.import_vessels(df, vessel_type_mapping)
            anchorage_mapping = self.import_anchorages(df)
            trip_mapping = self.import_trips(df, vessel_mapping)
            self.import_visits(df, trip_mapping, vessel_mapping, anchorage_mapping)
            
            # 提交事务
            connection.commit()
            print("数据导入完成！")
            
        except Exception as e:
            # 回滚事务
            if connection:
                connection.rollback()
            print(f"导入过程中发生错误: {str(e)}")
            print("已回滚所有更改，数据库保持一致性")
            raise
        finally:
            # 确保连接正确关闭
            if connection and connection.open:
                connection.close()

    def clean_data(self, df):
        """数据清洗和预处理"""
        # 处理空值
        df = df.fillna('')
        
        # 确保必要字段存在
        required_columns = ['mmsi', 'vessel_id', 'vessel_name', 'trip_id', 
                          'trip_start', 'trip_end', 'trip_start_anchorage_name', 
                          'trip_end_anchorage_name']
        
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"CSV文件中缺少必要列: {col}")
        
        # 转换时间格式
        df['trip_start'] = pd.to_datetime(df['trip_start'], errors='coerce')
        df['trip_end'] = pd.to_datetime(df['trip_end'], errors='coerce')
        
        # 移除时间无效的行
        df = df.dropna(subset=['trip_start', 'trip_end'])
        
        # 确保vessel_id和trip_id不为空
        df = df[df['vessel_id'].astype(str).str.strip() != '']
        df = df[df['trip_id'].astype(str).str.strip() != '']
        
        print(f"数据清洗后剩余 {len(df)} 行")
        return df

    def import_vessel_types(self):
        """导入船舶类型并返回类型映射"""
        print("处理船舶类型...")
        
        # 获取现有的船舶类型
        query = "SELECT type_name, vessel_type_id FROM vessel_types"
        existing_types = pd.read_sql(query, self.db_connection)
        type_mapping = dict(zip(existing_types['type_name'], existing_types['vessel_type_id']))
        
        print(f"现有船舶类型: {list(type_mapping.keys())}")
        return type_mapping

    def import_vessels(self, df, type_mapping):
        """导入船舶数据"""
        print("导入船舶数据...")
        
        # 提取唯一的船舶数据
        vessels_data = []
        vessel_seen = set()
        
        for _, row in df.iterrows():
            vessel_id = str(row['vessel_id']).strip()
            if vessel_id in vessel_seen:
                continue
                
            vessel_type = self.extract_vessel_type(row['vessel_name'])
            vessel_type_id = type_mapping.get(vessel_type)
            
            vessels_data.append({
                'vessel_id': vessel_id,
                'mmsi': int(row['mmsi']) if row['mmsi'] else 0,
                'vessel_name': row['vessel_name'],
                'vessel_type_id': vessel_type_id,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            })
            vessel_seen.add(vessel_id)
        
        # 导入到数据库
        if vessels_data:
            vessels_df = pd.DataFrame(vessels_data)
            vessels_df.to_sql('vessels', self.db_connection, if_exists='append', index=False)
            print(f"成功导入 {len(vessels_df)} 艘船舶")
        
        # 返回船舶ID映射
        return {v['vessel_id']: v['vessel_id'] for v in vessels_data}

    def import_anchorages(self, df):
        """导入锚地数据"""
        print("导入锚地数据...")
        
        # 提取所有锚地名称
        anchorage_names = set()
        anchorage_names.update(df['trip_start_anchorage_name'].dropna().astype(str))
        anchorage_names.update(df['trip_end_anchorage_name'].dropna().astype(str))
        anchorage_names = {name for name in anchorage_names if name.strip()}
        
        # 获取现有锚地
        query = "SELECT anchorage_name, anchorage_id FROM anchorages"
        existing_anchorages = pd.read_sql(query, self.db_connection)
        anchorage_mapping = dict(zip(existing_anchorages['anchorage_name'], existing_anchorages['anchorage_id']))
        
        # 处理新锚地
        new_anchorages = []
        for name in anchorage_names:
            if name not in anchorage_mapping:
                anchorage_info = self.parse_anchorage_info(name)
                new_anchorages.append({
                    'anchorage_name': name,
                    'anchorage_type': anchorage_info['type'],
                    'area_zone': anchorage_info['area'],
                    'zone_number': anchorage_info['zone_number'],
                    'created_at': datetime.now(),
                    'updated_at': datetime.now()
                })
        
        # 导入新锚地
        if new_anchorages:
            anchorages_df = pd.DataFrame(new_anchorages)
            anchorages_df.to_sql('anchorages', self.db_connection, if_exists='append', index=False)
            
            # 更新映射
            new_query = "SELECT anchorage_name, anchorage_id FROM anchorages"
            all_anchorages = pd.read_sql(new_query, self.db_connection)
            anchorage_mapping = dict(zip(all_anchorages['anchorage_name'], all_anchorages['anchorage_id']))
            
            print(f"成功导入 {len(new_anchorages)} 个新锚地")
        
        print(f"总计 {len(anchorage_mapping)} 个锚地")
        return anchorage_mapping

    def import_trips(self, df, vessel_mapping):
        """导入航次数据"""
        print("导入航次数据...")
        
        trips_data = []
        trip_seen = set()
        
        for _, row in df.iterrows():
            trip_id = str(row['trip_id']).strip()
            if trip_id in trip_seen:
                continue
                
            trips_data.append({
                'trip_id': trip_id,
                'vessel_id': str(row['vessel_id']).strip(),
                'trip_start': row['trip_start'],
                'trip_end': row['trip_end'],
                'created_at': datetime.now()
            })
            trip_seen.add(trip_id)
        
        # 导入航次
        if trips_data:
            trips_df = pd.DataFrame(trips_data)
            trips_df.to_sql('trips', self.db_connection, if_exists='append', index=False)
            print(f"成功导入 {len(trips_df)} 个航次")
        
        return {t['trip_id']: t['trip_id'] for t in trips_data}

    def import_visits(self, df, trip_mapping, vessel_mapping, anchorage_mapping):
        """导入访问记录数据"""
        print("导入访问记录...")
        
        visits_data = []
        visit_seen = set()
        
        for _, row in df.iterrows():
            trip_id = str(row['trip_id']).strip()
            vessel_id = str(row['vessel_id']).strip()
            
            # 出发访问记录
            start_visit_id = str(row.get('trip_start_visit_id', f"{trip_id}_departure")).strip()
            if start_visit_id not in visit_seen:
                start_anchorage_name = str(row['trip_start_anchorage_name']).strip()
                if start_anchorage_name in anchorage_mapping:
                    visits_data.append({
                        'visit_id': start_visit_id,
                        'trip_id': trip_id,
                        'vessel_id': vessel_id,
                        'anchorage_id': anchorage_mapping[start_anchorage_name],
                        'visit_time': row['trip_start'],
                        'visit_type': 'departure',
                        'created_at': datetime.now()
                    })
                    visit_seen.add(start_visit_id)
            
            # 到达访问记录
            end_visit_id = str(row.get('trip_end_visit_id', f"{trip_id}_arrival")).strip()
            if end_visit_id not in visit_seen:
                end_anchorage_name = str(row['trip_end_anchorage_name']).strip()
                if end_anchorage_name in anchorage_mapping:
                    visits_data.append({
                        'visit_id': end_visit_id,
                        'trip_id': trip_id,
                        'vessel_id': vessel_id,
                        'anchorage_id': anchorage_mapping[end_anchorage_name],
                        'visit_time': row['trip_end'],
                        'visit_type': 'arrival',
                        'created_at': datetime.now()
                    })
                    visit_seen.add(end_visit_id)
        
        # 导入访问记录
        if visits_data:
            visits_df = pd.DataFrame(visits_data)
            visits_df.to_sql('visits', self.db_connection, if_exists='append', index=False)
            print(f"成功导入 {len(visits_df)} 条访问记录")

    def close(self):
        """关闭数据库连接"""
        if hasattr(self, 'raw_connection'):
            self.raw_connection.close()



if __name__ == "__main__":
    # 数据库配置
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': 'jjrsn712050816',
        'database': 'vessel_system',
        'charset': 'utf8mb4'
    }
    
    # 创建导入器实例
    importer = FishingVesselDataImporter(db_config)
    
    try:
        # 执行导入
        importer.import_csv_data('dataset.csv')
        
        # 验证数据
        print("\n数据验证:")
        tables = ['vessels', 'anchorages', 'trips', 'visits']
        for table in tables:
            count = pd.read_sql(f"SELECT COUNT(*) as count FROM {table}", importer.db_connection).iloc[0]['count']
            print(f"{table}: {count} 条记录")
            
    finally:
        importer.close()