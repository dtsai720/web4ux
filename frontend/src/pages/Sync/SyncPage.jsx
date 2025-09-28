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
import { handleError } from '../../utils/common';
import {
  SyncCard,
  BackToHomeButton
} from '../../components/sync';
import { useNavigation } from '../../contexts/NavigationContext';

const SyncPage = () => {
  const { navigateTo } = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(getInitialSyncProgress());
  const [loginError, setLoginError] = useState('');
  const [syncData, setSyncData] = useState(null);

  useEffect(() => {
    // Listen to sync progress events
    EventsOn('sync:progress', (progress) => {
      setSyncProgress(progress);

      if (progress.isCompleted) {
        setIsSyncing(false);
        setSyncData(formatSyncData(progress.totalProjects));
      } else if (progress.isCancelled) {
        setIsSyncing(false);
      }
    });

    // Check sync status
    checkSyncStatusAndUpdate();

    // Cleanup function
    return () => {
      EventsOff('sync:progress');
    };
  }, []);

  const checkSyncStatusAndUpdate = async () => {
    try {
      const status = await checkSyncStatus();
      setIsSyncing(status.isSyncing);
    } catch (error) {
      handleError(error, 'Failed to get sync status');
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
          // Start sync immediately after successful login
          handleStartSync();
        } else {
          setLoginError(response.message);
        }
      } catch (error) {
        handleError(error, "Login failed");
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
      handleError(error, "Failed to start sync");
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
    } catch (error) {
      handleError(error, "Failed to cancel sync");
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
        onBackToHome={() => navigateTo('home')}
        disabled={isSyncing}
      />
    </div>
  );
};

export default SyncPage;
