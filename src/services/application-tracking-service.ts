import { getFrontmostApplication, Application } from "@raycast/api";
import { ApplicationUsage } from "../types/timer";
import { applicationIconService } from "./application-icon-service";

/**
 * Interface for tracking application usage data during Pomodoro sessions
 */
export interface ApplicationTrackingData {
  /** Map of application bundle IDs to usage statistics */
  applications: Map<string, ApplicationUsage>;
  /** Currently active application */
  currentApplication: Application | null;
  /** Timestamp of last tracking update */
  lastUpdateTime: number;
  /** Total time tracked in seconds */
  totalTrackingTime: number;
  /** Session start timestamp */
  sessionStartTime: number;
  /** Number of tracking errors encountered */
  errorCount: number;
  /** Last error message if any */
  lastError?: string;
}

/**
 * Interface for comprehensive tracking statistics
 */
export interface ApplicationTrackingStats {
  /** Total number of applications tracked */
  totalApplications: number;
  /** Application with the most usage time */
  mostUsedApplication: ApplicationUsage | null;
  /** Application with the least usage time */
  leastUsedApplication: ApplicationUsage | null;
  /** Average time spent per application */
  averageTimePerApp: number;
  /** Total session duration in seconds */
  sessionDuration: number;
  /** Percentage of time successfully tracked (0-100) */
  trackingAccuracy: number;
}

