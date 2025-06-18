import React from 'react';
import NavigationButtons from './NavigationButtons';
import ModeSelectionButtons from './ModeSelectionButtons';

/**
 * Header component for the detail page
 * @param {Object} props - Component props
 * @param {Function} props.setCurrentPage - Function to set the current page
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
const DetailPageHeader = ({
  setCurrentPage,
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
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Detail View</h2>
        <NavigationButtons setCurrentPage={setCurrentPage} />
      </div>

      <ModeSelectionButtons
        deleteMode={deleteMode}
        outlierMode={outlierMode}
        resultMode={resultMode}
        setDeleteMode={setDeleteMode}
        setOutlierMode={setOutlierMode}
        setResultMode={setResultMode}
        calculateOutliers={calculateOutliers}
        closeOutlierMode={closeOutlierMode}
        closeResultMode={closeResultMode}
      />
    </div>
  );
};

export default DetailPageHeader;
