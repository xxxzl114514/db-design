const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.config = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            charset: process.env.DB_CHARSET || 'utf8mb4',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000,
            acquireTimeout: 10000,
            timeout: 60000,
            reconnect: true,
            multipleStatements: false
        };
        this.pool = mysql.createPool(this.config);
    }

    async query(sql, params = [], retryCount = 0) {
        const maxRetries = 2;
        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database query error:', error);
            
            // 如果是通信包错误且还有重试次数，则重试
            if ((error.code === 'ER_MALFORMED_PACKET' || error.code === 'ECONNRESET') && retryCount < maxRetries) {
                console.log(`Retrying query (attempt ${retryCount + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
                return this.query(sql, params, retryCount + 1);
            }
            
            throw error;
        }
    }

    async getConnection() {
        return await this.pool.getConnection();
    }

    async close() {
        await this.pool.end();
    }

    async testConnection() {
        try {
            const connection = await this.getConnection();
            await connection.ping();
            connection.release();
            console.log('Database connection successful');
            return true;
        } catch (error) {
            console.error('Database connection failed:', error);
            return false;
        }
    }
}

module.exports = new DatabaseConnection();