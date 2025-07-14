import { Icon, Color } from "@raycast/api";
import {
  Achievement,
  AchievementCategory,
  AchievementRequirement,
  BoxingProgress,
  BoxingLevel,
  AchievementStats,
  TimerSession,
  RewardSystem,
} from "../../types/timer";

/**
 * Boxing-themed achievement service for "Another Round" extension
 * Implements the "knocking out procrastination" achievement system
 */
export class BoxingAchievementService {
  /**
   * Get all boxing-themed achievements
   */
  public getBoxingAchievements(): Achievement[] {
    return [
      // Training Milestones (Basic Achievements)
      {
        id: "first-bell",
        name: "First Bell",
        description: "Complete your first boxing round against procrastination",
        icon: Icon.Play,
        rarity: "common",
        points: 25,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 1 }],
        isBoxingThemed: true,
      },
      {
        id: "training-begins",
        name: "Training Begins",
        description: "Complete 5 boxing rounds - your training is underway",
        icon: Icon.Hammer,
        rarity: "common",
        points: 50,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 5 }],
        isBoxingThemed: true,
      },
      {
        id: "getting-stronger",
        name: "Getting Stronger",
        description: "Complete 25 boxing rounds - you're building strength",
        icon: Icon.BullsEye,
        rarity: "rare",
        points: 100,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 25 }],
        isBoxingThemed: true,
      },
      {
        id: "seasoned-fighter",
        name: "Seasoned Fighter",
        description: "Complete 100 boxing rounds - you're a seasoned fighter",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 250,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 100 }],
        isBoxingThemed: true,
      },
      {
        id: "champion-material",
        name: "Champion Material",
        description: "Complete 500 boxing rounds - you have champion potential",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 500,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 500 }],
        isBoxingThemed: true,
      },

      // Knockout Streaks (Consistency)
      {
        id: "double-jab",
        name: "Double Jab",
        description: "Complete 2 rounds in a row - nice combo!",
        icon: Icon.ArrowRight,
        rarity: "common",
        points: 30,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 2 }],
        isBoxingThemed: true,
      },
      {
        id: "combo-strike",
        name: "Combo Strike",
        description: "Complete 5 rounds in a row - excellent combination",
        icon: Icon.Bolt,
        rarity: "rare",
        points: 75,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 5 }],
        isBoxingThemed: true,
      },
      {
        id: "power-punch",
        name: "Power Punch",
        description: "Complete 10 rounds in a row - devastating power",
        icon: Icon.Star,
        rarity: "epic",
        points: 150,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 10 }],
        isBoxingThemed: true,
      },
      {
        id: "knockout-artist",
        name: "Knockout Artist",
        description: "Complete 20 rounds in a row - you're a knockout artist",
        icon: Icon.Star,
        rarity: "epic",
        points: 300,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 20 }],
        isBoxingThemed: true,
      },
      {
        id: "undefeated",
        name: "Undefeated",
        description: "Complete 50 rounds in a row - undefeated champion",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 750,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 50 }],
        isBoxingThemed: true,
      },

      // Championship Belts (Major Milestones)
      {
        id: "rookie-belt",
        name: "Rookie Belt",
        description: "Complete 10 hours of training - earned your rookie belt",
        icon: Icon.Trophy,
        rarity: "rare",
        points: 100,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 600 }], // 10 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "amateur-belt",
        name: "Amateur Belt",
        description: "Complete 25 hours of training - amateur champion",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 200,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 1500 }], // 25 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "professional-belt",
        name: "Professional Belt",
        description: "Complete 50 hours of training - professional fighter",
        icon: Icon.Crown,
        rarity: "epic",
        points: 400,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 3000 }], // 50 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "championship-belt",
        name: "Championship Belt",
        description: "Complete 100 hours of training - world champion",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 800,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 6000 }], // 100 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "hall-of-fame",
        name: "Hall of Fame",
        description: "Complete 250 hours of training - hall of fame legend",
        icon: Icon.Star,
        rarity: "legendary",
        points: 1500,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 15000 }], // 250 hours in minutes
        isBoxingThemed: true,
      },

      // Daily Training (Daily Goals)
      {
        id: "morning-warrior",
        name: "Morning Warrior",
        description: "Complete 3 rounds before noon - morning champion",
        icon: Icon.Sun,
        rarity: "rare",
        points: 75,
        category: "daily_training",
        requirements: [
          { type: "daily_goal", value: 3, timeframe: "daily" },
          { type: "time_of_day", value: 12, metadata: { before: true } },
        ],
        isBoxingThemed: true,
      },
      {
        id: "afternoon-champion",
        name: "Afternoon Champion",
        description: "Complete 5 rounds in one day - daily champion",
        icon: Icon.BullsEye,
        rarity: "rare",
        points: 100,
        category: "daily_training",
        requirements: [{ type: "daily_goal", value: 5, timeframe: "daily" }],
        isBoxingThemed: true,
      },
      {
        id: "training-beast",
        name: "Training Beast",
        description: "Complete 8 rounds in one day - training beast",
        icon: Icon.Bolt,
        rarity: "epic",
        points: 200,
        category: "daily_training",
        requirements: [{ type: "daily_goal", value: 8, timeframe: "daily" }],
        isBoxingThemed: true,
      },
      {
        id: "iron-will",
        name: "Iron Will",
        description: "Complete 12 rounds in one day - iron will",
        icon: Icon.Hammer,
        rarity: "legendary",
        points: 400,
        category: "daily_training",
        requirements: [{ type: "daily_goal", value: 12, timeframe: "daily" }],
        isBoxingThemed: true,
      },

      // Endurance Challenges (Long Sessions)
      {
        id: "stamina-builder",
        name: "Stamina Builder",
        description: "Complete a 45-minute round - building stamina",
        icon: Icon.Clock,
        rarity: "rare",
        points: 75,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 45 }],
        isBoxingThemed: true,
      },
      {
        id: "endurance-fighter",
        name: "Endurance Fighter",
        description: "Complete a 60-minute round - endurance fighter",
        icon: Icon.Clock,
        rarity: "epic",
        points: 150,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 60 }],
        isBoxingThemed: true,
      },
      {
        id: "marathon-boxer",
        name: "Marathon Boxer",
        description: "Complete a 90-minute round - marathon boxer",
        icon: Icon.Stopwatch,
        rarity: "epic",
        points: 250,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 90 }],
        isBoxingThemed: true,
      },
      {
        id: "iron-man",
        name: "Iron Man",
        description: "Complete a 2-hour round - iron man endurance",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 500,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 120 }],
        isBoxingThemed: true,
      },

      // Consistency Championships (Weekly/Monthly)
      {
        id: "weekly-warrior",
        name: "Weekly Warrior",
        description: "Complete rounds 5 days in a week - weekly warrior",
        icon: Icon.Calendar,
        rarity: "rare",
        points: 100,
        category: "consistency_championships",
        requirements: [
          { type: "consecutive_days", value: 5, timeframe: "weekly" },
        ],
        isBoxingThemed: true,
      },
      {
        id: "training-dedication",
        name: "Training Dedication",
        description: "Complete rounds 7 days in a week - full dedication",
        icon: Icon.CheckCircle,
        rarity: "epic",
        points: 200,
        category: "consistency_championships",
        requirements: [
          { type: "consecutive_days", value: 7, timeframe: "weekly" },
        ],
        isBoxingThemed: true,
      },
      {
        id: "monthly-champion",
        name: "Monthly Champion",
        description: "Complete 50 rounds in a month - monthly champion",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 300,
        category: "consistency_championships",
        requirements: [
          { type: "sessions_completed", value: 50, timeframe: "monthly" },
        ],
        isBoxingThemed: true,
      },
      {
        id: "consistency-king",
        name: "Consistency King",
        description:
          "Complete rounds for 30 consecutive days - consistency king",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 600,
        category: "consistency_championships",
        requirements: [
          { type: "consecutive_days", value: 30, timeframe: "all_time" },
        ],
        isBoxingThemed: true,
      },

      // Special Achievements (Unique)
      {
        id: "early-bird",
        name: "Early Bird",
        description: "Complete 10 rounds before 8 AM - early bird fighter",
        icon: Icon.Sun,
        rarity: "rare",
        points: 100,
        category: "special_achievements",
        requirements: [
          { type: "sessions_completed", value: 10 },
          { type: "time_of_day", value: 8, metadata: { before: true } },
        ],
        isBoxingThemed: true,
      },
      {
        id: "night-owl",
        name: "Night Owl",
        description: "Complete 10 rounds after 10 PM - night owl fighter",
        icon: Icon.Moon,
        rarity: "rare",
        points: 100,
        category: "special_achievements",
        requirements: [
          { type: "sessions_completed", value: 10 },
          { type: "time_of_day", value: 22, metadata: { after: true } },
        ],
        isBoxingThemed: true,
      },
      {
        id: "weekend-warrior",
        name: "Weekend Warrior",
        description: "Complete 20 rounds on weekends - weekend warrior",
        icon: Icon.Calendar,
        rarity: "epic",
        points: 150,
        category: "special_achievements",
        requirements: [{ type: "weekend_sessions", value: 20 }],
        isBoxingThemed: true,
      },
      {
        id: "mood-master",
        name: "Mood Master",
        description: "Track mood for 50 sessions - emotional intelligence",
        icon: Icon.Heart,
        rarity: "epic",
        points: 200,
        category: "mood_mastery",
        requirements: [{ type: "mood_tracking", value: 50 }],
        isBoxingThemed: true,
      },
      {
        id: "focus-ninja",
        name: "Focus Ninja",
        description: "Complete 100 rounds without interruption - focus ninja",
        icon: Icon.BullsEye,
        rarity: "legendary",
        points: 500,
        category: "special_achievements",
        requirements: [
          {
            type: "sessions_completed",
            value: 100,
            metadata: { uninterrupted: true },
          },
        ],
        isBoxingThemed: true,
      },
    ];
  }

  /**
   * Get boxing levels progression system
   */
  public getBoxingLevels(): BoxingLevel[] {
    return [
      {
        level: 1,
        title: "Rookie",
        description: "Just starting your boxing journey",
        minPoints: 0,
        maxPoints: 100,
        icon: Icon.Play,
        color: Color.SecondaryText,
      },
      {
        level: 2,
        title: "Amateur",
        description: "Learning the ropes",
        minPoints: 101,
        maxPoints: 500,
        icon: Icon.Hammer,
        color: Color.Orange,
      },
      {
        level: 3,
        title: "Professional",
        description: "Skilled fighter",
        minPoints: 501,
        maxPoints: 1500,
        icon: Icon.Trophy,
        color: Color.Blue,
      },
      {
        level: 4,
        title: "Champion",
        description: "Elite level fighter",
        minPoints: 1501,
        maxPoints: 3000,
        icon: Icon.Crown,
        color: Color.Purple,
      },
      {
        level: 5,
        title: "Hall of Famer",
        description: "Legendary status achieved",
        minPoints: 3001,
        maxPoints: Infinity,
        icon: Icon.Star,
        color: Color.Yellow,
      },
    ];
  }

  /**
   * Calculate current boxing level based on points
   */
  public calculateBoxingLevel(points: number): BoxingLevel {
    const levels = this.getBoxingLevels();
    return (
      levels.find(
        (level) => points >= level.minPoints && points <= level.maxPoints
      ) || levels[0]
    );
  }

  /**
   * Calculate points needed for next level
   */
  public getPointsToNextLevel(points: number): number {
    const currentLevel = this.calculateBoxingLevel(points);
    const levels = this.getBoxingLevels();
    const nextLevel = levels.find(
      (level) => level.level === currentLevel.level + 1
    );

    if (!nextLevel) return 0; // Already at max level
    return nextLevel.minPoints - points;
  }

  /**
   * Calculate boxing progress from session history
   */
  public calculateBoxingProgress(history: TimerSession[]): BoxingProgress {
    const completedSessions = history.filter((session) => session.completed);
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate basic stats
    const totalRounds = completedSessions.length;
    const totalTrainingTime = completedSessions.reduce(
      (total, session) => total + session.duration,
      0
    );

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort sessions by start time (newest first)
    const sortedSessions = [...completedSessions].sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Calculate current streak (from most recent session backwards)
    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      const sessionDate = new Date(session.startTime);

      if (i === 0) {
        // First session (most recent)
        currentStreak = 1;
        tempStreak = 1;
      } else {
        const prevSession = sortedSessions[i - 1];
        const prevDate = new Date(prevSession.startTime);
        const daysDiff = Math.floor(
          (prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 1) {
          tempStreak++;
          if (i === 1) currentStreak = tempStreak; // Update current streak only for consecutive recent sessions
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 1;
          if (i === 1) currentStreak = 1; // Reset current streak if there's a gap
        }
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

    // Calculate time-based stats
    const todaysSessions = completedSessions.filter(
      (session) => new Date(session.startTime) >= startOfToday
    );
    const weekSessions = completedSessions.filter(
      (session) => new Date(session.startTime) >= startOfWeek
    );
    const monthSessions = completedSessions.filter(
      (session) => new Date(session.startTime) >= startOfMonth
    );

    // Calculate special achievement stats
    const earlyBirdRounds = completedSessions.filter((session) => {
      const hour = new Date(session.startTime).getHours();
      return hour < 8;
    }).length;

    const nightOwlRounds = completedSessions.filter((session) => {
      const hour = new Date(session.startTime).getHours();
      return hour >= 22;
    }).length;

    const weekendWarriorRounds = completedSessions.filter((session) => {
      const day = new Date(session.startTime).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;

    // Calculate mood tracking streak
    let moodTrackingStreak = 0;
    // This would need to be calculated based on mood entries, simplified for now

    // Calculate durations
    const durations = completedSessions.map((session) => session.duration);
    const bestRoundDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const averageRoundDuration =
      durations.length > 0
        ? durations.reduce((sum, duration) => sum + duration, 0) /
          durations.length
        : 0;

    return {
      totalRounds,
      currentStreak,
      longestStreak,
      totalTrainingTime,
      championshipLevel: this.calculateBoxingLevel(totalRounds * 10).level, // Simplified calculation
      dailyRoundsToday: todaysSessions.length,
      weeklyRoundsThisWeek: weekSessions.length,
      monthlyRoundsThisMonth: monthSessions.length,
      lastRoundDate:
        sortedSessions.length > 0
          ? new Date(sortedSessions[0].startTime)
          : undefined,
      bestRoundDuration,
      averageRoundDuration,
      moodTrackingStreak,
      earlyBirdRounds,
      nightOwlRounds,
      weekendWarriorRounds,
    };
  }

  /**
   * Check which achievements should be unlocked based on current progress
   */
  public checkAchievements(
    history: TimerSession[],
    currentAchievements: Achievement[],
    boxingProgress: BoxingProgress
  ): Achievement[] {
    const allAchievements = this.getBoxingAchievements();
    const unlockedIds = currentAchievements.map((a) => a.id);
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      let shouldUnlock = true;

      for (const requirement of achievement.requirements) {
        if (!this.checkRequirement(requirement, boxingProgress, history)) {
          shouldUnlock = false;
          break;
        }
      }

      if (shouldUnlock) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date(),
        });
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if a specific requirement is met
   */
  private checkRequirement(
    requirement: AchievementRequirement,
    progress: BoxingProgress,
    history: TimerSession[]
  ): boolean {
    switch (requirement.type) {
      case "sessions_completed":
        if (requirement.timeframe === "daily") {
          return progress.dailyRoundsToday >= requirement.value;
        } else if (requirement.timeframe === "weekly") {
          return progress.weeklyRoundsThisWeek >= requirement.value;
        } else if (requirement.timeframe === "monthly") {
          return progress.monthlyRoundsThisMonth >= requirement.value;
        }
        return progress.totalRounds >= requirement.value;

      case "streak_length":
        return progress.currentStreak >= requirement.value;

      case "total_time":
        return progress.totalTrainingTime >= requirement.value;

      case "daily_goal":
        return progress.dailyRoundsToday >= requirement.value;

      case "session_duration":
        return progress.bestRoundDuration >= requirement.value;

      case "mood_tracking":
        return progress.moodTrackingStreak >= requirement.value;

      case "time_of_day":
        if (requirement.metadata?.before) {
          return (
            progress.earlyBirdRounds >= (requirement.metadata.sessions || 10)
          );
        } else if (requirement.metadata?.after) {
          return (
            progress.nightOwlRounds >= (requirement.metadata.sessions || 10)
          );
        }
        return false;

      case "weekend_sessions":
        return progress.weekendWarriorRounds >= requirement.value;

      case "consecutive_days":
        // This would need more sophisticated calculation based on session dates
        // Simplified for now
        return progress.currentStreak >= requirement.value;

      default:
        return false;
    }
  }
}

// Export singleton instance
export const boxingAchievementService = new BoxingAchievementService();
