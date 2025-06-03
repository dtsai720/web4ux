import React, { useState, useEffect } from 'react';
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
                        Progress: {syncProgress.progress}% ({Math.floor(syncProgress.progress / 20)}/{syncProgress.totalProjects} projects)
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
        const result = await ListProjects(searchName, searchCreator, orderBy, orderDirection, offset);

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
    const [groupBy, setGroupBy] = useState('device'); // device, participant, trail
    const [expandedLevel1, setExpandedLevel1] = useState({}); // 第一層展開狀態
    const [expandedLevel2, setExpandedLevel2] = useState({}); // 第二層展開狀態
    const [expandedLevel3, setExpandedLevel3] = useState({}); // 第三層展開狀態

    // 載入詳細資料
    const loadDetails = async () => {
      if (!selectedSummaryId) {
        setError('No summary ID provided');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Mock data 生成更完整的測試數據
        const mockDetails = [];

        // 4 devices, 12 participants, 32 trails per participant per device
        for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
          for (let participantNum = 1; participantNum <= 12; participantNum++) {
            for (let trailNum = 1; trailNum <= 32; trailNum++) {
              mockDetails.push({
                id: `${deviceNum}-${participantNum}-${trailNum}`,
                device: `Device ${deviceNum}`,
                participant: `Participant ${participantNum}`,
                trail: trailNum,
                from: `Point ${Math.floor(Math.random() * 100)}`,
                to: `Point ${Math.floor(Math.random() * 100)}`,
                is_error: Math.random() < 0.1, // 10% error rate
                is_available: Math.random() < 0.8, // 80% available
                deleted: Math.random() < 0.05, // 5% deleted
                event_time: Math.floor(Math.random() * 1000), // 隨機事件時間
                has_error: Math.random() < 0.15 // 15% has error
              });
            }
          }
        }

        const result = {
          summary: {
            id: selectedSummaryId,
            name: 'Test Summary',
            creator: 'Test Creator',
            updatedAt: '2025-06-25T00:00:00Z'
          },
          details: mockDetails
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

    // 切換刪除狀態
    const toggleDelete = (itemId) => {
      setDetails(prevDetails =>
        prevDetails.map(detail =>
          detail.id === itemId
            ? { ...detail, deleted: !detail.deleted }
            : detail
        )
      );
    };

    // 切換組級刪除狀態
    const toggleGroupDelete = (groupItems) => {
      DeleteOrRestore(selectedSummaryId, groupItems);
      const hasAnyDeleted = groupItems.some(item => item.deleted);
      const newDeletedState = !hasAnyDeleted;

      setDetails(prevDetails =>
        prevDetails.map(detail => {
          const shouldUpdate = groupItems.some(item => item.id === detail.id);
          return shouldUpdate
            ? { ...detail, deleted: newDeletedState }
            : detail;
        })
      );
    };

    // 統計資訊
    const stats = {
      total: details.length,
      errors: details.filter(d => d.is_error).length,
      deleted: details.filter(d => d.deleted).length
    };

    // 分組資料 - 三層結構
    const getGroupedData = () => {
      const grouped = {};

      details.forEach(detail => {
        let level1Key, level2Key, level3Key;

        // 根據分組方式決定三層的鍵值
        if (groupBy === 'device') {
          level1Key = detail.device;
          level2Key = detail.participant;
          level3Key = `Trail ${detail.trail}`;
        } else if (groupBy === 'participant') {
          level1Key = detail.participant;
          level2Key = detail.device;
          level3Key = `Trail ${detail.trail}`;
        } else { // trail
          level1Key = `Trail ${detail.trail}`;
          level2Key = detail.device;
          level3Key = detail.participant;
        }

        // 建立三層結構
        if (!grouped[level1Key]) {
          grouped[level1Key] = {};
        }
        if (!grouped[level1Key][level2Key]) {
          grouped[level1Key][level2Key] = {};
        }
        if (!grouped[level1Key][level2Key][level3Key]) {
          grouped[level1Key][level2Key][level3Key] = [];
        }

        grouped[level1Key][level2Key][level3Key].push(detail);
      });

      return grouped;
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
      setExpandedLevel2(prev => ({
        ...prev,
        [combinedKey]: !prev[combinedKey]
      }));
    };

    const toggleExpandLevel3 = (level1Key, level2Key, level3Key) => {
      const combinedKey = `${level1Key}-${level2Key}-${level3Key}`;
      setExpandedLevel3(prev => ({
        ...prev,
        [combinedKey]: !prev[combinedKey]
      }));
    };

    const groupedData = getGroupedData();

    // 獲取狀態徽章
    const getStatusBadges = (detail) => {
      const badges = [];
      if (detail.is_available) {
        badges.push(<span key="available" className="badge bg-success me-1">Available</span>);
      }
      if (detail.is_error) {
        badges.push(<span key="error" className="badge bg-danger me-1">Error</span>);
      }
      if (detail.deleted) {
        badges.push(<span key="deleted" className="badge bg-warning me-1">Deleted</span>);
      }
      if (badges.length === 0) {
        badges.push(<span key="normal" className="badge bg-secondary">Normal</span>);
      }
      return badges;
    };

    // 計算第一、二層統計數據
    const getLevel1Stats = (level2Data) => {
      let errorCount = 0;
      let eventTimeSum = 0;
      let totalItems = 0;
      let deletedCount = 0;

      const traverse = (obj) => {
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            totalItems++;
            if (item.is_error || item.has_error) errorCount++;
            eventTimeSum += item.event_time || 0;
            if (item.deleted) deletedCount++;
          });
        } else {
          Object.values(obj).forEach(traverse);
        }
      };

      traverse(level2Data);
      return { errorCount, avgEventTime: Math.round(eventTimeSum / totalItems) || 0, totalItems, deletedCount };
    };

    const getLevel2Stats = (level3Data) => {
      let errorCount = 0;
      let eventTimeSum = 0;
      let totalItems = 0;
      let deletedCount = 0;

      const traverse = (obj) => {
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            totalItems++;
            if (item.is_error || item.has_error) errorCount++;
            eventTimeSum += item.event_time || 0;
            if (item.deleted) deletedCount++;
          });
        } else {
          Object.values(obj).forEach(traverse);
        }
      };

      traverse(level3Data);
      return { errorCount, avgEventTime: Math.round(eventTimeSum / totalItems) || 0, totalItems, deletedCount };
    };

    // 計算第三層統計數據
    const getLevel3Stats = (items) => {
      const errorCount = items.filter(item => item.is_error || item.has_error).length;
      const deletedCount = items.filter(item => item.deleted).length;
      const hasError = items.some(item => item.is_error || item.has_error);
      const isAvailable = items.some(item => item.is_available);
      const avgEventTime = Math.round(items.reduce((sum, item) => sum + (item.event_time || 0), 0) / items.length) || 0;

      return { errorCount, deletedCount, hasError, isAvailable, avgEventTime };
    };

    // 獲取組級所有項目
    const getGroupItems = (groupData) => {
      const items = [];
      const traverse = (obj) => {
        if (Array.isArray(obj)) {
          items.push(...obj);
        } else {
          Object.values(obj).forEach(traverse);
        }
      };
      traverse(groupData);
      return items;
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

            {/* 統計卡片 - 移除 Available */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h3>{stats.total}</h3>
                    <p className="mb-0">Total Items</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-danger text-white">
                  <div className="card-body text-center">
                    <h3>{stats.errors}</h3>
                    <p className="mb-0">Errors</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-warning text-white">
                  <div className="card-body text-center">
                    <h3>{stats.deleted}</h3>
                    <p className="mb-0">Deleted</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 分組選項 */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="mb-3">Group By:</h6>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${groupBy === 'device' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setGroupBy('device');
                      setExpandedLevel1({});
                      setExpandedLevel2({});
                      setExpandedLevel3({});
                    }}
                  >
                    Device
                  </button>
                  <button
                    type="button"
                    className={`btn ${groupBy === 'participant' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setGroupBy('participant');
                      setExpandedLevel1({});
                      setExpandedLevel2({});
                      setExpandedLevel3({});
                    }}
                  >
                    Participant
                  </button>
                  <button
                    type="button"
                    className={`btn ${groupBy === 'trail' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setGroupBy('trail');
                      setExpandedLevel1({});
                      setExpandedLevel2({});
                      setExpandedLevel3({});
                    }}
                  >
                    Trail
                  </button>
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

            {/* 三層分組詳細資料 */}
            {!loading && !error && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
                  </h5>
                </div>
                <div className="card-body">
                  {Object.keys(groupedData).length > 0 ? (
                    <div className="accordion" id="detailAccordion">
                      {/* 第一層 */}
                      {Object.entries(groupedData).map(([level1Key, level2Data]) => {
                        const level1Stats = getLevel1Stats(level2Data);
                        const level1Items = getGroupItems(level2Data);

                        return (
                          <div key={level1Key} className="accordion-item mb-3">
                            <h2 className="accordion-header">
                              <button
                                className="accordion-button collapsed d-flex justify-content-between align-items-center"
                                type="button"
                                onClick={() => toggleExpandLevel1(level1Key)}
                                aria-expanded={expandedLevel1[level1Key] || false}
                              >
                                <div className="d-flex align-items-center">
                                  <strong className="text-primary me-3">{level1Key}</strong>
                                  <span className="badge bg-danger me-2">Error: {level1Stats.errorCount}</span>
                                  <span className="badge bg-info me-2">Event Time: {level1Stats.avgEventTime}</span>
                                  <span className="badge bg-warning me-2">Deleted: {level1Stats.deletedCount}</span>
                                </div>
                                <button
                                  className={`btn btn-sm ms-2 ${level1Items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroupDelete(level1Items);
                                  }}
                                >
                                  {level1Items.some(item => item.deleted) ? 'Recover' : 'Delete'}
                                </button>
                              </button>
                            </h2>
                            {(expandedLevel1[level1Key] || false) && (
                              <div className="accordion-collapse collapse show">
                                <div className="accordion-body">

                                  {/* 第二層 */}
                                  <div className="accordion" id={`level2-${level1Key}`}>
                                    {Object.entries(level2Data).map(([level2Key, level3Data]) => {
                                      const level2Stats = getLevel2Stats(level3Data);
                                      const level2Items = getGroupItems(level3Data);

                                      return (
                                        <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2">
                                          <h2 className="accordion-header">
                                            <button
                                              className="accordion-button collapsed d-flex justify-content-between align-items-center"
                                              type="button"
                                              onClick={() => toggleExpandLevel2(level1Key, level2Key)}
                                              aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
                                            >
                                              <div className="d-flex align-items-center">
                                                <strong className="text-success me-3">{level2Key}</strong>
                                                <span className="badge bg-danger me-2">Error: {level2Stats.errorCount}</span>
                                                <span className="badge bg-info me-2">Event Time: {level2Stats.avgEventTime}</span>
                                                <span className="badge bg-warning me-2">Deleted: {level2Stats.deletedCount}</span>
                                              </div>
                                              <button
                                                className={`btn btn-sm ms-2 ${level2Items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleGroupDelete(level2Items);
                                                }}
                                              >
                                                {level2Items.some(item => item.deleted) ? 'Recover' : 'Delete'}
                                              </button>
                                            </button>
                                          </h2>
                                          {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
                                            <div className="accordion-collapse collapse show">
                                              <div className="accordion-body">

                                                {/* 第三層 */}
                                                <div className="accordion" id={`level3-${level1Key}-${level2Key}`}>
                                                  {Object.entries(level3Data).map(([level3Key, items]) => {
                                                    const level3Stats = getLevel3Stats(items);

                                                    return (
                                                      <div key={`${level1Key}-${level2Key}-${level3Key}`} className="accordion-item mb-2">
                                                        <h2 className="accordion-header">
                                                          <button
                                                            className="accordion-button collapsed d-flex justify-content-between align-items-center"
                                                            type="button"
                                                            onClick={() => toggleExpandLevel3(level1Key, level2Key, level3Key)}
                                                            aria-expanded={expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false}
                                                          >
                                                            <div className="d-flex align-items-center">
                                                              <strong className="text-info me-3">{level3Key}</strong>
                                                              <span className={`badge me-2 ${level3Stats.hasError ? 'bg-danger' : 'bg-success'}`}>
                                                                Has Error: {level3Stats.hasError ? 'Yes' : 'No'}
                                                              </span>
                                                              <span className={`badge me-2 ${level3Stats.isAvailable ? 'bg-success' : 'bg-secondary'}`}>
                                                                Available: {level3Stats.isAvailable ? 'Yes' : 'No'}
                                                              </span>
                                                              <span className="badge bg-info me-2">Event Time: {level3Stats.avgEventTime}</span>
                                                              <span className="badge bg-warning me-2">Deleted: {level3Stats.deletedCount}</span>
                                                            </div>
                                                            <button
                                                              className={`btn btn-sm ms-2 ${items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleGroupDelete(items);
                                                              }}
                                                            >
                                                              {items.some(item => item.deleted) ? 'Recover' : 'Delete'}
                                                            </button>
                                                          </button>
                                                        </h2>
                                                        {(expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false) && (
                                                          <div className="accordion-collapse collapse show">
                                                            <div className="accordion-body">

                                                              {/* 最內層資料 - 顯示完整詳細資訊 */}
                                                              {items.map((item) => (
                                                                <div key={item.id} className="card mb-3">
                                                                  <div className="card-body">
                                                                    <div className="row">
                                                                      <div className="col-md-9">
                                                                        <h6 className="card-title">
                                                                          {item.device} - {item.participant} - Trail {item.trail}
                                                                        </h6>
                                                                        <div className="row mb-3">
                                                                          <div className="col-md-6">
                                                                            <p className="card-text mb-1">
                                                                              <strong>From:</strong> {item.from}
                                                                            </p>
                                                                            <p className="card-text mb-1">
                                                                              <strong>To:</strong> {item.to}
                                                                            </p>
                                                                            <p className="card-text mb-1">
                                                                              <strong>ID:</strong> {item.id}
                                                                            </p>
                                                                          </div>
                                                                          <div className="col-md-6">
                                                                            <p className="card-text mb-1">
                                                                              <strong>Event Time:</strong> {item.event_time}
                                                                            </p>
                                                                            <p className="card-text mb-1">
                                                                              <strong>Available:</strong> {item.is_available ? 'Yes' : 'No'}
                                                                            </p>
                                                                            <p className="card-text mb-1">
                                                                              <strong>Has Error:</strong> {item.has_error || item.is_error ? 'Yes' : 'No'}
                                                                            </p>
                                                                          </div>
                                                                        </div>
                                                                        <div className="mb-2">
                                                                          {getStatusBadges(item)}
                                                                        </div>
                                                                      </div>
                                                                      <div className="col-md-3 text-end">
                                                                        <button
                                                                          className={`btn btn-sm ${item.deleted
                                                                            ? 'btn-outline-success'
                                                                            : 'btn-outline-danger'
                                                                            }`}
                                                                          onClick={() => toggleDelete(item.id)}
                                                                        >
                                                                          {item.deleted ? 'Recover' : 'Delete'}
                                                                        </button>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              ))}

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
                                      );
                                    })}
                                  </div>

                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
