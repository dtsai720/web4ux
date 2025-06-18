import React from 'react';

const OutlierNavigation = ({
  selectedDevice,
  selectedParticipant,
  selectedTrail,
  onBackToDevices,
  onBackToParticipants,
  onBackToTrails
}) => {
  return (
    <div>
      {selectedDevice && (
        <div className="d-flex align-items-center mb-3">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={onBackToDevices}
          >
            <i className="bi bi-arrow-left"></i> Back to Devices
          </button>
          <h5 className="mb-0">Device: {selectedDevice}</h5>
        </div>
      )}

      {selectedParticipant && (
        <div className="d-flex align-items-center mb-3">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={onBackToParticipants}
          >
            <i className="bi bi-arrow-left"></i> Back to Participants
          </button>
          <h6 className="mb-0">Participant: {selectedParticipant}</h6>
        </div>
      )}

      {selectedTrail && (
        <div className="d-flex align-items-center mb-3">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={onBackToTrails}
          >
            <i className="bi bi-arrow-left"></i> Back to Trails
          </button>
          <h6 className="mb-0">Trail: {selectedTrail}</h6>
        </div>
      )}
    </div>
  );
};

export default OutlierNavigation;
