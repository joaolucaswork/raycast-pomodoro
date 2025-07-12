/**
 * Manual test script for Application Tracking
 *
 * This script can be run to manually test the application tracking functionality
 * in a real Raycast environment.
 */

import { applicationTrackingService } from "../services/application-tracking-service";
import { showToast, Toast } from "@raycast/api";

export async function testApplicationTracking() {
  console.log("🧪 Starting Application Tracking Test...");

  try {
    // Test 1: Basic start/stop functionality
    console.log("\n📋 Test 1: Basic Start/Stop Functionality");

    const initialState = applicationTrackingService.isCurrentlyTracking();
    console.log(`Initial tracking state: ${initialState}`);

    applicationTrackingService.startTracking(2); // 2 second interval
    const afterStart = applicationTrackingService.isCurrentlyTracking();
    console.log(`After start: ${afterStart}`);

    if (!afterStart) {
      throw new Error("Failed to start tracking");
    }

    // Test 2: Data collection
    console.log("\n📋 Test 2: Data Collection (10 seconds)");
    console.log("Please switch between different applications...");

    await showToast({
      style: Toast.Style.Animated,
      title: "Testing Application Tracking",
      message: "Switch between apps for 10 seconds",
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Test 3: Data retrieval and analysis
    console.log("\n📋 Test 3: Data Retrieval and Analysis");

    const usage = applicationTrackingService.getCurrentUsageData();
    const stats = applicationTrackingService.getTrackingStats();
    const health = applicationTrackingService.getTrackingHealth();
    const insights = applicationTrackingService.getProductivityInsights();
    const currentApp = applicationTrackingService.getCurrentApplication();

    console.log("\n📊 Results:");
    console.log(`Applications tracked: ${usage.length}`);
    console.log(`Current application: ${currentApp?.name || "None detected"}`);
    console.log(`Session duration: ${stats.sessionDuration}s`);
    console.log(`Total tracking time: ${stats.sessionDuration}s`);
    console.log(`Tracking accuracy: ${stats.trackingAccuracy}%`);
    console.log(`Average time per app: ${stats.averageTimePerApp}s`);

    console.log("\n🏥 Health Status:");
    console.log(
      `Status: ${health.isHealthy ? "✅ Healthy" : "⚠️ Issues detected"}`,
    );
    console.log(`Error count: ${health.errorCount}`);
    console.log(`Uptime: ${Math.floor(health.uptime / 1000)}s`);
    if (health.lastError) {
      console.log(`Last error: ${health.lastError}`);
    }

    if (usage.length > 0) {
      console.log("\n📱 Application Usage:");
      usage.forEach((app, index) => {
        console.log(`${index + 1}. ${app.name}`);
        console.log(`   Bundle ID: ${app.bundleId}`);
        console.log(`   Time spent: ${app.timeSpent}s`);
        console.log(`   Percentage: ${app.percentage}%`);
        console.log("");
      });

      const mostUsed = applicationTrackingService.getMostUsedApplication();
      if (mostUsed) {
        console.log(
          `🏆 Most used application: ${mostUsed.name} (${mostUsed.timeSpent}s)`,
        );
      }
    } else {
      console.log("⚠️ No application usage data collected");
    }

    console.log("\n🎯 Productivity Insights:");
    console.log(`Focus score: ${insights.focusScore}%`);
    console.log(`Productive apps: ${insights.productiveApps.length}`);
    console.log(`Distraction apps: ${insights.distractionApps.length}`);

    if (insights.productiveApps.length > 0) {
      console.log("\n💼 Top Productive Apps:");
      insights.productiveApps.forEach((app, index) => {
        console.log(
          `${index + 1}. ${app.name}: ${app.timeSpent}s (${app.percentage}%)`,
        );
      });
    }

    if (insights.distractionApps.length > 0) {
      console.log("\n🎮 Potential Distractions:");
      insights.distractionApps.forEach((app, index) => {
        console.log(
          `${index + 1}. ${app.name}: ${app.timeSpent}s (${app.percentage}%)`,
        );
      });
    }

    if (insights.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      insights.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Test 4: Stop tracking
    console.log("\n📋 Test 4: Stop Tracking");
    applicationTrackingService.stopTracking();
    const afterStop = applicationTrackingService.isCurrentlyTracking();
    console.log(`After stop: ${afterStop}`);

    if (afterStop) {
      throw new Error("Failed to stop tracking");
    }

    // Test 5: Error handling simulation
    console.log("\n📋 Test 5: Error Handling");
    console.log("Testing error recovery...");

    // Start tracking again to test error recovery
    applicationTrackingService.startTracking(1);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const finalHealth = applicationTrackingService.getTrackingHealth();
    console.log(
      `Final health status: ${finalHealth.isHealthy ? "Healthy" : "Issues detected"}`,
    );
    console.log(`Final error count: ${finalHealth.errorCount}`);

    applicationTrackingService.stopTracking();

    await showToast({
      style: Toast.Style.Success,
      title: "Application Tracking Test Complete",
      message: `Tracked ${usage.length} applications successfully`,
    });

    console.log("\n✅ All tests completed successfully!");

    return {
      success: true,
      applicationsTracked: usage.length,
      sessionDuration: stats.sessionDuration,
      trackingAccuracy: stats.trackingAccuracy,
      healthStatus: health.isHealthy,
      errorCount: health.errorCount,
      focusScore: insights.focusScore,
    };
  } catch (error) {
    console.error("\n❌ Test failed:", error);

    // Ensure tracking is stopped
    applicationTrackingService.stopTracking();

    await showToast({
      style: Toast.Style.Failure,
      title: "Application Tracking Test Failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Test scenarios for different edge cases
export const testScenarios = {
  // Test rapid application switching
  rapidSwitching: async () => {
    console.log("🔄 Testing rapid application switching...");
    applicationTrackingService.startTracking(0.5); // Very fast tracking

    await showToast({
      style: Toast.Style.Animated,
      title: "Rapid Switching Test",
      message: "Quickly switch between apps for 5 seconds",
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const usage = applicationTrackingService.getCurrentUsageData();
    applicationTrackingService.stopTracking();

    console.log(`Rapid switching test: ${usage.length} apps tracked`);
    return usage.length;
  },

  // Test long session tracking
  longSession: async () => {
    console.log("⏰ Testing long session tracking...");
    applicationTrackingService.startTracking(5); // Normal interval

    await showToast({
      style: Toast.Style.Animated,
      title: "Long Session Test",
      message: "Stay in one app for 30 seconds",
    });

    await new Promise((resolve) => setTimeout(resolve, 30000));

    const stats = applicationTrackingService.getTrackingStats();
    applicationTrackingService.stopTracking();

    console.log(
      `Long session test: ${stats.sessionDuration}s duration, ${stats.trackingAccuracy}% accuracy`,
    );
    return stats.trackingAccuracy;
  },

  // Test tracking with no application switches
  noSwitching: async () => {
    console.log("🎯 Testing single application focus...");
    applicationTrackingService.startTracking(2);

    await showToast({
      style: Toast.Style.Animated,
      title: "Focus Test",
      message: "Stay focused in one app for 15 seconds",
    });

    await new Promise((resolve) => setTimeout(resolve, 15000));

    const usage = applicationTrackingService.getCurrentUsageData();
    const insights = applicationTrackingService.getProductivityInsights();
    applicationTrackingService.stopTracking();

    console.log(
      `Focus test: ${usage.length} apps, ${insights.focusScore}% focus score`,
    );
    return insights.focusScore;
  },
};

// Export for use in Raycast commands
export default testApplicationTracking;
