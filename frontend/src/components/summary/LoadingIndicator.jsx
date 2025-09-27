import React from 'react';

const LoadingIndicator = () => (
  <div className="text-center mb-4">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-2 text-muted">Loading projects...</p>
  </div>
);

export default LoadingIndicator;
