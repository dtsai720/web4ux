/**
 * StatsAggregator class for aggregating statistics from multiple trails
 */
import { DATA_ANALYSIS } from '../common';

export class StatsAggregator {
  constructor() {
    this.trails = new Map();
    this._aggregatedStats = null;
  }

  /**
   * Add a trail with its statistics
   * @param {string} trailKey - Unique trail identifier
   * @param {Object} trailStats - Trail statistics object
   */
  addTrail(trailKey, trailStats) {
    this.trails.set(trailKey, trailStats);
    this._aggregatedStats = null; // Reset cached stats
  }

  /**
   * Remove a trail from aggregation
   * @param {string} trailKey - Trail identifier to remove
   */
  removeTrail(trailKey) {
    this.trails.delete(trailKey);
    this._aggregatedStats = null; // Reset cached stats
  }

  /**
   * Clear all trails
   */
  clearTrails() {
    this.trails.clear();
    this._aggregatedStats = null;
  }

  /**
   * Get aggregated statistics
   * @returns {Object} Aggregated statistics
   */
  getAggregatedStats() {
    if (!this._aggregatedStats) {
      this._aggregatedStats = this._calculateAggregatedStats();
    }
    return this._aggregatedStats;
  }

  /**
   * Force recalculation of aggregated statistics
   * @returns {Object} Fresh aggregated statistics
   */
  recalculateStats() {
    this._aggregatedStats = null;
    return this.getAggregatedStats();
  }

  /**
   * Private method to calculate aggregated statistics
   * @returns {Object} Calculated aggregated statistics
   */
  _calculateAggregatedStats() {
    const stats = {
      totalTrails: 0,
      availableTrails: 0,
      unavailableTrails: 0,
      calculableTrails: 0,
      trailsWithErrors: 0,
      totalEventTime: 0,
      avgEventTime: 0
    };

    for (const [, trailStats] of this.trails) {
      if (!trailStats) continue;

      stats.totalTrails++;

      // Use switch statement for better performance and readability
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

      stats.totalEventTime += trailStats.event_time || 0;
    }

    // Calculate average event time
    if (stats.availableTrails > 0) {
      stats.avgEventTime = Math.round(stats.totalEventTime / stats.availableTrails);
    }

    return stats;
  }

  /**
   * Get trails by status
   * @param {string} status - Status to filter by
   * @returns {Array} Array of trail keys with the specified status
   */
  getTrailsByStatus(status) {
    const result = [];
    for (const [trailKey, trailStats] of this.trails) {
      if (trailStats && trailStats.availableStatus === status) {
        result.push(trailKey);
      }
    }
    return result;
  }

  /**
   * Get trails with errors
   * @returns {Array} Array of trail keys that have errors
   */
  getTrailsWithErrors() {
    const result = [];
    for (const [trailKey, trailStats] of this.trails) {
      if (trailStats && trailStats.has_error) {
        result.push(trailKey);
      }
    }
    return result;
  }

  /**
   * Get summary information
   * @returns {Object} Summary of trail statistics
   */
  getSummary() {
    const stats = this.getAggregatedStats();
    const totalTrails = stats.totalTrails;

    return {
      total: totalTrails,
      available: stats.availableTrails,
      unavailable: stats.unavailableTrails,
      calculable: stats.calculableTrails,
      withErrors: stats.trailsWithErrors,
      availabilityRate: totalTrails > 0 ? Math.round((stats.availableTrails / totalTrails) * 100) : 0,
      errorRate: totalTrails > 0 ? Math.round((stats.trailsWithErrors / totalTrails) * 100) : 0,
      avgEventTime: stats.avgEventTime
    };
  }

  /**
   * Check if aggregator has any trails
   * @returns {boolean} True if has trails
   */
  hasTrails() {
    return this.trails.size > 0;
  }

  /**
   * Get number of trails
   * @returns {number} Number of trails
   */
  getTrailCount() {
    return this.trails.size;
  }
}
