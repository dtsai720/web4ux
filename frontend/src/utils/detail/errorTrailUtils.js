/**
 * Utility functions for error trail detection and analysis
 */

import { calculateDifficulty } from './moveTimeUtils';

/**
 * Detects error trails where start and target have intermediate actions
 * @param {Array} rawData - Raw data records
 * @returns {Object} Analysis data with error trails grouped by device and difficulty
 */
export const detectErrorTrails = (rawData) => {
  try {
    const errorTrails = [];
    const byDevice = {};
    const byDifficulty = {};

    // Filter out deleted records
    const activeData = rawData.filter(record => !record.deleted);

    // Group by trail (device + participant + trail number)
    const trailGroups = {};
    activeData.forEach(record => {
      const trailKey = `${record.deviceName}-${record.participantSerial}-${record.trailNumber}`;
      if (!trailGroups[trailKey]) {
        trailGroups[trailKey] = [];
      }
      trailGroups[trailKey].push(record);
    });

    // Analyze each trail for errors
    Object.keys(trailGroups).forEach(trailKey => {
      const trailRecords = trailGroups[trailKey];

      // Sort records by timestamp
      trailRecords.sort((a, b) => a.timestamp - b.timestamp);

      // Check if this trail has intermediate actions between start and target
      const hasError = isErrorTrail(trailRecords);

      if (hasError) {
        // Get trail metadata
        const firstRecord = trailRecords[0];
        const difficulty = calculateDifficulty(firstRecord.distance, firstRecord.width);

        const errorTrail = {
          deviceName: firstRecord.deviceName,
          deviceOrder: firstRecord.deviceOrder,
          participantSerial: firstRecord.participantSerial,
          trailNumber: firstRecord.trailNumber,
          difficulty: difficulty,
          width: firstRecord.width,
          distance: firstRecord.distance,
          difficultyId: `${difficulty} (${firstRecord.width}/${firstRecord.distance})`,
          difficultyGroup: `${difficulty}_${firstRecord.width}_${firstRecord.distance}`,
          records: trailRecords.map(record => ({
            mark: record.mark,
            x: record.x,
            y: record.y,
            timestamp: record.timestamp,
            action: getActionType(record.mark)
          }))
        };

        errorTrails.push(errorTrail);

        // Group by device
        if (!byDevice[firstRecord.deviceName]) {
          byDevice[firstRecord.deviceName] = [];
        }
        byDevice[firstRecord.deviceName].push(errorTrail);

        // Group by difficulty with width/distance combination
        const diffKey = errorTrail.difficultyId;
        if (!byDifficulty[diffKey]) {
          byDifficulty[diffKey] = [];
        }
        byDifficulty[diffKey].push(errorTrail);
      }
    });

    return {
      errorTrails,
      byDevice,
      byDifficulty,
      totalErrorTrails: errorTrails.length
    };
  } catch (error) {
    console.error('Error detecting error trails:', error);
    return {
      errorTrails: [],
      byDevice: {},
      byDifficulty: {},
      totalErrorTrails: 0
    };
  }
};

/**
 * Checks if a trail has intermediate actions between start and target
 * @param {Array} trailRecords - Records for a single trail, sorted by timestamp
 * @returns {boolean} True if trail has errors (intermediate actions)
 */
const isErrorTrail = (trailRecords) => {
  let startFound = false;
  let targetFound = false;
  let hasIntermediateAction = false;

  for (let i = 0; i < trailRecords.length; i++) {
    const record = trailRecords[i];

    if (record.mark === 'start') {
      startFound = true;
      targetFound = false; // Reset if we find another start
      hasIntermediateAction = false;
    } else if (record.mark === 'target' && startFound) {
      targetFound = true;
      // If we found intermediate actions between this start and target, it's an error
      if (hasIntermediateAction) {
        return true;
      }
      // Reset for potential next sequence
      startFound = false;
      hasIntermediateAction = false;
    } else if (startFound && !targetFound) {
      // Any action between start and target is considered intermediate
      hasIntermediateAction = true;
    }
  }

  return false;
};

/**
 * Determines the action type based on the mark
 * @param {string} mark - The mark value
 * @returns {string} Action type description
 */
const getActionType = (mark) => {
  switch (mark) {
    case 'start':
      return 'start';
    case 'target':
      return 'target';
    default:
      return 'else';
  }
};

/**
 * Get unique difficulties from error trails
 * @param {Array} errorTrails - Array of error trail objects
 * @returns {Array} Sorted array of unique difficulty values
 */
export const getUniqueDifficulties = (errorTrails) => {
  const difficulties = [...new Set(errorTrails.map(trail => trail.difficulty))];
  return difficulties.sort((a, b) => a - b);
};

/**
 * Get unique devices from error trails
 * @param {Array} errorTrails - Array of error trail objects
 * @returns {Array} Sorted array of unique device names
 */
export const getUniqueDevices = (errorTrails) => {
  // 創建 device 到 deviceOrder 的映射
  const deviceOrderMap = {};
  errorTrails.forEach(trail => {
    if (!deviceOrderMap[trail.deviceName]) {
      deviceOrderMap[trail.deviceName] = trail.deviceOrder;
    }
  });

  const devices = [...new Set(errorTrails.map(trail => trail.deviceName))];
  return devices.sort((a, b) => {
    const orderA = deviceOrderMap[a] || '';
    const orderB = deviceOrderMap[b] || '';
    return orderA.localeCompare(orderB);
  });
};
