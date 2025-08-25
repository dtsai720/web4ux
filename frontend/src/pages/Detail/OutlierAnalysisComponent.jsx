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
  data,
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
      data={data}
      formatDateTime={formatDateTime}
      toggleParticipantDelete={toggleParticipantDelete}
    />
  );
};

export default OutlierAnalysisComponent;
