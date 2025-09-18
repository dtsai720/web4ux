import ErrorTrailHeader from './ErrorTrailHeader';
import ErrorTrailRow from './ErrorTrailRow';
import ErrorTrailLegend from './ErrorTrailLegend';
import { processErrorTrails } from './errorTrailUtils';

const ErrorTrailTable = ({ errorTrails, selectedDevice }) => {
  if (!errorTrails || errorTrails.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No error trails found for Device: <strong>{selectedDevice}</strong>
        <div className="mt-2 small text-muted">
          Error trails are defined as trails where extra clicks occur between start and target actions.
        </div>
      </div>
    );
  }

  const allErrorRecords = processErrorTrails(errorTrails);

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-sm table-hover">
          <ErrorTrailHeader />
          <tbody>
            {allErrorRecords.map((record, index) => (
              <ErrorTrailRow key={`${record.trailKey}-${index}`} record={record} index={index} />
            ))}
          </tbody>
        </table>
      </div>
      <ErrorTrailLegend totalRecords={allErrorRecords.length} />
    </div>
  );
};

export default ErrorTrailTable;
