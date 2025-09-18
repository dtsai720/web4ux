import React, { useState, useEffect } from 'react';
import { detectErrorTrails, getUniqueDevices } from '../../utils/detail/errorTrailUtils';
import ErrorTrailTable from '../../components/detail/ErrorTrailTable';

const ErrorTrailAnalysisComponent = ({
  rawData,
  closeErrorTrailMode
}) => {
  const [errorTrailData, setErrorTrailData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [availableIds, setAvailableIds] = useState([]);
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

      // Get available devices sorted by deviceOrder
      const devices = getUniqueDevices(results.errorTrails || []);
      setAvailableDevices(devices);

      // Get available IDs from all error trails
      const ids = [...new Set(results.errorTrails?.map(trail => trail.difficultyId) || [])].sort();
      setAvailableIds(ids);

      // Auto-select first device if not already selected
      if (devices.length > 0 && !selectedDevice) {
        setSelectedDevice(devices[0]);
      }

      // Auto-select 1.6 if available and not already selected
      if (ids.includes('1.6') && !selectedId) {
        setSelectedId('1.6');
      } else if (ids.length > 0 && !selectedId) {
        // If 1.6 is not available, select first available ID
        setSelectedId(ids[0]);
      }

      setLoading(false);
    }
  }, [rawData, selectedDevice, selectedId]);

  // Filter data when device or ID changes
  useEffect(() => {
    if (selectedDevice && errorTrailData.errorTrails) {
      let filtered = errorTrailData.errorTrails.filter(trail =>
        trail.deviceName === selectedDevice
      );

      // Apply ID filter (always applied since we removed "All IDs" option)
      if (selectedId) {
        filtered = filtered.filter(trail =>
          trail.difficultyId === selectedId
        );
      }

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
  }, [selectedDevice, selectedId, errorTrailData]);

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
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-3">
            <div className="form-group">
              <label className="form-label fw-bold mb-1">Device:</label>
              <select
                className="form-select form-select-sm"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                {availableDevices.map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label fw-bold mb-1">ID (W/D):</label>
              <select
                className="form-select form-select-sm"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{ minWidth: '120px' }}
              >
                {availableIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={closeErrorTrailMode}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
        </div>

        {selectedDevice && (
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="badge bg-dark">
              <i className="bi bi-funnel me-1"></i>
              Device: {selectedDevice}
            </div>
            <div className="badge bg-secondary">
              <i className="bi bi-hash me-1"></i>
              ID: {selectedId}
            </div>
            {filteredData.length > 0 && (
              <>
                <span className="badge bg-danger">
                  {filteredData.length} Error Trail{filteredData.length !== 1 ? 's' : ''}
                </span>
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-cursor-fill me-1"></i>
                  {(() => {
                    const doubleClickCount = filteredData.filter(trail =>
                      trail.records && trail.records.some(record => record.mark === 'start-else')
                    ).length;
                    return `${doubleClickCount} Double Click${doubleClickCount !== 1 ? 's' : ''}`;
                  })()}
                </span>
              </>
            )}
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Analyzing error trails...</span>
            </div>
            <span className="ms-3">Detecting error trails...</span>
          </div>
        ) : selectedDevice ? (
          <ErrorTrailTable
            errorTrails={filteredData}
            selectedDevice={selectedDevice}
          />
        ) : (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Please select a Device to view error trails.
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorTrailAnalysisComponent;
