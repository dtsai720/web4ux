import React from 'react';
import { formatMoveTime, getParticipantMoveTime } from '../../utils/detail/moveTimeUtils';

/**
 * Table component for displaying movement time matrix results
 */
const MovementTimeMatrixTable = ({ deviceName, analysisData }) => {
  const { participants, participantData, difficultyGroups } = analysisData;

  // Create a detailed difficulty list with W/D combinations
  const getDetailedDifficulties = () => {
    const detailedDiffs = [];
    const difficultyWDMap = new Map();

    // First, collect all W/D combinations for each difficulty
    Object.keys(difficultyGroups).forEach(diffKey => {
      const group = difficultyGroups[diffKey];
      const diffValue = group.difficulty;

      if (!difficultyWDMap.has(diffValue)) {
        difficultyWDMap.set(diffValue, []);
      }
      difficultyWDMap.get(diffValue).push({
        difficulty: diffValue,
        width: group.width,
        distance: group.distance,
        originalKey: diffKey
      });
    });

    // Sort difficulties and then sort W/D combinations within each difficulty
    Array.from(difficultyWDMap.keys())
      .sort((a, b) => a - b)
      .forEach(diffValue => {
        const wdCombos = difficultyWDMap.get(diffValue)
          .sort((a, b) => {
            if (a.width !== b.width) return a.width - b.width;
            return a.distance - b.distance;
          });
        detailedDiffs.push(...wdCombos);
      });

    return detailedDiffs;
  };

  const detailedDifficulties = getDetailedDifficulties();

  // Calculate total average move time for each participant across all difficulties
  const calculateParticipantTotal = (participantSerial) => {
    const participant = participantData[participantSerial];
    if (!participant || participant.totalTrails === 0) return null;
    return participant.totalMoveTime / participant.totalTrails;
  };

  // Calculate average move time for each difficulty across all participants
  const calculateDifficultyAverage = (difficultyKey) => {
    const validTimes = participants
      .map(participant => getParticipantMoveTime(analysisData, participant, difficultyKey))
      .filter(time => time !== null);

    if (validTimes.length === 0) return null;
    return validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
  };

  // Calculate overall average across all participants and difficulties
  const calculateOverallAverage = () => {
    const allValidTimes = participants.flatMap(participant =>
      detailedDifficulties
        .map(diffItem => getParticipantMoveTime(analysisData, participant, diffItem.originalKey))
        .filter(time => time !== null)
    );

    if (allValidTimes.length === 0) return null;
    return allValidTimes.reduce((sum, time) => sum + time, 0) / allValidTimes.length;
  };

  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">
        <i className="bi bi-grid-3x3 me-2"></i>
        Movement Time Matrix - Device: {deviceName}
      </h6>

      <div className="table-responsive">
        <table className="table table-hover table-bordered">
          <thead className="table-secondary">
            <tr>
              <th className="text-center" style={{ verticalAlign: 'middle' }}>
                <i className="bi bi-person me-1"></i>
                Participant
              </th>
              {detailedDifficulties.map((diffItem, index) => (
                <th key={`${diffItem.originalKey}-${index}`} className="text-center" style={{ minWidth: '120px' }}>
                  <div className="fw-bold">
                    <div>
                      <span className="badge bg-primary text-white me-1">ID</span>
                      {diffItem.difficulty}
                    </div>
                    <small className="text-muted d-block mt-1">
                      W{diffItem.width}/D{diffItem.distance}
                    </small>
                  </div>
                </th>
              ))}
              <th className="text-center" style={{ minWidth: '120px' }}>
                <i className="bi bi-calculator me-1"></i>
                Average
              </th>
            </tr>
          </thead>
          <tbody>
            {participants.map(participant => {
              const totalMoveTime = calculateParticipantTotal(participant);
              return (
                <tr key={participant}>
                  <td className="fw-bold text-primary text-center">
                    <i className="bi bi-person-fill me-1"></i>
                    {participant}
                  </td>
                  {detailedDifficulties.map((diffItem, index) => {
                    const moveTime = getParticipantMoveTime(analysisData, participant, diffItem.originalKey);
                    return (
                      <td key={`${participant}-${diffItem.originalKey}-${index}`} className="text-center">
                        {moveTime !== null ? (
                          <span className="fw-normal" style={{ fontFamily: 'monospace' }}>
                            {formatMoveTime(moveTime)}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center">
                    {totalMoveTime !== null ? (
                      <span className="fw-normal" style={{ fontFamily: 'monospace' }}>
                        {formatMoveTime(totalMoveTime)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {/* Average row */}
            <tr className="table-warning">
              <td className="fw-bold text-center">
                <i className="bi bi-calculator me-1"></i>
                Average
              </td>
              {detailedDifficulties.map((diffItem, index) => {
                const avgTime = calculateDifficultyAverage(diffItem.originalKey);
                return (
                  <td key={`avg-${diffItem.originalKey}-${index}`} className="text-center">
                    {avgTime !== null ? (
                      <span className="fw-bold" style={{ fontFamily: 'monospace' }}>
                        {formatMoveTime(avgTime)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                );
              })}
              <td className="text-center">
                {(() => {
                  const overallAvg = calculateOverallAverage();
                  return overallAvg !== null ? (
                    <span className="fw-bold" style={{ fontFamily: 'monospace' }}>
                      {formatMoveTime(overallAvg)}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  );
                })()}
              </td>
            </tr>
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
              <li><strong>Average</strong>: Average move time across all difficulty levels</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Note:</strong>
            <ul className="mb-0 mt-2">
              <li>Only valid trails (available + calculable) are included</li>
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
