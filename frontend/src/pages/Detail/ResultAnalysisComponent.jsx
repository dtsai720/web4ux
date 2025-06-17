import React, { useState, useEffect } from 'react';

const ResultAnalysisComponent = ({
  rawData,
  closeResultMode
}) => {
  const [resultData, setResultData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedWidth, setSelectedWidth] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);

  // Handle double click to go back
  const handleDoubleClick = () => {
    closeResultMode();
  };

  useEffect(() => {
    if (rawData.length > 0) {
      calculateResults(rawData);
    }
  }, [rawData]);

  // Calculate results based on device, width, and distance
  const calculateResults = (data) => {
    setLoading(true);

    try {
      // Group data by device, width, and distance
      const results = {};

      // Filter out deleted records
      const activeData = data.filter(record => !record.deleted);

      // Get unique devices
      const devices = [...new Set(activeData.map(record => record.deviceName))];

      // Process each device
      devices.forEach(device => {
        const deviceRecords = activeData.filter(record => record.deviceName === device);

        // Get unique widths for this device
        const widths = [...new Set(deviceRecords.map(record => record.width))];

        results[device] = { widths: {} };

        // Process each width
        widths.forEach(width => {
          const widthRecords = deviceRecords.filter(record => record.width === width);

          // Get unique distances for this width
          const distances = [...new Set(widthRecords.map(record => record.distance))];

          results[device].widths[width] = { distances: {} };

          // Process each distance
          distances.forEach(distance => {
            const distanceRecords = widthRecords.filter(record => record.distance === distance);

            // Group by trail
            const trailGroups = {};
            distanceRecords.forEach(record => {
              const trailKey = `${record.participantSerial}-${record.trailNumber}`;
              if (!trailGroups[trailKey]) {
                trailGroups[trailKey] = [];
              }
              trailGroups[trailKey].push(record);
            });

            // Calculate error rate and event time for each trail
            let totalTrails = 0;
            let failedTrails = 0;
            let totalEventTime = 0;
            let availableTrails = 0;

            Object.values(trailGroups).forEach(trail => {
              totalTrails++;

              // Find start and target marks
              const startRecord = trail.find(r => r.mark === 'start');
              const targetRecord = trail.find(r => r.mark === 'target');

              // Check if trail is available (has both start and target, and start comes before target)
              const isAvailable = startRecord && targetRecord && startRecord.timestamp < targetRecord.timestamp;

              if (isAvailable) {
                availableTrails++;

                // Calculate event time (time from start to target)
                const eventTime = targetRecord.timestamp - startRecord.timestamp;
                totalEventTime += eventTime;

                // Check if there are any marks between start and target (failed trail)
                const hasIntermediateMarks = trail.some(r =>
                  r.mark !== 'start' &&
                  r.mark !== 'target' &&
                  r.timestamp > startRecord.timestamp &&
                  r.timestamp < targetRecord.timestamp
                );

                if (hasIntermediateMarks) {
                  failedTrails++;
                }
              }
            });

            // Calculate error rate and average event time
            const errorRate = availableTrails > 0 ? (failedTrails / availableTrails) : 0;
            const avgEventTime = availableTrails > 0 ? (totalEventTime / availableTrails) : 0;

            // Store results
            results[device].widths[width].distances[distance] = {
              totalTrails,
              availableTrails,
              failedTrails,
              errorRate,
              totalEventTime,
              avgEventTime
            };
          });
        });
      });

      setResultData(results);
    } catch (error) {
      console.error('Error calculating results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format number to 2 decimal places
  const formatNumber = (num) => {
    return Number(num).toFixed(2);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Handle device selection
  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setSelectedWidth(null);
    setSelectedDistance(null);
  };

  // Handle width selection
  const handleSelectWidth = (width) => {
    setSelectedWidth(width);
    setSelectedDistance(null);
  };

  // Handle distance selection
  const handleSelectDistance = (distance) => {
    setSelectedDistance(distance);
  };

  // Reset selections
  const resetSelections = () => {
    setSelectedDevice(null);
    setSelectedWidth(null);
    setSelectedDistance(null);
  };

  return (
    <div className="card mb-4 border-success">
      <div
        className="card-header bg-success text-white"
        onDoubleClick={handleDoubleClick}
        style={{ cursor: 'pointer' }}
        title="Double-click to go back"
      >
        <h5 className="mb-0">
          <i className="bi bi-bar-chart-line me-2"></i>
          Result Analysis
        </h5>
      </div>
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
            {selectedWidth && (
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={() => {
                  setSelectedWidth(null);
                  setSelectedDistance(null);
                }}
              >
                <i className="bi bi-arrow-left"></i> Back to Widths
              </button>
            )}
            {selectedDistance && (
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={() => setSelectedDistance(null)}
              >
                <i className="bi bi-arrow-left"></i> Back to Distances
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
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Calculating results...</p>
          </div>
        ) : (
          <div>
            {!selectedDevice ? (
              // Device selection view
              <div>
                <h6 className="border-bottom pb-2 mb-3">Select a Device</h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Device</th>
                        <th>Widths</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(resultData).map(device => (
                        <tr key={device}>
                          <td>{device}</td>
                          <td>{Object.keys(resultData[device].widths).length}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSelectDevice(device)}
                            >
                              <i className="bi bi-search me-1"></i> Analyze
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : !selectedWidth ? (
              // Width selection view
              <div>
                <h6 className="border-bottom pb-2 mb-3">
                  <i className="bi bi-display me-2"></i>
                  Device: {selectedDevice} - Select a Width
                </h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Width</th>
                        <th>Distances</th>
                        <th>Total Trails</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(resultData[selectedDevice].widths).map(width => (
                        <tr key={width}>
                          <td>{width}</td>
                          <td>{Object.keys(resultData[selectedDevice].widths[width].distances).length}</td>
                          <td>
                            {Object.values(resultData[selectedDevice].widths[width].distances).reduce(
                              (sum, distance) => sum + distance.totalTrails, 0
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSelectWidth(width)}
                            >
                              <i className="bi bi-search me-1"></i> Analyze
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : !selectedDistance ? (
              // Distance selection view
              <div>
                <h6 className="border-bottom pb-2 mb-3">
                  <i className="bi bi-display me-2"></i>
                  Device: {selectedDevice} -
                  <i className="bi bi-arrows-angle-expand me-2 ms-2"></i>
                  Width: {selectedWidth} - Select a Distance
                </h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Distance</th>
                        <th>Total Trails</th>
                        <th>Available Trails</th>
                        <th>Failed Trails</th>
                        <th>Error Rate</th>
                        <th>Avg Event Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(resultData[selectedDevice].widths[selectedWidth].distances).map(distance => {
                        const distanceData = resultData[selectedDevice].widths[selectedWidth].distances[distance];
                        return (
                          <tr key={distance}>
                            <td>{distance}</td>
                            <td>{distanceData.totalTrails}</td>
                            <td>{distanceData.availableTrails}</td>
                            <td>{distanceData.failedTrails}</td>
                            <td>{formatPercentage(distanceData.errorRate)}</td>
                            <td>{formatNumber(distanceData.avgEventTime)}ms</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleSelectDistance(distance)}
                              >
                                <i className="bi bi-search me-1"></i> Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Detailed view for selected distance
              <div>
                <h6 className="border-bottom pb-2 mb-3">
                  <i className="bi bi-display me-2"></i>
                  Device: {selectedDevice} -
                  <i className="bi bi-arrows-angle-expand me-2 ms-2"></i>
                  Width: {selectedWidth} -
                  <i className="bi bi-arrows-angle-contract me-2 ms-2"></i>
                  Distance: {selectedDistance}
                </h6>

                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Trails</td>
                        <td>{resultData[selectedDevice].widths[selectedWidth].distances[selectedDistance].totalTrails}</td>
                        <td>Total number of trails for this configuration</td>
                      </tr>
                      <tr>
                        <td>Available Trails</td>
                        <td>{resultData[selectedDevice].widths[selectedWidth].distances[selectedDistance].availableTrails}</td>
                        <td>Trails with valid start and target marks</td>
                      </tr>
                      <tr>
                        <td>Failed Trails</td>
                        <td>{resultData[selectedDevice].widths[selectedWidth].distances[selectedDistance].failedTrails}</td>
                        <td>Trails with marks between start and target</td>
                      </tr>
                      <tr>
                        <td>Error Rate</td>
                        <td>{formatPercentage(resultData[selectedDevice].widths[selectedWidth].distances[selectedDistance].errorRate)}</td>
                        <td>Failed Trails / Available Trails</td>
                      </tr>
                      <tr>
                        <td>Average Event Time</td>
                        <td>{formatNumber(resultData[selectedDevice].widths[selectedWidth].distances[selectedDistance].avgEventTime)}ms</td>
                        <td>Average time from Start to Target</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Note:</strong> Failed trails are defined as trails where there are other marks between the start and target marks.
                  Error rate is calculated as the number of failed trails divided by the number of available trails.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultAnalysisComponent;
