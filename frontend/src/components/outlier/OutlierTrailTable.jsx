import React, { useState, Fragment } from 'react';
import { trailHasDoubleClick, detectDoubleClicks } from '../../utils/outlier/outlierUtils';
import { calculateDifficulty } from '../../utils/detail/moveTimeUtils';

const OutlierTrailTable = ({
  errorTrails,
  data,
  deviceKey,
  participantKey
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (trailKey) => {
    const newExpandedRows = new Set();
    if (!expandedRows.has(trailKey)) {
      newExpandedRows.add(trailKey);
    }
    setExpandedRows(newExpandedRows);
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
              <th style={{ width: '40px' }}></th>
              <th>Trail Number</th>
              <th>ID (W/D)</th>
              <th>Extra Clicks</th>
              <th>Event Time</th>
              <th>Double Click</th>
            </tr>
          </thead>
          <tbody>
            {errorTrails?.map(trailKey => {
              const trailRecords = data[deviceKey]?.[participantKey]?.[trailKey];
              const trailStats = data[deviceKey]?.[participantKey]?.[trailKey]?.stats;
              const hasDoubleClick = Array.isArray(trailRecords) ? trailHasDoubleClick(trailRecords) : false;
              const isExpanded = expandedRows.has(trailKey);
              const hasError = trailStats?.has_error || false;

              return (
                <React.Fragment key={trailKey}>
                  <tr
                    className="cursor-pointer"
                    onClick={() => toggleRowExpansion(trailKey)}
                    style={{ cursor: 'pointer' }}
                    title={isExpanded ? "Click to collapse details" : "Click to expand details"}
                  >
                    <td>
                      <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </td>
                    <td>{trailKey}</td>
                    <td>
                      {(() => {
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
                      })()}
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
                                  <th style={{ width: '80px' }}>
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
                                {Array.isArray(trailRecords) && (() => {
                                  // Calculate difficulty from the first record (which should have width/distance)
                                  const firstRecord = trailRecords[0];
                                  const difficulty = firstRecord?.width && firstRecord?.distance ?
                                    calculateDifficulty(firstRecord.distance, firstRecord.width) : '-';

                                  // No need for complex double click detection - we check mark field directly

                                  return trailRecords.map((record, index) => (
                                    <tr key={index}>
                                      <td>
                                        <span className={`badge ${
                                          record.mark === 'start' ? 'bg-primary' :
                                          record.mark === 'target' ? 'bg-success' :
                                          'bg-warning text-dark'
                                        }`}>
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
                                        <small className="font-monospace">
                                          {record.timestamp}
                                        </small>
                                      </td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
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
  );
};

export default OutlierTrailTable;
