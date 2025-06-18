import React from 'react';
import GroupBySelector from '../../components/detail/GroupBySelector';
import {
  LoadingIndicator,
  ErrorMessage,
  DetailRecordContent
} from '../../components/detail/record';

/**
 * Main component for displaying detail records
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Detail record data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Object} props.summaryInfo - Summary information
 * @param {string} props.groupBy - Current grouping option
 * @param {Object} props.groupByOptions - Available grouping options
 * @param {Function} props.handleGroupByChange - Function to handle group by change
 * @param {Object} props.expandedLevel1 - Object tracking expanded level 1 state
 * @param {Function} props.toggleExpandLevel1 - Function to toggle level 1 expansion
 * @param {Object} props.expandedLevel2 - Object tracking expanded level 2 state
 * @param {Function} props.toggleExpandLevel2 - Function to toggle level 2 expansion
 * @param {Object} props.expandedTrails - Object tracking expanded trail state
 * @param {Function} props.toggleExpandTrail - Function to toggle trail expansion
 * @param {Function} props.formatDateTime - Function to format timestamp
 * @param {Function} props.toggleTrailDelete - Function to toggle trail deletion
 * @param {Function} props.toggleParticipantDelete - Function to toggle participant deletion
 * @param {Function} props.setCurrentPage - Function to set the current page
 * @returns {JSX.Element} Detail record component
 */
const DetailRecordComponent = ({
  data,
  loading,
  error,
  summaryInfo,
  groupBy,
  groupByOptions,
  handleGroupByChange,
  expandedLevel1,
  toggleExpandLevel1,
  expandedLevel2,
  toggleExpandLevel2,
  expandedTrails,
  toggleExpandTrail,
  formatDateTime,
  toggleTrailDelete,
  toggleParticipantDelete,
  setCurrentPage
}) => {
  return (
    <>
      {/* Group By Selector */}
      <GroupBySelector
        groupBy={groupBy}
        groupByOptions={groupByOptions}
        handleGroupByChange={handleGroupByChange}
      />

      {/* Loading state */}
      {loading && <LoadingIndicator />}

      {/* Error message */}
      {error && <ErrorMessage error={error} />}

      {/* Grouped data */}
      {!loading && !error && (
        <DetailRecordContent
          data={data}
          groupBy={groupBy}
          groupByOptions={groupByOptions}
          expandedLevel1={expandedLevel1}
          expandedLevel2={expandedLevel2}
          expandedTrails={expandedTrails}
          toggleExpandLevel1={toggleExpandLevel1}
          toggleExpandLevel2={toggleExpandLevel2}
          toggleExpandTrail={toggleExpandTrail}
          toggleTrailDelete={toggleTrailDelete}
          formatDateTime={formatDateTime}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
};

export default DetailRecordComponent;
