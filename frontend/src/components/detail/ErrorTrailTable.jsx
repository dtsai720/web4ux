import React, { useState } from 'react';

/**
 * Component to display error trails in a table format
 * Y-axis: participants, X-axis: trail details
 * @param {Object} props - Component props
 * @param {Array} props.errorTrails - Array of error trail objects
 * @param {string} props.selectedDevice - Currently selected device
 * @param {string} props.selectedDifficulty - Currently selected difficulty
 * @returns {JSX.Element} Error trail table
 */
const ErrorTrailTable = ({ errorTrails, selectedDevice, selectedDifficulty }) => {
  const [expandedTrails, setExpandedTrails] = useState(new Set());

  // Toggle trail expansion - only one trail can be expanded at a time
  const toggleTrailExpansion = (trailId) => {
    const newExpandedTrails = new Set();
    if (!expandedTrails.has(trailId)) {
      newExpandedTrails.add(trailId);
    }
    setExpandedTrails(newExpandedTrails);
  };

  // Get current timezone
  const getCurrentTimezone = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    const offsetStr = `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return `${timezone} (${offsetStr})`;
  };

  // Format timestamp to YYYY/MM/dd HH:mm:SS.SSS format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  if (!errorTrails || errorTrails.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No error trails found for Device: <strong>{selectedDevice}</strong> and Difficulty: <strong>{selectedDifficulty}</strong>
        <div className="mt-2 small text-muted">
          Error trails are defined as trails where extra clicks occur between start and target actions.
        </div>
      </div>
    );
  }

  // Group trails by participant for easier display
  const trailsByParticipant = {};
  errorTrails.forEach(trail => {
    if (!trailsByParticipant[trail.participantSerial]) {
      trailsByParticipant[trail.participantSerial] = [];
    }
    trailsByParticipant[trail.participantSerial].push(trail);
  });

  // Sort participants
  const sortedParticipants = Object.keys(trailsByParticipant).sort();

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-sm table-striped table-hover">
          <thead className="table-secondary">
            <tr>
              <th style={{ width: '40px' }}></th>
              <th style={{ width: '120px' }}>
                <i className="bi bi-person me-1"></i>Participant
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-list-ol me-1"></i>Trail No
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-exclamation-circle me-1"></i>Error Count
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-cursor-fill me-1"></i>Double Click
              </th>
              <th style={{ width: '120px' }}>
                <i className="bi bi-clock me-1"></i>Event Time
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map(participantSerial => {
              const participantTrails = trailsByParticipant[participantSerial];

              return participantTrails.map((trail) => {
                const trailId = `${trail.participantSerial}-${trail.trailNumber}`;
                const isExpanded = expandedTrails.has(trailId);
                const errorCount = trail.records.filter(r => r.mark !== 'start' && r.mark !== 'target').length;

                return (
                  <React.Fragment key={trailId}>
                    <tr
                      onClick={() => toggleTrailExpansion(trailId)}
                      style={{ cursor: 'pointer' }}
                      title={isExpanded ? "Click to collapse details" : "Click to expand details"}
                    >
                      <td>
                        <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </td>
                      <td className="fw-bold">
                        {trail.participantSerial}
                      </td>
                      <td>
                        <span>
                          {trail.trailNumber}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-danger">
                          {errorCount}
                        </span>
                      </td>
                      <td>
                        {(() => {
                          const doubleClickCount = trail.records.filter(r => r.mark === 'start-else').length;
                          return doubleClickCount > 0 ? (
                            <span className="badge bg-warning text-dark">
                              {doubleClickCount}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          );
                        })()}
                      </td>
                      <td>
                        <small className="font-monospace">
                          {(trail.records.find(r => r.mark === 'target')?.timestamp -
                            trail.records.find(r => r.mark === 'start')?.timestamp) || 0}ms
                        </small>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <div className="bg-light p-3 border-top">
                            <h6 className="mb-3">
                              <i className="bi bi-list-ul text-primary me-2"></i>
                              <span className="badge bg-primary me-2">Participant {trail.participantSerial}</span>
                              <span className="badge bg-secondary me-2">Trail {trail.trailNumber}</span>
                              Event Log
                            </h6>
                            <div className="table-responsive">
                              <table className="table table-sm table-striped table-hover">
                                <thead className="table-secondary">
                                  <tr>
                                    <th style={{ width: '100px' }}>
                                      <i className="bi bi-play-circle me-1"></i>Action
                                    </th>
                                    <th style={{ width: '120px' }}>
                                      <i className="bi bi-cursor-fill me-1"></i>Double Click
                                    </th>
                                    <th style={{ width: '120px' }}>
                                      <i className="bi bi-geo me-1"></i>Position
                                    </th>
                                    <th style={{ width: '140px' }}>
                                      <i className="bi bi-clock me-1"></i>Timestamp
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {trail.records.map((record, recordIndex) => (
                                    <tr key={`${trailId}-record-${recordIndex}`}>
                                      <td>
                                        <span className={`badge ${
                                          record.mark === 'start' ? 'bg-primary' :
                                          record.mark === 'target' ? 'bg-success' :
                                          'bg-warning text-dark'
                                        }`}>
                                          {record.mark}
                                        </span>
                                      </td>
                                      <td>
                                        {record.mark === 'start-else' ? (
                                          <span className="badge bg-warning text-dark">
                                            <i className="bi bi-cursor-fill me-1"></i>
                                            Yes
                                          </span>
                                        ) : (
                                          <span className="text-muted">-</span>
                                        )}
                                      </td>
                                      <td>
                                        <code className="small">({record.x}, {record.y})</code>
                                      </td>
                                      <td>
                                        <small className="font-monospace">
                                          {formatTimestamp(record.timestamp)}
                                        </small>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <div className="row">
          <div className="col-md-6">
            <h6 className="text-muted">Legend:</h6>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="badge bg-primary">start</span>
              <span className="badge bg-success">target</span>
              <span className="badge bg-warning text-dark">others (extra clicks)</span>
            </div>
            <div className="small text-muted">
              <strong>Usage:</strong> Click any trail row to expand/collapse detailed records
            </div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">
              <strong>Error Definition:</strong> Trails with extra clicks between start and target<br/>
              <strong>Difficulty (ID):</strong> Calculated using Fitts' Law: log₂(distance/width + 1)<br/>
              <strong>Timestamp Format:</strong> YYYY/MM/dd HH:mm:SS.SSS<br/>
              <strong>Timezone:</strong> {getCurrentTimezone()}<br/>
              <strong>Sorting:</strong> Participant → Trail Number
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTrailTable;
