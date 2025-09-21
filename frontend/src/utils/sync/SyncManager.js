/**
 * SyncManager class for managing synchronization operations
 * Implements ISyncManager interface following SOLID principles
 */
import { LoginAndSync, StartSync, CancelSync, GetSyncStatus } from '../../../wailsjs/go/pkg/App';
import { handleError } from '../common';
import { logger } from '../common/logger';
import { ISyncManager } from './ISyncManager.js';

export class SyncManager extends ISyncManager {
  constructor() {
    super();
    this.status = {
      isSyncing: false,
      isLoggedIn: false,
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        isCompleted: false,
        isCancelled: false
      }
    };
    this.listeners = new Map();
  }

  /**
   * Get current sync status from backend
   * @returns {Promise<Object>} Current sync status
   */
  async getStatus() {
    try {
      const status = await GetSyncStatus();
      this._updateStatus(status);
      return this.status;
    } catch (error) {
      handleError(error, 'Failed to get sync status');
      throw error;
    }
  }

  /**
   * Perform login and initiate sync
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    if (!this._validateCredentials(email, password)) {
      return { success: false, message: 'Email and password are required' };
    }

    try {
      const response = await LoginAndSync(email, password);

      if (response.success) {
        this.status.isLoggedIn = true;
        this._notifyListeners('login_success', response);
      } else {
        this._notifyListeners('login_failed', response);
      }

      return response;
    } catch (error) {
      handleError(error, "Login failed");
      const errorResponse = {
        success: false,
        message: 'Login failed. Please check your credentials.'
      };
      this._notifyListeners('login_failed', errorResponse);
      return errorResponse;
    }
  }

  /**
   * Start synchronization process
   * @returns {Promise<Object>} Start sync response
   */
  async startSync() {
    try {
      this.status.isSyncing = true;
      this.status.progress = {
        current: 0,
        total: 0,
        percentage: 0,
        isCompleted: false,
        isCancelled: false
      };

      await StartSync();
      this._notifyListeners('sync_started', this.status);

      return { success: true };
    } catch (error) {
      this.status.isSyncing = false;
      handleError(error, "Failed to start sync");
      this._notifyListeners('sync_failed', error);
      throw error;
    }
  }

  /**
   * Cancel ongoing synchronization
   * @returns {Promise<Object>} Cancel sync response
   */
  async cancelSync() {
    try {
      await CancelSync();
      this.status.isSyncing = false;
      this.status.progress.isCancelled = true;
      this._notifyListeners('sync_cancelled', this.status);

      return { success: true };
    } catch (error) {
      handleError(error, "Failed to cancel sync");
      this._notifyListeners('sync_cancel_failed', error);
      throw error;
    }
  }

  /**
   * Reset sync state
   */
  resetSync() {
    this.status.isSyncing = false;
    this.status.progress = {
      current: 0,
      total: 0,
      percentage: 0,
      isCompleted: false,
      isCancelled: false
    };
    this._notifyListeners('sync_reset', this.status);
  }

  /**
   * Update sync progress
   * @param {Object} progressData - Progress information
   */
  updateProgress(progressData) {
    this.status.progress = { ...this.status.progress, ...progressData };

    // Calculate percentage if not provided
    if (this.status.progress.total > 0 && !progressData.percentage) {
      this.status.progress.percentage = Math.round(
        (this.status.progress.current / this.status.progress.total) * 100
      );
    }

    this._notifyListeners('progress_updated', this.status.progress);
  }

  /**
   * Mark sync as completed
   */
  completeSync() {
    this.status.isSyncing = false;
    this.status.progress.isCompleted = true;
    this.status.progress.percentage = 100;
    this._notifyListeners('sync_completed', this.status);
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.listeners.clear();
  }

  /**
   * Get current sync progress as formatted data
   * @returns {Object} Formatted sync progress
   */
  getFormattedProgress() {
    const { current, total, percentage, isCompleted, isCancelled } = this.status.progress;

    return {
      current,
      total,
      percentage,
      isCompleted,
      isCancelled,
      statusText: this._getStatusText(),
      progressText: total > 0 ? `${current}/${total}` : '0/0'
    };
  }

  /**
   * Check if currently syncing
   * @returns {boolean} True if syncing
   */
  isSyncing() {
    return this.status.isSyncing;
  }

  /**
   * Check if logged in
   * @returns {boolean} True if logged in
   */
  isLoggedIn() {
    return this.status.isLoggedIn;
  }

  /**
   * Private method to validate credentials
   * @param {string} email - Email to validate
   * @param {string} password - Password to validate
   * @returns {boolean} True if credentials are valid
   */
  _validateCredentials(email, password) {
    return !!(email && password && email.trim() && password.trim());
  }

  /**
   * Private method to update internal status
   * @param {Object} newStatus - New status data
   */
  _updateStatus(newStatus) {
    this.status = { ...this.status, ...newStatus };
  }

  /**
   * Private method to notify listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  _notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Private method to get status text
   * @returns {string} Status description
   */
  _getStatusText() {
    if (this.status.progress.isCompleted) return 'Completed';
    if (this.status.progress.isCancelled) return 'Cancelled';
    if (this.status.isSyncing) return 'Syncing...';
    return 'Ready';
  }

  /**
   * Cleanup resources and prepare for destruction
   * Implementation of ISyncManager.dispose()
   * @returns {Promise<void>}
   */
  async dispose() {
    try {
      // Cancel any ongoing sync operation
      if (this.status.isSyncing) {
        await this.cancelSync();
      }

      // Remove all event listeners to prevent memory leaks
      this.removeAllListeners();

      // Reset status to initial state
      this.status = {
        isSyncing: false,
        isLoggedIn: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          isCompleted: false,
          isCancelled: false
        }
      };

      logger.info('SyncManager disposed successfully');
    } catch (error) {
      logger.error('Error during SyncManager disposal:', error);
      throw error;
    }
  }
}
