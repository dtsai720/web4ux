/**
 * Utility functions for result analysis
 * Note: All calculations only consider available and not deleted trails.
 */

/**
 * Calculate results based on device, width, and distance
 * @param {Array} data - Raw data records
 * @returns {Object} Processed results grouped by device, width, and distance
 */
export const calculateResults = (data) => {
  try {
    // Group data by device, width, and distance
    const results = {};

    // Filter out deleted records
    const activeData = data.filter(record => !record.deleted);

    // Get unique devices
    const devices = [...new Set(activeData.map(record => record.deviceName))];

    // Process each device
    devices.forEach(device => {
      const deviceRecords = activeData.filter(record => record.deviceName === device);

      // Get unique widths for this device
      const widths = [...new Set(deviceRecords.map(record => record.width))];

      results[device] = { widths: {} };

      // Process each width
      widths.forEach(width => {
        const widthRecords = deviceRecords.filter(record => record.width === width);

        // Get unique distances for this width
        const distances = [...new Set(widthRecords.map(record => record.distance))];

        results[device].widths[width] = { distances: {} };

        // Process each distance
        distances.forEach(distance => {
          const distanceRecords = widthRecords.filter(record => record.distance === distance);

          // Group by trail
          const trailGroups = {};
          distanceRecords.forEach(record => {
            const trailKey = `${record.participantSerial}-${record.trailNumber}`;
            if (!trailGroups[trailKey]) {
              trailGroups[trailKey] = [];
            }
            trailGroups[trailKey].push(record);
          });

          // Calculate error rate and event time for each trail
          let totalTrails = 0;
          let failedTrails = 0;
          let totalEventTime = 0;
          let availableTrails = 0;

          Object.values(trailGroups).forEach(trail => {
            totalTrails++;

            // Find start and target marks
            const startRecord = trail.find(r => r.mark === 'start');
            const targetRecord = trail.find(r => r.mark === 'target');

            // Check if trail is available (has both start and target, and start comes before target)
            const isAvailable = startRecord && targetRecord && startRecord.timestamp < targetRecord.timestamp;

            if (isAvailable) {
              availableTrails++;

              // Calculate event time (time from start to target)
              const eventTime = targetRecord.timestamp - startRecord.timestamp;
              totalEventTime += eventTime;

              // Check if there are any marks between start and target (failed trail)
              const hasIntermediateMarks = trail.some(r =>
                r.mark !== 'start' &&
                r.mark !== 'target' &&
                r.timestamp > startRecord.timestamp &&
                r.timestamp < targetRecord.timestamp
              );

              if (hasIntermediateMarks) {
                failedTrails++;
              }
            }
          });

          // Calculate error rate and average event time
          const errorRate = availableTrails > 0 ? (failedTrails / availableTrails) : 0;
          const avgEventTime = availableTrails > 0 ? (totalEventTime / availableTrails) : 0;

          // Store results
          results[device].widths[width].distances[distance] = {
            totalTrails,
            availableTrails,
            failedTrails,
            errorRate,
            totalEventTime,
            avgEventTime
          };
        });
      });
    });

    return results;
  } catch (error) {
    console.error('Error calculating results:', error);
    return {};
  }
};

/**
 * Format number to 2 decimal places
 * @param {number} num - Number to format
 * @returns {string} Formatted number with 2 decimal places
 */
export const formatNumber = (num) => {
  return Number(num).toFixed(3);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage (0-1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)} %`;
};
