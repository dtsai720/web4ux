
const NavigationButtons = ({ setCurrentPage }) => {
  return (
    <div className="d-flex">
      <button
        className="btn btn-outline-secondary me-2"
        onClick={() => setCurrentPage('summary')}
      >
        <i className="bi bi-arrow-left"></i> Back
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => setCurrentPage('home')}
      >
        <i className="bi bi-house"></i> Home
      </button>
    </div>
  );
};

export default NavigationButtons;
