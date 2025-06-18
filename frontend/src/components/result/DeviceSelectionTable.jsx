import React from 'react';

/**
 * Table component for selecting devices for analysis
 */
const DeviceSelectionTable = ({ resultData, onSelectDevice }) => {
  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">Select a Device</h6>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Device</th>
              <th>Widths</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(resultData).map(device => (
              <tr key={device}>
                <td>{device}</td>
                <td>{Object.keys(resultData[device].widths).length}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onSelectDevice(device, 'analyze')}
                  >
                    <i className="bi bi-search me-1"></i> Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceSelectionTable;
