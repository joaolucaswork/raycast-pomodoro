import { getFrontmostApplication, Application } from "@raycast/api";
import { ApplicationUsage } from "../../types/timer";
import { applicationIconService } from "../application-icon-service";
import { jsonApplicationIconService } from "../json-app-icon-service";
import {
  ApplicationTrackingData,
  TRACKING_CONSTANTS,
} from "./application-tracking-types";

/**
 * Core tracking module for application detection and data capture.
 *
 * This module handles:
 * - Real-time application detection using Raycast's getFrontmostApplication API
 * - Application usage data capture and time tracking
 * - Error handling and recovery mechanisms
 * - Interval management for periodic polling
 */
export class ApplicationTrackingCore {
  /** Interval timer for periodic application checking */
  private trackingInterval: NodeJS.Timeout | null = null;

  /**
   * Start the tracking interval for periodic application detection
   */
  startTrackingInterval(
    intervalSeconds: number,
    captureCallback: () => Promise<void>
  ): void {
    if (this.trackingInterval) {
      console.log(
        `[ApplicationTrackingCore] Clearing existing interval before starting new one`
      );
      clearInterval(this.trackingInterval);
    }

    console.log(
      `[ApplicationTrackingCore] Setting up interval timer for ${intervalSeconds}s`
    );

    this.trackingInterval = setInterval(() => {
      console.log(
        `[ApplicationTrackingCore] Interval tick - capturing application`
      );
      captureCallback().catch((error) => {
        console.error(
          "[ApplicationTrackingCore] Error in capture callback:",
          error
        );
      });
    }, intervalSeconds * 1000);
  }

