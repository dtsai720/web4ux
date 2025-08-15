import React from 'react';
import { handleDoubleClick } from '../../utils/delete/deleteUtils';
import DeletedParticipantsList from './DeletedParticipantsList';

/**
 * Main container component for displaying deleted items
 * @param {Object} deletedParticipants - Object containing deleted participants
 * @param {Function} toggleParticipantDelete - Function to toggle participant deletion status
 * @param {Function} closeDeleteMode - Function to close delete mode
 * @returns {JSX.Element} - The deleted items container component
 */
const DeletedItemsContainer = ({
  deletedParticipants,
  toggleParticipantDelete,
  closeDeleteMode
}) => {

  return (
    <div className="card mb-4 border-warning">
      <div
        className="card-header bg-warning text-dark"
        onDoubleClick={handleDoubleClick(closeDeleteMode)}
        style={{ cursor: 'pointer' }}
        title="Double-click to go back"
      >
        <h5 className="mb-0">
          <i className="bi bi-trash me-2"></i>
          Deleted Participants
        </h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            <i className="bi bi-people me-1"></i>
            Deleted Participants ({Object.keys(deletedParticipants).length})
          </h6>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={closeDeleteMode}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
        </div>

        <DeletedParticipantsList
          deletedParticipants={deletedParticipants}
          toggleParticipantDelete={toggleParticipantDelete}
        />
      </div>
    </div>
  );
};

export default DeletedItemsContainer;
