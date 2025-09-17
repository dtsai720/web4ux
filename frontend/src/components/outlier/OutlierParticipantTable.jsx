import React, { useState, useEffect } from 'react';
import OutlierTrailTable from './OutlierTrailTable';

const OutlierParticipantTable = ({
  participants,
  deviceStats,
  onToggleParticipantDelete,
  deviceKey,
  data
}) => {
  const [showOutliersOnly, setShowOutliersOnly] = useState(false);
  const [showDoubleClickOnly, setShowDoubleClickOnly] = useState(false);
  const [expandedParticipants, setExpandedParticipants] = useState(new Set());

  // Auto-collapse expanded participants when filter changes
  useEffect(() => {
    setExpandedParticipants(new Set());
  }, [showOutliersOnly, showDoubleClickOnly]);

  const toggleParticipantExpansion = (participantKey) => {
    const newExpandedParticipants = new Set();
    if (!expandedParticipants.has(participantKey)) {
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
            <h6 className="mb-1">Participants</h6>
            <small className="text-muted d-block mb-2">Participant details and outlier status - Click badges to filter</small>
            <div className="d-flex flex-wrap gap-2">
              <span
                className={`badge ${!showOutliersOnly && !showDoubleClickOnly ? 'bg-primary text-white' : 'bg-light text-dark border'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShowOutliersOnly(false);
                  setShowDoubleClickOnly(false);
                }}
                title="Show all participants"
              >
                <i className="bi bi-people me-1"></i>
                {Object.keys(participants || {}).length} Total
                {!showOutliersOnly && !showDoubleClickOnly && <i className="bi bi-check-circle ms-1"></i>}
              </span>
              <span
                className={`badge ${showOutliersOnly ? 'bg-danger text-white' : 'bg-light text-danger border'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShowOutliersOnly(!showOutliersOnly);
                  setShowDoubleClickOnly(false);
                }}
                title="Filter outlier participants only"
              >
                <i className="bi bi-exclamation-triangle me-1"></i>
                {Object.values(participants || {}).filter(p => p.isOutlier).length} Outliers
                {showOutliersOnly && <i className="bi bi-check-circle ms-1"></i>}
              </span>
              <span
                className={`badge ${showDoubleClickOnly ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}
                style={{ cursor: 'pointer', color: showDoubleClickOnly ? '' : '#b8860b' }}
                onClick={() => {
                  setShowDoubleClickOnly(!showDoubleClickOnly);
                  setShowOutliersOnly(false);
                }}
                title="Filter participants with double clicks only"
              >
                <i className="bi bi-cursor-fill me-1"></i>
                {Object.values(participants || {}).filter(p => p.doubleClickCount > 0).length} With Double Clicks
                {showDoubleClickOnly && <i className="bi bi-check-circle ms-1"></i>}
              </span>
            </div>
          </div>
          <div className="text-end">
            <div className="card border-primary bg-light" style={{ minWidth: '200px' }}>
              <div className="card-body py-2 px-3">
                <h6 className="card-title text-primary mb-2 text-center">
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
              <thead className="table-secondary">
                <tr>
                  <th className="text-center" style={{ width: '40px' }}></th>
                  <th className="text-center">Participant</th>
                  <th className="text-center">Error Count</th>
                  <th className="text-center">Extra Clicks</th>
                  <th className="text-center">Valid Trails</th>
                  <th className="text-center">Double Clicks</th>
                  <th className="text-center">Category</th>
                  <th className="text-center">Options</th>
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
