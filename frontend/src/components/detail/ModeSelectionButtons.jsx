import ModeButton from './ModeButton';

const ModeSelectionButtons = ({ modeState, modeHandlers }) => {
  const { deleteMode, movementTimeMatrixMode, errorTrailMode } = modeState;
  const {
    setDeleteMode, setOutlierMode, setMovementTimeMatrixMode, setErrorTrailMode,
    calculateOutliers, closeDeleteMode, closeMovementTimeMatrixMode, closeErrorTrailMode
  } = modeHandlers;

  const switchToMode = (targetMode) => {
    setDeleteMode(targetMode === 'delete');
    setOutlierMode(false);
    setMovementTimeMatrixMode(targetMode === 'movement');
    setErrorTrailMode(targetMode === 'error');
  };

  const isOutlierActive = !deleteMode && !movementTimeMatrixMode && !errorTrailMode;

  return (
    <div className="btn-toolbar" role="toolbar">
      <div className="btn-group me-2 mb-2" role="group">
        <ModeButton
          icon="bi bi-graph-up"
          label="Outlier Analysis"
          isActive={isOutlierActive}
          variant="outline-primary"
          activeVariant="btn-primary"
          onClick={calculateOutliers}
        />
      </div>

      <div className="btn-group me-2 mb-2" role="group">
        <ModeButton
          icon={movementTimeMatrixMode ? "bi bi-x-circle" : "bi bi-grid-3x3"}
          label={movementTimeMatrixMode ? "Close Movement Time Matrix" : "Movement Time Matrix"}
          isActive={movementTimeMatrixMode}
          variant="outline-success"
          activeVariant="btn-success"
          onClick={movementTimeMatrixMode ? closeMovementTimeMatrixMode : () => switchToMode('movement')}
        />
      </div>

      <div className="btn-group me-2 mb-2" role="group">
        <ModeButton
          icon={errorTrailMode ? "bi bi-x-circle" : "bi bi-exclamation-triangle"}
          label={errorTrailMode ? "Close Error Trail Analysis" : "Error Trail Analysis"}
          isActive={errorTrailMode}
          variant="outline-warning"
          activeVariant="btn-warning text-dark"
          onClick={errorTrailMode ? closeErrorTrailMode : () => switchToMode('error')}
          customStyles={{
            color: '#b8860b',
            borderColor: '#b8860b',
            transition: 'all 0.15s ease-in-out'
          }}
          hoverStyles={{
            backgroundColor: '#ffc107',
            borderColor: '#ffc107',
            color: 'white'
          }}
        />
      </div>

      <div className="btn-group mb-2" role="group">
        <ModeButton
          icon={deleteMode ? "bi bi-x-circle" : "bi bi-trash"}
          label={deleteMode ? "Close Deleted Items" : "Deleted Items"}
          isActive={deleteMode}
          variant="outline-danger"
          activeVariant="btn-danger"
          onClick={deleteMode ? closeDeleteMode : () => switchToMode('delete')}
        />
      </div>
    </div>
  );
};

export default ModeSelectionButtons;
