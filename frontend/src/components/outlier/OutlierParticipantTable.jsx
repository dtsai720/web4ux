import React, { useState, useEffect } from 'react';
import OutlierTrailTable from './OutlierTrailTable';

const TABLE_HEADERS = [
  { text: '', width: '40px' },
  { text: 'Participant' },
  { text: 'Error Count' },
  { text: 'Extra Clicks' },
  { text: 'Valid Trails' },
  { text: 'Double Clicks' },
  { text: 'Category' },
  { text: 'Options' }
];

const FILTER_TYPES = {
  ALL: 'all',
  OUTLIERS: 'outliers',
  DOUBLE_CLICKS: 'doubleClicks'
};

// Helper functions
const sortParticipants = (participants) => {
  return participants.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA !== numB ? numA - numB : a.localeCompare(b);
  });
};

const filterParticipants = (participants, showOutliersOnly, showDoubleClickOnly) => {
  return Object.keys(participants || []).filter(participantKey => {
    const participant = participants[participantKey];

    if (showOutliersOnly && !participant.isOutlier) {
      return false;
    }

    if (showDoubleClickOnly && participant.doubleClickCount === 0) {
      return false;
    }

    return true;
  });
};

const getFilterCounts = (participants) => {
  const allParticipants = Object.values(participants || {});
  return {
    total: allParticipants.length,
    outliers: allParticipants.filter(p => p.isOutlier).length,
    doubleClicks: allParticipants.filter(p => p.doubleClickCount > 0).length
  };
};

