import { ApplicationUsage } from "../../types/timer";
import {
  ApplicationTrackingData,
  ApplicationTrackingStats,
  TrackingHealth,
  ProductivityInsights,
  isProductiveApplication,
  isDistractionApplication,
  getApplicationCategory,
} from "./application-tracking-types";

/**
 * Analytics and insights module for application tracking data.
 *
 * This module provides:
 * - Statistical analysis of application usage
 * - Productivity insights and focus scoring
 * - Health monitoring and error tracking
 * - Data transformation and reporting
 */
export class ApplicationTrackingAnalytics {
  /**
   * Generate comprehensive tracking statistics
   */
  generateTrackingStats(
    trackingData: ApplicationTrackingData
  ): ApplicationTrackingStats {
    const usageArray = this.getApplicationUsageArray(trackingData);
    const sessionDuration =
      trackingData.sessionStartTime > 0
        ? Math.floor((Date.now() - trackingData.sessionStartTime) / 1000)
        : 0;

    const totalApplications = usageArray.length;
    const mostUsedApplication = usageArray.length > 0 ? usageArray[0] : null;
    const leastUsedApplication =
      usageArray.length > 0 ? usageArray[usageArray.length - 1] : null;

    const totalUsageTime = usageArray.reduce(
      (sum, app) => sum + app.timeSpent,
      0
    );
    const averageTimePerApp =
      totalApplications > 0 ? totalUsageTime / totalApplications : 0;

    // Calculate tracking accuracy
    const expectedTrackingTime = sessionDuration;
    const actualTrackingTime = totalUsageTime;
    const trackingAccuracy =
      expectedTrackingTime > 0
        ? Math.min(100, (actualTrackingTime / expectedTrackingTime) * 100)
        : 0;

    return {
      totalApplications,
      mostUsedApplication,
      leastUsedApplication,
      averageTimePerApp,
      sessionDuration,
      trackingAccuracy,
    };
  }

  /**
   * Generate productivity insights based on application usage
   */
  generateProductivityInsights(
    trackingData: ApplicationTrackingData
  ): ProductivityInsights {
    const usageArray = this.getApplicationUsageArray(trackingData);

    // Categorize applications
    const productiveApps: ApplicationUsage[] = [];
    const distractionApps: ApplicationUsage[] = [];
    const neutralApps: ApplicationUsage[] = [];

    for (const app of usageArray) {
      if (isProductiveApplication(app.bundleId)) {
        productiveApps.push(app);
      } else if (isDistractionApplication(app.bundleId)) {
        distractionApps.push(app);
      } else {
        neutralApps.push(app);
      }
    }

    // Calculate focus score (0-100)
    const totalTime = usageArray.reduce((sum, app) => sum + app.timeSpent, 0);
    const productiveTime = productiveApps.reduce(
      (sum, app) => sum + app.timeSpent,
      0
    );
    const distractionTime = distractionApps.reduce(
      (sum, app) => sum + app.timeSpent,
      0
    );

    let focusScore = 0;
    if (totalTime > 0) {
      const productiveRatio = productiveTime / totalTime;
      const distractionPenalty = (distractionTime / totalTime) * 0.5;
      focusScore = Math.max(
        0,
        Math.min(100, (productiveRatio - distractionPenalty) * 100)
      );
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      usageArray,
      productiveApps,
      distractionApps,
      focusScore
    );

    return {
      focusScore: Math.round(focusScore),
      distractionApps: distractionApps.slice(0, 3), // Top 3 distraction apps
      productiveApps: productiveApps.slice(0, 3), // Top 3 productive apps
      recommendations,
    };
  }

  /**
   * Get tracking health status
   */
  getTrackingHealth(trackingData: ApplicationTrackingData): TrackingHealth {
    const sessionDuration =
      trackingData.sessionStartTime > 0
        ? Math.floor((Date.now() - trackingData.sessionStartTime) / 1000)
        : 0;

    // Calculate success rate based on error frequency
    const totalAttempts = Math.max(1, Math.floor(sessionDuration / 5)); // Assuming 5-second intervals
    const successfulAttempts = Math.max(
      0,
      totalAttempts - trackingData.errorCount
    );
    const successRate = (successfulAttempts / totalAttempts) * 100;

    // Consider healthy if success rate > 90% and error count is reasonable
    const isHealthy = successRate > 90 && trackingData.errorCount < 10;

    return {
      isHealthy,
      errorCount: trackingData.errorCount,
      lastError: trackingData.lastError,
      successRate: Math.round(successRate),
      uptime: Date.now() - trackingData.sessionStartTime,
    };
  }

  /**
   * Get application usage array sorted by time spent (descending)
   */
  getApplicationUsageArray(
    trackingData: ApplicationTrackingData
  ): ApplicationUsage[] {
    // Ensure current app time is up to date
    this.updateCurrentApplicationTime(trackingData);

    const usageArray = Array.from(trackingData.applications.values());

    // Sort by time spent (descending)
    return usageArray.sort((a, b) => b.timeSpent - a.timeSpent);
  }

