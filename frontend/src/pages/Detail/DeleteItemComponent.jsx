import React from 'react';
import { DeletedItemsContainer } from '../../components/delete';

/**
 * Component for displaying and managing deleted items
 * This component now uses the extracted DeletedItemsContainer component
 */
const DeleteItemComponent = ({
  deletedParticipants,
  toggleParticipantDelete,
  closeDeleteMode
}) => {
  return (
    <DeletedItemsContainer
      deletedParticipants={deletedParticipants}
      toggleParticipantDelete={toggleParticipantDelete}
      closeDeleteMode={closeDeleteMode}
    />
  );
};

export default DeleteItemComponent;