/**
 * Service for tracking application usage during Pomodoro work sessions.
 *
 * This service monitors which applications the user is actively using during work sessions,
 * providing detailed analytics and insights to help improve productivity and focus.
 *
 * Features:
 * - Real-time application detection using Raycast's getFrontmostApplication API
 * - Configurable polling intervals for performance optimization
 * - Robust error handling and recovery
 * - Comprehensive usage analytics and insights
 * - Privacy-first design with local data storage only
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

  /** Interval timer for periodic application checking */
  private trackingInterval: NodeJS.Timeout | null = null;

  /** Flag indicating if tracking is currently active */
  private isTracking = false;

  /** Maximum number of consecutive errors before pausing tracking */
  private readonly MAX_ERROR_COUNT = 10;

  /** Time to wait before resetting error count (milliseconds) */
  private readonly ERROR_RESET_INTERVAL = 60000;

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
  startTracking(intervalSeconds: number = 5): void {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    this.resetTrackingData();

    // Initial capture
    this.captureCurrentApplication();

    // Set up periodic polling
    this.startTrackingInterval(intervalSeconds);
  }

  /**
   * Start the tracking interval
   * @param intervalSeconds - Polling interval in seconds
   */
  private startTrackingInterval(intervalSeconds: number): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingInterval = setInterval(() => {
      this.captureCurrentApplication();
    }, intervalSeconds * 1000);
  }

  /**
   * Stop tracking and return final usage data
   */
  stopTracking(): ApplicationUsage[] {
    if (!this.isTracking) {
      return [];
    }

    this.isTracking = false;

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // Final capture to account for time since last poll
    this.captureCurrentApplication();

    return this.getApplicationUsageArray();
  }

  /**
   * Get current tracking status
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
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
    return this.getApplicationUsageArray();
  }

  /**
   * Reset all tracking data
   */
  private resetTrackingData(): void {
    const now = Date.now();
    this.trackingData = {
      applications: new Map(),
      currentApplication: null,
      lastUpdateTime: now,
      totalTrackingTime: 0,
      sessionStartTime: now,
      errorCount: 0,
    };
  }

  /**
   * Capture the currently active application
   */
  private async captureCurrentApplication(): Promise<void> {
    try {
      const frontmostApp = await getFrontmostApplication();
      const currentTime = Date.now();

      // Update time for previous application if it exists
      if (this.trackingData.currentApplication) {
        this.updateCurrentApplicationTime();
      }

      // Set new current application
      this.trackingData.currentApplication = frontmostApp;
      this.trackingData.lastUpdateTime = currentTime;

      // Initialize tracking for new application if not seen before
      const bundleId = this.getApplicationId(frontmostApp);
      if (!this.trackingData.applications.has(bundleId)) {
        const appName = frontmostApp.name || "Unknown Application";
        const raycastIcon =
          applicationIconService.getIconByBundleId(bundleId) ||
          applicationIconService.getIconByName(appName);
        const mapping = applicationIconService.getApplicationMapping(
          bundleId,
          appName
        );

        this.trackingData.applications.set(bundleId, {
          bundleId: bundleId,
          name: appName,
          timeSpent: 0,
          percentage: 0,
          icon: undefined, // Legacy field for compatibility
          raycastIcon: raycastIcon,
          category: mapping?.category || "other",
          isRecognized: applicationIconService.isRecognizedApplication(
            bundleId,
            appName
          ),
        });
      }

      // Reset error count on successful capture
      if (this.trackingData.errorCount > 0) {
        this.trackingData.errorCount = 0;
        delete this.trackingData.lastError;
      }
    } catch (error) {
      this.handleTrackingError(error);
    }
  }

  /**
   * Handle tracking errors with improved error management
   */
  private handleTrackingError(error: unknown): void {
    this.trackingData.errorCount++;
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.trackingData.lastError = errorMessage;

    console.error(
      `Application tracking error (${this.trackingData.errorCount}/${this.MAX_ERROR_COUNT}):`,
      errorMessage
    );

    // If too many errors, temporarily disable tracking
    if (this.trackingData.errorCount >= this.MAX_ERROR_COUNT) {
      console.warn(
        "Too many application tracking errors. Temporarily disabling tracking."
      );
      this.pauseTrackingDueToErrors();
    }
  }

  /**
   * Temporarily pause tracking due to errors
   */
  private pauseTrackingDueToErrors(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // Try to resume tracking after a delay
    setTimeout(() => {
      if (this.isTracking) {
        console.log("Attempting to resume application tracking...");
        this.trackingData.errorCount = 0;
        delete this.trackingData.lastError;
        this.startTrackingInterval(5); // Resume with default interval
      }
    }, this.ERROR_RESET_INTERVAL);
  }

  /**
   * Get a consistent application identifier
   */
  private getApplicationId(app: Application): string {
    return app.bundleId || app.name || `unknown-${Date.now()}`;
  }

  /**
   * Update time spent in current application
   */
  private updateCurrentApplicationTime(): void {
    if (!this.trackingData.currentApplication) {
      return;
    }

    const currentTime = Date.now();
    const timeElapsed = Math.floor(
      (currentTime - this.trackingData.lastUpdateTime) / 1000
    );

    if (timeElapsed > 0) {
      const bundleId = this.getApplicationId(
        this.trackingData.currentApplication
      );
      const appUsage = this.trackingData.applications.get(bundleId);

      if (appUsage) {
        appUsage.timeSpent += timeElapsed;
        this.trackingData.totalTrackingTime += timeElapsed;
      }

      this.trackingData.lastUpdateTime = currentTime;
    }
  }

  /**
   * Convert tracking data to array with calculated percentages
   */
  private getApplicationUsageArray(): ApplicationUsage[] {
    // Ensure current app time is up to date
    this.updateCurrentApplicationTime();

    const usageArray = Array.from(this.trackingData.applications.values());

    // Calculate percentages
    if (this.trackingData.totalTrackingTime > 0) {
      usageArray.forEach((app) => {
        app.percentage = Math.round(
          (app.timeSpent / this.trackingData.totalTrackingTime) * 100
        );
      });
    }

    // Sort by time spent (descending)
    return usageArray.sort((a, b) => b.timeSpent - a.timeSpent);
  }

  /**
   * Get total tracking time in seconds
   */
  getTotalTrackingTime(): number {
    return this.trackingData.totalTrackingTime;
  }

  /**
   * Get the most used application during current session
   */
  getMostUsedApplication(): ApplicationUsage | null {
    const usageArray = this.getApplicationUsageArray();
    return usageArray.length > 0 ? usageArray[0] : null;
  }

  /**
   * Get comprehensive tracking statistics
   */
  getTrackingStats(): ApplicationTrackingStats {
    const usageArray = this.getApplicationUsageArray();
    const sessionDuration =
      this.trackingData.sessionStartTime > 0
        ? Math.floor((Date.now() - this.trackingData.sessionStartTime) / 1000)
        : 0;

    return {
      totalApplications: usageArray.length,
      mostUsedApplication: usageArray.length > 0 ? usageArray[0] : null,
      leastUsedApplication:
        usageArray.length > 0 ? usageArray[usageArray.length - 1] : null,
      averageTimePerApp:
        usageArray.length > 0
          ? Math.floor(this.trackingData.totalTrackingTime / usageArray.length)
          : 0,
      sessionDuration,
      trackingAccuracy:
        sessionDuration > 0
          ? Math.round(
              (this.trackingData.totalTrackingTime / sessionDuration) * 100
            )
          : 0,
    };
  }

  /**
   * Get current application being tracked
   */
  getCurrentApplication(): Application | null {
    return this.trackingData.currentApplication;
  }

  /**
   * Get tracking health information
   */
  getTrackingHealth(): {
    isHealthy: boolean;
    errorCount: number;
    lastError?: string;
    uptime: number;
  } {
    const uptime =
      this.trackingData.sessionStartTime > 0
        ? Date.now() - this.trackingData.sessionStartTime
        : 0;

    return {
      isHealthy: this.trackingData.errorCount < this.MAX_ERROR_COUNT / 2,
      errorCount: this.trackingData.errorCount,
      lastError: this.trackingData.lastError,
      uptime,
    };
  }

  /**
   * Get AI-powered productivity insights based on application usage patterns.
   *
   * This method analyzes the user's application usage during work sessions and provides
   * intelligent insights to help improve focus and productivity. It categorizes applications
   * as productive or potentially distracting based on common usage patterns and provides
   * personalized recommendations.
   *
   * @returns Object containing productivity analysis:
   * - `focusScore`: Overall focus quality score (0-100, higher is better)
   * - `distractionApps`: Applications that may be reducing productivity
   * - `productiveApps`: Applications associated with productive work
   * - `recommendations`: Personalized suggestions for improvement
   *
   * @example
   * ```typescript
   * const insights = applicationTrackingService.getProductivityInsights();
   *
   * console.log(`Focus Score: ${insights.focusScore}%`);
   * console.log(`Top productive app: ${insights.productiveApps[0]?.name}`);
   * console.log(`Recommendations: ${insights.recommendations.join(', ')}`);
   * ```
   */
  getProductivityInsights(): {
    focusScore: number;
    distractionApps: ApplicationUsage[];
    productiveApps: ApplicationUsage[];
    recommendations: string[];
  } {
    const usageArray = this.getApplicationUsageArray();
    const totalTime = this.trackingData.totalTrackingTime;

    // Simple heuristics for productivity analysis
    const productiveKeywords = [
      "code",
      "editor",
      "ide",
      "terminal",
      "browser",
      "office",
      "word",
      "excel",
    ];
    const distractionKeywords = [
      "game",
      "social",
      "chat",
      "video",
      "music",
      "entertainment",
    ];

    const productiveApps = usageArray.filter((app) =>
      productiveKeywords.some((keyword) =>
        app.name.toLowerCase().includes(keyword)
      )
    );

    const distractionApps = usageArray.filter((app) =>
      distractionKeywords.some((keyword) =>
        app.name.toLowerCase().includes(keyword)
      )
    );

    const productiveTime = productiveApps.reduce(
      (sum, app) => sum + app.timeSpent,
      0
    );
    const focusScore =
      totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;

    const recommendations: string[] = [];
    if (focusScore < 70) {
      recommendations.push(
        "Consider using website blockers during focus sessions"
      );
    }
    if (distractionApps.length > 0) {
      recommendations.push(
        `Minimize time in ${distractionApps[0].name} during work sessions`
      );
    }
    if (usageArray.length > 5) {
      recommendations.push("Try to reduce app switching for better focus");
    }

    return {
      focusScore,
      distractionApps: distractionApps.slice(0, 3), // Top 3 distraction apps
      productiveApps: productiveApps.slice(0, 3), // Top 3 productive apps
      recommendations,
    };
  }
}

// Export singleton instance
export const applicationTrackingService = new ApplicationTrackingService();
