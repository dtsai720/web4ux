/**
 * Utility functions for handling detail page data
 */
import { calculateDoubleClickStats } from '../outlier/outlierUtils';

/**
 * Organizes raw data based on grouping type (by device or by participant)
 * @param {Array} rawData - The raw data array
 * @param {String} groupByType - The grouping type ('by_device' or 'by_participant')
 * @returns {Object} Organized data structure
 */
export const organizeData = (rawData, groupByType) => {
  const organized = {};

  // 過濾掉已刪除的記錄
  const activeData = rawData.filter(record => !record.deleted);

  // 對 device 和 participant 進行排序，確保按照數字順序顯示
  const sortByNumeric = (a, b) => {
    // 提取數字部分
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    // 直接比較數字大小
    return a < b? -1: 1;
  };

  // 獲取排序後的 device 和 participant 列表
  const sortedDevices = [...new Set(activeData.map(record => record.deviceName))].sort(sortByNumeric);
  const sortedParticipants = [...new Set(activeData.map(record => record.participantSerial))].sort(sortByNumeric);

  if (groupByType === 'by_device') {
    // Device -> Participant -> Trail 結構
    sortedDevices.forEach(deviceKey => {
      organized[deviceKey] = {};

      // 只獲取當前 device 的記錄
      const deviceRecords = activeData.filter(record => record.deviceName === deviceKey);

      // 對當前 device 的 participants 進行排序
      const deviceParticipants = [...new Set(deviceRecords.map(record => record.participantSerial))].sort(sortByNumeric);
      deviceParticipants.forEach(participantKey => {
        organized[deviceKey][participantKey] = {};

        // 獲取當前 device 和 participant 的記錄
        const participantRecords = deviceRecords.filter(record => record.participantSerial === participantKey);

        // 獲取所有 trail numbers
        const trailNumbers = [...new Set(participantRecords.map(record => record.trailNumber))].sort((a, b) => a - b);

        trailNumbers.forEach(trailKey => {
          // 獲取當前 trail 的所有記錄
          const trailRecords = participantRecords.filter(record => record.trailNumber === trailKey);

          organized[deviceKey][participantKey][trailKey] = trailRecords;
        });
      });
    });
  } else {
    // Participant -> Device -> Trail 結構
    sortedParticipants.forEach(participantKey => {
      organized[participantKey] = {};

      // 只獲取當前 participant 的記錄
      const participantRecords = activeData.filter(record => record.participantSerial === participantKey);

      // 對當前 participant 的 devices 進行排序
      const participantDevices = [...new Set(participantRecords.map(record => record.deviceName))].sort(sortByNumeric);

      participantDevices.forEach(deviceKey => {
        organized[participantKey][deviceKey] = {};

        // 獲取當前 participant 和 device 的記錄
        const deviceRecords = participantRecords.filter(record => record.deviceName === deviceKey);

        // 獲取所有 trail numbers
        const trailNumbers = [...new Set(deviceRecords.map(record => record.trailNumber))].sort((a, b) => a - b);

        trailNumbers.forEach(trailKey => {
          // 獲取當前 trail 的所有記錄
          const trailRecords = deviceRecords.filter(record => record.trailNumber === trailKey);

          organized[participantKey][deviceKey][trailKey] = trailRecords;
        });
      });
    });
  }

  // 計算每個 trail 的統計數據
  calculateTrailStats(organized, groupByType);

  return { data: organized };
};

/**
 * Calculates statistics for trails in organized data
 * @param {Object} organizedData - The organized data structure
 * @param {String} groupByType - The grouping type
 */
