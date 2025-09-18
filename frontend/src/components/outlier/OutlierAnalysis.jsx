import { useState } from 'react';
import OutlierDeviceDifficultyTable from './OutlierDeviceDifficultyTable';
import OutlierParticipantTable from './OutlierParticipantTable';
import OutlierTrailTable from './OutlierTrailTable';
import OutlierTrailDetails from './OutlierTrailDetails';
import OutlierNavigation from './OutlierNavigation';

const ANALYSIS_NOTE = "Note: All calculations use valid trails (available + calculable) that are not deleted. Outliers are identified as participants exceeding mean + 2 standard deviations for error count or error time.";

// Header component for the analysis
const AnalysisHeader = () => (
  <div className="bg-primary text-white p-3">
    <h5 className="mb-0">
      <i className="bi bi-graph-up me-2"></i>
      Outlier Analysis
    </h5>
    <small className="text-white">{ANALYSIS_NOTE}</small>
  </div>
);

// View mode selection buttons
const ViewModeButtons = ({ viewMode, setViewMode }) => (
  <div className="d-flex gap-2 mb-4">
    <button
      className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
      onClick={() => setViewMode('overview')}
    >
      <i className="bi bi-grid-3x3 me-1"></i>
      Device Overview
    </button>
    <button
      className={`btn ${viewMode === 'device-analysis' ? 'btn-primary' : 'btn-outline-primary'}`}
      onClick={() => setViewMode('device-analysis')}
    >
      <i className="bi bi-tablet me-1"></i>
      Device Analysis
    </button>
  </div>
);

// Device selector component
const DeviceSelector = ({ currentDevice, outlierData, handleSelectOutlierDevice }) => (
  <div className="d-flex align-items-center border border-primary rounded p-2 mb-3">
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
);

// Custom hover handlers for warning button
const createHoverHandlers = (participantViewMode) => ({
  onMouseEnter: (e) => {
    if (participantViewMode !== 'participant-analysis') {
      e.target.style.backgroundColor = '#ffc107';
      e.target.style.borderColor = '#ffc107';
      e.target.style.color = 'white';
    }
  },
  onMouseLeave: (e) => {
    if (participantViewMode !== 'participant-analysis') {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.borderColor = '#b8860b';
      e.target.style.color = '#b8860b';
    }
  }
});

// Participant mode selection buttons
const ParticipantModeButtons = ({ participantViewMode, setParticipantViewMode }) => {
  const hoverHandlers = createHoverHandlers(participantViewMode);

  return (
    <div className="d-flex gap-2 mb-4">
      <button
        className={`btn ${participantViewMode === 'participant-overview' ? 'btn-success' : 'btn-outline-success'}`}
        onClick={() => setParticipantViewMode('participant-overview')}
      >
        <i className="bi bi-grid-3x3 me-1"></i>
        Participant Overview
      </button>
      <button
        className={`btn ${participantViewMode === 'participant-analysis' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
        onClick={() => setParticipantViewMode('participant-analysis')}
        style={{
          color: participantViewMode === 'participant-analysis' ? '' : '#b8860b',
          borderColor: participantViewMode === 'participant-analysis' ? '' : '#b8860b',
          transition: 'all 0.15s ease-in-out'
        }}
        {...hoverHandlers}
      >
        <i className="bi bi-people me-1"></i>
        Participant Analysis
      </button>
    </div>
  );
};

// Deep navigation view (when participant is selected)
const DeepNavigationView = ({
  currentDevice,
  selectedOutlierParticipant,
  selectedOutlierTrail,
  handleSelectOutlierDevice,
  handleSelectOutlierParticipant,
  handleSelectOutlierTrail,
  outlierData,
  data,
  formatDateTime
}) => (
  <div className="mb-4 border border-primary rounded">
    <AnalysisHeader />
    <div className="p-3">
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

// Device analysis mode content
const DeviceAnalysisContent = ({
  currentDevice,
  outlierData,
  handleSelectOutlierDevice,
  participantViewMode,
  setParticipantViewMode,
  data,
  handleSelectOutlierParticipant,
  toggleParticipantDelete
}) => (
  <div>
    <DeviceSelector
      currentDevice={currentDevice}
      outlierData={outlierData}
      handleSelectOutlierDevice={handleSelectOutlierDevice}
    />

    <ParticipantModeButtons
      participantViewMode={participantViewMode}
      setParticipantViewMode={setParticipantViewMode}
    />

    {participantViewMode === 'participant-overview' ? (
      <OutlierDeviceDifficultyTable
        data={data}
        selectedDevice={currentDevice}
        deviceStats={outlierData[currentDevice]?.stats}
        showParticipantView={true}
      />
    ) : (
      <OutlierParticipantTable
        participants={outlierData[currentDevice]?.participants}
        deviceStats={outlierData[currentDevice]?.stats}
        onSelectParticipant={handleSelectOutlierParticipant}
        onToggleParticipantDelete={toggleParticipantDelete}
        deviceKey={currentDevice}
        data={data}
      />
    )}
  </div>
);

const OutlierAnalysis = ({
  outlierData,
  selectedOutlierDevice,
  selectedOutlierParticipant,
  selectedOutlierTrail,
  handleSelectOutlierDevice,
  handleSelectOutlierParticipant,
  handleSelectOutlierTrail,
  data,
  formatDateTime,
  toggleParticipantDelete
}) => {
  const [viewMode, setViewMode] = useState('overview');
  const [participantViewMode, setParticipantViewMode] = useState('participant-overview');

  const defaultDevice = selectedOutlierDevice || Object.keys(outlierData)[0];
  const currentDevice = selectedOutlierDevice || defaultDevice;

  // If we're in deep navigation (participant or trail selected), show navigation
  if (selectedOutlierParticipant) {
    return (
      <DeepNavigationView
        currentDevice={currentDevice}
        selectedOutlierParticipant={selectedOutlierParticipant}
        selectedOutlierTrail={selectedOutlierTrail}
        handleSelectOutlierDevice={handleSelectOutlierDevice}
        handleSelectOutlierParticipant={handleSelectOutlierParticipant}
        handleSelectOutlierTrail={handleSelectOutlierTrail}
        outlierData={outlierData}
        data={data}
        formatDateTime={formatDateTime}
      />
    );
  }

  // Main view: show components based on mode
  return (
    <div className="mb-4 border border-primary rounded">
      <AnalysisHeader />
      <div className="p-3">
        <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />

        {viewMode === 'overview' ? (
          <OutlierDeviceDifficultyTable data={data} />
        ) : (
          <DeviceAnalysisContent
            currentDevice={currentDevice}
            outlierData={outlierData}
            handleSelectOutlierDevice={handleSelectOutlierDevice}
            participantViewMode={participantViewMode}
            setParticipantViewMode={setParticipantViewMode}
            data={data}
            handleSelectOutlierParticipant={handleSelectOutlierParticipant}
            toggleParticipantDelete={toggleParticipantDelete}
          />
        )}
      </div>
    </div>
  );
};

export default OutlierAnalysis;
