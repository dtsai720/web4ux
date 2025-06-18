import React from 'react';

const SyncInProgress = ({ syncProgress }) => {
  return (
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
  );
};

export default SyncInProgress;
