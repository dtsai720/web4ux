import React from 'react';
import Level2Accordion from './Level2Accordion';

/**
 * Component to display the first level of the accordion (device or participant)
 *
 * @param {Object} props - Component props
 * @param {string} props.level1Key - Level 1 key (device or participant)
 * @param {Object} props.level2Data - Object containing level 2 data
 * @param {string} props.groupBy - Current grouping option
 * @param {Object} props.expandedLevel1 - Object tracking expanded level 1 state
 * @param {Object} props.expandedLevel2 - Object tracking expanded level 2 state
 * @param {Object} props.expandedTrails - Object tracking expanded trail state
 * @param {Function} props.toggleExpandLevel1 - Function to toggle level 1 expansion
 * @param {Function} props.toggleExpandLevel2 - Function to toggle level 2 expansion
 * @param {Function} props.toggleExpandTrail - Function to toggle trail expansion
 * @param {Function} props.toggleTrailDelete - Function to toggle trail deletion
 * @param {Function} props.formatDateTime - Function to format timestamp
 * @returns {JSX.Element} Level 1 accordion item
 */
const Level1Accordion = ({
  level1Key,
  level2Data,
  groupBy,
  expandedLevel1,
  expandedLevel2,
  expandedTrails,
  toggleExpandLevel1,
  toggleExpandLevel2,
  toggleExpandTrail,
  toggleTrailDelete,
  formatDateTime
}) => {
  const isExpanded = expandedLevel1[level1Key] || false;

  return (
    <div className="accordion-item mb-3 border-2">
      <h2 className="accordion-header">
        <button
          className="accordion-button collapsed fw-bold"
          type="button"
          onClick={() => toggleExpandLevel1(level1Key)}
          aria-expanded={isExpanded}
        >
          <div className="d-flex align-items-center">
            <span className="me-2">
              {groupBy === 'by_device' ? '🖥️' : '👤'}
            </span>
            <span className="text-primary">{level1Key}</span>
            <span className="badge bg-info ms-3">
              {Object.keys(level2Data).filter(key => key !== 'stats').length} items
            </span>
            {level2Data.stats && (
              <>
                <span className="badge bg-danger ms-2">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {level2Data.stats.trailsWithErrors} errors
                </span>
                <span className="badge bg-success ms-2">
                  <i className="bi bi-check-circle me-1"></i>
                  {level2Data.stats.availableTrails}/{level2Data.stats.totalTrails} available
                </span>
                {level2Data.stats.unavailableTrails > 0 && (
                  <span className="badge bg-warning ms-2">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    {level2Data.stats.unavailableTrails} unavailable
                  </span>
                )}
                {level2Data.stats.calculableTrails > 0 && (
                  <span className="badge bg-primary ms-2">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    {level2Data.stats.calculableTrails} calculable
                  </span>
                )}
                <span className="badge bg-info ms-2">
                  <i className="bi bi-clock me-1"></i>
                  Total: {level2Data.stats.totalEventTime}ms / Avg: {level2Data.stats.avgEventTime}ms
                </span>
              </>
            )}
          </div>
        </button>
      </h2>
      {isExpanded && (
        <div className="accordion-collapse collapse show">
          <div className="accordion-body bg-light">
            {/* Level 2 */}
            <div className="accordion" id={`level2-${level1Key}`}>
              {Object.keys(level2Data).sort().map(level2Key => {
                if (level2Key === 'stats') return null;
                const trailsData = level2Data[level2Key];

                return (
                  <Level2Accordion
                    key={`${level1Key}-${level2Key}`}
                    level1Key={level1Key}
                    level2Key={level2Key}
                    trailsData={trailsData}
                    groupBy={groupBy}
                    expandedLevel2={expandedLevel2}
                    expandedTrails={expandedTrails}
                    toggleExpandLevel2={toggleExpandLevel2}
                    toggleExpandTrail={toggleExpandTrail}
                    toggleTrailDelete={toggleTrailDelete}
                    formatDateTime={formatDateTime}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Level1Accordion;
