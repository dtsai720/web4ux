import { LoginAndSync, StartSync, CancelSync, GetSyncStatus } from '../../../wailsjs/go/pkg/App';

/**
 * Checks the current synchronization status
 * @returns {Promise<Object>} The sync status
 */
export const checkSyncStatus = async () => {
  try {
    const status = await GetSyncStatus();
    return status;
  } catch (error) {
    console.error('Failed to get sync status:', error);
    throw error;
  }
};

/**
 * Handles user login and initiates sync
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response
 */
export const handleLogin = async (email, password) => {
  if (!email || !password) {
    return { success: false, message: 'Email and password are required' };
  }

  try {
    const response = await LoginAndSync(email, password);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      message: 'Login failed. Please check your credentials.'
    };
  }
};

/**
 * Starts the synchronization process
 * @returns {Promise<void>}
 */
export const handleStartSync = async () => {
  try {
    await StartSync();
    return { success: true };
  } catch (error) {
    console.error("Failed to start sync:", error);
    throw error;
  }
};

/**
 * Cancels the ongoing synchronization process
 * @returns {Promise<void>}
 */
export const handleCancelSync = async () => {
  try {
    await CancelSync();
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel sync:", error);
    throw error;
  }
};

/**
 * Creates initial sync progress state
 * @returns {Object} Initial sync progress state
 */
export const getInitialSyncProgress = () => ({
  currentProject: '',
  currentIndex: 0,
  progress: 0,
  totalProjects: 0,
  isCompleted: false,
  isCancelled: false
});

/**
 * Formats sync data for display
 * @param {number} totalRecords - Total number of records synced
 * @returns {Object} Formatted sync data
 */
export const formatSyncData = (totalRecords) => ({
  totalRecords,
  lastSync: new Date().toISOString()
});
