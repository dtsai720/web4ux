import React from 'react';

/**
 * BackToHomeButton component for the guide page
 * @param {Object} props - Component props
 * @param {Function} props.setCurrentPage - Function to set the current page
 */
const BackToHomeButton = ({ setCurrentPage }) => {
  return (
    <div className="text-center mt-4">
      <button
        className="btn btn-secondary"
        onClick={() => setCurrentPage('home')}
      >
        Back to Home
      </button>
    </div>
  );
};

export default BackToHomeButton;
