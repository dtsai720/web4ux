import React from 'react';

// Navigation item component
const NavigationItem = ({ label, value, onBack, headingLevel = 'h5' }) => {
  const HeadingTag = headingLevel;

  return (
    <div className="d-flex align-items-center mb-3">
      <button
        className="btn btn-sm btn-outline-secondary me-2"
        onClick={onBack}
        title={`Back to ${label}s`}
      >
        <i className="bi bi-arrow-left"></i> Back to {label}s
      </button>
      <HeadingTag className="mb-0">
        {label}: {value}
      </HeadingTag>
    </div>
  );
};

const OutlierNavigation = ({
  selectedDevice,
  selectedParticipant,
  selectedTrail,
  onBackToDevices,
  onBackToParticipants,
  onBackToTrails
}) => {
  const navigationItems = [
    {
      condition: selectedDevice,
      label: 'Device',
      value: selectedDevice,
      onBack: onBackToDevices,
      headingLevel: 'h5'
    },
    {
      condition: selectedParticipant,
      label: 'Participant',
      value: selectedParticipant,
      onBack: onBackToParticipants,
      headingLevel: 'h6'
    },
    {
      condition: selectedTrail,
      label: 'Trail',
      value: selectedTrail,
      onBack: onBackToTrails,
      headingLevel: 'h6'
    }
  ];

  return (
    <div>
      {navigationItems.map((item, index) =>
        item.condition && (
          <NavigationItem
            key={index}
            label={item.label}
            value={item.value}
            onBack={item.onBack}
            headingLevel={item.headingLevel}
          />
        )
      )}
    </div>
  );
};

export default OutlierNavigation;
