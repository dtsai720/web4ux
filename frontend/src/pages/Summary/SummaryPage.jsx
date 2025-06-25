import React, { useState, useEffect, useCallback } from 'react';
import { ListSummaries } from '../../../wailsjs/go/pkg/App';
import { loadSummaries, handleSort } from '../../utils/summary';
import {
  BackToHomeButton,
  ErrorMessage,
  LoadingIndicator,
  Pagination,
  SearchFilterCard,
  SummaryHeader,
  SummaryTable
} from '../../components/summary';

const SummaryPage = ({ onSummarySelect, navigate }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 搜尋和排序狀態
  const [searchName, setSearchName] = useState('');
  const [searchCreator, setSearchCreator] = useState('');
  const [orderBy, setOrderBy] = useState('updatedAt');
  const [orderDirection, setOrderDirection] = useState('desc');

  // 分頁狀態
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6; // 減少每頁顯示數量以便演示

  // 載入資料的函數，使用從 utils 導入的函數
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
  }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum]);

  // 初始載入和依賴更新時重新載入
  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  // 重置搜尋
  const handleReset = () => {
    setSearchName('');
    setSearchCreator('');
    setOrderBy('updatedAt');
    setOrderDirection('desc');
    setCurrentPageNum(1);
  };

  // 處理排序，使用從 utils 導入的函數
  const handleSortClick = (field) => {
    handleSort(field, orderBy, setOrderBy, orderDirection, setOrderDirection, setCurrentPageNum);
  };

  // 處理分頁
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPageNum(page);
  };

  // 處理點擊項目
  const handleItemClick = (summaryId) => {
    onSummarySelect(summaryId);
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        {/* 標題區域 */}
        <SummaryHeader />

        {/* 搜尋和篩選區域 */}
        <SearchFilterCard
          searchName={searchName}
          setSearchName={setSearchName}
          searchCreator={searchCreator}
          setSearchCreator={setSearchCreator}
          handleReset={handleReset}
        />

        {/* 載入狀態 */}
        {loading && <LoadingIndicator />}

        {/* 錯誤訊息 */}
        <ErrorMessage error={error} />

        {/* 資料表格 */}
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

            {/* 分頁控制 */}
            <Pagination
              currentPageNum={currentPageNum}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </>
        )}

        {/* 返回按鈕 */}
        <BackToHomeButton />
      </div>
    </div>
  );
};

export default SummaryPage;
