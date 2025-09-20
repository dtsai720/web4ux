/**
 * Common date utility functions
 */

/**
 * Formats timestamp to date time string
 * @param {Number} timestamp - The timestamp to format
 * @returns {String} Formatted date time string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Formats timestamp to localized date time string
 * @param {Number} timestamp - The timestamp to format
 * @returns {String} Localized formatted date time string
 */
export const formatDateTimeLocale = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString();
};
