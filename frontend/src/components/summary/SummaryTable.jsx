import { getSortIcon, formatDate } from '../../utils/summary';

const SortableHeader = ({ field, label, orderBy, orderDirection, onSort }) => (
  <th
    scope="col"
    className="user-select-none"
    style={{ cursor: 'pointer' }}
    onClick={() => onSort(field)}
  >
    {label} {getSortIcon(field, orderBy, orderDirection)}
  </th>
);

const TableRow = ({ summary, onClick }) => (
  <tr
    style={{ cursor: 'pointer' }}
    onClick={() => onClick(summary.id)}
    className="table-row-hover"
  >
    <td><strong>{summary.name}</strong></td>
    <td className="text-muted">{summary.creator}</td>
    <td className="text-muted"><small>{formatDate(summary.updatedAt)}</small></td>
  </tr>
);

const EmptyState = () => (
  <div className="text-center py-5">
    <div className="mb-3" style={{ fontSize: '3rem' }}>🔍</div>
    <h5 className="text-muted">No Projects Found</h5>
    <p className="text-muted">Try adjusting your search criteria or check if projects have been synced</p>
  </div>
);

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
      <div className="card-header bg-light">
        <h5 className="card-title mb-0">Projects ({totalItems} items)</h5>
      </div>
      <div className="card-body p-0">
        {summaries.length > 0 ? (
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <SortableHeader field="name" label="Name" orderBy={orderBy} orderDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="creator" label="Creator" orderBy={orderBy} orderDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="updatedAt" label="Updated At" orderBy={orderBy} orderDirection={orderDirection} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <TableRow key={summary.id} summary={summary} onClick={handleItemClick} />
              ))}
            </tbody>
          </table>
        ) : <EmptyState />}
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
