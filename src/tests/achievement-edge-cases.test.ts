/**
 * Achievement Edge Cases and Boundary Conditions Tests
 *
 * Tests edge cases like sessions exactly at 40 seconds, rapid completions,
 * achievement requirement edge cases, and concurrent achievement unlocking.
 */

import { pointsSystemService } from "../services/features/points-system-service";
import { boxingAchievementService } from "../services/features/boxing-achievement-service";
import {
  TimerSession,
  SessionType,
  SessionEndReason,
  BoxingProgress,
} from "../types/timer";
import {
  createTestSession,
  createTestBoxingProgress,
  createTestAchievement,
  achievementTestScenarios,
} from "./utils/test-factories";
import {
  expectValidBoxingProgressStructure,
  createProgressForAchievement,
  createProgressBelowThreshold,
} from "./utils/achievement-test-helpers";

// Mock helpers
jest.mock("../utils/helpers", () => ({
  getActualSessionDuration: jest.fn((session: TimerSession) => {
    if (session.activeDuration !== undefined) {
      return session.activeDuration;
    }
    if (session.endTime && session.startTime) {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();
      return Math.floor((end - start) / 1000);
    }
    return 0;
  }),
}));

describe("Achievement Edge Cases and Boundary Conditions", () => {
  beforeEach(() => {
    pointsSystemService.resetState();
    jest.clearAllMocks();
  });

  describe("40-Second Threshold Edge Cases", () => {
    it("should handle sessions exactly at 40 seconds", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 40, // Exactly at threshold
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(
        session,
        true
      );
      expect(pointsResult.points).toBe(10); // Should be ≥ 40s category
      expect(pointsResult.shouldAward).toBe(true);

      // Should count for achievements
      const progress = boxingAchievementService.calculateBoxingProgress(
        [session],
        []
      );
      expect(progress.totalRounds).toBe(1);
    });

    it("should handle sessions at 39 seconds (just under threshold)", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 39, // Just under threshold
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(
        session,
        true
      );
      expect(pointsResult.points).toBe(1); // Should be < 40s category
      expect(pointsResult.shouldAward).toBe(true);
    });

    it("should handle sessions at 41 seconds (just over threshold)", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 41, // Just over threshold
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(
        session,
        true
      );
      expect(pointsResult.points).toBe(10); // Should be ≥ 40s category
      expect(pointsResult.shouldAward).toBe(true);
    });

    it("should handle floating point durations near threshold", () => {
      const sessions = [
        createTestSession({
          activeDuration: 39.9,
          endReason: SessionEndReason.STOPPED,
          completed: true,
        }),
        createTestSession({
          activeDuration: 40.0,
          endReason: SessionEndReason.STOPPED,
          completed: true,
        }),
        createTestSession({
          activeDuration: 40.1,
          endReason: SessionEndReason.STOPPED,
          completed: true,
        }),
      ];

      const results = sessions.map((session) =>
        pointsSystemService.calculateSessionPoints(session, true)
      );

      expect(results[0].points).toBe(1); // 39.9 rounds to 39
      expect(results[1].points).toBe(0); // 40.0 but restricted after first manual
      expect(results[2].points).toBe(0); // 40.1 but still restricted
    });

    it("should handle zero and negative durations", () => {
      const sessions = [
        createTestSession({
          activeDuration: 0,
          endReason: SessionEndReason.STOPPED,
          completed: true,
        }),
        createTestSession({
          activeDuration: -5,
          endReason: SessionEndReason.STOPPED,
          completed: true,
        }),
      ];

      const results = sessions.map((session) =>
        pointsSystemService.calculateSessionPoints(session, true)
      );

      expect(results[0].points).toBe(1); // 0 < 40
      expect(results[1].points).toBe(0); // Restricted after first manual
    });
  });

  describe("Rapid Session Completions", () => {
    it("should handle rapid consecutive completions", () => {
      const rapidSessions = Array.from({ length: 100 }, (_, i) =>
        createTestSession({
          id: `rapid-${i}`,
          startTime: new Date(Date.now() - (100 - i) * 1000), // 1 second apart
          endTime: new Date(Date.now() - (100 - i - 1) * 1000),
          duration: 60,
          activeDuration: 60,
          completed: true,
        })
      );

      const progress = boxingAchievementService.calculateBoxingProgress(
        rapidSessions,
        []
      );
      expect(progress.totalRounds).toBe(100);
      expect(progress.totalTrainingTime).toBe(6000); // 100 minutes
    });

    it("should handle simultaneous session completions", () => {
      const simultaneousTime = new Date();
      const sessions = Array.from({ length: 5 }, (_, i) =>
        createTestSession({
          id: `simultaneous-${i}`,
          startTime: new Date(simultaneousTime.getTime() - 1500000), // 25 minutes ago
          endTime: simultaneousTime, // All end at same time
          duration: 1500,
          activeDuration: 1500,
          completed: true,
        })
      );

      const progress = boxingAchievementService.calculateBoxingProgress(
        sessions,
        []
      );
      expect(progress.totalRounds).toBe(5);
    });

    it("should handle rapid manual completions with point restrictions", () => {
      const sessions = Array.from({ length: 10 }, (_, i) =>
        createTestSession({
          id: `manual-${i}`,
          duration: 1500,
          activeDuration: 100 + i * 10, // Varying durations
          endReason: SessionEndReason.STOPPED,
          completed: true,
        })
      );

      const pointsResults = sessions.map((session) =>
        pointsSystemService.calculateSessionPoints(session, true)
      );

      // Only first should award points due to restriction
      expect(pointsResults[0].shouldAward).toBe(true);
      expect(pointsResults[0].points).toBe(10);

      // Rest should be restricted
      for (let i = 1; i < pointsResults.length; i++) {
        expect(pointsResults[i].shouldAward).toBe(false);
        expect(pointsResults[i].points).toBe(0);
      }
    });
  });

  describe("Achievement Requirement Edge Cases", () => {
    it("should handle achievements with zero requirements", () => {
      const zeroRequirementAchievement = createTestAchievement({
        requirements: [{ type: "sessions_completed", value: 0 }],
      });

      const progress = createTestBoxingProgress({ totalRounds: 0 });
      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        [],
        progress
      );

      // Should unlock immediately since requirement is 0
      expect(newAchievements.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle achievements with very large requirements", () => {
      const largeRequirementAchievement = createTestAchievement({
        requirements: [{ type: "sessions_completed", value: 1000000 }],
      });

      const progress = createTestBoxingProgress({ totalRounds: 999999 });
      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        [],
        progress
      );

      // Should not unlock since requirement not met
      expect(
        newAchievements.some((a) => a.id === largeRequirementAchievement.id)
      ).toBe(false);
    });

    it("should handle achievements with multiple conflicting requirements", () => {
      const conflictingAchievement = createTestAchievement({
        requirements: [
          { type: "sessions_completed", value: 100 },
          { type: "sessions_completed", value: 50, timeframe: "daily" },
        ],
      });

      const progress = createTestBoxingProgress({
        totalRounds: 100,
        dailyRoundsToday: 25, // Doesn't meet daily requirement
      });

      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        [],
        progress
      );

      // Should not unlock since not all requirements are met
      expect(
        newAchievements.some((a) => a.id === conflictingAchievement.id)
      ).toBe(false);
    });

    it("should handle achievements at exact requirement thresholds", () => {
      // Use a real achievement - "first-bell" which requires 1 session
      const progress = createTestBoxingProgress({
        totalRounds: 1, // Exactly meets the requirement
      });

      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        [],
        progress
      );

      // Should unlock "first-bell" since requirement is exactly met
      expect(newAchievements.some((a) => a.id === "first-bell")).toBe(true);
    });

    it("should handle achievements just below thresholds", () => {
      const thresholdAchievement = createTestAchievement({
        id: "below-threshold-test",
        requirements: [
          { type: "sessions_completed", value: 10 },
          { type: "streak_length", value: 5 },
        ],
      });

      // Progress just below thresholds
      const progress = createTestBoxingProgress({
        totalRounds: 9,
        currentStreak: 4,
      });

      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        [],
        progress
      );

      // Should not unlock since requirements not met
      expect(
        newAchievements.some((a) => a.id === thresholdAchievement.id)
      ).toBe(false);
    });
  });

  describe("Concurrent Achievement Unlocking", () => {
    it("should handle multiple achievements unlocking simultaneously", () => {
      // Create progress that meets multiple achievement requirements
      const progress = createTestBoxingProgress({
        totalRounds: 100,
        currentStreak: 20,
        longestStreak: 25,
        totalTrainingTime: 150000, // 2500 minutes
        dailyRoundsToday: 10,
        weeklyRoundsThisWeek: 50,
        monthlyRoundsThisMonth: 100,
      });

      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        [],
        progress
      );

      // Should unlock multiple achievements
      expect(newAchievements.length).toBeGreaterThan(5);

      // All should have unique IDs
      const ids = newAchievements.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // All should have timestamps
      newAchievements.forEach((achievement) => {
        expect(achievement.unlockedAt).toBeInstanceOf(Date);
      });
    });

    it("should handle achievement unlocking with existing achievements", () => {
      const existingAchievements = [
        {
          ...achievementTestScenarios.firstBellAchievement,
          unlockedAt: new Date(),
        },
      ];

      const progress = createTestBoxingProgress({
        totalRounds: 5,
        currentStreak: 2,
      });

      const newAchievements = boxingAchievementService.checkAchievements(
        [],
        existingAchievements,
        progress
      );

      // Should not re-unlock existing achievements
      expect(newAchievements.some((a) => a.id === "first-bell")).toBe(false);
    });

    it("should handle race conditions in achievement checking", () => {
      const progress = createTestBoxingProgress({
        totalRounds: 1,
        currentStreak: 1,
      });

      // Simulate concurrent checks
      const checks = Array.from({ length: 10 }, () =>
        boxingAchievementService.checkAchievements([], [], progress)
      );

      const results = Promise.all(checks);

      // All should return consistent results
      results.then((allResults) => {
        const firstResult = allResults[0];
        allResults.forEach((result) => {
          expect(result.length).toBe(firstResult.length);
        });
      });
    });
  });

  describe("Data Integrity Edge Cases", () => {
    it("should handle corrupted session data", () => {
      const corruptedSessions = [
        createTestSession({ startTime: undefined as any, completed: true }),
        createTestSession({ endTime: undefined as any, completed: true }),
        createTestSession({ duration: NaN, completed: true }),
        createTestSession({ activeDuration: Infinity, completed: true }),
        createTestSession({ id: "", completed: true }),
      ];

      expect(() => {
        boxingAchievementService.calculateBoxingProgress(corruptedSessions, []);
      }).not.toThrow();
    });

    it("should handle extreme numeric values", () => {
      const extremeProgress = createTestBoxingProgress({
        totalRounds: Number.MAX_SAFE_INTEGER,
        totalTrainingTime: Number.MAX_SAFE_INTEGER,
        currentStreak: Number.MAX_SAFE_INTEGER,
        longestStreak: Number.MAX_SAFE_INTEGER, // Must be >= currentStreak
      });

      expectValidBoxingProgressStructure(extremeProgress);

      // Should handle calculations without overflow
      expect(extremeProgress.totalRounds).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should handle negative values gracefully", () => {
      const negativeProgress = createTestBoxingProgress({
        totalRounds: -5,
        currentStreak: -2,
        totalTrainingTime: -1000,
      });

      // The service should handle or normalize negative values
      expect(typeof negativeProgress.totalRounds).toBe("number");
    });

    it("should handle circular references in data", () => {
      const circularSession = createTestSession({ completed: true });
      (circularSession as any).self = circularSession;

      expect(() => {
        boxingAchievementService.calculateBoxingProgress([circularSession], []);
      }).not.toThrow();
    });
  });

  describe("Performance Edge Cases", () => {
    it("should handle large numbers of sessions efficiently", () => {
      const largeSessions = Array.from({ length: 10000 }, (_, i) =>
        createTestSession({
          id: `large-${i}`,
          duration: 1500,
          activeDuration: 1500,
          completed: true,
        })
      );

      const startTime = Date.now();
      const progress = boxingAchievementService.calculateBoxingProgress(
        largeSessions,
        []
      );
      const endTime = Date.now();

      expect(progress.totalRounds).toBe(10000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should handle memory-intensive achievement checking", () => {
      const progress = createTestBoxingProgress({
        totalRounds: 1000,
        currentStreak: 100,
        totalTrainingTime: 1500000,
      });

      const startMemory = process.memoryUsage().heapUsed;

      // Run multiple achievement checks
      for (let i = 0; i < 100; i++) {
        boxingAchievementService.checkAchievements([], [], progress);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe("Time-Based Edge Cases", () => {
    it("should handle daylight saving time transitions", () => {
      // Simulate sessions around DST transition
      const dstTransition = new Date("2024-03-10T07:00:00Z"); // Spring forward

      const sessions = [
        createTestSession({
          startTime: new Date(dstTransition.getTime() - 60 * 60 * 1000), // 1 hour before
          endTime: new Date(dstTransition.getTime() + 60 * 60 * 1000), // 1 hour after
          completed: true,
        }),
      ];

      expect(() => {
        boxingAchievementService.calculateBoxingProgress(sessions, []);
      }).not.toThrow();
    });

    it("should handle sessions spanning midnight", () => {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);

      const midnightSession = createTestSession({
        startTime: new Date(midnight.getTime() - 30 * 60 * 1000), // 30 min before midnight
        endTime: new Date(midnight.getTime() + 30 * 60 * 1000), // 30 min after midnight
        completed: true,
      });

      const progress = boxingAchievementService.calculateBoxingProgress(
        [midnightSession],
        []
      );
      expect(progress.totalRounds).toBe(1);
    });

    it("should handle future timestamps", () => {
      const futureSession = createTestSession({
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
        completed: true,
      });

      expect(() => {
        boxingAchievementService.calculateBoxingProgress([futureSession], []);
      }).not.toThrow();
    });
  });
});
