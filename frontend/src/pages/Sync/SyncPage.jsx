import React, { useState, useEffect } from 'react';
import { EventsOn, EventsOff } from '../../../wailsjs/runtime/runtime';
import {
  checkSyncStatus,
  handleLogin as loginUtil,
  handleStartSync as startSyncUtil,
  handleCancelSync as cancelSyncUtil,
  getInitialSyncProgress,
  formatSyncData
} from '../../utils/sync';
import {
  SyncCard,
  BackToHomeButton
} from '../../components/sync';

const SyncPage = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(getInitialSyncProgress());
  const [loginError, setLoginError] = useState('');
  const [syncData, setSyncData] = useState(null);

  useEffect(() => {
    // 監聽同步進度事件
    EventsOn('sync:progress', (progress) => {
      setSyncProgress(progress);

      if (progress.isCompleted) {
        setIsSyncing(false);
        setSyncData(formatSyncData(progress.totalProjects));
      } else if (progress.isCancelled) {
        setIsSyncing(false);
      }
    });

    // 檢查同步狀態
    checkSyncStatusAndUpdate();

    // 清理函數
    return () => {
      EventsOff('sync:progress');
    };
  }, []);

  const checkSyncStatusAndUpdate = async () => {
    try {
      const status = await checkSyncStatus();
      setIsSyncing(status.isSyncing);
    } catch {
      // Error handled silently
    }
  };

  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);
      setLoginError('');

      try {
        const response = await loginUtil(email, password);
        if (response.success) {
          setIsLoggedIn(true);
          // 登入成功後立即開始同步
          handleStartSync();
        } else {
          setLoginError(response.message);
        }
      } catch (error) {
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
      await startSyncUtil();
    } catch (error) {
      setIsSyncing(false);
    }
  };

  const handleCancelSync = async () => {
    try {
      await cancelSyncUtil();
      setIsSyncing(false);
      setSyncProgress(prev => ({
        ...prev,
        isCancelled: true
      }));
    } catch {
      // Error handled silently
    }
  };

  const resetSync = () => {
    setIsLoggedIn(false);
    setIsSyncing(false);
    setSyncData(null);
    setSyncProgress(getInitialSyncProgress());
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <SyncCard
            isLoggedIn={isLoggedIn}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loginError={loginError}
            loading={loading}
            onLogin={handleLogin}
            syncProgress={syncProgress}
            isSyncing={isSyncing}
            syncData={syncData}
            onCancelSync={handleCancelSync}
            onNewSync={resetSync}
            onRestartSync={handleStartSync}
            onNewLogin={resetSync}
          />
        </div>
      </div>

      <BackToHomeButton
        onBackToHome={() => setCurrentPage('home')}
        disabled={isSyncing}
      />
    </div>
  );
};

export default SyncPage;
