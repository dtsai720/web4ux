import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const SummaryPage = () => {
    const summaryData = mockGetSummaryData();

    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <h2 className="mb-4">Data Summary</h2>

            {summaryData ? (
              <div>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <h3>{summaryData.summary.totalItems}</h3>
                        <p className="mb-0">Total Items</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-9">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Category Statistics</h5>
                      </div>
                      <div className="card-body">
                        {summaryData.summary.categories.map((category, index) => (
                          <div key={index} className="mb-3">
                            <div className="d-flex justify-content-between">
                              <span>{category.name}</span>
                              <span className="badge bg-secondary">{category.count}</span>
                            </div>
                            <div className="progress mt-1">
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${(category.count / summaryData.summary.totalItems) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h6>Sync Status: <span className="badge bg-success">{summaryData.summary.syncStatus}</span></h6>
                    <p className="text-muted mb-0">
                      Last Updated: {new Date(summaryData.summary.lastUpdate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning text-center">
                <h5>No Data Available</h5>
                <p>Please sync data first to view summary information</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentPage('sync')}
                >
                  Go to Sync
                </button>
              </div>
            )}
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'sync':
        return <SyncPage />;
      case 'summary':
        return <SummaryPage />;
      case 'guide':
        return <GuidePage />;
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
