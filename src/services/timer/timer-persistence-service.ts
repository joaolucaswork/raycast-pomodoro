import { storageAdapter } from "../../utils/storage-adapter";

/**
 * Timer persistence service for background state management.
 *
 * Handles:
 * - Background timer state storage and retrieval
 * - State persistence across app restarts
 * - Storage error handling
 * - State validation
 */
export class TimerPersistenceService {
  private static instance: TimerPersistenceService;
  private readonly STORAGE_KEY = "background-timer-state";

  private constructor() {}

  public static getInstance(): TimerPersistenceService {
    if (!TimerPersistenceService.instance) {
      TimerPersistenceService.instance = new TimerPersistenceService();
    }
    return TimerPersistenceService.instance;
  }

  /**
   * Saves background timer state to storage
   */
  public async saveBackgroundState(state: any): Promise<void> {
    try {
      await storageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save background timer state:", error);
      throw error;
    }
  }

  /**
   * Loads background timer state from storage
   */
  public async loadBackgroundState(): Promise<any | null> {
    try {
      const stateJson = await storageAdapter.getItem(this.STORAGE_KEY);
      if (!stateJson) {
        return null;
      }

      const state = JSON.parse(stateJson);

      // Validate the loaded state
      if (!this.isValidBackgroundState(state)) {
        console.warn("Invalid background state found, clearing it");
        await this.clearBackgroundState();
        return null;
      }

      return state;
    } catch (error) {
      console.error("Failed to load background timer state:", error);
      // Clear corrupted state
      await this.clearBackgroundState();
      return null;
    }
  }

  /**
   * Clears background timer state from storage
   */
  public async clearBackgroundState(): Promise<void> {
    try {
      await storageAdapter.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear background timer state:", error);
    }
  }

  /**
   * Checks if background state exists
   */
  public async hasBackgroundState(): Promise<boolean> {
    try {
      const stateJson = await storageAdapter.getItem(this.STORAGE_KEY);
      return !!stateJson;
    } catch (error) {
      console.error("Failed to check background state existence:", error);
      return false;
    }
  }

  /**
   * Updates specific fields in the background state
   */
  public async updateBackgroundState(updates: Partial<any>): Promise<void> {
    try {
      const currentState = await this.loadBackgroundState();
      if (!currentState) {
        throw new Error("No background state to update");
      }

      const updatedState = { ...currentState, ...updates };
      await this.saveBackgroundState(updatedState);
    } catch (error) {
      console.error("Failed to update background timer state:", error);
      throw error;
    }
  }

  /**
   * Validates the structure of background state
   */
  private isValidBackgroundState(state: any): boolean {
    if (!state || typeof state !== "object") {
      return false;
    }

    // Check required fields
    const requiredFields = [
      "session",
      "startTimestamp",
      "endTimestamp",
      "state",
    ];
    for (const field of requiredFields) {
      if (!(field in state)) {
        return false;
      }
    }

    // Validate session object
    if (!state.session || typeof state.session !== "object") {
      return false;
    }

    const sessionRequiredFields = ["id", "type", "duration", "startTime"];
    for (const field of sessionRequiredFields) {
      if (!(field in state.session)) {
        return false;
      }
    }

    // Validate timestamps
    if (
      typeof state.startTimestamp !== "number" ||
      typeof state.endTimestamp !== "number" ||
      state.startTimestamp <= 0 ||
      state.endTimestamp <= 0 ||
      state.endTimestamp <= state.startTimestamp
    ) {
      return false;
    }

    // Validate state
    const validStates = ["idle", "running", "paused", "completed"];
    if (!validStates.includes(state.state)) {
      return false;
    }

    return true;
  }

  /**
   * Gets the storage key used for background state
   */
  public getStorageKey(): string {
    return this.STORAGE_KEY;
  }

  /**
   * Migrates old background state format to new format if needed
   */
  public async migrateBackgroundState(): Promise<void> {
    try {
      const state = await this.loadBackgroundState();
      if (!state) {
        return;
      }

      let needsMigration = false;
      const migratedState = { ...state };

      // Example migration: Add missing fields with defaults
      if (!("version" in migratedState)) {
        migratedState.version = "1.0.0";
        needsMigration = true;
      }

      // Add any other migration logic here

      if (needsMigration) {
        await this.saveBackgroundState(migratedState);
        console.log("Background state migrated successfully");
      }
    } catch (error) {
      console.error("Failed to migrate background state:", error);
    }
  }

  /**
   * Creates a backup of the current background state
   */
  public async backupBackgroundState(): Promise<string | null> {
    try {
      const state = await this.loadBackgroundState();
      if (!state) {
        return null;
      }

      const backup = {
        timestamp: Date.now(),
        state,
      };

      const backupKey = `${this.STORAGE_KEY}_backup_${Date.now()}`;
      await storageAdapter.setItem(backupKey, JSON.stringify(backup));
      return backupKey;
    } catch (error) {
      console.error("Failed to backup background state:", error);
      return null;
    }
  }

  /**
   * Restores background state from a backup
   */
  public async restoreBackgroundState(backupKey: string): Promise<boolean> {
    try {
      const backupJson = await storageAdapter.getItem(backupKey);
      if (!backupJson) {
        return false;
      }

      const backup = JSON.parse(backupJson);
      if (!backup.state) {
        return false;
      }

      await this.saveBackgroundState(backup.state);
      return true;
    } catch (error) {
      console.error("Failed to restore background state:", error);
      return false;
    }
  }

  /**
   * Lists all available backups
   */
  public async listBackups(): Promise<string[]> {
    try {
      // This would need to be implemented based on the storage adapter's capabilities
      // For now, return empty array as most storage adapters don't support listing keys
      return [];
    } catch (error) {
      console.error("Failed to list backups:", error);
      return [];
    }
  }

  /**
   * Cleans up old backups (keeps only the most recent N backups)
   */
  public async cleanupOldBackups(keepCount: number = 5): Promise<void> {
    try {
      const backups = await this.listBackups();
      if (backups.length <= keepCount) {
        return;
      }

      // Sort by timestamp (newest first) and remove old ones
      const sortedBackups = backups.sort((a, b) => {
        const timestampA = parseInt(a.split("_").pop() || "0");
        const timestampB = parseInt(b.split("_").pop() || "0");
        return timestampB - timestampA;
      });

      const backupsToDelete = sortedBackups.slice(keepCount);
      for (const backupKey of backupsToDelete) {
        await storageAdapter.removeItem(backupKey);
      }
    } catch (error) {
      console.error("Failed to cleanup old backups:", error);
    }
  }
}

export const timerPersistenceService = TimerPersistenceService.getInstance();
