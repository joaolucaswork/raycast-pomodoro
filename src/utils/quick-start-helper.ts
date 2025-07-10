import { showToast, Toast, getPreferenceValues, closeMainWindow } from "@raycast/api";
import { backgroundTimerService } from "../services/background-timer-service";
import { useTimerStore } from "../store/timer-store";
import { SessionType, TimerConfig } from "../types/timer";
import { getMotivationalMessage } from "./helpers";

interface Preferences {
  workDuration: string;
  shortBreakDuration: string;
  longBreakDuration: string;
  longBreakInterval: string;
  enableNotifications: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

/**
 * Quick start utility function for no-view commands
 * This avoids React hook issues in no-view commands
 */
export async function quickStartWorkSession(): Promise<void> {
  try {
    const preferences: Preferences = getPreferenceValues();

    // Update config from preferences
    const config: TimerConfig = {
      workDuration: parseInt(preferences.workDuration) || 25,
      shortBreakDuration: parseInt(preferences.shortBreakDuration) || 5,
      longBreakDuration: parseInt(preferences.longBreakDuration) || 15,
      longBreakInterval: parseInt(preferences.longBreakInterval) || 4,
      enableNotifications: preferences.enableNotifications ?? true,
      autoStartBreaks: preferences.autoStartBreaks ?? false,
      autoStartWork: preferences.autoStartWork ?? false,
    };

    // Update config using direct store access (safe for no-view commands)
    useTimerStore.getState().updateConfig(config);

    // Get current session count for motivational message
    const { sessionCount } = useTimerStore.getState();

    // Start a work session immediately using background service
    await backgroundTimerService.startTimer(SessionType.WORK);

    // Show success toast
    await showToast({
      style: Toast.Style.Success,
      title: "Work session started!",
      message: getMotivationalMessage(SessionType.WORK, sessionCount),
    });

    // Close the main window to get out of the user's way
    await closeMainWindow();
  } catch (error) {
    console.error("Failed to start quick work session:", error);
    
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to start session",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
