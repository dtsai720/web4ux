import React, { useState, useEffect, useCallback } from 'react';
import { ListSummaries } from '../../../wailsjs/go/pkg/App';

const SummaryPage = ({ setCurrentPage, setSelectedSummaryId }) => {
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

  // 載入資料的函數
  const loadSummaries = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // 計算分頁
      const limit = itemsPerPage;
      const offset = (currentPageNum - 1) * limit;

      const result = await ListSummaries(searchName, searchCreator, orderBy, orderDirection, offset, limit);
      setSummaries(result.data || []);
      setTotalItems(result.total || 0);
    } catch (err) {
      setError('Failed to load summaries: ' + err.message);
      setSummaries([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum]);

  // 初始載入和依賴更新時重新載入
  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  // 重置搜尋
  const handleReset = () => {
    setSearchName('');
    setSearchCreator('');
    setOrderBy('updatedAt');
    setOrderDirection('desc');
    setCurrentPageNum(1);
  };

  // 處理排序
  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrderDirection('desc'); // 預設降序
    }
    setCurrentPageNum(1); // 重置到第一頁
  };

  // 處理分頁
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPageNum(page);
  };

  // 處理點擊項目
  const handleItemClick = (summaryId) => {
    alert(`Clicked summary ID: ${summaryId}`);
    setSelectedSummaryId(summaryId);
    setCurrentPage('detail');
  };

  // 渲染排序圖標
  const getSortIcon = (field) => {
    if (orderBy !== field) {
      return <span className="text-muted ms-1">⇅</span>;
    }
    return orderDirection === 'asc' ?
      <span className="text-primary ms-1">↑</span> :
      <span className="text-primary ms-1">↓</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 月份從 0 開始
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    // 計算時區偏移（分鐘）
    const offsetMinutes = date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes <= 0 ? '+' : '-';
    const tzOffset = `${sign}${pad(offsetHours)}:${pad(offsetMins)}`;

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${tzOffset}`;
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        {/* 標題區域 */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-6 fw-bold text-dark mb-2">Data Summary</h1>
            <p className="text-muted">Search, filter and manage your data summaries</p>
          </div>
        </div>

        {/* 搜尋和篩選區域 */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="card-title mb-0">
              <span className="me-2">🔍</span>
              Search & Filter
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Search by Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Search by Creator</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter creator..."
                  value={searchCreator}
                  onChange={(e) => setSearchCreator(e.target.value)}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
                  <span className="me-1">🔄</span>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 載入狀態 */}
        {loading && (
          <div className="text-center mb-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading summaries...</p>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
            <span className="me-2">❌</span>
            <div>{error}</div>
          </div>
        )}

        {/* 資料表格 */}
        {!loading && !error && (
          <>
            <div className="card shadow-sm">
              {/* 表格標題和計數 */}
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Results ({totalItems} items)</h5>
              </div>

              <div className="card-body p-0">
                {summaries.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th
                            scope="col"
                            className="user-select-none"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSort('name')}
                          >
                            <div className="d-flex align-items-center">
                              Name
                              {getSortIcon('name')}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="user-select-none"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSort('creator')}
                          >
                            <div className="d-flex align-items-center">
                              Creator
                              {getSortIcon('creator')}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="user-select-none"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSort('updatedAt')}
                          >
                            <div className="d-flex align-items-center">
                              Updated At
                              {getSortIcon('updatedAt')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaries.map((summary) => (
                          <tr
                            key={summary.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleItemClick(summary.id)}
                            className="table-row-hover"
                          >
                            <td>
                              <strong>{summary.name}</strong>
                            </td>
                            <td className="text-muted">
                              {summary.creator}
                            </td>
                            <td className="text-muted">
                              <small>{formatDate(summary.updatedAt)}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3" style={{ fontSize: '3rem' }}>🔍</div>
                    <h5 className="text-muted">No Data Found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>

            {/* 分頁控制 */}
            {totalPages > 1 && (
              <nav className="mt-4" aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPageNum === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPageNum - 1)}
                      disabled={currentPageNum === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {/* 頁碼按鈕 */}
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPageNum - 2 && page <= currentPageNum + 2)
                    ) {
                      return (
                        <li key={page} className={`page-item ${currentPageNum === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    } else if (page === currentPageNum - 3 || page === currentPageNum + 3) {
                      return (
                        <li key={page} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}

                  <li className={`page-item ${currentPageNum === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPageNum + 1)}
                      disabled={currentPageNum === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}

        {/* 返回按鈕 */}
        <div className="text-center mt-4">
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => setCurrentPage('home')}
          >
            <span className="me-2">🏠</span>
            Back to Home
          </button>
        </div>
      </div>

      {/* 自定義 CSS */}
      <style jsx>{`
      .table-row-hover:hover {
        background-color: #f8f9fa !important;
      }
      .user-select-none {
        user-select: none;
      }
    `}</style>
    </div>
  );
};

export default SummaryPage;
