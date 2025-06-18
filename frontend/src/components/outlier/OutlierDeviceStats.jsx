import React from 'react';

const OutlierDeviceStats = ({ deviceStats }) => {
  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <h6 className="mb-0">Device Statistics</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Avg Error Count</h6>
                <h4>{deviceStats?.avgErrorCount?.toFixed(2) || '0.00'}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">StdDev Error Count</h6>
                <h4>{deviceStats?.stdDevErrorCount?.toFixed(2) || '0.00'}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Avg Error Time</h6>
                <h4>{deviceStats?.avgErrorTime?.toFixed(2) || '0.00'}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">StdDev Error Time</h6>
                <h4>{deviceStats?.stdDevErrorTime?.toFixed(2) || '0.00'}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlierDeviceStats;
