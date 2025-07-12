import { useState, useEffect } from "react";
import { applicationTrackingService } from "../../../services/application-tracking";
import { SessionType } from "../../../types/timer";

/**
 * Custom hook for managing application tracking in the main command
 */
export function useAppTracking(
  isRunning: boolean,
  currentSessionType?: SessionType
) {
  const [currentAppName, setCurrentAppName] = useState<string | null>(null);
  const [currentAppBundleId, setCurrentAppBundleId] = useState<string | null>(
    null
  );
  const [isAppTrackingActive, setIsAppTrackingActive] = useState(false);

  // Update current application display when tracking is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateCurrentApp = () => {
      try {
        // If we should be tracking but aren't, try to restart tracking
        if (isRunning && currentSessionType === SessionType.WORK) {
          applicationTrackingService.ensureTrackingActive(5);
        }

        const isTracking = applicationTrackingService.isCurrentlyTracking();
        const currentApp = applicationTrackingService.getCurrentApplication();

        setIsAppTrackingActive(isTracking);
        setCurrentAppName(currentApp?.name || null);
        setCurrentAppBundleId(currentApp?.bundleId || null);

        // Debug logging to help troubleshoot
        if (isRunning && currentSessionType === SessionType.WORK) {
          console.log(
            `[useAppTracking] isTracking: ${isTracking}, currentApp: ${currentApp?.name || "none"}`
          );
        }
      } catch (error) {
        console.error("[useAppTracking] Error updating current app:", error);
        setIsAppTrackingActive(false);
        setCurrentAppName(null);
        setCurrentAppBundleId(null);
      }
    };

    // Update immediately
    updateCurrentApp();

    // Update every 2 seconds when we should be tracking
    // This helps recover from service state issues after extension reload
    if (isRunning && currentSessionType === SessionType.WORK) {
      interval = setInterval(updateCurrentApp, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, currentSessionType]);

  return {
    currentAppName,
    currentAppBundleId,
    isAppTrackingActive,
  };
}
