import React from 'react';
import NavigationButtons from './NavigationButtons';
import ModeSelectionButtons from './ModeSelectionButtons';

/**
 * Header component for the detail page
 * @param {Object} props - Component props
 * @param {Function} props.setCurrentPage - Function to set the current page
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
 * @param {Function} props.closeDeleteMode - Function to close delete mode
 * @param {Function} props.closeErrorTrailMode - Function to close error trail mode
 */
const DetailPageHeader = ({
  setCurrentPage,
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
  closeDeleteMode,
  closeMovementTimeMatrixMode,
  closeErrorTrailMode
}) => {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Project Analysis</h2>
        <NavigationButtons setCurrentPage={setCurrentPage} />
      </div>

      <ModeSelectionButtons
        deleteMode={deleteMode}
        outlierMode={outlierMode}
        movementTimeMatrixMode={movementTimeMatrixMode}
        errorTrailMode={errorTrailMode}
        setDeleteMode={setDeleteMode}
        setOutlierMode={setOutlierMode}
        setMovementTimeMatrixMode={setMovementTimeMatrixMode}
        setErrorTrailMode={setErrorTrailMode}
        calculateOutliers={calculateOutliers}
        closeOutlierMode={closeOutlierMode}
        closeDeleteMode={closeDeleteMode}
        closeMovementTimeMatrixMode={closeMovementTimeMatrixMode}
        closeErrorTrailMode={closeErrorTrailMode}
      />
    </div>
  );
};

export default DetailPageHeader;
