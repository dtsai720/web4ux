import React from 'react';

/**
 * Device selector component for selecting which device to analyze
 */
const DeviceSelector = ({ availableDevices, selectedDevice, onDeviceChange }) => {
  return (
    <div className="d-flex align-items-center">
      <label htmlFor="device-selector" className="form-label me-2 mb-0 fw-bold">
        <i className="bi bi-display me-1"></i>
        Device:
      </label>
      <select
        id="device-selector"
        className="form-select form-select-sm"
        style={{ width: 'auto', minWidth: '200px' }}
        value={selectedDevice || ''}
        onChange={(e) => onDeviceChange(e.target.value)}
      >
        {availableDevices.map(device => (
          <option key={device} value={device}>
            {device}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DeviceSelector;
