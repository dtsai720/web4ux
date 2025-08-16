import React from 'react';

/**
 * Loading indicator component for the Summary page
 *
 * @returns {JSX.Element} Loading indicator component
 */
const LoadingIndicator = () => {
  return (
    <div className="text-center mb-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading projects...</p>
    </div>
  );
};

export default LoadingIndicator;
