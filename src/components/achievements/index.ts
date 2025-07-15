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

// New detailed view components
export { AchievementDetailView } from "./AchievementDetailView";
export { BoxingLevelDetailView } from "./BoxingLevelDetailView";
export { DetailedStatsView } from "./DetailedStatsView";
export { AchievementBrowser } from "./AchievementBrowser";

// Re-export types for convenience
export type {
  Achievement,
  AchievementStats,
  BoxingProgress,
  BoxingLevel,
  AchievementNotification,
} from "../../types/timer";
