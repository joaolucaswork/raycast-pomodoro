import { SessionType } from "../types/timer";
import { SESSION_ICONS } from "../constants/design-tokens";
import { Icon } from "@raycast/api";

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getSessionTypeLabel(type: SessionType): string {
  switch (type) {
    case SessionType.WORK:
      return "Focus Round";
    case SessionType.SHORT_BREAK:
      return "Short Break";
    case SessionType.LONG_BREAK:
      return "Long Break";
    default:
      return "Round";
  }
}

export function getSessionTypeIcon(type: SessionType): Icon {
  switch (type) {
    case SessionType.WORK:
      return SESSION_ICONS.WORK;
    case SessionType.SHORT_BREAK:
      return SESSION_ICONS.SHORT_BREAK;
    case SessionType.LONG_BREAK:
      return SESSION_ICONS.LONG_BREAK;
    default:
      return SESSION_ICONS.IDLE;
  }
}

export function getProgressPercentage(
  timeRemaining: number,
  totalDuration: number
): number {
  if (totalDuration === 0) return 0;
  return Math.max(
    0,
    Math.min(100, ((totalDuration - timeRemaining) / totalDuration) * 100)
  );
}

// Notification functions moved to notification-service.ts

export function validateTimerDuration(duration: string): number | null {
  const parsed = parseInt(duration, 10);
  if (isNaN(parsed) || parsed <= 0 || parsed > 180) {
    return null;
  }
  return parsed;
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function getMotivationalMessage(
  sessionType: SessionType,
  sessionCount: number
): string {
  const messages = {
    [SessionType.WORK]: [
      "Time to focus!",
      "Let's get productive!",
      "Focus mode activated!",
      "Time to make progress!",
      "Deep work time!",
    ],
    [SessionType.SHORT_BREAK]: [
      "Take a quick breather!",
      "Stretch and relax!",
      "Short break time!",
      "Recharge your energy!",
      "Quick rest break!",
    ],
    [SessionType.LONG_BREAK]: [
      "Well deserved long break!",
      "Time for a proper rest!",
      "Enjoy your extended break!",
      "Relax and unwind!",
      "Take a longer breather!",
    ],
  };

  const typeMessages = messages[sessionType];
  const randomIndex = Math.floor(Math.random() * typeMessages.length);
  return typeMessages[randomIndex];
}

export function calculateProductivityScore(
  completedSessions: number,
  totalSessions: number
): number {
  if (totalSessions === 0) return 0;
  return Math.round((completedSessions / totalSessions) * 100);
}

export function formatSessionSummary(
  workSessions: number,
  totalWorkTime: number,
  completedToday: number
): string {
  const hours = Math.floor(totalWorkTime / 3600);
  const minutes = Math.floor((totalWorkTime % 3600) / 60);

  let summary = `${workSessions} focus rounds completed`;

  if (hours > 0) {
    summary += ` (${hours}h ${minutes}m)`;
  } else if (minutes > 0) {
    summary += ` (${minutes}m)`;
  }

  if (completedToday > 0) {
    summary += ` • ${completedToday} today`;
  }

  return summary;
}
