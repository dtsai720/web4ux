import React from 'react';
import OutlierAnalysis from '../../components/outlier';
import { formatDateTime } from '../../utils/outlier';

const OutlierAnalysisComponent = ({
  outlierData,
  selectedOutlierDevice,
  selectedOutlierParticipant,
  selectedOutlierTrail,
  handleSelectOutlierDevice,
  handleSelectOutlierParticipant,
  handleSelectOutlierTrail,
  closeOutlierMode,
  data,
  toggleTrailDelete,
  toggleParticipantDelete
}) => {
  return (
    <OutlierAnalysis
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
      toggleTrailDelete={toggleTrailDelete}
      toggleParticipantDelete={toggleParticipantDelete}
    />
  );
};

export default OutlierAnalysisComponent;
