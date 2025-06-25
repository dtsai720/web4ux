import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Back to home button component for the Summary page
 *
 * @returns {JSX.Element} Back to home button component
 */
const BackToHomeButton = () => {
  return (
    <div className="text-center mt-4">
      <Link to="/" className="btn btn-secondary btn-lg">
        <span className="me-2">🏠</span>
        Back to Home
      </Link>
    </div>
  );
};

export default BackToHomeButton;
