import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component for navigation buttons
 */
const NavigationButtons = () => {
  return (
    <div className="d-flex">
      <Link to="/summary" className="btn btn-outline-secondary me-2">
        <i className="bi bi-arrow-left"></i> Back
      </Link>
      <Link to="/" className="btn btn-secondary">
        <i className="bi bi-house"></i> Home
      </Link>
    </div>
  );
};

export default NavigationButtons;
