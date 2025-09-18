import React from 'react';
import { DeletedItemsContainer } from '../../components/delete';

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
