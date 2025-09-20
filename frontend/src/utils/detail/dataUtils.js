/**
 * Utility functions for handling detail page data
 */
import { formatDateTime } from '../common';
import { calculateSingleTrailStats, calculateAggregatedStats } from './statsUtils';
import {
  sortByNumeric,
  createDeviceOrderMapping,
  sortDevicesByOrder,
  organizeByDevice,
  organizeByParticipant
} from './organizationUtils';
import { processDeviceOutlierData } from './outlierAnalysisUtils';

/**
 * Organizes raw data based on grouping type (by device or by participant)
 * @param {Array} rawData - The raw data array
 * @param {String} groupByType - The grouping type ('by_device' or 'by_participant')
 * @returns {Object} Organized data structure
 */
export const organizeData = (rawData, groupByType) => {
  // Filter out deleted records
  const activeData = rawData.filter(record => !record.deleted);

  // Prepare sorted lists
  const deviceOrderMap = createDeviceOrderMapping(activeData);
  const sortedDevices = sortDevicesByOrder(
    [...new Set(activeData.map(record => record.deviceName))],
    deviceOrderMap
  );
  const sortedParticipants = [...new Set(activeData.map(record => record.participantSerial))].sort(sortByNumeric);

  // Organize data based on grouping type
  let organized;
  if (groupByType === 'by_device') {
    organized = organizeByDevice(activeData, sortedDevices);
  } else {
    organized = organizeByParticipant(activeData, sortedParticipants);
  }

  // Calculate statistics for each trail
  calculateTrailStats(organized);

  return { data: organized };
};

/**
 * Calculates statistics for trails in organized data
 * @param {Object} organizedData - The organized data structure
 */
export const calculateTrailStats = (organizedData) => {
  // Calculate trail-level statistics
  calculateTrailLevelStats(organizedData);

  // Calculate level2 statistics (participant or device level)
  calculateLevel2Stats(organizedData);

  // Calculate level1 statistics (device or participant level)
  calculateLevel1Stats(organizedData);
};

/**
 * Calculates statistics for individual trails
 * @param {Object} organizedData - The organized data structure
 */
const calculateTrailLevelStats = (organizedData) => {
  Object.keys(organizedData).forEach(level1Key => {
    Object.keys(organizedData[level1Key]).forEach(level2Key => {
      Object.keys(organizedData[level1Key][level2Key]).forEach(trailKey => {
        const records = organizedData[level1Key][level2Key][trailKey];
        if (Array.isArray(records)) {
          organizedData[level1Key][level2Key][trailKey].stats = calculateSingleTrailStats(records);
        }
      });
    });
  });
};

/**
 * Calculates statistics for level2 (participant or device level)
 * @param {Object} organizedData - The organized data structure
 */
const calculateLevel2Stats = (organizedData) => {
  Object.keys(organizedData).forEach(level1Key => {
    Object.keys(organizedData[level1Key]).forEach(level2Key => {
      const level2Data = organizedData[level1Key][level2Key];
      organizedData[level1Key][level2Key].stats = calculateAggregatedStats(level2Data);
    });
  });
};

/**
 * Calculates statistics for level1 (device or participant level)
 * @param {Object} organizedData - The organized data structure
 */
const calculateLevel1Stats = (organizedData) => {
  Object.keys(organizedData).forEach(level1Key => {
    const level1Stats = {
      totalLevel2: 0,
      totalTrails: 0,
      availableTrails: 0,
      unavailableTrails: 0,
      calculableTrails: 0,
      trailsWithErrors: 0,
      totalEventTime: 0,
      avgEventTime: 0
    };

    Object.keys(organizedData[level1Key]).forEach(level2Key => {
      if (level2Key === 'stats') return; // Skip existing stats

      const level2Stats = organizedData[level1Key][level2Key].stats;
      if (!level2Stats) return;

      level1Stats.totalLevel2++;
      level1Stats.totalTrails += level2Stats.totalTrails;
      level1Stats.availableTrails += level2Stats.availableTrails;
      level1Stats.unavailableTrails += level2Stats.unavailableTrails;
      level1Stats.calculableTrails += level2Stats.calculableTrails;
      level1Stats.trailsWithErrors += level2Stats.trailsWithErrors;
      level1Stats.totalEventTime += level2Stats.totalEventTime;
    });

    // Calculate average event time
    if (level1Stats.availableTrails > 0) {
      level1Stats.avgEventTime = Math.round(level1Stats.totalEventTime / level1Stats.availableTrails);
    }

    // Add level1 statistics to object
    organizedData[level1Key].stats = level1Stats;
  });
};

/**
 * Collects deleted trails and participants from raw data
 * @param {Array} data - The raw data array
 * @returns {Object} Object containing deleted trails and participants
 */
export const collectDeletedItems = (data) => {
  const deletedTrailsMap = {};
  const deletedParticipantsMap = {};

  // Filter out deleted records
  const deletedRecords = data.filter(record => record.deleted);

  // Group by device and participant
  deletedRecords.forEach(record => {
    const deviceKey = record.deviceName;
    const participantKey = record.participantSerial;
    const trailKey = record.trailNumber;
    const combinedTrailKey = `${deviceKey}-${participantKey}-${trailKey}`;

    // Collect deleted trails
    if (!deletedTrailsMap[combinedTrailKey]) {
      deletedTrailsMap[combinedTrailKey] = {
        device: deviceKey,
        participant: participantKey,
        participantName: record.participantName,
        trail: trailKey,
        records: []
      };
    }
    deletedTrailsMap[combinedTrailKey].records.push(record);

    // Collect deleted participants
    const combinedParticipantKey = `${deviceKey}-${participantKey}`;
    if (!deletedParticipantsMap[combinedParticipantKey]) {
      deletedParticipantsMap[combinedParticipantKey] = {
        device: deviceKey,
        participant: participantKey,
        participantName: record.participantName,
        trailCount: 0,
        recordCount: 0
      };
    }

    // Check if this trail has already been counted
    const trails = Object.keys(deletedParticipantsMap[combinedParticipantKey]).filter(
      key => key.startsWith('trail-')
    );
    if (!trails.includes(`trail-${trailKey}`)) {
      deletedParticipantsMap[combinedParticipantKey][`trail-${trailKey}`] = true;
      deletedParticipantsMap[combinedParticipantKey].trailCount++;
    }

    deletedParticipantsMap[combinedParticipantKey].recordCount++;
  });

  return { deletedTrails: deletedTrailsMap, deletedParticipants: deletedParticipantsMap };
};


/**
 * Calculates outlier data from organized data
 * @param {Object} data - The organized data
 * @returns {Object} Outlier data
 */
export const calculateOutlierData = (data) => {
  const outliers = {};

  // Process each device for outlier analysis
  Object.keys(data).forEach(deviceKey => {
    const device = data[deviceKey];
    outliers[deviceKey] = processDeviceOutlierData(device);
  });

  return outliers;
};

// Re-export formatDateTime for backward compatibility
export { formatDateTime };
