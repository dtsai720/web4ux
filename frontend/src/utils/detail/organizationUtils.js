/**
 * Data organization utilities for detail page
 */

/**
 * Sorts devices and participants by numeric order for proper display
 * @param {string} a - First item to compare
 * @param {string} b - Second item to compare
 * @returns {number} Sort comparison result
 */
export const sortByNumeric = (a, b) => {
  // Extract numeric part for numeric comparison
  const numA = parseInt(a.replace(/\D/g, '')) || 0;
  const numB = parseInt(b.replace(/\D/g, '')) || 0;
  // Use numeric comparison
  return numA - numB;
};

/**
 * Creates device to deviceOrder mapping from data
 * @param {Array} data - Data records
 * @returns {Object} Device order mapping
 */
export const createDeviceOrderMapping = (data) => {
  const deviceOrderMap = {};
  data.forEach(record => {
    if (!deviceOrderMap[record.deviceName]) {
      deviceOrderMap[record.deviceName] = record.deviceOrder;
    }
  });
  return deviceOrderMap;
};

/**
 * Sorts devices by their order
 * @param {Array} devices - Device names
 * @param {Object} deviceOrderMap - Device to order mapping
 * @returns {Array} Sorted devices
 */
export const sortDevicesByOrder = (devices, deviceOrderMap) => {
  return devices.sort((a, b) => {
    const orderA = deviceOrderMap[a] || '';
    const orderB = deviceOrderMap[b] || '';
    return orderA.localeCompare(orderB);
  });
};

/**
 * Organizes trail records by device-participant-trail structure
 * @param {Array} activeData - Filtered active data
 * @param {Array} sortedDevices - Sorted device list
 * @returns {Object} Organized data structure
 */
export const organizeByDevice = (activeData, sortedDevices) => {
  const organized = {};

  sortedDevices.forEach(deviceKey => {
    organized[deviceKey] = {};

    // Get records for current device only
    const deviceRecords = activeData.filter(record => record.deviceName === deviceKey);

    // Sort participants for current device
    const deviceParticipants = [...new Set(deviceRecords.map(record => record.participantSerial))].sort(sortByNumeric);
    deviceParticipants.forEach(participantKey => {
      organized[deviceKey][participantKey] = {};

      // Get records for current device and participant
      const participantRecords = deviceRecords.filter(record => record.participantSerial === participantKey);

      // Get all trail numbers
      const trailNumbers = [...new Set(participantRecords.map(record => record.trailNumber))].sort((a, b) => a - b);

      trailNumbers.forEach(trailKey => {
        // Get all records for current trail
        const trailRecords = participantRecords.filter(record => record.trailNumber === trailKey);
        organized[deviceKey][participantKey][trailKey] = trailRecords;
      });
    });
  });

  return organized;
};

/**
 * Organizes trail records by participant-device-trail structure
 * @param {Array} activeData - Filtered active data
 * @param {Array} sortedParticipants - Sorted participant list
 * @returns {Object} Organized data structure
 */
export const organizeByParticipant = (activeData, sortedParticipants) => {
  const organized = {};

  sortedParticipants.forEach(participantKey => {
    organized[participantKey] = {};

    // Get records for current participant only
    const participantRecords = activeData.filter(record => record.participantSerial === participantKey);

    // Sort devices for current participant
    // Create device to deviceOrder mapping for current participant
    const participantDeviceOrderMap = createDeviceOrderMapping(participantRecords);

    const participantDevices = [...new Set(participantRecords.map(record => record.deviceName))];
    const sortedParticipantDevices = sortDevicesByOrder(participantDevices, participantDeviceOrderMap);

    sortedParticipantDevices.forEach(deviceKey => {
      organized[participantKey][deviceKey] = {};

      // Get records for current participant and device
      const deviceRecords = participantRecords.filter(record => record.deviceName === deviceKey);

      // Get all trail numbers
      const trailNumbers = [...new Set(deviceRecords.map(record => record.trailNumber))].sort((a, b) => a - b);

      trailNumbers.forEach(trailKey => {
        // Get all records for current trail
        const trailRecords = deviceRecords.filter(record => record.trailNumber === trailKey);
        organized[participantKey][deviceKey][trailKey] = trailRecords;
      });
    });
  });

  return organized;
};
