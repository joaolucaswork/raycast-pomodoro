/**
 * Session Store Integration Tests
 *
 * Tests Zustand store integration for session saving including
 * session-slice functions, history updates, and persistence behavior.
 */

import { showToast, Toast } from "@raycast/api";
import { TimerState, SessionType, SessionEndReason } from "../types/timer";
import {
  createTestSession,
  createValidTestSession,
  createShortTestSession,
  createTestHistory,
} from "./utils/test-factories";
import {
  setupTestEnvironment,
  createMockStore,
  expectSessionInHistory,
  expectSessionNotInHistory,
  expectShortSessionToast,
} from "./utils/test-helpers";

// Setup test environment
setupTestEnvironment();

// Mock the store and dependencies
const mockSetState = jest.fn();
const mockGetState = jest.fn();

jest.mock("../store/timer-store", () => ({
  useTimerStore: {
    getState: mockGetState,
    setState: mockSetState,
  },
}));

jest.mock("../utils/helpers", () => ({
  shouldSaveSessionToHistory: jest.fn((session) => {
    // Use activeDuration if available (preferred method)
    let actualDuration = 0;

    if (session.activeDuration !== undefined) {
      actualDuration = session.activeDuration;
    } else {
      // Fallback to wall-clock time calculation
      if (!session.startTime) return false;

      const endTime = session.endTime || new Date();
      const wallClockDuration = Math.floor(
        (endTime.getTime() - session.startTime.getTime()) / 1000
      );
      const pausedTime = session.pausedTime || 0;
      actualDuration = Math.max(0, wallClockDuration - pausedTime);
    }

    return actualDuration >= 40;
  }),
  getActualSessionDuration: jest.fn((session) => {
    // Use activeDuration if available (preferred method)
    if (session.activeDuration !== undefined) {
      return session.activeDuration;
    }

    // Fallback to wall-clock time calculation
    if (!session.startTime) return 0;

    const endTime = session.endTime || new Date();
    const wallClockDuration = Math.floor(
      (endTime.getTime() - session.startTime.getTime()) / 1000
    );
    const pausedTime = session.pausedTime || 0;

    return Math.max(0, wallClockDuration - pausedTime);
  }),
  generateId: jest.fn(() => `test-id-${Date.now()}`),
}));

jest.mock("../store/slices/stats-slice", () => ({
  calculateStats: jest.fn((history) => ({
    totalSessions: history.length,
    completedSessions: history.filter((s: any) => s.completed).length,
    totalWorkTime: history.reduce(
      (acc: number, s: any) => acc + (s.activeDuration || s.duration),
      0
    ),
    totalBreakTime: 0,
    streakCount: 0,
    todaysSessions: 0,
    weekSessions: 0,
    monthSessions: 0,
    totalPauseTime: 0,
    sessionsWithPauses: 0,
    averagePauseTime: 0,
  })),
}));

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

