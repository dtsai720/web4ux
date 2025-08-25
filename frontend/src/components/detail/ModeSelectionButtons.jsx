import React from 'react';

/**
 * Component for mode selection buttons
 * @param {Object} props - Component props
 * @param {Boolean} props.deleteMode - Whether delete mode is active
 * @param {Boolean} props.movementTimeMatrixMode - Whether movement time matrix mode is active
 * @param {Boolean} props.errorTrailMode - Whether error trail mode is active
 * @param {Function} props.setDeleteMode - Function to set delete mode
 * @param {Function} props.setOutlierMode - Function to set outlier mode
 * @param {Function} props.setMovementTimeMatrixMode - Function to set movement time matrix mode
 * @param {Function} props.setErrorTrailMode - Function to set error trail mode
 * @param {Function} props.calculateOutliers - Function to calculate outliers
 * @param {Function} props.closeDeleteMode - Function to close delete mode
 * @param {Function} props.closeMovementTimeMatrixMode - Function to close movement time matrix mode
 * @param {Function} props.closeErrorTrailMode - Function to close error trail mode
 */
const ModeSelectionButtons = ({
  deleteMode,
  movementTimeMatrixMode,
  errorTrailMode,
  setDeleteMode,
  setOutlierMode,
  setMovementTimeMatrixMode,
  setErrorTrailMode,
  calculateOutliers,
  closeDeleteMode,
  closeMovementTimeMatrixMode,
  closeErrorTrailMode
}) => {

  // Handler for delete mode
  const handleDeleteMode = () => {
    setDeleteMode(true);
    setOutlierMode(false);
    setMovementTimeMatrixMode(false);
    setErrorTrailMode(false);
  };

  // Handler for movement time matrix mode
  const handleMovementTimeMatrixMode = () => {
    setMovementTimeMatrixMode(true);
    setDeleteMode(false);
    setOutlierMode(false);
    setErrorTrailMode(false);
  };

  // Handler for error trail mode
  const handleErrorTrailMode = () => {
    setErrorTrailMode(true);
    setDeleteMode(false);
    setOutlierMode(false);
    setMovementTimeMatrixMode(false);
  };

  return (
    <div className="btn-toolbar" role="toolbar">
      <div className="btn-group me-2 mb-2" role="group">
        <button
          className={`btn ${!deleteMode && !movementTimeMatrixMode && !errorTrailMode ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={calculateOutliers}
        >
          <i className="bi bi-graph-up"></i> Outlier Analysis
        </button>
      </div>

      <div className="btn-group me-2 mb-2" role="group">
        {!movementTimeMatrixMode ? (
          <button
            className="btn btn-outline-success"
            onClick={handleMovementTimeMatrixMode}
          >
            <i className="bi bi-grid-3x3"></i> Movement Time Matrix
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={closeMovementTimeMatrixMode}
          >
            <i className="bi bi-x-circle"></i> Close Movement Time Matrix
          </button>
        )}
      </div>

      <div className="btn-group me-2 mb-2" role="group">
        {!errorTrailMode ? (
          <button
            className="btn btn-outline-warning text-dark"
            onClick={handleErrorTrailMode}
            style={{
              color: '#b8860b',
              borderColor: '#b8860b',
              transition: 'all 0.15s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffc107';
              e.target.style.borderColor = '#ffc107';
              e.target.style.color = 'white';
              const icon = e.target.querySelector('i');
              if (icon) icon.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#b8860b';
              e.target.style.color = '#b8860b';
              const icon = e.target.querySelector('i');
              if (icon) icon.style.color = '#b8860b';
            }}
          >
            <i className="bi bi-exclamation-triangle" style={{ color: '#b8860b' }}></i> Error Trail Analysis
          </button>
        ) : (
          <button
            className="btn btn-warning text-dark"
            onClick={closeErrorTrailMode}
            style={{ color: '#212529' }}
          >
            <i className="bi bi-x-circle"></i> Close Error Trail Analysis
          </button>
        )}
      </div>

      <div className="btn-group mb-2" role="group">
        {!deleteMode ? (
          <button
            className="btn btn-outline-danger"
            onClick={handleDeleteMode}
          >
            <i className="bi bi-trash"></i> Deleted Items
          </button>
        ) : (
          <button
            className="btn btn-danger"
            onClick={closeDeleteMode}
          >
            <i className="bi bi-x-circle"></i> Close Deleted Items
          </button>
        )}
      </div>
    </div>
  );
};

export default ModeSelectionButtons;
