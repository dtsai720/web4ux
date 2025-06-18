import React from 'react';

/**
 * Pagination component for the Summary page
 *
 * @param {Object} props - Component props
 * @param {number} props.currentPageNum - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.handlePageChange - Function to handle page change
 * @returns {JSX.Element} Pagination component
 */
const Pagination = ({ currentPageNum, totalPages, handlePageChange }) => {
  if (totalPages <= 1) return null;

  return (
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
  );
};

export default Pagination;
