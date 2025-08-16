import React, { useState } from 'react';
import OutlierTrailTable from './OutlierTrailTable';

const OutlierParticipantTable = ({
  participants,
  onSelectParticipant,
  onToggleParticipantDelete,
  deviceKey,
  data
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showOutliersOnly, setShowOutliersOnly] = useState(false);
  const [showDoubleClickOnly, setShowDoubleClickOnly] = useState(false);
  const [expandedParticipants, setExpandedParticipants] = useState(new Set());

  const toggleParticipantExpansion = (participantKey) => {
    const newExpandedParticipants = new Set(expandedParticipants);
    if (newExpandedParticipants.has(participantKey)) {
      newExpandedParticipants.delete(participantKey);
    } else {
      newExpandedParticipants.add(participantKey);
    }
    setExpandedParticipants(newExpandedParticipants);
  };

  // 篩選 participants
  const filteredParticipants = Object.keys(participants || []).filter(participantKey => {
    const participant = participants[participantKey];

    if (showOutliersOnly && !participant.isOutlier) {
      return false;
    }

    if (showDoubleClickOnly && participant.doubleClickCount === 0) {
      return false;
    }

    return true;
  });

  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0">Participants</h6>
            <small className="text-muted">Participant details and outlier status</small>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse participants" : "Expand participants"}
          >
            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
        </div>
        {isExpanded && (
          <div className="mt-2">
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showOutliersOnly"
                  checked={showOutliersOnly}
                  onChange={(e) => setShowOutliersOnly(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="showOutliersOnly">
                  Show outliers only
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showDoubleClickOnly"
                  checked={showDoubleClickOnly}
                  onChange={(e) => setShowDoubleClickOnly(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="showDoubleClickOnly">
                  Show double click only
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th className="bg-light text-center" style={{ width: '40px' }}></th>
                <th className="bg-light text-center">Participant</th>
                <th className="bg-light text-center">Error Trail Count</th>
                <th className="bg-light text-center">Error Time</th>
                <th className="bg-light text-center">Trail Count</th>
                <th className="bg-light text-center">Double Clicks</th>
                <th className="bg-light text-center">Status</th>
                <th className="bg-light text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.sort((a, b) => {
                // Sort participants numerically (same as Participant vs Difficulty Analysis)
                const numA = parseInt(a.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.replace(/\D/g, '')) || 0;
                return numA !== numB ? numA - numB : a.localeCompare(b);
              }).map(participantKey => {
                const participant = participants[participantKey];
                const isExpanded = expandedParticipants.has(participantKey);
                const canExpand = participant.isOutlier || participant.doubleClickCount > 0;

                return (
                  <React.Fragment key={participantKey}>
                    <tr
                      className={`${participant.isOutlier ? 'table-danger' : ''} ${canExpand ? 'cursor-pointer' : ''}`}
                      onClick={() => canExpand && toggleParticipantExpansion(participantKey)}
                      style={{ cursor: canExpand ? 'pointer' : 'default' }}
                    >
                      <td className="text-center align-middle">
                        {canExpand ? (
                          <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        <strong>{participantKey}</strong>
                      </td>
                      <td className="text-center align-middle">
                        <span>{participant.errorCount}</span>
                      </td>
                      <td className="text-center align-middle">
                        <span>{participant.errorTime}</span>
                      </td>
                      <td className="text-center align-middle">
                        <span>{participant.trailCount}</span>
                      </td>
                      <td className="text-center align-middle">
                        {participant.doubleClickCount > 0 ? (
                          <span className="badge bg-warning text-dark" title={`${participant.doubleClickCount} trails with double clicks`}>
                            {participant.doubleClickCount}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        {participant.isOutlier ? (
                          <span className="badge bg-danger">Outlier</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleParticipantDelete(deviceKey, participantKey, true);
                          }}
                          title="Delete participant"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && canExpand && (
                      <tr>
                        <td colSpan="8" className="p-0">
                          <div className="bg-light p-3 border-top">
                            <OutlierTrailTable
                              errorTrails={participant.errorTrails}
                              data={data}
                              deviceKey={deviceKey}
                              participantKey={participantKey}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );
};

export default OutlierParticipantTable;
