import React from 'react';

/**
 * Search and filter card component for the Summary page
 *
 * @param {Object} props - Component props
 * @param {string} props.searchName - Search name value
 * @param {Function} props.setSearchName - Function to update search name
 * @param {string} props.searchCreator - Search creator value
 * @param {Function} props.setSearchCreator - Function to update search creator
 * @param {Function} props.handleReset - Function to reset all filters
 * @returns {JSX.Element} Search and filter card component
 */
const SearchFilterCard = ({
  searchName,
  setSearchName,
  searchCreator,
  setSearchCreator,
  handleReset
}) => {
  return (
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
            <label className="form-label fw-semibold">Search by Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Search by Creator</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter creator..."
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
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterCard;
