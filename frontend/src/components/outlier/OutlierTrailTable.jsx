import React from 'react';

const OutlierTrailTable = ({
  errorTrails,
  data,
  deviceKey,
  participantKey,
  onSelectTrail,
  onToggleTrailDelete
}) => {
  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">Error Trails</h6>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Trail</th>
              <th>Error Time</th>
              <th>Event Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {errorTrails?.map(trailKey => (
              <tr key={trailKey}>
                <td>Trail {trailKey}</td>
                <td>{data[deviceKey]?.[participantKey]?.[trailKey]?.stats?.error_time || 0}</td>
                <td>{data[deviceKey]?.[participantKey]?.[trailKey]?.stats?.event_time || 0}ms</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => onSelectTrail(trailKey)}
                  >
                    <i className="bi bi-eye me-1"></i> View
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onToggleTrailDelete(deviceKey, participantKey, trailKey, true)}
                  >
                    <i className="bi bi-trash me-1"></i> Delete
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

export default OutlierTrailTable;
