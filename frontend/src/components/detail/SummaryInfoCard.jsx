import React from 'react';

/**
 * Component to display summary information in a card
 * @param {Object} props - Component props
 * @param {Object} props.summaryInfo - Summary information object
 */
const SummaryInfoCard = ({ summaryInfo }) => {
  if (!summaryInfo) return null;

  return (
    <div className="card mb-4 border-primary">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-info-circle me-2"></i>
          Summary Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-file-text me-2 text-primary"></i>
              <div>
                <small className="text-muted">Name</small>
                <div><strong>{summaryInfo.name}</strong></div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-person me-2 text-success"></i>
              <div>
                <small className="text-muted">Creator</small>
                <div><strong>{summaryInfo.creator}</strong></div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-clock me-2 text-info"></i>
              <div>
                <small className="text-muted">Last Updated</small>
                <div><strong>{new Date(summaryInfo.updatedAt).toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryInfoCard;
