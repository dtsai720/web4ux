import React from 'react';

/**
 * Error message component for detail records
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @returns {JSX.Element} Error alert with message
 */
const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="alert alert-danger d-flex align-items-center" role="alert">
      <i className="bi bi-exclamation-triangle me-2"></i>
      <div>{error}</div>
    </div>
  );
};

export default ErrorMessage;
