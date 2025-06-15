import React from 'react';

const HomePage = ({ setCurrentPage }) => (
  <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
    <div className="text-center mb-5">
      <h1 className="display-4 fw-bold text-primary mb-4">Welcome to My App</h1>
    </div>

    <div className="row w-100 justify-content-center" style={{ maxWidth: '80%' }}>
      <div className="col-md-4 mb-3">
        <button
          className="btn btn-primary btn-lg w-100 py-3 shadow-sm"
          onClick={() => setCurrentPage('sync')}
        >
          <i className="bi bi-arrow-repeat me-2"></i>
          Sync
        </button>
      </div>
      <div className="col-md-4 mb-3">
        <button
          className="btn btn-success btn-lg w-100 py-3 shadow-sm"
          onClick={() => setCurrentPage('summary')}
        >
          <i className="bi bi-bar-chart me-2"></i>
          Summary
        </button>
      </div>
      <div className="col-md-4 mb-3">
        <button
          className="btn btn-info btn-lg w-100 py-3 shadow-sm"
          onClick={() => setCurrentPage('guide')}
        >
          <i className="bi bi-book me-2"></i>
          Guide
        </button>
      </div>
    </div>
  </div>
);

export default HomePage;
