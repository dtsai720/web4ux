import { handleDoubleClick } from '../../utils/delete/deleteUtils';
import DeletedParticipantsList from './DeletedParticipantsList';

const DeletedItemsContainer = ({
  deletedParticipants,
  toggleParticipantDelete,
  closeDeleteMode
}) => {

  return (
    <div className="card mb-4 border-danger">
      <div
        className="card-header bg-danger text-white d-flex justify-content-between align-items-center"
        onDoubleClick={handleDoubleClick(closeDeleteMode)}
        style={{ cursor: 'pointer' }}
        title="Double-click to go back"
      >
        <span>
          <i className="bi bi-trash me-2"></i>
          Deleted Participants ({Object.keys(deletedParticipants).length})
        </span>
        <small>
          <i className="bi bi-info-circle me-1"></i>
          Double click to return
        </small>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-end mb-3">
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
