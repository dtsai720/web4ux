import React from 'react';

const SyncProgress = ({ syncProgress, onCancelSync }) => {
  return (
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
          onClick={onCancelSync}
          className="btn btn-danger btn-sm"
        >
          🛑 Cancel Sync
        </button>
      </div>
    </div>
  );
};

export default SyncProgress;
