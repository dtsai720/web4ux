/**
 * Utility functions for delete operations
 */

/**
 * Handles double click to close delete mode
 * @param {Function} closeDeleteMode - Function to close delete mode
 * @returns {Function} - Event handler function
 */
export const handleDoubleClick = (closeDeleteMode) => {
  return () => {
    closeDeleteMode();
  };
};

/**
 * Toggles the active tab between trails and participants
 * @param {string} tabName - The tab name to set active
 * @param {Function} setActiveTab - State setter function
 */
export const toggleActiveTab = (tabName, setActiveTab) => {
  setActiveTab(tabName);
};
