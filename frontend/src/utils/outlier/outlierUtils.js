/**
 * Utility functions for outlier analysis
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

  // Example outlier detection logic (can be customized)
  const errorCountThreshold = deviceStats.avgErrorCount + 2 * deviceStats.stdDevErrorCount;
  const errorTimeThreshold = deviceStats.avgErrorTime + 2 * deviceStats.stdDevErrorTime;

  return participantData.errorCount > errorCountThreshold ||
         participantData.errorTime > errorTimeThreshold;
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
