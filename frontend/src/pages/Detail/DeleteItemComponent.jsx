import React, { useState } from 'react';

const DeleteItemComponent = ({
  deletedTrails,
  deletedParticipants,
  toggleTrailDelete,
  toggleParticipantDelete,
  closeDeleteMode
}) => {
  const [activeTab, setActiveTab] = useState('trails');

  // Handle double click to go back
  const handleDoubleClick = () => {
    closeDeleteMode();
  };

  return (
    <div className="card mb-4 border-warning">
      <div
        className="card-header bg-warning text-dark"
        onDoubleClick={handleDoubleClick}
        style={{ cursor: 'pointer' }}
        title="Double-click to go back"
      >
        <h5 className="mb-0">
          <i className="bi bi-trash me-2"></i>
          Deleted Items
        </h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'trails' ? 'active' : ''}`}
                onClick={() => setActiveTab('trails')}
                type="button"
                role="tab"
              >
                <i className="bi bi-signpost-split me-1"></i>
                Deleted Trails ({Object.keys(deletedTrails).length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'participants' ? 'active' : ''}`}
                onClick={() => setActiveTab('participants')}
                type="button"
                role="tab"
              >
                <i className="bi bi-people me-1"></i>
                Deleted Participants ({Object.keys(deletedParticipants).length})
              </button>
            </li>
          </ul>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={closeDeleteMode}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
        </div>

        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'trails' ? 'show active' : ''}`} role="tabpanel">
            {Object.keys(deletedTrails).length > 0 ? (
              <div className="list-group">
                {Object.entries(deletedTrails).map(([key, trail]) => (
                  <div key={key} className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">
                          <i className="bi bi-display me-1 text-primary"></i>
                          {trail.device} /
                          <i className="bi bi-person me-1 ms-2 text-success"></i>
                          {trail.participant} /
                          <i className="bi bi-signpost-split me-1 ms-2 text-info"></i>
                          Trail {trail.trail}
                        </h6>
                        <small className="text-muted">
                          {trail.records.length} records deleted
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => toggleTrailDelete(trail.device, trail.participant, trail.trail, false)}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-check-circle fs-1 text-success"></i>
                <p className="text-center text-muted mt-3">No deleted trails found.</p>
              </div>
            )}
          </div>

          <div className={`tab-pane fade ${activeTab === 'participants' ? 'show active' : ''}`} role="tabpanel">
            {Object.keys(deletedParticipants).length > 0 ? (
              <div className="list-group">
                {Object.entries(deletedParticipants).map(([key, participant]) => (
                  <div key={key} className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">
                          <i className="bi bi-display me-1 text-primary"></i>
                          {participant.device} /
                          <i className="bi bi-person me-1 ms-2 text-success"></i>
                          {participant.participant} ({participant.participantName})
                        </h6>
                        <small className="text-muted">
                          {participant.trailCount} trails / {participant.recordCount} records deleted
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => toggleParticipantDelete(participant.device, participant.participant, false)}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-check-circle fs-1 text-success"></i>
                <p className="text-center text-muted mt-3">No deleted participants found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemComponent;
