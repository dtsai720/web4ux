/**
 * Utility functions for move time analysis
 */

/**
 * Calculate difficulty level based on width and distance
 * Uses Fitts' Law: ID = log2(distance/width + 1)
 * @param {number} distance - Target distance
 * @param {number} width - Target width
 * @returns {number} Difficulty level rounded to 1 decimal place
 */
export const calculateDifficulty = (distance, width) => {
  if (!distance || !width || width === 0) return 0;
  return Math.round(Math.log2(distance / width + 1) * 10) / 10;
};

/**
 * Calculate move time analysis data grouped by device and difficulty
 * @param {Array} rawData - Raw data records
 * @returns {Object} Analysis data grouped by device, difficulty, and participant
 */
export const calculateMoveTimeAnalysis = (rawData) => {
  try {
    const analysisData = {};

    // Filter out deleted records
    const activeData = rawData.filter(record => !record.deleted);

    // Group by device
    const deviceGroups = {};
    activeData.forEach(record => {
      if (!deviceGroups[record.deviceName]) {
        deviceGroups[record.deviceName] = [];
      }
      deviceGroups[record.deviceName].push(record);
    });

    // Process each device
    Object.keys(deviceGroups).forEach(deviceName => {
      const deviceRecords = deviceGroups[deviceName];

      // Group by trail (participant + trail number)
      const trailGroups = {};
      deviceRecords.forEach(record => {
        const trailKey = `${record.participantSerial}-${record.trailNumber}`;
        if (!trailGroups[trailKey]) {
          trailGroups[trailKey] = {
            participantSerial: record.participantSerial,
            trailNumber: record.trailNumber,
            width: record.width,
            distance: record.distance,
            records: []
          };
        }
        trailGroups[trailKey].records.push(record);
      });

      // Calculate move time for each trail and group by difficulty
      const difficultyGroups = {};
      const participantData = {};

      Object.values(trailGroups).forEach(trail => {
        // Calculate difficulty
        const difficulty = calculateDifficulty(trail.distance, trail.width);
        // Use W/D combination as key to ensure uniqueness for same difficulty values
        const difficultyKey = `W${trail.width}D${trail.distance}`;

        // Calculate move time (event time) for this trail
        const startRecord = trail.records.find(r => r.mark === 'start');
        const targetRecord = trail.records.findLast(r => r.mark === 'target');

        // Check if trail is available or calculable
        const isAvailable = startRecord && targetRecord && startRecord.timestamp < targetRecord.timestamp;
        const isMaxTimestampTarget = targetRecord &&
                                   Math.max(...trail.records.map(r => r.timestamp)) === targetRecord.timestamp;
        const hasStartBeforeTarget = startRecord && targetRecord &&
                                   startRecord.timestamp < targetRecord.timestamp;
        const isCalculable = isMaxTimestampTarget && hasStartBeforeTarget;

        // Only include trails that are available or calculable
        if (isAvailable || isCalculable) {
          const moveTime = targetRecord.timestamp - startRecord.timestamp;

          // Initialize difficulty group if not exists
          if (!difficultyGroups[difficultyKey]) {
            difficultyGroups[difficultyKey] = {
              difficulty: difficulty,
              width: trail.width,
              distance: trail.distance,
              participants: {}
            };
          }

          // Initialize participant data if not exists
          if (!participantData[trail.participantSerial]) {
            participantData[trail.participantSerial] = {
              participantSerial: trail.participantSerial,
              difficulties: {},
              totalMoveTime: 0,
              totalTrails: 0
            };
          }

          // Add move time to difficulty group by participant
          if (!difficultyGroups[difficultyKey].participants[trail.participantSerial]) {
            difficultyGroups[difficultyKey].participants[trail.participantSerial] = {
              participantSerial: trail.participantSerial,
              moveTimes: [],
              totalMoveTime: 0,
              averageMoveTime: 0,
              trailCount: 0
            };
          }

          difficultyGroups[difficultyKey].participants[trail.participantSerial].moveTimes.push(moveTime);
          difficultyGroups[difficultyKey].participants[trail.participantSerial].totalMoveTime += moveTime;
          difficultyGroups[difficultyKey].participants[trail.participantSerial].trailCount++;

          // Add to participant's difficulty data
          if (!participantData[trail.participantSerial].difficulties[difficultyKey]) {
            participantData[trail.participantSerial].difficulties[difficultyKey] = {
              totalMoveTime: 0,
              trailCount: 0,
              averageMoveTime: 0
            };
          }

          participantData[trail.participantSerial].difficulties[difficultyKey].totalMoveTime += moveTime;
          participantData[trail.participantSerial].difficulties[difficultyKey].trailCount++;
          participantData[trail.participantSerial].totalMoveTime += moveTime;
          participantData[trail.participantSerial].totalTrails++;
        }
      });

      // Calculate averages for each difficulty group and participant
      Object.keys(difficultyGroups).forEach(difficultyKey => {
        Object.keys(difficultyGroups[difficultyKey].participants).forEach(participantSerial => {
          const participant = difficultyGroups[difficultyKey].participants[participantSerial];
          participant.averageMoveTime = participant.totalMoveTime / participant.trailCount;
        });
      });

      // Calculate averages for each participant's difficulties
      Object.keys(participantData).forEach(participantSerial => {
        const participant = participantData[participantSerial];
        Object.keys(participant.difficulties).forEach(difficultyKey => {
          const difficulty = participant.difficulties[difficultyKey];
          difficulty.averageMoveTime = difficulty.totalMoveTime / difficulty.trailCount;
        });
      });

      // Sort difficulties by their calculated difficulty values, then by width and distance
      const sortedDifficulties = Object.keys(difficultyGroups).sort((a, b) => {
        const groupA = difficultyGroups[a];
        const groupB = difficultyGroups[b];

        // First sort by difficulty value
        if (groupA.difficulty !== groupB.difficulty) {
          return groupA.difficulty - groupB.difficulty;
        }

        // Then by width
        if (groupA.width !== groupB.width) {
          return groupA.width - groupB.width;
        }

        // Finally by distance
        return groupA.distance - groupB.distance;
      });
      const sortedParticipants = Object.keys(participantData).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

      analysisData[deviceName] = {
        difficulties: sortedDifficulties,
        participants: sortedParticipants,
        difficultyGroups: difficultyGroups,
        participantData: participantData
      };
    });

    return analysisData;
  } catch {
    // Silently handle error - return empty analysis instead of logging
    return {};
  }
};

/**
 * Format move time in milliseconds
 * @param {number} moveTime - Move time in milliseconds
 * @returns {string} Formatted move time string
 */
export const formatMoveTime = (moveTime) => {
  if (moveTime === null || moveTime === undefined || isNaN(moveTime)) {
    return 'N/A';
  }
  return `${Math.round(moveTime)} ms`;
};

/**
 * Get participant's move time for a specific difficulty key (W/D combination)
 * @param {Object} analysisData - Analysis data for the device
 * @param {string} participantSerial - Participant serial
 * @param {string} difficultyKey - Difficulty key (W{width}D{distance} format)
 * @returns {number|null} Average move time or null if not available
 */
export const getParticipantMoveTime = (analysisData, participantSerial, difficultyKey) => {
  if (!analysisData.difficultyGroups[difficultyKey] ||
      !analysisData.difficultyGroups[difficultyKey].participants[participantSerial]) {
    return null;
  }

  return analysisData.difficultyGroups[difficultyKey].participants[participantSerial].averageMoveTime;
};