  /**
   * Get the most used application
   */
  getMostUsedApplication(
    trackingData: ApplicationTrackingData
  ): ApplicationUsage | null {
    const usageArray = this.getApplicationUsageArray(trackingData);
    return usageArray.length > 0 ? usageArray[0] : null;
  }

  /**
   * Get total tracking time
   */
  getTotalTrackingTime(trackingData: ApplicationTrackingData): number {
    return trackingData.totalTrackingTime;
  }

  /**
   * Update the time spent on the current application
   */
  private updateCurrentApplicationTime(
    trackingData: ApplicationTrackingData
  ): void {
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
      }

      trackingData.totalTrackingTime += timeDelta;
      trackingData.lastUpdateTime = now;
    }
  }

  /**
   * Generate personalized recommendations based on usage patterns
   */
  private generateRecommendations(
    usageArray: ApplicationUsage[],
    productiveApps: ApplicationUsage[],
    distractionApps: ApplicationUsage[],
    focusScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Focus score based recommendations
    if (focusScore < 30) {
      recommendations.push(
        "Consider using website blockers during work sessions"
      );
      recommendations.push(
        "Try the Pomodoro technique with shorter, more focused intervals"
      );
    } else if (focusScore < 60) {
      recommendations.push(
        "Good focus! Try to minimize time in distracting applications"
      );
    } else if (focusScore >= 80) {
      recommendations.push(
        "Excellent focus! You're maintaining great productivity habits"
      );
    }

    // App switching recommendations
    if (usageArray.length > 8) {
      recommendations.push("Try to reduce app switching for better focus");
      recommendations.push(
        "Consider batching similar tasks to minimize context switching"
      );
    }

    // Distraction-specific recommendations
    if (distractionApps.length > 0) {
      const topDistraction = distractionApps[0];
      recommendations.push(
        `Minimize time in ${topDistraction.name} during work sessions`
      );
    }

    // Productivity recommendations
    if (productiveApps.length === 0 && usageArray.length > 0) {
      recommendations.push(
        "Consider using more productivity-focused applications"
      );
    }

    // Time-based recommendations
    const totalTime = usageArray.reduce((sum, app) => sum + app.timeSpent, 0);
    if (totalTime > 0) {
      const avgTimePerApp = totalTime / usageArray.length;
      if (avgTimePerApp < 60) {
        // Less than 1 minute per app
        recommendations.push(
          "Try to spend more focused time in each application"
        );
      }
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  /**
   * Get a unique identifier for an application
   */
  private getApplicationId(app: { bundleId?: string; name: string }): string {
    return app.bundleId || app.name || `unknown-${Date.now()}`;
  }

  /**
   * Generate usage summary for reporting
   */
  generateUsageSummary(trackingData: ApplicationTrackingData): {
    totalApps: number;
    totalTime: number;
    topApps: ApplicationUsage[];
    categoryBreakdown: Record<string, number>;
  } {
    const usageArray = this.getApplicationUsageArray(trackingData);
    const totalTime = usageArray.reduce((sum, app) => sum + app.timeSpent, 0);

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {
      productive: 0,
      communication: 0,
      distraction: 0,
      browsers: 0,
      other: 0,
    };

    for (const app of usageArray) {
      const category = getApplicationCategory(app.bundleId);
      if (category) {
        const categoryKey = category.toLowerCase();
        categoryBreakdown[categoryKey] =
          (categoryBreakdown[categoryKey] || 0) + app.timeSpent;
      } else {
        categoryBreakdown.other += app.timeSpent;
      }
    }

    return {
      totalApps: usageArray.length,
      totalTime,
      topApps: usageArray.slice(0, 5), // Top 5 apps
      categoryBreakdown,
    };
  }

  /**
   * Format time duration for display
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Calculate productivity score based on application categories
   */
  calculateProductivityScore(usageArray: ApplicationUsage[]): {
    score: number;
    breakdown: {
      productive: number;
      neutral: number;
      distraction: number;
    };
  } {
    const totalTime = usageArray.reduce((sum, app) => sum + app.timeSpent, 0);

    if (totalTime === 0) {
      return {
        score: 0,
        breakdown: { productive: 0, neutral: 0, distraction: 0 },
      };
    }

    let productiveTime = 0;
    let distractionTime = 0;
    let neutralTime = 0;

    for (const app of usageArray) {
      if (isProductiveApplication(app.bundleId)) {
        productiveTime += app.timeSpent;
      } else if (isDistractionApplication(app.bundleId)) {
        distractionTime += app.timeSpent;
      } else {
        neutralTime += app.timeSpent;
      }
    }

    const productiveRatio = productiveTime / totalTime;
    const distractionRatio = distractionTime / totalTime;
    const neutralRatio = neutralTime / totalTime;

    // Score calculation: productive time adds to score, distraction time subtracts
    const score = Math.max(
      0,
      Math.min(
        100,
        productiveRatio * 100 + neutralRatio * 50 - distractionRatio * 30
      )
    );

    return {
      score: Math.round(score),
      breakdown: {
        productive: Math.round(productiveRatio * 100),
        neutral: Math.round(neutralRatio * 100),
        distraction: Math.round(distractionRatio * 100),
      },
    };
  }
}

// Export singleton instance
export const applicationTrackingAnalytics = new ApplicationTrackingAnalytics();
