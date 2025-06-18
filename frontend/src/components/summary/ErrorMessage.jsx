import React from 'react';

/**
 * Error message component for the Summary page
 *
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @returns {JSX.Element} Error message component
 */
const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <span className="me-2">❌</span>
      <div>{error}</div>
    </div>
  );
};

export default ErrorMessage;
