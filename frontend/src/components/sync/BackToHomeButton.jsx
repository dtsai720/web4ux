import React from 'react';

const BackToHomeButton = ({ onBackToHome, disabled }) => {
  return (
    <div className="text-center mt-4">
      <button
        className="btn btn-secondary"
        onClick={onBackToHome}
        disabled={disabled}
      >
        Back to Home
      </button>
    </div>
  );
};

export default BackToHomeButton;
