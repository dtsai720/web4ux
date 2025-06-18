/**
 * Constants and configuration for the detail page
 */

/**
 * Group by options configuration
 */
export const GROUP_BY_OPTIONS = {
  by_device: {
    label: 'Grouped by Device',
    description: 'Organize data with devices as primary groups, participants as subgroups',
    icon: '🖥️',
    structure: 'Device ➜ Participant ➜ Trail'
  },
  by_participant: {
    label: 'Grouped by Participant',
    description: 'Organize data with participants as primary groups, devices as subgroups',
    icon: '👤',
    structure: 'Participant ➜ Device ➜ Trail'
  }
};

/**
 * Mode types for the detail page
 */
export const MODE_TYPES = {
  DETAIL_RECORD: 'detail_record',
  DELETED_ITEMS: 'deleted_items',
  OUTLIER_ANALYSIS: 'outlier_analysis',
  RESULT_ANALYSIS: 'result_analysis'
};

/**
 * Default state values for the detail page
 */
export const DEFAULT_STATE = {
  data: {},
  loading: false,
  error: '',
  summaryInfo: null,
  groupBy: 'by_device',
  expandedLevel1: {},
  expandedLevel2: {},
  expandedTrails: {},
  detailedData: {},
  loadingDetailed: {},
  outlierMode: false,
  outlierData: {},
  selectedOutlierDevice: null,
  selectedOutlierParticipant: null,
  selectedOutlierTrail: null,
  rawData: [],
  deletedTrails: {},
  deletedParticipants: {},
  deleteMode: false,
  resultMode: false
};
