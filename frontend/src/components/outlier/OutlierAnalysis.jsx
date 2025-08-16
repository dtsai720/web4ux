import React, { useState } from 'react';
import OutlierDeviceDifficultyTable from './OutlierDeviceDifficultyTable';
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
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'device-analysis'

  // Get the first device as default if none selected
  const defaultDevice = selectedOutlierDevice || Object.keys(outlierData)[0];
  const currentDevice = selectedOutlierDevice || defaultDevice;

  // If we're in deep navigation (participant or trail selected), show navigation
  if (selectedOutlierParticipant) {
    return (
      <div className="card mb-4 border-info">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="bi bi-graph-up me-2"></i>
            Outlier Analysis
          </h5>
          <small className="text-white">
            Note: All calculations consider both available and calculable trails that are not deleted. Outlier detection is based on mean + 2 standard deviations.
          </small>
        </div>
        <div className="card-body">
          <OutlierNavigation
            selectedDevice={currentDevice}
            selectedParticipant={selectedOutlierParticipant}
            selectedTrail={selectedOutlierTrail}
            onBackToDevices={() => {
              handleSelectOutlierDevice(null);
              handleSelectOutlierParticipant(null);
              handleSelectOutlierTrail(null);
            }}
            onBackToParticipants={() => {
              handleSelectOutlierParticipant(null);
              handleSelectOutlierTrail(null);
            }}
            onBackToTrails={() => handleSelectOutlierTrail(null)}
          />

          {selectedOutlierTrail ? (
            <OutlierTrailDetails
              data={data}
              deviceKey={currentDevice}
              participantKey={selectedOutlierParticipant}
              trailKey={selectedOutlierTrail}
              formatDateTime={formatDateTime}
            />
          ) : (
            <OutlierTrailTable
              errorTrails={outlierData[currentDevice]?.participants[selectedOutlierParticipant]?.errorTrails}
              data={data}
              deviceKey={currentDevice}
              participantKey={selectedOutlierParticipant}
            />
          )}
        </div>
      </div>
    );
  }

  // Main view: show components based on mode
  return (
    <div className="card mb-4 border-info">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Outlier Analysis
        </h5>
        <small className="text-white">
          Note: All calculations consider both available and calculable trails that are not deleted. Outlier detection is based on mean + 2 standard deviations.
        </small>
      </div>
      <div className="card-body">
        {/* Mode Selection Buttons */}
        <div className="btn-toolbar mb-4" role="toolbar">
          <div className="btn-group me-2 mb-2" role="group">
            <button
              className={`btn ${viewMode === 'overview' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setViewMode('overview')}
            >
              <i className="bi bi-grid-3x3 me-1"></i>
              Device Overview
            </button>
          </div>
          <div className="btn-group mb-2" role="group">
            <button
              className={`btn ${viewMode === 'device-analysis' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('device-analysis')}
            >
              <i className="bi bi-person-lines-fill me-1"></i>
              Device Analysis
            </button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overview' ? (
          // Overview Mode: Device vs Difficulty Analysis
          <OutlierDeviceDifficultyTable
            outlierData={outlierData}
            data={data}
          />
        ) : (
          // Device Analysis Mode
          <div>
            {/* Device Selector */}
            <div className="card mb-3 border-primary">
              <div className="card-body py-2">
                <div className="d-flex align-items-center">
                  <label className="form-label mb-0 me-3 fw-bold">
                    <i className="bi bi-hdd me-1"></i>
                    Device:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: '200px' }}
                    value={currentDevice}
                    onChange={(e) => handleSelectOutlierDevice(e.target.value)}
                  >
                    {Object.keys(outlierData).map(deviceKey => (
                      <option key={deviceKey} value={deviceKey}>
                        {deviceKey}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Participant vs Difficulty Analysis for selected device */}
            <OutlierDeviceDifficultyTable
              outlierData={outlierData}
              data={data}
              selectedDevice={currentDevice}
              showParticipantView={true}
            />

            {/* Participants table for selected device */}
            <OutlierParticipantTable
              participants={outlierData[currentDevice]?.participants}
              onSelectParticipant={handleSelectOutlierParticipant}
              onToggleParticipantDelete={toggleParticipantDelete}
              deviceKey={currentDevice}
              data={data}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlierAnalysis;
