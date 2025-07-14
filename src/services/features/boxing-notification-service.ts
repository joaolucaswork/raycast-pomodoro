import { showToast, Toast } from "@raycast/api";
import { Achievement, AchievementNotification } from "../../types/timer";

/**
 * Boxing-themed achievement notification service
 * Handles achievement unlock celebrations and progress notifications
 */
export class BoxingNotificationService {
  /**
   * Show achievement unlock notification with boxing theme
   */
  public async showAchievementUnlock(achievement: Achievement): Promise<void> {
    const boxingEmojis = ["🥊", "🏆", "👑", "⭐", "💪"];
    const randomEmoji = boxingEmojis[Math.floor(Math.random() * boxingEmojis.length)];
    
    // Get rarity-specific styling
    const rarityConfig = this.getRarityConfig(achievement.rarity);
    
    await showToast({
      style: Toast.Style.Success,
      title: `${randomEmoji} Achievement Unlocked!`,
      message: `${achievement.name} - ${achievement.points} points`,
    });

    // Show detailed achievement info
    setTimeout(async () => {
      await showToast({
        style: Toast.Style.Success,
        title: achievement.name,
        message: achievement.description,
      });
    }, 2000);
  }

  /**
   * Show multiple achievement unlocks
   */
  public async showMultipleAchievements(achievements: Achievement[]): Promise<void> {
    if (achievements.length === 0) return;

    if (achievements.length === 1) {
      await this.showAchievementUnlock(achievements[0]);
      return;
    }

    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
    await showToast({
      style: Toast.Style.Success,
      title: `🥊 ${achievements.length} Achievements Unlocked!`,
      message: `Total: ${totalPoints} points earned`,
    });

    // Show each achievement with a delay
    for (let i = 0; i < achievements.length; i++) {
      setTimeout(async () => {
        await this.showAchievementUnlock(achievements[i]);
      }, (i + 1) * 1500);
    }
  }

  /**
   * Show level up notification
   */
  public async showLevelUp(
    newLevel: number,
    levelTitle: string,
    previousLevel: number
  ): Promise<void> {
    const levelEmojis = ["🥊", "🏅", "🏆", "👑", "⭐"];
    const emoji = levelEmojis[Math.min(newLevel - 1, levelEmojis.length - 1)];
    
    await showToast({
      style: Toast.Style.Success,
      title: `${emoji} Level Up!`,
      message: `You're now a ${levelTitle} (Level ${newLevel})`,
    });
  }

  /**
   * Show streak achievement notification
   */
  public async showStreakAchievement(streakLength: number): Promise<void> {
    const streakEmojis = ["🔥", "💪", "⚡", "🚀"];
    const randomEmoji = streakEmojis[Math.floor(Math.random() * streakEmojis.length)];
    
    await showToast({
      style: Toast.Style.Success,
      title: `${randomEmoji} Knockout Streak!`,
      message: `${streakLength} rounds in a row - you're on fire!`,
    });
  }

  /**
   * Show daily goal completion
   */
  public async showDailyGoalComplete(roundsCompleted: number): Promise<void> {
    await showToast({
      style: Toast.Style.Success,
      title: "🎯 Daily Training Complete!",
      message: `${roundsCompleted} rounds completed today - excellent work!`,
    });
  }

  /**
   * Show championship belt earned notification
   */
  public async showChampionshipBelt(beltName: string, hoursCompleted: number): Promise<void> {
    await showToast({
      style: Toast.Style.Success,
      title: "🏆 Championship Belt Earned!",
      message: `${beltName} - ${hoursCompleted} hours of training completed`,
    });
  }

  /**
   * Show progress toward next achievement
   */
  public async showProgressUpdate(
    achievementName: string,
    current: number,
    target: number
  ): Promise<void> {
    const percentage = Math.round((current / target) * 100);
    
    if (percentage >= 75 && percentage < 100) {
      await showToast({
        style: Toast.Style.Animated,
        title: `🎯 Almost There!`,
        message: `${achievementName}: ${current}/${target} (${percentage}%)`,
      });
    }
  }

  /**
   * Show session completion with boxing theme
   */
  public async showRoundComplete(
    duration: number,
    taskName?: string,
    roundNumber?: number
  ): Promise<void> {
    const roundEmojis = ["🥊", "💪", "🔥", "⚡"];
    const randomEmoji = roundEmojis[Math.floor(Math.random() * roundEmojis.length)];
    
    const title = roundNumber 
      ? `${randomEmoji} Round ${roundNumber} Complete!`
      : `${randomEmoji} Round Complete!`;
    
    const message = taskName 
      ? `${taskName} - ${Math.round(duration)} minutes`
      : `${Math.round(duration)} minutes of focused training`;

    await showToast({
      style: Toast.Style.Success,
      title,
      message,
    });
  }

  /**
   * Show motivational message for starting a session
   */
  public async showRoundStart(taskName?: string, roundNumber?: number): Promise<void> {
    const motivationalMessages = [
      "Time to knock out procrastination!",
      "Let's go champion!",
      "Another round, another victory!",
      "Focus up, fighter!",
      "Training time - make it count!",
    ];
    
    const randomMessage = motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];
    
    const title = roundNumber 
      ? `🥊 Round ${roundNumber} - Fight!`
      : "🥊 Round Start - Fight!";
    
    const message = taskName 
      ? `${taskName} - ${randomMessage}`
      : randomMessage;

    await showToast({
      style: Toast.Style.Animated,
      title,
      message,
    });
  }

  /**
   * Get rarity-specific configuration for achievements
   */
  private getRarityConfig(rarity: string) {
    switch (rarity) {
      case "legendary":
        return {
          emoji: "👑",
          color: "purple",
          celebration: "legendary",
        };
      case "epic":
        return {
          emoji: "⭐",
          color: "blue",
          celebration: "epic",
        };
      case "rare":
        return {
          emoji: "🏆",
          color: "green",
          celebration: "rare",
        };
      default:
        return {
          emoji: "🥊",
          color: "gray",
          celebration: "common",
        };
    }
  }

  /**
   * Show break time notification with boxing theme
   */
  public async showBreakTime(breakType: "short" | "long"): Promise<void> {
    const breakEmojis = ["🛋️", "☕", "🧘", "🚶"];
    const randomEmoji = breakEmojis[Math.floor(Math.random() * breakEmojis.length)];
    
    const title = breakType === "long" 
      ? `${randomEmoji} Corner Break - Recovery Time!`
      : `${randomEmoji} Corner Break - Quick Rest!`;
    
    const message = breakType === "long"
      ? "Take a longer break to recover your strength"
      : "Quick rest between rounds - stay hydrated!";

    await showToast({
      style: Toast.Style.Success,
      title,
      message,
    });
  }

  /**
   * Show encouragement for getting back on track after a break
   */
  public async showComebackEncouragement(): Promise<void> {
    const comebackMessages = [
      "Welcome back, champion!",
      "Ready for another round?",
      "The ring is waiting for you!",
      "Time to get back in the fight!",
      "Let's continue your training!",
    ];
    
    const randomMessage = comebackMessages[
      Math.floor(Math.random() * comebackMessages.length)
    ];

    await showToast({
      style: Toast.Style.Success,
      title: "🥊 Back in Action!",
      message: randomMessage,
    });
  }
}

// Export singleton instance
export const boxingNotificationService = new BoxingNotificationService();
