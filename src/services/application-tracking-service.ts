import { Application } from "@raycast/api";
import { ApplicationUsage } from "../types/timer";
import {
  ApplicationTrackingData,
  ApplicationTrackingStats,
  TrackingHealth,
  ProductivityInsights,
  TRACKING_CONSTANTS,
} from "./application-tracking/application-tracking-types";
import { applicationTrackingStateManager } from "./application-tracking/application-tracking-state";
import { applicationTrackingAnalytics } from "./application-tracking/application-tracking-analytics";
import { applicationTrackingCore } from "./application-tracking/application-tracking-core";

/**
 * Service for tracking application usage during Pomodoro work sessions.
 *
 * This service coordinates between multiple modules to provide:
 * - Real-time application detection and tracking
 * - State persistence across extension reloads
 * - Comprehensive analytics and insights
 * - Error handling and recovery mechanisms
 *
 * @example
 * ```typescript
 * // Start tracking with 5-second intervals
 * applicationTrackingService.startTracking(5);
 *
 * // Get current usage data
 * const usage = applicationTrackingService.getCurrentUsageData();
 *
 * // Stop tracking and get final results
 * const finalUsage = applicationTrackingService.stopTracking();
 * ```
 */
class ApplicationTrackingService {
  /** Internal tracking data storage */
  private trackingData: ApplicationTrackingData = {
    applications: new Map(),
    currentApplication: null,
    lastUpdateTime: 0,
    totalTrackingTime: 0,
    sessionStartTime: 0,
    errorCount: 0,
  };

  /** Flag indicating if tracking is currently active */
  private isTracking = false;

  /** Flag to track if initialization is complete */
  private isInitialized = false;

  /** Constructor - restore state on initialization */
  constructor() {
    this.initializeAsync();
  }

  /**
   * Async initialization to restore state
   */
  private async initializeAsync(): Promise<void> {
    console.log("[ApplicationTracking] Initializing service...");
    await this.restoreTrackingState();
    this.isInitialized = true;
    console.log("[ApplicationTracking] Service initialization complete");
  }

  /**
   * Restore tracking state using the state manager
   */
  private async restoreTrackingState(): Promise<void> {
    try {
      const restoredState =
        await applicationTrackingStateManager.restoreTrackingState();

      if (
        restoredState &&
        applicationTrackingStateManager.shouldRestoreState(restoredState)
      ) {
        console.log(
          `[ApplicationTracking] Restoring tracking state from ${Date.now() - restoredState.sessionStartTime}ms ago`
        );

        // Initialize tracking data from restored state
        applicationTrackingStateManager.initializeFromRestoredState(
          restoredState,
          this.trackingData
        );

        // Resume tracking with restored interval
        this.resumeTracking(restoredState.intervalSeconds);
      } else if (restoredState) {
        console.log(
          "[ApplicationTracking] Stored session too old or invalid, clearing state"
        );
        await applicationTrackingStateManager.clearTrackingState();
      }
    } catch (error) {
      console.error("[ApplicationTracking] Failed to restore state:", error);
      await applicationTrackingStateManager.clearTrackingState();
    }
  }

  /**
   * Resume tracking after extension reload
   */
  private resumeTracking(intervalSeconds: number): void {
    if (this.isTracking) {
      console.log(
        "[ApplicationTracking] Already tracking, ignoring resume request"
      );
      return;
    }

    console.log(
      `[ApplicationTracking] Resuming tracking with ${intervalSeconds}s interval`
    );
    this.isTracking = true;

    // Initial capture
    applicationTrackingCore.captureCurrentApplication(this.trackingData);

    // Set up periodic polling using the core module
    applicationTrackingCore.startTrackingInterval(intervalSeconds, () =>
      applicationTrackingCore.captureCurrentApplication(this.trackingData)
    );
    console.log("[ApplicationTracking] Tracking resumed successfully");
  }

