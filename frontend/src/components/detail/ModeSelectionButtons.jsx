import React from 'react';

/**
 * Component for mode selection buttons
 * @param {Object} props - Component props
 * @param {Boolean} props.deleteMode - Whether delete mode is active
 * @param {Boolean} props.outlierMode - Whether outlier mode is active
 * @param {Boolean} props.resultMode - Whether result mode is active
 * @param {Function} props.setDeleteMode - Function to set delete mode
 * @param {Function} props.setOutlierMode - Function to set outlier mode
 * @param {Function} props.setResultMode - Function to set result mode
 * @param {Function} props.calculateOutliers - Function to calculate outliers
 * @param {Function} props.closeOutlierMode - Function to close outlier mode
 * @param {Function} props.closeResultMode - Function to close result mode
 */
const ModeSelectionButtons = ({
  deleteMode,
  outlierMode,
  resultMode,
  setDeleteMode,
  setOutlierMode,
  setResultMode,
  calculateOutliers,
  closeOutlierMode,
  closeResultMode
}) => {
  // Handler for detail record mode
  const handleDetailRecordMode = () => {
    setDeleteMode(false);
    setOutlierMode(false);
    setResultMode(false);
  };

  // Handler for delete mode
  const handleDeleteMode = () => {
    setDeleteMode(true);
    setOutlierMode(false);
    setResultMode(false);
  };

  // Handler for result mode
  const handleResultMode = () => {
    setResultMode(true);
    setDeleteMode(false);
    setOutlierMode(false);
  };

  return (
    <div className="btn-toolbar" role="toolbar">
      <div className="btn-group me-2 mb-2" role="group">
        <button
          className={`btn ${!deleteMode && !outlierMode && !resultMode ? 'btn-primary' : 'btn-outline-primary'}`}
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

      <div className="btn-group mb-2" role="group">
        {!resultMode ? (
          <button
            className="btn btn-outline-success"
            onClick={handleResultMode}
          >
            <i className="bi bi-bar-chart-line"></i> Result Analysis
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={closeResultMode}
          >
            <i className="bi bi-x-circle"></i> Close Result Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default ModeSelectionButtons;
