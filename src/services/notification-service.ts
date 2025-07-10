import { showToast, Toast } from "@raycast/api";
import { SessionType } from "../types/timer";
import { getSessionTypeLabel } from "../utils/helpers";

export interface NotificationOptions {
  title: string;
  message: string;
  sound?: boolean;
  systemNotification?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private isAudioEnabled = true;

  private constructor() {
    // Audio context not available in Raycast environment
    this.isAudioEnabled = false;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async playNotificationSound(sessionType: SessionType): Promise<void> {
    // Audio notifications not available in Raycast environment
    console.log(`Would play ${sessionType} notification sound`);
  }

  // Audio functionality removed for Raycast compatibility

  public async showToastNotification(
    options: NotificationOptions
  ): Promise<void> {
    await showToast({
      style: Toast.Style.Success,
      title: options.title,
      message: options.message,
    });
  }

  public async showSystemNotification(
    title: string,
    body: string
  ): Promise<void> {
    // For Windows system notifications
    // This would typically use Windows APIs or electron notifications
    // For now, we'll use console logging as a placeholder
    console.log(`System Notification: ${title} - ${body}`);

    // In a real implementation, you might use:
    // - Windows Toast Notifications API
    // - Electron's notification system
    // - Browser's Notification API (if available)

    // Browser notifications not available in Raycast environment
  }

  public async notifySessionComplete(
    sessionType: SessionType,
    enableSound: boolean = true
  ): Promise<void> {
    const sessionLabel = getSessionTypeLabel(sessionType);
    const title = `${sessionLabel} Complete!`;

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

    // Show toast notification
    await this.showToastNotification({ title, message });

    // Play sound if enabled
    if (enableSound) {
      await this.playNotificationSound(sessionType);
    }

    // Show system notification
    await this.showSystemNotification(title, message);
  }

  public async notifySessionStart(sessionType: SessionType): Promise<void> {
    const sessionLabel = getSessionTypeLabel(sessionType);
    const title = `${sessionLabel} Started`;

    let message: string;
    switch (sessionType) {
      case SessionType.WORK:
        message = "Time to focus! Stay productive.";
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

    await this.showToastNotification({ title, message });
  }

  public setAudioEnabled(enabled: boolean): void {
    this.isAudioEnabled = enabled;
  }

  public isAudioSupported(): boolean {
    return false;
  }

  public cleanup(): void {
    // No cleanup needed in Raycast environment
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
