const OutlierDeviceCard = ({ deviceKey, deviceData, onSelectDevice }) => {
  return (
    <div className="col-md-4 mb-3">
      <div className="border rounded p-3 h-100 bg-white">
        <h5 className="mb-3">{deviceKey}</h5>
        <div className="mb-2">
          <small className="text-muted">
            <i className="bi bi-people me-1"></i>
            {Object.keys(deviceData?.participants || {}).length} participants
          </small>
        </div>
        <div className="mb-3">
          <small className="text-muted">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {Object.values(deviceData?.participants || {}).filter(p => p?.isOutlier).length} outliers detected
          </small>
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => onSelectDevice(deviceKey)}
        >
          <i className="bi bi-graph-up me-1"></i> Analyze
        </button>
      </div>
    </div>
  );
};

export default OutlierDeviceCard;
