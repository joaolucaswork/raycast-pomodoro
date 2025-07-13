import { TimerState } from "../types/timer";
import { useTimerStore } from "./timer-store";

/**
 * Store utilities and helpers for the timer store.
 * 
 * Provides:
 * - Store reset functionality
 * - State snapshots for debugging
 * - Data export/import for backup
 * - Store validation utilities
 */
export class StoreUtilities {
  private static instance: StoreUtilities;

  private constructor() {}

  public static getInstance(): StoreUtilities {
    if (!StoreUtilities.instance) {
      StoreUtilities.instance = new StoreUtilities();
    }
    return StoreUtilities.instance;
  }

  /**
   * Reset the entire store to default state
   */
  public resetStore(): void {
    const store = useTimerStore.getState();

    // Reset all slices
    store.refreshConfigFromPreferences(); // Refresh config instead of reset
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

    console.log("Store reset completed");
  }

  /**
   * Get store state snapshot for debugging
   */
  public getStateSnapshot() {
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
  }

  /**
   * Export store data for backup
   */
  public exportStoreData(): string {
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
  }

  /**
   * Import store data from backup
   */
  public importStoreData(jsonData: string): boolean {
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

      console.log("Store data imported successfully");
      return true;
    } catch (error) {
      console.error("Failed to import store data:", error);
      return false;
    }
  }

  /**
   * Validate store data integrity
   */
  public validateStoreData(): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const state = useTimerStore.getState();
    const issues: string[] = [];
    const warnings: string[] = [];

    // Validate history
    if (!Array.isArray(state.history)) {
      issues.push("History is not an array");
    } else {
      state.history.forEach((session, index) => {
        if (!session.id) {
          issues.push(`Session ${index} missing ID`);
        }
        if (!session.startTime) {
          issues.push(`Session ${index} missing start time`);
        }
        if (session.duration <= 0) {
          warnings.push(`Session ${index} has invalid duration`);
        }
      });
    }

    // Validate config
    if (!state.config) {
      issues.push("Config is missing");
    } else {
      if (state.config.workDuration <= 0) {
        issues.push("Work duration must be positive");
      }
      if (state.config.shortBreakDuration <= 0) {
        issues.push("Short break duration must be positive");
      }
      if (state.config.longBreakDuration <= 0) {
        issues.push("Long break duration must be positive");
      }
    }

    // Validate stats
    if (!state.stats) {
      issues.push("Stats are missing");
    } else {
      if (state.stats.totalSessions < 0) {
        issues.push("Total sessions cannot be negative");
      }
      if (state.stats.completedSessions > state.stats.totalSessions) {
        warnings.push("Completed sessions exceed total sessions");
      }
    }

    // Validate mood entries
    if (!Array.isArray(state.moodEntries)) {
      issues.push("Mood entries is not an array");
    }

    // Validate custom tags
    if (!Array.isArray(state.customTags)) {
      issues.push("Custom tags is not an array");
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Get store memory usage estimate
   */
  public getMemoryUsage(): {
    totalSize: number;
    breakdown: Record<string, number>;
  } {
    const state = useTimerStore.getState();
    const breakdown: Record<string, number> = {};

    // Estimate sizes (rough approximation)
    breakdown.history = JSON.stringify(state.history).length;
    breakdown.config = JSON.stringify(state.config).length;
    breakdown.stats = JSON.stringify(state.stats).length;
    breakdown.moodEntries = JSON.stringify(state.moodEntries).length;
    breakdown.customTags = JSON.stringify(state.customTags).length;
    breakdown.customTagConfigs = JSON.stringify(state.customTagConfigs).length;
    breakdown.rewardSystem = JSON.stringify(state.rewardSystem).length;

    const totalSize = Object.values(breakdown).reduce((sum, size) => sum + size, 0);

    return {
      totalSize,
      breakdown,
    };
  }

  /**
   * Clean up old data based on retention policies
   */
  public cleanupOldData(options: {
    maxHistoryDays?: number;
    maxMoodEntries?: number;
    removeIncompleteSession?: boolean;
  } = {}): {
    removedSessions: number;
    removedMoodEntries: number;
  } {
    const state = useTimerStore.getState();
    const {
      maxHistoryDays = 365,
      maxMoodEntries = 1000,
      removeIncompleteSession = false,
    } = options;

    let removedSessions = 0;
    let removedMoodEntries = 0;

    // Clean up old history
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxHistoryDays);

    const filteredHistory = state.history.filter((session) => {
      const shouldRemove =
        new Date(session.startTime) < cutoffDate ||
        (removeIncompleteSession && !session.completed);
      
      if (shouldRemove) {
        removedSessions++;
      }
      
      return !shouldRemove;
    });

    // Clean up old mood entries
    const sortedMoodEntries = [...state.moodEntries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const filteredMoodEntries = sortedMoodEntries.slice(0, maxMoodEntries);
    removedMoodEntries = state.moodEntries.length - filteredMoodEntries.length;

    // Update store
    useTimerStore.setState({
      history: filteredHistory,
      moodEntries: filteredMoodEntries,
    });

    // Recalculate stats after cleanup
    state.recalculateStats();

    console.log(`Cleanup completed: ${removedSessions} sessions, ${removedMoodEntries} mood entries removed`);

    return {
      removedSessions,
      removedMoodEntries,
    };
  }
}

export const storeUtilities = StoreUtilities.getInstance();
