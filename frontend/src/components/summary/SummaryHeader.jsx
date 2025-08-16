import React from 'react';

/**
 * Header component for the Summary page
 *
 * @returns {JSX.Element} Summary header component
 */
const SummaryHeader = () => {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <h1 className="display-6 fw-bold text-dark mb-2">Projects Dashboard</h1>
        <p className="text-muted">Search, filter and manage your projects</p>
      </div>
    </div>
  );
};

export default SummaryHeader;
