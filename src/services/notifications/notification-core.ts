import { showToast, Toast, showHUD } from "@raycast/api";
import {
  BrowserNotificationOptions,
  NotificationConstructor,
  NotificationOptions,
  NotificationStatus,
  SystemNotificationOptions,
  NotificationType,
} from "./notification-types";

/**
 * Core notification service for handling system notifications and permissions.
 * 
 * Handles:
 * - Browser notification API integration
 * - Electron notification API integration
 * - Permission management
 * - Fallback to Raycast native notifications
 */
export class NotificationCore {
  private static instance: NotificationCore;
  private debugMode = false;
  private notificationStatus: NotificationStatus = {
    permissionGranted: false,
    browserAPIAvailable: false,
    electronAPIAvailable: false,
  };

  private constructor() {
    this.debugLog("NotificationCore initializing...");
    this.initializeNotifications();
  }

  public static getInstance(): NotificationCore {
    if (!NotificationCore.instance) {
      NotificationCore.instance = new NotificationCore();
    }
    return NotificationCore.instance;
  }

  private debugLog(message: string, data?: unknown): void {
    if (this.debugMode) {
      const timestamp = new Date().toISOString();
      console.log(`[NotificationCore ${timestamp}] ${message}`, data || "");
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
    options?: SystemNotificationOptions,
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

      // Final fallback: Use enhanced Raycast notifications
      this.debugLog("Using enhanced Raycast notification fallback");
      await this.showEnhancedRaycastNotification(title, body, "info");
    } catch (error) {
      this.debugLog("System notification failed:", error);
      // Fallback to enhanced Raycast notifications on error
      await this.showEnhancedRaycastNotification(title, body, "error");
    }
  }

  public async showEnhancedRaycastNotification(
    title: string,
    message: string,
    type: NotificationType = "info",
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

  public getNotificationStatus(): NotificationStatus {
    return { ...this.notificationStatus };
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.debugLog(`Debug mode ${enabled ? "enabled" : "disabled"}`);
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
}

export const notificationCore = NotificationCore.getInstance();
