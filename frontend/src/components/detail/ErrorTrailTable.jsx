import React from 'react';

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
  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  if (!errorTrails || errorTrails.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No error trails found for Device: <strong>{selectedDevice}</strong> and Difficulty: <strong>{selectedDifficulty}</strong>
        <div className="mt-2 small text-muted">
          Error trails are defined as trails where intermediate actions occur between start and target actions.
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
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-exclamation-triangle text-warning me-2"></i>
          Error Trails: {selectedDevice} (Difficulty ID: {selectedDifficulty})
        </h6>
        <span className="badge bg-warning text-dark">
          {errorTrails.length} Error Trail{errorTrails.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-sm table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th style={{ width: '120px' }}>
                <i className="bi bi-person me-1"></i>Participant
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-list-ol me-1"></i>Trail No
              </th>
              <th style={{ width: '120px' }}>
                <i className="bi bi-calculator me-1"></i>ID (W/D)
              </th>
              <th style={{ width: '100px' }}>
                <i className="bi bi-play-circle me-1"></i>Action
              </th>
              <th style={{ width: '120px' }}>
                <i className="bi bi-geo me-1"></i>Coordinate
              </th>
              <th>
                <i className="bi bi-clock me-1"></i>Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map(participantSerial => {
              const participantTrails = trailsByParticipant[participantSerial];

              return participantTrails.map((trail, trailIndex) => {
                return trail.records.map((record, recordIndex) => {
                  const isFirstRecordOfTrail = recordIndex === 0;
                  const isFirstTrailOfParticipant = trailIndex === 0 && recordIndex === 0;
                  const participantRowSpan = isFirstTrailOfParticipant ?
                    participantTrails.reduce((sum, t) => sum + t.records.length, 0) : null;

                  return (
                    <tr key={`${trail.participantSerial}-${trail.trailNumber}-${recordIndex}`}>
                      {isFirstTrailOfParticipant && (
                        <td rowSpan={participantRowSpan} className="table-info fw-bold align-middle">
                          {participantSerial}
                        </td>
                      )}
                      {isFirstRecordOfTrail && (
                        <>
                          <td rowSpan={trail.records.length} className="align-middle">
                            <span className="badge bg-secondary">
                              {trail.trailNumber}
                            </span>
                          </td>
                          <td rowSpan={trail.records.length} className="align-middle">
                            <div className="small">
                              <strong>{trail.difficulty}</strong>
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              ({trail.width}/{trail.distance})
                            </div>
                          </td>
                        </>
                      )}
                      <td>
                        <span className={`badge ${
                          record.action === 'start' ? 'bg-primary' :
                          record.action === 'target' ? 'bg-success' :
                          'bg-warning text-dark'
                        }`}>
                          {record.action}
                        </span>
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
                  );
                });
              });
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <div className="row">
          <div className="col-md-6">
            <h6 className="text-muted">Legend:</h6>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-primary">start</span>
              <span className="badge bg-success">target</span>
              <span className="badge bg-warning text-dark">else (intermediate)</span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">
              <strong>Error Definition:</strong> Trails with actions between start and target<br/>
              <strong>Difficulty (ID):</strong> Calculated using Fitts' Law: log₂(distance/width + 1)<br/>
              <strong>Sorting:</strong> Participant → Trail Number
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTrailTable;
