
const ErrorTrailHeader = () => (
  <thead className="table-secondary">
    <tr>
      <th style={{ width: '120px' }}>
        <i className="bi bi-person me-1"></i>Participant
      </th>
      <th style={{ width: '80px' }}>
        <i className="bi bi-list-ol me-1"></i>Trail No
      </th>
      <th style={{ width: '120px' }}>
        <i className="bi bi-hash me-1"></i>ID (W/D)
      </th>
      <th style={{ width: '100px' }}>
        <i className="bi bi-play-circle me-1"></i>Action
      </th>
      <th style={{ width: '120px' }}>
        <i className="bi bi-geo me-1"></i>Position
      </th>
      <th style={{ width: '160px' }}>
        <i className="bi bi-clock me-1"></i>Timestamp
      </th>
      <th style={{ width: '100px' }}>
        <i className="bi bi-stopwatch me-1"></i>Event Time
      </th>
      <th style={{ width: '100px' }}>
        <i className="bi bi-cursor-fill me-1"></i>Double Click
      </th>
    </tr>
  </thead>
);

export default ErrorTrailHeader;
