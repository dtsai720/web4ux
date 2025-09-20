/**
 * API utility functions for detail page
 */
import { GetProjectDetailByID, DeleteOrRestore } from '../../../wailsjs/go/pkg/App';

const removeDuplicates = (data) => {
  const unique = data.filter((item, index, self) =>
    index === self.findIndex(obj => obj.projectId === item.projectId && obj.informationId === item.informationId)
  );

  return unique;
};

/**
 * Loads project detail data by ID
 * @param {String} selectedSummaryId - The ID of the selected summary
 * @returns {Promise<Object>} Promise resolving to the loaded data and metadata
 */
export const loadProjectData = async (selectedSummaryId) => {
  if (!selectedSummaryId) {
    throw new Error('No summary ID provided');
  }

  try {
    const result = await GetProjectDetailByID(selectedSummaryId);

    if (result && Array.isArray(result)) {
      // Extract summary info from the first record
      let summaryInfo = null;
      if (result.length > 0) {
        summaryInfo = {
          id: selectedSummaryId,
          name: result[0].projectName,
          creator: result[0].projectCreator,
          updatedAt: result[0].projectUpdatedAt
        };
      }

      return {
        rawData: result,
        summaryInfo
      };
    } else {
      throw new Error('Invalid data format received');
    }
  } catch (err) {
    console.error('Load data error:', err);
    throw err;
  }
};

/**
 * Toggles delete/restore for a participant's data
 * @param {String} deviceKey - The device key
 * @param {String} participantKey - The participant key
 * @param {Array} rawData - The raw data array
 * @param {Boolean} isDelete - Whether to delete (true) or restore (false)
 * @returns {Promise<{success: boolean, recordsUpdated: number}>} Promise resolving to operation result
 */
export const toggleParticipantDelete = async (deviceKey, participantKey, rawData, isDelete = true) => {
  try {
    // Find relevant records - all records belonging to the device and participant
    const recordsToUpdate = rawData.filter(record =>
      record.deviceName === deviceKey &&
      record.participantSerial === participantKey &&
      record.deleted !== isDelete
    );

    if (recordsToUpdate.length === 0) {
      return { success: true, recordsUpdated: 0 };
    }

    // Call delete/restore API
    const uniqueRecords = removeDuplicates(recordsToUpdate);
    for (const record of uniqueRecords) {
      await DeleteOrRestore(record.projectId, record.informationId, isDelete);
    }

    return { success: true, recordsUpdated: uniqueRecords.length };
  } catch (err) {
    console.error(`Toggle participant ${isDelete ? 'delete' : 'restore'} failed:`, err);
    throw err;
  }
};

/**
 * Toggles delete/restore for a trail's data
 * @param {String} deviceKey - The device key
 * @param {String} participantKey - The participant key
 * @param {String} trailKey - The trail key
 * @param {Array} rawData - The raw data array
 * @param {Boolean} isDelete - Whether to delete (true) or restore (false)
 * @returns {Promise<{success: boolean, recordsUpdated: number}>} Promise resolving to operation result
 */
export const toggleTrailDelete = async (deviceKey, participantKey, trailKey, rawData, isDelete = true) => {
  try {
    // Find relevant records
    const recordsToUpdate = rawData.filter(record =>
      record.deviceName === deviceKey &&
      record.participantSerial === participantKey &&
      record.trailNumber === parseInt(trailKey) &&
      record.deleted ^ isDelete
    );

    if (recordsToUpdate.length === 0) {
      return { success: true, recordsUpdated: 0 };
    }

    // Call delete/restore API
    const uniqueRecords = removeDuplicates(recordsToUpdate);
    for (const record of uniqueRecords) {
      await DeleteOrRestore(record.projectId, record.informationId, isDelete);
    }

    return { success: true, recordsUpdated: uniqueRecords.length };
  } catch (err) {
    console.error(`Toggle trail ${isDelete ? 'delete' : 'restore'} failed:`, err);
    throw err;
  }
};
