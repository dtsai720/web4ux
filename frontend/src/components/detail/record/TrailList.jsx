import React from 'react';
import TrailItem from './TrailItem';

/**
 * Component to display a list of trails
 *
 * @param {Object} props - Component props
 * @param {string} props.level1Key - Level 1 key (device or participant)
 * @param {string} props.level2Key - Level 2 key (participant or device)
 * @param {Object} props.trailsData - Object containing trail data
 * @param {Object} props.expandedTrails - Object tracking expanded trail state
 * @param {Function} props.toggleExpandTrail - Function to toggle trail expansion
 * @param {Function} props.toggleTrailDelete - Function to toggle trail deletion
 * @param {Function} props.formatDateTime - Function to format timestamp
 * @returns {JSX.Element} List of trails
 */
const TrailList = ({
  level1Key,
  level2Key,
  trailsData,
  expandedTrails,
  toggleExpandTrail,
  toggleTrailDelete,
  formatDateTime
}) => {
  return (
    <div className="row mb-3">
      <div className="col-12">
        <h6 className="border-bottom pb-2">
          <i className="bi bi-list-ul me-2"></i>
          Trails ({Object.keys(trailsData).filter(key => key !== 'stats').length})
        </h6>

        {/* Display Trails */}
        {Object.entries(trailsData).filter(([key]) => key !== 'stats').map(([trailKey, records]) => {
          const trailStats = records.stats || {};
          const combinedKey = `${level1Key}-${level2Key}-${trailKey}`;
          const isExpanded = expandedTrails[combinedKey] || false;

          return (
            <TrailItem
              key={combinedKey}
              level1Key={level1Key}
              level2Key={level2Key}
              trailKey={trailKey}
              records={records}
              trailStats={trailStats}
              isExpanded={isExpanded}
              toggleExpandTrail={toggleExpandTrail}
              toggleTrailDelete={toggleTrailDelete}
              formatDateTime={formatDateTime}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrailList;
