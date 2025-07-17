import { StateCreator } from "zustand";
import {
  RewardSystem,
  HyperfocusDetection,
  BreakActivity,
  Achievement,
  PomodoroStore,
  BoxingProgress,
  AchievementStats,
} from "../../types/timer";
import { adhdSupportService } from "../../services/features/adhd-support-service";
import { boxingAchievementService } from "../../services/features/boxing-achievement-service";
import { boxingNotificationService } from "../../services/features/boxing-notification-service";

/**
 * Default reward system state
 */
export const DEFAULT_REWARD_SYSTEM: RewardSystem = {
  points: 0,
  level: 1,
  streakMultiplier: 1,
  achievements: [],
  dailyGoal: 4, // 4 sessions per day
};

/**
 * Default hyperfocus detection state
 */
export const DEFAULT_HYPERFOCUS_DETECTION: HyperfocusDetection = {
  isActive: false,
  isHyperfocusDetected: false,
  consecutiveSessions: 0,
  totalFocusTime: 0,
  appSwitchFrequency: 0,
  warningShown: false,
};

/**
 * Default boxing progress state
 */
export const DEFAULT_BOXING_PROGRESS: BoxingProgress = {
  totalRounds: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTrainingTime: 0,
  championshipLevel: 1,
  dailyRoundsToday: 0,
  weeklyRoundsThisWeek: 0,
  monthlyRoundsThisMonth: 0,
  bestRoundDuration: 0,
  averageRoundDuration: 0,
  moodTrackingStreak: 0,
  earlyBirdRounds: 0,
  nightOwlRounds: 0,
  weekendWarriorRounds: 0,
  // New mood-related tracking fields
  totalMoodEntries: 0,
  moodEntriesWithNotes: 0,
  uniqueIntensityLevelsUsed: 0,
  uniqueMoodTypesLogged: 0,
  preSessionMoodEntries: 0,
  duringSessionMoodEntries: 0,
  postSessionMoodEntries: 0,
  standaloneMoodEntries: 0,
  // Mood-specific session counts
  energizedSessions: 0,
  focusedSessions: 0,
  calmSessions: 0,
  motivatedSessions: 0,
  neutralSessions: 0,
  tiredSessions: 0,
  stressedSessions: 0,
  overwhelmedSessions: 0,
  distractedSessions: 0,
  moodImprovementPatterns: 0,
};

/**
 * Achievement slice interface - defines achievement and ADHD support-related state and actions
 */
export interface AchievementSlice {
  // Achievement state
  rewardSystem: RewardSystem;
  hyperfocusDetection: HyperfocusDetection;
  breakActivities: BreakActivity[];
  currentBreakActivity?: BreakActivity;
  // Boxing-themed achievement state
  boxingProgress: BoxingProgress;

  // Achievement actions
  awardPoints: (points: number, reason: string) => void;
  unlockAchievement: (achievementId: string) => void;
  resetRewardSystem: () => void;
  updateDailyGoal: (goal: number) => void;

  // Hyperfocus detection actions
  checkHyperfocus: () => void;
  resetHyperfocusWarning: () => void;
  updateHyperfocusDetection: (updates: Partial<HyperfocusDetection>) => void;

  // Break activity actions
  selectBreakActivity: (activityId: string) => void;
  setCurrentBreakActivity: (activity: BreakActivity) => void;
  clearCurrentBreakActivity: () => void;
  completeBreakActivity: (rating?: 1 | 2 | 3 | 4 | 5) => void;
  suggestBreakActivity: (
    energyLevel?: number,
    moodState?: string,
    sessionDuration?: number
  ) => BreakActivity;

  // Session energy and mood actions
  updateSessionEnergyLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
  adaptSessionDuration: (newDuration: number, reason: string) => void;

  // Achievement utilities
  getUnlockedAchievements: () => Achievement[];
  getAvailableAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getCurrentLevel: () => number;
  getPointsToNextLevel: () => number;
  getStreakMultiplier: () => number;

  // Boxing-themed achievement methods
  updateBoxingProgress: () => void;
  getBoxingAchievements: () => Achievement[];
  checkBoxingAchievements: () => Achievement[];
  getAchievementStats: () => AchievementStats;
  getBoxingLevel: () => import("../../types/timer").BoxingLevel;
  getNextBoxingLevel: () => import("../../types/timer").BoxingLevel | null;
}

/**
 * Create achievement slice with all achievement and ADHD support-related functionality
 */
export const createAchievementSlice: StateCreator<
  PomodoroStore,
  [],
  [],
  AchievementSlice
