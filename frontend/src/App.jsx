import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import page components
import HomePage from './pages/Home/HomePage';
import SyncPage from './pages/Sync/SyncPage';
import GuidePage from './pages/Guide/GuidePage';
import SummaryPage from './pages/Summary/SummaryPage';
import DetailPage from './pages/Detail/DetailPage';

const App = () => {
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleSummarySelection = (id) => {
    setSelectedSummaryId(id);
    navigate(`/detail/${id}`);
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage navigate={handleNavigate} />} />
        <Route path="/sync" element={<SyncPage navigate={handleNavigate} />} />
        <Route path="/guide" element={<GuidePage navigate={handleNavigate} />} />
        <Route
          path="/summary"
          element={<SummaryPage onSummarySelect={handleSummarySelection} navigate={handleNavigate} />}
        />
        <Route
          path="/detail/:id"
          element={<DetailPage selectedSummaryId={selectedSummaryId} navigate={handleNavigate} />}
        />
      </Routes>
    </div>
  );
};

export default App;
