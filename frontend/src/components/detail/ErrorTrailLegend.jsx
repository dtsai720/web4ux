
const ErrorTrailLegend = ({ totalRecords }) => (
  <div className="mt-3">
    <div className="row">
      <div className="col-md-6">
        <h6 className="text-muted">Actions:</h6>
        <div className="d-flex flex-wrap gap-2 mb-2">
          <span>start, target, others (extra clicks)</span>
        </div>
        <div className="small text-muted">
          <strong>Total Records:</strong> {totalRecords} error actions displayed
        </div>
      </div>
      <div className="col-md-6">
        <div className="small text-muted">
          <strong>Error Definition:</strong> All actions from trails with extra clicks between start and target<br/>
          <strong>ID (W/D):</strong> Difficulty calculated using Fitts' Law: log₂(distance/width + 1)<br/>
          <strong>Event Time:</strong> Time from trail start (ms)<br/>
          <strong>Sorting:</strong> Participant → Trail Number → Time
        </div>
      </div>
    </div>
  </div>
);

export default ErrorTrailLegend;
