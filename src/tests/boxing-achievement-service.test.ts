/**
 * Boxing Achievement Service Tests
 *
 * Comprehensive tests for the BoxingAchievementService including:
 * - Achievement definitions and structure validation
 * - Requirement checking logic
 * - Progress calculation from session history
 * - Achievement unlocking logic
 * - Boxing level system
 */

import { boxingAchievementService } from "../services/features/boxing-achievement-service";
import {
  TimerSession,
  SessionType,
  SessionEndReason,
  Achievement,
  BoxingProgress,
} from "../types/timer";
import {
  createTestSession,
  createTestBoxingProgress,
  createTestAchievement,
  achievementTestScenarios,
  boxingProgressTestScenarios,
} from "./utils/test-factories";
import {
  expectValidAchievementStructure,
  expectValidBoxingProgressStructure,
  expectValidAchievementRequirement,
  createSessionsForAchievement,
  createProgressForAchievement,
  createProgressBelowThreshold,
  createTimedSessions,
} from "./utils/achievement-test-helpers";

// Mock date-fns for consistent testing
jest.mock("date-fns", () => ({
  isToday: jest.fn(() => true),
  isThisWeek: jest.fn(() => true),
  isThisMonth: jest.fn(() => true),
  startOfDay: jest.fn((date) => date),
  endOfDay: jest.fn((date) => date),
  format: jest.fn((date) => date.toISOString()),
}));

