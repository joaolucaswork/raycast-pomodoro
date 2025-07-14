import { showToast, showHUD, Toast } from "@raycast/api";
import { SessionType } from "../types/timer";
import { getSessionTypeLabel } from "../utils/helpers";
import { useTimerStore } from "../store/timer-store";
import { boxingNotificationService } from "./features/boxing-notification-service";

/**
 * Simplified notification service using only Raycast native notifications.
 *
 * This service provides notifications using:
 * - Toast notifications for user feedback and status updates
 * - HUD notifications for quick, non-intrusive messages
 *
 * All notifications respect user preferences and are optimized for the Raycast environment.
 */
export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Shows a toast notification with the specified style
   */
  public async showToast(
    title: string,
    message?: string,
    style: Toast.Style = Toast.Style.Success
  ): Promise<void> {
    await showToast({
      style,
      title,
      message,
    });
  }

  /**
   * Shows a success toast notification
   */
  public async showSuccess(title: string, message?: string): Promise<void> {
    await this.showToast(title, message, Toast.Style.Success);
  }

  /**
   * Shows an error toast notification
   */
  public async showError(title: string, message?: string): Promise<void> {
    await this.showToast(title, message, Toast.Style.Failure);
  }

  /**
   * Shows a HUD notification for quick, non-intrusive messages
   */
  public async showHUD(message: string): Promise<void> {
    await showHUD(message);
  }

  /**
   * Shows an animated toast that can be updated later
   */
  public async showAnimatedToast(
    title: string,
    message?: string
  ): Promise<Toast> {
    return await showToast({
      style: Toast.Style.Animated,
      title,
      message,
    });
  }

  // Session-specific notification methods

  /**
   * Notifies about session start
   */
  public async notifySessionStart(
    sessionType: SessionType,
    taskName?: string,
    customMessage?: string
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableNotifications) return;

    // Use boxing-themed notifications for work sessions
    if (sessionType === SessionType.WORK) {
      const { currentFocusPeriodSessionCount } = useTimerStore.getState();
      await boxingNotificationService.showRoundStart(
        taskName,
        currentFocusPeriodSessionCount + 1
      );
    } else {
      const sessionLabel = getSessionTypeLabel(sessionType);
      const title = customMessage || `${sessionLabel} Started`;
      const message = taskName ? `Task: ${taskName}` : undefined;

      await this.showHUD(title);
      await this.showSuccess(title, message);
    }
  }

  /**
   * Notifies about session completion
   */
  public async notifySessionCompletion(
    sessionType: SessionType,
    message: string,
    taskName?: string
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableNotifications) return;

    // Use boxing-themed notifications for work sessions
    if (sessionType === SessionType.WORK) {
      const { currentFocusPeriodSessionCount } = useTimerStore.getState();
      // Extract duration from message if possible
      const durationMatch = message.match(/(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 25;

      await boxingNotificationService.showRoundComplete(
        duration,
        taskName,
        currentFocusPeriodSessionCount + 1
      );
    } else if (sessionType === SessionType.SHORT_BREAK) {
      await boxingNotificationService.showBreakTime("short");
    } else if (sessionType === SessionType.LONG_BREAK) {
      await boxingNotificationService.showBreakTime("long");
    } else {
      const sessionLabel = getSessionTypeLabel(sessionType);
      const title = `${sessionLabel} Complete`;
      const fullMessage = taskName ? `${message} - ${taskName}` : message;

      await this.showHUD(fullMessage);
      await this.showSuccess(title, fullMessage);
    }
  }

  /**
   * Notifies about session completion (legacy method for compatibility)
   */
  public async notifySessionComplete(
    sessionType: SessionType,
    enableAudio: boolean = false
  ): Promise<void> {
    const sessionLabel = getSessionTypeLabel(sessionType);
    const message = `${sessionLabel} session completed`;

    await this.notifySessionCompletion(sessionType, message);
  }

  /**
   * Shows transition warning for ADHD users
   */
  public async notifyTransitionWarning(
    minutesRemaining: number,
    sessionType: SessionType
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableTransitionWarnings) return;

    const sessionLabel = getSessionTypeLabel(sessionType);
    const message = `${minutesRemaining} minutes remaining in ${sessionLabel}`;

    await this.showHUD(message);
  }

  // ADHD-specific notification methods

  /**
   * Shows hyperfocus detection warning
   */
  public async notifyHyperfocusDetected(
    consecutiveSessions: number,
    totalHours: number
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableHyperfocusDetection) return;

    const message = `Hyperfocus detected: ${consecutiveSessions} sessions (${totalHours.toFixed(1)}h). Consider taking a break.`;

    await this.showHUD(message);
    await this.showToast("Hyperfocus Warning", message, Toast.Style.Failure);
  }

  /**
   * Shows achievement unlock notification
   */
  public async notifyAchievementUnlocked(
    achievementName: string,
    points: number
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    const message = `Achievement Unlocked: ${achievementName} (+${points} points)`;

    await this.showHUD(message);
    await this.showSuccess("Achievement Unlocked!", message);
  }

  /**
   * Shows points earned notification
   */
  public async notifyPointsEarned(
    points: number,
    reason: string
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    const message = `+${points} points: ${reason}`;

    // Only show toast for significant point gains (10+ points)
    if (points >= 10) {
      await this.showSuccess("Points Earned", message);
    } else {
      await this.showHUD(message);
    }
  }

  /**
   * Shows level up notification
   */
  public async notifyLevelUp(newLevel: number): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    const message = `Level Up! You are now level ${newLevel}`;

    await this.showHUD(message);
    await this.showSuccess("Level Up!", message);
  }

  /**
   * Shows break reminder notification
   */
  public async notifyBreakReminder(
    sessionCount: number,
    recommendedBreakMinutes: number
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableHyperfocusDetection) return;

    const message = `You've completed ${sessionCount} sessions. Consider taking a ${recommendedBreakMinutes}-minute break to recharge.`;

    await this.showHUD(message);
    await this.showToast("Break Reminder", message);
  }

  // Legacy compatibility methods (no-op for audio in Raycast)

  /**
   * Legacy method for audio notifications (no-op in Raycast)
   */
  public async playNotificationSound(sessionType: SessionType): Promise<void> {
    // Audio not supported in Raycast environment
  }

  /**
   * Legacy method for audio settings (no-op in Raycast)
   */
  public setAudioEnabled(enabled: boolean): void {
    // Audio not supported in Raycast environment
  }

  /**
   * Legacy method for audio support check
   */
  public isAudioSupported(): boolean {
    return false; // Audio not supported in Raycast environment
  }

  /**
   * Legacy cleanup method (no-op in Raycast)
   */
  public cleanup(): void {
    // No cleanup needed in Raycast environment
  }

  // Testing methods

  /**
   * Tests basic notification functionality
   */
  public async testNotification(): Promise<void> {
    await this.showSuccess(
      "Test Notification",
      "Notification system is working correctly"
    );
  }

  /**
   * Tests all notification types
   */
  public async testAllNotifications(): Promise<void> {
    await this.showSuccess("Success Test", "This is a success notification");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await this.showError("Error Test", "This is an error notification");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await this.showHUD("HUD Test Message");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const animatedToast = await this.showAnimatedToast("Processing...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    animatedToast.style = Toast.Style.Success;
    animatedToast.title = "Processing Complete";
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
