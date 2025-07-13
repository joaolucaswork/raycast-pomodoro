import { showHUD } from "@raycast/api";
import { useTimerStore } from "../../store/timer-store";
import { notificationCore } from "./notification-core";

/**
 * ADHD-specific notification service.
 * 
 * Handles:
 * - Hyperfocus detection warnings
 * - Achievement unlock notifications
 * - Points earned notifications
 * - Level up notifications
 */
export class AdhdNotifications {
  private static instance: AdhdNotifications;

  private constructor() {}

  public static getInstance(): AdhdNotifications {
    if (!AdhdNotifications.instance) {
      AdhdNotifications.instance = new AdhdNotifications();
    }
    return AdhdNotifications.instance;
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
      await notificationCore.showSystemNotification(
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
    await notificationCore.showSystemNotification(
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
      await notificationCore.showSystemNotification(
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
    await notificationCore.showSystemNotification("Focus Timer - Level Up!", message, {
      tag: `level-up-${newLevel}`,
      requireInteraction: false,
      silent: false,
    });
  }

  /**
   * Shows streak milestone notification
   */
  public async notifyStreakMilestone(
    streakCount: number,
    milestoneType: "daily" | "weekly" | "monthly",
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    const message = `${streakCount}-day ${milestoneType} streak achieved! Keep it up!`;
    await showHUD(message);
    await notificationCore.showSystemNotification(
      "Focus Timer - Streak Milestone!",
      message,
      {
        tag: `streak-${milestoneType}-${streakCount}`,
        requireInteraction: false,
        silent: false,
      },
    );
  }

  /**
   * Shows productivity milestone notification
   */
  public async notifyProductivityMilestone(
    totalMinutes: number,
    milestoneType: "hours" | "sessions",
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableRewardSystem) return;

    let message = "";
    if (milestoneType === "hours") {
      const hours = Math.floor(totalMinutes / 60);
      message = `${hours} hours of focused work completed! Amazing dedication!`;
    } else {
      message = `${totalMinutes} focus sessions completed! You're building great habits!`;
    }

    await showHUD(message);
    await notificationCore.showSystemNotification(
      "Focus Timer - Productivity Milestone!",
      message,
      {
        tag: `productivity-${milestoneType}-${totalMinutes}`,
        requireInteraction: false,
        silent: false,
      },
    );
  }

  /**
   * Shows break reminder notification
   */
  public async notifyBreakReminder(
    sessionCount: number,
    recommendedBreakMinutes: number,
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableHyperfocusDetection) return;

    const message = `You've completed ${sessionCount} sessions. Consider taking a ${recommendedBreakMinutes}-minute break to recharge.`;
    await showHUD(message);
    await notificationCore.showSystemNotification(
      "Focus Timer - Break Reminder",
      message,
      {
        tag: `break-reminder-${sessionCount}`,
        requireInteraction: false,
        silent: true, // Keep break reminders subtle
      },
    );
  }

  /**
   * Shows energy level reminder notification
   */
  public async notifyEnergyLevelCheck(
    sessionType: string,
  ): Promise<void> {
    const config = useTimerStore.getState().config;
    if (!config.enableAdaptiveTimers) return;

    const message = `How's your energy level for this ${sessionType}? Consider adjusting your session length if needed.`;
    await showHUD(message);
    // Don't show system notification for energy checks - keep them subtle
  }
}

export const adhdNotifications = AdhdNotifications.getInstance();
