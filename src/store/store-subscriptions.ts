import { useTimerStore } from "./timer-store";

/**
 * Store subscription management for automatic updates and side effects.
 *
 * Handles:
 * - Automatic stats recalculation
 * - Achievement checking
 * - Tag configuration persistence
 * - Mood tracking updates
 * - Session state transitions
 */
export class StoreSubscriptions {
  private static instance: StoreSubscriptions;
  private unsubscribeFunctions: (() => void)[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): StoreSubscriptions {
    if (!StoreSubscriptions.instance) {
      StoreSubscriptions.instance = new StoreSubscriptions();
    }
    return StoreSubscriptions.instance;
  }

  /**
   * Set up all store subscriptions for automatic updates
   */
  public setupSubscriptions(): void {
    if (this.isInitialized) {
      console.warn("Store subscriptions already initialized");
      return;
    }

    this.setupStatsSubscription();
    this.setupAchievementSubscription();
    this.setupBoxingAchievementSubscription();
    this.setupTagConfigSubscription();
    this.setupMoodTrackingSubscription();
    this.setupSessionStateSubscription();

    this.isInitialized = true;
    console.log("Store subscriptions initialized");
  }

  /**
   * Clean up all subscriptions
   */
  public cleanup(): void {
    this.unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeFunctions = [];
    this.isInitialized = false;
    console.log("Store subscriptions cleaned up");
  }

  /**
   * Automatically recalculate stats when history changes
   */
  private setupStatsSubscription(): void {
    const unsubscribe = useTimerStore.subscribe(
      (state) => state.history,
      (history, prevHistory) => {
        if (history !== prevHistory) {
          console.log("History changed, recalculating stats...");
          useTimerStore.getState().recalculateStats();
        }
      }
    );
    this.unsubscribeFunctions.push(unsubscribe);
  }

  /**
   * Check for achievements when stats change
   */
  private setupAchievementSubscription(): void {
    const unsubscribe = useTimerStore.subscribe(
      (state) => state.stats,
      (stats, prevStats) => {
        if (stats !== prevStats) {
          console.log("Stats updated, checking achievements...");
          this.checkForNewAchievements(stats, prevStats);
        }
      }
    );
    this.unsubscribeFunctions.push(unsubscribe);
  }

  /**
   * Update boxing progress when history changes (specifically for boxing achievements)
   */
  private setupBoxingAchievementSubscription(): void {
    const unsubscribe = useTimerStore.subscribe(
      (state) => state.history,
      (history, prevHistory) => {
        if (history !== prevHistory && history.length > prevHistory.length) {
          const state = useTimerStore.getState();
          if (state.config.enableRewardSystem) {
            console.log("History changed, updating boxing progress...");
            if (state.updateBoxingProgress) {
              // Use setTimeout to ensure the history update is fully processed
              setTimeout(() => {
                state.updateBoxingProgress();
              }, 100);
            }
          }
        }
      }
    );
    this.unsubscribeFunctions.push(unsubscribe);
  }

  /**
   * Auto-save tag configurations when they change
   */
  private setupTagConfigSubscription(): void {
    const unsubscribe = useTimerStore.subscribe(
      (state) => state.customTagConfigs,
      (configs, prevConfigs) => {
        if (configs !== prevConfigs) {
          console.log("Tag configurations updated");
          // Tag configurations are automatically persisted via the persistence middleware
          this.validateTagConfigurations(configs);
        }
      }
    );
    this.unsubscribeFunctions.push(unsubscribe);
  }

  /**
   * Handle mood tracking updates
   */
  private setupMoodTrackingSubscription(): void {
    const unsubscribe = useTimerStore.subscribe(
      (state) => state.moodEntries,
      (entries, prevEntries) => {
        if (entries !== prevEntries) {
          console.log("Mood entries updated");
          this.processMoodAnalytics(entries);
        }
      }
    );
    this.unsubscribeFunctions.push(unsubscribe);
  }

  /**
   * Handle session state transitions
   */
  private setupSessionStateSubscription(): void {
    const unsubscribe = useTimerStore.subscribe(
      (state) => ({
        timerState: state.state,
        currentSession: state.currentSession,
        timeRemaining: state.timeRemaining,
      }),
      (current, previous) => {
        if (current.timerState !== previous.timerState) {
          console.log(
            `Timer state changed: ${previous.timerState} -> ${current.timerState}`
          );
          this.handleStateTransition(current.timerState, previous.timerState);
        }

        if (current.currentSession !== previous.currentSession) {
          console.log("Current session changed");
          this.handleSessionChange(
            current.currentSession,
            previous.currentSession
          );
        }

        // Handle time remaining changes for warnings
        if (
          current.timeRemaining !== previous.timeRemaining &&
          current.timeRemaining > 0
        ) {
          this.handleTimeRemainingChange(
            current.timeRemaining,
            current.currentSession
          );
        }
      }
    );
    this.unsubscribeFunctions.push(unsubscribe);
  }

