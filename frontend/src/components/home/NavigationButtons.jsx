import React from 'react';
import NavigationButton from './NavigationButton';

const NavigationButtons = ({ navigate }) => {
  const buttons = [
    {
      icon: 'arrow-repeat',
      label: 'Sync',
      color: 'primary',
      path: '/sync'
    },
    {
      icon: 'bar-chart',
      label: 'Summary',
      color: 'success',
      path: '/summary'
    },
    {
      icon: 'book',
      label: 'Guide',
      color: 'info',
      path: '/guide'
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
          onClick={() => navigate(button.path)}
        />
      ))}
    </div>
  );
};

export default NavigationButtons;
