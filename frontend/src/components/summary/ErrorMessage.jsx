import React from 'react';

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
