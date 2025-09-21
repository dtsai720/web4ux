import React from 'react';

// Utility functions for the Summary page

/**
 * Formats a date string with timezone information
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);

  const pad = (n) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Month starts from 0
  const day = pad(date.getDate());

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Calculate timezone offset (minutes)
  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMinutesRemainder = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const timezoneOffset = `${sign}${pad(offsetHours)}:${pad(offsetMinutesRemainder)}`;

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timezoneOffset}`;
};

/**
 * Renders a sort icon based on the current sort field and direction
 * @param {string} field - The field to check
 * @param {string} orderBy - The current sort field
 * @param {string} orderDirection - The current sort direction ('asc' or 'desc')
 * @returns {JSX.Element} The sort icon element
 */
export const getSortIcon = (field, orderBy, orderDirection) => {
  if (orderBy !== field) {
    return <span className="text-muted ms-1">⇅</span>;
  }
  return orderDirection === 'asc' ?
    <span className="text-primary ms-1">↑</span> :
    <span className="text-primary ms-1">↓</span>;
};

/**
 * Loads summaries from the API with filtering, sorting, and pagination
 * @param {Object} params - The parameters for loading summaries
 * @param {string} params.searchName - Name search filter
 * @param {string} params.searchCreator - Creator search filter
 * @param {string} params.orderBy - Field to sort by
 * @param {string} params.orderDirection - Sort direction ('asc' or 'desc')
 * @param {number} params.currentPageNum - Current page number
 * @param {number} params.itemsPerPage - Items per page
 * @param {Function} params.setSummaries - State setter for summaries
 * @param {Function} params.setTotalItems - State setter for total items
 * @param {Function} params.setLoading - State setter for loading status
 * @param {Function} params.setError - State setter for error message
 * @returns {Promise<void>}
 */
export const loadSummaries = async ({
  searchName,
  searchCreator,
  orderBy,
  orderDirection,
  currentPageNum,
  itemsPerPage,
  setSummaries,
  setTotalItems,
  setLoading,
  setError,
  ListSummaries
}) => {
  setLoading(true);
  setError('');

  try {
    // Calculate pagination
    const limit = itemsPerPage;
    const offset = (currentPageNum - 1) * limit;

    const result = await ListSummaries(searchName, searchCreator, orderBy, orderDirection, offset, limit);
    setSummaries(result.data || []);
    setTotalItems(result.total || 0);
  } catch (err) {
    setError('Failed to load summaries: ' + err.message);
    setSummaries([]);
    setTotalItems(0);
  } finally {
    setLoading(false);
  }
};

/**
 * Creates a function to handle sorting
 * @param {string} field - The field to sort by
 * @param {string} orderBy - Current sort field
 * @param {Function} setOrderBy - State setter for orderBy
 * @param {string} orderDirection - Current sort direction
 * @param {Function} setOrderDirection - State setter for orderDirection
 * @param {Function} setCurrentPageNum - State setter for current page number
 */
export const handleSort = (field, orderBy, setOrderBy, orderDirection, setOrderDirection, setCurrentPageNum) => {
  if (orderBy === field) {
    setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setOrderBy(field);
    setOrderDirection('desc'); // Default descending
  }
  setCurrentPageNum(1); // Reset to first page
};

/**
 * Creates an index file for the summary utils
 */
export const summaryUtils = {
  formatDate,
  getSortIcon,
  loadSummaries,
  handleSort
};

export default summaryUtils;
