import React from 'react';

const OutlierDeviceCard = ({ deviceKey, deviceData, onSelectDevice }) => {
  return (
    <div className="col-md-4 mb-3">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{deviceKey}</h5>
          <p className="card-text">
            <small className="text-muted">
              <i className="bi bi-people me-1"></i>
              {Object.keys(deviceData?.participants || {}).length} participants
            </small>
          </p>
          <p className="card-text">
            <small className="text-muted">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {Object.values(deviceData?.participants || {}).filter(p => p?.isOutlier).length} outliers detected
            </small>
          </p>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onSelectDevice(deviceKey)}
          >
            <i className="bi bi-graph-up me-1"></i> Analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutlierDeviceCard;
