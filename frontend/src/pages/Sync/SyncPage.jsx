import React, { useState, useEffect } from 'react';
import { LoginAndSync, StartSync, CancelSync, GetSyncStatus } from '../../../wailsjs/go/pkg/App';
import { EventsOn, EventsOff } from '../../../wailsjs/runtime/runtime';

const SyncPage = ({ setCurrentPage }) => {
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
                      Progress: {syncProgress.progress}% ({Math.floor(syncProgress.currentIndex ? syncProgress.currentIndex : 0)}/{syncProgress.totalProjects} projects)
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

export default SyncPage;