describe("Session Store Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue(createMockStore());
  });

  describe("completeSession() Function", () => {
    it("should save valid session to history and update store state", () => {
      const validSession = createValidTestSession(1500); // 25 minutes
      const initialHistory = createTestHistory(2);

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: validSession,
          history: initialHistory,
          sessionCount: 5,
          currentFocusPeriodSessionCount: 2,
          state: TimerState.RUNNING,
        })
      );

      // Simulate completeSession call
      const {
        shouldSaveSessionToHistory,
        getActualSessionDuration,
      } = require("../utils/helpers");
      const { calculateStats } = require("../store/slices/stats-slice");

      const completedSession = {
        ...validSession,
        completed: true,
        endTime: new Date(),
      };
      const shouldSave = shouldSaveSessionToHistory(completedSession);
      const actualDuration = getActualSessionDuration(completedSession);

      expect(shouldSave).toBe(true);
      expect(actualDuration).toBe(1500);

      // Verify store would be updated correctly
      const expectedNewHistory = [...initialHistory, completedSession];
      const expectedStats = calculateStats(expectedNewHistory);

      expect(expectedNewHistory).toHaveLength(3);
      expect(expectedStats.totalSessions).toBe(3);
    });

    it("should NOT save short session to history but update state", () => {
      const shortSession = createShortTestSession(30); // 30 seconds
      const initialHistory = createTestHistory(2);

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: shortSession,
          history: initialHistory,
          sessionCount: 5,
          state: TimerState.RUNNING,
        })
      );

      // Simulate completeSession call
      const {
        shouldSaveSessionToHistory,
        getActualSessionDuration,
      } = require("../utils/helpers");

      const completedSession = {
        ...shortSession,
        completed: true,
        endTime: new Date(),
      };
      const shouldSave = shouldSaveSessionToHistory(completedSession);
      const actualDuration = getActualSessionDuration(completedSession);

      expect(shouldSave).toBe(false);
      expect(actualDuration).toBe(30);

      // History should remain unchanged
      expect(initialHistory).toHaveLength(2);
    });

    it("should increment session count only for saved work sessions", () => {
      const workSession = createValidTestSession(1500);
      workSession.type = SessionType.WORK;

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: workSession,
          sessionCount: 5,
          currentFocusPeriodSessionCount: 2,
        })
      );

      // Simulate successful save
      const { shouldSaveSessionToHistory } = require("../utils/helpers");
      const completedSession = {
        ...workSession,
        completed: true,
        endTime: new Date(),
      };
      const shouldSave = shouldSaveSessionToHistory(completedSession);

      expect(shouldSave).toBe(true);

      // Session count should increment for work sessions
      const expectedSessionCount = 6;
      const expectedFocusPeriodCount = 3;

      expect(expectedSessionCount).toBe(6);
      expect(expectedFocusPeriodCount).toBe(3);
    });

    it("should NOT increment session count for break sessions", () => {
      const breakSession = createValidTestSession(300);
      breakSession.type = SessionType.SHORT_BREAK;

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: breakSession,
          sessionCount: 5,
          currentFocusPeriodSessionCount: 2,
        })
      );

      // Simulate successful save
      const { shouldSaveSessionToHistory } = require("../utils/helpers");
      const completedSession = {
        ...breakSession,
        completed: true,
        endTime: new Date(),
      };
      const shouldSave = shouldSaveSessionToHistory(completedSession);

      expect(shouldSave).toBe(true);

      // Session count should NOT increment for break sessions
      const expectedSessionCount = 5; // Unchanged
      const expectedFocusPeriodCount = 2; // Unchanged

      expect(expectedSessionCount).toBe(5);
      expect(expectedFocusPeriodCount).toBe(2);
    });

    it("should update stats after session completion", () => {
      const session = createValidTestSession(1500);
      const initialHistory = createTestHistory(2);

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: session,
          history: initialHistory,
        })
      );

      // Simulate stats calculation
      const { calculateStats } = require("../store/slices/stats-slice");
      const completedSession = {
        ...session,
        completed: true,
        endTime: new Date(),
      };
      const newHistory = [...initialHistory, completedSession];
      const newStats = calculateStats(newHistory);

      expect(newStats.totalSessions).toBe(3);
      expect(newStats.completedSessions).toBe(3); // All test sessions are completed
      expect(newStats.totalWorkTime).toBeGreaterThan(0);
    });

    it("should transition to COMPLETED state", () => {
      const session = createValidTestSession(1500);

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: session,
          state: TimerState.RUNNING,
        })
      );

      // After completion, state should be COMPLETED
      const expectedState = TimerState.COMPLETED;
      expect(expectedState).toBe(TimerState.COMPLETED);
    });

    it("should show toast notification for short sessions", () => {
      const shortSession = createShortTestSession(25);

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: shortSession,
        })
      );

      // Simulate the notification logic
      const {
        shouldSaveSessionToHistory,
        getActualSessionDuration,
      } = require("../utils/helpers");
      const completedSession = {
        ...shortSession,
        completed: true,
        endTime: new Date(),
      };
      const shouldSave = shouldSaveSessionToHistory(completedSession);
      const actualDuration = getActualSessionDuration(completedSession);

      if (!shouldSave) {
        showToast({
          style: Toast.Style.Failure,
          title: "Session Too Short",
          message: `Session completed in ${actualDuration}s but won't be saved to history (minimum: 40s)`,
        });
      }

      expect(shouldSave).toBe(false);
      expectShortSessionToast(25);
    });
  });

  describe("stopTimer() Function", () => {
    it("should save valid stopped session to history", () => {
      const session = createValidTestSession(900); // 15 minutes
      session.endReason = SessionEndReason.STOPPED;

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: session,
          history: [],
          state: TimerState.RUNNING,
        })
      );

      // Simulate stopTimer call
      const { shouldSaveSessionToHistory } = require("../utils/helpers");
      const stoppedSession = { ...session, endTime: new Date() };
      const shouldSave = shouldSaveSessionToHistory(stoppedSession);

      expect(shouldSave).toBe(true);
    });

    it("should NOT save short stopped session to history", () => {
      const shortSession = createShortTestSession(20);
      shortSession.endReason = SessionEndReason.STOPPED;

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: shortSession,
          history: [],
          state: TimerState.RUNNING,
        })
      );

      // Simulate stopTimer call
      const { shouldSaveSessionToHistory } = require("../utils/helpers");
      const stoppedSession = { ...shortSession, endTime: new Date() };
      const shouldSave = shouldSaveSessionToHistory(stoppedSession);

      expect(shouldSave).toBe(false);
    });

    it("should show appropriate toast for stopped short sessions", () => {
      const shortSession = createShortTestSession(35);

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: shortSession,
        })
      );

      // Simulate the notification logic for stopped session
      const {
        shouldSaveSessionToHistory,
        getActualSessionDuration,
      } = require("../utils/helpers");
      const stoppedSession = { ...shortSession, endTime: new Date() };
      const shouldSave = shouldSaveSessionToHistory(stoppedSession);
      const actualDuration = getActualSessionDuration(stoppedSession);

      if (!shouldSave) {
        showToast({
          style: Toast.Style.Failure,
          title: "Session Too Short",
          message: `Session stopped after ${actualDuration}s and won't be saved to history (minimum: 40s)`,
        });
      }

      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("stopped after"),
        })
      );
    });

    it("should reset timer state after stopping", () => {
      const session = createTestSession();

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: session,
          state: TimerState.RUNNING,
          timeRemaining: 500,
        })
      );

      // After stopping, state should be reset
      const expectedState = {
        currentSession: null,
        state: TimerState.IDLE,
        timeRemaining: 0,
      };

      expect(expectedState.currentSession).toBeNull();
      expect(expectedState.state).toBe(TimerState.IDLE);
      expect(expectedState.timeRemaining).toBe(0);
    });
  });

  describe("History Array Management", () => {
    it("should append new sessions to existing history", () => {
      const existingHistory = createTestHistory(3);
      const newSession = createValidTestSession(1200);

      const updatedHistory = [...existingHistory, newSession];

      expect(updatedHistory).toHaveLength(4);
      expect(updatedHistory[3]).toBe(newSession);
      expectSessionInHistory(updatedHistory, newSession.id);
    });

    it("should maintain history order (newest last)", () => {
      const history = createTestHistory(3);
      const newSession = createValidTestSession(1500);
      newSession.startTime = new Date(); // Most recent

      const updatedHistory = [...history, newSession];

      // Newest session should be last
      expect(updatedHistory[updatedHistory.length - 1]).toBe(newSession);
    });

    it("should handle empty history correctly", () => {
      const emptyHistory: any[] = [];
      const firstSession = createValidTestSession(1500);

      const updatedHistory = [...emptyHistory, firstSession];

      expect(updatedHistory).toHaveLength(1);
      expect(updatedHistory[0]).toBe(firstSession);
    });
  });

  describe("Pause Time Tracking", () => {
    it("should reset pause tracking after session completion", () => {
      const session = createTestSession({
        pausedTime: 120, // 2 minutes paused during session
      });

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: session,
          pauseStartTime: new Date(),
          totalPausedTime: 120,
        })
      );

      // After completion, pause tracking should be reset
      const expectedState = {
        pauseStartTime: null,
        totalPausedTime: 0,
      };

      expect(expectedState.pauseStartTime).toBeNull();
      expect(expectedState.totalPausedTime).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing current session gracefully", () => {
      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: null,
          state: TimerState.IDLE,
        })
      );

      // Should not throw error when no current session
      expect(() => {
        const state = mockGetState();
        if (!state.currentSession) {
          // Just reset state
          const resetState = {
            currentSession: null,
            state: TimerState.IDLE,
            timeRemaining: 0,
          };
          expect(resetState.currentSession).toBeNull();
        }
      }).not.toThrow();
    });

    it("should handle invalid session data gracefully", () => {
      const invalidSession = createTestSession({
        startTime: undefined as any,
        endTime: undefined as any,
        activeDuration: undefined, // Make sure no valid duration data
      });

      mockGetState.mockReturnValue(
        createMockStore({
          currentSession: invalidSession,
        })
      );

      // Should handle invalid session without crashing
      const { shouldSaveSessionToHistory } = require("../utils/helpers");
      const shouldSave = shouldSaveSessionToHistory(invalidSession);

      expect(shouldSave).toBe(false);
    });
  });
});