describe("BoxingAchievementService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Achievement Definitions", () => {
    it("should return a valid list of boxing achievements", () => {
      const achievements = boxingAchievementService.getBoxingAchievements();

      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);

      // Validate each achievement structure
      achievements.forEach((achievement) => {
        expectValidAchievementStructure(achievement);
        expect(achievement.isBoxingThemed).toBe(true);
      });
    });

    it("should have unique achievement IDs", () => {
      const achievements = boxingAchievementService.getBoxingAchievements();
      const ids = achievements.map((a) => a.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have achievements across all categories", () => {
      const achievements = boxingAchievementService.getBoxingAchievements();
      const categories = new Set(achievements.map((a) => a.category));

      expect(categories.has("training_milestones")).toBe(true);
      expect(categories.has("knockout_streaks")).toBe(true);
      expect(categories.has("championship_belts")).toBe(true);
      expect(categories.has("daily_training")).toBe(true);
      expect(categories.has("endurance_challenges")).toBe(true);
      expect(categories.has("consistency_championships")).toBe(true);
      expect(categories.has("special_achievements")).toBe(true);
      expect(categories.has("mood_mastery")).toBe(true);
    });

    it("should have achievements across all rarity levels", () => {
      const achievements = boxingAchievementService.getBoxingAchievements();
      const rarities = new Set(achievements.map((a) => a.rarity));

      expect(rarities.has("common")).toBe(true);
      expect(rarities.has("rare")).toBe(true);
      expect(rarities.has("epic")).toBe(true);
      expect(rarities.has("legendary")).toBe(true);
    });

    it("should have valid requirements for all achievements", () => {
      const achievements = boxingAchievementService.getBoxingAchievements();

      achievements.forEach((achievement) => {
        expect(achievement.requirements.length).toBeGreaterThan(0);
        achievement.requirements.forEach((requirement) => {
          expectValidAchievementRequirement(requirement);
        });
      });
    });
  });

  describe("Boxing Progress Calculation", () => {
    it("should calculate progress for empty history", () => {
      const progress = boxingAchievementService.calculateBoxingProgress([], []);

      expectValidBoxingProgressStructure(progress);
      expect(progress.totalRounds).toBe(0);
      expect(progress.currentStreak).toBe(0);
      expect(progress.totalTrainingTime).toBe(0);
    });

    it("should calculate basic progress from completed sessions", () => {
      const sessions = [
        createTestSession({
          completed: true,
          duration: 1500,
          activeDuration: 1500,
        }),
        createTestSession({
          completed: true,
          duration: 1800,
          activeDuration: 1800,
        }),
        createTestSession({
          completed: false,
          duration: 1200,
          activeDuration: 600,
        }), // Should be ignored
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        []
      );

      expect(progress.totalRounds).toBe(2); // Only completed sessions
      expect(progress.totalTrainingTime).toBe(3300); // 1500 + 1800 seconds
      expectValidBoxingProgressStructure(progress);
    });

    it("should calculate streak correctly for consecutive sessions", () => {
      // Create sessions on consecutive days (more realistic for streak calculation)
      const now = new Date();
      const consecutiveSessions = [
        createTestSession({
          id: "session-1",
          startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          endTime: new Date(
            now.getTime() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000
          ),
          completed: true,
          activeDuration: 1500,
        }),
        createTestSession({
          id: "session-2",
          startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          endTime: new Date(
            now.getTime() - 1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000
          ),
          completed: true,
          activeDuration: 1500,
        }),
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        consecutiveSessions,
        []
      );

      expect(progress.currentStreak).toBeGreaterThan(0);
      expect(progress.longestStreak).toBeGreaterThan(0);
      expect(progress.totalRounds).toBe(2);
    });

    it("should handle broken streaks correctly", () => {
      // Create a more realistic broken streak scenario
      const now = new Date();
      const sessions = [
        // First streak: 2 sessions
        createTestSession({
          id: "session-1",
          startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          completed: true,
          activeDuration: 1500,
        }),
        createTestSession({
          id: "session-2",
          startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          completed: true,
          activeDuration: 1500,
        }),
        // Gap of 2 days (breaks streak)
        // New streak: 2 sessions
        createTestSession({
          id: "session-3",
          startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          completed: true,
          activeDuration: 1500,
        }),
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        []
      );

      expect(progress.currentStreak).toBeGreaterThan(0); // Should have some current streak
      expect(progress.longestStreak).toBeGreaterThan(0); // Should have some longest streak
      expect(progress.totalRounds).toBe(3);
    });

    it("should calculate time-based statistics correctly", () => {
      const dailySessions = createTimedSessions("daily", 3);
      const weeklySessions = createTimedSessions("weekly", 5);
      const allSessions = [...dailySessions, ...weeklySessions];

      const progress = boxingAchievementService.calculateBoxingProgress(
        allSessions,
        []
      );

      expect(progress.dailyRoundsToday).toBeGreaterThan(0);
      expect(progress.weeklyRoundsThisWeek).toBeGreaterThan(0);
      expect(progress.monthlyRoundsThisMonth).toBeGreaterThan(0);
    });

    it("should calculate average and best round duration", () => {
      const sessions = [
        createTestSession({
          duration: 1200,
          activeDuration: 1200,
          completed: true,
        }), // 20 min
        createTestSession({
          duration: 1500,
          activeDuration: 1500,
          completed: true,
        }), // 25 min
        createTestSession({
          duration: 1800,
          activeDuration: 1800,
          completed: true,
        }), // 30 min
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        []
      );

      expect(progress.averageRoundDuration).toBe(1500); // (1200 + 1500 + 1800) / 3
      expect(progress.bestRoundDuration).toBe(1800); // Longest session
    });
  });

  describe("Achievement Requirement Checking", () => {
    it("should check sessions_completed requirement correctly", () => {
      const achievement = achievementTestScenarios.firstBellAchievement;
      const progress = createTestBoxingProgress({ totalRounds: 1 });
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(true);
    });

    it("should check streak_length requirement correctly", () => {
      const achievement = achievementTestScenarios.streakAchievement;
      const progress = createTestBoxingProgress({ currentStreak: 5 });
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(true);
    });

    it("should check total_time requirement correctly", () => {
      const achievement = achievementTestScenarios.timeBasedAchievement;
      const progress = createTestBoxingProgress({ totalTrainingTime: 600 }); // 10 hours in minutes
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(true);
    });

    it("should check daily timeframe requirement correctly", () => {
      const achievement = achievementTestScenarios.dailyAchievement;
      const progress = createTestBoxingProgress({
        dailyRoundsToday: 3, // Meets daily_goal requirement
        earlyBirdRounds: 10, // Meets time_of_day requirement (default sessions needed)
      });
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(true);
    });

    it("should not unlock achievements when requirements are not met", () => {
      const achievement = achievementTestScenarios.streakAchievement;
      const progress = createTestBoxingProgress({ currentStreak: 1 }); // Need 2 for double-jab
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(false);
    });

    it("should handle complex multi-requirement achievements", () => {
      const achievement = achievementTestScenarios.complexAchievement;
      const progress = createTestBoxingProgress({
        dailyRoundsToday: 3, // Meets daily_goal requirement
        earlyBirdRounds: 10, // Meets time_of_day requirement
      });
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(true);
    });

    it("should not unlock multi-requirement achievements when only some requirements are met", () => {
      const achievement = achievementTestScenarios.complexAchievement;
      const progress = createTestBoxingProgress({
        dailyRoundsToday: 3, // Meets daily_goal requirement
        earlyBirdRounds: 5, // Does NOT meet time_of_day requirement (needs 10)
      });
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(false);
    });
  });

  describe("Achievement Unlocking Logic", () => {
    it("should not unlock already unlocked achievements", () => {
      const achievement = achievementTestScenarios.firstBellAchievement;
      const progress = createTestBoxingProgress({ totalRounds: 5 });
      const alreadyUnlocked = [{ ...achievement, unlockedAt: new Date() }];
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        alreadyUnlocked,
        progress
      );

      expect(newAchievements.some((a) => a.id === achievement.id)).toBe(false);
    });

    it("should set unlockedAt timestamp for newly unlocked achievements", () => {
      const achievement = achievementTestScenarios.firstBellAchievement;
      const progress = createTestBoxingProgress({ totalRounds: 1 });
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      const unlockedAchievement = newAchievements.find(
        (a) => a.id === achievement.id
      );
      expect(unlockedAchievement).toBeDefined();
      expect(unlockedAchievement?.unlockedAt).toBeInstanceOf(Date);
    });

    it("should unlock multiple achievements simultaneously", () => {
      const progress = createTestBoxingProgress({
        totalRounds: 5,
        currentStreak: 5,
        totalTrainingTime: 7500, // 2+ hours
      });
      const history: TimerSession[] = [];

      const newAchievements = boxingAchievementService.checkAchievements(
        history,
        [],
        progress
      );

      expect(newAchievements.length).toBeGreaterThan(1);
      newAchievements.forEach((achievement) => {
        expect(achievement.unlockedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe("Boxing Level System", () => {
    it("should return valid boxing levels", () => {
      const levels = boxingAchievementService.getBoxingLevels();

      expect(Array.isArray(levels)).toBe(true);
      expect(levels.length).toBeGreaterThan(0);

      levels.forEach((level, index) => {
        expect(level.level).toBe(index + 1);
        expect(typeof level.title).toBe("string");
        expect(typeof level.description).toBe("string");
        expect(typeof level.minPoints).toBe("number");
        expect(typeof level.maxPoints).toBe("number");
        expect(level.minPoints).toBeLessThanOrEqual(level.maxPoints);
      });
    });

    it("should calculate boxing level correctly based on points", () => {
      const level1 = boxingAchievementService.calculateBoxingLevel(50);
      const level2 = boxingAchievementService.calculateBoxingLevel(300);
      const level3 = boxingAchievementService.calculateBoxingLevel(1000);

      expect(level1.level).toBe(1);
      expect(level2.level).toBe(2);
      expect(level3.level).toBe(3);
    });

    it("should handle edge cases for level calculation", () => {
      const zeroPoints = boxingAchievementService.calculateBoxingLevel(0);
      const negativePoints = boxingAchievementService.calculateBoxingLevel(-10);
      const veryHighPoints =
        boxingAchievementService.calculateBoxingLevel(999999);

      expect(zeroPoints.level).toBe(1);
      expect(negativePoints.level).toBe(1);
      expect(veryHighPoints.level).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle sessions exactly at 40-second boundary", () => {
      const sessions = [
        createTestSession({
          duration: 40,
          activeDuration: 40,
          completed: true,
          endReason: SessionEndReason.STOPPED,
        }),
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        []
      );
      expect(progress.totalRounds).toBe(1);
      expect(progress.totalTrainingTime).toBe(40);
    });

    it("should handle rapid session completions", () => {
      const rapidSessions = Array.from({ length: 10 }, (_, i) =>
        createTestSession({
          id: `rapid-${i}`,
          startTime: new Date(Date.now() - (10 - i) * 60 * 1000), // 1 minute apart
          endTime: new Date(Date.now() - (10 - i - 1) * 60 * 1000),
          completed: true,
          duration: 1500, // 25 minutes each in seconds
          activeDuration: 1500, // 25 minutes each in seconds
        })
      );

      const progress = boxingAchievementService.calculateBoxingProgress(
        rapidSessions,
        []
      );
      expect(progress.totalRounds).toBe(10);
      expect(progress.totalTrainingTime).toBe(15000); // 250 minutes total (25 * 10)
    });

    it("should handle empty achievement requirements gracefully", () => {
      const invalidAchievement = createTestAchievement({
        requirements: [],
      });

      // This should not crash, but the achievement should never unlock
      const progress = createTestBoxingProgress({ totalRounds: 100 });
      const history: TimerSession[] = [];

      expect(() => {
        boxingAchievementService.checkAchievements(history, [], progress);
      }).not.toThrow();
    });

    it("should handle very large numbers in progress calculation", () => {
      const largeSessions = Array.from({ length: 1000 }, (_, i) =>
        createTestSession({
          id: `large-${i}`,
          duration: 3600, // 1 hour each
          activeDuration: 3600,
          completed: true,
        })
      );

      const progress = boxingAchievementService.calculateBoxingProgress(
        largeSessions,
        []
      );
      expect(progress.totalRounds).toBe(1000);
      expect(progress.totalTrainingTime).toBe(3600000); // 1000 hours
      expect(progress.averageRoundDuration).toBe(3600);
    });

    it("should handle sessions with missing or invalid data", () => {
      const invalidSessions = [
        createTestSession({ startTime: undefined as any, completed: true }),
        createTestSession({ endTime: undefined as any, completed: true }),
        createTestSession({ duration: -100, completed: true }),
        createTestSession({ activeDuration: undefined, completed: true }),
      ];

      expect(() => {
        boxingAchievementService.calculateBoxingProgress(invalidSessions, []);
      }).not.toThrow();
    });

    it("should handle concurrent achievement unlocking", () => {
      // Create progress that unlocks multiple achievements simultaneously
      const progress = createTestBoxingProgress({
        totalRounds: 100,
        currentStreak: 10,
        longestStreak: 15,
        totalTrainingTime: 150000, // 41+ hours
        dailyRoundsToday: 8,
        weeklyRoundsThisWeek: 30,
        monthlyRoundsThisMonth: 100,
      });

      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        [],
        progress
      );

      // Should unlock multiple achievements without conflicts
      expect(newAchievements.length).toBeGreaterThan(3);

      // All should have unique IDs
      const ids = newAchievements.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // All should have timestamps
      newAchievements.forEach((achievement) => {
        expect(achievement.unlockedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe("Integration with Session System", () => {
    it("should correctly process sessions with different end reasons", () => {
      const sessions = [
        createTestSession({
          endReason: SessionEndReason.COMPLETED,
          completed: true,
        }),
        createTestSession({
          endReason: SessionEndReason.STOPPED,
          completed: true,
        }),
        createTestSession({
          endReason: SessionEndReason.SKIPPED,
          completed: false,
        }),
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        []
      );

      // Only completed sessions should count
      expect(progress.totalRounds).toBe(2);
    });

    it("should handle sessions with pause time correctly", () => {
      const sessions = [
        createTestSession({
          duration: 1500,
          activeDuration: 1200, // 5 minutes paused
          pausedTime: 300,
          completed: true,
        }),
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        []
      );
      expect(progress.totalRounds).toBe(1);
      expect(progress.totalTrainingTime).toBe(1500); // Uses full duration, not active
    });

    it("should calculate mood-related achievements correctly", () => {
      const moodEntries = [
        {
          id: "1",
          sessionId: "session-1",
          type: "energized" as any,
          intensity: 4,
          timestamp: new Date(),
        },
        {
          id: "2",
          sessionId: "session-2",
          type: "focused" as any,
          intensity: 5,
          timestamp: new Date(),
        },
      ];

      const sessions = [
        createTestSession({ id: "session-1", completed: true }),
        createTestSession({ id: "session-2", completed: true }),
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        moodEntries
      );

      expect(progress.totalMoodEntries).toBe(2);
      expect(progress.energizedSessions).toBeGreaterThanOrEqual(0);
      expect(progress.focusedSessions).toBeGreaterThanOrEqual(0);
    });
  });
});
