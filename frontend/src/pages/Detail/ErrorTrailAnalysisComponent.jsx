import React, { useState, useEffect } from 'react';
import { detectErrorTrails } from '../../utils/detail/errorTrailUtils';
import ErrorTrailTable from '../../components/detail/ErrorTrailTable';
import DifficultyDeviceFilter from '../../components/detail/DifficultyDeviceFilter';

const ErrorTrailAnalysisComponent = ({
  rawData,
  closeErrorTrailMode
}) => {
  const [errorTrailData, setErrorTrailData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [availableDifficulties, setAvailableDifficulties] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Handle double click to go back
  const handleDoubleClick = () => {
    closeErrorTrailMode();
  };

  useEffect(() => {
    if (rawData.length > 0) {
      setLoading(true);
      const results = detectErrorTrails(rawData);
      setErrorTrailData(results);

      // Get available devices and difficulties
      const devices = Object.keys(results.byDevice || {}).sort();
      const difficulties = Object.keys(results.byDifficulty || {}).sort((a, b) => {
        // Extract difficulty number from string like "3.5 (10/105)"
        const diffA = parseFloat(a.split(' ')[0]);
        const diffB = parseFloat(b.split(' ')[0]);
        return diffA - diffB;
      });

      setAvailableDevices(devices);
      setAvailableDifficulties(difficulties);

      // Auto-select first device and difficulty if not already selected
      if (devices.length > 0 && !selectedDevice) {
        setSelectedDevice(devices[0]);
      }
      if (difficulties.length > 0 && !selectedDifficulty) {
        setSelectedDifficulty(difficulties[0]);
      }

      setLoading(false);
    }
  }, [rawData, selectedDevice, selectedDifficulty]);

  // Filter data when device or difficulty changes
  useEffect(() => {
    if (selectedDevice && selectedDifficulty && errorTrailData.errorTrails) {
      const filtered = errorTrailData.errorTrails.filter(trail =>
        trail.deviceName === selectedDevice &&
        trail.difficultyId === selectedDifficulty
      );

      // Sort by participant then trail number
      filtered.sort((a, b) => {
        const participantCompare = a.participantSerial.localeCompare(b.participantSerial);
        if (participantCompare !== 0) return participantCompare;
        return a.trailNumber - b.trailNumber;
      });

      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [selectedDevice, selectedDifficulty, errorTrailData]);

  return (
    <div className="card mb-4 border-warning">
      <div
        className="card-header bg-warning text-dark"
        onDoubleClick={handleDoubleClick}
        style={{ cursor: 'pointer' }}
      >
        <h5 className="mb-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error Trail Analysis
          <small className="float-end">
            <i className="bi bi-info-circle me-1"></i>
            Double click to return
          </small>
        </h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <DifficultyDeviceFilter
              availableDevices={availableDevices}
              availableDifficulties={availableDifficulties}
              selectedDevice={selectedDevice}
              selectedDifficulty={selectedDifficulty}
              onDeviceChange={setSelectedDevice}
              onDifficultyChange={setSelectedDifficulty}
            />
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={closeErrorTrailMode}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Analyzing error trails...</span>
            </div>
            <span className="ms-3">Detecting error trails...</span>
          </div>
        ) : selectedDevice && selectedDifficulty ? (
          <ErrorTrailTable
            errorTrails={filteredData}
            selectedDevice={selectedDevice}
            selectedDifficulty={selectedDifficulty}
          />
        ) : (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Please select both Device and Difficulty to view error trails.
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorTrailAnalysisComponent;
