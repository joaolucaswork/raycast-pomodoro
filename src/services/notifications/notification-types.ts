// Notification API types for environments where they might not be available
export interface BrowserNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface BrowserNotification {
  close(): void;
}

export interface NotificationConstructor {
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

export interface NotificationStatus {
  permissionGranted: boolean;
  browserAPIAvailable: boolean;
  electronAPIAvailable: boolean;
  lastError?: string;
}

export interface SystemNotificationOptions {
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface ElectronNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
}

export type NotificationType = "success" | "warning" | "error" | "info";

export type TestNotificationType = "basic" | "session-complete" | "achievement" | "hyperfocus";
