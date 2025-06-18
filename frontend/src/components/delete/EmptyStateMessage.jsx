import React from 'react';

/**
 * Displays an empty state message with an icon
 * @param {string} message - The message to display
 * @returns {JSX.Element} - The empty state component
 */
const EmptyStateMessage = ({ message }) => {
  return (
    <div className="text-center py-4">
      <i className="bi bi-check-circle fs-1 text-success"></i>
      <p className="text-center text-muted mt-3">{message}</p>
    </div>
  );
};

export default EmptyStateMessage;
