import React from 'react';

/**
 * Empty state component for when no detail records are found
 * @returns {JSX.Element} Empty state message
 */
const EmptyState = () => {
  return (
    <div className="text-center p-4">
      <i className="bi bi-inbox fs-1 text-muted"></i>
      <h5 className="mt-3">No Detail Records Found</h5>
      <p className="text-muted">This summary has no associated detail records</p>
    </div>
  );
};

export default EmptyState;