> = (set, get) => ({
  // Initial state
  rewardSystem: DEFAULT_REWARD_SYSTEM,
  hyperfocusDetection: DEFAULT_HYPERFOCUS_DETECTION,
  breakActivities: adhdSupportService.getDefaultBreakActivities(),
  currentBreakActivity: undefined,
  boxingProgress: DEFAULT_BOXING_PROGRESS,

  // Achievement actions
  awardPoints: (points: number, _reason: string) => {
    const { rewardSystem, history } = get();
    const newPoints = rewardSystem.points + points;
    const newLevel = adhdSupportService.calculateLevel(newPoints);

    // Check for new achievements
    const newAchievements = adhdSupportService.checkAchievements(history, {
      ...rewardSystem,
      points: newPoints,
    });

    set({
      rewardSystem: {
        ...rewardSystem,
        points: newPoints,
        level: newLevel,
        achievements: [...rewardSystem.achievements, ...newAchievements],
      },
    });
  },

  unlockAchievement: (achievementId: string) => {
    const { rewardSystem } = get();
    const defaultAchievements = adhdSupportService.getDefaultAchievements();
    const achievement = defaultAchievements.find((a) => a.id === achievementId);

    if (
      achievement &&
      !rewardSystem.achievements.find((a) => a.id === achievementId)
    ) {
      set({
        rewardSystem: {
          ...rewardSystem,
          achievements: [
            ...rewardSystem.achievements,
            { ...achievement, unlockedAt: new Date() },
          ],
          points: rewardSystem.points + achievement.points,
        },
      });
    }
  },

  resetRewardSystem: () => {
    set({
      rewardSystem: DEFAULT_REWARD_SYSTEM,
    });
  },

  updateDailyGoal: (goal: number) => {
    const { rewardSystem } = get();
    set({
      rewardSystem: {
        ...rewardSystem,
        dailyGoal: goal,
      },
    });
  },

  // Hyperfocus detection actions
  checkHyperfocus: () => {
    const { hyperfocusDetection, history, config } = get();
    const recentSessions = history.slice(-5); // Check last 5 sessions
    const completedSessions = recentSessions.filter((s) => s.completed);

    const detection = adhdSupportService.detectHyperfocus(
      completedSessions.length,
      completedSessions.reduce((sum, s) => sum + s.duration, 0),
      hyperfocusDetection.lastBreakTime,
      config.maxConsecutiveSessions,
      config.forcedBreakAfterHours
    );

    set({
      hyperfocusDetection: {
        ...hyperfocusDetection,
        isHyperfocusDetected: detection.detected,
        consecutiveSessions: completedSessions.length,
        totalFocusTime: completedSessions.reduce(
          (sum, s) => sum + s.duration,
          0
        ),
      },
    });
  },

  resetHyperfocusWarning: () => {
    const { hyperfocusDetection } = get();
    set({
      hyperfocusDetection: {
        ...hyperfocusDetection,
        warningShown: false,
        lastBreakTime: new Date(),
      },
    });
  },

  updateHyperfocusDetection: (updates: Partial<HyperfocusDetection>) => {
    const { hyperfocusDetection } = get();
    set({
      hyperfocusDetection: {
        ...hyperfocusDetection,
        ...updates,
      },
    });
  },

  // Break activity actions
  selectBreakActivity: (activityId: string) => {
    const { breakActivities } = get();
    const activity = breakActivities.find((a) => a.id === activityId);
    if (activity) {
      set({
        currentBreakActivity: activity,
      });
    }
  },

  setCurrentBreakActivity: (activity: BreakActivity) => {
    set({
      currentBreakActivity: activity,
    });
  },

  clearCurrentBreakActivity: () => {
    set({
      currentBreakActivity: undefined,
    });
  },

  completeBreakActivity: (rating?: 1 | 2 | 3 | 4 | 5) => {
    const { currentBreakActivity, awardPoints } = get();
    if (currentBreakActivity) {
      // Award points for completing break activity
      const points = rating ? rating * 10 : 25; // Base 25 points, bonus for rating
      const reason = rating
        ? `Completed break activity with ${rating}/5 rating`
        : "Completed break activity";

      awardPoints(points, reason);

      set({
        currentBreakActivity: undefined,
      });
    }
  },

  suggestBreakActivity: (
    energyLevel?: number,
    moodState?: string,
    sessionDuration?: number
  ) => {
    return adhdSupportService.suggestBreakActivity(
      energyLevel,
      moodState,
      sessionDuration
    );
  },

  // Session energy and mood actions
  updateSessionEnergyLevel: (level: 1 | 2 | 3 | 4 | 5) => {
    const { currentSession } = get();
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          energyLevel: level,
        },
      });
    }
  },

  adaptSessionDuration: (newDuration: number, reason: string) => {
    const { currentSession } = get();
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          duration: newDuration * 60, // Convert minutes to seconds
          adaptiveAdjustments: {
            originalDuration: currentSession.duration,
            adjustedDuration: newDuration * 60,
            reason,
          },
        },
        timeRemaining: newDuration * 60,
      });
    }
  },

  // Achievement utilities
  getUnlockedAchievements: () => {
    const { rewardSystem } = get();
    return rewardSystem.achievements.filter((a) => a.unlockedAt);
  },

  getAvailableAchievements: () => {
    return adhdSupportService.getDefaultAchievements();
  },

  getLockedAchievements: () => {
    const { rewardSystem } = get();
    const availableAchievements = adhdSupportService.getDefaultAchievements();
    return availableAchievements.filter(
      (a) => !rewardSystem.achievements.some((ua) => ua.id === a.id)
    );
  },

  getCurrentLevel: () => {
    const { rewardSystem } = get();
    return rewardSystem.level;
  },

  getPointsToNextLevel: () => {
    const { rewardSystem } = get();
    const nextLevelPoints = adhdSupportService.calculateLevel(
      rewardSystem.points + 1
    );
    return nextLevelPoints > rewardSystem.level ? 100 : 0; // Simplified calculation
  },

  getStreakMultiplier: () => {
    const { rewardSystem } = get();
    return rewardSystem.streakMultiplier;
  },

  // Boxing-themed achievement methods
  updateBoxingProgress: () => {
    console.log("[AchievementSlice] Updating boxing progress...");
    const { history, moodEntries } = get();
    const newBoxingProgress = boxingAchievementService.calculateBoxingProgress(
      history,
      moodEntries
    );

    console.log("[AchievementSlice] Boxing progress calculated:", {
      totalRounds: newBoxingProgress.totalRounds,
      currentStreak: newBoxingProgress.currentStreak,
      championshipLevel: newBoxingProgress.championshipLevel,
    });

    set({
      boxingProgress: newBoxingProgress,
    });

    // Check for new boxing achievements
    const { rewardSystem } = get();
    const newAchievements = boxingAchievementService.checkAchievements(
      history,
      rewardSystem.achievements,
      newBoxingProgress
    );

    console.log("[AchievementSlice] Boxing achievements check result:", {
      newAchievementsCount: newAchievements.length,
      newAchievements: newAchievements.map((a) => ({
        id: a.id,
        name: a.name,
        points: a.points,
      })),
    });

    if (newAchievements.length > 0) {
      const totalNewPoints = newAchievements.reduce(
        (sum, achievement) => sum + achievement.points,
        0
      );

      const newLevel = boxingAchievementService.calculateBoxingLevel(
        rewardSystem.points + totalNewPoints
      ).level;

      console.log("[AchievementSlice] Awarding boxing achievements:", {
        totalNewPoints,
        newLevel,
        previousLevel: rewardSystem.level,
      });

      set({
        rewardSystem: {
          ...rewardSystem,
          achievements: [...rewardSystem.achievements, ...newAchievements],
          points: rewardSystem.points + totalNewPoints,
          level: newLevel,
        },
      });

      // Show achievement notifications (with error handling)
      try {
        boxingNotificationService.showMultipleAchievements(newAchievements);
      } catch (error) {
        console.error("Failed to show achievement notifications:", error);
      }
    }
  },

  getBoxingAchievements: () => {
    return boxingAchievementService.getBoxingAchievements();
  },

  checkBoxingAchievements: () => {
    const { history, rewardSystem, boxingProgress } = get();
    return boxingAchievementService.checkAchievements(
      history,
      rewardSystem.achievements,
      boxingProgress
    );
  },

  getAchievementStats: (): AchievementStats => {
    const { rewardSystem } = get();
    const allAchievements = boxingAchievementService.getBoxingAchievements();
    const currentLevel = boxingAchievementService.calculateBoxingLevel(
      rewardSystem.points
    );
    const levels = boxingAchievementService.getBoxingLevels();
    const nextLevel = levels.find(
      (level) => level.level === currentLevel.level + 1
    );

    // Get unlocked achievement IDs for boxing achievements only
    const unlockedIds = rewardSystem.achievements.map((a) => a.id);
    const unlockedBoxingAchievements = allAchievements.filter((achievement) =>
      unlockedIds.includes(achievement.id)
    );

    // Count unlocked achievements by rarity (only boxing achievements)
    const unlockedByRarity = unlockedBoxingAchievements.reduce(
      (acc, achievement) => {
        acc[achievement.rarity]++;
        return acc;
      },
      { common: 0, rare: 0, epic: 0, legendary: 0 }
    );

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements: unlockedBoxingAchievements.length,
      commonAchievements: unlockedByRarity.common,
      rareAchievements: unlockedByRarity.rare,
      epicAchievements: unlockedByRarity.epic,
      legendaryAchievements: unlockedByRarity.legendary,
      totalPoints: rewardSystem.points,
      currentLevel,
      nextLevel,
      pointsToNextLevel: boxingAchievementService.getPointsToNextLevel(
        rewardSystem.points
      ),
      completionPercentage: Math.round(
        (unlockedBoxingAchievements.length / allAchievements.length) * 100
      ),
    };
  },

  getBoxingLevel: () => {
    const { rewardSystem } = get();
    return boxingAchievementService.calculateBoxingLevel(rewardSystem.points);
  },

  getNextBoxingLevel: () => {
    const { rewardSystem } = get();
    const currentLevel = boxingAchievementService.calculateBoxingLevel(
      rewardSystem.points
    );
    const levels = boxingAchievementService.getBoxingLevels();
    return (
      levels.find((level) => level.level === currentLevel.level + 1) || null
    );
  },
});
