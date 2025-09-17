import React, { useState } from 'react';
import { trailHasDoubleClick } from '../../utils/outlier/outlierUtils';
import { calculateDifficulty } from '../../utils/detail/moveTimeUtils';

const BADGE_CLASSES = {
  start: 'bg-primary',
  target: 'bg-success',
  default: 'bg-warning text-dark'
};

const MAIN_HEADERS = [
  { text: '', width: '40px' },
  { text: 'Trail Number' },
  { text: 'ID (W/D)' },
  { text: 'Extra Clicks' },
  { text: 'Event Time' },
  { text: 'Double Click' }
];

const EVENT_HEADERS = [
  { icon: 'bi-play-circle', text: 'Action', width: '80px' },
  { icon: 'bi-cursor-fill', text: 'Double Click', width: '120px' },
  { icon: 'bi-geo', text: 'Position', width: '120px' },
  { icon: 'bi-clock', text: 'Timestamp', width: '140px' }
];

const DifficultyDisplay = ({ trailRecords }) => {
  const firstRecord = Array.isArray(trailRecords) ? trailRecords[0] : null;
  const difficulty = firstRecord?.width && firstRecord?.distance ?
    calculateDifficulty(firstRecord.distance, firstRecord.width) : '-';

  return (
    <div className="small">
      <strong>{difficulty}</strong>
      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
        ({firstRecord?.width || '-'}/{firstRecord?.distance || '-'})
      </div>
    </div>
  );
};

const EventLogRecord = ({ record }) => (
  <tr>
    <td>
      <span className={`badge ${BADGE_CLASSES[record.mark] || BADGE_CLASSES.default}`}>
        {record.mark || 'others'}
      </span>
    </td>
    <td>
      {record.mark === 'start-else' ? (
        <span className="badge bg-warning text-dark">
          <i className="bi bi-cursor-fill me-1"></i>Yes
        </span>
      ) : (
        <span className="text-muted">-</span>
      )}
    </td>
    <td>
      <code className="small">({record.x}, {record.y})</code>
    </td>
    <td>
      <small className="font-monospace">{record.timestamp}</small>
    </td>
  </tr>
);

const EventLogExpansion = ({ trailData, participantKey, trailKey }) => (
  <tr>
    <td colSpan="6" className="p-0">
      <div className="bg-light p-3 border-top">
        <h6 className="mb-3">
          <i className="bi bi-list-ul text-primary me-2"></i>
          <span className="badge bg-primary me-2">Participant {participantKey}</span>
          <span className="badge bg-secondary me-2">Trail {trailKey}</span>
          Event Log
        </h6>

        <div className="table-responsive">
          <table className="table table-sm table-striped table-hover">
            <thead className="table-dark">
              <tr>
                {EVENT_HEADERS.map(({ icon, text, width }) => (
                  <th key={text} style={{ width }}>
                    <i className={`bi ${icon} me-1`}></i>{text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(trailData) && trailData.map((record, index) => (
                <EventLogRecord key={index} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </td>
  </tr>
);

const TrailRow = ({
  trailKey,
  trailData,
  trailStats,
  hasDoubleClick,
  isExpanded,
  onToggle,
  participantKey
}) => (
  <React.Fragment>
    <tr
      className="cursor-pointer"
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
      title={`Click to ${isExpanded ? 'collapse' : 'expand'} details`}
    >
      <td>
        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
      </td>
      <td>{trailKey}</td>
      <td>
        <DifficultyDisplay trailRecords={trailData} />
      </td>
      <td>{trailStats?.error_time || 0}</td>
      <td>{trailStats?.event_time || 0}ms</td>
      <td>
        {hasDoubleClick ? (
          <span className="badge bg-warning text-dark">
            <i className="bi bi-cursor-fill me-1"></i>Yes
          </span>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>
    </tr>

    {isExpanded && (
      <EventLogExpansion
        trailData={trailData}
        participantKey={participantKey}
        trailKey={trailKey}
      />
    )}
  </React.Fragment>
);

const OutlierTrailTable = ({ errorTrails, data, deviceKey, participantKey }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (trailKey) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      prev.has(trailKey) ? next.delete(trailKey) : next.add(trailKey);
      return next;
    });
  };

  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">
        <i className="bi bi-person-fill text-primary me-2"></i>
        <span className="badge bg-primary me-2">Participant {participantKey}</span>
        <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
        Error Trails Analysis
      </h6>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-secondary">
            <tr>
              {MAIN_HEADERS.map(({ text, width }, index) => (
                <th key={index} style={width ? { width } : undefined}>{text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {errorTrails?.map(trailKey => {
              const trailData = data[deviceKey]?.[participantKey]?.[trailKey];
              const trailStats = trailData?.stats;
              const hasDoubleClick = Array.isArray(trailData) ? trailHasDoubleClick(trailData) : false;
              const isExpanded = expandedRows.has(trailKey);

              return (
                <TrailRow
                  key={trailKey}
                  trailKey={trailKey}
                  trailData={trailData}
                  trailStats={trailStats}
                  hasDoubleClick={hasDoubleClick}
                  isExpanded={isExpanded}
                  onToggle={() => toggleRowExpansion(trailKey)}
                  participantKey={participantKey}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutlierTrailTable;
