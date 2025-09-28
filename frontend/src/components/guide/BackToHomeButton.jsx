import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

/**
 * BackToHomeButton component for the guide page
 */
const BackToHomeButton = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="text-center mt-4">
      <button
        className="btn btn-secondary"
        onClick={() => navigateTo('home')}
      >
        Back to Home
      </button>
    </div>
  );
};

export default BackToHomeButton;
