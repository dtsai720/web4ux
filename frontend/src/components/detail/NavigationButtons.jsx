
import { useNavigation } from '../../contexts/NavigationContext';

const NavigationButtons = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="d-flex">
      <button
        className="btn btn-outline-secondary me-2"
        onClick={() => navigateTo('summary')}
      >
        <i className="bi bi-arrow-left"></i> Back
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => navigateTo('home')}
      >
        <i className="bi bi-house"></i> Home
      </button>
    </div>
  );
};

export default NavigationButtons;
