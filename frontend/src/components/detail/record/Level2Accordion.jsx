import React from 'react';
import TrailList from './TrailList';

/**
 * Component to display the second level of the accordion (participant or device)
 *
 * @param {Object} props - Component props
 * @param {string} props.level1Key - Level 1 key (device or participant)
 * @param {string} props.level2Key - Level 2 key (participant or device)
 * @param {Object} props.trailsData - Object containing trail data
 * @param {string} props.groupBy - Current grouping option
 * @param {Object} props.expandedLevel2 - Object tracking expanded level 2 state
 * @param {Object} props.expandedTrails - Object tracking expanded trail state
 * @param {Function} props.toggleExpandLevel2 - Function to toggle level 2 expansion
 * @param {Function} props.toggleExpandTrail - Function to toggle trail expansion
 * @param {Function} props.toggleTrailDelete - Function to toggle trail deletion
 * @param {Function} props.formatDateTime - Function to format timestamp
 * @returns {JSX.Element} Level 2 accordion item
 */
const Level2Accordion = ({
  level1Key,
  level2Key,
  trailsData,
  groupBy,
  expandedLevel2,
  expandedTrails,
  toggleExpandLevel2,
  toggleExpandTrail,
  toggleTrailDelete,
  formatDateTime
}) => {
  // Use pre-calculated statistics
  const stats = trailsData.stats || {
    totalTrails: 0,
    availableTrails: 0,
    trailsWithErrors: 0,
    avgEventTime: 0,
    totalEventTime: 0
  };

  const isExpanded = expandedLevel2[`${level1Key}-${level2Key}`] || false;
  return (
    <div className="accordion-item mb-2 border">
      <h2 className="accordion-header">
        <div className="d-flex justify-content-between align-items-center w-100">
          <button
            className="accordion-button collapsed flex-grow-1"
            type="button"
            onClick={() => toggleExpandLevel2(level1Key, level2Key)}
            aria-expanded={isExpanded}
          >
            <div className="d-flex align-items-center flex-wrap">
              <span className="me-2">
                {groupBy === 'by_device' ? '👤' : '🖥️'}
              </span>
              <strong className="text-success me-3">{level2Key}</strong>
              <span className="badge bg-primary me-2">
                <i className="bi bi-signpost-split me-1"></i>
                {stats.totalTrails} trails
              </span>
              <span className="badge bg-danger me-2">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {stats.trailsWithErrors} with errors
              </span>
              <span className="badge bg-success me-2">
                <i className="bi bi-check-circle me-1"></i>
                {stats.availableTrails} available
              </span>
              <span className="badge bg-info me-2">
                <i className="bi bi-clock me-1"></i>
                Avg {stats.avgEventTime}ms
              </span>
              <span className="badge bg-secondary me-2">
                <i className="bi bi-clock-history me-1"></i>
                Total {stats.totalEventTime}ms
              </span>
            </div>
          </button>
        </div>
      </h2>
      {isExpanded && (
        <div className="accordion-collapse collapse show">
          <div className="accordion-body bg-white">
            {/* Trail list */}
            <TrailList
              level1Key={level1Key}
              level2Key={level2Key}
              trailsData={trailsData}
              expandedTrails={expandedTrails}
              toggleExpandTrail={toggleExpandTrail}
              toggleTrailDelete={toggleTrailDelete}
              formatDateTime={formatDateTime}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Level2Accordion;
