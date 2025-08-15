/**
 * Constants and configuration for the detail page
 */

/**
 * Mode types for the detail page
 */
export const MODE_TYPES = {
  DELETED_ITEMS: 'deleted_items',
  OUTLIER_ANALYSIS: 'outlier_analysis',
  MOVEMENT_TIME_MATRIX: 'movement_time_matrix',
  ERROR_TRAIL_ANALYSIS: 'error_trail_analysis'
};

/**
 * Default state values for the detail page
 */
export const DEFAULT_STATE = {
  data: {},
  loading: false,
  error: '',
  summaryInfo: null,
  outlierMode: false,
  outlierData: {},
  selectedOutlierDevice: null,
  selectedOutlierParticipant: null,
  selectedOutlierTrail: null,
  rawData: [],
  deletedTrails: {},
  deletedParticipants: {},
  deleteMode: false,
  movementTimeMatrixMode: false,
  errorTrailMode: false
};
