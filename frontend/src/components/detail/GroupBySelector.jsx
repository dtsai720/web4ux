import React from 'react';

/**
 * Component for group by selector
 * @param {Object} props - Component props
 * @param {String} props.groupBy - Current grouping type
 * @param {Object} props.groupByOptions - Available grouping options
 * @param {Function} props.handleGroupByChange - Function to handle group by change
 */
const GroupBySelector = ({ groupBy, groupByOptions, handleGroupByChange }) => {
  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">
          <i className="bi bi-grid-3x3-gap me-2"></i>
          Data Organization
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          {Object.keys(groupByOptions).map(option => (
            <div className="col-md-6 mb-2" key={option}>
              <div
                className={`card ${groupBy === option ? 'border-primary' : 'border-light'}`}
                onClick={() => handleGroupByChange(option)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`card-body ${groupBy === option ? 'bg-light' : ''}`}>
                  <div className="d-flex align-items-center">
                    <div className="me-3 fs-3">
                      {groupByOptions[option].icon}
                    </div>
                    <div>
                      <h6 className="mb-1">{groupByOptions[option].label}</h6>
                      <p className="mb-1 small text-muted">{groupByOptions[option].description}</p>
                      <div className="small">
                        <span className={`badge ${groupBy === option ? 'bg-primary' : 'bg-secondary'}`}>
                          {groupByOptions[option].structure}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupBySelector;
