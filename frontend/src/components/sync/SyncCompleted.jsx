import React from 'react';

const SyncCompleted = ({ syncData, onNewSync }) => {
  return (
    <div className="text-center">
      <div className="alert alert-success">
        <h5>✅ Sync Completed!</h5>
        <p>Successfully synchronized {syncData?.totalRecords} projects</p>
        <small>Last sync: {new Date(syncData?.lastSync).toLocaleString()}</small>
      </div>
      <button
        onClick={onNewSync}
        className="btn btn-info me-2"
      >
        Start New Sync
      </button>
    </div>
  );
};

export default SyncCompleted;
