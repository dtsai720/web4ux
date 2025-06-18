import React from 'react';

const NavigationButton = ({ icon, label, color, onClick }) => (
  <div className="col-md-4 mb-3">
    <button
      className={`btn btn-${color} btn-lg w-100 py-3 shadow-sm`}
      onClick={onClick}
    >
      <i className={`bi bi-${icon} me-2`}></i>
      {label}
    </button>
  </div>
);

export default NavigationButton;
