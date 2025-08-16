/**
 * Utility functions for outlier analysis
 * Note: All calculations only consider available and not deleted trails.
 * Outlier detection is based on mean + 2 standard deviations.
 */

/**
 * Format a timestamp into a readable date time string
 * @param {number} timestamp - The timestamp to format
 * @returns {string} - Formatted date time string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Check if a participant is an outlier based on error metrics
 * @param {Object} participantData - The participant data
 * @param {Object} deviceStats - The device statistics
 * @returns {boolean} - True if the participant is an outlier
 */
export const isOutlier = (participantData, deviceStats) => {
  if (!participantData || !deviceStats) return false;

  // Outlier detection logic: mean + 2 standard deviations
  const errorCountThreshold = deviceStats.avgErrorCount + 2 * deviceStats.stdDevErrorCount;
  const errorTimeThreshold = deviceStats.avgErrorTime + 2 * deviceStats.stdDevErrorTime;

  return participantData.errorCount > errorCountThreshold ||
         participantData.errorTime > errorTimeThreshold;
};

/**
 * Detects double clicks in raw trail data based on coordinates and timestamps
 * @param {Array} trailRecords - Array of trail records with x, y, timestamp
 * @param {Object} options - Detection options
 * @returns {Array} - Array of detected double clicks
 */
export const detectDoubleClicks = (trailRecords, options = {}) => {
  const {
    maxTimeDiff = 500,    // 最大時間間隔 (ms)
    maxDistance = 25,     // 最大距離 (pixels)
    minTimeDiff = 50      // 最小時間間隔，避免誤觸
  } = options;

  if (!trailRecords || trailRecords.length < 2) return [];

  const doubleClicks = [];

  for (let i = 1; i < trailRecords.length; i++) {
    const prev = trailRecords[i - 1];
    const curr = trailRecords[i];

    // 計算時間差
    const timeDiff = curr.timestamp - prev.timestamp;

    // 計算距離
    const distance = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) +
      Math.pow(curr.y - prev.y, 2)
    );

    // 檢查是否符合 double click 條件
    if (timeDiff >= minTimeDiff &&
        timeDiff <= maxTimeDiff &&
        distance <= maxDistance) {
      doubleClicks.push({
        firstClick: prev,
        secondClick: curr,
        timeDiff,
        distance
      });
    }
  }

  return doubleClicks;
};

/**
 * Calculates double click statistics for a participant across all their trails
 * Each trail counts as maximum 1 if it contains any double clicks
 * @param {Object} participantData - Participant's trail data
 * @returns {Object} - Double click statistics
 */
export const calculateDoubleClickStats = (participantData) => {
  if (!participantData) return { count: 0, trails: [] };

  let trailsWithDoubleClicksCount = 0;
  const trailsWithDoubleClicks = [];

  // 遍歷參與者的所有 trails
  Object.keys(participantData).forEach(trailKey => {
    if (trailKey === 'stats') return; // 跳過統計數據

    const trailRecords = participantData[trailKey];
    if (!Array.isArray(trailRecords)) return;

    const doubleClicks = detectDoubleClicks(trailRecords);

    if (doubleClicks.length > 0) {
      trailsWithDoubleClicksCount += 1; // 每個 trail 只計算一次
      trailsWithDoubleClicks.push({
        trailKey,
        hasDoubleClick: true,
        doubleClickCount: doubleClicks.length,
        doubleClicks
      });
    }
  });

  return {
    count: trailsWithDoubleClicksCount, // 有 double click 的 trails 數量
    trails: trailsWithDoubleClicks
  };
};

/**
 * Checks if a specific trail has double clicks
 * @param {Array} trailRecords - Array of trail records
 * @returns {boolean} - True if trail has double clicks
 */
export const trailHasDoubleClick = (trailRecords) => {
  const doubleClicks = detectDoubleClicks(trailRecords);
  return doubleClicks.length > 0;
};

/**
 * Get summary statistics for outlier analysis
 * @param {Object} data - The complete data object
 * @returns {Object} - Summary statistics
 */
export const getOutlierSummary = (data) => {
  if (!data) return {};

  const summary = {};

  // Process data to generate summary statistics
  // This is a placeholder for actual implementation

  return summary;
};
