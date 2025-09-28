import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import page components
import HomePage from './pages/Home/HomePage';
import SyncPage from './pages/Sync/SyncPage';
import GuidePage from './pages/Guide/GuidePage';
import SummaryPage from './pages/Summary/SummaryPage';
import DetailPage from './pages/Detail/DetailPage';

// Import navigation context
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

const AppContent = () => {
  const { currentPage } = useNavigation();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'sync':
        return <SyncPage />;
      case 'summary':
        return <SummaryPage />;
      case 'guide':
        return <GuidePage />;
      case 'detail':
        return <DetailPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
};

const App = () => {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
};

export default App;
