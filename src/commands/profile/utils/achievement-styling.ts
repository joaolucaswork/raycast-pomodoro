import { Color, Icon } from "@raycast/api";
import { formatDistanceToNow } from "date-fns";
import {
  ACHIEVEMENT_COLORS,
  ACHIEVEMENT_ICONS,
} from "../../../constants/design-tokens";

/**
 * Achievement styling utilities for consistent visual representation
 * across the profile interface.
 */

/**
 * Get color based on achievement rarity
 */
export const getRarityColor = (rarity: string): Color => {
  switch (rarity) {
    case "legendary":
      return ACHIEVEMENT_COLORS.LEGENDARY;
    case "epic":
      return ACHIEVEMENT_COLORS.EPIC;
    case "rare":
      return ACHIEVEMENT_COLORS.RARE;
    default:
      return ACHIEVEMENT_COLORS.COMMON;
  }
};

/**
 * Get icon based on achievement rarity
 */
export const getRarityIcon = (rarity: string): Icon => {
  switch (rarity) {
    case "legendary":
      return ACHIEVEMENT_ICONS.LEGENDARY;
    case "epic":
      return ACHIEVEMENT_ICONS.EPIC;
    case "rare":
      return ACHIEVEMENT_ICONS.RARE;
    default:
      return ACHIEVEMENT_ICONS.COMMON;
  }
};

/**
 * Check if achievement was unlocked recently (within last 7 days)
 */
export const isRecentlyUnlocked = (unlockedAt?: Date): boolean => {
  if (!unlockedAt) return false;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return new Date(unlockedAt) > weekAgo;
};

/**
 * Get enhanced achievement styling with special effects for recent unlocks
 */
export const getAchievementStyling = (achievement: any) => {
  const isRecent = isRecentlyUnlocked(achievement.unlockedAt);
  const baseColor = getRarityColor(achievement.rarity);

  return {
    iconColor: isRecent ? ACHIEVEMENT_COLORS.RECENT : baseColor,
    accessoryIcon: isRecent
      ? ACHIEVEMENT_ICONS.RECENT
      : getRarityIcon(achievement.rarity),
    accessoryColor: isRecent ? ACHIEVEMENT_COLORS.RECENT : baseColor,
    tooltip: isRecent
      ? `${achievement.rarity} achievement - unlocked recently!`
      : `${achievement.rarity} achievement - unlocked ${
          achievement.unlockedAt
            ? formatDistanceToNow(new Date(achievement.unlockedAt), {
                addSuffix: true,
              })
            : ""
        }`,
  };
};
