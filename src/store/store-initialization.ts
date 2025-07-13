import { useTimerStore } from "./timer-store";
import { storeSubscriptions } from "./store-subscriptions";
import { storeUtilities } from "./store-utilities";

/**
 * Store initialization service for setting up the timer store.
 * 
 * Handles:
 * - Initial store setup
 * - Configuration loading
 * - Subscription setup
 * - Data validation and migration
 */
export class StoreInitialization {
  private static instance: StoreInitialization;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): StoreInitialization {
    if (!StoreInitialization.instance) {
      StoreInitialization.instance = new StoreInitialization();
    }
    return StoreInitialization.instance;
  }

  /**
   * Initialize the store with default values and setup subscriptions
   */
  public initializeStore(): void {
    if (this.isInitialized) {
      console.warn("Store already initialized");
      return;
    }

    console.log("Initializing timer store...");

    try {
      // Validate existing store data
      this.validateAndMigrateData();

      // Initialize store components
      this.initializeStoreComponents();

      // Setup subscriptions
      storeSubscriptions.setupSubscriptions();

      this.isInitialized = true;
      console.log("Timer store initialization completed successfully");
    } catch (error) {
      console.error("Failed to initialize timer store:", error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Validate and migrate existing store data if needed
   */
  private validateAndMigrateData(): void {
    const validation = storeUtilities.validateStoreData();
    
    if (!validation.isValid) {
      console.warn("Store data validation failed:", validation.issues);
      
      // Attempt to fix critical issues
      this.fixCriticalIssues(validation.issues);
    }

    if (validation.warnings.length > 0) {
      console.warn("Store data warnings:", validation.warnings);
    }

    // Check if data migration is needed
    this.migrateDataIfNeeded();
  }

  /**
   * Initialize store components
   */
  private initializeStoreComponents(): void {
    const store = useTimerStore.getState();

    // Refresh config from native preferences
    console.log("Refreshing configuration from preferences...");
    store.refreshConfigFromPreferences();

    // Recalculate stats on initialization
    console.log("Recalculating statistics...");
    store.recalculateStats();

    // Initialize ADHD features if enabled
    if (store.config.enableRewardSystem) {
      console.log("Initializing reward system...");
      this.initializeRewardSystem();
    }

    // Initialize mood tracking
    console.log("Initializing mood tracking...");
    this.initializeMoodTracking();

    // Initialize tag system
    console.log("Initializing tag system...");
    this.initializeTagSystem();
  }

  /**
   * Fix critical issues in store data
   */
  private fixCriticalIssues(issues: string[]): void {
    const store = useTimerStore.getState();

    issues.forEach((issue) => {
      if (issue.includes("Config is missing")) {
        console.log("Fixing missing config...");
        store.refreshConfigFromPreferences();
      }

      if (issue.includes("Stats are missing")) {
        console.log("Fixing missing stats...");
        store.resetStats();
        store.recalculateStats();
      }

      if (issue.includes("not an array")) {
        console.log("Fixing invalid array data...");
        if (issue.includes("History")) {
          useTimerStore.setState({ history: [] });
        }
        if (issue.includes("Mood entries")) {
          useTimerStore.setState({ moodEntries: [] });
        }
        if (issue.includes("Custom tags")) {
          useTimerStore.setState({ customTags: [] });
        }
      }
    });
  }

  /**
   * Migrate data if needed for version compatibility
   */
  private migrateDataIfNeeded(): void {
    const state = useTimerStore.getState();
    
    // Check for legacy data structures and migrate
    let needsMigration = false;

    // Migrate legacy mood entries without context
    if (state.moodEntries.some((entry: any) => !entry.context)) {
      console.log("Migrating legacy mood entries...");
      const migratedEntries = state.moodEntries.map((entry: any) => ({
        ...entry,
        context: entry.context || "standalone",
      }));
      useTimerStore.setState({ moodEntries: migratedEntries });
      needsMigration = true;
    }

    // Migrate legacy sessions without proper IDs
    if (state.history.some((session: any) => !session.id)) {
      console.log("Migrating legacy sessions...");
      const migratedHistory = state.history.map((session: any, index: number) => ({
        ...session,
        id: session.id || `legacy-session-${index}-${Date.now()}`,
      }));
      useTimerStore.setState({ history: migratedHistory });
      needsMigration = true;
    }

    // Migrate legacy tag configurations
    if (state.customTags.length > 0 && state.customTagConfigs.length === 0) {
      console.log("Migrating legacy tag configurations...");
      const migratedConfigs = state.customTags.map((tag: string) => ({
        name: tag,
        color: "Blue" as any, // Default color
        icon: undefined,
      }));
      useTimerStore.setState({ customTagConfigs: migratedConfigs });
      needsMigration = true;
    }

    if (needsMigration) {
      console.log("Data migration completed");
      // Recalculate stats after migration
      state.recalculateStats();
    }
  }

  /**
   * Initialize reward system
   */
  private initializeRewardSystem(): void {
    const store = useTimerStore.getState();
    
    // Ensure reward system is properly initialized
    if (!store.rewardSystem.achievements) {
      store.resetRewardSystem();
    }

    // Check for any achievements that should be unlocked based on current stats
    this.checkInitialAchievements();
  }

  /**
   * Initialize mood tracking
   */
  private initializeMoodTracking(): void {
    const state = useTimerStore.getState();
    
    // Ensure mood entries array exists
    if (!Array.isArray(state.moodEntries)) {
      useTimerStore.setState({ moodEntries: [] });
    }

    // Clean up old mood entries if there are too many
    if (state.moodEntries.length > 1000) {
      console.log("Cleaning up old mood entries...");
      storeUtilities.cleanupOldData({ maxMoodEntries: 1000 });
    }
  }

  /**
   * Initialize tag system
   */
  private initializeTagSystem(): void {
    const state = useTimerStore.getState();
    
    // Ensure tag arrays exist
    if (!Array.isArray(state.customTags)) {
      useTimerStore.setState({ customTags: [] });
    }
    
    if (!Array.isArray(state.customTagConfigs)) {
      useTimerStore.setState({ customTagConfigs: [] });
    }

    // Set hasCreatedCustomTag flag based on existing tags
    const hasCustomTags = state.customTags.length > 0 || state.customTagConfigs.length > 0;
    if (hasCustomTags && !state.hasCreatedCustomTag) {
      useTimerStore.setState({ hasCreatedCustomTag: true });
    }
  }

  /**
   * Check for achievements that should be unlocked based on current stats
   */
  private checkInitialAchievements(): void {
    const state = useTimerStore.getState();
    const stats = state.stats;

    // Check session milestones
    const sessionMilestones = [1, 5, 10, 25, 50, 100];
    sessionMilestones.forEach((milestone) => {
      if (stats.completedSessions >= milestone) {
        const achievementName = `${milestone} Sessions Completed`;
        const hasAchievement = state.rewardSystem.achievements.some(
          (achievement) => achievement.name === achievementName
        );
        
        if (!hasAchievement) {
          state.unlockAchievement(achievementName, 50);
        }
      }
    });

    // Check time milestones
    const hours = Math.floor(stats.totalWorkTime / 3600);
    const hourMilestones = [1, 10, 25, 50, 100];
    hourMilestones.forEach((milestone) => {
      if (hours >= milestone) {
        const achievementName = `${milestone} Hours of Focus`;
        const hasAchievement = state.rewardSystem.achievements.some(
          (achievement) => achievement.name === achievementName
        );
        
        if (!hasAchievement) {
          state.unlockAchievement(achievementName, 75);
        }
      }
    });
  }

  /**
   * Handle initialization errors
   */
  private handleInitializationError(error: unknown): void {
    console.error("Store initialization failed, attempting recovery...");
    
    try {
      // Reset to safe defaults
      storeUtilities.resetStore();
      
      // Try basic initialization again
      const store = useTimerStore.getState();
      store.refreshConfigFromPreferences();
      store.recalculateStats();
      
      console.log("Store recovery completed");
      this.isInitialized = true;
    } catch (recoveryError) {
      console.error("Store recovery failed:", recoveryError);
      throw new Error("Failed to initialize timer store");
    }
  }

  /**
   * Cleanup store initialization
   */
  public cleanup(): void {
    storeSubscriptions.cleanup();
    this.isInitialized = false;
    console.log("Store initialization cleaned up");
  }

  /**
   * Get initialization status
   */
  public getStatus(): {
    isInitialized: boolean;
    subscriptionStatus: any;
    storeValidation: any;
  } {
    return {
      isInitialized: this.isInitialized,
      subscriptionStatus: storeSubscriptions.getStatus(),
      storeValidation: storeUtilities.validateStoreData(),
    };
  }
}

export const storeInitialization = StoreInitialization.getInstance();
