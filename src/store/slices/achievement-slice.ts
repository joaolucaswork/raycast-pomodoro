import { StateCreator } from "zustand";
import {
  RewardSystem,
  HyperfocusDetection,
  BreakActivity,
  Achievement,
  PomodoroStore,
} from "../../types/timer";
import { adhdSupportService } from "../../services/adhd-support-service";

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
  isHyperfocusDetected: false,
  consecutiveSessions: 0,
  totalFocusTime: 0,
  appSwitchFrequency: 0,
  warningShown: false,
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

  completeBreakActivity: (rating?: 1 | 2 | 3 | 4 | 5) => {
    const { currentBreakActivity, rewardSystem } = get();
    if (currentBreakActivity) {
      // Award points for completing break activity
      const points = rating ? rating * 10 : 25; // Base 25 points, bonus for rating
      set({
        rewardSystem: {
          ...rewardSystem,
          points: rewardSystem.points + points,
        },
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
});
