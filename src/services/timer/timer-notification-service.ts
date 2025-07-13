import { SessionType, TimerSession } from "../types/timer";
import { notificationService } from "./notification-service";
import { getSessionTypeLabel } from "../utils/helpers";

/**
 * Timer notification service for session-related notifications.
 * 
 * Handles:
 * - Session start notifications
 * - Session completion notifications
 * - Auto-start notifications
 * - Session duration warnings
 */
export class TimerNotificationService {
  private static instance: TimerNotificationService;

  private constructor() {}

  public static getInstance(): TimerNotificationService {
    if (!TimerNotificationService.instance) {
      TimerNotificationService.instance = new TimerNotificationService();
    }
    return TimerNotificationService.instance;
  }

  /**
   * Notifies about session start
   */
  public async notifySessionStart(
    sessionType: SessionType,
    taskName?: string
  ): Promise<void> {
    try {
      await notificationService.notifySessionStart(sessionType, taskName);
    } catch (error) {
      console.error("Failed to send session start notification:", error);
    }
  }

  /**
   * Notifies about session completion
   */
  public async notifySessionCompletion(session: TimerSession): Promise<void> {
    try {
      const sessionLabel = getSessionTypeLabel(session.type);
      const duration = Math.round(session.duration / 60);
      
      await notificationService.notifySessionCompletion(
        session.type,
        `${sessionLabel} completed (${duration} minutes)`,
        session.taskName
      );
    } catch (error) {
      console.error("Failed to send session completion notification:", error);
    }
  }

  /**
   * Notifies about auto-start of next session
   */
  public async notifyAutoStart(
    nextSessionType: SessionType,
    delay: number = 2000
  ): Promise<void> {
    try {
      const sessionLabel = getSessionTypeLabel(nextSessionType);
      
      setTimeout(async () => {
        await notificationService.notifySessionStart(
          nextSessionType,
          undefined,
          `Auto-starting ${sessionLabel} session`
        );
      }, delay);
    } catch (error) {
      console.error("Failed to send auto-start notification:", error);
    }
  }

  /**
   * Notifies about session being too short to save
   */
  public async notifySessionTooShort(
    actualDuration: number,
    minimumDuration: number = 40
  ): Promise<void> {
    try {
      const { showToast, Toast } = require("@raycast/api");
      await showToast({
        style: Toast.Style.Failure,
        title: "Session Too Short",
        message: `Session completed in ${actualDuration}s but won't be saved to history (minimum: ${minimumDuration}s)`,
      });
    } catch (error) {
      console.error("Failed to show session too short notification:", error);
    }
  }

  /**
   * Notifies about session pause
   */
  public async notifySessionPause(session: TimerSession): Promise<void> {
    try {
      const sessionLabel = getSessionTypeLabel(session.type);
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Animated,
        title: "Session Paused",
        message: `${sessionLabel} session paused`,
      });
    } catch (error) {
      console.error("Failed to send session pause notification:", error);
    }
  }

  /**
   * Notifies about session resume
   */
  public async notifySessionResume(session: TimerSession): Promise<void> {
    try {
      const sessionLabel = getSessionTypeLabel(session.type);
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Success,
        title: "Session Resumed",
        message: `${sessionLabel} session resumed`,
      });
    } catch (error) {
      console.error("Failed to send session resume notification:", error);
    }
  }

  /**
   * Notifies about session stop
   */
  public async notifySessionStop(session: TimerSession): Promise<void> {
    try {
      const sessionLabel = getSessionTypeLabel(session.type);
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Failure,
        title: "Session Stopped",
        message: `${sessionLabel} session stopped`,
      });
    } catch (error) {
      console.error("Failed to send session stop notification:", error);
    }
  }

  /**
   * Notifies about manual session completion
   */
  public async notifyManualCompletion(session: TimerSession): Promise<void> {
    try {
      const sessionLabel = getSessionTypeLabel(session.type);
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Success,
        title: "Session Completed",
        message: `${sessionLabel} session manually completed`,
      });
    } catch (error) {
      console.error("Failed to send manual completion notification:", error);
    }
  }

  /**
   * Notifies about hyperfocus detection
   */
  public async notifyHyperfocusDetected(
    sessionDuration: number,
    recommendedBreak: number
  ): Promise<void> {
    try {
      const { showToast, Toast } = require("@raycast/api");
      const durationMinutes = Math.round(sessionDuration / 60);
      
      await showToast({
        style: Toast.Style.Animated,
        title: "Hyperfocus Detected",
        message: `You've been focused for ${durationMinutes} minutes. Consider a ${recommendedBreak}-minute break.`,
      });
    } catch (error) {
      console.error("Failed to send hyperfocus notification:", error);
    }
  }

  /**
   * Notifies about achievement unlock
   */
  public async notifyAchievementUnlock(
    achievementName: string,
    description: string
  ): Promise<void> {
    try {
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Success,
        title: "Achievement Unlocked!",
        message: `${achievementName}: ${description}`,
      });
    } catch (error) {
      console.error("Failed to send achievement notification:", error);
    }
  }

  /**
   * Notifies about points awarded
   */
  public async notifyPointsAwarded(
    points: number,
    reason: string
  ): Promise<void> {
    try {
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Success,
        title: `+${points} Points`,
        message: reason,
      });
    } catch (error) {
      console.error("Failed to send points notification:", error);
    }
  }

  /**
   * Notifies about session state restoration
   */
  public async notifySessionRestored(
    session: TimerSession,
    timeRemaining: number
  ): Promise<void> {
    try {
      const sessionLabel = getSessionTypeLabel(session.type);
      const remainingMinutes = Math.ceil(timeRemaining / 60);
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Animated,
        title: "Session Restored",
        message: `${sessionLabel} session restored (${remainingMinutes} minutes remaining)`,
      });
    } catch (error) {
      console.error("Failed to send session restoration notification:", error);
    }
  }

  /**
   * Notifies about timer initialization
   */
  public async notifyTimerInitialization(): Promise<void> {
    try {
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Animated,
        title: "Timer Initialized",
        message: "Timer service ready",
      });
    } catch (error) {
      console.error("Failed to send initialization notification:", error);
    }
  }

  /**
   * Notifies about timer errors
   */
  public async notifyTimerError(
    error: string,
    details?: string
  ): Promise<void> {
    try {
      const { showToast, Toast } = require("@raycast/api");
      
      await showToast({
        style: Toast.Style.Failure,
        title: "Timer Error",
        message: details ? `${error}: ${details}` : error,
      });
    } catch (error) {
      console.error("Failed to send timer error notification:", error);
    }
  }

  /**
   * Schedules a notification for a future time
   */
  public scheduleNotification(
    delay: number,
    notificationFn: () => Promise<void>
  ): NodeJS.Timeout {
    return setTimeout(async () => {
      try {
        await notificationFn();
      } catch (error) {
        console.error("Failed to send scheduled notification:", error);
      }
    }, delay);
  }

  /**
   * Cancels a scheduled notification
   */
  public cancelScheduledNotification(timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId);
  }
}

export const timerNotificationService = TimerNotificationService.getInstance();
