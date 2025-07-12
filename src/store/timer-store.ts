import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { TimerState } from "../types/timer";
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
  const store = useTimerStore.getState();

  // Initialize predefined tags
  store.initializePredefinedTags();

  // Recalculate stats on initialization
  store.recalculateStats();

  // Set up subscriptions for automatic updates
  setupStoreSubscriptions();
};

/**
 * Set up store subscriptions for automatic updates
 */
function setupStoreSubscriptions() {
  // Automatically recalculate stats when history changes
  useTimerStore.subscribe(
    (state) => state.history,
    (history, prevHistory) => {
      if (history !== prevHistory) {
        useTimerStore.getState().recalculateStats();
      }
    }
  );

  // Check for achievements when stats change
  useTimerStore.subscribe(
    (state) => state.stats,
    (stats, prevStats) => {
      if (stats !== prevStats) {
        // This would trigger achievement checking in a real implementation
        // For now, we'll leave this as a placeholder
        console.log("Stats updated, checking achievements...");
      }
    }
  );

  // Auto-save tag configurations when they change
  useTimerStore.subscribe(
    (state) => state.customTagConfigs,
    (configs, prevConfigs) => {
      if (configs !== prevConfigs) {
        // Tag configurations are automatically persisted via the persistence middleware
        console.log("Tag configurations updated");
      }
    }
  );
}

/**
 * Store utilities and helpers
 */
export const timerStoreUtils = {
  /**
   * Reset the entire store to default state
   */
  resetStore: () => {
    const store = useTimerStore.getState();

    // Reset all slices
    store.resetConfig();
    store.resetStats();
    store.resetRewardSystem();
    store.clearAllTags();
    store.clearAllMoodEntries();

    // Clear history and current session
    useTimerStore.setState({
      history: [],
      currentSession: null,
      state: TimerState.IDLE,
      timeRemaining: 0,
      sessionCount: 0,
      currentFocusPeriodId: null,
      currentFocusPeriodSessionCount: 0,
      targetRounds: 1,
    });

    // Reinitialize
    initializeTimerStore();
  },

  /**
   * Get store state snapshot for debugging
   */
  getStateSnapshot: () => {
    const state = useTimerStore.getState();
    return {
      session: {
        currentSession: state.currentSession,
        state: state.state,
        timeRemaining: state.timeRemaining,
        sessionCount: state.sessionCount,
        historyCount: state.history.length,
      },
      config: state.config,
      stats: state.stats,
      tags: {
        customTags: state.customTags,
        customTagConfigs: state.customTagConfigs,
      },
      mood: {
        entriesCount: state.moodEntries.length,
        isPromptVisible: state.isPostSessionMoodPromptVisible,
      },
      achievements: {
        points: state.rewardSystem.points,
        level: state.rewardSystem.level,
        achievementsCount: state.rewardSystem.achievements.length,
      },
    };
  },

  /**
   * Export store data for backup
   */
  exportStoreData: () => {
    const state = useTimerStore.getState();
    return JSON.stringify(
      {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
          history: state.history,
          config: state.config,
          stats: state.stats,
          customTags: state.customTags,
          customTagConfigs: state.customTagConfigs,
          moodEntries: state.moodEntries,
          rewardSystem: state.rewardSystem,
        },
      },
      null,
      2
    );
  },

  /**
   * Import store data from backup
   */
  importStoreData: (jsonData: string): boolean => {
    try {
      const backup = JSON.parse(jsonData);

      if (!backup.data || backup.version !== 1) {
        throw new Error("Invalid backup format");
      }

      const { data } = backup;

      // Import data
      useTimerStore.setState({
        history: data.history || [],
        config: { ...useTimerStore.getState().config, ...data.config },
        stats: data.stats || useTimerStore.getState().stats,
        customTags: data.customTags || [],
        customTagConfigs: data.customTagConfigs || [],
        moodEntries: data.moodEntries || [],
        rewardSystem: {
          ...useTimerStore.getState().rewardSystem,
          ...data.rewardSystem,
        },
      });

      // Recalculate stats after import
      useTimerStore.getState().recalculateStats();

      return true;
    } catch (error) {
      console.error("Failed to import store data:", error);
      return false;
    }
  },
};

// Initialize the store when the module is loaded
initializeTimerStore();
