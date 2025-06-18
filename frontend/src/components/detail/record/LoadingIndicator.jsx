import React from 'react';

/**
 * Loading indicator component for detail records
 * @returns {JSX.Element} Loading spinner with text
 */
const LoadingIndicator = () => {
  return (
    <div className="text-center mb-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className="mt-2 text-muted">Loading detail data...</div>
    </div>
  );
};

export default LoadingIndicator;
