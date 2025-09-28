import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const selectSummary = (summaryId) => {
    setSelectedSummaryId(summaryId);
  };

  const navigateToDetail = (summaryId) => {
    setSelectedSummaryId(summaryId);
    setCurrentPage('detail');
  };

  const value = {
    currentPage,
    selectedSummaryId,
    navigateTo,
    selectSummary,
    navigateToDetail
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
