import React from 'react';

const OutlierTrailDetails = ({ data, deviceKey, participantKey, trailKey, formatDateTime }) => {
  return (
    <div className="card">
      <div className="card-header bg-light">
        <h6 className="mb-0">Trail Details</h6>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm table-striped">
            <thead className="table-dark">
              <tr>
                <th><i className="bi bi-tag me-1"></i>Mark</th>
                <th><i className="bi bi-calendar me-1"></i>DateTime</th>
                <th><i className="bi bi-clock me-1"></i>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data[deviceKey]?.[participantKey]?.[trailKey]?.map((record, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`badge ${record.mark === 'start' ? 'bg-primary' : record.mark === 'target' ? 'bg-success' : 'bg-secondary'}`}>
                      {record.mark}
                    </span>
                  </td>
                  <td>
                    <small>{formatDateTime(record.timestamp)}</small>
                  </td>
                  <td>
                    <small>{record.timestamp}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutlierTrailDetails;
