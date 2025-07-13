import { SessionType } from "../../types/timer";
import { TestNotificationType } from "./notification-types";
import { notificationCore } from "./notification-core";
import { sessionNotifications } from "./session-notifications";
import { adhdNotifications } from "./adhd-notifications";

/**
 * Notification testing service for debugging and validation.
 * 
 * Handles:
 * - Test notification generation
 * - Notification system validation
 * - Debug utilities
 */
export class NotificationTesting {
  private static instance: NotificationTesting;

  private constructor() {}

  public static getInstance(): NotificationTesting {
    if (!NotificationTesting.instance) {
      NotificationTesting.instance = new NotificationTesting();
    }
    return NotificationTesting.instance;
  }

  public async testNotification(
    type: TestNotificationType = "basic",
  ): Promise<void> {
    console.log(`Testing notification type: ${type}`);

    switch (type) {
      case "basic":
        await notificationCore.showSystemNotification(
          "Test Notification",
          "This is a test notification to verify the system is working.",
          {
            tag: "test-notification",
            requireInteraction: false,
            silent: false,
          },
        );
        break;

      case "session-complete":
        await sessionNotifications.notifySessionComplete(SessionType.WORK, false);
        break;

      case "achievement":
        await adhdNotifications.notifyAchievementUnlocked("Test Achievement", 50);
        break;

      case "hyperfocus":
        await adhdNotifications.notifyHyperfocusDetected(3, 2.5);
        break;
    }
  }

  public async testAllNotificationTypes(): Promise<void> {
    console.log("Testing all notification types...");

    // Test basic notification
    await this.testNotification("basic");
    await this.delay(2000);

    // Test session notifications
    await sessionNotifications.notifySessionStart(SessionType.WORK, "Test Task");
    await this.delay(2000);

    await sessionNotifications.notifySessionComplete(SessionType.WORK, false);
    await this.delay(2000);

    // Test transition warning
    await sessionNotifications.notifyTransitionWarning(5, SessionType.WORK);
    await this.delay(2000);

    // Test ADHD notifications
    await adhdNotifications.notifyPointsEarned(25, "Completed focus session");
    await this.delay(2000);

    await adhdNotifications.notifyAchievementUnlocked("First Session", 10);
    await this.delay(2000);

    await adhdNotifications.notifyLevelUp(2);
    await this.delay(2000);

    await adhdNotifications.notifyHyperfocusDetected(4, 3.0);
    await this.delay(2000);

    console.log("All notification tests completed");
  }

  public async validateNotificationSystem(): Promise<{
    isWorking: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let isWorking = true;

    try {
      // Check notification core status
      const status = notificationCore.getNotificationStatus();
      
      if (!status.browserAPIAvailable && !status.electronAPIAvailable) {
        issues.push("No system notification APIs available");
        suggestions.push("Using Raycast native notifications as fallback");
      }

      if (!status.permissionGranted && status.browserAPIAvailable) {
        issues.push("Notification permission not granted");
        suggestions.push("Request notification permission for better experience");
      }

      if (status.lastError) {
        issues.push(`Last error: ${status.lastError}`);
        suggestions.push("Check console for detailed error information");
      }

      // Test basic notification functionality
      try {
        await notificationCore.showEnhancedRaycastNotification(
          "System Test",
          "Testing notification system",
          "info"
        );
      } catch (error) {
        issues.push("Failed to show basic notification");
        suggestions.push("Check Raycast API availability");
        isWorking = false;
      }

      // Add general suggestions
      if (issues.length === 0) {
        suggestions.push("Notification system is working correctly");
      } else {
        suggestions.push(...notificationCore.getAlternativeNotificationSuggestions());
      }

    } catch (error) {
      issues.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      isWorking = false;
    }

    return {
      isWorking,
      issues,
      suggestions,
    };
  }

  public async benchmarkNotificationPerformance(): Promise<{
    averageTime: number;
    successRate: number;
    totalTests: number;
  }> {
    const testCount = 10;
    const times: number[] = [];
    let successCount = 0;

    for (let i = 0; i < testCount; i++) {
      const startTime = performance.now();
      
      try {
        await notificationCore.showEnhancedRaycastNotification(
          `Performance Test ${i + 1}`,
          "Testing notification performance",
          "info"
        );
        successCount++;
      } catch (error) {
        console.warn(`Performance test ${i + 1} failed:`, error);
      }

      const endTime = performance.now();
      times.push(endTime - startTime);

      // Small delay between tests
      await this.delay(100);
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const successRate = (successCount / testCount) * 100;

    return {
      averageTime: Math.round(averageTime * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      totalTests: testCount,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getNotificationSystemInfo(): {
    coreStatus: any;
    capabilities: string[];
    recommendations: string[];
  } {
    const status = notificationCore.getNotificationStatus();
    const capabilities: string[] = [];
    const recommendations: string[] = [];

    // Determine capabilities
    if (status.browserAPIAvailable) {
      capabilities.push("Browser Notification API");
    }
    if (status.electronAPIAvailable) {
      capabilities.push("Electron Notification API");
    }
    capabilities.push("Raycast Toast Notifications");
    capabilities.push("Raycast HUD Notifications");

    // Generate recommendations
    if (!status.permissionGranted && status.browserAPIAvailable) {
      recommendations.push("Grant notification permission for system notifications");
    }
    if (!status.browserAPIAvailable && !status.electronAPIAvailable) {
      recommendations.push("System notifications not available - using Raycast native notifications");
    }
    recommendations.push("Enable debug mode for detailed notification logging");

    return {
      coreStatus: status,
      capabilities,
      recommendations,
    };
  }
}

export const notificationTesting = NotificationTesting.getInstance();
