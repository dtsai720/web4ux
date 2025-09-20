import React, { useState, useEffect, useCallback } from 'react';
import { ListSummaries } from '../../../wailsjs/go/pkg/App';
import { loadSummaries, handleSort } from '../../utils/summary';
import { PAGINATION } from '../../utils/common';
import {
  BackToHomeButton,
  ErrorMessage,
  LoadingIndicator,
  Pagination,
  SearchFilterCard,
  SummaryHeader,
  SummaryTable
} from '../../components/summary';

const SummaryPage = ({ setCurrentPage, setSelectedSummaryId }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search and sort state
  const [searchName, setSearchName] = useState('');
  const [searchCreator, setSearchCreator] = useState('');
  const [orderBy, setOrderBy] = useState('updatedAt');
  const [orderDirection, setOrderDirection] = useState('desc');

  // Pagination state
  const [currentPageNum, setCurrentPageNum] = useState(PAGINATION.DEFAULT_PAGE);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = PAGINATION.ITEMS_PER_PAGE;

  // Function to load data, using imported utils function
  const fetchSummaries = useCallback(async () => {
    await loadSummaries({
      searchName,
      searchCreator,
      orderBy,
      orderDirection,
      currentPageNum,
      itemsPerPage,
      setSummaries,
      setTotalItems,
      setLoading,
      setError,
      ListSummaries
    });
  }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum, itemsPerPage]);

  // Initial load and reload when dependencies update
  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  // Reset search
  const handleReset = () => {
    setSearchName('');
    setSearchCreator('');
    setOrderBy('updatedAt');
    setOrderDirection('desc');
    setCurrentPageNum(1);
  };

  // Handle sorting, using imported utils function
  const handleSortClick = (field) => {
    handleSort(field, orderBy, setOrderBy, orderDirection, setOrderDirection, setCurrentPageNum);
  };

  // Handle pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPageNum(page);
  };

  // Handle item click
  const handleItemClick = (summaryId) => {
    setSelectedSummaryId(summaryId);
    setCurrentPage('detail');
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        {/* Header section */}
        <SummaryHeader />

        {/* Search and filter section */}
        <SearchFilterCard
          searchName={searchName}
          setSearchName={setSearchName}
          searchCreator={searchCreator}
          setSearchCreator={setSearchCreator}
          handleReset={handleReset}
        />

        {/* Loading state */}
        {loading && <LoadingIndicator />}

        {/* Error message */}
        <ErrorMessage error={error} />

        {/* Data table */}
        {!loading && !error && (
          <>
            <SummaryTable
              summaries={summaries}
              totalItems={totalItems}
              orderBy={orderBy}
              orderDirection={orderDirection}
              handleSort={handleSortClick}
              handleItemClick={handleItemClick}
            />

            {/* Pagination control */}
            <Pagination
              currentPageNum={currentPageNum}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </>
        )}

        {/* Back button */}
        <BackToHomeButton setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
};

export default SummaryPage;
