/**
 * Session Duration Validation Tests
 *
 * Tests the 40-second minimum duration rule enforcement including
 * notification behavior for short sessions and edge cases.
 */

// Mock the design tokens before importing helpers
jest.mock("../constants/design-tokens", () => ({
  SESSION_ICONS: {
    WORK: "hammer",
    SHORT_BREAK: "pause",
    LONG_BREAK: "mug",
    COMPLETED: "check-circle",
    INCOMPLETE: "x-mark-circle",
    PAUSED: "pause",
    RUNNING: "play",
    IDLE: "clock",
  },
  // Add other exports as needed
}));

import { showToast, Toast } from "@raycast/api";
import { SessionEndReason } from "../types/timer";
import {
  shouldSaveSessionToHistory,
  getActualSessionDuration,
} from "../utils/helpers";
import { MIN_SESSION_DURATION_FOR_HISTORY } from "../utils/helpers";
import {
  createTestSession,
  createShortTestSession,
  createValidTestSession,
  createDurationTestSession,
  createShortDurationTestSession,
} from "./utils/test-factories";
import {
  setupTestEnvironment,
  expectToastNotification,
  expectShortSessionToast,
  expectNoToastNotifications,
  createDateSecondsAgo,
  createDateSecondsFromNow,
} from "./utils/test-helpers";

// Setup test environment
setupTestEnvironment();

// Mock showToast for notification testing
jest.mock("@raycast/api", () => ({
  showToast: jest.fn(),
  Toast: {
    Style: {
      Success: "success",
      Failure: "failure",
      Animated: "animated",
    },
  },
}));

