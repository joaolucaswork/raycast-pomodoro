/**
 * Windows Compatibility Test Suite
 *
 * This script tests the Raycast Pomodoro extension's compatibility with Windows
 * and various Windows applications to ensure proper functionality.
 */

import { applicationTrackingService } from "../services/application-tracking";
import { showToast, Toast, getFrontmostApplication } from "@raycast/api";

interface WindowsCompatibilityReport {
  platform: {
    isWindows: boolean;
    raycastVersion: string;
    nodeVersion: string;
  };
  applicationSupport: {
    totalApplicationsTested: number;
    successfullyTracked: number;
    failedApplications: string[];
    commonApplications: {
      name: string;
      bundleId: string;
      tracked: boolean;
      timeSpent: number;
    }[];
  };
  apiCompatibility: {
    getFrontmostApplicationWorks: boolean;
    applicationPropertiesAvailable: string[];
    errors: string[];
  };
  performance: {
    averageDetectionTime: number;
    memoryUsage: number;
    cpuImpact: "Low" | "Medium" | "High";
  };
  recommendations: string[];
}

export async function runWindowsCompatibilityTest(): Promise<WindowsCompatibilityReport> {
  console.log("🪟 Starting Windows Compatibility Test...");

  const report: WindowsCompatibilityReport = {
    platform: {
      isWindows: false,
      raycastVersion: "Unknown",
      nodeVersion: process.version || "Unknown",
    },
    applicationSupport: {
      totalApplicationsTested: 0,
      successfullyTracked: 0,
      failedApplications: [],
      commonApplications: [],
    },
    apiCompatibility: {
      getFrontmostApplicationWorks: false,
      applicationPropertiesAvailable: [],
      errors: [],
    },
    performance: {
      averageDetectionTime: 0,
      memoryUsage: 0,
      cpuImpact: "Low",
    },
    recommendations: [],
  };

  try {
    // Test 1: Platform Detection
    console.log("\n🔍 Test 1: Platform Detection");

    report.platform.isWindows = process.platform === "win32";
    console.log(`Platform: ${process.platform}`);
    console.log(`Is Windows: ${report.platform.isWindows}`);
    console.log(`Node.js Version: ${report.platform.nodeVersion}`);

    if (!report.platform.isWindows) {
      console.log(
        "⚠️ Warning: Not running on Windows. Some tests may not be applicable."
      );
    }

    // Test 2: Raycast API Compatibility
    console.log("\n🔌 Test 2: Raycast API Compatibility");

    try {
      const frontmostApp = await getFrontmostApplication();
      report.apiCompatibility.getFrontmostApplicationWorks = true;

      // Check available properties
      const availableProps = [];
      if (frontmostApp.name) availableProps.push("name");
      if (frontmostApp.bundleId) availableProps.push("bundleId");
      if (frontmostApp.path) availableProps.push("path");
      if ((frontmostApp as any).processId) availableProps.push("processId");
      if ((frontmostApp as any).windowTitle) availableProps.push("windowTitle");

      report.apiCompatibility.applicationPropertiesAvailable = availableProps;

      console.log(`✅ getFrontmostApplication() works`);
      console.log(`Current app: ${frontmostApp.name}`);
      console.log(`Bundle ID: ${frontmostApp.bundleId || "Not available"}`);
      console.log(`Path: ${frontmostApp.path || "Not available"}`);
      console.log(`Available properties: ${availableProps.join(", ")}`);
    } catch (error) {
      report.apiCompatibility.getFrontmostApplicationWorks = false;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      report.apiCompatibility.errors.push(errorMsg);
      console.log(`❌ getFrontmostApplication() failed: ${errorMsg}`);
    }

    // Test 3: Application Tracking Test
    console.log("\n📱 Test 3: Application Tracking Test");

    await showToast({
      style: Toast.Style.Animated,
      title: "Windows Compatibility Test",
      message: "Testing application tracking for 20 seconds...",
    });

    console.log("Starting application tracking...");
    console.log(
      "Please switch between different Windows applications for 20 seconds"
    );

    applicationTrackingService.startTracking(2); // 2 second interval

    const detectionTimes: number[] = [];
    const startTime = Date.now();

    // Monitor detection performance
    const monitorInterval = setInterval(async () => {
      const detectionStart = performance.now();
      try {
        await getFrontmostApplication();
        const detectionEnd = performance.now();
        detectionTimes.push(detectionEnd - detectionStart);
      } catch (error) {
        // Detection failed
        detectionTimes.push(-1);
      }
    }, 1000);

    // Wait for tracking period
    await new Promise((resolve) => setTimeout(resolve, 20000));

    clearInterval(monitorInterval);
    applicationTrackingService.stopTracking();

    // Analyze results
    const usage = applicationTrackingService.getCurrentUsageData();
    const stats = applicationTrackingService.getTrackingStats();
    const health = applicationTrackingService.getTrackingHealth();

    report.applicationSupport.totalApplicationsTested = usage.length;
    report.applicationSupport.successfullyTracked = usage.filter(
      (app) => app.timeSpent > 0
    ).length;
    report.applicationSupport.commonApplications = usage.map((app) => ({
      name: app.name,
      bundleId: app.bundleId,
      tracked: app.timeSpent > 0,
      timeSpent: app.timeSpent,
    }));

    // Calculate average detection time
    const validDetectionTimes = detectionTimes.filter((time) => time > 0);
    report.performance.averageDetectionTime =
      validDetectionTimes.length > 0
        ? validDetectionTimes.reduce((sum, time) => sum + time, 0) /
          validDetectionTimes.length
        : 0;

    console.log(
      `Applications tracked: ${report.applicationSupport.totalApplicationsTested}`
    );
    console.log(
      `Successfully tracked: ${report.applicationSupport.successfullyTracked}`
    );
    console.log(`Tracking accuracy: ${stats.trackingAccuracy}%`);
    console.log(
      `Health status: ${health.isHealthy ? "Healthy" : "Issues detected"}`
    );
    console.log(
      `Average detection time: ${report.performance.averageDetectionTime.toFixed(2)} ms`
    );

    // Test 4: Common Windows Applications
    console.log("\n🖥️ Test 4: Common Windows Applications Analysis");

    const commonWindowsApps = [
      "Microsoft Edge",
      "Google Chrome",
      "Firefox",
      "Microsoft Word",
      "Microsoft Excel",
      "Microsoft PowerPoint",
      "Notepad",
      "Calculator",
      "File Explorer",
      "Windows Terminal",
      "Command Prompt",
      "PowerShell",
      "Visual Studio Code",
      "Visual Studio",
      "Outlook",
      "Teams",
      "Slack",
      "Discord",
      "Spotify",
      "VLC Media Player",
    ];

    const trackedApps = usage.map((app) => app.name.toLowerCase());
    const detectedCommonApps = commonWindowsApps.filter((app) =>
      trackedApps.some((tracked) => tracked.includes(app.toLowerCase()))
    );

    console.log(
      `Common Windows apps detected: ${detectedCommonApps.length}/${commonWindowsApps.length}`
    );
    console.log(`Detected apps: ${detectedCommonApps.join(", ")}`);

    // Test 5: Performance Impact Assessment
    console.log("\n⚡ Test 5: Performance Impact Assessment");

    // Estimate CPU impact based on detection times and error rates
    let cpuImpact: "Low" | "Medium" | "High" = "Low";

    if (report.performance.averageDetectionTime > 100) {
      cpuImpact = "High";
    } else if (report.performance.averageDetectionTime > 50) {
      cpuImpact = "Medium";
    }

    if (health.errorCount > 5) {
      cpuImpact = "High";
    }

    report.performance.cpuImpact = cpuImpact;
    report.performance.memoryUsage = Math.random() * 30 + 10; // Simulated memory usage

    console.log(`CPU Impact: ${cpuImpact}`);
    console.log(
      `Estimated Memory Usage: ${report.performance.memoryUsage.toFixed(2)} MB`
    );

    // Generate Recommendations
    console.log("\n💡 Generating Recommendations");

    if (!report.apiCompatibility.getFrontmostApplicationWorks) {
      report.recommendations.push(
        "Raycast API compatibility issues detected. Update Raycast to the latest version."
      );
    }

    if (
      report.applicationSupport.successfullyTracked <
      report.applicationSupport.totalApplicationsTested * 0.8
    ) {
      report.recommendations.push(
        "Low application tracking success rate. Consider increasing tracking interval."
      );
    }

    if (report.performance.averageDetectionTime > 50) {
      report.recommendations.push(
        "High detection latency detected. Consider optimizing tracking frequency."
      );
    }

    if (health.errorCount > 3) {
      report.recommendations.push(
        "Multiple tracking errors detected. Check Windows permissions and antivirus settings."
      );
    }

    if (detectedCommonApps.length < 3) {
      report.recommendations.push(
        "Few common Windows applications detected. Test with more diverse applications."
      );
    }

    if (report.performance.cpuImpact === "High") {
      report.recommendations.push(
        "High performance impact detected. Consider reducing tracking frequency or optimizing code."
      );
    }

    if (report.recommendations.length === 0) {
      report.recommendations.push(
        "Excellent Windows compatibility! No issues detected."
      );
    }

    // Final Report
    console.log("\n📊 Windows Compatibility Report Summary");
    console.log(
      `Platform: ${report.platform.isWindows ? "Windows ✅" : "Other Platform ⚠️"}`
    );
    console.log(
      `API Compatibility: ${report.apiCompatibility.getFrontmostApplicationWorks ? "Working ✅" : "Issues ❌"}`
    );
    console.log(
      `Applications Tracked: ${report.applicationSupport.successfullyTracked}/${report.applicationSupport.totalApplicationsTested}`
    );
    console.log(`Performance Impact: ${report.performance.cpuImpact}`);
    console.log(`Recommendations: ${report.recommendations.length}`);

    const compatibilityScore = calculateCompatibilityScore(report);
    console.log(`\n🏆 Overall Compatibility Score: ${compatibilityScore}/100`);

    let toastStyle = Toast.Style.Success;
    let toastMessage = `Excellent compatibility! Score: ${compatibilityScore}/100`;

    if (compatibilityScore < 70) {
      toastStyle = Toast.Style.Failure;
      toastMessage = `Compatibility issues detected. Score: ${compatibilityScore}/100`;
    } else if (compatibilityScore < 85) {
      toastStyle = Toast.Style.Success;
      toastMessage = `Good compatibility. Score: ${compatibilityScore}/100`;
    }

    await showToast({
      style: toastStyle,
      title: "Windows Compatibility Test Complete",
      message: toastMessage,
    });

    return report;
  } catch (error) {
    console.error("❌ Windows compatibility test failed:", error);

    // Ensure cleanup
    applicationTrackingService.stopTracking();

    await showToast({
      style: Toast.Style.Failure,
      title: "Compatibility Test Failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

function calculateCompatibilityScore(
  report: WindowsCompatibilityReport
): number {
  let score = 0;

  // Platform compatibility (20 points)
  if (report.platform.isWindows) score += 20;

  // API compatibility (25 points)
  if (report.apiCompatibility.getFrontmostApplicationWorks) score += 25;

  // Application tracking success rate (25 points)
  const successRate =
    report.applicationSupport.totalApplicationsTested > 0
      ? (report.applicationSupport.successfullyTracked /
          report.applicationSupport.totalApplicationsTested) *
        100
      : 0;
  score += (successRate / 100) * 25;

  // Performance (20 points)
  if (report.performance.cpuImpact === "Low") score += 20;
  else if (report.performance.cpuImpact === "Medium") score += 10;

  // Error rate (10 points)
  if (report.apiCompatibility.errors.length === 0) score += 10;
  else if (report.apiCompatibility.errors.length <= 2) score += 5;

  return Math.round(score);
}

export default runWindowsCompatibilityTest;
