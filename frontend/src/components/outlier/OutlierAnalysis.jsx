import React from 'react';
import OutlierDeviceCard from './OutlierDeviceCard';
import OutlierDeviceStats from './OutlierDeviceStats';
import OutlierParticipantTable from './OutlierParticipantTable';
import OutlierTrailTable from './OutlierTrailTable';
import OutlierTrailDetails from './OutlierTrailDetails';
import OutlierNavigation from './OutlierNavigation';

const OutlierAnalysis = ({
  outlierData,
  selectedOutlierDevice,
  selectedOutlierParticipant,
  selectedOutlierTrail,
  handleSelectOutlierDevice,
  handleSelectOutlierParticipant,
  handleSelectOutlierTrail,
  closeOutlierMode,
  data,
  formatDateTime,
  toggleTrailDelete,
  toggleParticipantDelete
}) => {
  return (
    <div className="card mb-4 border-info">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Outlier Analysis
        </h5>
        <small className="text-white">
          Note: All calculations only consider available and not deleted trails. Outlier detection is based on mean + 2 standard deviations.
        </small>
      </div>
      <div className="card-body">
        {selectedOutlierDevice ? (
          <div>
            <OutlierNavigation
              selectedDevice={selectedOutlierDevice}
              selectedParticipant={selectedOutlierParticipant}
              selectedTrail={selectedOutlierTrail}
              onBackToDevices={() => handleSelectOutlierDevice(null)}
              onBackToParticipants={() => handleSelectOutlierParticipant(null)}
              onBackToTrails={() => handleSelectOutlierTrail(null)}
            />

            {selectedOutlierParticipant ? (
              <div>
                {selectedOutlierTrail ? (
                  <OutlierTrailDetails
                    data={data}
                    deviceKey={selectedOutlierDevice}
                    participantKey={selectedOutlierParticipant}
                    trailKey={selectedOutlierTrail}
                    formatDateTime={formatDateTime}
                  />
                ) : (
                  <OutlierTrailTable
                    errorTrails={outlierData[selectedOutlierDevice]?.participants[selectedOutlierParticipant]?.errorTrails}
                    data={data}
                    deviceKey={selectedOutlierDevice}
                    participantKey={selectedOutlierParticipant}
                    onSelectTrail={handleSelectOutlierTrail}
                    onToggleTrailDelete={toggleTrailDelete}
                  />
                )}
              </div>
            ) : (
              <div>
                <OutlierDeviceStats
                  deviceStats={outlierData[selectedOutlierDevice]?.stats}
                />

                <OutlierParticipantTable
                  participants={outlierData[selectedOutlierDevice]?.participants}
                  onSelectParticipant={handleSelectOutlierParticipant}
                  onToggleParticipantDelete={toggleParticipantDelete}
                  deviceKey={selectedOutlierDevice}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <h6 className="border-bottom pb-2 mb-3">Select a Device to Analyze</h6>
            <div className="row">
              {Object.keys(outlierData).map(deviceKey => (
                <OutlierDeviceCard
                  key={deviceKey}
                  deviceKey={deviceKey}
                  deviceData={outlierData[deviceKey]}
                  onSelectDevice={handleSelectOutlierDevice}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlierAnalysis;
