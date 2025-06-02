import React, { useState, useEffect } from 'react';

// SummaryPage 組件
const SummaryPage = ({ setCurrentPage, setSelectedSummaryId }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 搜尋和排序狀態
  const [searchName, setSearchName] = useState('');
  const [searchCreator, setSearchCreator] = useState('');
  const [orderBy, setOrderBy] = useState('name'); // name, creator, updatedAt
  const [orderDirection, setOrderDirection] = useState('asc'); // asc, desc

  // 分頁狀態
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // 載入資料
  const loadSummaries = async () => {
    setLoading(true);
    setError('');

    try {
      const offset = (currentPageNum - 1) * itemsPerPage;
      const order = `${orderBy}_${orderDirection}`;

      // 使用 mock data 進行測試
      // const result = await window.go.main.App.get_summary(
      //   searchName,
      //   searchCreator,
      //   order,
      //   offset,
      //   itemsPerPage
      // );

      // Mock data for testing
      const result = {
        data: [
          {id: '111', name: '222', creator: '333', updatedAt: '2025-06-25T00:00:00Z'},
          {id: '112', name: 'Test Data', creator: 'User A', updatedAt: '2025-06-24T10:30:00Z'},
          {id: '113', name: 'Sample', creator: 'User B', updatedAt: '2025-06-23T15:45:00Z'}
        ],
        total: 3
      };

      setSummaries(result.data || []);
      setTotalItems(result.total || 0);
    } catch (err) {
      setError('Failed to load summaries: ' + err.message);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始載入和依賴更新時重新載入
  useEffect(() => {
    loadSummaries();
  }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum]);

  // 重置搜尋
  const handleReset = () => {
    setSearchName('');
    setSearchCreator('');
    setOrderBy('name');
    setOrderDirection('asc');
    setCurrentPageNum(1);
  };

  // 處理排序
  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrderDirection('asc');
    }
    setCurrentPageNum(1); // 重置到第一頁
  };

  // 處理分頁
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPageNum(page);
  };

  // 處理點擊項目
  const handleItemClick = (summaryId) => {
    setSelectedSummaryId(summaryId);
    setCurrentPage('detail');
  };

  // 渲染排序箭頭
  const getSortIcon = (field) => {
    if (orderBy !== field) return '';
    return orderDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Data Summary</h2>

          {/* 搜尋區域 */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Search & Filter</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Search by Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Search by Creator</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter creator..."
                    value={searchCreator}
                    onChange={(e) => setSearchCreator(e.target.value)}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 載入狀態 */}
          {loading && (
            <div className="text-center mb-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* 資料表格 */}
          {!loading && !error && (
            <>
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Results ({totalItems} items)</h5>
                </div>
                <div className="card-body p-0">
                  {summaries.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th
                              scope="col"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSort('name')}
                            >
                              Name{getSortIcon('name')}
                            </th>
                            <th
                              scope="col"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSort('creator')}
                            >
                              Creator{getSortIcon('creator')}
                            </th>
                            <th
                              scope="col"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSort('updatedAt')}
                            >
                              Updated At{getSortIcon('updatedAt')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaries.map((summary) => (
                            <tr
                              key={summary.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleItemClick(summary.id)}
                            >
                              <td>{summary.name}</td>
                              <td>{summary.creator}</td>
                              <td>{new Date(summary.updatedAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <h5>No Data Found</h5>
                      <p className="text-muted">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 分頁 */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPageNum === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPageNum - 1)}
                        disabled={currentPageNum === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {/* 頁碼按鈕 */}
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // 只顯示當前頁面附近的頁碼
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPageNum - 2 && page <= currentPageNum + 2)
                      ) {
                        return (
                          <li key={page} className={`page-item ${currentPageNum === page ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      } else if (page === currentPageNum - 3 || page === currentPageNum + 3) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    })}

                    <li className={`page-item ${currentPageNum === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPageNum + 1)}
                        disabled={currentPageNum === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}

          {/* 返回按鈕 */}
          <div className="text-center mt-4">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage('home')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// DetailPage 組件
const DetailPage = ({ selectedSummaryId, setCurrentPage }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryInfo, setSummaryInfo] = useState(null);

  // 載入詳細資料
  const loadDetails = async () => {
    if (!selectedSummaryId) {
      setError('No summary ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 使用 mock data 進行測試
      // const result = await window.go.main.App.get_detail(selectedSummaryId);

      // Mock data for testing
      const result = {
        summary: {
          id: selectedSummaryId,
          name: 'Test Summary',
          creator: 'Test Creator',
          updatedAt: '2025-06-25T00:00:00Z'
        },
        details: [
          {device: 'Device A', participant: 'Participant 1', trail: 1, is_error: false, is_available: true, deleted: false},
          {device: 'Device B', participant: 'Participant 2', trail: 2, is_error: true, is_available: false, deleted: false},
          {device: 'Device C', participant: 'Participant 3', trail: 3, is_error: false, is_available: true, deleted: true}
        ]
      };

      setDetails(result.details || []);
      setSummaryInfo(result.summary || null);
    } catch (err) {
      setError('Failed to load details: ' + err.message);
      setDetails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [selectedSummaryId]);

  // 統計資訊
  const stats = {
    total: details.length,
    errors: details.filter(d => d.is_error).length,
    available: details.filter(d => d.is_available).length,
    deleted: details.filter(d => d.deleted).length
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Detail View</h2>
            <div>
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setCurrentPage('summary')}
              >
                Back to Summary
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage('home')}
              >
                Home
              </button>
            </div>
          </div>

          {/* 摘要資訊 */}
          {summaryInfo && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Summary Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <strong>Name:</strong> {summaryInfo.name}
                  </div>
                  <div className="col-md-4">
                    <strong>Creator:</strong> {summaryInfo.creator}
                  </div>
                  <div className="col-md-4">
                    <strong>Updated:</strong> {new Date(summaryInfo.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 統計卡片 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h3>{stats.total}</h3>
                  <p className="mb-0">Total Items</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h3>{stats.available}</h3>
                  <p className="mb-0">Available</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <h3>{stats.errors}</h3>
                  <p className="mb-0">Errors</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <h3>{stats.deleted}</h3>
                  <p className="mb-0">Deleted</p>
                </div>
              </div>
            </div>
          </div>

          {/* 載入狀態 */}
          {loading && (
            <div className="text-center mb-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* 詳細資料表格 */}
          {!loading && !error && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Detail Records</h5>
              </div>
              <div className="card-body p-0">
                {details.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th scope="col">Device</th>
                          <th scope="col">Participant</th>
                          <th scope="col">Trail</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((detail, index) => (
                          <tr key={index}>
                            <td>{detail.device}</td>
                            <td>{detail.participant}</td>
                            <td>{detail.trail}</td>
                            <td>
                              <div>
                                {detail.is_error && (
                                  <span className="badge bg-danger me-1">Error</span>
                                )}
                                {detail.is_available && (
                                  <span className="badge bg-success me-1">Available</span>
                                )}
                                {detail.deleted && (
                                  <span className="badge bg-warning me-1">Deleted</span>
                                )}
                                {!detail.is_error && !detail.is_available && !detail.deleted && (
                                  <span className="badge bg-secondary">Normal</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <h5>No Detail Records Found</h5>
                    <p className="text-muted">This summary has no associated detail records</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { SummaryPage, DetailPage };
