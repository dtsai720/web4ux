import React from 'react';

const SyncCancelled = ({ syncProgress, onRestartSync, onNewLogin }) => {
  return (
    <div className="text-center">
      <div className="alert alert-warning">
        <h5>⚠️ Sync Cancelled</h5>
        <p>Synchronization was cancelled during: <strong>{syncProgress.currentProject}</strong></p>
      </div>
      <button
        onClick={onRestartSync}
        className="btn btn-primary me-2"
      >
        Restart Sync
      </button>
      <button
        onClick={onNewLogin}
        className="btn btn-secondary"
      >
        New Login
      </button>
    </div>
  );
};

export default SyncCancelled;
