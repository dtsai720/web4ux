import React from 'react';
import NavigationButton from './NavigationButton';
import { useNavigation } from '../../contexts/NavigationContext';

const NavigationButtons = () => {
  const { navigateTo } = useNavigation();

  const buttons = [
    {
      icon: 'arrow-repeat',
      label: 'Sync',
      color: 'primary',
      page: 'sync'
    },
    {
      icon: 'bar-chart',
      label: 'Projects',
      color: 'success',
      page: 'summary'
    },
    {
      icon: 'book',
      label: 'Guide',
      color: 'info',
      page: 'guide'
    }
  ];

  return (
    <div className="row w-100 justify-content-center" style={{ maxWidth: '80%' }}>
      {buttons.map((button, index) => (
        <NavigationButton
          key={index}
          icon={button.icon}
          label={button.label}
          color={button.color}
          onClick={() => navigateTo(button.page)}
        />
      ))}
    </div>
  );
};

export default NavigationButtons;
