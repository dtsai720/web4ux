import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BackToHomeButton component for the guide page
 */
const BackToHomeButton = () => {
  return (
    <div className="text-center mt-4">
      <Link to="/" className="btn btn-secondary">
        Back to Home
      </Link>
    </div>
  );
};

export default BackToHomeButton;
