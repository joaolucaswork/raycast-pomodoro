import { SessionType } from "../types/timer";
import {
  notificationCore,
  sessionNotifications,
  adhdNotifications,
  notificationTesting,
  NotificationOptions,
  TestNotificationType,
} from "./notifications";

/**
 * Facade service for notification functionality.
 * 
 * This service provides a unified interface to notification functionality by
 * coordinating between specialized services:
 * - NotificationCore: Core notification infrastructure
 * - SessionNotifications: Session-specific notifications
 * - AdhdNotifications: ADHD-friendly notifications
 * - NotificationTesting: Testing and validation utilities
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

  // Core notification methods
  public async showToastNotification(
    options: NotificationOptions
  ): Promise<void> {
    return notificationCore.showToastNotification(options);
  }

  public async showSystemNotification(
    title: string,
    body: string,
    options?: {
      icon?: string;
      tag?: string;
      requireInteraction?: boolean;
      silent?: boolean;
    }
  ): Promise<void> {
    return notificationCore.showSystemNotification(title, body, options);
  }

  public async showEnhancedRaycastNotification(
    title: string,
    message: string,
    type: "success" | "warning" | "error" | "info" = "info"
  ): Promise<void> {
    return notificationCore.showEnhancedRaycastNotification(
      title,
      message,
      type
    );
  }

  // Session notification methods
  public async notifySessionComplete(
    sessionType: SessionType,
    enableSound: boolean = true,
    customMessage?: string,
    taskName?: string
  ): Promise<void> {
    return sessionNotifications.notifySessionComplete(
      sessionType,
      enableSound,
      customMessage,
      taskName
    );
  }

  public async notifySessionStart(
    sessionType: SessionType,
    taskName?: string,
    customMessage?: string
  ): Promise<void> {
    return sessionNotifications.notifySessionStart(
      sessionType,
      taskName,
      customMessage
    );
  }

  public async notifyTransitionWarning(
    minutesRemaining: number,
    sessionType: SessionType
  ): Promise<void> {
    return sessionNotifications.notifyTransitionWarning(
      minutesRemaining,
      sessionType
    );
  }

  // ADHD notification methods
  public async notifyHyperfocusDetected(
    consecutiveSessions: number,
    totalHours: number
  ): Promise<void> {
    return adhdNotifications.notifyHyperfocusDetected(
      consecutiveSessions,
      totalHours
    );
  }

  public async notifyAchievementUnlocked(
    achievementName: string,
    points: number
  ): Promise<void> {
    return adhdNotifications.notifyAchievementUnlocked(achievementName, points);
  }

  public async notifyPointsEarned(
    points: number,
    reason: string
  ): Promise<void> {
    return adhdNotifications.notifyPointsEarned(points, reason);
  }

  public async notifyLevelUp(newLevel: number): Promise<void> {
    return adhdNotifications.notifyLevelUp(newLevel);
  }

  // Audio methods (legacy compatibility)
  public async playNotificationSound(sessionType: SessionType): Promise<void> {
    return sessionNotifications.playNotificationSound(sessionType);
  }

  public setAudioEnabled(enabled: boolean): void {
    return sessionNotifications.setAudioEnabled(enabled);
  }

  public isAudioSupported(): boolean {
    return sessionNotifications.isAudioSupported();
  }

  // System methods
  public cleanup(): void {
    return sessionNotifications.cleanup();
  }

  public getNotificationStatus() {
    return notificationCore.getNotificationStatus();
  }

  public setDebugMode(enabled: boolean): void {
    return notificationCore.setDebugMode(enabled);
  }

  public async forcePermissionRequest(): Promise<string> {
    return notificationCore.forcePermissionRequest();
  }

  public getAlternativeNotificationSuggestions(): string[] {
    return notificationCore.getAlternativeNotificationSuggestions();
  }

  // Testing methods
  public async testNotification(
    type: TestNotificationType = "basic"
  ): Promise<void> {
    return notificationTesting.testNotification(type);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
