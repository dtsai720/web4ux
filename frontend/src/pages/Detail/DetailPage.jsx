import React, { useState, useEffect } from 'react';
import OutlierAnalysisComponent from './OutlierAnalysisComponent';
import DeleteItemComponent from './DeleteItemComponent';
import MovementTimeMatrixComponent from './MoveTimeAnalysisComponent';
import ErrorTrailAnalysisComponent from './ErrorTrailAnalysisComponent';

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
import { DEFAULT_STATE } from '../../utils/detail/constants';

// Import UI components
import SummaryInfoCard from '../../components/detail/SummaryInfoCard';
import DetailPageHeader from '../../components/detail/DetailPageHeader';

const DetailPage = ({ setCurrentPage, selectedSummaryId }) => {
  // State management
  const [data, setData] = useState(DEFAULT_STATE.data);
  const [loading, setLoading] = useState(DEFAULT_STATE.loading);
  const [error, setError] = useState(DEFAULT_STATE.error);
  const [summaryInfo, setSummaryInfo] = useState(DEFAULT_STATE.summaryInfo);
  const [outlierMode, setOutlierMode] = useState(DEFAULT_STATE.outlierMode);
  const [outlierData, setOutlierData] = useState(DEFAULT_STATE.outlierData);
  const [selectedOutlierDevice, setSelectedOutlierDevice] = useState(DEFAULT_STATE.selectedOutlierDevice);
  const [selectedOutlierParticipant, setSelectedOutlierParticipant] = useState(DEFAULT_STATE.selectedOutlierParticipant);
  const [selectedOutlierTrail, setSelectedOutlierTrail] = useState(DEFAULT_STATE.selectedOutlierTrail);
  const [rawData, setRawData] = useState(DEFAULT_STATE.rawData);
  const [deletedTrails, setDeletedTrails] = useState(DEFAULT_STATE.deletedTrails);
  const [deletedParticipants, setDeletedParticipants] = useState(DEFAULT_STATE.deletedParticipants);
  const [deleteMode, setDeleteMode] = useState(DEFAULT_STATE.deleteMode);
  const [movementTimeMatrixMode, setMovementTimeMatrixMode] = useState(DEFAULT_STATE.movementTimeMatrixMode || false);
  const [errorTrailMode, setErrorTrailMode] = useState(DEFAULT_STATE.errorTrailMode || false);

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

      // Process and organize data for outlier analysis (always use by_device grouping)
      const organizedData = organizeData(result.rawData, 'by_device');
      setData(organizedData.data);

      // Collect deleted items
      const deletedItems = collectDeletedItems(result.rawData);
      setDeletedTrails(deletedItems.deletedTrails);
      setDeletedParticipants(deletedItems.deletedParticipants);

      // Set summary info
      setSummaryInfo(result.summaryInfo);
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
    // Data is always organized by device, so we can directly enable outlier mode
    // Also ensure other modes are disabled
    setOutlierMode(true);
    setDeleteMode(false);
    setMovementTimeMatrixMode(false);
    setErrorTrailMode(false);
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

  // Close delete mode and return to outlier analysis
  const closeDeleteMode = () => {
    setDeleteMode(false);
    setOutlierMode(true);
    setMovementTimeMatrixMode(false);
    setErrorTrailMode(false);
  };

  // Close movement time matrix mode and return to outlier analysis
  const closeMovementTimeMatrixMode = () => {
    setMovementTimeMatrixMode(false);
    setOutlierMode(true);
    setDeleteMode(false);
    setErrorTrailMode(false);
  };

  // Close error trail mode and return to outlier analysis
  const closeErrorTrailMode = () => {
    setErrorTrailMode(false);
    setOutlierMode(true);
    setDeleteMode(false);
    setMovementTimeMatrixMode(false);
  };


  // Load data when selectedSummaryId changes
  useEffect(() => {
    loadData();
    // Set outlier analysis mode as default instead of detail record mode
    setDeleteMode(false);
    setOutlierMode(true);
    setMovementTimeMatrixMode(false);
    setErrorTrailMode(false);
  }, [selectedSummaryId]);

  // Calculate outliers when outlierMode is activated
  useEffect(() => {
    if (outlierMode && rawData.length > 0) {
      // Calculate outliers for by_device grouped data
      const timer = setTimeout(() => {
        const outliers = calculateOutlierData(data, rawData);
        setOutlierData(outliers);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [outlierMode, rawData, data]);

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <DetailPageHeader
            setCurrentPage={setCurrentPage}
            deleteMode={deleteMode}
            outlierMode={outlierMode}
            movementTimeMatrixMode={movementTimeMatrixMode}
            errorTrailMode={errorTrailMode}
            setDeleteMode={setDeleteMode}
            setOutlierMode={setOutlierMode}
            setMovementTimeMatrixMode={setMovementTimeMatrixMode}
            setErrorTrailMode={setErrorTrailMode}
            calculateOutliers={calculateOutliers}
            closeOutlierMode={closeOutlierMode}
            closeDeleteMode={closeDeleteMode}
            closeMovementTimeMatrixMode={closeMovementTimeMatrixMode}
            closeErrorTrailMode={closeErrorTrailMode}
          />

          {/* Summary Information */}
          {summaryInfo && <SummaryInfoCard summaryInfo={summaryInfo} />}

          {/* Render the appropriate component based on mode */}
          {deleteMode ? (
            <DeleteItemComponent
              deletedParticipants={deletedParticipants}
              toggleParticipantDelete={handleToggleParticipantDelete}
              closeDeleteMode={closeDeleteMode}
            />
          ) : movementTimeMatrixMode ? (
            <MovementTimeMatrixComponent
              rawData={rawData}
              closeMovementTimeMatrixMode={closeMovementTimeMatrixMode}
            />
          ) : errorTrailMode ? (
            <ErrorTrailAnalysisComponent
              rawData={rawData}
              closeErrorTrailMode={closeErrorTrailMode}
            />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
