/**
 * Example demonstrating the usage of OOP classes for better code organization
 */
/* eslint-disable no-console, no-unused-vars */
import { TrailStats, StatsAggregator, SyncManager } from '../utils';

// === Trail Statistics Example ===

/**
 * Example of using TrailStats class
 */
export const trailStatsExample = () => {
  // Sample trail data
  const sampleRecords = [
    { mark: 'start', timestamp: 1000 },
    { mark: 'move', timestamp: 1500 },
    { mark: 'target', timestamp: 2000 }
  ];

  // Create TrailStats instance
  const trailStats = new TrailStats(sampleRecords);

  // Get calculated statistics
  const stats = trailStats.stats;
  console.log('Trail Statistics:', stats);

  // Check specific conditions
  console.log('Is Available:', trailStats.isAvailable());
  console.log('Has Errors:', trailStats.hasErrors());
  console.log('Status:', trailStats.getStatusDescription());

  // Update records and recalculate
  const newRecords = [...sampleRecords, { mark: 'error', timestamp: 1750 }];
  trailStats.updateRecords(newRecords);
  console.log('Updated Stats:', trailStats.stats);
};

// === Stats Aggregation Example ===

/**
 * Example of using StatsAggregator class
 */
export const statsAggregationExample = () => {
  // Create aggregator
  const aggregator = new StatsAggregator();

  // Add multiple trails
  aggregator.addTrail('trail1', {
    availableStatus: 'available',
    has_error: false,
    event_time: 1000
  });

  aggregator.addTrail('trail2', {
    availableStatus: 'unavailable',
    has_error: true,
    event_time: 0
  });

  aggregator.addTrail('trail3', {
    availableStatus: 'calculable',
    has_error: false,
    event_time: 1500
  });

  // Get aggregated statistics
  const aggregatedStats = aggregator.getAggregatedStats();
  console.log('Aggregated Stats:', aggregatedStats);

  // Get summary information
  const summary = aggregator.getSummary();
  console.log('Summary:', summary);

  // Filter trails by status
  const availableTrails = aggregator.getTrailsByStatus('available');
  console.log('Available Trails:', availableTrails);

  const trailsWithErrors = aggregator.getTrailsWithErrors();
  console.log('Trails with Errors:', trailsWithErrors);
};

// === Sync Management Example ===

/**
 * Example of using SyncManager class
 */
export const syncManagerExample = async () => {
  // Create sync manager
  const syncManager = new SyncManager();

  // Add event listeners
  const unsubscribeLogin = syncManager.addEventListener('login_success', (data) => {
    console.log('Login successful:', data);
  });

  const unsubscribeProgress = syncManager.addEventListener('progress_updated', (progress) => {
    console.log('Sync progress:', progress);
  });

  const unsubscribeComplete = syncManager.addEventListener('sync_completed', (status) => {
    console.log('Sync completed:', status);
  });

  try {
    // Check current status
    const status = await syncManager.getStatus();
    console.log('Current Status:', status);

    // Perform login (mock credentials)
    const loginResult = await syncManager.login('user@example.com', 'password');
    console.log('Login Result:', loginResult);

    if (loginResult.success) {
      // Start sync
      await syncManager.startSync();

      // Simulate progress updates
      syncManager.updateProgress({ current: 10, total: 100 });
      syncManager.updateProgress({ current: 50, total: 100 });
      syncManager.updateProgress({ current: 100, total: 100 });

      // Mark as completed
      syncManager.completeSync();
    }

    // Get formatted progress
    const formattedProgress = syncManager.getFormattedProgress();
    console.log('Formatted Progress:', formattedProgress);

  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    // Clean up listeners
    unsubscribeLogin();
    unsubscribeProgress();
    unsubscribeComplete();
  }
};

// === Comparison: Functional vs OOP Approach ===

/**
 * Demonstrates the difference between functional and OOP approaches
 */
export const comparisonExample = () => {
  console.log('=== Functional Approach ===');

  // Functional approach - multiple function calls, manual state management
  const records = [{ mark: 'start', timestamp: 1000 }, { mark: 'target', timestamp: 2000 }];

  // Need to call function each time, no caching
  const stats1 = calculateSingleTrailStats(records);
  const stats2 = calculateSingleTrailStats(records); // Recalculated every time

  console.log('Functional stats:', stats1);

  console.log('=== OOP Approach ===');

  // OOP approach - encapsulated state, cached calculations
  const trailStats = new TrailStats(records);

  // First call calculates and caches
  const oopStats1 = trailStats.stats;
  // Second call returns cached result
  const oopStats2 = trailStats.stats;

  console.log('OOP stats:', oopStats1);
  console.log('Same instance?', oopStats1 === oopStats2); // true - cached

  // Additional OOP benefits
  console.log('Readable methods:', {
    isAvailable: trailStats.isAvailable(),
    hasErrors: trailStats.hasErrors(),
    statusDescription: trailStats.getStatusDescription()
  });
};

// Note: This is an example file - not used in production code
// It demonstrates the benefits of the OOP approach:
// 1. Encapsulation - Data and methods are grouped together
// 2. Caching - Calculations are cached and only recalculated when needed
// 3. Readability - Methods have descriptive names and clear purposes
// 4. Maintainability - Easy to extend functionality
// 5. Event handling - Built-in event system for state changes
