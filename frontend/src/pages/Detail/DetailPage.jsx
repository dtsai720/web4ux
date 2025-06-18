import React, { useState, useEffect } from 'react';
import DetailRecordComponent from './DetailRecordComponent';
import OutlierAnalysisComponent from './OutlierAnalysisComponent';
import DeleteItemComponent from './DeleteItemComponent';
import ResultAnalysisComponent from './ResultAnalysisComponent';

// Import utility functions
import {
  organizeData,
  collectDeletedItems,
  formatDateTime,
  calculateOutlierData
} from '../../utils/detail/dataUtils';
import {
  loadProjectData,
  toggleParticipantDelete,
  toggleTrailDelete
} from '../../utils/detail/apiUtils';
import { GROUP_BY_OPTIONS, DEFAULT_STATE } from '../../utils/detail/constants';

// Import UI components
import SummaryInfoCard from '../../components/detail/SummaryInfoCard';
import DetailPageHeader from '../../components/detail/DetailPageHeader';

const DetailPage = ({ setCurrentPage, selectedSummaryId }) => {
  // State management
  const [data, setData] = useState(DEFAULT_STATE.data);
  const [loading, setLoading] = useState(DEFAULT_STATE.loading);
  const [error, setError] = useState(DEFAULT_STATE.error);
  const [summaryInfo, setSummaryInfo] = useState(DEFAULT_STATE.summaryInfo);
  const [groupBy, setGroupBy] = useState(DEFAULT_STATE.groupBy);
  const [expandedLevel1, setExpandedLevel1] = useState(DEFAULT_STATE.expandedLevel1);
  const [expandedLevel2, setExpandedLevel2] = useState(DEFAULT_STATE.expandedLevel2);
  const [expandedTrails, setExpandedTrails] = useState(DEFAULT_STATE.expandedTrails);
  const [detailedData, setDetailedData] = useState(DEFAULT_STATE.detailedData);
  const [loadingDetailed, setLoadingDetailed] = useState(DEFAULT_STATE.loadingDetailed);
  const [outlierMode, setOutlierMode] = useState(DEFAULT_STATE.outlierMode);
  const [outlierData, setOutlierData] = useState(DEFAULT_STATE.outlierData);
  const [selectedOutlierDevice, setSelectedOutlierDevice] = useState(DEFAULT_STATE.selectedOutlierDevice);
  const [selectedOutlierParticipant, setSelectedOutlierParticipant] = useState(DEFAULT_STATE.selectedOutlierParticipant);
  const [selectedOutlierTrail, setSelectedOutlierTrail] = useState(DEFAULT_STATE.selectedOutlierTrail);
  const [rawData, setRawData] = useState(DEFAULT_STATE.rawData);
  const [deletedTrails, setDeletedTrails] = useState(DEFAULT_STATE.deletedTrails);
  const [deletedParticipants, setDeletedParticipants] = useState(DEFAULT_STATE.deletedParticipants);
  const [deleteMode, setDeleteMode] = useState(DEFAULT_STATE.deleteMode);
  const [resultMode, setResultMode] = useState(DEFAULT_STATE.resultMode);

  // Load data from API
  const loadData = async () => {
    if (!selectedSummaryId) {
      setError('No summary ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await loadProjectData(selectedSummaryId);

      setRawData(result.rawData);

      // Process and organize data
      const organizedData = organizeData(result.rawData, groupBy);
      setData(organizedData.data);

      // Collect deleted items
      const deletedItems = collectDeletedItems(result.rawData);
      setDeletedTrails(deletedItems.deletedTrails);
      setDeletedParticipants(deletedItems.deletedParticipants);

      // Set summary info
      setSummaryInfo(result.summaryInfo);

      // Expand first level1 item as default display
      if (Object.keys(organizedData.data).length > 0) {
        const firstLevel1Key = Object.keys(organizedData.data)[0];
        setExpandedLevel1({
          [firstLevel1Key]: true
        });

        // If there are level2 items, also expand the first one
        if (Object.keys(organizedData.data[firstLevel1Key]).length > 0) {
          const firstLevel2Key = Object.keys(organizedData.data[firstLevel1Key]).filter(key => key !== 'stats')[0];
          if (firstLevel2Key) {
            setExpandedLevel2({
              [`${firstLevel1Key}-${firstLevel2Key}`]: true
            });

            // If there are trail items, also expand the first one
            if (Object.keys(organizedData.data[firstLevel1Key][firstLevel2Key]).length > 0) {
              const firstTrailKey = Object.keys(organizedData.data[firstLevel1Key][firstLevel2Key]).filter(key => key !== 'stats')[0];
              if (firstTrailKey) {
                setExpandedTrails({
                  [`${firstLevel1Key}-${firstLevel2Key}-${firstTrailKey}`]: true
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  // Handle participant delete/restore
  const handleToggleParticipantDelete = async (deviceKey, participantKey, isDelete = true) => {
    try {
      const success = await toggleParticipantDelete(deviceKey, participantKey, rawData, isDelete);
      if (success) {
        // Reload data
        await loadData();
      }
    } catch (err) {
      console.error(`Toggle participant ${isDelete ? 'delete' : 'restore'} failed:`, err);
    }
  };

  // Handle trail delete/restore
  const handleToggleTrailDelete = async (deviceKey, participantKey, trailKey, isDelete = true) => {
    try {
      const success = await toggleTrailDelete(deviceKey, participantKey, trailKey, rawData, isDelete);
      if (success) {
        // Reload data
        await loadData();
      }
    } catch (err) {
      console.error(`Toggle trail ${isDelete ? 'delete' : 'restore'} failed:`, err);
    }
  };

  // Calculate outliers
  const calculateOutliers = () => {
    // Only calculate in by_device grouping mode
    if (groupBy !== 'by_device') {
      // If not in by_device mode, switch to by_device mode
      // Actual calculation will be handled in useEffect when groupBy changes
      setGroupBy('by_device');
      // Delay setting outlierMode to ensure data has been reorganized
      setTimeout(() => {
        setOutlierMode(true);
      }, 50);
      return;
    }

    // If already in by_device mode, set outlierMode directly
    // Actual calculation will be handled in useEffect
    setOutlierMode(true);
  };

  // Handle selecting outlier device
  const handleSelectOutlierDevice = (deviceKey) => {
    setSelectedOutlierDevice(deviceKey);
    setSelectedOutlierParticipant(null);
    setSelectedOutlierTrail(null);
  };

  // Handle selecting outlier participant
  const handleSelectOutlierParticipant = (participantKey) => {
    setSelectedOutlierParticipant(participantKey);
    setSelectedOutlierTrail(null);
  };

  // Handle selecting outlier trail
  const handleSelectOutlierTrail = (trailKey) => {
    setSelectedOutlierTrail(trailKey);
  };

  // Close outlier mode
  const closeOutlierMode = () => {
    setOutlierMode(false);
    setSelectedOutlierDevice(null);
    setSelectedOutlierParticipant(null);
    setSelectedOutlierTrail(null);
  };

  // Close delete mode
  const closeDeleteMode = () => {
    setDeleteMode(false);
  };

  // Close result mode
  const closeResultMode = () => {
    setResultMode(false);
  };

  // Toggle expand level1
  const toggleExpandLevel1 = (key) => {
    setExpandedLevel1(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle expand level2
  const toggleExpandLevel2 = (level1Key, level2Key) => {
    const combinedKey = `${level1Key}-${level2Key}`;
    setExpandedLevel2(prev => ({
      ...prev,
      [combinedKey]: !prev[combinedKey]
    }));
  };

  // Toggle expand trail
  const toggleExpandTrail = (level1Key, level2Key, trailKey) => {
    const combinedKey = `${level1Key}-${level2Key}-${trailKey}`;
    setExpandedTrails(prev => ({
      ...prev,
      [combinedKey]: !prev[combinedKey]
    }));
  };

  // Handle group by change
  const handleGroupByChange = (newGroupBy) => {
    setGroupBy(newGroupBy);
  };

  // Load data when selectedSummaryId changes
  useEffect(() => {
    loadData();
    // Ensure we're in detail record mode by default
    setDeleteMode(false);
    setOutlierMode(false);
    setResultMode(false);
  }, [selectedSummaryId]);

  // Calculate outliers when outlierMode is activated
  useEffect(() => {
    if (outlierMode && rawData.length > 0 && groupBy === 'by_device') {
      // Only calculate outliers when in by_device mode and not during the initial switch
      // Use a timeout to ensure data reorganization has completed
      const timer = setTimeout(() => {
        const outliers = calculateOutlierData(data, rawData);
        setOutlierData(outliers);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [outlierMode, rawData, groupBy, data]);

  // Reorganize data when groupBy changes
  useEffect(() => {
    if (rawData.length > 0) {
      const organizedData = organizeData(rawData, groupBy);
      setData(organizedData.data);

      // Reset expanded states
      setExpandedLevel1({});
      setExpandedLevel2({});
      setExpandedTrails({});
      setDetailedData({});

      // If in outlier mode and switched away from by_device, close outlier mode
      if (outlierMode && groupBy !== 'by_device') {
        closeOutlierMode();
      }
    }
  }, [groupBy, rawData]);

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <DetailPageHeader
            setCurrentPage={setCurrentPage}
            deleteMode={deleteMode}
            outlierMode={outlierMode}
            resultMode={resultMode}
            setDeleteMode={setDeleteMode}
            setOutlierMode={setOutlierMode}
            setResultMode={setResultMode}
            calculateOutliers={calculateOutliers}
            closeOutlierMode={closeOutlierMode}
            closeResultMode={closeResultMode}
          />

          {/* Summary Information */}
          {summaryInfo && <SummaryInfoCard summaryInfo={summaryInfo} />}

          {/* Render the appropriate component based on mode */}
          {outlierMode ? (
            <OutlierAnalysisComponent
              outlierData={outlierData}
              selectedOutlierDevice={selectedOutlierDevice}
              selectedOutlierParticipant={selectedOutlierParticipant}
              selectedOutlierTrail={selectedOutlierTrail}
              handleSelectOutlierDevice={handleSelectOutlierDevice}
              handleSelectOutlierParticipant={handleSelectOutlierParticipant}
              handleSelectOutlierTrail={handleSelectOutlierTrail}
              closeOutlierMode={closeOutlierMode}
              data={data}
              formatDateTime={formatDateTime}
              toggleTrailDelete={handleToggleTrailDelete}
              toggleParticipantDelete={handleToggleParticipantDelete}
            />
          ) : deleteMode ? (
            <DeleteItemComponent
              deletedTrails={deletedTrails}
              deletedParticipants={deletedParticipants}
              toggleTrailDelete={handleToggleTrailDelete}
              toggleParticipantDelete={handleToggleParticipantDelete}
              closeDeleteMode={closeDeleteMode}
            />
          ) : resultMode ? (
            <ResultAnalysisComponent
              rawData={rawData}
              closeResultMode={closeResultMode}
            />
          ) : (
            <DetailRecordComponent
              data={data}
              loading={loading}
              error={error}
              summaryInfo={summaryInfo}
              groupBy={groupBy}
              groupByOptions={GROUP_BY_OPTIONS}
              handleGroupByChange={handleGroupByChange}
              expandedLevel1={expandedLevel1}
              toggleExpandLevel1={toggleExpandLevel1}
              expandedLevel2={expandedLevel2}
              toggleExpandLevel2={toggleExpandLevel2}
              expandedTrails={expandedTrails}
              toggleExpandTrail={toggleExpandTrail}
              formatDateTime={formatDateTime}
              toggleTrailDelete={handleToggleTrailDelete}
              toggleParticipantDelete={handleToggleParticipantDelete}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
