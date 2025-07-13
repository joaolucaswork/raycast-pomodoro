import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  SessionSlice,
  createSessionSlice,
  ConfigSlice,
  createConfigSlice,
  StatsSlice,
  createStatsSlice,
  MoodSlice,
  createMoodSlice,
  AchievementSlice,
  createAchievementSlice,
  TagSlice,
  createTagSlice,
} from "./slices";
import { withPersistence } from "./middleware";
import { storeInitialization } from "./store-initialization";
import { storeUtilities } from "./store-utilities";

/**
 * Combined store interface that includes all slices
 */
export interface CombinedPomodoroStore
  extends SessionSlice,
    ConfigSlice,
    StatsSlice,
    MoodSlice,
    AchievementSlice,
    TagSlice {}

/**
 * Create the main timer store by combining all slices
 */
export const useTimerStore = create<CombinedPomodoroStore>()(
  subscribeWithSelector(
    withPersistence((...args) => ({
      // Combine all slices
      ...createSessionSlice(...args),
      ...createConfigSlice(...args),
      ...createStatsSlice(...args),
      ...createMoodSlice(...args),
      ...createAchievementSlice(...args),
      ...createTagSlice(...args),
    }))
  )
);

/**
 * Initialize the store with default values and setup subscriptions
 */
export const initializeTimerStore = () => {
  storeInitialization.initializeStore();
};

/**
 * Store utilities and helpers
 */
export const timerStoreUtils = {
  /**
   * Reset the entire store to default state
   */
  resetStore: () => storeUtilities.resetStore(),

  /**
   * Get store state snapshot for debugging
   */
  getStateSnapshot: () => storeUtilities.getStateSnapshot(),

  /**
   * Export store data for backup
   */
  exportStoreData: () => storeUtilities.exportStoreData(),

  /**
   * Import store data from backup
   */
  importStoreData: (jsonData: string) =>
    storeUtilities.importStoreData(jsonData),

  /**
   * Validate store data integrity
   */
  validateStoreData: () => storeUtilities.validateStoreData(),

  /**
   * Get store memory usage estimate
   */
  getMemoryUsage: () => storeUtilities.getMemoryUsage(),

  /**
   * Clean up old data based on retention policies
   */
  cleanupOldData: (options?: any) => storeUtilities.cleanupOldData(options),
};

// Initialize the store when the module is loaded
initializeTimerStore();
