import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// import { SummaryPage } from './Summary';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);

  // Mock API calls - 在實際應用中會替換為 Wails 的 Go 函數調用
  const mockLogin = async (email, password) => {
    setLoading(true);
    setProgress(0);

    // 模擬登入和同步過程
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsLoggedIn(true);
    setSyncData({
      totalRecords: 1250,
      lastSync: new Date().toISOString(),
      categories: ['Documents', 'Images', 'Settings'],
      status: 'success'
    });
    setLoading(false);
    setProgress(100);
  };

  const mockGetSummaryData = () => {
    // 模擬從 Go 後端獲取 JSON 數據
    return syncData ? {
      summary: {
        totalItems: 1250,
        categories: [
          { name: 'Documents', count: 800 },
          { name: 'Images', count: 350 },
          { name: 'Settings', count: 100 }
        ],
        lastUpdate: syncData.lastSync,
        syncStatus: 'Synchronized'
      }
    } : null;
  };

  const HomePage = () => (
    <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-4">Welcome to My App</h1>
      </div>

      <div className="row w-100 justify-content-center" style={{ maxWidth: '80%' }}>
        <div className="col-md-4 mb-3">
          <button
            className="btn btn-primary btn-lg w-100 py-3 shadow-sm"
            onClick={() => setCurrentPage('sync')}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Sync
          </button>
        </div>
        <div className="col-md-4 mb-3">
          <button
            className="btn btn-success btn-lg w-100 py-3 shadow-sm"
            onClick={() => setCurrentPage('summary')}
          >
            <i className="bi bi-bar-chart me-2"></i>
            Summary
          </button>
        </div>
        <div className="col-md-4 mb-3">
          <button
            className="btn btn-info btn-lg w-100 py-3 shadow-sm"
            onClick={() => setCurrentPage('guide')}
          >
            <i className="bi bi-book me-2"></i>
            Guide
          </button>
        </div>
      </div>
    </div>
  );

  const SyncPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
      if (email && password) {
        await mockLogin(email, password);
      }
    };

    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Data Synchronization</h3>
              </div>
              <div className="card-body">
                {!isLoggedIn ? (
                  <div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleLogin}
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? 'Syncing...' : 'Login & Sync'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="alert alert-success">
                      <h5>Sync Completed!</h5>
                      <p>Successfully synchronized {syncData?.totalRecords} records</p>
                      <small>Last sync: {new Date(syncData?.lastSync).toLocaleString()}</small>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="mt-3">
                    <div className="progress">
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                      >
                        {progress}%
                      </div>
                    </div>
                    <p className="text-center mt-2">Synchronizing data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage('home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  };

  const GuidePage = () => {
    const [activeAccordion, setActiveAccordion] = useState('sync-guide');

    const toggleAccordion = (id) => {
      setActiveAccordion(activeAccordion === id ? '' : id);
    };

    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <h2 className="mb-4">User Guide</h2>

            <div className="accordion" id="guideAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${activeAccordion !== 'sync-guide' ? 'collapsed' : ''}`}
                    type="button"
                    onClick={() => toggleAccordion('sync-guide')}
                    style={{ cursor: 'pointer' }}
                  >
                    How to Use Sync Function
                  </button>
                </h2>
                <div
                  className="accordion-collapse collapse"
                  style={{
                    display: activeAccordion === 'sync-guide' ? 'block' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="accordion-body">
                    <ol>
                      <li>Click the "Sync" button on the homepage</li>
                      <li>Enter your Email and Password</li>
                      <li>Click "Login & Sync" button</li>
                      <li>Wait for sync progress to complete</li>
                      <li>Once sync is complete, you can view data in the Summary page</li>
                    </ol>
                    <div className="alert alert-info">
                      <strong>Note:</strong> The sync process may take several minutes. Please maintain a stable internet connection.
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${activeAccordion !== 'summary-guide' ? 'collapsed' : ''}`}
                    type="button"
                    onClick={() => toggleAccordion('summary-guide')}
                    style={{ cursor: 'pointer' }}
                  >
                    How to View Data Summary
                  </button>
                </h2>
                <div
                  className="accordion-collapse collapse"
                  style={{
                    display: activeAccordion === 'summary-guide' ? 'block' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="accordion-body">
                    <p>The Summary page displays the following information:</p>
                    <ul>
                      <li><strong>Total Items:</strong> Total number of synchronized records</li>
                      <li><strong>Category Statistics:</strong> Data distribution by categories</li>
                      <li><strong>Sync Status:</strong> Current synchronization status</li>
                      <li><strong>Last Updated:</strong> Time of last data synchronization</li>
                    </ul>
                    <div className="alert alert-warning">
                      <strong>Reminder:</strong> If no sync has been performed, the Summary page will prompt you to sync first.
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${activeAccordion !== 'troubleshooting' ? 'collapsed' : ''}`}
                    type="button"
                    onClick={() => toggleAccordion('troubleshooting')}
                    style={{ cursor: 'pointer' }}
                  >
                    Frequently Asked Questions
                  </button>
                </h2>
                <div
                  className="accordion-collapse collapse"
                  style={{
                    display: activeAccordion === 'troubleshooting' ? 'block' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="accordion-body">
                    <h6>Q: What to do if sync fails?</h6>
                    <p>A: Please check your network connection and verify your credentials, then try syncing again.</p>

                    <h6>Q: How often should I sync data?</h6>
                    <p>A: Data needs to be manually synchronized. We recommend regular syncing to ensure data is up-to-date.</p>

                    <h6>Q: Can I use the app offline?</h6>
                    <p>A: After syncing, data is stored locally and you can view summary data offline.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage('home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  };

  const SummaryPage = () => {
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

  const DetailPage = () => {
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'sync':
        return <SyncPage />;
      case 'summary':
        return <SummaryPage />;
      case 'guide':
        return <GuidePage />;
      case 'detail':
        return <DetailPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
};

export default App;
