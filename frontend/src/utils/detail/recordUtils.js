/**
 * Utility functions for detail record components
 */

/**
 * Handle double click to navigate back to summary page
 * @param {Function} setCurrentPage - Function to set the current page
 * @returns {Function} - Event handler function
 */
export const handleDoubleClick = (setCurrentPage) => {
  return () => {
    setCurrentPage('summary');
  };
};

/**
 * Format a timestamp to a readable date time string
 * This is a placeholder for the actual formatDateTime function
 * that is passed as a prop to the DetailRecordComponent
 *
 * @param {string|number} timestamp - The timestamp to format
 * @returns {string} - Formatted date time string
 */
export const formatDateTime = (timestamp) => {
  // This is just a placeholder - the actual implementation
  // is passed as a prop to the DetailRecordComponent
  return timestamp;
};
