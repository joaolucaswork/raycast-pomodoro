import { storageAdapter } from "../../utils/storage-adapter";
import {
  ApplicationTrackingData,
  PersistedTrackingState,
  TRACKING_CONSTANTS,
} from "./application-tracking-types";

/**
 * State management module for application tracking persistence and restoration.
 * 
 * This module handles:
 * - Saving and restoring tracking state across extension reloads
 * - Managing state lifecycle and cleanup
 * - Providing recovery mechanisms for interrupted sessions
 */
export class ApplicationTrackingStateManager {
  /**
   * Save current tracking state to persistent storage
   */
  async saveTrackingState(
    isTracking: boolean,
    trackingData: ApplicationTrackingData,
    intervalSeconds: number
  ): Promise<void> {
    try {
      const state: PersistedTrackingState = {
        isTracking,
        sessionStartTime: trackingData.sessionStartTime,
        lastUpdateTime: trackingData.lastUpdateTime,
        intervalSeconds,
      };

      await storageAdapter.setItem(
        TRACKING_CONSTANTS.TRACKING_STATE_KEY,
        JSON.stringify(state)
      );

      console.log("[ApplicationTrackingState] State saved successfully");
    } catch (error) {
      console.error("[ApplicationTrackingState] Failed to save state:", error);
      throw error;
    }
  }

  /**
   * Restore tracking state from persistent storage
   */
  async restoreTrackingState(): Promise<PersistedTrackingState | null> {
    try {
      const storedState = await storageAdapter.getItem(
        TRACKING_CONSTANTS.TRACKING_STATE_KEY
      );

      if (!storedState) {
        console.log("[ApplicationTrackingState] No stored state found");
        return null;
      }

      const state: PersistedTrackingState = JSON.parse(storedState);

      // Validate the restored state
      if (!this.isValidPersistedState(state)) {
        console.warn("[ApplicationTrackingState] Invalid stored state, clearing");
        await this.clearTrackingState();
        return null;
      }

      console.log("[ApplicationTrackingState] State restored successfully");
      return state;
    } catch (error) {
      console.error("[ApplicationTrackingState] Failed to restore state:", error);
      await this.clearTrackingState();
      return null;
    }
  }

  /**
   * Clear tracking state from persistent storage
   */
  async clearTrackingState(): Promise<void> {
    try {
      await storageAdapter.removeItem(TRACKING_CONSTANTS.TRACKING_STATE_KEY);
      console.log("[ApplicationTrackingState] State cleared successfully");
    } catch (error) {
      console.error("[ApplicationTrackingState] Failed to clear state:", error);
      throw error;
    }
  }

  /**
   * Check if a persisted state should be restored based on age and validity
   */
  shouldRestoreState(state: PersistedTrackingState): boolean {
    if (!state.isTracking || !state.sessionStartTime) {
      return false;
    }

    const timeSinceStart = Date.now() - state.sessionStartTime;

    // Only restore if the session started recently (within 2 hours)
    // This prevents resuming very old sessions after system restart
    if (timeSinceStart > TRACKING_CONSTANTS.MAX_RESUME_TIME) {
      console.log(
        `[ApplicationTrackingState] Stored session too old (${timeSinceStart}ms), not resuming`
      );
      return false;
    }

    console.log(
      `[ApplicationTrackingState] Session age ${timeSinceStart}ms is within restore window`
    );
    return true;
  }

  /**
   * Initialize tracking data from restored state
   */
  initializeFromRestoredState(
    state: PersistedTrackingState,
    trackingData: ApplicationTrackingData
  ): void {
    trackingData.sessionStartTime = state.sessionStartTime;
    trackingData.lastUpdateTime = state.lastUpdateTime || Date.now();
    trackingData.totalTrackingTime = 0; // Reset total time, will be recalculated
    trackingData.errorCount = 0; // Reset error count on restore
    trackingData.lastError = undefined;

    console.log(
      `[ApplicationTrackingState] Tracking data initialized from restored state`
    );
  }

  /**
   * Reset tracking data to initial state
   */
  resetTrackingData(trackingData: ApplicationTrackingData): void {
    const now = Date.now();
    
    trackingData.applications.clear();
    trackingData.currentApplication = null;
    trackingData.lastUpdateTime = now;
    trackingData.totalTrackingTime = 0;
    trackingData.sessionStartTime = now;
    trackingData.errorCount = 0;
    trackingData.lastError = undefined;

    console.log("[ApplicationTrackingState] Tracking data reset to initial state");
  }

  /**
   * Validate that a persisted state object has the required properties
   */
  private isValidPersistedState(state: any): state is PersistedTrackingState {
    return (
      typeof state === "object" &&
      state !== null &&
      typeof state.isTracking === "boolean" &&
      typeof state.sessionStartTime === "number" &&
      typeof state.lastUpdateTime === "number" &&
      typeof state.intervalSeconds === "number" &&
      state.sessionStartTime > 0 &&
      state.intervalSeconds > 0
    );
  }

  /**
   * Get state summary for debugging
   */
  getStateSummary(trackingData: ApplicationTrackingData): {
    isActive: boolean;
    sessionDuration: number;
    applicationsTracked: number;
    errorCount: number;
  } {
    const sessionDuration = trackingData.sessionStartTime > 0
      ? Math.floor((Date.now() - trackingData.sessionStartTime) / 1000)
      : 0;

    return {
      isActive: trackingData.sessionStartTime > 0,
      sessionDuration,
      applicationsTracked: trackingData.applications.size,
      errorCount: trackingData.errorCount,
    };
  }

  /**
   * Check if tracking data indicates a healthy session
   */
  isHealthySession(trackingData: ApplicationTrackingData): boolean {
    const summary = this.getStateSummary(trackingData);
    
    // Consider unhealthy if:
    // - Too many errors relative to session duration
    // - No applications tracked after significant time
    const errorRate = summary.sessionDuration > 0 
      ? trackingData.errorCount / (summary.sessionDuration / 60) // errors per minute
      : 0;

    const hasTrackedApps = summary.applicationsTracked > 0;
    const lowErrorRate = errorRate < 1; // Less than 1 error per minute
    const reasonableSessionTime = summary.sessionDuration < 4 * 60 * 60; // Less than 4 hours

    return hasTrackedApps && lowErrorRate && reasonableSessionTime;
  }
}

// Export singleton instance
export const applicationTrackingStateManager = new ApplicationTrackingStateManager();
