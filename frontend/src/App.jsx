import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import page components
import HomePage from './pages/Home/HomePage';
import SyncPage from './pages/Sync/SyncPage';
import GuidePage from './pages/Guide/GuidePage';
import SummaryPage from './pages/Summary/SummaryPage';
import DetailPage from './pages/Detail/DetailPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'sync':
        return <SyncPage setCurrentPage={setCurrentPage} />;
      case 'summary':
        return <SummaryPage setCurrentPage={setCurrentPage} setSelectedSummaryId={setSelectedSummaryId} />;
      case 'guide':
        return <GuidePage setCurrentPage={setCurrentPage} />;
      case 'detail':
        return <DetailPage setCurrentPage={setCurrentPage} selectedSummaryId={selectedSummaryId} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
};

export default App;
