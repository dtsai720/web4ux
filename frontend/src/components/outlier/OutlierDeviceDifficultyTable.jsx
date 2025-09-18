import { calculateDifficulty } from '../../utils/detail/moveTimeUtils';

// Helper functions extracted for better organization
const sortParticipantsNumerically = (participants) => {
  return participants.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA !== numB ? numA - numB : a.localeCompare(b);
  });
};

const sortDevicesByOrder = (devices, deviceOrderMap) => {
  return devices.sort((a, b) => {
    const orderA = deviceOrderMap[a] || '';
    const orderB = deviceOrderMap[b] || '';
    return orderA.localeCompare(orderB);
  });
};

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

// Stat item component
const StatItem = ({ label, value, variant = 'primary' }) => (
  <div className="col-6">
    <div className={variant === 'primary' ? 'border-end' : ''}>
      <small className="text-muted d-block mb-1">{label}</small>
      <span className={`badge bg-${variant} ${variant === 'warning' ? 'text-dark' : ''} fs-6 px-2 py-1`}>
        {value}
      </span>
    </div>
  </div>
);

// Statistics card component (reusable)
const StatsCard = ({ deviceStats }) => {
  const avgValue = deviceStats?.avgErrorCount?.toFixed(2) || '0.00';
  const stdDevValue = deviceStats?.stdDevErrorCount?.toFixed(2) || '0.00';

  return (
    <div className="text-end">
      <div className="card border-primary bg-light" style={{ minWidth: '200px' }}>
        <div className="card-body py-2 px-3">
          <h6 className="card-title text-primary mb-2 text-center">
            <i className="bi bi-graph-up me-1"></i>
            Error Count Statistics
          </h6>
          <div className="row text-center">
            <StatItem label="Average" value={avgValue} variant="primary" />
            <StatItem label="Std Dev" value={stdDevValue} variant="warning" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Table cell component for device view
const DeviceViewCell = ({ stats }) => {
  if (stats.totalTrails === 0) {
    return <span className="text-light">-</span>;
  }

  return (
    <div>
      <div className="fw-bold">
        {stats.errorCount} / {stats.totalTrails}
      </div>
      <div className="text-light small">
        {stats.percentage.toFixed(1)}%
      </div>
    </div>
  );
};

// Table cell component for participant view
const ParticipantViewCell = ({ errorCount }) => (
  <span>{errorCount}</span>
);

// Table header component
const TableHeader = ({ difficultiesWithWD, showParticipantView }) => (
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
);

// Card header component
const CardHeader = ({ showParticipantView, deviceStats }) => (
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
        <StatsCard deviceStats={deviceStats} />
      )}
    </div>
  </div>
);

// Table body component
const TableBody = ({ rowKeys, difficultiesWithWD, getStatsForRowDifficultyWD, showParticipantView, getTotalStatsForRow }) => (
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
                <ParticipantViewCell errorCount={stats.errorCount} />
              ) : (
                <DeviceViewCell stats={stats} />
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
);

// Table footer component
const TableFooter = ({ difficultiesWithWD, getTotalStatsForColumn, getGrandTotal }) => (
  <tfoot className="table-dark">
    <tr>
      <th className="text-center align-middle">Total</th>
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
);

