import React from 'react';
import { DeletedItemsContainer } from '../../components/delete';

/**
 * Component for displaying and managing deleted items
 * This component now uses the extracted DeletedItemsContainer component
 */
const DeleteItemComponent = ({
  deletedTrails,
  deletedParticipants,
  toggleTrailDelete,
  toggleParticipantDelete,
  closeDeleteMode
}) => {
  return (
    <DeletedItemsContainer
      deletedTrails={deletedTrails}
      deletedParticipants={deletedParticipants}
      toggleTrailDelete={toggleTrailDelete}
      toggleParticipantDelete={toggleParticipantDelete}
      closeDeleteMode={closeDeleteMode}
    />
  );
};

export default DeleteItemComponent;
