import React, { useState, useEffect } from 'react';
import { calculateResults } from '../../utils/result/resultUtils';
import {
  LoadingSpinner,
  ResultHeader,
  DeviceSelectionTable,
  WidthDistanceTable
} from '../../components/result';

const ResultAnalysisComponent = ({
  rawData,
  closeResultMode
}) => {
  const [resultData, setResultData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  // Handle double click to go back
  const handleDoubleClick = () => {
    closeResultMode();
  };

  useEffect(() => {
    if (rawData.length > 0) {
      setLoading(true);
      const results = calculateResults(rawData);
      setResultData(results);
      setLoading(false);
    }
  }, [rawData]);

  // Handle device selection
  const handleSelectDevice = (device, action) => {
    setSelectedDevice(device);
    setSelectedAction(action);
  };

  // Reset selections
  const resetSelections = () => {
    setSelectedDevice(null);
    setSelectedAction(null);
  };

  return (
    <div className="card mb-4 border-success">
      <ResultHeader onDoubleClick={handleDoubleClick} />
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {selectedDevice && (
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={resetSelections}
              >
                <i className="bi bi-arrow-left"></i> Back to Devices
              </button>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={closeResultMode}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Calculating results..." />
        ) : (
          <div>
            {!selectedDevice ? (
              <DeviceSelectionTable
                resultData={resultData}
                onSelectDevice={handleSelectDevice}
              />
            ) : (
              <WidthDistanceTable
                selectedDevice={selectedDevice}
                resultData={resultData}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultAnalysisComponent;
