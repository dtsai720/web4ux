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
 * Detects double clicks in raw trail data based on 'start-else' mark
 * @param {Array} trailRecords - Array of trail records with mark field
 * @returns {Array} - Array of detected double clicks (records with mark='start-else')
 */
export const detectDoubleClicks = (trailRecords) => {
  if (!trailRecords || trailRecords.length === 0) return [];

  // Filter records with mark = 'start-else' to identify double clicks
  const doubleClicks = trailRecords.filter(record => record.mark === 'start-else');

  return doubleClicks;
};

/**
 * Calculates double click statistics for a participant across all their trails
 * Each trail counts as maximum 1 if it contains any 'start-else' marks
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
        doubleClickCount: doubleClicks.length, // 'start-else' 記錄的數量
        doubleClicks
      });
    }
  });

  return {
    count: trailsWithDoubleClicksCount, // 有 'start-else' 標記的 trails 數量
    trails: trailsWithDoubleClicks
  };
};

/**
 * Checks if a specific trail has double clicks (contains 'start-else' marks)
 * @param {Array} trailRecords - Array of trail records
 * @returns {boolean} - True if trail has 'start-else' marks
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
