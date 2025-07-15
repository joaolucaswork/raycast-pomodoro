/**
 * Core Session Saving Logic Tests
 *
 * Tests the fundamental session saving functionality including helper functions,
 * basic session creation and completion flows, and different session types.
 */

import { SessionType, SessionEndReason } from "../types/timer";
import {
  shouldSaveSessionToHistory,
  getActualSessionDuration,
} from "../utils/helpers";
import {
  createTestSession,
  createShortTestSession,
  createValidTestSession,
  createTestConfig,
} from "./utils/test-factories";
import {
  setupTestEnvironment,
  expectValidSessionStructure,
  expectSessionProperties,
  calculateDurationSeconds,
} from "./utils/test-helpers";

// Setup test environment
setupTestEnvironment();

describe("Core Session Saving Logic", () => {
  describe("shouldSaveSessionToHistory()", () => {
    it("should return true for sessions with duration >= 40 seconds", () => {
      const session = createValidTestSession(45); // 45 seconds
      const result = shouldSaveSessionToHistory(session);
      expect(result).toBe(true);
    });

    it("should return false for sessions with duration < 40 seconds", () => {
      const session = createShortTestSession(30); // 30 seconds
      const result = shouldSaveSessionToHistory(session);
      expect(result).toBe(false);
    });

    it("should return true for sessions exactly 40 seconds", () => {
      const session = createValidTestSession(40); // Exactly 40 seconds
      const result = shouldSaveSessionToHistory(session);
      expect(result).toBe(true);
    });

    it("should return false for sessions without startTime", () => {
      const session = createTestSession({
        startTime: undefined as any,
        endTime: new Date(),
      });
      const result = shouldSaveSessionToHistory(session);
      expect(result).toBe(false);
    });

    it("should handle sessions without endTime (use current time)", () => {
      const now = new Date();
      const session = createTestSession({
        startTime: new Date(now.getTime() - 60000), // 1 minute ago
        endTime: undefined,
      });
      const result = shouldSaveSessionToHistory(session);
      expect(result).toBe(true); // Should be > 40 seconds
    });

    it("should return false for sessions with invalid date objects", () => {
      const session = createTestSession({
        startTime: new Date("invalid"),
        endTime: new Date(),
      });
      const result = shouldSaveSessionToHistory(session);
      expect(result).toBe(false);
    });
  });

  describe("getActualSessionDuration()", () => {
    it("should calculate correct duration for completed sessions", () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 1500000); // 25 minutes
      const session = createTestSession({ startTime, endTime });

      const duration = getActualSessionDuration(session);
      expect(duration).toBe(1500); // 25 minutes in seconds
    });

    it("should use current time for sessions without endTime", () => {
      const startTime = new Date(Date.now() - 60000); // 1 minute ago
      const session = createTestSession({
        startTime,
        endTime: undefined,
        activeDuration: undefined, // Force wall-clock calculation
      });

      const duration = getActualSessionDuration(session);
      expect(duration).toBeGreaterThanOrEqual(59); // At least 59 seconds
      expect(duration).toBeLessThanOrEqual(61); // At most 61 seconds (allowing for test execution time)
    });

    it("should return 0 for sessions without startTime", () => {
      const session = createTestSession({
        startTime: undefined as any,
        endTime: new Date(),
        activeDuration: undefined, // Force wall-clock calculation
      });

      const duration = getActualSessionDuration(session);
      expect(duration).toBe(0);
    });

    it("should handle very short durations correctly", () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 5000); // 5 seconds
      const session = createTestSession({
        startTime,
        endTime,
        activeDuration: undefined, // Force wall-clock calculation
      });

      const duration = getActualSessionDuration(session);
      expect(duration).toBe(5);
    });

    it("should handle very long durations correctly", () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 7200000); // 2 hours
      const session = createTestSession({
        startTime,
        endTime,
        activeDuration: undefined, // Force wall-clock calculation
      });

      const duration = getActualSessionDuration(session);
      expect(duration).toBe(7200); // 2 hours in seconds
    });

    it("should floor fractional seconds", () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 5500); // 5.5 seconds
      const session = createTestSession({
        startTime,
        endTime,
        activeDuration: undefined, // Force wall-clock calculation
      });

      const duration = getActualSessionDuration(session);
      expect(duration).toBe(5); // Should floor to 5 seconds
    });
  });

  describe("Session Creation and Structure", () => {
    it("should create valid session structure for work sessions", () => {
      const session = createTestSession({
        type: SessionType.WORK,
        taskName: "Important Work Task",
        duration: 1500,
      });

      expectValidSessionStructure(session);
      expectSessionProperties(session, {
        type: SessionType.WORK,
        taskName: "Important Work Task",
        duration: 1500,
      });
    });

    it("should create valid session structure for short break sessions", () => {
      const session = createTestSession({
        type: SessionType.SHORT_BREAK,
        duration: 300, // 5 minutes
      });

      expectValidSessionStructure(session);
      expectSessionProperties(session, {
        type: SessionType.SHORT_BREAK,
        duration: 300,
      });
    });

    it("should create valid session structure for long break sessions", () => {
      const session = createTestSession({
        type: SessionType.LONG_BREAK,
        duration: 900, // 15 minutes
      });

      expectValidSessionStructure(session);
      expectSessionProperties(session, {
        type: SessionType.LONG_BREAK,
        duration: 900,
      });
    });

    it("should preserve all session properties correctly", () => {
      const testData = {
        taskName: "Test Task",
        projectName: "Test Project",
        tags: ["urgent", "development"],
        notes: "Test notes",
        energyLevel: 4 as const,
        focusLevel: 5 as const,
        preRoundMood: 3 as const,
        postRoundMood: 4 as const,
      };

      const session = createTestSession(testData);

      expectSessionProperties(session, testData);
    });

    it("should handle sessions with different end reasons", () => {
      const completedSession = createTestSession({
        endReason: SessionEndReason.COMPLETED,
        completed: true,
      });

      const stoppedSession = createTestSession({
        endReason: SessionEndReason.STOPPED,
        completed: false,
      });

      const skippedSession = createTestSession({
        endReason: SessionEndReason.SKIPPED,
        completed: false,
      });

      expect(completedSession.endReason).toBe(SessionEndReason.COMPLETED);
      expect(stoppedSession.endReason).toBe(SessionEndReason.STOPPED);
      expect(skippedSession.endReason).toBe(SessionEndReason.SKIPPED);
    });
  });

  describe("Session Duration Calculations", () => {
    it("should correctly calculate duration for different session types", () => {
      const config = createTestConfig();

      // Work session
      const workDuration = config.workDuration * 60; // Convert minutes to seconds
      expect(workDuration).toBe(1500); // 25 minutes

      // Short break
      const shortBreakDuration = config.shortBreakDuration * 60;
      expect(shortBreakDuration).toBe(300); // 5 minutes

      // Long break
      const longBreakDuration = config.longBreakDuration * 60;
      expect(longBreakDuration).toBe(900); // 15 minutes
    });

    it("should handle pause time in duration calculations", () => {
      const session = createTestSession({
        duration: 1500, // 25 minutes configured
        pausedTime: 300, // 5 minutes paused
        activeDuration: 1200, // 20 minutes active work
      });

      // The actual session duration should include pause time
      const totalDuration = calculateDurationSeconds(
        session.startTime,
        session.endTime!
      );
      expect(totalDuration).toBe(1500); // Total time including pauses

      // But active duration should exclude pause time
      expect(session.activeDuration).toBe(1200); // Only active work time
    });
  });

  describe("Edge Cases", () => {
    it("should handle sessions with zero duration", () => {
      const session = createTestSession({
        duration: 0,
        startTime: new Date(),
        endTime: new Date(), // Same time
        activeDuration: undefined, // Force wall-clock calculation
      });

      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBe(0);
      expect(shouldSaveSessionToHistory(session)).toBe(false);
    });

    it("should handle sessions with negative calculated duration", () => {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() + 60000); // Start time after end time
      const session = createTestSession({
        startTime,
        endTime,
        activeDuration: undefined, // Force wall-clock calculation
      });

      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBeLessThanOrEqual(0); // Mock ensures non-negative, so 0 is expected
      expect(shouldSaveSessionToHistory(session)).toBe(false);
    });

    it("should handle sessions with missing required properties", () => {
      const session = createTestSession({
        id: undefined as any,
        type: undefined as any,
      });

      // Should still have basic structure but may fail validation
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.endTime).toBeInstanceOf(Date);
    });
  });
});
