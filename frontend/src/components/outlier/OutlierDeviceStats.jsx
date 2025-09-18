import React from 'react';

const STAT_ITEMS = [
  {
    label: 'Avg Error Count',
    key: 'avgErrorCount',
    formatValue: (value) => value?.toFixed(2) || '0.00'
  },
  {
    label: 'StdDev Error Count',
    key: 'stdDevErrorCount',
    formatValue: (value) => value?.toFixed(2) || '0.00'
  },
  {
    label: 'Avg Extra Clicks',
    key: 'avgErrorTime',
    formatValue: (value) => value?.toFixed(2) || '0.00'
  },
  {
    label: 'StdDev Extra Clicks',
    key: 'stdDevErrorTime',
    formatValue: (value) => value?.toFixed(2) || '0.00'
  }
];

// Stat card component
const StatCard = ({ label, value }) => (
  <div className="col-md-3">
    <div className="border bg-light rounded p-3 text-center">
      <h6 className="text-muted">{label}</h6>
      <h4>{value}</h4>
    </div>
  </div>
);

const OutlierDeviceStats = ({ deviceStats }) => {
  return (
    <div className="mb-4">
      <h6 className="border-bottom pb-2 mb-3 bg-light p-2 rounded">Device Statistics</h6>
      <div className="row">
        {STAT_ITEMS.map(({ label, key, formatValue }) => (
          <StatCard
            key={key}
            label={label}
            value={formatValue(deviceStats?.[key])}
          />
        ))}
      </div>
    </div>
  );
};

export default OutlierDeviceStats;
