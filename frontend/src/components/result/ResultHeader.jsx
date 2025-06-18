import React from 'react';

/**
 * Header component for the result analysis section
 * Includes double-click functionality to go back
 */
const ResultHeader = ({ onDoubleClick }) => {
  return (
    <div
      className="card-header bg-success text-white"
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'pointer' }}
      title="Double-click to go back"
    >
      <h5 className="mb-0">
        <i className="bi bi-bar-chart-line me-2"></i>
        Result Analysis
      </h5>
      <small className="text-white">
        Note: All calculations consider both available and calculable trails that are not deleted.
      </small>
    </div>
  );
};

export default ResultHeader;
