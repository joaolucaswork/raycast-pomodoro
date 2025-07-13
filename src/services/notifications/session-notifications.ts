import { showToast, showHUD } from "@raycast/api";
import { SessionType } from "../../types/timer";
import { getSessionTypeLabel } from "../../utils/helpers";
import { useTimerStore } from "../../store/timer-store";
import { notificationCore } from "./notification-core";

/**
 * Session-specific notification service.
 * 
 * Handles:
 * - Session start notifications
 * - Session completion notifications
 * - Transition warnings for ADHD users
 * - Audio notifications (disabled in Raycast)
 */
export class SessionNotifications {
  private static instance: SessionNotifications;
  private isAudioEnabled = false; // Audio not available in Raycast environment

  private constructor() {}

  public static getInstance(): SessionNotifications {
    if (!SessionNotifications.instance) {
      SessionNotifications.instance = new SessionNotifications();
    }
    return SessionNotifications.instance;
  }

  public async playNotificationSound(sessionType: SessionType): Promise<void> {
    // Audio notifications not available in Raycast environment
    console.log(`Would play ${sessionType} notification sound`);
  }

  public async notifySessionComplete(
    sessionType: SessionType,
    enableSound: boolean = true,
    customMessage?: string,
    taskName?: string,
  ): Promise<void> {
    const sessionLabel = getSessionTypeLabel(sessionType);
    const title = customMessage || `${sessionLabel} Complete!`;

    let message: string;
    switch (sessionType) {
      case SessionType.WORK:
        message = "Great job! Time for a well-deserved break.";
        break;
      case SessionType.SHORT_BREAK:
        message = "Break's over! Ready to get back to work?";
        break;
      case SessionType.LONG_BREAK:
        message = "Long break finished! You're refreshed and ready to focus.";
        break;
      default:
        message = "Session completed!";
    }

    console.log(`Notification content: ${title} - ${message}`);

    // Enhanced Raycast-native notification experience
    console.log("Showing enhanced session completion notification...");

    // Always show HUD for session completion (more prominent)
    await showHUD(`${title}: ${message}`);

    // Show detailed toast notification
    await notificationCore.showToastNotification({ title, message });

    // Play sound if enabled
    if (enableSound) {
      console.log("Playing notification sound...");
      await this.playNotificationSound(sessionType);
    }

    // Show system notification with enhanced options (will fallback to enhanced Raycast notifications)
    const systemNotificationOptions = {
      tag: `session-complete-${sessionType}`,
      requireInteraction: sessionType === SessionType.WORK, // Work sessions require interaction
      silent: false,
    };

    console.log(
      "Showing system notification with options:",
      systemNotificationOptions,
    );
    await notificationCore.showSystemNotification(
      title,
      message,
      systemNotificationOptions,
    );
    console.log("Session completion notification process completed");
  }

  public async notifySessionStart(
    sessionType: SessionType,
    taskName?: string,
    customMessage?: string,
  ): Promise<void> {
    const sessionLabel = getSessionTypeLabel(sessionType);
    const title = customMessage || `${sessionLabel} Started`;

    let message: string;
    switch (sessionType) {
      case SessionType.WORK:
        message = taskName 
          ? `Time to focus on: ${taskName}` 
          : "Time to focus! Stay productive.";
        break;
      case SessionType.SHORT_BREAK:
        message = "Take a quick breather and relax.";
        break;
      case SessionType.LONG_BREAK:
        message = "Enjoy your extended break!";
        break;
      default:
        message = "Session started!";
    }

    await notificationCore.showToastNotification({ title, message });
  }

  /**
   * Shows transition warning notifications for ADHD users
   */
  public async notifyTransitionWarning(
    minutesRemaining: number,
    sessionType: SessionType,
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableTransitionWarnings) return;

    const sessionLabel = getSessionTypeLabel(sessionType);
    let message = "";

    if (minutesRemaining === 5) {
      message = `${sessionLabel} ending in 5 minutes. Start wrapping up your current task.`;
    } else if (minutesRemaining === 2) {
      message = `${sessionLabel} ending in 2 minutes. Begin transitioning to your next activity.`;
    } else if (minutesRemaining === 1) {
      message = `${sessionLabel} ending in 1 minute. Take a deep breath and prepare for your break.`;
    }

    if (message) {
      // Show both HUD and system notification for transition warnings
      await showHUD(message);
      await notificationCore.showSystemNotification(
        "Focus Timer - Transition Warning",
        message,
        {
          tag: `transition-warning-${minutesRemaining}min`,
          silent: true, // Keep transition warnings subtle
        },
      );
    }
  }

  public setAudioEnabled(enabled: boolean): void {
    this.isAudioEnabled = enabled;
  }

  public isAudioSupported(): boolean {
    return false; // Audio not supported in Raycast environment
  }

  public cleanup(): void {
    // No cleanup needed in Raycast environment
  }
}

export const sessionNotifications = SessionNotifications.getInstance();
