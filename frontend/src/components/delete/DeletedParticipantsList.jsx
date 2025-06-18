import React from 'react';
import EmptyStateMessage from './EmptyStateMessage';

/**
 * Component to display a list of deleted participants
 * @param {Object} deletedParticipants - Object containing deleted participants
 * @param {Function} toggleParticipantDelete - Function to toggle participant deletion status
 * @returns {JSX.Element} - The deleted participants list component
 */
const DeletedParticipantsList = ({ deletedParticipants, toggleParticipantDelete }) => {
  if (Object.keys(deletedParticipants).length === 0) {
    return <EmptyStateMessage message="No deleted participants found." />;
  }

  return (
    <div className="list-group">
      {Object.entries(deletedParticipants).map(([key, participant]) => (
        <div key={key} className="list-group-item list-group-item-action">
          <div className="d-flex w-100 justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">
                <i className="bi bi-display me-1 text-primary"></i>
                {participant.device} /
                <i className="bi bi-person me-1 ms-2 text-success"></i>
                {participant.participant} ({participant.participantName})
              </h6>
              <small className="text-muted">
                {participant.trailCount} trails / {participant.recordCount} records deleted
              </small>
            </div>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => toggleParticipantDelete(participant.device, participant.participant, false)}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Restore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeletedParticipantsList;
