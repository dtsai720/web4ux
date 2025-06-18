import React from 'react';
import LoginForm from './LoginForm';
import SyncProgress from './SyncProgress';
import SyncCompleted from './SyncCompleted';
import SyncCancelled from './SyncCancelled';
import SyncInProgress from './SyncInProgress';

const SyncCard = ({
  isLoggedIn,
  email,
  setEmail,
  password,
  setPassword,
  loginError,
  loading,
  onLogin,
  syncProgress,
  isSyncing,
  syncData,
  onCancelSync,
  onNewSync,
  onRestartSync,
  onNewLogin
}) => {
  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0">Data Synchronization</h3>
      </div>
      <div className="card-body">
        {!isLoggedIn ? (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loginError={loginError}
            loading={loading}
            onLogin={onLogin}
          />
        ) : (
          <div>
            {syncProgress.isCompleted && !isSyncing ? (
              <SyncCompleted
                syncData={syncData}
                onNewSync={onNewSync}
              />
            ) : syncProgress.isCancelled ? (
              <SyncCancelled
                syncProgress={syncProgress}
                onRestartSync={onRestartSync}
                onNewLogin={onNewLogin}
              />
            ) : (
              <SyncInProgress syncProgress={syncProgress} />
            )}
          </div>
        )}

        {isSyncing && (
          <SyncProgress
            syncProgress={syncProgress}
            onCancelSync={onCancelSync}
          />
        )}
      </div>
    </div>
  );
};

export default SyncCard;
