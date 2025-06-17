import React from 'react';

const OutlierAnalysisComponent = ({
  outlierData,
  selectedOutlierDevice,
  selectedOutlierParticipant,
  selectedOutlierTrail,
  handleSelectOutlierDevice,
  handleSelectOutlierParticipant,
  handleSelectOutlierTrail,
  closeOutlierMode,
  data,
  formatDateTime,
  toggleTrailDelete,
  toggleParticipantDelete
}) => {
  return (
    <div className="card mb-4 border-info">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Outlier Analysis
        </h5>
      </div>
      <div className="card-body">
        {selectedOutlierDevice ? (
          <div>
            <div className="d-flex align-items-center mb-3">
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={() => handleSelectOutlierDevice(null)}
              >
                <i className="bi bi-arrow-left"></i> Back to Devices
              </button>
              <h5 className="mb-0">Device: {selectedOutlierDevice}</h5>
            </div>

            {selectedOutlierParticipant ? (
              <div>
                <div className="d-flex align-items-center mb-3">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleSelectOutlierParticipant(null)}
                  >
                    <i className="bi bi-arrow-left"></i> Back to Participants
                  </button>
                  <h6 className="mb-0">Participant: {selectedOutlierParticipant}</h6>
                </div>

                {selectedOutlierTrail ? (
                  <div>
                    <div className="d-flex align-items-center mb-3">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleSelectOutlierTrail(null)}
                      >
                        <i className="bi bi-arrow-left"></i> Back to Trails
                      </button>
                      <h6 className="mb-0">Trail: {selectedOutlierTrail}</h6>
                    </div>

                    {/* Trail Details */}
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Trail Details</h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-sm table-striped">
                            <thead className="table-dark">
                              <tr>
                                <th><i className="bi bi-tag me-1"></i>Mark</th>
                                <th><i className="bi bi-calendar me-1"></i>DateTime</th>
                                <th><i className="bi bi-clock me-1"></i>Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data[selectedOutlierDevice]?.[selectedOutlierParticipant]?.[selectedOutlierTrail]?.map((record, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <span className={`badge ${record.mark === 'start' ? 'bg-primary' : record.mark === 'target' ? 'bg-success' : 'bg-secondary'}`}>
                                      {record.mark}
                                    </span>
                                  </td>
                                  <td>
                                    <small>{formatDateTime(record.timestamp)}</small>
                                  </td>
                                  <td>
                                    <small>{record.timestamp}</small>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h6 className="border-bottom pb-2 mb-3">Error Trails</h6>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Trail</th>
                            <th>Error Time</th>
                            <th>Event Time</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outlierData[selectedOutlierDevice]?.participants[selectedOutlierParticipant]?.errorTrails?.map(trailKey => (
                            <tr key={trailKey}>
                              <td>Trail {trailKey}</td>
                              <td>{data[selectedOutlierDevice]?.[selectedOutlierParticipant]?.[trailKey]?.stats?.error_time || 0}</td>
                              <td>{data[selectedOutlierDevice]?.[selectedOutlierParticipant]?.[trailKey]?.stats?.event_time || 0}ms</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary me-2"
                                  onClick={() => handleSelectOutlierTrail(trailKey)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => toggleTrailDelete(selectedOutlierDevice, selectedOutlierParticipant, trailKey, true)}
                                >
                                  <i className="bi bi-trash me-1"></i> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Device Statistics</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted">Avg Error Count</h6>
                            <h4>{outlierData[selectedOutlierDevice]?.stats?.avgErrorCount?.toFixed(2) || '0.00'}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted">StdDev Error Count</h6>
                            <h4>{outlierData[selectedOutlierDevice]?.stats?.stdDevErrorCount?.toFixed(2) || '0.00'}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted">Avg Error Time</h6>
                            <h4>{outlierData[selectedOutlierDevice]?.stats?.avgErrorTime?.toFixed(2) || '0.00'}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted">StdDev Error Time</h6>
                            <h4>{outlierData[selectedOutlierDevice]?.stats?.stdDevErrorTime?.toFixed(2) || '0.00'}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                      {Object.entries(outlierData[selectedOutlierDevice]?.participants || {}).map(([participantKey, participantData]) => (
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
                                onClick={() => handleSelectOutlierParticipant(participantKey)}
                              >
                                <i className="bi bi-eye me-1"></i> View
                              </button>
                              {participantData.isOutlier && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => toggleParticipantDelete(selectedOutlierDevice, participantKey, true)}
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
            )}
          </div>
        ) : (
          <div>
            <h6 className="border-bottom pb-2 mb-3">Select a Device to Analyze</h6>
            <div className="row">
              {Object.keys(outlierData).map(deviceKey => (
                <div key={deviceKey} className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{deviceKey}</h5>
                      <p className="card-text">
                        <small className="text-muted">
                          <i className="bi bi-people me-1"></i>
                          {Object.keys(outlierData[deviceKey]?.participants || {}).length} participants
                        </small>
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {Object.values(outlierData[deviceKey]?.participants || {}).filter(p => p?.isOutlier).length} outliers detected
                        </small>
                      </p>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSelectOutlierDevice(deviceKey)}
                      >
                        <i className="bi bi-graph-up me-1"></i> Analyze
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlierAnalysisComponent;
