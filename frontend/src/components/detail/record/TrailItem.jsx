import React from 'react';
import TrailRecord from './TrailRecord';

/**
 * Component to display a single trail with expandable records
 *
 * @param {Object} props - Component props
 * @param {string} props.level1Key - Level 1 key (device or participant)
 * @param {string} props.level2Key - Level 2 key (participant or device)
 * @param {string} props.trailKey - Trail identifier
 * @param {Array} props.records - Array of record objects
 * @param {Object} props.trailStats - Statistics for this trail
 * @param {boolean} props.isExpanded - Whether the trail is expanded
 * @param {Function} props.toggleExpandTrail - Function to toggle trail expansion
 * @param {Function} props.toggleTrailDelete - Function to toggle trail deletion
 * @param {Function} props.formatDateTime - Function to format timestamp
 * @returns {JSX.Element} Trail item with expandable records
 */
const TrailItem = ({
  level1Key,
  level2Key,
  trailKey,
  records,
  trailStats = {},
  isExpanded,
  toggleExpandTrail,
  toggleTrailDelete,
  formatDateTime
}) => {
  const combinedKey = `${level1Key}-${level2Key}-${trailKey}`;

  return (
    <div className="card mb-2 border-start border-4 border-primary">
      <div className="card-body py-2">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div
              className="d-flex align-items-center flex-wrap"
              style={{ cursor: 'pointer' }}
              onClick={() => toggleExpandTrail(level1Key, level2Key, trailKey)}
            >
              <span className="me-2">
                <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
              </span>
              <strong className="me-3">Trail {trailKey}</strong>
              <span className="me-3">
                <i className="bi bi-exclamation-circle text-warning me-1"></i>
                <strong>Errors:</strong> {trailStats.error_time || 0}
              </span>
              <span className="me-3">
                <i className="bi bi-clock text-info me-1"></i>
                <strong>Event Time:</strong> {trailStats.event_time || 0}ms
              </span>
              <span className={`badge me-2 ${trailStats.available ? 'bg-success' : 'bg-secondary'}`}>
                <i className={`bi ${trailStats.available ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                {trailStats.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
          {/* <div className="col-md-4 text-end">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => toggleTrailDelete(level1Key, level2Key, trailKey, true)}
              title="Delete this trail"
            >
              <i className="bi bi-trash"></i> Delete
            </button>
          </div> */}
        </div>

        {/* Expanded trail records */}
        {isExpanded && (
          <div className="mt-3 border-top pt-3">
            <h6 className="text-muted mb-3">Records in Trail {trailKey}</h6>
            <TrailRecord records={records} formatDateTime={formatDateTime} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailItem;
