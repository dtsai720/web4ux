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
    <>
      <h6 className="border-bottom pb-2 mb-3 bg-light p-2 rounded">Trail Details</h6>
      <table className="table table-sm table-striped table-responsive">
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
    </>
  );
};

export default OutlierTrailDetails;
