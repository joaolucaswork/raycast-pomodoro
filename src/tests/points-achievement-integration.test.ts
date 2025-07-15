/**
 * Points System and Achievement Integration Tests
 *
 * Tests the integration between the points system (70/10/1 point rules) and 
 * achievement unlocking, including edge cases around the 40-second threshold.
 */

import { pointsSystemService } from "../services/features/points-system-service";
import { boxingAchievementService } from "../services/features/boxing-achievement-service";
import { TimerSession, SessionType, SessionEndReason, BoxingProgress } from "../types/timer";
import {
  createTestSession,
  createTestBoxingProgress,
  achievementTestScenarios,
} from "./utils/test-factories";
import {
  expectValidBoxingProgressStructure,
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

describe("Points System and Achievement Integration", () => {
  beforeEach(() => {
    pointsSystemService.resetState();
    jest.clearAllMocks();
  });

  describe("Points Calculation for Achievement Progress", () => {
    it("should award 70 points for natural completion and update achievement progress", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 1500,
        endReason: SessionEndReason.COMPLETED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(session, false);
      expect(pointsResult.points).toBe(70);
      expect(pointsResult.shouldAward).toBe(true);

      // Verify this contributes to achievement progress
      const progress = boxingAchievementService.calculateBoxingProgress([session], []);
      expect(progress.totalRounds).toBe(1);
      expect(progress.totalTrainingTime).toBe(1500);
    });

    it("should award 10 points for manual completion after 40s and update progress", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 100, // Stopped after 100 seconds
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(session, true);
      expect(pointsResult.points).toBe(10);
      expect(pointsResult.shouldAward).toBe(true);

      // Should still count toward achievements
      const progress = boxingAchievementService.calculateBoxingProgress([session], []);
      expect(progress.totalRounds).toBe(1);
      expect(progress.totalTrainingTime).toBe(1500); // Uses full duration
    });

    it("should award 1 point for manual completion under 40s and update progress", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 30, // Stopped after 30 seconds
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(session, true);
      expect(pointsResult.points).toBe(1);
      expect(pointsResult.shouldAward).toBe(true);

      // Should still count toward achievements
      const progress = boxingAchievementService.calculateBoxingProgress([session], []);
      expect(progress.totalRounds).toBe(1);
    });

    it("should handle exactly 40-second boundary correctly", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 40, // Exactly 40 seconds
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(session, true);
      expect(pointsResult.points).toBe(10); // Should be 10 points (≥ 40s)
      expect(pointsResult.shouldAward).toBe(true);

      // Should count toward achievements
      const progress = boxingAchievementService.calculateBoxingProgress([session], []);
      expect(progress.totalRounds).toBe(1);
    });
  });

  describe("Achievement Unlocking Based on Points", () => {
    it("should unlock first achievement after completing first session", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 1500,
        endReason: SessionEndReason.COMPLETED,
        completed: true,
      });

      const progress = boxingAchievementService.calculateBoxingProgress([session], []);
      const newAchievements = boxingAchievementService.checkAchievements(
        [session],
        [],
        progress
      );

      // Should unlock "First Bell" achievement
      const firstBellAchievement = newAchievements.find(a => a.id === "first-bell");
      expect(firstBellAchievement).toBeDefined();
      expect(firstBellAchievement?.points).toBe(25);
    });

    it("should unlock streak achievements after consecutive sessions", () => {
      // Create 2 consecutive sessions for "Double Jab" achievement
      const sessions = [
        createTestSession({
          id: "session-1",
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
          duration: 1500,
          activeDuration: 1500,
          completed: true,
        }),
        createTestSession({
          id: "session-2",
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
          duration: 1500,
          activeDuration: 1500,
          completed: true,
        }),
      ];

      const progress = boxingAchievementService.calculateBoxingProgress(sessions, []);
      const newAchievements = boxingAchievementService.checkAchievements(
        sessions,
        [],
        progress
      );

      // Should unlock streak-based achievements
      expect(newAchievements.length).toBeGreaterThan(0);
      
      // Check for streak achievements
      const streakAchievements = newAchievements.filter(a => 
        a.category === "knockout_streaks"
      );
      expect(streakAchievements.length).toBeGreaterThan(0);
    });

    it("should unlock time-based achievements after accumulating training time", () => {
      // Create sessions that total 10 hours (600 minutes)
      const sessions = Array.from({ length: 24 }, (_, i) =>
        createTestSession({
          id: `session-${i}`,
          duration: 1500, // 25 minutes each
          activeDuration: 1500,
          completed: true,
          startTime: new Date(Date.now() - (24 - i) * 60 * 60 * 1000), // Spread over hours
        })
      );

      const progress = boxingAchievementService.calculateBoxingProgress(sessions, []);
      const newAchievements = boxingAchievementService.checkAchievements(
        sessions,
        [],
        progress
      );

      // Should unlock time-based achievements
      const timeBased = newAchievements.filter(a => 
        a.category === "championship_belts"
      );
      expect(timeBased.length).toBeGreaterThan(0);
    });
  });

  describe("Points Restriction and Achievement Impact", () => {
    it("should restrict points after manual completion but still count sessions for achievements", () => {
      // First manual completion - should award points
      const firstSession = createTestSession({
        duration: 1500,
        activeDuration: 100,
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const firstResult = pointsSystemService.calculateSessionPoints(firstSession, true);
      expect(firstResult.shouldAward).toBe(true);
      expect(firstResult.points).toBe(10);

      // Second manual completion - should NOT award points
      const secondSession = createTestSession({
        duration: 1500,
        activeDuration: 200,
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const secondResult = pointsSystemService.calculateSessionPoints(secondSession, true);
      expect(secondResult.shouldAward).toBe(false);
      expect(secondResult.points).toBe(0);

      // But both sessions should count toward achievements
      const progress = boxingAchievementService.calculateBoxingProgress(
        [firstSession, secondSession], 
        []
      );
      expect(progress.totalRounds).toBe(2); // Both sessions count
    });

    it("should reset point restriction after natural completion", () => {
      // Manual completion first
      const manualSession = createTestSession({
        duration: 1500,
        activeDuration: 100,
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });
      pointsSystemService.calculateSessionPoints(manualSession, true);

      // Natural completion should reset restriction
      const naturalSession = createTestSession({
        duration: 1500,
        activeDuration: 1500,
        endReason: SessionEndReason.COMPLETED,
        completed: true,
      });

      const naturalResult = pointsSystemService.calculateSessionPoints(naturalSession, false);
      expect(naturalResult.shouldAward).toBe(true);
      expect(naturalResult.points).toBe(70);

      // Next manual completion should award points again
      const nextManualSession = createTestSession({
        duration: 1500,
        activeDuration: 150,
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const nextResult = pointsSystemService.calculateSessionPoints(nextManualSession, true);
      expect(nextResult.shouldAward).toBe(true);
      expect(nextResult.points).toBe(10);
    });
  });

  describe("Edge Cases with 40-Second Threshold", () => {
    it("should handle sessions just under 40 seconds", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 39, // Just under threshold
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(session, true);
      expect(pointsResult.points).toBe(1);
      expect(pointsResult.shouldAward).toBe(true);

      // Should still count for achievements
      const progress = boxingAchievementService.calculateBoxingProgress([session], []);
      expect(progress.totalRounds).toBe(1);
    });

    it("should handle sessions just over 40 seconds", () => {
      const session = createTestSession({
        duration: 1500,
        activeDuration: 41, // Just over threshold
        endReason: SessionEndReason.STOPPED,
        completed: true,
      });

      const pointsResult = pointsSystemService.calculateSessionPoints(session, true);
      expect(pointsResult.points).toBe(10);
      expect(pointsResult.shouldAward).toBe(true);

      // Should count for achievements
      const progress = boxingAchievementService.calculateBoxingProgress([session], []);
      expect(progress.totalRounds).toBe(1);
    });

    it("should handle rapid completions around threshold", () => {
      const sessions = [
        createTestSession({ activeDuration: 38, endReason: SessionEndReason.STOPPED, completed: true }),
        createTestSession({ activeDuration: 40, endReason: SessionEndReason.STOPPED, completed: true }),
        createTestSession({ activeDuration: 42, endReason: SessionEndReason.STOPPED, completed: true }),
      ];

      const pointsResults = sessions.map((session, index) => 
        pointsSystemService.calculateSessionPoints(session, true)
      );

      expect(pointsResults[0].points).toBe(1); // Under 40s
      expect(pointsResults[1].points).toBe(0); // Restricted after first manual
      expect(pointsResults[2].points).toBe(0); // Still restricted

      // All should count for achievements
      const progress = boxingAchievementService.calculateBoxingProgress(sessions, []);
      expect(progress.totalRounds).toBe(3);
    });
  });

  describe("Legacy Session Handling", () => {
    it("should calculate points for legacy sessions without endReason", () => {
      const legacySession = createTestSession({
        duration: 1500,
        activeDuration: 1350, // 90% completion
        completed: true,
        endReason: undefined as any,
      });

      const points = pointsSystemService.calculateLegacySessionPoints(legacySession);
      expect(points).toBe(70); // Should be treated as natural completion

      // Should count for achievements
      const progress = boxingAchievementService.calculateBoxingProgress([legacySession], []);
      expect(progress.totalRounds).toBe(1);
    });

    it("should handle legacy sessions with various completion levels", () => {
      const legacySessions = [
        createTestSession({ activeDuration: 1350, completed: true, endReason: undefined as any }), // 90% - natural
        createTestSession({ activeDuration: 100, completed: true, endReason: undefined as any }),  // Manual after 40s
        createTestSession({ activeDuration: 30, completed: true, endReason: undefined as any }),   // Manual before 40s
        createTestSession({ activeDuration: 100, completed: false, endReason: undefined as any }), // Not completed
      ];

      const pointsResults = legacySessions.map(session => 
        pointsSystemService.calculateLegacySessionPoints(session)
      );

      expect(pointsResults[0]).toBe(70); // Natural completion
      expect(pointsResults[1]).toBe(10);  // Manual after 40s
      expect(pointsResults[2]).toBe(1);   // Manual before 40s
      expect(pointsResults[3]).toBe(0);   // Not completed

      // Only completed sessions should count for achievements
      const progress = boxingAchievementService.calculateBoxingProgress(legacySessions, []);
      expect(progress.totalRounds).toBe(3); // Only completed sessions
    });
  });
});
