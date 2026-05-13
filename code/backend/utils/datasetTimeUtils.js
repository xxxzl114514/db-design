/**
 * 数据集时间范围工具函数
 * 数据集时间范围：2024年12月1日 - 2024年12月31日
 */

// 数据集的开始和结束时间
const DATASET_START_DATE = '2024-12-01 00:00:00';
const DATASET_END_DATE = '2024-12-31 23:59:59';

// 默认参考时间（数据集时间范围的中间时间）
const DEFAULT_REFERENCE_DATE = '2025-01-01 12:00:00';

/**
 * 获取数据集时间范围的SQL条件
 * @param {string} fieldName - 数据库中的时间字段名
 * @param {number} daysBefore - 参考时间前的天数
 * @param {number} daysAfter - 参考时间后的天数
 * @returns {string} SQL条件字符串
 */
function getDatasetTimeRange(fieldName, daysBefore = 30, daysAfter = 0) {
  return `${fieldName} >= DATE_SUB('${DEFAULT_REFERENCE_DATE}', INTERVAL ${daysBefore} DAY) AND ${fieldName} <= DATE_ADD('${DEFAULT_REFERENCE_DATE}', INTERVAL ${daysAfter} DAY)`;
}

/**
 * 获取数据集时间范围内的开始时间条件
 * @param {string} fieldName - 数据库中的时间字段名
 * @param {number} daysBefore - 参考时间前的天数
 * @returns {string} SQL条件字符串
 */
function getDatasetStartTimeCondition(fieldName, daysBefore = 30) {
  return `${fieldName} >= DATE_SUB('${DEFAULT_REFERENCE_DATE}', INTERVAL ${daysBefore} DAY)`;
}

/**
 * 获取数据集时间范围内的结束时间条件
 * @param {string} fieldName - 数据库中的时间字段名
 * @param {number} daysAfter - 参考时间后的天数
 * @returns {string} SQL条件字符串
 */
function getDatasetEndTimeCondition(fieldName, daysAfter = 0) {
  return `${fieldName} <= DATE_ADD('${DEFAULT_REFERENCE_DATE}', INTERVAL ${daysAfter} DAY)`;
}

/**
 * 获取数据集时间范围内的活跃状态条件
 * @param {string} startField - 开始时间字段名
 * @param {string} endField - 结束时间字段名
 * @returns {string} SQL条件字符串
 */
function getDatasetActiveCondition(startField, endField) {
  return `(${endField} > '${DEFAULT_REFERENCE_DATE}')`;
}

/**
 * 获取数据集时间范围内的已完成状态条件
 * @param {string} startField - 开始时间字段名
 * @param {string} endField - 结束时间字段名
 * @returns {string} SQL条件字符串
 */
function getDatasetCompletedCondition(startField, endField) {
  return `(${startField} <= '${DEFAULT_REFERENCE_DATE}' AND ${endField} <= '${DEFAULT_REFERENCE_DATE}')`;
}

/**
 * 计算时间差的SQL表达式（基于数据集时间）
 * @param {string} startField - 开始时间字段名
 * @param {string} endField - 结束时间字段名
 * @param {string} unit - 时间单位（HOUR, MINUTE, DAY等）
 * @returns {string} SQL时间差表达式
 */
function getDatasetTimeDiff(startField, endField, unit = 'HOUR') {
  return `TIMESTAMPDIFF(${unit}, ${startField}, ${endField})`;
}

/**
 * 获取数据集时间范围内的当前停留时间计算
 * @param {string} arrivalField - 到达时间字段名
 * @returns {string} SQL停留时间表达式
 */
function getDatasetCurrentStayDuration(arrivalField) {
  return `TIMESTAMPDIFF(HOUR, ${arrivalField}, '${DEFAULT_REFERENCE_DATE}')`;
}

module.exports = {
  DATASET_START_DATE,
  DATASET_END_DATE,
  DEFAULT_REFERENCE_DATE,
  getDatasetTimeRange,
  getDatasetStartTimeCondition,
  getDatasetEndTimeCondition,
  getDatasetActiveCondition,
  getDatasetCompletedCondition,
  getDatasetTimeDiff,
  getDatasetCurrentStayDuration
};