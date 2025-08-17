import React from 'react';

/**
 * Component for filtering by difficulty and device (both required)
 * @param {Object} props - Component props
 * @param {Array} props.availableDevices - Array of available device names
 * @param {Array} props.availableDifficulties - Array of available difficulty values
 * @param {string} props.selectedDevice - Currently selected device
 * @param {string} props.selectedDifficulty - Currently selected difficulty
 * @param {Function} props.onDeviceChange - Callback for device selection change
 * @param {Function} props.onDifficultyChange - Callback for difficulty selection change
 * @returns {JSX.Element} Filter component
 */
const DifficultyDeviceFilter = ({
  availableDevices,
  availableDifficulties,
  selectedDevice,
  selectedDifficulty,
  onDeviceChange,
  onDifficultyChange
}) => {
  return (
    <div className="d-flex align-items-center gap-3">
      <div className="d-flex align-items-center">
        <label htmlFor="deviceSelect" className="form-label me-2 mb-0">
          <strong>Device:</strong>
        </label>
        <select
          id="deviceSelect"
          className="form-select form-select-sm"
          value={selectedDevice}
          onChange={(e) => onDeviceChange(e.target.value)}
          style={{ minWidth: '120px' }}
        >
          {availableDevices.map(device => (
            <option key={device} value={device}>
              {device}
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex align-items-center">
        <label htmlFor="difficultySelect" className="form-label me-2 mb-0">
          <strong>Difficulty:</strong>
        </label>
        <select
          id="difficultySelect"
          className="form-select form-select-sm"
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          style={{ minWidth: '100px' }}
        >
          {availableDifficulties.map(difficulty => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default DifficultyDeviceFilter;
