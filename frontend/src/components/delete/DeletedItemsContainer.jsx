import React, { useState } from 'react';
import { handleDoubleClick } from '../../utils/delete/deleteUtils';
import DeletedItemsTabs from './DeletedItemsTabs';
import DeletedTrailsList from './DeletedTrailsList';
import DeletedParticipantsList from './DeletedParticipantsList';

/**
 * Main container component for displaying deleted items
 * @param {Object} deletedTrails - Object containing deleted trails
 * @param {Object} deletedParticipants - Object containing deleted participants
 * @param {Function} toggleTrailDelete - Function to toggle trail deletion status
 * @param {Function} toggleParticipantDelete - Function to toggle participant deletion status
 * @param {Function} closeDeleteMode - Function to close delete mode
 * @returns {JSX.Element} - The deleted items container component
 */
const DeletedItemsContainer = ({
  deletedTrails,
  deletedParticipants,
  toggleTrailDelete,
  toggleParticipantDelete,
  closeDeleteMode
}) => {
  const [activeTab, setActiveTab] = useState('trails');

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
          Deleted Items
        </h5>
      </div>
      <div className="card-body">
        <DeletedItemsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          deletedTrails={deletedTrails}
          deletedParticipants={deletedParticipants}
          closeDeleteMode={closeDeleteMode}
        />

        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'trails' ? 'show active' : ''}`} role="tabpanel">
            <DeletedTrailsList
              deletedTrails={deletedTrails}
              toggleTrailDelete={toggleTrailDelete}
            />
          </div>

          <div className={`tab-pane fade ${activeTab === 'participants' ? 'show active' : ''}`} role="tabpanel">
            <DeletedParticipantsList
              deletedParticipants={deletedParticipants}
              toggleParticipantDelete={toggleParticipantDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletedItemsContainer;
