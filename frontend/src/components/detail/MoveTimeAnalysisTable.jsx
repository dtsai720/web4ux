import React from 'react';
import { formatMoveTime, getParticipantMoveTime } from '../../utils/detail/moveTimeUtils';

/**
 * Table component for displaying movement time matrix results
 */
const MovementTimeMatrixTable = ({ deviceName, analysisData }) => {
  const { difficulties, participants, participantData } = analysisData;

  // Calculate total average move time for each participant across all difficulties
  const calculateParticipantTotal = (participantSerial) => {
    const participant = participantData[participantSerial];
    if (!participant || participant.totalTrails === 0) return null;
    return participant.totalMoveTime / participant.totalTrails;
  };

  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">
        <i className="bi bi-grid-3x3 me-2"></i>
        Movement Time Matrix - Device: {deviceName}
      </h6>

      <div className="table-responsive">
        <table className="table table-hover table-bordered">
          <thead className="table-light">
            <tr>
              <th className="text-center" style={{ verticalAlign: 'middle' }}>
                <i className="bi bi-person me-1"></i>
                Participant
              </th>
              {difficulties.map(difficulty => (
                <th key={difficulty} className="text-center" style={{ minWidth: '120px' }}>
                  <div className="fw-bold">ID {difficulty}</div>
                  <small className="text-muted">
                    {analysisData.difficultyGroups[difficulty] &&
                      `W:${analysisData.difficultyGroups[difficulty].width} D:${analysisData.difficultyGroups[difficulty].distance}`
                    }
                  </small>
                </th>
              ))}
              <th className="text-center bg-info text-white" style={{ minWidth: '120px' }}>
                <i className="bi bi-plus-circle me-1"></i>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {participants.map(participant => {
              const totalMoveTime = calculateParticipantTotal(participant);
              return (
                <tr key={participant}>
                  <td className="fw-bold text-primary">
                    <i className="bi bi-person-fill me-1"></i>
                    {participant}
                  </td>
                  {difficulties.map(difficulty => {
                    const moveTime = getParticipantMoveTime(analysisData, participant, difficulty);
                    return (
                      <td key={`${participant}-${difficulty}`} className="text-center">
                        {moveTime !== null ? (
                          <span className="badge bg-light text-dark">
                            {formatMoveTime(moveTime)}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center bg-light">
                    {totalMoveTime !== null ? (
                      <span className="badge bg-info">
                        {formatMoveTime(totalMoveTime)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Legend:</strong>
            <ul className="mb-0 mt-2">
              <li><strong>ID</strong>: Index of Difficulty calculated using Fitts' Law</li>
              <li><strong>W</strong>: Target Width, <strong>D</strong>: Target Distance</li>
              <li><strong>Total</strong>: Average move time across all difficulty levels</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Note:</strong>
            <ul className="mb-0 mt-2">
              <li>Only available and calculable trails are included</li>
              <li>Move time is calculated from start to target timestamp</li>
              <li>"-" indicates no data available for that difficulty level</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementTimeMatrixTable;
