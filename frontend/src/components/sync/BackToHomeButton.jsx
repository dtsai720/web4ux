import React from 'react';
import { Link } from 'react-router-dom';

const BackToHomeButton = ({ disabled }) => {
  return (
    <div className="text-center mt-4">
      <Link to="/" className={`btn btn-secondary ${disabled ? 'disabled' : ''}`}>
        Back to Home
      </Link>
    </div>
  );
};

export default BackToHomeButton;
