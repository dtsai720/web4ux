import React from 'react';

/**
 * Component to display records for a single trail
 *
 * @param {Object} props - Component props
 * @param {Array} props.records - Array of record objects
 * @param {Function} props.formatDateTime - Function to format timestamp
 * @returns {JSX.Element} Table of trail records
 */
const TrailRecord = ({ records, formatDateTime }) => {
  return (
    <div className="table-responsive">
      <table className="table table-sm table-striped">
        <thead className="table-dark">
          <tr>
            <th><i className="bi bi-tag me-1"></i>Mark</th>
            <th><i className="bi bi-calendar me-1"></i>DateTime</th>
            <th><i className="bi bi-clock me-1"></i>Timestamp</th>
            <th><i className="bi bi-clock me-1"></i>Position</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
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
              <td>
                <small>({record.x}, {record.y})</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrailRecord;
