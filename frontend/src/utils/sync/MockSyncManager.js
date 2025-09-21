/**
 * MockSyncManager - Test implementation of ISyncManager
 * Used for unit testing and development without backend dependencies
 */
import { ISyncManager } from './ISyncManager.js';
import { logger } from '../common/logger';

export class MockSyncManager extends ISyncManager {
  constructor(options = {}) {
    super();
    this.options = {
      simulateDelay: true,
      delayMs: 1000,
      failLogin: false,
      failSync: false,
      ...options
    };

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
    this.syncInterval = null;
  }

  async getStatus() {
    if (this.options.simulateDelay) {
      await this._delay(100);
    }
    return { ...this.status };
  }

  async login(email, password) {
    if (this.options.simulateDelay) {
      await this._delay(this.options.delayMs);
    }

    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    if (this.options.failLogin) {
      return { success: false, message: 'Mock login failure' };
    }

    this.status.isLoggedIn = true;
    this._notifyListeners('statusChange', this.status);

    logger.info('Mock login successful');
    return { success: true, data: { user: 'mock@example.com' } };
  }

  async startSync() {
    if (!this.status.isLoggedIn) {
      return { success: false, message: 'Must be logged in to sync' };
    }

    if (this.status.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    if (this.options.failSync) {
      return { success: false, message: 'Mock sync failure' };
    }

    this.status.isSyncing = true;
    this.status.progress = {
      current: 0,
      total: 10,
      percentage: 0,
      isCompleted: false,
      isCancelled: false
    };

    this._notifyListeners('statusChange', this.status);
    this._simulateProgress();

    logger.info('Mock sync started');
    return { success: true };
  }

  async cancelSync() {
    if (!this.status.isSyncing) {
      return { success: false, message: 'No sync in progress' };
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.status.isSyncing = false;
    this.status.progress.isCancelled = true;
    this._notifyListeners('statusChange', this.status);

    logger.info('Mock sync cancelled');
    return { success: true };
  }

  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  removeEventListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  async dispose() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.listeners.clear();
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

    logger.info('MockSyncManager disposed');
  }

  // Private helper methods
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in mock event listener for ${event}:`, error);
        }
      });
    }
  }

  _simulateProgress() {
    let current = 0;
    const total = this.status.progress.total;

    this.syncInterval = setInterval(() => {
      if (!this.status.isSyncing) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
        return;
      }

      current++;
      this.status.progress.current = current;
      this.status.progress.percentage = Math.round((current / total) * 100);

      this._notifyListeners('progress', this.status.progress);

      if (current >= total) {
        this.status.isSyncing = false;
        this.status.progress.isCompleted = true;
        this._notifyListeners('complete', this.status);
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
    }, 500);
  }
}

export default MockSyncManager;
