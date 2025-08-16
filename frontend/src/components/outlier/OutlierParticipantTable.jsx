import React, { useState } from 'react';
import OutlierTrailTable from './OutlierTrailTable';

const OutlierParticipantTable = ({
  participants,
  deviceStats,
  onSelectParticipant,
  onToggleParticipantDelete,
  deviceKey,
  data
}) => {
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
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-0">Participants</h6>
            <small className="text-muted">Participant details and outlier status</small>
          </div>
          <div className="text-end">
            <div className="card border-info bg-light" style={{ minWidth: '200px' }}>
              <div className="card-body py-2 px-3">
                <h6 className="card-title text-info mb-2 text-center">
                  <i className="bi bi-graph-up me-1"></i>
                  Error Count Statistics
                </h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border-end">
                      <small className="text-muted d-block mb-1">Average</small>
                      <span className="badge bg-primary fs-6 px-2 py-1">{deviceStats?.avgErrorCount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block mb-1">Std Dev</small>
                    <span className="badge bg-warning text-dark fs-6 px-2 py-1">{deviceStats?.stdDevErrorCount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                  Show double clicks only
                </label>
              </div>
            </div>
          </div>
      </div>
      <div className="card-body">
        {filteredParticipants.length === 0 ? (
          <div className="text-center text-muted py-4">
            {showOutliersOnly && showDoubleClickOnly ? (
              <div>
                <i className="bi bi-info-circle me-2"></i>
                No participants found with both outliers and double clicks
              </div>
            ) : showOutliersOnly ? (
              <div>
                <i className="bi bi-info-circle me-2"></i>
                No outlier participants found for this device
              </div>
            ) : showDoubleClickOnly ? (
              <div>
                <i className="bi bi-info-circle me-2"></i>
                No participants with double clicks found for this device
              </div>
            ) : (
              <div>
                <i className="bi bi-info-circle me-2"></i>
                No participants found for this device
              </div>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th className="bg-light text-center" style={{ width: '40px' }}></th>
                  <th className="bg-light text-center">Participant</th>
                  <th className="bg-light text-center">Error Count</th>
                  <th className="bg-light text-center">Extra Clicks</th>
                  <th className="bg-light text-center">Valid Trails</th>
                  <th className="bg-light text-center">Double Clicks</th>
                  <th className="bg-light text-center">Category</th>
                  <th className="bg-light text-center">Options</th>
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
                          className="btn btn-sm text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleParticipantDelete(deviceKey, participantKey, true);
                          }}
                          title="Delete participant"
                          style={{
                            border: 'none',
                            background: 'none',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ffe6e6';
                            e.target.style.borderRadius = '4px';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
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
        )}
      </div>
    </div>
  );
};

export default OutlierParticipantTable;
