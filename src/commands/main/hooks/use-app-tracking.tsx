import { useState, useEffect } from "react";
import { applicationTrackingService } from "../../../services/application-tracking-service";
import { SessionType } from "../../../types/timer";

/**
 * Custom hook for managing application tracking in the main command
 */
export function useAppTracking(isRunning: boolean, currentSessionType?: SessionType) {
  const [currentAppName, setCurrentAppName] = useState<string | null>(null);
  const [isAppTrackingActive, setIsAppTrackingActive] = useState(false);

  // Update current application display when tracking is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateCurrentApp = () => {
      const isTracking = applicationTrackingService.isCurrentlyTracking();
      const currentApp = applicationTrackingService.getCurrentApplication();

      setIsAppTrackingActive(isTracking);
      setCurrentAppName(currentApp?.name || null);
    };

    // Update immediately
    updateCurrentApp();

    // Update every 2 seconds when tracking is active
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
    isAppTrackingActive,
  };
}
