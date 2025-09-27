import React from 'react';

const SearchFilterCard = ({
  searchName,
  setSearchName,
  searchCreator,
  setSearchCreator,
  handleReset
}) => (
  <div className="card shadow-sm mb-4">
    <div className="card-header bg-light">
      <h5 className="card-title mb-0">
        <span className="me-2">🔍</span>
        Search & Filter
      </h5>
    </div>
    <div className="card-body">
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label fw-semibold">Project Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter project name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Creator</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter creator name..."
            value={searchCreator}
            onChange={(e) => setSearchCreator(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btn-outline-secondary"
            onClick={handleReset}
          >
            <span className="me-1">🔄</span>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SearchFilterCard;
