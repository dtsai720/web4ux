import React, { useState } from 'react';

const DetailRecordComponent = ({
  data,
  loading,
  error,
  summaryInfo,
  groupBy,
  groupByOptions,
  handleGroupByChange,
  expandedLevel1,
  toggleExpandLevel1,
  expandedLevel2,
  toggleExpandLevel2,
  expandedTrails,
  toggleExpandTrail,
  formatDateTime,
  toggleTrailDelete,
  toggleParticipantDelete,
  setCurrentPage
}) => {

  // Handle double click to go back to summary page
  const handleDoubleClick = () => {
    setCurrentPage('summary');
  };
  return (
    <>
      {/* 改良的分組選項 */}
      <div className="card mb-4 border-info">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="bi bi-diagram-3 me-2"></i>
            Data Organization
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            {Object.entries(groupByOptions).map(([key, option]) => (
              <div key={key} className="col-md-6 mb-3">
                <div
                  className={`card h-100 cursor-pointer border-2 ${groupBy === key ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                  onClick={() => handleGroupByChange(key)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div className="card-body text-center">
                    <div className="fs-2 mb-2">{option.icon}</div>
                    <h6 className={`card-title ${groupBy === key ? 'text-primary' : ''}`}>
                      {option.label}
                    </h6>
                    <p className="card-text text-muted small mb-2">
                      {option.description}
                    </p>
                    <div className={`badge ${groupBy === key ? 'bg-primary' : 'bg-secondary'}`}>
                      {option.structure}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <small className="text-muted">
              <i className="bi bi-lightbulb me-1"></i>
              Click on a card to change the data organization view
            </small>
          </div>
        </div>
      </div>

      {/* 載入狀態 */}
      {loading && (
        <div className="text-center mb-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2 text-muted">Loading detail data...</div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <div>{error}</div>
        </div>
      )}

      {/* 分組資料 */}
      {!loading && !error && (
        <div className="card border-success">
          <div
            className="card-header bg-success text-white"
            onDoubleClick={handleDoubleClick}
            style={{ cursor: 'pointer' }}
            title="Double-click to go back to summary"
          >
            <h5 className="mb-0">
              <i className="bi bi-table me-2"></i>
              Detail Records - {groupByOptions[groupBy].label}
            </h5>
            <small className="opacity-75">{groupByOptions[groupBy].structure}</small>
          </div>
          <div className="card-body">
            {Object.keys(data).length > 0 ? (
              <div className="accordion" id="detailAccordion">
                {/* 第一層 */}
                {Object.entries(data).map(([level1Key, level2Data]) => (
                  <div key={level1Key} className="accordion-item mb-3 border-2">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed fw-bold"
                        type="button"
                        onClick={() => toggleExpandLevel1(level1Key)}
                        aria-expanded={expandedLevel1[level1Key] || false}
                      >
                        <div className="d-flex align-items-center">
                          <span className="me-2">
                            {groupBy === 'by_device' ? '🖥️' : '👤'}
                          </span>
                          <span className="text-primary">{level1Key}</span>
                          <span className="badge bg-info ms-3">
                            {Object.keys(level2Data).filter(key => key !== 'stats').length} items
                          </span>
                          {level2Data.stats && (
                            <>
                              <span className="badge bg-danger ms-2">
                                <i className="bi bi-exclamation-circle me-1"></i>
                                {level2Data.stats.trailsWithErrors} errors
                              </span>
                              <span className="badge bg-success ms-2">
                                <i className="bi bi-check-circle me-1"></i>
                                {level2Data.stats.availableTrails}/{level2Data.stats.totalTrails} available
                              </span>
                              <span className="badge bg-info ms-2">
                                <i className="bi bi-clock me-1"></i>
                                Total: {level2Data.stats.totalEventTime}ms / Avg: {level2Data.stats.avgEventTime}ms
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    </h2>
                    {(expandedLevel1[level1Key] || false) && (
                      <div className="accordion-collapse collapse show">
                        <div className="accordion-body bg-light">

                          {/* 第二層 */}
                          <div className="accordion" id={`level2-${level1Key}`}>
                            {Object.entries(level2Data).map(([level2Key, trailsData]) => {
                              if (level2Key === 'stats') return null;

                              // 使用已計算好的統計數據
                              const stats = trailsData.stats || {
                                totalTrails: 0,
                                availableTrails: 0,
                                trailsWithErrors: 0,
                                avgEventTime: 0
                              };

                              return (
                                <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2 border">
                                  <h2 className="accordion-header">
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                      <button
                                        className="accordion-button collapsed flex-grow-1"
                                        type="button"
                                        onClick={() => toggleExpandLevel2(level1Key, level2Key)}
                                        aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
                                      >
                                        <div className="d-flex align-items-center flex-wrap">
                                          <span className="me-2">
                                            {groupBy === 'by_device' ? '👤' : '🖥️'}
                                          </span>
                                          <strong className="text-success me-3">{level2Key}</strong>
                                          <span className="badge bg-primary me-2">
                                            <i className="bi bi-signpost-split me-1"></i>
                                            {stats.totalTrails} trails
                                          </span>
                                          <span className="badge bg-danger me-2">
                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                            {stats.trailsWithErrors} with errors
                                          </span>
                                          <span className="badge bg-success me-2">
                                            <i className="bi bi-check-circle me-1"></i>
                                            {stats.availableTrails} available
                                          </span>
                                          <span className="badge bg-info me-2">
                                            <i className="bi bi-clock me-1"></i>
                                            Avg {stats.avgEventTime}ms
                                          </span>
                                          <span className="badge bg-secondary me-2">
                                            <i className="bi bi-clock-history me-1"></i>
                                            Total {stats.totalEventTime}ms
                                          </span>
                                        </div>
                                      </button>

                                    </div>
                                  </h2>
                                  {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
                                    <div className="accordion-collapse collapse show">
                                      <div className="accordion-body bg-white">

                                        {/* 第三層 - Trail 列表 */}
                                        <div className="row mb-3">
                                          <div className="col-12">
                                            <h6 className="border-bottom pb-2">
                                              <i className="bi bi-list-ul me-2"></i>
                                              Trails ({Object.keys(trailsData).length})
                                            </h6>

                                            {/* 顯示 Trails */}
                                            {Object.entries(trailsData).filter(([key]) => key !== 'stats').map(([trailKey, records]) => {
                                              const trailStats = records.stats || {};
                                              const combinedKey = `${level1Key}-${level2Key}-${trailKey}`;
                                              const isExpanded = expandedTrails[combinedKey] || false;

                                              return (
                                                <div key={combinedKey} className="card mb-2 border-start border-4 border-primary">
                                                  <div className="card-body py-2">
                                                    <div className="row align-items-center">
                                                      <div className="col-md-8">
                                                        <div
                                                          className="d-flex align-items-center flex-wrap"
                                                          style={{ cursor: 'pointer' }}
                                                          onClick={() => toggleExpandTrail(level1Key, level2Key, trailKey)}
                                                        >
                                                          <span className="me-2">
                                                            <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                                                          </span>
                                                          <strong className="me-3">Trail {trailKey}</strong>
                                                          <span className="me-3">
                                                            <i className="bi bi-exclamation-circle text-warning me-1"></i>
                                                            <strong>Errors:</strong> {trailStats.error_time || 0}
                                                          </span>
                                                          <span className="me-3">
                                                            <i className="bi bi-clock text-info me-1"></i>
                                                            <strong>Event Time:</strong> {trailStats.event_time || 0}ms
                                                          </span>
                                                          <span className={`badge me-2 ${trailStats.available ? 'bg-success' : 'bg-secondary'}`}>
                                                            <i className={`bi ${trailStats.available ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                                            {trailStats.available ? 'Available' : 'Unavailable'}
                                                          </span>
                                                        </div>
                                                      </div>
                                                      <div className="col-md-4 text-end">
                                                        {/* Delete button removed */}
                                                      </div>
                                                    </div>

                                                    {/* 展開後顯示 Trail 內的記錄 */}
                                                    {isExpanded && (
                                                      <div className="mt-3 border-top pt-3">
                                                        <h6 className="text-muted mb-3">Records in Trail {trailKey}</h6>
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
                                                              {records.map((record, idx) => (
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
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <h5 className="mt-3">No Detail Records Found</h5>
                <p className="text-muted">This summary has no associated detail records</p>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
};

export default DetailRecordComponent;