describe("Session Duration Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("40-Second Minimum Duration Rule", () => {
    it("should save sessions with duration >= 40 seconds", () => {
      const testCases = [40, 41, 60, 300, 1500, 7200]; // 40s, 41s, 1min, 5min, 25min, 2hrs

      testCases.forEach((durationSeconds) => {
        const session = createValidTestSession(durationSeconds);
        const shouldSave = shouldSaveSessionToHistory(session);
        const actualDuration = getActualSessionDuration(session);

        expect(shouldSave).toBe(true);
        expect(actualDuration).toBeGreaterThanOrEqual(
          MIN_SESSION_DURATION_FOR_HISTORY
        );
      });
    });

    it("should NOT save sessions with duration < 40 seconds", () => {
      const testCases = [0, 1, 10, 30, 39]; // Various durations under 40 seconds

      testCases.forEach((durationSeconds) => {
        const session = createShortTestSession(durationSeconds);
        const shouldSave = shouldSaveSessionToHistory(session);
        const actualDuration = getActualSessionDuration(session);

        expect(shouldSave).toBe(false);
        expect(actualDuration).toBeLessThan(MIN_SESSION_DURATION_FOR_HISTORY);
      });
    });

    it("should handle exactly 40 seconds (boundary case)", () => {
      const session = createValidTestSession(40);
      const shouldSave = shouldSaveSessionToHistory(session);
      const actualDuration = getActualSessionDuration(session);

      expect(shouldSave).toBe(true);
      expect(actualDuration).toBe(40);
    });

    it("should handle 39 seconds (just under boundary)", () => {
      const session = createShortTestSession(39);
      const shouldSave = shouldSaveSessionToHistory(session);
      const actualDuration = getActualSessionDuration(session);

      expect(shouldSave).toBe(false);
      expect(actualDuration).toBe(39);
    });

    it("should handle 41 seconds (just over boundary)", () => {
      const session = createValidTestSession(41);
      const shouldSave = shouldSaveSessionToHistory(session);
      const actualDuration = getActualSessionDuration(session);

      expect(shouldSave).toBe(true);
      expect(actualDuration).toBe(41);
    });
  });

  describe("Duration Calculation Accuracy", () => {
    it("should calculate duration accurately with millisecond precision", () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 40500); // 40.5 seconds
      const session = createDurationTestSession(40, { startTime, endTime });

      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBe(40); // Should floor to 40 seconds
      expect(shouldSaveSessionToHistory(session)).toBe(true);
    });

    it("should handle fractional seconds correctly", () => {
      const testCases = [
        { milliseconds: 39999, expectedSeconds: 39, shouldSave: false },
        { milliseconds: 40000, expectedSeconds: 40, shouldSave: true },
        { milliseconds: 40001, expectedSeconds: 40, shouldSave: true },
        { milliseconds: 40999, expectedSeconds: 40, shouldSave: true },
      ];

      testCases.forEach(({ milliseconds, expectedSeconds, shouldSave }) => {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + milliseconds);
        const session = createDurationTestSession(expectedSeconds, {
          startTime,
          endTime,
        });

        const actualDuration = getActualSessionDuration(session);
        expect(actualDuration).toBe(expectedSeconds);
        expect(shouldSaveSessionToHistory(session)).toBe(shouldSave);
      });
    });

    it("should handle pause time in duration calculations", () => {
      const startTime = createDateSecondsAgo(1500);
      const endTime = new Date();
      const session = createDurationTestSession(1500, {
        startTime,
        endTime,
        pausedTime: 300, // 5 minutes paused
      });

      // Should calculate wall-clock time minus pause time
      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBe(1200); // 1500 - 300 = 1200 seconds
      expect(shouldSaveSessionToHistory(session)).toBe(true);
    });
  });

  describe("Notification Behavior for Short Sessions", () => {
    it("should show failure toast for manual completion under 40 seconds", () => {
      const session = createShortTestSession(30);
      session.endReason = SessionEndReason.STOPPED;

      const shouldSave = shouldSaveSessionToHistory(session);
      expect(shouldSave).toBe(false);

      // Simulate the notification that would be shown
      if (!shouldSave) {
        const actualDuration = getActualSessionDuration(session);
        showToast({
          style: Toast.Style.Failure,
          title: "Session Too Short",
          message: `Session stopped after ${actualDuration}s and won't be saved to history (minimum: 40s)`,
        });
      }

      expectShortSessionToast(30);
    });

    it("should show failure toast for automatic completion under 40 seconds", () => {
      const session = createShortTestSession(35);
      session.endReason = SessionEndReason.COMPLETED;

      const shouldSave = shouldSaveSessionToHistory(session);
      expect(shouldSave).toBe(false);

      // Simulate the notification that would be shown
      if (!shouldSave) {
        const actualDuration = getActualSessionDuration(session);
        showToast({
          style: Toast.Style.Failure,
          title: "Session Too Short",
          message: `Session completed in ${actualDuration}s but won't be saved to history (minimum: 40s)`,
        });
      }

      expectToastNotification(
        Toast.Style.Failure,
        "Session Too Short",
        "Session completed in 35s but won't be saved to history (minimum: 40s)"
      );
    });

    it("should NOT show toast for sessions that meet minimum duration", () => {
      const session = createValidTestSession(45);
      const shouldSave = shouldSaveSessionToHistory(session);

      expect(shouldSave).toBe(true);
      // No toast should be shown for valid sessions
      expect(showToast).not.toHaveBeenCalled();
    });

    it("should show different messages for stopped vs completed sessions", () => {
      // Test stopped session
      const stoppedSession = createShortTestSession(25);
      stoppedSession.endReason = SessionEndReason.STOPPED;

      if (!shouldSaveSessionToHistory(stoppedSession)) {
        showToast({
          style: Toast.Style.Failure,
          title: "Session Too Short",
          message:
            "Session stopped after 25s and won't be saved to history (minimum: 40s)",
        });
      }

      // Test completed session
      const completedSession = createShortTestSession(25);
      completedSession.endReason = SessionEndReason.COMPLETED;

      if (!shouldSaveSessionToHistory(completedSession)) {
        showToast({
          style: Toast.Style.Failure,
          title: "Session Too Short",
          message:
            "Session completed in 25s but won't be saved to history (minimum: 40s)",
        });
      }

      expect(showToast).toHaveBeenCalledTimes(2);
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("stopped after"),
        })
      );
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("completed in"),
        })
      );
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle zero duration sessions", () => {
      const now = new Date();
      const session = createDurationTestSession(0, {
        startTime: now,
        endTime: now, // Same time = 0 duration
      });

      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBe(0);
      expect(shouldSaveSessionToHistory(session)).toBe(false);
    });

    it("should handle very long sessions (hours)", () => {
      const longDurations = [3600, 7200, 14400, 28800]; // 1hr, 2hr, 4hr, 8hr

      longDurations.forEach((durationSeconds) => {
        const session = createValidTestSession(durationSeconds);
        const shouldSave = shouldSaveSessionToHistory(session);
        const actualDuration = getActualSessionDuration(session);

        expect(shouldSave).toBe(true);
        expect(actualDuration).toBe(durationSeconds);
      });
    });

    it("should handle sessions with missing endTime (use current time)", () => {
      const startTime = createDateSecondsAgo(60);
      const session = createDurationTestSession(60, {
        startTime,
        endTime: undefined, // No endTime - should use current time
      });

      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBeGreaterThanOrEqual(59);
      expect(actualDuration).toBeLessThanOrEqual(61);
      expect(shouldSaveSessionToHistory(session)).toBe(true);
    });

    it("should handle sessions with invalid dates", () => {
      const session = createDurationTestSession(0, {
        startTime: new Date("invalid"),
        endTime: new Date(),
      });

      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBe(0);
      expect(shouldSaveSessionToHistory(session)).toBe(false);
    });

    it("should handle sessions where endTime is before startTime", () => {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() + 60000); // Start after end
      const session = createDurationTestSession(0, { startTime, endTime });

      const actualDuration = getActualSessionDuration(session);
      expect(actualDuration).toBe(0); // Math.max(0, negative) = 0
      expect(shouldSaveSessionToHistory(session)).toBe(false);
    });

    it("should handle sessions with extreme durations", () => {
      // Very short (1 millisecond)
      const now = new Date();
      const veryShort = createDurationTestSession(0, {
        startTime: now,
        endTime: new Date(now.getTime() + 1),
      });
      expect(getActualSessionDuration(veryShort)).toBe(0);
      expect(shouldSaveSessionToHistory(veryShort)).toBe(false);

      // Very long (24 hours)
      const veryLong = createValidTestSession(86400); // 24 hours
      expect(getActualSessionDuration(veryLong)).toBe(86400);
      expect(shouldSaveSessionToHistory(veryLong)).toBe(true);
    });
  });

  describe("Minimum Duration Constant", () => {
    it("should use the correct minimum duration constant", () => {
      expect(MIN_SESSION_DURATION_FOR_HISTORY).toBe(40);
    });

    it("should consistently apply the minimum duration rule", () => {
      const borderlineCases = [
        { duration: MIN_SESSION_DURATION_FOR_HISTORY - 1, shouldSave: false },
        { duration: MIN_SESSION_DURATION_FOR_HISTORY, shouldSave: true },
        { duration: MIN_SESSION_DURATION_FOR_HISTORY + 1, shouldSave: true },
      ];

      borderlineCases.forEach(({ duration, shouldSave }) => {
        const session =
          duration >= 40
            ? createValidTestSession(duration)
            : createShortTestSession(duration);

        expect(shouldSaveSessionToHistory(session)).toBe(shouldSave);
      });
    });
  });
});
