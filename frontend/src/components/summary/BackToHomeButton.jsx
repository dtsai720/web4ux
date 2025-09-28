import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

const BackToHomeButton = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="text-center mt-4">
      <button
        className="btn btn-secondary btn-lg"
        onClick={() => navigateTo('home')}
      >
        <span className="me-2">🏠</span>
        Back to Home
      </button>
    </div>
  );
};

export default BackToHomeButton;
