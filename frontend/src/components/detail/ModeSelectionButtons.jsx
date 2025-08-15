import React from 'react';

/**
 * Component for mode selection buttons
 * @param {Object} props - Component props
 * @param {Boolean} props.deleteMode - Whether delete mode is active
 * @param {Boolean} props.outlierMode - Whether outlier mode is active
 * @param {Boolean} props.movementTimeMatrixMode - Whether movement time matrix mode is active
 * @param {Boolean} props.errorTrailMode - Whether error trail mode is active
 * @param {Function} props.setDeleteMode - Function to set delete mode
 * @param {Function} props.setOutlierMode - Function to set outlier mode
 * @param {Function} props.setMovementTimeMatrixMode - Function to set movement time matrix mode
 * @param {Function} props.setErrorTrailMode - Function to set error trail mode
 * @param {Function} props.calculateOutliers - Function to calculate outliers
 * @param {Function} props.closeOutlierMode - Function to close outlier mode
 * @param {Function} props.closeMovementTimeMatrixMode - Function to close movement time matrix mode
 * @param {Function} props.closeErrorTrailMode - Function to close error trail mode
 */
const ModeSelectionButtons = ({
  deleteMode,
  outlierMode,
  movementTimeMatrixMode,
  errorTrailMode,
  setDeleteMode,
  setOutlierMode,
  setMovementTimeMatrixMode,
  setErrorTrailMode,
  calculateOutliers,
  closeOutlierMode,
  closeMovementTimeMatrixMode,
  closeErrorTrailMode
}) => {
  // Handler for detail record mode
  const handleDetailRecordMode = () => {
    setDeleteMode(false);
    setOutlierMode(false);
    setMovementTimeMatrixMode(false);
    setErrorTrailMode(false);
  };

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
          className={`btn ${!deleteMode && !outlierMode && !movementTimeMatrixMode && !errorTrailMode ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={handleDetailRecordMode}
        >
          <i className="bi bi-list-ul"></i> Detail Record
        </button>
        <button
          className={`btn ${deleteMode ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={handleDeleteMode}
        >
          <i className="bi bi-trash"></i> Deleted Items
        </button>
      </div>

      <div className="btn-group me-2 mb-2" role="group">
        {!outlierMode ? (
          <button
            className="btn btn-outline-info"
            onClick={calculateOutliers}
          >
            <i className="bi bi-graph-up"></i> Analyze Outliers
          </button>
        ) : (
          <button
            className="btn btn-info"
            onClick={closeOutlierMode}
          >
            <i className="bi bi-x-circle"></i> Close Outlier Analysis
          </button>
        )}
      </div>


      <div className="btn-group me-2 mb-2" role="group">
        {!movementTimeMatrixMode ? (
          <button
            className="btn btn-outline-secondary"
            onClick={handleMovementTimeMatrixMode}
          >
            <i className="bi bi-grid-3x3"></i> Movement Time Matrix
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={closeMovementTimeMatrixMode}
          >
            <i className="bi bi-x-circle"></i> Close Movement Time Matrix
          </button>
        )}
      </div>

      <div className="btn-group mb-2" role="group">
        {!errorTrailMode ? (
          <button
            className="btn btn-outline-danger"
            onClick={handleErrorTrailMode}
          >
            <i className="bi bi-exclamation-triangle"></i> Error Trail Analysis
          </button>
        ) : (
          <button
            className="btn btn-danger"
            onClick={closeErrorTrailMode}
          >
            <i className="bi bi-x-circle"></i> Close Error Trail Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default ModeSelectionButtons;
