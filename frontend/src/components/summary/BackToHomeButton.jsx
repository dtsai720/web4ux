import React from 'react';

/**
 * Back to home button component for the Summary page
 *
 * @param {Object} props - Component props
 * @param {Function} props.setCurrentPage - Function to set the current page
 * @returns {JSX.Element} Back to home button component
 */
const BackToHomeButton = ({ setCurrentPage }) => {
  return (
    <div className="text-center mt-4">
      <button
        className="btn btn-secondary btn-lg"
        onClick={() => setCurrentPage('home')}
      >
        <span className="me-2">🏠</span>
        Back to Home
      </button>
    </div>
  );
};

export default BackToHomeButton;
