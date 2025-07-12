import { showToast, Toast, showHUD } from "@raycast/api";
import { SessionType } from "../types/timer";
import { getSessionTypeLabel } from "../utils/helpers";
import { useTimerStore } from "../store/timer-store";

// Notification API types for environments where they might not be available
interface BrowserNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

interface BrowserNotification {
  close(): void;
}

interface NotificationConstructor {
  new (
    title: string,
    options?: BrowserNotificationOptions,
  ): BrowserNotification;
  permission: "default" | "granted" | "denied";
  requestPermission(): Promise<"default" | "granted" | "denied">;
}

export interface NotificationOptions {
  title: string;
  message: string;
  sound?: boolean;
  systemNotification?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private isAudioEnabled = true;
  private debugMode = false; // Debug logging disabled by default
  private notificationStatus: {
    permissionGranted: boolean;
    browserAPIAvailable: boolean;
    electronAPIAvailable: boolean;
    lastError?: string;
  } = {
    permissionGranted: false,
    browserAPIAvailable: false,
    electronAPIAvailable: false,
  };

  private constructor() {
    // Audio context not available in Raycast environment
    this.isAudioEnabled = false;
    this.debugLog("NotificationService initializing...");
    // Initialize notification permissions
    this.initializeNotifications();
  }

  private debugLog(message: string, data?: any): void {
    if (this.debugMode) {
      const timestamp = new Date().toISOString();
      console.log(`[NotificationService ${timestamp}] ${message}`, data || "");
    }
  }

  private getToastStyleForNotification(
    title: string,
    options?: {
      requireInteraction?: boolean;
      silent?: boolean;
    },
  ): Toast.Style {
    if (title.includes("Error") || title.includes("Failed")) {
      return Toast.Style.Failure;
    }
    if (
      title.includes("Achievement") ||
      title.includes("Level Up") ||
      title.includes("Complete")
    ) {
      return Toast.Style.Success;
    }
    if (title.includes("Warning") || title.includes("Hyperfocus")) {
      return Toast.Style.Failure; // Use failure style for warnings to get attention
    }
    return Toast.Style.Success;
  }

  private async initializeNotifications(): Promise<void> {
    try {
      this.debugLog("Checking notification API availability...");

      // Check Browser Notification API
      const NotificationAPI = (globalThis as any).Notification as
        | NotificationConstructor
        | undefined;
      this.notificationStatus.browserAPIAvailable = !!NotificationAPI;
      this.debugLog(
        "Browser Notification API available:",
        this.notificationStatus.browserAPIAvailable,
      );

      if (NotificationAPI) {
        this.debugLog("Current permission status:", NotificationAPI.permission);

        if (NotificationAPI.permission === "default") {
          this.debugLog("Requesting notification permission...");
          const permission = await NotificationAPI.requestPermission();
          this.debugLog("Permission request result:", permission);
          this.notificationStatus.permissionGranted = permission === "granted";
        } else {
          this.notificationStatus.permissionGranted =
            NotificationAPI.permission === "granted";
        }
      }

      // Check Electron API
      const electronAPI = (globalThis as any).electronAPI;
      this.notificationStatus.electronAPIAvailable =
        !!electronAPI?.showNotification;
      this.debugLog(
        "Electron API available:",
        this.notificationStatus.electronAPIAvailable,
      );

      this.debugLog(
        "Notification initialization complete:",
        this.notificationStatus,
      );
    } catch (error) {
      this.notificationStatus.lastError =
        error instanceof Error ? error.message : String(error);
      this.debugLog("Notification initialization failed:", error);
    }
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
    options: NotificationOptions,
  ): Promise<void> {
    await showToast({
      style: Toast.Style.Success,
      title: options.title,
      message: options.message,
    });
  }

