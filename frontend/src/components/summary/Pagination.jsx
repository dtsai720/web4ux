
import React from 'react';

const PageButton = ({ page, isActive, onClick, disabled, children }) => (
  <li className={`page-item ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
    <button
      className="page-link"
      onClick={() => onClick(page)}
      disabled={disabled}
    >
      {children || page}
    </button>
  </li>
);

const getVisiblePages = (currentPageNum, totalPages) => {
  const pages = [];

  for (let page = 1; page <= totalPages; page++) {
    const isFirstOrLast = page === 1 || page === totalPages;
    const isNearCurrent = page >= currentPageNum - 2 && page <= currentPageNum + 2;

    if (isFirstOrLast || isNearCurrent) {
      pages.push(page);
    } else if (page === currentPageNum - 3 || page === currentPageNum + 3) {
      pages.push('...');
    }
  }

  return pages;
};

const Pagination = ({ currentPageNum, totalPages, handlePageChange }) => {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPageNum, totalPages);
  const isFirstPage = currentPageNum === 1;
  const isLastPage = currentPageNum === totalPages;

  return (
    <nav className="mt-4" aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <PageButton
          page={currentPageNum - 1}
          onClick={handlePageChange}
          disabled={isFirstPage}
        >
          Previous
        </PageButton>

        {visiblePages.map((page, index) =>
          page === '...' ? (
            <li key={`ellipsis-${index}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <PageButton
              key={page}
              page={page}
              isActive={currentPageNum === page}
              onClick={handlePageChange}
            />
          )
        )}

        <PageButton
          page={currentPageNum + 1}
          onClick={handlePageChange}
          disabled={isLastPage}
        >
          Next
        </PageButton>
      </ul>
    </nav>
  );
};

export default Pagination;
