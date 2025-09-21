/**
 * ISyncManager Interface
 * Defines the contract for synchronization management implementations
 *
 * This interface follows SOLID principles:
 * - Single Responsibility: Focus on sync operations only
 * - Interface Segregation: Minimal, focused interface
 * - Dependency Inversion: Abstracts sync implementation details
 */

/**
 * Sync Status structure
 * @typedef {Object} SyncStatus
 * @property {boolean} isSyncing - Whether sync is currently active
 * @property {boolean} isLoggedIn - Whether user is logged in
 * @property {Object} progress - Sync progress information
 * @property {number} progress.current - Current progress count
 * @property {number} progress.total - Total items to process
 * @property {number} progress.percentage - Progress percentage (0-100)
 * @property {boolean} progress.isCompleted - Whether sync is completed
 * @property {boolean} progress.isCancelled - Whether sync was cancelled
 */

/**
 * Login result structure
 * @typedef {Object} LoginResult
 * @property {boolean} success - Whether login was successful
 * @property {string} [message] - Error message if login failed
 * @property {Object} [data] - Additional data if login succeeded
 */

/**
 * Sync result structure
 * @typedef {Object} SyncResult
 * @property {boolean} success - Whether operation was successful
 * @property {string} [message] - Status or error message
 * @property {Object} [data] - Additional result data
 */

/**
 * ISyncManager Interface
 *
 * Abstract interface for sync management operations.
 * Implementations must provide all methods defined in this interface.
 */
export class ISyncManager {
  /**
   * Get current synchronization status
   * @returns {Promise<SyncStatus>} Current sync status
   * @throws {Error} If status retrieval fails
   */
  async getStatus() {
    throw new Error('ISyncManager.getStatus() must be implemented by subclass');
  }

  /**
   * Perform user login and prepare for synchronization
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<LoginResult>} Login operation result
   * @throws {Error} If login operation fails
   */
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  async login(_email, _password) {
    throw new Error('ISyncManager.login() must be implemented by subclass');
  }

  /**
   * Start synchronization process
   * Prerequisites: User must be logged in
   * @returns {Promise<SyncResult>} Sync operation result
   * @throws {Error} If sync cannot be started
   */
  async startSync() {
    throw new Error('ISyncManager.startSync() must be implemented by subclass');
  }

  /**
   * Cancel ongoing synchronization
   * @returns {Promise<SyncResult>} Cancellation result
   * @throws {Error} If cancellation fails
   */
  async cancelSync() {
    throw new Error('ISyncManager.cancelSync() must be implemented by subclass');
  }

  /**
   * Add event listener for sync events
   * @param {string} event - Event name ('statusChange', 'progress', 'complete', 'error')
   * @param {Function} callback - Event handler function
   * @throws {Error} If event registration fails
   */
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  addEventListener(_event, _callback) {
    throw new Error('ISyncManager.addEventListener() must be implemented by subclass');
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   * @throws {Error} If event removal fails
   */
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  removeEventListener(_event, _callback) {
    throw new Error('ISyncManager.removeEventListener() must be implemented by subclass');
  }

  /**
   * Cleanup resources and prepare for destruction
   * @returns {Promise<void>}
   */
  async dispose() {
    throw new Error('ISyncManager.dispose() must be implemented by subclass');
  }
}

/**
 * Factory function to create sync manager instances
 * This enables dependency injection and makes testing easier
 *
 * @param {string} implementation - Implementation type ('default', 'mock', etc.)
 * @param {Object} [options] - Configuration options
 * @returns {ISyncManager} Sync manager instance
 */
export function createSyncManager(implementation = 'default', options = {}) {
  switch (implementation) {
    case 'default':
      // Dynamic import to avoid circular dependencies
      return import('./SyncManager.js').then(({ SyncManager }) => new SyncManager(options));
    case 'mock':
      return import('./MockSyncManager.js').then(({ MockSyncManager }) => new MockSyncManager(options));
    default:
      throw new Error(`Unknown sync manager implementation: ${implementation}`);
  }
}

export default ISyncManager;
