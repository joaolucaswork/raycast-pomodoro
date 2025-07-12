import { ActionPanel, Action, List, showToast, Toast, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { applicationTrackingService } from "./services/application-tracking-service";
import { getFrontmostApplication } from "@raycast/api";

interface DiagnosticData {
  isTracking: boolean;
  currentApp: string | null;
  errorCount: number;
  lastError?: string;
  totalApps: number;
  uptime: number;
  lastCapture: string;
}

export default function DebugAppTracking() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData>({
    isTracking: false,
    currentApp: null,
    errorCount: 0,
    totalApps: 0,
    uptime: 0,
    lastCapture: "Never",
  });
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Update diagnostics every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const health = applicationTrackingService.getTrackingHealth();
        const currentApp = applicationTrackingService.getCurrentApplication();
        const usageData = applicationTrackingService.getCurrentUsageData();
        
        setDiagnostics({
          isTracking: applicationTrackingService.isCurrentlyTracking(),
          currentApp: currentApp?.name || null,
          errorCount: health.errorCount,
          lastError: health.lastError,
          totalApps: usageData.length,
          uptime: Math.floor(health.uptime / 1000),
          lastCapture: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        console.error("Diagnostics update failed:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startTest = async () => {
    try {
      setIsTestRunning(true);
      console.log("[Debug] Starting application tracking test...");
      
      await showToast({
        style: Toast.Style.Animated,
        title: "Starting App Tracking Test",
        message: "Switch between apps for 30 seconds",
      });

      applicationTrackingService.startTracking(2); // 2-second interval for testing
      
      // Run test for 30 seconds
      setTimeout(async () => {
        const usageData = applicationTrackingService.stopTracking();
        setIsTestRunning(false);
        
        await showToast({
          style: Toast.Style.Success,
          title: "Test Complete",
          message: `Tracked ${usageData.length} applications`,
        });
        
        console.log("[Debug] Test completed. Usage data:", usageData);
      }, 30000);
      
    } catch (error) {
      setIsTestRunning(false);
      await showToast({
        style: Toast.Style.Failure,
        title: "Test Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const stopTest = () => {
    applicationTrackingService.stopTracking();
    setIsTestRunning(false);
  };

  const testSingleCapture = async () => {
    try {
      console.log("[Debug] Testing single application capture...");
      const app = await getFrontmostApplication();
      
      await showToast({
        style: Toast.Style.Success,
        title: "Single Capture Success",
        message: `Current app: ${app.name}`,
      });
      
      console.log("[Debug] Single capture result:", {
        name: app.name,
        bundleId: app.bundleId,
        path: app.path,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Single Capture Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      console.error("[Debug] Single capture failed:", error);
    }
  };

  return (
    <List>
      <List.Section title="Application Tracking Diagnostics">
        <List.Item
          title="Tracking Status"
          subtitle={diagnostics.isTracking ? "Active" : "Inactive"}
          icon={diagnostics.isTracking ? Icon.Play : Icon.Stop}
          accessories={[
            { text: diagnostics.isTracking ? "Running" : "Stopped" },
          ]}
        />
        
        <List.Item
          title="Current Application"
          subtitle={diagnostics.currentApp || "None detected"}
          icon={Icon.Desktop}
          accessories={[
            { text: diagnostics.lastCapture },
          ]}
        />
        
        <List.Item
          title="Error Count"
          subtitle={`${diagnostics.errorCount} errors`}
          icon={diagnostics.errorCount > 0 ? Icon.ExclamationMark : Icon.CheckCircle}
          accessories={[
            { text: diagnostics.errorCount > 0 ? "Issues" : "Healthy" },
          ]}
        />
        
        {diagnostics.lastError && (
          <List.Item
            title="Last Error"
            subtitle={diagnostics.lastError}
            icon={Icon.Warning}
          />
        )}
        
        <List.Item
          title="Applications Tracked"
          subtitle={`${diagnostics.totalApps} applications`}
          icon={Icon.List}
          accessories={[
            { text: `${diagnostics.totalApps}` },
          ]}
        />
        
        <List.Item
          title="Uptime"
          subtitle={`${diagnostics.uptime} seconds`}
          icon={Icon.Clock}
          accessories={[
            { text: `${diagnostics.uptime}s` },
          ]}
        />
      </List.Section>

      <List.Section title="Test Actions">
        <List.Item
          title="Start 30-Second Test"
          subtitle="Track applications for 30 seconds"
          icon={Icon.Play}
          actions={
            <ActionPanel>
              <Action
                title="Start Test"
                onAction={startTest}
                icon={Icon.Play}
              />
            </ActionPanel>
          }
        />
        
        <List.Item
          title="Test Single Capture"
          subtitle="Test getFrontmostApplication() once"
          icon={Icon.Eye}
          actions={
            <ActionPanel>
              <Action
                title="Test Capture"
                onAction={testSingleCapture}
                icon={Icon.Eye}
              />
            </ActionPanel>
          }
        />
        
        {isTestRunning && (
          <List.Item
            title="Stop Current Test"
            subtitle="Stop the running test"
            icon={Icon.Stop}
            actions={
              <ActionPanel>
                <Action
                  title="Stop Test"
                  onAction={stopTest}
                  icon={Icon.Stop}
                />
              </ActionPanel>
            }
          />
        )}
      </List.Section>
    </List>
  );
}