  /**
   * Start tracking application usage during a work session.
   *
   * This method begins monitoring the user's active application at regular intervals.
   * The tracking continues until explicitly stopped and provides real-time insights
   * into application usage patterns.
   *
   * @param intervalSeconds - How often to poll for active application in seconds (default: 5)
   *                         Lower values provide more accuracy but use more resources.
   *                         Recommended range: 1-30 seconds.
   *
   * @example
   * ```typescript
   * // Start tracking with default 5-second intervals
   * applicationTrackingService.startTracking();
   *
   * // Start tracking with high accuracy (1-second intervals)
   * applicationTrackingService.startTracking(1);
   *
   * // Start tracking with low resource usage (10-second intervals)
   * applicationTrackingService.startTracking(10);
   * ```
   */
  startTracking(
    intervalSeconds: number = TRACKING_CONSTANTS.DEFAULT_INTERVAL
  ): void {
    if (this.isTracking) {
      console.log(
        `[ApplicationTracking] Already tracking, ignoring start request`
      );
      return;
    }

    console.log(
      `[ApplicationTracking] Starting tracking with ${intervalSeconds}s interval`
    );
    this.isTracking = true;

    // Reset tracking data using state manager
    applicationTrackingStateManager.resetTrackingData(this.trackingData);

    // Save state for persistence across extension reloads
    applicationTrackingStateManager
      .saveTrackingState(this.isTracking, this.trackingData, intervalSeconds)
      .catch((error: unknown) => {
        console.error(
          "[ApplicationTracking] Failed to save initial state:",
          error
        );
      });

    // Initial capture using core module
    applicationTrackingCore.captureCurrentApplication(this.trackingData);

    // Set up periodic polling using core module
    applicationTrackingCore.startTrackingInterval(intervalSeconds, () =>
      applicationTrackingCore.captureCurrentApplication(this.trackingData)
    );
    console.log(`[ApplicationTracking] Tracking started successfully`);
  }

  /**
   * Stop tracking and return final usage data
   */
  stopTracking(): ApplicationUsage[] {
    if (!this.isTracking) {
      console.log(
        `[ApplicationTracking] Not currently tracking, ignoring stop request`
      );
      return [];
    }

    console.log(`[ApplicationTracking] Stopping tracking...`);
    this.isTracking = false;

    // Stop the tracking interval using core module
    applicationTrackingCore.stopTrackingInterval();

    // Clear persisted state since tracking is complete
    applicationTrackingStateManager
      .clearTrackingState()
      .catch((error: unknown) => {
        console.error("[ApplicationTracking] Failed to clear state:", error);
      });

    // Final capture to account for time since last poll
    applicationTrackingCore.captureCurrentApplication(this.trackingData);

    // Get usage data using analytics module
    const usageData = applicationTrackingAnalytics.getApplicationUsageArray(
      this.trackingData
    );
    console.log(
      `[ApplicationTracking] Tracking stopped. Captured ${usageData.length} applications`
    );

    return usageData;
  }

  /**
   * Get current tracking status
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Check if tracking should be active and restart if needed
   * This helps recover from extension reloads where the timer is running but tracking stopped
   */
  ensureTrackingActive(
    intervalSeconds: number = TRACKING_CONSTANTS.DEFAULT_INTERVAL
  ): void {
    if (!this.isTracking) {
      console.log(
        "[ApplicationTracking] Tracking not active, attempting to restart..."
      );
      this.startTracking(intervalSeconds);
    }
  }

  /**
   * Get current application usage data (while tracking)
   */
  getCurrentUsageData(): ApplicationUsage[] {
    if (!this.isTracking) {
      return [];
    }

    // Update current app time before returning data
    this.updateCurrentApplicationTime();
    return applicationTrackingAnalytics.getApplicationUsageArray(
      this.trackingData
    );
  }

  /**
   * Get comprehensive tracking statistics
   */
  getTrackingStats(): ApplicationTrackingStats {
    return applicationTrackingAnalytics.generateTrackingStats(
      this.trackingData
    );
  }

  /**
   * Get productivity insights
   */
  getProductivityInsights(): ProductivityInsights {
    return applicationTrackingAnalytics.generateProductivityInsights(
      this.trackingData
    );
  }

  /**
   * Get tracking health status
   */
  getTrackingHealth(): TrackingHealth {
    return applicationTrackingAnalytics.getTrackingHealth(this.trackingData);
  }

  /**
   * Get the currently active application
   */
  getCurrentApplication(): Application | null {
    return this.trackingData.currentApplication;
  }

  /**
   * Get the most used application
   */
  getMostUsedApplication(): ApplicationUsage | null {
    return applicationTrackingAnalytics.getMostUsedApplication(
      this.trackingData
    );
  }

  /**
   * Get total tracking time
   */
  getTotalTrackingTime(): number {
    return applicationTrackingAnalytics.getTotalTrackingTime(this.trackingData);
  }

  /**
   * Update current application time (delegated to core module)
   */
  private updateCurrentApplicationTime(): void {
    applicationTrackingCore.updateCurrentApplicationTime(this.trackingData);
  }
}

// Export singleton instance
export const applicationTrackingService = new ApplicationTrackingService();