// Filter badge component
const FilterBadge = ({ type, isActive, count, onClick, title, icon, children }) => {
  const getBadgeClass = () => {
    switch (type) {
      case FILTER_TYPES.ALL:
        return isActive ? 'bg-primary text-white' : 'bg-light text-dark border';
      case FILTER_TYPES.OUTLIERS:
        return isActive ? 'bg-danger text-white' : 'bg-light text-danger border';
      case FILTER_TYPES.DOUBLE_CLICKS:
        return isActive ? 'bg-warning text-dark' : 'bg-light text-dark border';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <span
      className={`badge ${getBadgeClass()}`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      title={title}
    >
      <i className={`bi ${icon} me-1`}></i>
      {count} {children}
      {isActive && <i className="bi bi-check-circle ms-1"></i>}
    </span>
  );
};

// Statistics card component
const StatsCard = ({ deviceStats }) => (
  <div className="text-end border border-primary bg-light rounded p-3" style={{ minWidth: '200px' }}>
    <h6 className="text-primary mb-2 text-center">
      <i className="bi bi-graph-up me-1"></i>
      Error Count Statistics
    </h6>
    <div className="d-flex justify-content-around text-center">
      <div className="border-end pe-3">
        <small className="text-muted d-block mb-1">Average</small>
        <span className="badge bg-primary fs-6 px-2 py-1">
          {deviceStats?.avgErrorCount?.toFixed(2) || '0.00'}
        </span>
      </div>
      <div className="ps-3">
        <small className="text-muted d-block mb-1">Std Dev</small>
        <span className="badge bg-warning text-dark fs-6 px-2 py-1">
          {deviceStats?.stdDevErrorCount?.toFixed(2) || '0.00'}
        </span>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ showOutliersOnly, showDoubleClickOnly }) => {
  const getMessage = () => {
    if (showOutliersOnly && showDoubleClickOnly) {
      return 'No participants found with both outliers and double clicks';
    }
    if (showOutliersOnly) {
      return 'No outlier participants found for this device';
    }
    if (showDoubleClickOnly) {
      return 'No participants with double clicks found for this device';
    }
    return 'No participants found for this device';
  };

  return (
    <div className="text-center text-muted py-4">
      <i className="bi bi-info-circle me-2"></i>
      {getMessage()}
    </div>
  );
};

// Delete button component
const DeleteButton = ({ onDelete }) => (
  <button
    className="btn btn-sm text-danger"
    onClick={onDelete}
    title="Delete participant"
    style={{
      border: 'none',
      background: 'none',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#ffe6e6';
      e.target.style.borderRadius = '4px';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'transparent';
    }}
  >
    <i className="bi bi-trash"></i>
  </button>
);

// Expand icon component
const ExpandIcon = ({ canExpand, isExpanded }) => (
  <td className="text-center align-middle">
    {canExpand ? (
      <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
    ) : (
      <span className="text-muted">-</span>
    )}
  </td>
);

// Participant name cell
const ParticipantCell = ({ participantKey }) => (
  <td className="text-center align-middle">
    <strong>{participantKey}</strong>
  </td>
);

// Simple data cell component
const DataCell = ({ value }) => (
  <td className="text-center align-middle">
    <span>{value}</span>
  </td>
);

// Double click count cell
const DoubleClickCell = ({ doubleClickCount }) => (
  <td className="text-center align-middle">
    {doubleClickCount > 0 ? (
      <span
        className="badge bg-warning text-dark"
        title={`${doubleClickCount} trails with double clicks`}
      >
        {doubleClickCount}
      </span>
    ) : (
      <span className="text-muted">-</span>
    )}
  </td>
);

// Category badge cell
const CategoryCell = ({ isOutlier }) => (
  <td className="text-center align-middle">
    {isOutlier ? (
      <span className="badge bg-danger">Outlier</span>
    ) : (
      <span className="text-muted">-</span>
    )}
  </td>
);

// Action cell with delete button
const ActionCell = ({ onDelete }) => (
  <td className="text-center align-middle">
    <DeleteButton onDelete={onDelete} />
  </td>
);

// Expansion content row
const ExpansionContent = ({ participant, deviceKey, participantKey, data }) => (
  <tr>
    <td colSpan="8" className="p-0">
      <div className="bg-light p-3 border-top">
        <OutlierTrailTable
          errorTrails={participant.errorTrails}
          data={data}
          deviceKey={deviceKey}
          participantKey={participantKey}
        />
      </div>
    </td>
  </tr>
);

// Simplified participant row component
const ParticipantRow = ({
  participantKey,
  participant,
  isExpanded,
  canExpand,
  onToggleExpansion,
  onDelete,
  deviceKey,
  data
}) => (
  <React.Fragment>
    <tr
      className={`${participant.isOutlier ? 'table-danger' : ''} ${canExpand ? 'cursor-pointer' : ''}`}
      onClick={() => canExpand && onToggleExpansion(participantKey)}
      style={{ cursor: canExpand ? 'pointer' : 'default' }}
    >
      <ExpandIcon canExpand={canExpand} isExpanded={isExpanded} />
      <ParticipantCell participantKey={participantKey} />
      <DataCell value={participant.errorCount} />
      <DataCell value={participant.errorTime} />
      <DataCell value={participant.trailCount} />
      <DoubleClickCell doubleClickCount={participant.doubleClickCount} />
      <CategoryCell isOutlier={participant.isOutlier} />
      <ActionCell onDelete={onDelete} />
    </tr>

    {isExpanded && canExpand && (
      <ExpansionContent
        participant={participant}
        deviceKey={deviceKey}
        participantKey={participantKey}
        data={data}
      />
    )}
  </React.Fragment>
);

const OutlierParticipantTable = ({
  participants,
  deviceStats,
  onToggleParticipantDelete,
  deviceKey,
  data
}) => {
  const [showOutliersOnly, setShowOutliersOnly] = useState(false);
  const [showDoubleClickOnly, setShowDoubleClickOnly] = useState(false);
  const [expandedParticipants, setExpandedParticipants] = useState(new Set());

  // Auto-collapse expanded participants when filter changes
  useEffect(() => {
    setExpandedParticipants(new Set());
  }, [showOutliersOnly, showDoubleClickOnly]);

  const toggleParticipantExpansion = (participantKey) => {
    setExpandedParticipants(prev => {
      const next = new Set(prev);
      prev.has(participantKey) ? next.delete(participantKey) : next.add(participantKey);
      return next;
    });
  };

  const filteredParticipants = filterParticipants(participants, showOutliersOnly, showDoubleClickOnly);
  const sortedParticipants = sortParticipants(filteredParticipants);
  const counts = getFilterCounts(participants);

  const resetFilters = () => {
    setShowOutliersOnly(false);
    setShowDoubleClickOnly(false);
  };

  const toggleOutliersFilter = () => {
    setShowOutliersOnly(!showOutliersOnly);
    setShowDoubleClickOnly(false);
  };

  const toggleDoubleClicksFilter = () => {
    setShowDoubleClickOnly(!showDoubleClickOnly);
    setShowOutliersOnly(false);
  };

  return (
    <div className="mb-4">
      <div className="border border-light rounded bg-light p-3 mb-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1">Participants</h6>
            <small className="text-muted d-block mb-2">
              Participant details and outlier status - Click badges to filter
            </small>
            <div className="d-flex flex-wrap gap-2">
              <FilterBadge
                type={FILTER_TYPES.ALL}
                isActive={!showOutliersOnly && !showDoubleClickOnly}
                count={counts.total}
                onClick={resetFilters}
                title="Show all participants"
                icon="bi-people"
              >
                Total
              </FilterBadge>

              <FilterBadge
                type={FILTER_TYPES.OUTLIERS}
                isActive={showOutliersOnly}
                count={counts.outliers}
                onClick={toggleOutliersFilter}
                title="Filter outlier participants only"
                icon="bi-exclamation-triangle"
              >
                Outliers
              </FilterBadge>

              <FilterBadge
                type={FILTER_TYPES.DOUBLE_CLICKS}
                isActive={showDoubleClickOnly}
                count={counts.doubleClicks}
                onClick={toggleDoubleClicksFilter}
                title="Filter participants with double clicks only"
                icon="bi-cursor-fill"
              >
                With Double Clicks
              </FilterBadge>
            </div>
          </div>

          <StatsCard deviceStats={deviceStats} />
        </div>
      </div>

      {sortedParticipants.length === 0 ? (
        <EmptyState
          showOutliersOnly={showOutliersOnly}
          showDoubleClickOnly={showDoubleClickOnly}
        />
      ) : (
        <table className="table table-bordered table-sm table-responsive">
          <thead className="table-secondary">
            <tr>
              {TABLE_HEADERS.map(({ text, width }, index) => (
                <th key={index} className="text-center" style={width ? { width } : undefined}>
                  {text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map(participantKey => {
              const participant = participants[participantKey];
              const isExpanded = expandedParticipants.has(participantKey);
              const canExpand = participant.isOutlier || participant.doubleClickCount > 0;

              return (
                <ParticipantRow
                  key={participantKey}
                  participantKey={participantKey}
                  participant={participant}
                  isExpanded={isExpanded}
                  canExpand={canExpand}
                  onToggleExpansion={toggleParticipantExpansion}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onToggleParticipantDelete(deviceKey, participantKey, true);
                  }}
                  deviceKey={deviceKey}
                  data={data}
                />
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OutlierParticipantTable;
