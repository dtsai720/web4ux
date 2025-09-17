import React from 'react';
import { calculateDifficulty } from '../../utils/detail/moveTimeUtils';

const OutlierDeviceDifficultyTable = ({ outlierData, data, selectedDevice, deviceStats, showParticipantView = false }) => {

  // Extract devices or participants based on view mode
  const getRowKeys = () => {
    const keys = new Set();
    const deviceOrderMap = {};

    if (showParticipantView && selectedDevice) {
      // Show participants for selected device
      const deviceData = data[selectedDevice];
      if (deviceData && typeof deviceData === 'object') {
        Object.keys(deviceData).forEach(participantSerial => {
          // Filter out 'stats' key as it's used for calculations, not a real participant
          if (participantSerial !== 'stats') {
            keys.add(participantSerial);
          }
        });
      }
    } else {
      // Show devices
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(deviceName => {
          keys.add(deviceName);

          // Extract deviceOrder from the first available record
          const deviceData = data[deviceName];
          if (deviceData && typeof deviceData === 'object') {
            const participantKeys = Object.keys(deviceData).filter(key => key !== 'stats');
            if (participantKeys.length > 0) {
              const firstParticipant = deviceData[participantKeys[0]];
              const trailKeys = Object.keys(firstParticipant).filter(key => key !== 'stats');
              if (trailKeys.length > 0) {
                const firstTrail = firstParticipant[trailKeys[0]];
                if (Array.isArray(firstTrail) && firstTrail.length > 0) {
                  const firstRecord = firstTrail[0];
                  if (firstRecord && firstRecord.deviceOrder) {
                    deviceOrderMap[deviceName] = firstRecord.deviceOrder;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Sort participants numerically (similar to dataUtils.js)
    return Array.from(keys).sort((a, b) => {
      if (showParticipantView) {
        // For participants, try to extract number and sort numerically
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA !== numB ? numA - numB : a.localeCompare(b);
      } else {
        // For devices, sort by deviceOrder
        const orderA = deviceOrderMap[a] || '';
        const orderB = deviceOrderMap[b] || '';
        return orderA.localeCompare(orderB);
      }
    });
  };

  const rowKeys = getRowKeys();

  // Get all difficulties with their W/D values from grouped data structure
  const getAllDifficultiesWithWD = () => {
    const difficultyMap = new Map();

    if (data && typeof data === 'object') {
      // Determine which devices to check
      const devicesToCheck = showParticipantView && selectedDevice ? [selectedDevice] : Object.keys(data);

      devicesToCheck.forEach(deviceName => {
        const deviceData = data[deviceName];
        if (deviceData && typeof deviceData === 'object') {
          Object.keys(deviceData).forEach(participantSerial => {
            const participantData = deviceData[participantSerial];
            Object.keys(participantData).forEach(trailNumber => {
              const trailRecords = participantData[trailNumber];
              if (Array.isArray(trailRecords) && trailRecords.length > 0) {
                const firstRecord = trailRecords[0];
                if (firstRecord && !firstRecord.deleted && firstRecord.distance && firstRecord.width) {
                  const difficulty = calculateDifficulty(firstRecord.distance, firstRecord.width);
                  if (difficulty !== undefined && difficulty !== null) {
                    // Create unique key using width and distance directly to ensure uniqueness
                    const key = `W${firstRecord.width}D${firstRecord.distance}`;
                    if (!difficultyMap.has(key)) {
                      difficultyMap.set(key, {
                        difficulty: difficulty,
                        width: firstRecord.width,
                        distance: firstRecord.distance,
                        uniqueKey: key
                      });
                    }
                  }
                }
              }
            });
          });
        }
      });
    }

    // Convert to array and sort first by difficulty, then by width, then by distance
    return Array.from(difficultyMap.values()).sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      if (a.width !== b.width) {
        return a.width - b.width;
      }
      return a.distance - b.distance;
    });
  };

  const difficultiesWithWD = getAllDifficultiesWithWD();

  // Calculate stats for each row-difficulty combination with specific W/D values
  const getStatsForRowDifficultyWD = (rowKey, difficultyItem) => {
    if (!data || typeof data !== 'object') {
      return { errorCount: 0, totalTrails: 0, percentage: 0 };
    }

    let totalTrails = 0;
    let errorCount = 0;

    if (showParticipantView && selectedDevice) {
      // Participant view: count errors for specific participant in selected device
      const deviceData = data[selectedDevice];
      if (deviceData && deviceData[rowKey]) {
        const participantData = deviceData[rowKey];
        Object.keys(participantData).forEach(trailNumber => {
          const trailRecords = participantData[trailNumber];

          if (Array.isArray(trailRecords) && trailRecords.length > 0) {
            const firstRecord = trailRecords[0];

            if (firstRecord && !firstRecord.deleted && firstRecord.distance && firstRecord.width) {
              const trailDifficulty = calculateDifficulty(firstRecord.distance, firstRecord.width);

              // Match both difficulty and specific W/D values
              if (Math.abs(trailDifficulty - difficultyItem.difficulty) < 0.001 &&
                  firstRecord.width === difficultyItem.width &&
                  firstRecord.distance === difficultyItem.distance) {
                totalTrails++;

                const hasError = isErrorTrail(trailRecords);
                if (hasError) {
                  errorCount++;
                }
              }
            }
          }
        });
      }
    } else {
      // Device view: count errors for all participants in device
      const deviceData = data[rowKey];
      if (deviceData) {
        Object.keys(deviceData).forEach(participantSerial => {
          const participantData = deviceData[participantSerial];
          Object.keys(participantData).forEach(trailNumber => {
            const trailRecords = participantData[trailNumber];

            if (Array.isArray(trailRecords) && trailRecords.length > 0) {
              const firstRecord = trailRecords[0];

              if (firstRecord && !firstRecord.deleted && firstRecord.distance && firstRecord.width) {
                const trailDifficulty = calculateDifficulty(firstRecord.distance, firstRecord.width);

                // Match both difficulty and specific W/D values
                if (Math.abs(trailDifficulty - difficultyItem.difficulty) < 0.001 &&
                    firstRecord.width === difficultyItem.width &&
                    firstRecord.distance === difficultyItem.distance) {
                  totalTrails++;

                  const hasError = isErrorTrail(trailRecords);
                  if (hasError) {
                    errorCount++;
                  }
                }
              }
            }
          });
        });
      }
    }

    const percentage = totalTrails > 0 ? (errorCount / totalTrails) * 100 : 0;

    return { errorCount, totalTrails, percentage };
  };

  // Calculate total errors for each row across all difficulties
  const getTotalStatsForRow = (rowKey) => {
    let totalErrors = 0;

    difficultiesWithWD.forEach(difficultyItem => {
      const stats = getStatsForRowDifficultyWD(rowKey, difficultyItem);
      totalErrors += stats.errorCount;
    });

    return totalErrors;
  };

  // Calculate total errors for each difficulty column across all participants
  const getTotalStatsForColumn = (difficultyItem) => {
    let totalErrors = 0;

    rowKeys.forEach(rowKey => {
      const stats = getStatsForRowDifficultyWD(rowKey, difficultyItem);
      totalErrors += stats.errorCount;
    });

    return totalErrors;
  };

  // Calculate grand total of all errors
  const getGrandTotal = () => {
    let grandTotal = 0;

    rowKeys.forEach(rowKey => {
      grandTotal += getTotalStatsForRow(rowKey);
    });

    return grandTotal;
  };

  // Helper function to detect if a trail has extra clicks
  const isErrorTrail = (trailRecords) => {
    let startFound = false;
    let targetFound = false;
    let hasIntermediateAction = false;

    for (let i = 0; i < trailRecords.length; i++) {
      const record = trailRecords[i];

      if (record.mark === 'start') {
        startFound = true;
        targetFound = false;
        hasIntermediateAction = false;
      } else if (record.mark === 'target' && startFound) {
        targetFound = true;
        if (hasIntermediateAction) {
          return true;
        }
        startFound = false;
        hasIntermediateAction = false;
      } else if (startFound && !targetFound) {
        hasIntermediateAction = true;
      }
    }

    return false;
  };


  if (rowKeys.length === 0) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            {showParticipantView ? 'Participant vs Difficulty Analysis' : 'Device vs Difficulty Analysis'}
          </h6>
        </div>
        <div className="card-body text-center text-muted">
          <p>No data available for analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-0">
              {showParticipantView ? 'Participant vs Difficulty Analysis' : 'Device vs Difficulty Analysis'}
            </h6>
            <small className="text-muted">
              {showParticipantView ? 'Error Count per Participant' : 'Error Count / Valid Trails (Percentage)'}
            </small>
          </div>
          {showParticipantView && deviceStats && (
            <div className="text-end">
              <div className="card border-primary bg-light" style={{ minWidth: '200px' }}>
                <div className="card-body py-2 px-3">
                  <h6 className="card-title text-primary mb-2 text-center">
                    <i className="bi bi-graph-up me-1"></i>
                    Error Count Statistics
                  </h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="border-end">
                        <small className="text-muted d-block mb-1">Average</small>
                        <span className="badge bg-primary fs-6 px-2 py-1">{deviceStats?.avgErrorCount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Std Dev</small>
                      <span className="badge bg-warning text-dark fs-6 px-2 py-1">{deviceStats?.stdDevErrorCount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="text-center">
                    {showParticipantView ? 'Participant / Difficulty' : 'Device / Difficulty'}
                  </th>
                  {difficultiesWithWD.map(item => (
                    <th key={item.uniqueKey} className="text-center">
                      <div>ID {item.difficulty}</div>
                      <small className="text-light">W{item.width}/D{item.distance}</small>
                    </th>
                  ))}
                  {showParticipantView && (
                    <th className="text-center">Total</th>
                  )}
                </tr>
              </thead>
              <tbody className="table-dark">
                {rowKeys.map(rowKey => (
                  <tr key={rowKey}>
                    <td className="table-dark text-center align-middle">
                      <strong>{rowKey}</strong>
                    </td>
                    {difficultiesWithWD.map(difficultyItem => {
                      const stats = getStatsForRowDifficultyWD(rowKey, difficultyItem);
                      return (
                        <td key={difficultyItem.uniqueKey} className="text-center align-middle">
                          {showParticipantView ? (
                            // Participant view: show only error count
                            <span>
                              {stats.errorCount}
                            </span>
                          ) : (
                            // Device view: show error count / total trails (percentage)
                            stats.totalTrails > 0 ? (
                              <div>
                                <div className="fw-bold">
                                  {stats.errorCount} / {stats.totalTrails}
                                </div>
                                <div className="text-light small">
                                  {stats.percentage.toFixed(1)}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-light">-</span>
                            )
                          )}
                        </td>
                      );
                    })}
                    {showParticipantView && (
                      <td className="text-center align-middle table-dark">
                        {getTotalStatsForRow(rowKey)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {showParticipantView && (
                <tfoot className="table-dark">
                  <tr>
                    <th className="text-center align-middle">
                      Total
                    </th>
                    {difficultiesWithWD.map(difficultyItem => (
                      <th key={difficultyItem.uniqueKey} className="text-center align-middle">
                        {getTotalStatsForColumn(difficultyItem)}
                      </th>
                    ))}
                    <th className="text-center align-middle">
                      {getGrandTotal()}
                    </th>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
    </div>
  );
};

export default OutlierDeviceDifficultyTable;
