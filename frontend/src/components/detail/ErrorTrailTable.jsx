import React from 'react';

/**
 * Component to display error trails in a table format
 * Shows all error records directly in a flat table
 * @param {Object} props - Component props
 * @param {Array} props.errorTrails - Array of error trail objects
 * @param {string} props.selectedDevice - Currently selected device
 * @returns {JSX.Element} Error trail table
 */
const ErrorTrailTable = ({ errorTrails, selectedDevice }) => {



  if (!errorTrails || errorTrails.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No error trails found for Device: <strong>{selectedDevice}</strong>
        <div className="mt-2 small text-muted">
          Error trails are defined as trails where extra clicks occur between start and target actions.
        </div>
      </div>
    );
  }

  // Flatten all records from all error trails
  const allErrorRecords = [];

  errorTrails.forEach(trail => {
    trail.records.forEach(record => {
      allErrorRecords.push({
        participantSerial: trail.participantSerial,
        trailNumber: trail.trailNumber,
        difficultyId: trail.difficultyId,
        action: record.mark,
        position: `(${record.x}, ${record.y})`,
        timestamp: record.timestamp,
        eventTime: null, // Will be calculated
        hasDoubleClick: record.mark === 'start-else',
        trailKey: `${trail.participantSerial}-${trail.trailNumber}`,
        trailRecords: trail.records // Keep reference for event time calculation
      });
    });
  });

  // Calculate event time for each trail (time from start to target)
  allErrorRecords.forEach(record => {
    const startRecord = record.trailRecords.find(r => r.mark === 'start');
    const targetRecord = record.trailRecords.find(r => r.mark === 'target');
    if (startRecord && targetRecord) {
      record.eventTime = targetRecord.timestamp - startRecord.timestamp;
    }
  });

  // Sort by participant, trail number, then timestamp
  allErrorRecords.sort((a, b) => {
    const participantCompare = a.participantSerial.localeCompare(b.participantSerial);
    if (participantCompare !== 0) return participantCompare;

    const trailCompare = a.trailNumber - b.trailNumber;
    if (trailCompare !== 0) return trailCompare;

    return a.timestamp - b.timestamp;
  });


  return (
    <div>
      <div className="table-responsive">
        <table className="table table-sm table-hover">
          <thead className="table-secondary">
            <tr>
              <th style={{ width: '120px' }}>
                <i className="bi bi-person me-1"></i>Participant
              </th>
              <th style={{ width: '80px' }}>
                <i className="bi bi-list-ol me-1"></i>Trail No
              </th>
              <th style={{ width: '120px' }}>
                <i className="bi bi-hash me-1"></i>ID (W/D)
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-play-circle me-1"></i>Action
              </th>
              <th style={{ width: '120px' }}>
                <i className="bi bi-geo me-1"></i>Position
              </th>
              <th style={{ width: '160px' }}>
                <i className="bi bi-clock me-1"></i>Timestamp
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-stopwatch me-1"></i>Event Time
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-cursor-fill me-1"></i>Double Click
              </th>
            </tr>
          </thead>
          <tbody>
            {allErrorRecords.map((record, index) => (
              <tr key={`${record.trailKey}-${index}`}>
                <td className="fw-bold">
                  {record.participantSerial}
                </td>
                <td>
                  {record.trailNumber}
                </td>
                <td>
                  <small className="font-monospace">
                    {record.difficultyId}
                  </small>
                </td>
                <td>
                  <span>
                    {record.action}
                  </span>
                </td>
                <td>
                  <code className="small">{record.position}</code>
                </td>
                <td>
                  <small className="font-monospace">
                    {record.timestamp}
                  </small>
                </td>
                <td>
                  <small className="font-monospace">
                    {record.eventTime !== null ? `${record.eventTime}ms` : '-'}
                  </small>
                </td>
                <td>
                  {record.hasDoubleClick ? (
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-cursor-fill me-1"></i>
                      Yes
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <div className="row">
          <div className="col-md-6">
            <h6 className="text-muted">Actions:</h6>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span>start, target, others (extra clicks)</span>
            </div>
            <div className="small text-muted">
              <strong>Total Records:</strong> {allErrorRecords.length} error actions displayed
            </div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">
              <strong>Error Definition:</strong> All actions from trails with extra clicks between start and target<br/>
              <strong>ID (W/D):</strong> Difficulty calculated using Fitts' Law: log₂(distance/width + 1)<br/>
              <strong>Event Time:</strong> Time from trail start (ms)<br/>
              <strong>Sorting:</strong> Participant → Trail Number → Time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTrailTable;
