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
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(trailKey)) {
      newExpandedRows.delete(trailKey);
    } else {
      newExpandedRows.add(trailKey);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">Error Trails</h6>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Trail Number</th>
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
                      <td colSpan="5" className="p-0">
                        <div className="bg-light p-3 border-top">
                          <h6 className="mb-3">
                            <i className="bi bi-list-ul text-primary me-2"></i>
                            Trail {trailKey} Details
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-striped table-hover">
                              <thead className="table-dark">
                                <tr>
                                  <th style={{ width: '120px' }}>
                                    <i className="bi bi-person me-1"></i>Participant
                                  </th>
                                  <th style={{ width: '80px' }}>
                                    <i className="bi bi-list-ol me-1"></i>Trail
                                  </th>
                                  <th style={{ width: '100px' }}>
                                    <i className="bi bi-calculator me-1"></i>ID (W/D)
                                  </th>
                                  <th style={{ width: '80px' }}>
                                    <i className="bi bi-play-circle me-1"></i>Action
                                  </th>
                                  <th style={{ width: '70px' }}>
                                    <i className="bi bi-cursor-fill me-1"></i>Dbl
                                  </th>
                                  <th style={{ width: '100px' }}>
                                    <i className="bi bi-geo me-1"></i>Coord
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
                                      {index === 0 && (
                                        <td rowSpan={trailRecords.length} className="table-info fw-bold align-middle">
                                          {participantKey}
                                        </td>
                                      )}
                                      {index === 0 && (
                                        <td rowSpan={trailRecords.length} className="align-middle">
                                          <span className="badge bg-secondary">
                                            {trailKey}
                                          </span>
                                        </td>
                                      )}
                                      {index === 0 && (
                                        <td rowSpan={trailRecords.length} className="align-middle">
                                          <div className="small">
                                            <strong>{difficulty}</strong>
                                          </div>
                                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            ({firstRecord?.width || '-'}/{firstRecord?.distance || '-'})
                                          </div>
                                        </td>
                                      )}
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
                                            <i className="bi bi-cursor-fill"></i>
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
                          <div className="mt-3">
                            <div className="row">
                              <div className="col-md-6">
                                <h6 className="text-muted">Action Legend:</h6>
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                  <span className="badge bg-primary">start</span>
                                  <span className="badge bg-success">target</span>
                                  <span className="badge bg-warning text-dark">others (extra clicks)</span>
                                </div>
                                <h6 className="text-muted">Double Click Legend:</h6>
                                <div className="d-flex flex-wrap gap-2">
                                  <span className="badge bg-warning text-dark"><i className="bi bi-cursor-fill me-1"></i>Dbl = Double Click</span>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="small text-muted">
                                  <strong>Difficulty (ID):</strong> Calculated using Fitts' Law: log₂(distance/width + 1)<br/>
                                  <strong>Coordinate Format:</strong> (x, y) pixels<br/>
                                  <strong>Timestamp Format:</strong> Raw timestamp (milliseconds)<br/>
                                  <strong>Dbl Column:</strong> Shows double-click events ('start-else' markers)<br/>
                                  <strong>Double Click Detection:</strong> Records marked as 'start-else' in trail data
                                </div>
                              </div>
                            </div>
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
