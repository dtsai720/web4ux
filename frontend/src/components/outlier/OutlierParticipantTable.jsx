import React from 'react';

const OutlierParticipantTable = ({
  participants,
  onSelectParticipant,
  onToggleParticipantDelete,
  deviceKey
}) => {
  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">Participants</h6>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Participant</th>
              <th>Error Count</th>
              <th>Error Time</th>
              <th>Trail Count</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(participants || {}).map(([participantKey, participantData]) => (
              <tr key={participantKey} className={participantData.isOutlier ? 'table-danger' : ''}>
                <td>{participantKey}</td>
                <td>{participantData.errorCount}</td>
                <td>{participantData.errorTime}</td>
                <td>{participantData.trailCount}</td>
                <td>
                  {participantData.isOutlier ? (
                    <span className="badge bg-danger">Outlier</span>
                  ) : (
                    <span className="badge bg-success">Normal</span>
                  )}
                </td>
                <td>
                  <div>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => onSelectParticipant(participantKey)}
                    >
                      <i className="bi bi-eye me-1"></i> View
                    </button>
                    {participantData.isOutlier && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onToggleParticipantDelete(deviceKey, participantKey, true)}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutlierParticipantTable;
