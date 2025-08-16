import React from 'react';
import { getSortIcon, formatDate } from '../../utils/summary';

/**
 * Summary table component for displaying summary data
 *
 * @param {Object} props - Component props
 * @param {Array} props.summaries - Array of summary objects to display
 * @param {number} props.totalItems - Total number of items
 * @param {string} props.orderBy - Current sort field
 * @param {string} props.orderDirection - Current sort direction
 * @param {Function} props.handleSort - Function to handle sorting
 * @param {Function} props.handleItemClick - Function to handle item click
 * @returns {JSX.Element} Summary table component
 */
const SummaryTable = ({
  summaries,
  totalItems,
  orderBy,
  orderDirection,
  handleSort,
  handleItemClick
}) => {
  return (
    <div className="card shadow-sm">
      {/* 表格標題和計數 */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Projects ({totalItems} items)</h5>
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
                      {getSortIcon('name', orderBy, orderDirection)}
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
                      {getSortIcon('creator', orderBy, orderDirection)}
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
                      {getSortIcon('updatedAt', orderBy, orderDirection)}
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

export default SummaryTable;
