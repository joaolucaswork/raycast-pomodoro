import { useState, useEffect } from "react";
import { List, Icon, Color } from "@raycast/api";
import { Achievement, AchievementNotification } from "../../types/timer";

interface AchievementNotificationBannerProps {
  notification: AchievementNotification | null;
  onDismiss?: () => void;
  autoHideDelay?: number; // in milliseconds
}

export function AchievementNotificationBanner({
  notification,
  onDismiss,
  autoHideDelay = 5000,
}: AchievementNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);

      // Auto-hide after delay
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          setTimeout(onDismiss, 300); // Allow fade animation to complete
        }
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, autoHideDelay, onDismiss]);

  if (!notification || !isVisible) {
    return null;
  }

  const { achievement, isNewUnlock, progressUpdate, celebrationLevel } =
    notification;

  // Get rarity-specific styling
  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return {
          color: Color.Purple,
          emoji: "👑",
          title: "LEGENDARY ACHIEVEMENT!",
        };
      case "epic":
        return {
          color: Color.Blue,
          emoji: "⭐",
          title: "EPIC ACHIEVEMENT!",
        };
      case "rare":
        return {
          color: Color.Green,
          emoji: "🏆",
          title: "RARE ACHIEVEMENT!",
        };
      default:
        return {
          color: Color.Orange,
          emoji: "🥊",
          title: "ACHIEVEMENT UNLOCKED!",
        };
    }
  };

  const rarityConfig = getRarityConfig(achievement.rarity);

  // Get celebration emojis based on level
  const getCelebrationEmojis = () => {
    switch (celebrationLevel) {
      case "enthusiastic":
        return "🎉🥊🏆🎊✨";
      case "standard":
        return "🥊🏆";
      case "minimal":
        return "🥊";
      default:
        return "🥊";
    }
  };

  if (isNewUnlock) {
    return (
      <List.Section title={`${getCelebrationEmojis()} ${rarityConfig.title}`}>
        <List.Item
          icon={{
            source: achievement.icon,
            tintColor: rarityConfig.color,
          }}
          title={achievement.name}
          subtitle={achievement.description}
          accessories={[
            {
              tag: {
                value: `+${achievement.points} points`,
                color: rarityConfig.color,
              },
            },
            {
              tag: {
                value: achievement.rarity.toUpperCase(),
                color: rarityConfig.color,
              },
            },
            {
              icon: {
                source: Icon.Star,
                tintColor: Color.Yellow,
              },
            },
          ]}
        />
      </List.Section>
    );
  }

  // Progress update notification
  if (progressUpdate) {
    const progressPercentage = Math.round(progressUpdate.percentage);
    const isNearCompletion = progressPercentage >= 75;

    return (
      <List.Section
        title={`🎯 ${isNearCompletion ? "Almost There!" : "Progress Update"}`}
      >
        <List.Item
          icon={{
            source: achievement.icon,
            tintColor: isNearCompletion ? Color.Orange : Color.Blue,
          }}
          title={achievement.name}
          subtitle={`${progressUpdate.current}/${progressUpdate.max} completed`}
          accessories={[
            {
              tag: {
                value: `${progressPercentage}%`,
                color: isNearCompletion ? Color.Orange : Color.Blue,
              },
            },
            ...(isNearCompletion
              ? [
                  {
                    icon: {
                      source: Icon.ExclamationMark,
                      tintColor: Color.Orange,
                    },
                  },
                ]
              : []),
          ]}
        />
      </List.Section>
    );
  }

  return null;
}

// Hook for managing achievement notifications
export function useAchievementNotifications() {
  const [currentNotification, setCurrentNotification] =
    useState<AchievementNotification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<
    AchievementNotification[]
  >([]);

  const showNotification = (notification: AchievementNotification) => {
    if (currentNotification) {
      // Add to queue if there's already a notification showing
      setNotificationQueue((prev) => [...prev, notification]);
    } else {
      setCurrentNotification(notification);
    }
  };

  const dismissCurrentNotification = () => {
    setCurrentNotification(null);

    // Show next notification from queue if available
    setTimeout(() => {
      setNotificationQueue((prev) => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          setCurrentNotification(next);
          return rest;
        }
        return prev;
      });
    }, 300);
  };

  const clearAllNotifications = () => {
    setCurrentNotification(null);
    setNotificationQueue([]);
  };

  return {
    currentNotification,
    showNotification,
    dismissCurrentNotification,
    clearAllNotifications,
    hasQueuedNotifications: notificationQueue.length > 0,
    queueLength: notificationQueue.length,
  };
}

// Helper function to create achievement notifications
export function createAchievementNotification(
  achievement: Achievement,
  isNewUnlock: boolean = false,
  progressUpdate?: { current: number; max: number; percentage: number },
  celebrationLevel: "minimal" | "standard" | "enthusiastic" = "standard"
): AchievementNotification {
  return {
    achievement,
    isNewUnlock,
    progressUpdate,
    celebrationLevel,
  };
}
