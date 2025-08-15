import React from 'react';
import { calculateDifficulty } from '../../utils/detail/moveTimeUtils';

const OutlierDeviceDifficultyTable = ({ outlierData, data }) => {

  // Extract devices from grouped data structure
  const getAllDevices = () => {
    const devices = new Set();

    if (data && typeof data === 'object') {
      // data is grouped by device -> participant -> trail
      Object.keys(data).forEach(deviceName => {
        devices.add(deviceName);
      });
    }

    return Array.from(devices).sort();
  };

  const devices = getAllDevices();

  // Get all difficulties from grouped data structure
  const getAllDifficulties = () => {
    const difficulties = new Set();

    if (data && typeof data === 'object') {
      // data is grouped by device -> participant -> trail
      Object.keys(data).forEach(deviceName => {
        const deviceData = data[deviceName];
        Object.keys(deviceData).forEach(participantSerial => {
          const participantData = deviceData[participantSerial];
          Object.keys(participantData).forEach(trailNumber => {
            const trailRecords = participantData[trailNumber];
            if (Array.isArray(trailRecords) && trailRecords.length > 0) {
              // Get the first record to extract distance and width (should be same for all records in trail)
              const firstRecord = trailRecords[0];
              if (firstRecord && !firstRecord.deleted && firstRecord.distance && firstRecord.width) {
                const difficulty = calculateDifficulty(firstRecord.distance, firstRecord.width);
                if (difficulty !== undefined && difficulty !== null) {
                  difficulties.add(difficulty);
                }
              }
            }
          });
        });
      });
    }

    return Array.from(difficulties).sort((a, b) => a - b);
  };

  const difficulties = getAllDifficulties();

  // Calculate stats for each device-difficulty combination
  const getStatsForDeviceDifficulty = (deviceKey, difficulty) => {
    if (!data || typeof data !== 'object') {
      return { errorCount: 0, totalTrails: 0, percentage: 0 };
    }

    const deviceData = data[deviceKey];
    if (!deviceData) {
      return { errorCount: 0, totalTrails: 0, percentage: 0 };
    }

    let totalTrails = 0;
    let errorCount = 0;

    // Iterate through participants and trails for this device
    Object.keys(deviceData).forEach(participantSerial => {
      const participantData = deviceData[participantSerial];
      Object.keys(participantData).forEach(trailNumber => {
        const trailRecords = participantData[trailNumber];

        if (Array.isArray(trailRecords) && trailRecords.length > 0) {
          const firstRecord = trailRecords[0];

          // Check if this trail matches the difficulty and is not deleted
          if (firstRecord && !firstRecord.deleted && firstRecord.distance && firstRecord.width) {
            const trailDifficulty = calculateDifficulty(firstRecord.distance, firstRecord.width);

            if (Math.abs(trailDifficulty - difficulty) < 0.001) { // Float comparison
              totalTrails++;

              // Check if this trail has errors
              const hasError = isErrorTrail(trailRecords);
              if (hasError) {
                errorCount++;
              }
            }
          }
        }
      });
    });

    const percentage = totalTrails > 0 ? (errorCount / totalTrails) * 100 : 0;

    return { errorCount, totalTrails, percentage };
  };

  // Helper function to detect if a trail has intermediate actions
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


  if (devices.length === 0) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Device vs Difficulty Analysis</h6>
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
        <h6 className="mb-0">Device vs Difficulty Analysis</h6>
        <small className="text-muted">Error Count / Total Trails (Percentage)</small>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th className="bg-light text-center">Device / Difficulty</th>
                {difficulties.map(difficulty => (
                  <th key={difficulty} className="bg-light text-center">
                    ID {difficulty}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map(deviceKey => (
                <tr key={deviceKey}>
                  <td className="bg-light text-center align-middle">
                    <strong>{deviceKey}</strong>
                  </td>
                  {difficulties.map(difficulty => {
                    const stats = getStatsForDeviceDifficulty(deviceKey, difficulty);
                    return (
                      <td key={difficulty} className="text-center align-middle">
                        {stats.totalTrails > 0 ? (
                          <div>
                            <div className="fw-bold">
                              {stats.errorCount} / {stats.totalTrails}
                            </div>
                            <div className="text-muted small">
                              {stats.percentage.toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutlierDeviceDifficultyTable;
