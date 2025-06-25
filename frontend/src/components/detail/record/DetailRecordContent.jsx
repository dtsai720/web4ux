import React from 'react';
import { handleDoubleClick } from '../../../utils/detail/recordUtils';
import Level1Accordion from './Level1Accordion';
import EmptyState from './EmptyState';

/**
 * Component to display the main content of detail records
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Detail record data
 * @param {string} props.groupBy - Current grouping option
 * @param {Object} props.groupByOptions - Available grouping options
 * @param {Object} props.expandedLevel1 - Object tracking expanded level 1 state
 * @param {Object} props.expandedLevel2 - Object tracking expanded level 2 state
 * @param {Object} props.expandedTrails - Object tracking expanded trail state
 * @param {Function} props.toggleExpandLevel1 - Function to toggle level 1 expansion
 * @param {Function} props.toggleExpandLevel2 - Function to toggle level 2 expansion
 * @param {Function} props.toggleExpandTrail - Function to toggle trail expansion
 * @param {Function} props.toggleTrailDelete - Function to toggle trail deletion
 * @param {Function} props.formatDateTime - Function to format timestamp
 * @param {Function} props.navigate - Function to navigate to a different page
 * @returns {JSX.Element} Detail record content
 */
const DetailRecordContent = ({
  data,
  groupBy,
  groupByOptions,
  expandedLevel1,
  expandedLevel2,
  expandedTrails,
  toggleExpandLevel1,
  toggleExpandLevel2,
  toggleExpandTrail,
  toggleTrailDelete,
  formatDateTime,
  navigate
}) => {
  return (
    <div className="card border-success">
      <div
        className="card-header bg-success text-white"
        onDoubleClick={() => navigate('/summary')}
        style={{ cursor: 'pointer' }}
        title="Double-click to go back to summary"
      >
        <h5 className="mb-0">
          <i className="bi bi-table me-2"></i>
          Detail Records - {groupByOptions[groupBy].label}
        </h5>
        <small className="opacity-75">{groupByOptions[groupBy].structure}</small>
      </div>
      <div className="card-body">
        {Object.keys(data).length > 0 ? (
          <div className="accordion" id="detailAccordion">
            {/* Level 1 */}
            {Object.keys(data).sort().map(level1Key => (
              <Level1Accordion
                key={level1Key}
                level1Key={level1Key}
                level2Data={data[level1Key]}
                groupBy={groupBy}
                expandedLevel1={expandedLevel1}
                expandedLevel2={expandedLevel2}
                expandedTrails={expandedTrails}
                toggleExpandLevel1={toggleExpandLevel1}
                toggleExpandLevel2={toggleExpandLevel2}
                toggleExpandTrail={toggleExpandTrail}
                toggleTrailDelete={toggleTrailDelete}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default DetailRecordContent;
