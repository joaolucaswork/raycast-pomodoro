import { StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { PomodoroStore, TimerState } from "../../types/timer";
import { zustandStorage } from "../../utils/zustand-storage";

/**
 * Persistence middleware configuration for the timer store
 */
export const persistenceConfig: PersistOptions<PomodoroStore> = {
  name: "pomodoro-timer-storage",
  storage: zustandStorage,
  partialize: (state) => ({
    ...state,
    // Don't persist runtime state
    currentSession: null,
    state: TimerState.IDLE,
    timeRemaining: 0,
    // Don't persist mood prompt state
    isPostSessionMoodPromptVisible: false,
    lastCompletedSession: null,
    // Don't persist current break activity
    currentBreakActivity: undefined,
  }),
  // Optional: Add version for migration support
  version: 1,
  // Optional: Add migration logic for future versions
  migrate: (persistedState: any, version: number) => {
    // Handle migrations between versions here
    if (version === 0) {
      // Migration from version 0 to 1
      // Add any necessary data transformations
    }
    return persistedState as PomodoroStore;
  },
};

/**
 * Create persistence middleware wrapper
 */
export const withPersistence = <T extends PomodoroStore>(
  stateCreator: StateCreator<T, [], [], T>
) => persist(stateCreator, persistenceConfig as any);

/**
 * Utility functions for persistence management
 */
export const persistenceUtils = {
  /**
   * Clear all persisted data
   */
  clearPersistedData: () => {
    try {
      zustandStorage.removeItem(persistenceConfig.name);
    } catch (error) {
      console.error("Failed to clear persisted data:", error);
    }
  },

  /**
   * Get persisted data size (approximate)
   */
  getPersistedDataSize: (): number => {
    try {
      const data = zustandStorage.getItem(persistenceConfig.name);
      return data ? JSON.stringify(data).length : 0;
    } catch (error) {
      console.error("Failed to get persisted data size:", error);
      return 0;
    }
  },

  /**
   * Check if persisted data exists
   */
  hasPersistedData: (): boolean => {
    try {
      const data = zustandStorage.getItem(persistenceConfig.name);
      return data !== null;
    } catch (error) {
      console.error("Failed to check persisted data:", error);
      return false;
    }
  },

  /**
   * Export persisted data for backup
   */
  exportPersistedData: (): string | null => {
    try {
      const data = zustandStorage.getItem(persistenceConfig.name);
      return data ? JSON.stringify(data, null, 2) : null;
    } catch (error) {
      console.error("Failed to export persisted data:", error);
      return null;
    }
  },

  /**
   * Import persisted data from backup
   */
  importPersistedData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      zustandStorage.setItem(persistenceConfig.name, data);
      return true;
    } catch (error) {
      console.error("Failed to import persisted data:", error);
      return false;
    }
  },
};
