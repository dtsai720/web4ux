import NavigationButtons from './NavigationButtons';
import ModeSelectionButtons from './ModeSelectionButtons';

const DetailPageHeader = ({ setCurrentPage, modeState, modeHandlers }) => {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Project Analysis</h2>
        <NavigationButtons setCurrentPage={setCurrentPage} />
      </div>

      <ModeSelectionButtons modeState={modeState} modeHandlers={modeHandlers} />
    </div>
  );
};

export default DetailPageHeader;
