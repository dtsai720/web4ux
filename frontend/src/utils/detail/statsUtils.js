/**
 * Statistics calculation utilities for trail data
 */
import { DATA_ANALYSIS } from '../common';

/**
 * Calculates statistics for a single trail
 * @param {Array} records - Trail records
 * @returns {Object} Trail statistics
 */
export const calculateSingleTrailStats = (records) => {
  // Find start and target marks
  const startRecord = records.find(r => r.mark === 'start');
  const defaultTargetRecord = records.find(r => r.mark === 'target');
  const targetRecord = records.findLast(r => r.mark === 'target');

  // Check if max timestamp in same trail is target with start before it
  const isMaxTimestampTarget = targetRecord &&
                              Math.max(...records.map(r => r.timestamp)) === targetRecord.timestamp;
  const hasStartBeforeTarget = startRecord && targetRecord &&
                              startRecord.timestamp < targetRecord.timestamp;

  // Calculate available status (3 states)
  // 1. available: has start and target, start before target
  // 2. unavailable: no start or target, or start not before target
  // 3. unavailable but able to calculate: max timestamp in trail is target with start before it
  let availableStatus = DATA_ANALYSIS.AVAILABLE_STATUS.UNAVAILABLE;

  if (startRecord && defaultTargetRecord && startRecord.timestamp < defaultTargetRecord.timestamp) {
    availableStatus = DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE;
  } else if (isMaxTimestampTarget && hasStartBeforeTarget) {
    availableStatus = DATA_ANALYSIS.AVAILABLE_STATUS.CALCULABLE;
  } else {
    availableStatus = DATA_ANALYSIS.AVAILABLE_STATUS.UNAVAILABLE;
  }

  // Calculate error_time (count of non-start/target records between start and target)
  let errorTime = 0;
  if (startRecord && targetRecord) {
    const startTime = startRecord.timestamp;
    const targetTime = targetRecord.timestamp;

    errorTime = records.filter(r => {
      return r.mark !== 'start' && r.mark !== 'target' &&
             r.timestamp > startTime && r.timestamp < targetTime;
    }).length;
  }

  // Calculate event_time (time from start to target)
  let eventTime = 0;
  if (startRecord && targetRecord) {
    eventTime = targetRecord.timestamp - startRecord.timestamp;
  }

  // Calculate has_error (error_time > 0)
  const hasError = errorTime > 0;

  return {
    available: availableStatus === DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE,
    availableStatus: availableStatus,
    error_time: errorTime,
    event_time: eventTime,
    has_error: hasError,
    total_records: records.length
  };
};

/**
 * Calculates aggregated statistics for a collection of trails
 * @param {Object} trailsData - Object containing trail data with stats
 * @returns {Object} Aggregated statistics
 */
export const calculateAggregatedStats = (trailsData) => {
  const stats = {
    totalTrails: 0,
    availableTrails: 0,
    unavailableTrails: 0,
    calculableTrails: 0,
    trailsWithErrors: 0,
    totalEventTime: 0,
    avgEventTime: 0
  };

  Object.keys(trailsData).forEach(trailKey => {
    if (trailKey === 'stats') return; // Skip existing stats

    const trailStats = trailsData[trailKey].stats;
    if (!trailStats) return;

    stats.totalTrails++;

    switch (trailStats.availableStatus) {
      case DATA_ANALYSIS.AVAILABLE_STATUS.UNAVAILABLE:
        stats.unavailableTrails++;
        break;
      case DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE:
        stats.availableTrails++;
        break;
      case DATA_ANALYSIS.AVAILABLE_STATUS.CALCULABLE:
        stats.calculableTrails++;
        break;
      default:
        // Handle unexpected status values
        break;
    }

    if (trailStats.has_error) {
      stats.trailsWithErrors++;
    }

    stats.totalEventTime += trailStats.event_time;
  });

  // Calculate average event time
  if (stats.availableTrails > 0) {
    stats.avgEventTime = Math.round(stats.totalEventTime / stats.availableTrails);
  }

  return stats;
};