  public async showSystemNotification(
    title: string,
    body: string,
    options?: {
      icon?: string;
      tag?: string;
      requireInteraction?: boolean;
      silent?: boolean;
    },
  ): Promise<void> {
    this.debugLog(`Attempting to show system notification: "${title}"`, {
      body,
      options,
    });

    try {
      // Try to use native browser Notification API first (works in Electron/Raycast)
      const NotificationAPI = (globalThis as any).Notification as
        | NotificationConstructor
        | undefined;

      if (NotificationAPI) {
        this.debugLog("Using Browser Notification API");

        // Request permission if not already granted
        if (NotificationAPI.permission === "default") {
          this.debugLog("Requesting notification permission...");
          const permission = await NotificationAPI.requestPermission();
          this.debugLog("Permission request result:", permission);

          if (permission !== "granted") {
            this.debugLog("Notification permission denied");
            this.notificationStatus.permissionGranted = false;
            return;
          }
          this.notificationStatus.permissionGranted = true;
        }

        if (NotificationAPI.permission === "granted") {
          this.debugLog("Creating browser notification...");
          const notificationOptions = {
            body,
            icon: options?.icon || undefined,
            tag: options?.tag || "raycast-pomodoro",
            requireInteraction: options?.requireInteraction || false,
            silent: options?.silent || false,
          };

          this.debugLog("Notification options:", notificationOptions);

          const notification = new NotificationAPI(title, notificationOptions);

          this.debugLog("Browser notification created successfully");

          // Auto-close after 5 seconds unless requireInteraction is true
          if (!options?.requireInteraction) {
            setTimeout(() => {
              this.debugLog("Auto-closing notification");
              notification.close();
            }, 5000);
          }

          return;
        } else {
          this.debugLog(
            "Browser notification permission not granted:",
            NotificationAPI.permission,
          );
        }
      } else {
        this.debugLog("Browser Notification API not available");
      }

      // Fallback: Try to use Electron's notification system if available
      const electronAPI = (globalThis as any).electronAPI;
      if (electronAPI?.showNotification) {
        this.debugLog("Using Electron notification API");
        const electronOptions = {
          title,
          body,
          icon: options?.icon,
          silent: options?.silent || false,
        };

        this.debugLog("Electron notification options:", electronOptions);
        await electronAPI.showNotification(electronOptions);
        this.debugLog("Electron notification sent successfully");
        return;
      } else {
        this.debugLog("Electron notification API not available");
      }

      // Enhanced fallback: Use Raycast HUD for important notifications
      this.debugLog("Using enhanced Raycast fallback for notification");

      // For important notifications, use HUD which is more visible
      if (
        options?.requireInteraction ||
        title.includes("Complete") ||
        title.includes("Achievement")
      ) {
        await showHUD(`${title}: ${body}`);
      }

      // Always show toast for better visibility
      await showToast({
        style: this.getToastStyleForNotification(title, options),
        title: title,
        message: body,
      });

      console.log(`System Notification: ${title} - ${body}`);
    } catch (error) {
      this.notificationStatus.lastError =
        error instanceof Error ? error.message : String(error);
      this.debugLog("Failed to show system notification:", error);

      // Final fallback: Toast notification
      try {
        await showToast({
          style: Toast.Style.Failure,
          title: "Notification Error",
          message: `Failed to show: ${title}`,
        });
      } catch (toastError) {
        console.log(`System Notification: ${title} - ${body}`);
      }
    }
  }

