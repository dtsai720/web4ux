import React, { useState, useEffect } from 'react';
import { calculateMoveTimeAnalysis } from '../../utils/detail/moveTimeUtils';
import MovementTimeMatrixTable from '../../components/detail/MoveTimeAnalysisTable';
import DeviceSelector from '../../components/detail/DeviceSelector';

const MovementTimeMatrixComponent = ({
  rawData,
  closeMovementTimeMatrixMode
}) => {
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);

  // Handle double click to go back
  const handleDoubleClick = () => {
    closeMovementTimeMatrixMode();
  };

  useEffect(() => {
    if (rawData.length > 0) {
      setLoading(true);
      const results = calculateMoveTimeAnalysis(rawData);
      setAnalysisData(results);

      // Get available devices and set default selection
      const devices = Object.keys(results);
      setAvailableDevices(devices);
      if (devices.length > 0 && !selectedDevice) {
        setSelectedDevice(devices[0]); // Set first device as default
      }

      setLoading(false);
    }
  }, [rawData]);

  // Handle device selection
  const handleDeviceChange = (deviceName) => {
    setSelectedDevice(deviceName);
  };

  return (
    <div className="card mb-4 border-success">
      <div
        className="card-header bg-success text-white"
        onDoubleClick={handleDoubleClick}
        style={{ cursor: 'pointer' }}
      >
        <h5 className="mb-0">
          <i className="bi bi-grid-3x3 me-2"></i>
          Movement Time Matrix
          <small className="float-end">
            <i className="bi bi-info-circle me-1"></i>
            Double click to return
          </small>
        </h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            {availableDevices.length > 0 && (
              <DeviceSelector
                availableDevices={availableDevices}
                selectedDevice={selectedDevice}
                onDeviceChange={handleDeviceChange}
              />
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={closeMovementTimeMatrixMode}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Calculating analysis...</span>
            </div>
            <span className="ms-3">Calculating movement time matrix...</span>
          </div>
        ) : (
          selectedDevice && analysisData[selectedDevice] && (
            <MovementTimeMatrixTable
              deviceName={selectedDevice}
              analysisData={analysisData[selectedDevice]}
            />
          )
        )}
      </div>
    </div>
  );
};

export default MovementTimeMatrixComponent;
