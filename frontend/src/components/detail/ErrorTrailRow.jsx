
const ErrorTrailRow = ({ record, index }) => (
  <tr key={`${record.trailKey}-${index}`}>
    <td className="fw-bold">{record.participantSerial}</td>
    <td>{record.trailNumber}</td>
    <td>
      <small className="font-monospace">{record.difficultyId}</small>
    </td>
    <td>
      <span>{record.action}</span>
    </td>
    <td>
      <code className="small">{record.position}</code>
    </td>
    <td>
      <small className="font-monospace">{record.timestamp}</small>
    </td>
    <td>
      <small className="font-monospace">
        {record.eventTime !== null ? `${record.eventTime}ms` : '-'}
      </small>
    </td>
    <td>
      {record.hasDoubleClick ? (
        <span className="badge bg-warning text-dark">
          <i className="bi bi-cursor-fill me-1"></i>
          Yes
        </span>
      ) : (
        <span className="text-muted">-</span>
      )}
    </td>
  </tr>
);

export default ErrorTrailRow;