  /**
   * Stop the tracking interval
   */
  stopTrackingInterval(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
      console.log(`[ApplicationTrackingCore] Cleared tracking interval`);
    }
  }

  /**
   * Capture the currently active application and update tracking data
   */
  async captureCurrentApplication(
    trackingData: ApplicationTrackingData
  ): Promise<void> {
    const captureStartTime = performance.now();

    try {
      console.log(
        `[ApplicationTrackingCore] Attempting to capture frontmost application...`
      );

      const frontmostApp = await getFrontmostApplication();
      const currentTime = Date.now();
      const captureEndTime = performance.now();

      console.log(
        `[ApplicationTrackingCore] Successfully captured app: ${frontmostApp.name} (${frontmostApp.bundleId}) in ${(captureEndTime - captureStartTime).toFixed(2)}ms`
      );

      // Update time for previous application if it exists
      if (trackingData.currentApplication) {
        const previousApp = trackingData.currentApplication.name;
        this.updateCurrentApplicationTime(trackingData);
        console.log(
          `[ApplicationTrackingCore] Updated time for previous app: ${previousApp}`
        );
      }

      // Update current application
      trackingData.currentApplication = frontmostApp;
      trackingData.lastUpdateTime = currentTime;

      // Add or update application in tracking data
      await this.addOrUpdateApplication(frontmostApp, trackingData);

      // Reset error count on successful capture
      if (trackingData.errorCount > 0) {
        console.log(
          `[ApplicationTrackingCore] Resetting error count after successful capture`
        );
        trackingData.errorCount = 0;
        trackingData.lastError = undefined;
      }
    } catch (error) {
      console.error(
        `[ApplicationTrackingCore] Failed to capture application:`,
        error
      );
      this.handleTrackingError(error, trackingData);
    }
  }

  /**
   * Add or update an application in the tracking data
   */
  private async addOrUpdateApplication(
    app: Application,
    trackingData: ApplicationTrackingData
  ): Promise<void> {
    const appId = this.getApplicationId(app);
    const existingUsage = trackingData.applications.get(appId);

    if (existingUsage) {
      // Update existing application
      existingUsage.lastUsed = new Date();
      console.log(
        `[ApplicationTrackingCore] Updated existing app: ${app.name}`
      );
    } else {
      // Add new application
      try {
        // Try JSON-based service first (more comprehensive and up-to-date)
        let mapping = jsonApplicationIconService.getApplicationMapping(
          app.bundleId || app.name,
          app.name
        );

        // Fallback to original service if not found in JSON
        if (!mapping) {
          const legacyMapping = applicationIconService.getApplicationMapping(
            app.bundleId || app.name,
            app.name
          );
          if (legacyMapping) {
            mapping = {
              icon: legacyMapping.icon,
              category: legacyMapping.category,
              isRecognized: true,
              recognizedName: app.name,
            };
          }
        }

        const newUsage: ApplicationUsage = {
          name: app.name,
          bundleId: app.bundleId || app.name,
          timeSpent: 0,
          percentage: 0,
          firstUsed: new Date(),
          lastUsed: new Date(),
          raycastIcon: mapping?.icon,
          category: mapping?.category as ApplicationUsage["category"],
          isRecognized: mapping !== null,
        };

        trackingData.applications.set(appId, newUsage);
        console.log(
          `[ApplicationTrackingCore] Added new app: ${app.name} (${appId})`
        );
      } catch (iconError) {
        console.warn(
          `[ApplicationTrackingCore] Failed to get icon for ${app.name}:`,
          iconError
        );

        // Add without icon
        const newUsage: ApplicationUsage = {
          name: app.name,
          bundleId: app.bundleId || app.name,
          timeSpent: 0,
          percentage: 0,
          firstUsed: new Date(),
          lastUsed: new Date(),
          isRecognized: false,
        };

        trackingData.applications.set(appId, newUsage);
      }
    }
  }

  /**
   * Update the time spent on the current application
   */
  updateCurrentApplicationTime(trackingData: ApplicationTrackingData): void {
    if (!trackingData.currentApplication) {
      return;
    }

    const now = Date.now();
    const timeDelta =
      trackingData.lastUpdateTime > 0
        ? Math.floor((now - trackingData.lastUpdateTime) / 1000)
        : 0;

    if (timeDelta > 0) {
      const appId = this.getApplicationId(trackingData.currentApplication);
      const existingUsage = trackingData.applications.get(appId);

      if (existingUsage) {
        existingUsage.timeSpent += timeDelta;
        existingUsage.lastUsed = new Date();
        console.log(
          `[ApplicationTrackingCore] Added ${timeDelta}s to ${existingUsage.name} (total: ${existingUsage.timeSpent}s)`
        );
      }

      trackingData.totalTrackingTime += timeDelta;
      trackingData.lastUpdateTime = now;
    }
  }

  /**
   * Handle tracking errors with exponential backoff and recovery
   */
  private handleTrackingError(
    error: unknown,
    trackingData: ApplicationTrackingData
  ): void {
    trackingData.errorCount++;
    const errorMessage = error instanceof Error ? error.message : String(error);
    trackingData.lastError = errorMessage;

    console.error(
      `[ApplicationTrackingCore] Tracking error #${trackingData.errorCount}: ${errorMessage}`
    );

    // If too many errors, pause tracking temporarily
    if (trackingData.errorCount >= TRACKING_CONSTANTS.MAX_ERROR_COUNT) {
      console.warn(
        `[ApplicationTrackingCore] Too many errors (${trackingData.errorCount}), pausing tracking temporarily`
      );
      this.pauseTrackingDueToErrors();

      // Schedule error count reset
      setTimeout(() => {
        if (trackingData.errorCount >= TRACKING_CONSTANTS.MAX_ERROR_COUNT) {
          console.log(
            `[ApplicationTrackingCore] Resetting error count after timeout`
          );
          trackingData.errorCount = 0;
          trackingData.lastError = undefined;
        }
      }, TRACKING_CONSTANTS.ERROR_RESET_INTERVAL);
    }
  }

  /**
   * Pause tracking due to excessive errors
   */
  private pauseTrackingDueToErrors(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
      console.log(
        `[ApplicationTrackingCore] Paused tracking due to excessive errors`
      );
    }
  }

  /**
   * Get a unique identifier for an application
   */
  private getApplicationId(app: Application): string {
    return app.bundleId || app.name || `unknown-${Date.now()}`;
  }

  /**
   * Check if tracking interval is currently active
   */
  isIntervalActive(): boolean {
    return this.trackingInterval !== null;
  }

  /**
   * Get interval status for debugging
   */
  getIntervalStatus(): {
    isActive: boolean;
    intervalId: number | null;
  } {
    return {
      isActive: this.trackingInterval !== null,
      intervalId: this.trackingInterval ? Number(this.trackingInterval) : null,
    };
  }

  /**
   * Force cleanup of any active intervals (for testing/debugging)
   */
  forceCleanup(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
      console.log("[ApplicationTrackingCore] Force cleanup completed");
    }
  }
}

// Export singleton instance
export const applicationTrackingCore = new ApplicationTrackingCore();
