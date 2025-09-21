/**
 * TrailStats class for encapsulating trail statistics calculation and management
 */
import { DATA_ANALYSIS } from '../common';

export class TrailStats {
  constructor(records) {
    this.records = records || [];
    this._stats = null;
  }

  /**
   * Get calculated statistics, computing them if not already done
   * @returns {Object} Trail statistics
   */
  get stats() {
    if (!this._stats) {
      this._stats = this._calculateStats();
    }
    return this._stats;
  }

  /**
   * Reset cached statistics (useful when records change)
   */
  resetStats() {
    this._stats = null;
  }

  /**
   * Update records and reset cached stats
   * @param {Array} newRecords - New records array
   */
  updateRecords(newRecords) {
    this.records = newRecords || [];
    this.resetStats();
  }

  /**
   * Private method to calculate trail statistics
   * @returns {Object} Calculated statistics
   */
  _calculateStats() {
    const startRecord = this._findStartRecord();
    const defaultTargetRecord = this._findDefaultTargetRecord();
    const targetRecord = this._findLastTargetRecord();

    const availableStatus = this._calculateAvailableStatus(startRecord, defaultTargetRecord, targetRecord);
    const errorTime = this._calculateErrorTime(startRecord, targetRecord);
    const eventTime = this._calculateEventTime(startRecord, targetRecord);
    const hasError = errorTime > 0;

    return {
      available: availableStatus === DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE,
      availableStatus,
      error_time: errorTime,
      event_time: eventTime,
      has_error: hasError,
      total_records: this.records.length
    };
  }

  /**
   * Find the start record in the trail
   * @returns {Object|undefined} Start record
   */
  _findStartRecord() {
    return this.records.find(r => r.mark === 'start');
  }

  /**
   * Find the first target record in the trail
   * @returns {Object|undefined} Default target record
   */
  _findDefaultTargetRecord() {
    return this.records.find(r => r.mark === 'target');
  }

  /**
   * Find the last target record in the trail
   * @returns {Object|undefined} Last target record
   */
  _findLastTargetRecord() {
    return this.records.findLast(r => r.mark === 'target');
  }

  /**
   * Calculate the available status based on start and target records
   * @param {Object} startRecord - Start record
   * @param {Object} defaultTargetRecord - Default target record
   * @param {Object} targetRecord - Last target record
   * @returns {string} Available status
   */
  _calculateAvailableStatus(startRecord, defaultTargetRecord, targetRecord) {
    if (startRecord && defaultTargetRecord && startRecord.timestamp < defaultTargetRecord.timestamp) {
      return DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE;
    }

    // Check if max timestamp in same trail is target with start before it
    const isMaxTimestampTarget = targetRecord &&
                                Math.max(...this.records.map(r => r.timestamp)) === targetRecord.timestamp;
    const hasStartBeforeTarget = startRecord && targetRecord &&
                                startRecord.timestamp < targetRecord.timestamp;

    if (isMaxTimestampTarget && hasStartBeforeTarget) {
      return DATA_ANALYSIS.AVAILABLE_STATUS.CALCULABLE;
    }

    return DATA_ANALYSIS.AVAILABLE_STATUS.UNAVAILABLE;
  }

  /**
   * Calculate error time (count of non-start/target records between start and target)
   * @param {Object} startRecord - Start record
   * @param {Object} targetRecord - Target record
   * @returns {number} Error time count
   */
  _calculateErrorTime(startRecord, targetRecord) {
    if (!startRecord || !targetRecord) return 0;

    const startTime = startRecord.timestamp;
    const targetTime = targetRecord.timestamp;

    return this.records.filter(r => {
      return r.mark !== 'start' && r.mark !== 'target' &&
             r.timestamp > startTime && r.timestamp < targetTime;
    }).length;
  }

  /**
   * Calculate event time (time from start to target)
   * @param {Object} startRecord - Start record
   * @param {Object} targetRecord - Target record
   * @returns {number} Event time in milliseconds
   */
  _calculateEventTime(startRecord, targetRecord) {
    if (!startRecord || !targetRecord) return 0;
    return targetRecord.timestamp - startRecord.timestamp;
  }

  /**
   * Check if trail has errors
   * @returns {boolean} True if trail has errors
   */
  hasErrors() {
    return this.stats.has_error;
  }

  /**
   * Check if trail is available for analysis
   * @returns {boolean} True if trail is available
   */
  isAvailable() {
    return this.stats.available;
  }

  /**
   * Get trail status as string
   * @returns {string} Status description
   */
  getStatusDescription() {
    switch (this.stats.availableStatus) {
      case DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE:
        return 'Available for analysis';
      case DATA_ANALYSIS.AVAILABLE_STATUS.CALCULABLE:
        return 'Calculable but incomplete';
      case DATA_ANALYSIS.AVAILABLE_STATUS.UNAVAILABLE:
        return 'Unavailable for analysis';
      default:
        return 'Unknown status';
    }
  }
}