// Empty state component
const EmptyState = ({ showParticipantView }) => (
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

// Helper functions for getting keys
const getParticipantKeys = (data, selectedDevice) => {
  const deviceData = data[selectedDevice];
  if (!deviceData || typeof deviceData !== 'object') {
    return [];
  }

  return Object.keys(deviceData).filter(key => key !== 'stats');
};

const getDeviceOrderFromRecord = (deviceData) => {
  const participantKeys = Object.keys(deviceData).filter(key => key !== 'stats');
  if (participantKeys.length === 0) return null;

  const firstParticipant = deviceData[participantKeys[0]];
  const trailKeys = Object.keys(firstParticipant).filter(key => key !== 'stats');
  if (trailKeys.length === 0) return null;

  const firstTrail = firstParticipant[trailKeys[0]];
  if (!Array.isArray(firstTrail) || firstTrail.length === 0) return null;

  const firstRecord = firstTrail[0];
  return firstRecord?.deviceOrder || null;
};

const getDeviceKeysWithOrder = (data) => {
  if (!data || typeof data !== 'object') {
    return { keys: [], orderMap: {} };
  }

  const keys = [];
  const deviceOrderMap = {};

  Object.keys(data).forEach(deviceName => {
    keys.push(deviceName);

    const deviceData = data[deviceName];
    if (deviceData && typeof deviceData === 'object') {
      const deviceOrder = getDeviceOrderFromRecord(deviceData);
      if (deviceOrder) {
        deviceOrderMap[deviceName] = deviceOrder;
      }
    }
  });

  return { keys, orderMap: deviceOrderMap };
};

// Custom hook for data processing
const useTableData = (data, selectedDevice, showParticipantView) => {
  // Extract row keys (devices or participants)
  const getRowKeys = () => {
    if (showParticipantView && selectedDevice) {
      // Show participants for selected device
      const participantKeys = getParticipantKeys(data, selectedDevice);
      return sortParticipantsNumerically(participantKeys);
    } else {
      // Show devices
      const { keys, orderMap } = getDeviceKeysWithOrder(data);
      return sortDevicesByOrder(keys, orderMap);
    }
  };

  // Get all difficulties with their W/D values
  const getAllDifficultiesWithWD = () => {
    const difficultyMap = new Map();

    if (!data || typeof data !== 'object') {
      return [];
    }

    const devicesToCheck = showParticipantView && selectedDevice ? [selectedDevice] : Object.keys(data);

    const processDifficultyFromRecord = (record) => {
      if (!record || record.deleted || !record.distance || !record.width) {
        return;
      }

      const difficulty = calculateDifficulty(record.distance, record.width);
      if (difficulty === undefined || difficulty === null) {
        return;
      }

      const key = `W${record.width}D${record.distance}`;
      if (!difficultyMap.has(key)) {
        difficultyMap.set(key, {
          difficulty,
          width: record.width,
          distance: record.distance,
          uniqueKey: key
        });
      }
    };

    const processTrailRecords = (trailRecords) => {
      if (Array.isArray(trailRecords) && trailRecords.length > 0) {
        processDifficultyFromRecord(trailRecords[0]);
      }
    };

    const processParticipantData = (participantData) => {
      Object.values(participantData).forEach(processTrailRecords);
    };

    const processDeviceData = (deviceData) => {
      if (deviceData && typeof deviceData === 'object') {
        Object.values(deviceData).forEach(processParticipantData);
      }
    };

    devicesToCheck.forEach(deviceName => {
      processDeviceData(data[deviceName]);
    });

    const sortDifficulties = (a, b) => {
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      if (a.width !== b.width) return a.width - b.width;
      return a.distance - b.distance;
    };

    return Array.from(difficultyMap.values()).sort(sortDifficulties);
  };

  const rowKeys = getRowKeys();
  const difficultiesWithWD = getAllDifficultiesWithWD();

  return { rowKeys, difficultiesWithWD };
};

// Custom hook for statistics calculations
const useStatistics = (data, selectedDevice, showParticipantView, rowKeys, difficultiesWithWD) => {
  // Calculate stats for each row-difficulty combination
  const getStatsForRowDifficultyWD = (rowKey, difficultyItem) => {
    if (!data || typeof data !== 'object') {
      return { errorCount: 0, totalTrails: 0, percentage: 0 };
    }

    let totalTrails = 0;
    let errorCount = 0;

    const processTrailRecords = (trailRecords) => {
      if (Array.isArray(trailRecords) && trailRecords.length > 0) {
        const firstRecord = trailRecords[0];
        if (firstRecord && !firstRecord.deleted && firstRecord.distance && firstRecord.width) {
          const trailDifficulty = calculateDifficulty(firstRecord.distance, firstRecord.width);
          if (Math.abs(trailDifficulty - difficultyItem.difficulty) < 0.001 &&
              firstRecord.width === difficultyItem.width &&
              firstRecord.distance === difficultyItem.distance) {
            totalTrails++;
            if (isErrorTrail(trailRecords)) {
              errorCount++;
            }
          }
        }
      }
    };

    if (showParticipantView && selectedDevice) {
      // Participant view: count errors for specific participant in selected device
      const deviceData = data[selectedDevice];
      if (deviceData && deviceData[rowKey]) {
        const participantData = deviceData[rowKey];
        Object.keys(participantData).forEach(trailNumber => {
          processTrailRecords(participantData[trailNumber]);
        });
      }
    } else {
      // Device view: count errors for all participants in device
      const deviceData = data[rowKey];
      if (deviceData) {
        Object.keys(deviceData).forEach(participantSerial => {
          const participantData = deviceData[participantSerial];
          Object.keys(participantData).forEach(trailNumber => {
            processTrailRecords(participantData[trailNumber]);
          });
        });
      }
    }

    const percentage = totalTrails > 0 ? (errorCount / totalTrails) * 100 : 0;
    return { errorCount, totalTrails, percentage };
  };

  // Calculate totals
  const getTotalStatsForRow = (rowKey) => {
    return difficultiesWithWD.reduce((total, difficultyItem) => {
      const stats = getStatsForRowDifficultyWD(rowKey, difficultyItem);
      return total + stats.errorCount;
    }, 0);
  };

  const getTotalStatsForColumn = (difficultyItem) => {
    return rowKeys.reduce((total, rowKey) => {
      const stats = getStatsForRowDifficultyWD(rowKey, difficultyItem);
      return total + stats.errorCount;
    }, 0);
  };

  const getGrandTotal = () => {
    return rowKeys.reduce((total, rowKey) => {
      return total + getTotalStatsForRow(rowKey);
    }, 0);
  };

  return {
    getStatsForRowDifficultyWD,
    getTotalStatsForRow,
    getTotalStatsForColumn,
    getGrandTotal
  };
};

const OutlierDeviceDifficultyTable = ({
  data,
  selectedDevice,
  deviceStats,
  showParticipantView = false
}) => {
  const { rowKeys, difficultiesWithWD } = useTableData(data, selectedDevice, showParticipantView);
  const {
    getStatsForRowDifficultyWD,
    getTotalStatsForRow,
    getTotalStatsForColumn,
    getGrandTotal
  } = useStatistics(data, selectedDevice, showParticipantView, rowKeys, difficultiesWithWD);

  if (rowKeys.length === 0) {
    return <EmptyState showParticipantView={showParticipantView} />;
  }

  return (
    <div className="card mb-4">
      <CardHeader
        showParticipantView={showParticipantView}
        deviceStats={deviceStats}
      />

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-bordered">
            <TableHeader
              difficultiesWithWD={difficultiesWithWD}
              showParticipantView={showParticipantView}
            />

            <TableBody
              rowKeys={rowKeys}
              difficultiesWithWD={difficultiesWithWD}
              getStatsForRowDifficultyWD={getStatsForRowDifficultyWD}
              showParticipantView={showParticipantView}
              getTotalStatsForRow={getTotalStatsForRow}
            />

            {showParticipantView && (
              <TableFooter
                difficultiesWithWD={difficultiesWithWD}
                getTotalStatsForColumn={getTotalStatsForColumn}
                getGrandTotal={getGrandTotal}
              />
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutlierDeviceDifficultyTable;
