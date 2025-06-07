import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginAndSync, ListProjects, DeleteOrRestore, GetProjectDetail, StartSync, CancelSync, GetSyncStatus } from '../wailsjs/go/pkg/App';
import { EventsOn, EventsOff } from '../wailsjs/runtime/runtime';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [syncData, setSyncData] = useState(null);
  // const [loading, setLoading] = useState(false);
  // const [progress, setProgress] = useState(0);
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);
  // const [syncing, setSyncing] = useState(false);

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
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState({
      currentProject: '',
      currentIndex: 0,
      progress: 0,
      totalProjects: 0,
      isCompleted: false,
      isCancelled: false
    });
    const [loginError, setLoginError] = useState('');
    const [syncData, setSyncData] = useState(null);

    useEffect(() => {
      // 監聽同步進度事件
      EventsOn('sync:progress', (progress) => {
        console.log('Received sync progress:', progress);
        setSyncProgress(progress);

        if (progress.isCompleted) {
          setIsSyncing(false);
          setSyncData({
            totalRecords: progress.totalProjects,
            lastSync: new Date().toISOString()
          });
        } else if (progress.isCancelled) {
          setIsSyncing(false);
        }
      });

      // 檢查同步狀態
      checkSyncStatus();

      // 清理函數
      return () => {
        EventsOff('sync:progress');
      };
    }, []);

    const checkSyncStatus = async () => {
      try {
        const status = await GetSyncStatus();
        setIsSyncing(status.isSyncing);
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    };

    const handleLogin = async () => {
      if (email && password) {
        setLoading(true);
        setLoginError('');

        try {
          const response = await LoginAndSync(email, password);
          if (response.success) {
            setIsLoggedIn(true);
            // 登入成功後立即開始同步
            handleStartSync();
          } else {
            setLoginError(response.message);
          }
        } catch (error) {
          console.error("Login failed:", error);
          setLoginError('Login failed. Please check your credentials.');
        }

        setLoading(false);
      }
    };

    const handleStartSync = async () => {
      try {
        setIsSyncing(true);
        setSyncProgress({
          currentProject: '',
          progress: 0,
          totalProjects: 5,
          isCompleted: false,
          isCancelled: false
        });
        await StartSync();
      } catch (error) {
        console.error("Failed to start sync:", error);
        setIsSyncing(false);
      }
    };

    const handleCancelSync = async () => {
      try {
        await CancelSync();
        setIsSyncing(false);
        setSyncProgress(prev => ({
          ...prev,
          isCancelled: true
        }));
      } catch (error) {
        console.error("Failed to cancel sync:", error);
      }
    };

    const resetSync = () => {
      setIsLoggedIn(false);
      setIsSyncing(false);
      setSyncData(null);
      setSyncProgress({
        currentProject: '',
        progress: 0,
        totalProjects: 0,
        isCompleted: false,
        isCancelled: false
      });
      setEmail('');
      setPassword('');
      setLoginError('');
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
                        placeholder="admin@example.com"
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
                        placeholder="password123"
                      />
                    </div>

                    {loginError && (
                      <div className="alert alert-danger" role="alert">
                        {loginError}
                      </div>
                    )}

                    <button
                      onClick={handleLogin}
                      className="btn btn-primary w-100"
                      disabled={loading || !email || !password}
                    >
                      {loading ? 'Logging in...' : 'Login & Start Sync'}
                    </button>
                  </div>
                ) : (
                  <div>
                    {syncProgress.isCompleted && !isSyncing ? (
                      <div className="text-center">
                        <div className="alert alert-success">
                          <h5>✅ Sync Completed!</h5>
                          <p>Successfully synchronized {syncData?.totalRecords} projects</p>
                          <small>Last sync: {new Date(syncData?.lastSync).toLocaleString()}</small>
                        </div>
                        <button
                          onClick={resetSync}
                          className="btn btn-info me-2"
                        >
                          Start New Sync
                        </button>
                      </div>
                    ) : syncProgress.isCancelled ? (
                      <div className="text-center">
                        <div className="alert alert-warning">
                          <h5>⚠️ Sync Cancelled</h5>
                          <p>Synchronization was cancelled during: <strong>{syncProgress.currentProject}</strong></p>
                        </div>
                        <button
                          onClick={handleStartSync}
                          className="btn btn-primary me-2"
                        >
                          Restart Sync
                        </button>
                        <button
                          onClick={resetSync}
                          className="btn btn-secondary"
                        >
                          New Login
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="alert alert-info">
                          <h5>📊 Synchronization in Progress</h5>
                          {syncProgress.currentProject && (
                            <p className="mb-2">
                              Currently syncing: <strong>{syncProgress.currentProject}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isSyncing && (
                  <div className="mt-3">
                    <div className="progress mb-3">
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                        role="progressbar"
                        style={{ width: `${syncProgress.progress}%` }}
                      >
                        {syncProgress.progress}%
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="mb-2">
                        <strong>Status:</strong> {syncProgress.currentProject || 'Initializing...'}
                      </p>
                      <p className="text-muted small mb-3">
                        Progress: {syncProgress.progress}% ({Math.floor(syncProgress.currentIndex? syncProgress.currentIndex: 0)}/{syncProgress.totalProjects} projects)
                      </p>

                      <button
                        onClick={handleCancelSync}
                        className="btn btn-danger btn-sm"
                      >
                        🛑 Cancel Sync
                      </button>
                    </div>
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
            disabled={isSyncing}
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

  const get_summary = async (name = '', creator = '', orderBy = 'updatedAt') => {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 800));

    // 模擬數據
    const mockData = [
      { id: 1, name: 'Q1 Sales Report', creator: 'John Doe', updatedAt: '2024-03-15T10:30:00Z' },
      { id: 2, name: 'Marketing Analysis', creator: 'Jane Smith', updatedAt: '2024-03-14T14:20:00Z' },
      { id: 3, name: 'Product Roadmap', creator: 'Mike Johnson', updatedAt: '2024-03-13T09:15:00Z' },
      { id: 4, name: 'Customer Feedback', creator: 'Sarah Wilson', updatedAt: '2024-03-12T16:45:00Z' },
      { id: 5, name: 'Budget Planning', creator: 'David Brown', updatedAt: '2024-03-11T11:30:00Z' },
      { id: 6, name: 'Team Performance', creator: 'Lisa Garcia', updatedAt: '2024-03-10T13:20:00Z' },
      { id: 7, name: 'Market Research', creator: 'Tom Anderson', updatedAt: '2024-03-09T08:45:00Z' },
      { id: 8, name: 'Risk Assessment', creator: 'Emma Davis', updatedAt: '2024-03-08T15:30:00Z' },
    ];

    // 模擬搜索過濾
    let filteredData = mockData.filter(item => {
      const matchName = name ? item.name.toLowerCase().includes(name.toLowerCase()) : true;
      const matchCreator = creator ? item.creator.toLowerCase().includes(creator.toLowerCase()) : true;
      return matchName && matchCreator;
    });

    // 模擬排序
    filteredData.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return {
      data: filteredData,
      total: filteredData.length
    };
  };

  const SummaryPage = () => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 搜尋和排序狀態
    const [searchName, setSearchName] = useState('');
    const [searchCreator, setSearchCreator] = useState('');
    const [orderBy, setOrderBy] = useState('updatedAt');
    const [orderDirection, setOrderDirection] = useState('desc');

    // 分頁狀態
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 6; // 減少每頁顯示數量以便演示

    // 載入資料的函數
    const loadSummaries = useCallback(async () => {
      setLoading(true);
      setError('');

      try {
        // 調用 get_summary 函數，傳入三個參數
        const result = await get_summary(searchName, searchCreator, orderBy);

        let sortedData = [...result.data];

        // 根據排序方向調整數據
        if (orderDirection === 'desc') {
          sortedData.reverse();
        }

        // 計算分頁
        const startIndex = (currentPageNum - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = sortedData.slice(startIndex, endIndex);

        setSummaries(paginatedData);
        setTotalItems(sortedData.length);
      } catch (err) {
        setError('Failed to load summaries: ' + err.message);
        setSummaries([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum]);

    // 初始載入和依賴更新時重新載入
    useEffect(() => {
      loadSummaries();
    }, [loadSummaries]);

    // 重置搜尋
    const handleReset = () => {
      setSearchName('');
      setSearchCreator('');
      setOrderBy('updatedAt');
      setOrderDirection('desc');
      setCurrentPageNum(1);
    };

    // 處理排序
    const handleSort = (field) => {
      if (orderBy === field) {
        setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setOrderBy(field);
        setOrderDirection('desc'); // 預設降序
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
      alert(`Clicked summary ID: ${summaryId}`);
      setSelectedSummaryId(summaryId);
      setCurrentPage('detail');
    };

    // 渲染排序圖標
    const getSortIcon = (field) => {
      if (orderBy !== field) {
        return <span className="text-muted ms-1">⇅</span>;
      }
      return orderDirection === 'asc' ?
        <span className="text-primary ms-1">↑</span> :
        <span className="text-primary ms-1">↓</span>;
    };

    // 格式化日期
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="container">
          {/* 標題區域 */}
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="display-6 fw-bold text-dark mb-2">Data Summary</h1>
              <p className="text-muted">Search, filter and manage your data summaries</p>
            </div>
          </div>

          {/* 搜尋和篩選區域 */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <span className="me-2">🔍</span>
                Search & Filter
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Search by Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Search by Creator</label>
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
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                  >
                    <span className="me-1">🔄</span>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 載入狀態 */}
          {loading && (
            <div className="text-center mb-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading summaries...</p>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <span className="me-2">❌</span>
              <div>{error}</div>
            </div>
          )}

          {/* 資料表格 */}
          {!loading && !error && (
            <>
              <div className="card shadow-sm">
                {/* 表格標題和計數 */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Results ({totalItems} items)</h5>
                </div>

                <div className="card-body p-0">
                  {summaries.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th
                              scope="col"
                              className="user-select-none"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSort('name')}
                            >
                              <div className="d-flex align-items-center">
                                Name
                                {getSortIcon('name')}
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="user-select-none"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSort('creator')}
                            >
                              <div className="d-flex align-items-center">
                                Creator
                                {getSortIcon('creator')}
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="user-select-none"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSort('updatedAt')}
                            >
                              <div className="d-flex align-items-center">
                                Updated At
                                {getSortIcon('updatedAt')}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaries.map((summary) => (
                            <tr
                              key={summary.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleItemClick(summary.id)}
                              className="table-row-hover"
                            >
                              <td>
                                <strong>{summary.name}</strong>
                              </td>
                              <td className="text-muted">
                                {summary.creator}
                              </td>
                              <td className="text-muted">
                                <small>{formatDate(summary.updatedAt)}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-3" style={{ fontSize: '3rem' }}>🔍</div>
                      <h5 className="text-muted">No Data Found</h5>
                      <p className="text-muted">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 分頁控制 */}
              {totalPages > 1 && (
                <nav className="mt-4" aria-label="Page navigation">
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
              className="btn btn-secondary btn-lg"
              onClick={() => setCurrentPage('home')}
            >
              <span className="me-2">🏠</span>
              Back to Home
            </button>
          </div>
        </div>

        {/* 自定義 CSS */}
        <style jsx>{`
        .table-row-hover:hover {
          background-color: #f8f9fa !important;
        }
        .user-select-none {
          user-select: none;
        }
      `}</style>
      </div>
    );
  };



  const DetailPage = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [summaryInfo, setSummaryInfo] = useState(null);
    const [groupBy, setGroupBy] = useState('by_device'); // by_device, by_participant
    const [expandedLevel1, setExpandedLevel1] = useState({});
    const [expandedLevel2, setExpandedLevel2] = useState({});
    const [detailedData, setDetailedData] = useState({});
    const [loadingDetailed, setLoadingDetailed] = useState({});
    const [deletedRecords, setDeletedRecords] = useState([]);
    const [showDeletedModal, setShowDeletedModal] = useState(false);

    // Mock API 函數們
    const mockApi = {
      // 獲取主要資料
      async getDetailData(summaryId, groupByType) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockData = this.generateMockData(groupByType);
            resolve({
              success: true,
              data: mockData.data,
              summary: mockData.summary,
              deletedRecords: mockData.deletedRecords
            });
          }, 800); // 模擬網路延遲
        });
      },

      // 獲取詳細資料
      async getDetailedData(summaryId, level1Key, level2Key) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockDetailedData = [];
            for (let i = 1; i <= 10; i++) {
              mockDetailedData.push({
                device: level1Key.startsWith('Device') ? level1Key : level2Key,
                participant: level1Key.startsWith('Participant') ? level1Key : level2Key,
                trail: `Trail ${i}`,
                target: `Target ${Math.floor(Math.random() * 100)}`,
                position: `${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}`,
                createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
              });
            }

            resolve({
              success: true,
              data: mockDetailedData
            });
          }, 500);
        });
      },

      // 切換刪除狀態
      async toggleDelete(summaryId, params) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 300);
        });
      },

      // 復原已刪除記錄
      async restoreRecord(recordId) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 300);
        });
      },

      // 生成 Mock 資料
      generateMockData(groupByType) {
        const data = {};
        const deletedRecords = [];

        if (groupByType === 'by_device') {
          // Device -> Participant 結構
          for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
            const deviceKey = `Device ${deviceNum}`;
            data[deviceKey] = {};

            for (let participantNum = 1; participantNum <= 12; participantNum++) {
              const participantKey = `Participant ${participantNum}`;
              const records = [];

              for (let i = 0; i < 5; i++) {
                const record = {
                  device: deviceKey,
                  participant: participantKey,
                  error_time: Math.floor(Math.random() * 100),
                  event_time: Math.floor(Math.random() * 1000),
                  available: Math.random() > 0.2,
                  deleted: Math.random() < 0.1
                };

                records.push(record);
                if (record.deleted) {
                  deletedRecords.push({
                    ...record,
                    id: `${deviceKey}-${participantKey}-${i}`,
                    deletedAt: new Date().toISOString()
                  });
                }
              }

              data[deviceKey][participantKey] = records;
            }
          }
        } else {
          // Participant -> Device 結構
          for (let participantNum = 1; participantNum <= 12; participantNum++) {
            const participantKey = `Participant ${participantNum}`;
            data[participantKey] = {};

            for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
              const deviceKey = `Device ${deviceNum}`;
              const records = [];

              for (let i = 0; i < 5; i++) {
                const record = {
                  device: deviceKey,
                  participant: participantKey,
                  error_time: Math.floor(Math.random() * 100),
                  event_time: Math.floor(Math.random() * 1000),
                  available: Math.random() > 0.2,
                  deleted: Math.random() < 0.1
                };

                records.push(record);
                if (record.deleted) {
                  deletedRecords.push({
                    ...record,
                    id: `${participantKey}-${deviceKey}-${i}`,
                    deletedAt: new Date().toISOString()
                  });
                }
              }

              data[participantKey][deviceKey] = records;
            }
          }
        }

        return {
          data,
          summary: {
            id: selectedSummaryId,
            name: 'Test Summary',
            creator: 'Test Creator',
            updatedAt: '2025-06-04T00:00:00Z'
          },
          deletedRecords
        };
      }
    };

    // 載入主要資料
    const loadData = async () => {
      if (!selectedSummaryId) {
        setError('No summary ID provided');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await mockApi.getDetailData(selectedSummaryId, groupBy);

        if (result.success) {
          setData(result.data || {});
          setSummaryInfo(result.summary || null);
          setDeletedRecords(result.deletedRecords || []);
        } else {
          throw new Error(result.message || 'Failed to load data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadData();
    }, [selectedSummaryId, groupBy]);

    // 載入最內層詳細資料
    const loadDetailedData = async (level1Key, level2Key) => {
      const combinedKey = `${level1Key}-${level2Key}`;
      setLoadingDetailed(prev => ({ ...prev, [combinedKey]: true }));

      try {
        const result = await mockApi.getDetailedData(selectedSummaryId, level1Key, level2Key);

        if (result.success) {
          setDetailedData(prev => ({
            ...prev,
            [combinedKey]: result.data
          }));
        } else {
          throw new Error(result.message || 'Failed to load detailed data');
        }
      } catch (err) {
        console.error('Load detailed data failed:', err);
      } finally {
        setLoadingDetailed(prev => ({ ...prev, [combinedKey]: false }));
      }
    };

    // 刪除/復原第二層資料
    const toggleLevel2Delete = async (level1Key, level2Key) => {
      try {
        const result = await mockApi.toggleDelete(selectedSummaryId, {
          level1: level1Key,
          level2: level2Key,
          type: 'level2'
        });

        if (result.success) {
          await loadData();
        }
      } catch (err) {
        console.error('Toggle delete failed:', err);
      }
    };

    // 刪除/復原第三層資料
    const toggleLevel3Delete = async (level1Key, level2Key, recordIndex) => {
      try {
        const result = await mockApi.toggleDelete(selectedSummaryId, {
          level1: level1Key,
          level2: level2Key,
          recordIndex: recordIndex,
          type: 'level3'
        });

        if (result.success) {
          await loadData();
        }
      } catch (err) {
        console.error('Toggle delete failed:', err);
      }
    };

    // 復原已刪除的記錄
    const restoreDeletedRecord = async (recordId) => {
      try {
        const result = await mockApi.restoreRecord(recordId);

        if (result.success) {
          await loadData();
        }
      } catch (err) {
        console.error('Restore failed:', err);
        // Fallback: 移除本地記錄
        setDeletedRecords(prev => prev.filter(record => record.id !== recordId));
      }
    };

    // 切換展開狀態
    const toggleExpandLevel1 = (key) => {
      setExpandedLevel1(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    const toggleExpandLevel2 = (level1Key, level2Key) => {
      const combinedKey = `${level1Key}-${level2Key}`;
      const isExpanded = !expandedLevel2[combinedKey];

      setExpandedLevel2(prev => ({
        ...prev,
        [combinedKey]: isExpanded
      }));

      // 如果展開且沒有載入過詳細資料，則載入
      if (isExpanded && !detailedData[combinedKey]) {
        loadDetailedData(level1Key, level2Key);
      }
    };

    // 計算統計資料
    const getLevel2Stats = (records) => {
      const total = records.length;
      const errors = records.filter(r => r.error_time > 50).length;
      const deleted = records.filter(r => r.deleted).length;
      const avgEventTime = Math.round(records.reduce((sum, r) => sum + r.event_time, 0) / total) || 0;

      return { total, errors, deleted, avgEventTime };
    };

    // 分組選項配置
    const groupByOptions = {
      by_device: {
        label: 'Grouped by Device',
        description: 'Organize data with devices as primary groups, participants as subgroups',
        icon: '🖥️',
        structure: 'Device ➜ Participant'
      },
      by_participant: {
        label: 'Grouped by Participant',
        description: 'Organize data with participants as primary groups, devices as subgroups',
        icon: '👤',
        structure: 'Participant ➜ Device'
      }
    };

    // 處理分組切換
    const handleGroupByChange = (newGroupBy) => {
      setGroupBy(newGroupBy);
      setExpandedLevel1({});
      setExpandedLevel2({});
      setDetailedData({});
    };

    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Detail View</h2>
              <div>
                <button
                  className="btn btn-outline-warning me-2"
                  onClick={() => setShowDeletedModal(true)}
                >
                  <i className="bi bi-trash"></i> Deleted Records ({deletedRecords.length})
                </button>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setCurrentPage('summary')}
                >
                  <i className="bi bi-arrow-left"></i> Back to Summary
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage('home')}
                >
                  <i className="bi bi-house"></i> Home
                </button>
              </div>
            </div>

            {/* 摘要資訊 */}
            {summaryInfo && (
              <div className="card mb-4 border-primary">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Summary Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-file-text me-2 text-primary"></i>
                        <div>
                          <small className="text-muted">Name</small>
                          <div><strong>{summaryInfo.name}</strong></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-person me-2 text-success"></i>
                        <div>
                          <small className="text-muted">Creator</small>
                          <div><strong>{summaryInfo.creator}</strong></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-clock me-2 text-info"></i>
                        <div>
                          <small className="text-muted">Last Updated</small>
                          <div><strong>{new Date(summaryInfo.updatedAt).toLocaleString()}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                <div className="card-header bg-success text-white">
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
                                  {Object.keys(level2Data).length} items
                                </span>
                              </div>
                            </button>
                          </h2>
                          {(expandedLevel1[level1Key] || false) && (
                            <div className="accordion-collapse collapse show">
                              <div className="accordion-body bg-light">

                                {/* 第二層 */}
                                <div className="accordion" id={`level2-${level1Key}`}>
                                  {Object.entries(level2Data).map(([level2Key, records]) => {
                                    const stats = getLevel2Stats(records);
                                    const hasDeleted = records.some(r => r.deleted);

                                    return (
                                      <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2 border">
                                        <h2 className="accordion-header">
                                          <button
                                            className="accordion-button collapsed d-flex justify-content-between align-items-center w-100"
                                            type="button"
                                            onClick={() => toggleExpandLevel2(level1Key, level2Key)}
                                            aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
                                          >
                                            <div className="d-flex align-items-center flex-wrap">
                                              <span className="me-2">
                                                {groupBy === 'by_device' ? '👤' : '🖥️'}
                                              </span>
                                              <strong className="text-success me-3">{level2Key}</strong>
                                              <span className="badge bg-primary me-2">📊 {stats.total}</span>
                                              <span className="badge bg-danger me-2">⚠️ {stats.errors}</span>
                                              <span className="badge bg-warning me-2">🗑️ {stats.deleted}</span>
                                              <span className="badge bg-info me-2">⏱️ {stats.avgEventTime}ms</span>
                                            </div>
                                            <button
                                              className={`btn btn-sm ms-2 ${hasDeleted ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLevel2Delete(level1Key, level2Key);
                                              }}
                                            >
                                              <i className={`bi ${hasDeleted ? 'bi-arrow-clockwise' : 'bi-trash'} me-1`}></i>
                                              {hasDeleted ? 'Restore All' : 'Delete All'}
                                            </button>
                                          </button>
                                        </h2>
                                        {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
                                          <div className="accordion-collapse collapse show">
                                            <div className="accordion-body bg-white">

                                              {/* 第三層 - 記錄列表 */}
                                              <div className="row mb-3">
                                                <div className="col-12">
                                                  <h6 className="border-bottom pb-2">
                                                    <i className="bi bi-list-ul me-2"></i>
                                                    Records ({records.length})
                                                  </h6>
                                                  {records.map((record, index) => (
                                                    <div key={index} className="card mb-2 border-start border-4 border-primary">
                                                      <div className="card-body py-2">
                                                        <div className="row align-items-center">
                                                          <div className="col-md-8">
                                                            <div className="d-flex align-items-center flex-wrap">
                                                              <span className="me-3">
                                                                <i className="bi bi-exclamation-circle text-warning me-1"></i>
                                                                <strong>Error:</strong> {record.error_time}ms
                                                              </span>
                                                              <span className="me-3">
                                                                <i className="bi bi-stopwatch text-info me-1"></i>
                                                                <strong>Event:</strong> {record.event_time}ms
                                                              </span>
                                                              <span className={`badge me-2 ${record.available ? 'bg-success' : 'bg-secondary'}`}>
                                                                <i className={`bi ${record.available ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                                                {record.available ? 'Available' : 'Unavailable'}
                                                              </span>
                                                              {record.deleted && (
                                                                <span className="badge bg-warning">
                                                                  <i className="bi bi-trash me-1"></i>Deleted
                                                                </span>
                                                              )}
                                                            </div>
                                                          </div>
                                                          <div className="col-md-4 text-end">
                                                            <button
                                                              className={`btn btn-sm ${record.deleted ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                                              onClick={() => toggleLevel3Delete(level1Key, level2Key, index)}
                                                            >
                                                              <i className={`bi ${record.deleted ? 'bi-arrow-clockwise' : 'bi-trash'} me-1`}></i>
                                                              {record.deleted ? 'Restore' : 'Delete'}
                                                            </button>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* 詳細資料載入按鈕和內容 */}
                                              <div className="border-top pt-3">
                                                <h6 className="border-bottom pb-2">
                                                  <i className="bi bi-zoom-in me-2"></i>
                                                  Detailed Information
                                                </h6>
                                                {loadingDetailed[`${level1Key}-${level2Key}`] ? (
                                                  <div className="text-center py-3">
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                      <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <div className="mt-2 text-muted small">Loading detailed data...</div>
                                                  </div>
                                                ) : detailedData[`${level1Key}-${level2Key}`] ? (
                                                  <div className="table-responsive">
                                                    <table className="table table-sm table-striped">
                                                      <thead className="table-dark">
                                                        <tr>
                                                          <th><i className="bi bi-display me-1"></i>Device</th>
                                                          <th><i className="bi bi-person me-1"></i>Participant</th>
                                                          <th><i className="bi bi-path me-1"></i>Trail</th>
                                                          <th><i className="bi bi-bullseye me-1"></i>Target</th>
                                                          <th><i className="bi bi-geo-alt me-1"></i>Position</th>
                                                          <th><i className="bi bi-calendar me-1"></i>Created</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        {detailedData[`${level1Key}-${level2Key}`].map((item, idx) => (
                                                          <tr key={idx}>
                                                            <td><span className="badge bg-primary">{item.device}</span></td>
                                                            <td><span className="badge bg-success">{item.participant}</span></td>
                                                            <td>{item.trail}</td>
                                                            <td>{item.target}</td>
                                                            <td><code>{item.position}</code></td>
                                                            <td>
                                                              <small>{new Date(item.createdAt).toLocaleString()}</small>
                                                            </td>
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                ) : (
                                                  <div className="text-center py-3 text-muted">
                                                    <i className="bi bi-info-circle fs-4"></i>
                                                    <p className="mt-2">Detailed information will load when you expand this section.</p>
                                                  </div>
                                                )}
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
          </div>
        </div>

        {/* 已刪除記錄 Modal */}
        {showDeletedModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="bi bi-trash me-2"></i>
                    Deleted Records ({deletedRecords.length})
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeletedModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {deletedRecords.length > 0 ? (
                    <div>
                      {deletedRecords.map((record, index) => (
                        <div key={record.id || index} className="card mb-2 border-warning">
                          <div className="card-body py-2">
                            <div className="row align-items-center">
                              <div className="col-md-8">
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-display me-2 text-primary"></i>
                                  <strong className="me-2">{record.device}</strong>
                                  <i className="bi bi-arrow-right mx-2"></i>
                                  <i className="bi bi-person me-2 text-success"></i>
                                  <strong>{record.participant}</strong>
                                </div>
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  Deleted: {new Date(record.deletedAt).toLocaleString()}
                                </small>
                              </div>
                              <div className="col-md-4 text-end">
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => restoreDeletedRecord(record.id)}
                                >
                                  <i className="bi bi-arrow-clockwise me-1"></i>
                                  Restore
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-check-circle fs-1 text-success"></i>
                      <p className="text-center text-muted mt-3">No deleted records found.</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeletedModal(false)}
                  >
                    <i className="bi bi-x me-1"></i>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
