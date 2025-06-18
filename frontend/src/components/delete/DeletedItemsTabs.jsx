import React from 'react';
import { toggleActiveTab } from '../../utils/delete/deleteUtils';

/**
 * Component for the tabs navigation in the deleted items view
 * @param {string} activeTab - The currently active tab
 * @param {Function} setActiveTab - Function to set the active tab
 * @param {Object} deletedTrails - Object containing deleted trails
 * @param {Object} deletedParticipants - Object containing deleted participants
 * @param {Function} closeDeleteMode - Function to close delete mode
 * @returns {JSX.Element} - The tabs navigation component
 */
const DeletedItemsTabs = ({
  activeTab,
  setActiveTab,
  deletedTrails,
  deletedParticipants,
  closeDeleteMode
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'trails' ? 'active' : ''}`}
            onClick={() => toggleActiveTab('trails', setActiveTab)}
            type="button"
            role="tab"
          >
            <i className="bi bi-signpost-split me-1"></i>
            Deleted Trails ({Object.keys(deletedTrails).length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => toggleActiveTab('participants', setActiveTab)}
            type="button"
            role="tab"
          >
            <i className="bi bi-people me-1"></i>
            Deleted Participants ({Object.keys(deletedParticipants).length})
          </button>
        </li>
      </ul>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={closeDeleteMode}
      >
        <i className="bi bi-x-circle"></i> Close
      </button>
    </div>
  );
};

export default DeletedItemsTabs;
