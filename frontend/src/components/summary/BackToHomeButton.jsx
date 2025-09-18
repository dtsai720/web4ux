const BackToHomeButton = ({ setCurrentPage }) => (
  <div className="text-center mt-4">
    <button
      className="btn btn-secondary btn-lg"
      onClick={() => setCurrentPage('home')}
    >
      <span className="me-2">🏠</span>
      Back to Home
    </button>
  </div>
);

export default BackToHomeButton;
