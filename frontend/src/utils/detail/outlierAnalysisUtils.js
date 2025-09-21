/**
 * Outlier analysis utilities for detail page
 */
import { calculateDoubleClickStats } from '../outlier/outlierUtils';
import { OUTLIER_DETECTION, DATA_ANALYSIS } from '../common';

/**
 * Calculates participant error data
 * @param {Object} participant - Participant data with trails
 * @returns {Object} Participant error statistics
 */
export const calculateParticipantErrorData = (participant) => {
  const trailKeys = Object.keys(participant).filter(key => key !== 'stats');

  let participantErrorCount = 0;
  let participantErrorTime = 0;
  let participantTrailCount = 0;
  const errorTrails = [];
  const allAvailableTrails = [];

  trailKeys.forEach(trailKey => {
    const trail = participant[trailKey];
    const trailStats = trail.stats || {};

    // Include both available and calculable trails in calculations
    if (trailStats.available || trailStats.availableStatus === DATA_ANALYSIS.AVAILABLE_STATUS.CALCULABLE) {
      allAvailableTrails.push(trailKey);
      if (trailStats.has_error) {
        participantErrorCount++;
        participantErrorTime += trailStats.error_time;
        errorTrails.push(trailKey);
      }
      participantTrailCount++;
    }
  });

  // Calculate double click statistics
  const doubleClickStats = calculateDoubleClickStats(participant);

  return {
    errorCount: participantErrorCount,
    errorTime: participantErrorTime,
    trailCount: participantTrailCount,
    errorTrails: errorTrails,
    allAvailableTrails: allAvailableTrails,
    doubleClickCount: doubleClickStats.count,
    doubleClickTrails: doubleClickStats.trails,
    isOutlier: false
  };
};

/**
 * Calculates statistical metrics (mean and standard deviation)
 * @param {Array} errorCounts - Array of error counts
 * @param {Array} errorTimes - Array of error times
 * @returns {Object} Statistical metrics
 */
export const calculateStatisticalMetrics = (errorCounts, errorTimes) => {
  if (errorCounts.length === 0) {
    return {
      avgErrorCount: 0,
      stdDevErrorCount: 0,
      avgErrorTime: 0,
      stdDevErrorTime: 0
    };
  }

  // Calculate average error count
  const avgErrorCount = errorCounts.reduce((sum, count) => sum + count, 0) / errorCounts.length;

  // Calculate standard deviation of error count
  const stdDevErrorCount = Math.sqrt(
    errorCounts.reduce((sum, count) => sum + Math.pow(count - avgErrorCount, 2), 0) / errorCounts.length
  );

  // Calculate average error time
  const avgErrorTime = errorTimes.reduce((sum, time) => sum + time, 0) / errorTimes.length;

  // Calculate standard deviation of error time
  const stdDevErrorTime = Math.sqrt(
    errorTimes.reduce((sum, time) => sum + Math.pow(time - avgErrorTime, 2), 0) / errorTimes.length
  );

  return {
    avgErrorCount,
    stdDevErrorCount,
    avgErrorTime,
    stdDevErrorTime
  };
};

/**
 * Marks outliers based on statistical thresholds
 * @param {Object} deviceParticipants - Device participants data
 * @param {Object} deviceStats - Device statistical metrics
 * @param {Array} participantKeys - Array of participant keys
 */
export const markOutliers = (deviceParticipants, deviceStats, participantKeys) => {
  // Mark outliers (exceeding mean + 2 * standard deviation)
  const multiplier = OUTLIER_DETECTION.STANDARD_DEVIATION_MULTIPLIER;

  participantKeys.forEach(participantKey => {
    const participant = deviceParticipants[participantKey];
    const errorCountThreshold = deviceStats.avgErrorCount + multiplier * deviceStats.stdDevErrorCount;
    const errorTimeThreshold = deviceStats.avgErrorTime + multiplier * deviceStats.stdDevErrorTime;

    participant.isOutlier =
      participant.errorCount > errorCountThreshold ||
      participant.errorTime > errorTimeThreshold;
  });
};

/**
 * Processes device outlier data
 * @param {Object} device - Device data
 * @returns {Object} Device outlier analysis
 */
export const processDeviceOutlierData = (device) => {
  const deviceOutliers = {
    participants: {},
    stats: {
      avgErrorCount: 0,
      stdDevErrorCount: 0,
      avgErrorTime: 0,
      stdDevErrorTime: 0
    }
  };

  const participantKeys = Object.keys(device).filter(key => key !== 'stats');

  // Collect error data for all participants
  const errorCounts = [];
  const errorTimes = [];

  participantKeys.forEach(participantKey => {
    const participant = device[participantKey];
    const participantErrorData = calculateParticipantErrorData(participant);

    // Store participant error data
    deviceOutliers.participants[participantKey] = participantErrorData;

    // Add to device overall statistics
    errorCounts.push(participantErrorData.errorCount);
    errorTimes.push(participantErrorData.errorTime);
  });

  // Calculate mean and standard deviation
  const stats = calculateStatisticalMetrics(errorCounts, errorTimes);
  deviceOutliers.stats = stats;

  // Mark outliers
  markOutliers(deviceOutliers.participants, stats, participantKeys);

  return deviceOutliers;
};
