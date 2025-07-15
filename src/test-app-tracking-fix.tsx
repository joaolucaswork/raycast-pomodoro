/**
 * Test command to verify the application tracking fix for Windows
 */

import { List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { applicationTrackingService } from "./services/tracking/application-tracking-service";

interface TestResult {
  isSupported: boolean;
  message?: string;
  error?: string;
}

export default function TestAppTrackingFix() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runTest = async () => {
      try {
        console.log("🧪 Testing application tracking support...");
        
        const result = await applicationTrackingService.testApplicationTrackingSupport();
        
        setTestResult({
          isSupported: result.isSupported,
          message: result.message,
        });
        
        if (result.isSupported) {
          await showToast({
            style: Toast.Style.Success,
            title: "Application Tracking Supported",
            message: "The fix is working correctly!",
          });
        } else {
          await showToast({
            style: Toast.Style.Failure,
            title: "Application Tracking Not Supported",
            message: result.message || "Platform limitation detected",
          });
        }
      } catch (error) {
        console.error("Test failed:", error);
        
        setTestResult({
          isSupported: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        
        await showToast({
          style: Toast.Style.Failure,
          title: "Test Failed",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    runTest();
  }, []);

  const runFullTest = async () => {
    try {
      await showToast({
        style: Toast.Style.Animated,
        title: "Running Full Test",
        message: "Testing application tracking for 10 seconds...",
      });

      // Start tracking
      applicationTrackingService.startTracking(2);
      
      // Wait 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Stop tracking and get results
      const usage = applicationTrackingService.stopTracking();
      const stats = applicationTrackingService.getTrackingStats();
      const health = applicationTrackingService.getTrackingHealth();
      
      console.log("Full test results:");
      console.log(`Applications tracked: ${usage.length}`);
      console.log(`Session duration: ${stats.sessionDuration}s`);
      console.log(`Tracking accuracy: ${stats.trackingAccuracy}%`);
      console.log(`Health status: ${health.isHealthy ? "Healthy" : "Issues detected"}`);
      console.log(`Error count: ${health.errorCount}`);
      
      await showToast({
        style: Toast.Style.Success,
        title: "Full Test Complete",
        message: `Tracked ${usage.length} applications successfully`,
      });
    } catch (error) {
      console.error("Full test failed:", error);
      
      await showToast({
        style: Toast.Style.Failure,
        title: "Full Test Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Application Tracking Support Test"
        subtitle={
          testResult
            ? testResult.isSupported
              ? "✅ Supported"
              : "❌ Not Supported"
            : "Testing..."
        }
        accessories={[
          {
            text: testResult?.isSupported ? "Working" : "Issues Detected",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Run Full Test"
              onAction={runFullTest}
            />
            <Action.CopyToClipboard
              title="Copy Test Results"
              content={JSON.stringify(testResult, null, 2)}
            />
          </ActionPanel>
        }
      />
      
      {testResult?.message && (
        <List.Item
          title="Support Message"
          subtitle={testResult.message}
        />
      )}
      
      {testResult?.error && (
        <List.Item
          title="Error Details"
          subtitle={testResult.error}
        />
      )}
      
      <List.Item
        title="Platform Information"
        subtitle={`Platform: ${process.platform}, Node: ${process.version}`}
      />
    </List>
  );
}