  /**
   * Check for new achievements based on stats changes
   */
  private checkForNewAchievements(newStats: any, prevStats: any): void {
    const state = useTimerStore.getState();

    if (!state.config.enableRewardSystem) {
      return;
    }

    // Check for session milestones
    if (newStats.completedSessions > prevStats.completedSessions) {
      const milestones = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
      const newMilestone = milestones.find(
        (milestone) =>
          newStats.completedSessions >= milestone &&
          prevStats.completedSessions < milestone
      );

      if (newMilestone) {
        state.unlockAchievement(`${newMilestone}-sessions-completed`);
      }
    }

    // Check for streak milestones
    if (newStats.streakCount > prevStats.streakCount) {
      const streakMilestones = [3, 7, 14, 30, 60, 100];
      const newStreakMilestone = streakMilestones.find(
        (milestone) =>
          newStats.streakCount >= milestone && prevStats.streakCount < milestone
      );

      if (newStreakMilestone) {
        state.unlockAchievement(`${newStreakMilestone}-day-streak`);
      }
    }

    // Check for time-based achievements
    const newHours = Math.floor(newStats.totalWorkTime / 3600);
    const prevHours = Math.floor(prevStats.totalWorkTime / 3600);

    if (newHours > prevHours) {
      const hourMilestones = [1, 10, 25, 50, 100, 250, 500, 1000];
      const newHourMilestone = hourMilestones.find(
        (milestone) => newHours >= milestone && prevHours < milestone
      );

      if (newHourMilestone) {
        state.unlockAchievement(`${newHourMilestone}-hours-focus`);
      }
    }
  }

  /**
   * Validate tag configurations
   */
  private validateTagConfigurations(configs: any[]): void {
    const duplicateNames = configs
      .map((config) => config.name)
      .filter((name, index, array) => array.indexOf(name) !== index);

    if (duplicateNames.length > 0) {
      console.warn("Duplicate tag names detected:", duplicateNames);
    }

    const invalidConfigs = configs.filter(
      (config) => !config.name || !config.color
    );

    if (invalidConfigs.length > 0) {
      console.warn("Invalid tag configurations detected:", invalidConfigs);
    }
  }

  /**
   * Process mood analytics when entries change
   */
  private processMoodAnalytics(entries: any[]): void {
    if (entries.length === 0) {
      return;
    }

    // Calculate recent mood trends
    const recentEntries = entries
      .filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    if (recentEntries.length >= 3) {
      const averageIntensity =
        recentEntries.reduce((sum, entry) => sum + entry.intensity, 0) /
        recentEntries.length;

      console.log(
        `Recent mood trend: ${averageIntensity.toFixed(1)}/5 average intensity`
      );

      // Trigger mood-based recommendations if needed
      if (averageIntensity < 2.5) {
        console.log("Low mood trend detected - consider break activities");
      }
    }
  }

  /**
   * Handle timer state transitions
   */
  private handleStateTransition(newState: string, prevState: string): void {
    // Log state transitions for debugging
    console.log(`State transition: ${prevState} -> ${newState}`);

    // Handle specific transitions
    if (newState === "running" && prevState === "idle") {
      console.log("Session started");
    } else if (newState === "completed" && prevState === "running") {
      console.log("Session completed");
    } else if (newState === "paused" && prevState === "running") {
      console.log("Session paused");
    }
  }

  /**
   * Handle session changes
   */
  private handleSessionChange(newSession: any, prevSession: any): void {
    if (newSession && !prevSession) {
      console.log("New session started:", newSession.type);
    } else if (!newSession && prevSession) {
      console.log("Session ended:", prevSession.type);
    }
  }

  /**
   * Handle time remaining changes for warnings
   */
  private handleTimeRemainingChange(
    timeRemaining: number,
    currentSession: any
  ): void {
    if (!currentSession) {
      return;
    }

    const state = useTimerStore.getState();
    if (!state.config.enableTransitionWarnings) {
      return;
    }

    // Check for warning intervals (5min, 2min, 1min)
    const warningIntervals = state.config.warningIntervals || [300, 120, 60];

    for (const interval of warningIntervals) {
      if (timeRemaining === interval) {
        console.log(`Transition warning: ${interval / 60} minutes remaining`);
        // The actual notification will be handled by the notification service
        break;
      }
    }
  }

  /**
   * Get subscription status
   */
  public getStatus(): {
    isInitialized: boolean;
    subscriptionCount: number;
  } {
    return {
      isInitialized: this.isInitialized,
      subscriptionCount: this.unsubscribeFunctions.length,
    };
  }
}

export const storeSubscriptions = StoreSubscriptions.getInstance();