export const calculateTrailStats = (organizedData, groupByType) => {
  // 遍歷所有 level1 (device 或 participant)
  Object.keys(organizedData).forEach(level1Key => {
    // 遍歷所有 level2 (participant 或 device)
    Object.keys(organizedData[level1Key]).forEach(level2Key => {
      // 遍歷所有 trails
      Object.keys(organizedData[level1Key][level2Key]).forEach(trailKey => {
        const records = organizedData[level1Key][level2Key][trailKey];

        // 尋找 start 和 target 標記
        const startRecord = records.find(r => r.mark === 'start');
        const defaultTargetRecord = records.find(r => r.mark === 'target');

        const targetRecord = records.findLast(r => r.mark === 'target');

        // 檢查是否為同一個 trail 中最大的 timestamp 是 target 且前面有 start
        const isMaxTimestampTarget = targetRecord &&
                                    Math.max(...records.map(r => r.timestamp)) === targetRecord.timestamp;
        const hasStartBeforeTarget = startRecord && targetRecord &&
                                    startRecord.timestamp < targetRecord.timestamp;

        // 計算 available 狀態 (3種狀態)
        // 1. available: 有 start 和 target，且 start 在 target 之前
        // 2. unavailable: 沒有 start 或 target，或 start 不在 target 之前
        // 3. unavailable but able to calculate: 同一個 trail 中最大的 timestamp 是 target 且前面有 start
        let availableStatus = 0; // 0: unavailable, 1: available, 2: unavailable but able to calculate

        if (startRecord && defaultTargetRecord && startRecord.timestamp < defaultTargetRecord.timestamp) {
          availableStatus = 1; // available
        } else if (isMaxTimestampTarget && hasStartBeforeTarget) {
          availableStatus = 2; // unavailable but able to calculate
        } else {
          availableStatus = 0; // unavailable
        }

        // 計算 error_time (start 和 target 之間的非 start 與 target 的數量)
        let errorTime = 0;
        if (startRecord && targetRecord) {
          const startTime = startRecord.timestamp;
          const targetTime = targetRecord.timestamp;

          errorTime = records.filter(r => {
            return r.mark !== 'start' && r.mark !== 'target' &&
                   r.timestamp > startTime && r.timestamp < targetTime;
          }).length;
        }

        // 計算 event_time (start 到 target 的時間)
        let eventTime = 0;
        if (startRecord && targetRecord) {
          eventTime = targetRecord.timestamp - startRecord.timestamp;
        }

        // 計算 has_error (error_time > 0)
        const hasError = errorTime > 0;

        // 將統計數據添加到 trail 對象
        organizedData[level1Key][level2Key][trailKey].stats = {
          available: availableStatus === 1,
          availableStatus: availableStatus, // 0: unavailable, 1: available, 2: unavailable but able to calculate
          error_time: errorTime,
          event_time: eventTime,
          has_error: hasError,
          total_records: records.length
        };
      });

      // 計算 level2 的統計數據
      const level2Stats = {
        totalTrails: 0,
        availableTrails: 0,
        unavailableTrails: 0,
        calculableTrails: 0,
        trailsWithErrors: 0,
        totalEventTime: 0,
        avgEventTime: 0
      };

      Object.keys(organizedData[level1Key][level2Key]).forEach(trailKey => {
        const trailStats = organizedData[level1Key][level2Key][trailKey].stats;
        level2Stats.totalTrails++;

        if (trailStats.availableStatus === 0) {
          level2Stats.unavailableTrails++;
        }
        if (trailStats.availableStatus === 1) {
          level2Stats.availableTrails++;
        }
        if (trailStats.availableStatus === 2) {
          level2Stats.calculableTrails++;
        }

        if (trailStats.has_error) {
          level2Stats.trailsWithErrors++;
        }

        level2Stats.totalEventTime += trailStats.event_time;
      });

      // 計算平均事件時間
      if (level2Stats.availableTrails > 0) {
        level2Stats.avgEventTime = Math.round(level2Stats.totalEventTime / level2Stats.availableTrails);
      }

      // 將 level2 統計數據添加到對象
      organizedData[level1Key][level2Key].stats = level2Stats;
    });

    // 計算 level1 的統計數據
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
      const level2Stats = organizedData[level1Key][level2Key].stats;
      level1Stats.totalLevel2++;
      level1Stats.totalTrails += level2Stats.totalTrails;
      level1Stats.availableTrails += level2Stats.availableTrails;
      level1Stats.unavailableTrails += level2Stats.unavailableTrails;
      level1Stats.calculableTrails += level2Stats.calculableTrails;
      level1Stats.trailsWithErrors += level2Stats.trailsWithErrors;
      level1Stats.totalEventTime += level2Stats.totalEventTime;
    });

    // 計算平均事件時間
    if (level1Stats.availableTrails > 0) {
      level1Stats.avgEventTime = Math.round(level1Stats.totalEventTime / level1Stats.availableTrails);
    }

    // 將 level1 統計數據添加到對象
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

  // 過濾出已刪除的記錄
  const deletedRecords = data.filter(record => record.deleted);

  // 按照 device 和 participant 分組
  deletedRecords.forEach(record => {
    const deviceKey = record.deviceName;
    const participantKey = record.participantSerial;
    const trailKey = record.trailNumber;
    const combinedTrailKey = `${deviceKey}-${participantKey}-${trailKey}`;

    // 收集已刪除的 trails
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

    // 收集已刪除的 participants
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

    // 檢查這個 trail 是否已經計算過
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
 * Formats timestamp to date time string
 * @param {Number} timestamp - The timestamp to format
 * @returns {String} Formatted date time string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Calculates outlier data from organized data
 * @param {Object} data - The organized data
 * @param {Array} rawData - The raw data array
 * @returns {Object} Outlier data
 */
export const calculateOutlierData = (data, rawData) => {
  const outliers = {};

  // 遍歷所有 devices
  Object.keys(data).forEach(deviceKey => {
    outliers[deviceKey] = {
      participants: {},
      stats: {
        avgErrorCount: 0,
        stdDevErrorCount: 0,
        avgErrorTime: 0,
        stdDevErrorTime: 0
      }
    };

    const device = data[deviceKey];
    const participantKeys = Object.keys(device).filter(key => key !== 'stats');

    // 收集所有參與者的錯誤數據
    const errorCounts = [];
    const errorTimes = [];

    participantKeys.forEach(participantKey => {
      const participant = device[participantKey];
      const trailKeys = Object.keys(participant).filter(key => key !== 'stats');

      // 計算此參與者的總錯誤數和錯誤時間
      let participantErrorCount = 0;
      let participantErrorTime = 0;
      let participantTrailCount = 0;
      const errorTrails = [];
      const allAvailableTrails = [];

      trailKeys.forEach(trailKey => {
        const trail = participant[trailKey];
        const trailStats = trail.stats || {};

        // Include both available and calculable trails in calculations
        if (trailStats.available || trailStats.availableStatus === 2) {
          allAvailableTrails.push(trailKey);
          if (trailStats.has_error) {
            participantErrorCount++;
            participantErrorTime += trailStats.error_time;
            errorTrails.push(trailKey);
          }
          participantTrailCount++;
        }
      });

      // 計算 double click 統計
      const doubleClickStats = calculateDoubleClickStats(participant);

      // 存儲參與者的錯誤數據
      outliers[deviceKey].participants[participantKey] = {
        errorCount: participantErrorCount,
        errorTime: participantErrorTime,
        trailCount: participantTrailCount,
        errorTrails: errorTrails,
        allAvailableTrails: allAvailableTrails,
        doubleClickCount: doubleClickStats.count,
        doubleClickTrails: doubleClickStats.trails,
        isOutlier: false
      };

      // 添加到設備的總體統計
      errorCounts.push(participantErrorCount);
      errorTimes.push(participantErrorTime);
    });

    // 計算平均值和標準差
    if (errorCounts.length > 0) {
      // 計算平均錯誤數
      const avgErrorCount = errorCounts.reduce((sum, count) => sum + count, 0) / errorCounts.length;

      // 計算錯誤數的標準差
      const stdDevErrorCount = Math.sqrt(
        errorCounts.reduce((sum, count) => sum + Math.pow(count - avgErrorCount, 2), 0) / errorCounts.length
      );

      // 計算平均錯誤時間
      const avgErrorTime = errorTimes.reduce((sum, time) => sum + time, 0) / errorTimes.length;

      // 計算錯誤時間的標準差
      const stdDevErrorTime = Math.sqrt(
        errorTimes.reduce((sum, time) => sum + Math.pow(time - avgErrorTime, 2), 0) / errorTimes.length
      );

      // 存儲設備的統計數據
      outliers[deviceKey].stats = {
        avgErrorCount,
        stdDevErrorCount,
        avgErrorTime,
        stdDevErrorTime
      };

      // 標記 outliers (超過平均值 + 2 * 標準差)
      participantKeys.forEach(participantKey => {
        const participant = outliers[deviceKey].participants[participantKey];
        const errorCountThreshold = avgErrorCount + 2 * stdDevErrorCount;
        const errorTimeThreshold = avgErrorTime + 2 * stdDevErrorTime;

        participant.isOutlier =
          participant.errorCount > errorCountThreshold ||
          participant.errorTime > errorTimeThreshold;
      });
    }
  });

  return outliers;
};