  public async notifySessionComplete(
    sessionType: SessionType,
    enableSound: boolean = true,
  ): Promise<void> {
    this.debugLog(
      `Session completion notification triggered for: ${sessionType}`,
    );

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

    this.debugLog(`Notification content: ${title} - ${message}`);

    // Enhanced Raycast-native notification experience
    this.debugLog("Showing enhanced session completion notification...");

    // Always show HUD for session completion (more prominent)
    await showHUD(`${title}: ${message}`);

    // Show detailed toast notification
    await this.showToastNotification({ title, message });

    // Play sound if enabled
    if (enableSound) {
      this.debugLog("Playing notification sound...");
      await this.playNotificationSound(sessionType);
    }

    // Show system notification with enhanced options (will fallback to enhanced Raycast notifications)
    const systemNotificationOptions = {
      tag: `session-complete-${sessionType}`,
      requireInteraction: sessionType === SessionType.WORK, // Work sessions require interaction
      silent: false,
    };

    this.debugLog(
      "Showing system notification with options:",
      systemNotificationOptions,
    );
    await this.showSystemNotification(
      title,
      message,
      systemNotificationOptions,
    );
    this.debugLog("Session completion notification process completed");
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

  // Debug and testing methods
  public getNotificationStatus() {
    return { ...this.notificationStatus };
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.debugLog(`Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  public async testNotification(
    type: "basic" | "session-complete" | "achievement" | "hyperfocus" = "basic",
  ): Promise<void> {
    this.debugLog(`Testing notification type: ${type}`);

    switch (type) {
      case "basic":
        await this.showSystemNotification(
          "Test Notification",
          "This is a test notification to verify the system is working.",
          {
            tag: "test-notification",
            requireInteraction: false,
            silent: false,
          },
        );
        break;

      case "session-complete":
        await this.notifySessionComplete(SessionType.WORK, false);
        break;

      case "achievement":
        await this.notifyAchievementUnlocked("Test Achievement", 50);
        break;

      case "hyperfocus":
        await this.notifyHyperfocusDetected(3, 2.5);
        break;
    }
  }

  public async forcePermissionRequest(): Promise<string> {
    this.debugLog("Forcing permission request...");
    try {
      const NotificationAPI = (globalThis as any).Notification as
        | NotificationConstructor
        | undefined;
      if (NotificationAPI) {
        const permission = await NotificationAPI.requestPermission();
        this.notificationStatus.permissionGranted = permission === "granted";
        this.debugLog("Forced permission request result:", permission);
        return permission;
      }
      return "not-supported";
    } catch (error) {
      this.debugLog("Force permission request failed:", error);
      return "error";
    }
  }

  public getAlternativeNotificationSuggestions(): string[] {
    const suggestions = [];

    if (
      !this.notificationStatus.browserAPIAvailable &&
      !this.notificationStatus.electronAPIAvailable
    ) {
      suggestions.push(
        "System notifications are not available in this environment",
      );
      suggestions.push("Using enhanced Raycast notifications instead:");
      suggestions.push("• HUD notifications for important events");
      suggestions.push("• Toast notifications with appropriate styling");
      suggestions.push("• Console logging for debugging");
      suggestions.push("• Audio notifications (if enabled)");
    }

    if (
      !this.notificationStatus.permissionGranted &&
      this.notificationStatus.browserAPIAvailable
    ) {
      suggestions.push("Notification permission not granted");
      suggestions.push("Try using 'Request Permission' action");
      suggestions.push("Check Windows notification settings");
    }

    return suggestions;
  }

  public async showEnhancedRaycastNotification(
    title: string,
    message: string,
    type: "success" | "warning" | "error" | "info" = "info",
  ): Promise<void> {
    this.debugLog(`Showing enhanced Raycast notification: ${type}`, {
      title,
      message,
    });

    // Show HUD for immediate visibility
    await showHUD(`${title}: ${message}`);

    // Show toast with appropriate styling
    const toastStyle =
      type === "success"
        ? Toast.Style.Success
        : type === "error" || type === "warning"
          ? Toast.Style.Failure
          : Toast.Style.Success;

    await showToast({
      style: toastStyle,
      title: title,
      message: message,
    });
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
      await this.showSystemNotification(
        "Focus Timer - Transition Warning",
        message,
        {
          tag: `transition-warning-${minutesRemaining}min`,
          silent: true, // Keep transition warnings subtle
        },
      );
    }
  }

  /**
   * Shows hyperfocus detection warning
   */
  public async notifyHyperfocusDetected(
    consecutiveSessions: number,
    totalHours: number,
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableHyperfocusDetection) return;

    let message = "";

    if (consecutiveSessions >= config.maxConsecutiveSessions) {
      message = `You've completed ${consecutiveSessions} sessions in a row. Consider taking a longer break to prevent burnout.`;
    } else if (totalHours >= config.forcedBreakAfterHours) {
      message = `You've been focusing for ${Math.round(totalHours * 10) / 10} hours. Time for a mandatory break!`;
    }

    if (message) {
      // Show both HUD and prominent system notification for hyperfocus warnings
      await showHUD(message);
      await this.showSystemNotification(
        "Focus Timer - Hyperfocus Detected",
        message,
        {
          tag: "hyperfocus-warning",
          requireInteraction: true, // Hyperfocus warnings require user attention
          silent: false,
        },
      );
    }
  }

  /**
   * Shows achievement unlock notification
   */
  public async notifyAchievementUnlocked(
    achievementName: string,
    points: number,
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    // Remove emoji for Windows compatibility and show both HUD and system notification
    const message = `Achievement Unlocked: ${achievementName} (+${points} points)`;
    await showHUD(message);
    await this.showSystemNotification(
      "Focus Timer - Achievement Unlocked!",
      message,
      {
        tag: `achievement-${achievementName.toLowerCase().replace(/\s+/g, "-")}`,
        requireInteraction: false,
        silent: false,
      },
    );
  }

  /**
   * Shows points earned notification
   */
  public async notifyPointsEarned(
    points: number,
    reason: string,
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    const message = `+${points} points: ${reason}`;
    await showHUD(message);
    // Only show system notification for significant point gains (10+ points)
    if (points >= 10) {
      await this.showSystemNotification(
        "Focus Timer - Points Earned",
        message,
        {
          tag: "points-earned",
          silent: true, // Keep points notifications subtle
        },
      );
    }
  }

  /**
   * Shows level up notification
   */
  public async notifyLevelUp(newLevel: number): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    // Remove emoji for Windows compatibility and show both HUD and system notification
    const message = `Level Up! You're now level ${newLevel}!`;
    await showHUD(message);
    await this.showSystemNotification("Focus Timer - Level Up!", message, {
      tag: `level-up-${newLevel}`,
      requireInteraction: false,
      silent: false,
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
