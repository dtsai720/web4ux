import React from 'react';
import EmptyStateMessage from './EmptyStateMessage';

/**
 * Component to display a list of deleted trails
 * @param {Object} deletedTrails - Object containing deleted trails
 * @param {Function} toggleTrailDelete - Function to toggle trail deletion status
 * @returns {JSX.Element} - The deleted trails list component
 */
const DeletedTrailsList = ({ deletedTrails, toggleTrailDelete }) => {
  if (Object.keys(deletedTrails).length === 0) {
    return <EmptyStateMessage message="No deleted trails found." />;
  }

  return (
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
  );
};

export default DeletedTrailsList;
