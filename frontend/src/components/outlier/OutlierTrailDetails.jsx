import React from 'react';
import { BADGE_CLASSES } from '../../constants/outlierConstants';

const TABLE_HEADERS = [
  { icon: 'bi-tag', text: 'Mark' },
  { icon: 'bi-calendar', text: 'DateTime' },
  { icon: 'bi-clock', text: 'Timestamp' },
  { icon: 'bi-clock', text: 'Position' }
];

const TrailRecord = ({ record, formatDateTime }) => (
  <tr>
    <td>
      <span className={`badge ${BADGE_CLASSES[record.mark] || BADGE_CLASSES.default}`}>
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
);

const OutlierTrailDetails = ({ data, deviceKey, participantKey, trailKey, formatDateTime }) => {
  const trailData = data[deviceKey]?.[participantKey]?.[trailKey] || [];

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
                {TABLE_HEADERS.map(({ icon, text }) => (
                  <th key={text}>
                    <i className={`bi ${icon} me-1`}></i>{text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trailData.map((record, idx) => (
                <TrailRecord
                  key={idx}
                  record={record}
                  formatDateTime={formatDateTime}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutlierTrailDetails;
