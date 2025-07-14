/**
 * Boxing-themed achievement components barrel export
 */

export { BoxingAchievementDisplay } from "./BoxingAchievementDisplay";
export { BoxingProgressDisplay } from "./BoxingProgressDisplay";
export { 
  AchievementNotificationBanner,
  useAchievementNotifications,
  createAchievementNotification,
} from "./AchievementNotificationBanner";

// Re-export types for convenience
export type {
  Achievement,
  AchievementStats,
  BoxingProgress,
  BoxingLevel,
  AchievementNotification,
} from "../../types/timer";
