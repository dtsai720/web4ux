import React from 'react';

/**
 * Component for navigation buttons
 * @param {Object} props - Component props
 * @param {Function} props.setCurrentPage - Function to set the current page
 */
const NavigationButtons = ({ setCurrentPage }) => {
  return (
    <div className="d-flex">
      <button
        className="btn btn-outline-secondary me-2"
        onClick={() => setCurrentPage('summary')}
      >
        <i className="bi bi-arrow-left"></i> Back
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => setCurrentPage('home')}
      >
        <i className="bi bi-house"></i> Home
      </button>
    </div>
  );
};

export default NavigationButtons;
