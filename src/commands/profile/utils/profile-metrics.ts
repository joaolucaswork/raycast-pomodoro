import { adhdSupportService } from "../../../services/adhd-support-service";
import { RewardSystem, TimerSession } from "../../../types/timer";

/**
 * Profile metrics calculation utilities
 */

export interface ProfileMetrics {
  pointsForNextLevel: number;
  progressToNextLevel: number;
  recentAchievements: any[];
  totalAchievements: number;
  availableAchievements: number;
}

/**
 * Calculate comprehensive profile metrics
 */
export const calculateProfileMetrics = (rewardSystem: RewardSystem): ProfileMetrics => {
  const pointsForNextLevel = adhdSupportService.getPointsForNextLevel(
    rewardSystem.points
  );
  
  const progressToNextLevel = Math.round(
    ((rewardSystem.points - Math.pow(rewardSystem.level - 1, 2) * 50) /
      (Math.pow(rewardSystem.level, 2) * 50 -
        Math.pow(rewardSystem.level - 1, 2) * 50)) *
      100
  );

  const recentAchievements = rewardSystem.achievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => {
      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return {
    pointsForNextLevel,
    progressToNextLevel,
    recentAchievements,
    totalAchievements: rewardSystem.achievements.filter((a) => a.unlockedAt).length,
    availableAchievements: adhdSupportService.getDefaultAchievements().length,
  };
};

/**
 * Get session completion status with styling information
 */
export const getSessionStatus = (session: TimerSession) => {
  if (session.completed) {
    return {
      status: "Completed",
      color: "#10B981", // STATUS_COLORS.SUCCESS equivalent
      icon: "checkmark.circle" as const,
    };
  } else if (session.endTime && !session.completed) {
    return {
      status: "Manual Stop",
      color: "#F59E0B", // STATUS_COLORS.WARNING equivalent
      icon: "stop.circle" as const,
    };
  } else {
    return {
      status: "Incomplete",
      color: "#EF4444", // STATUS_COLORS.ERROR equivalent
      icon: "xmark.circle" as const,
    };
  }
};

/**
 * Calculate today's sessions from history
 */
export const getTodaysSessions = (history: TimerSession[]): number => {
  return history.filter((s) => {
    const sessionDate = new Date(s.startTime);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length;
};

/**
 * Get recent achievements with specified limit
 */
export const getRecentAchievements = (rewardSystem: RewardSystem, limit: number = 5) => {
  return rewardSystem.achievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => {
      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
};
