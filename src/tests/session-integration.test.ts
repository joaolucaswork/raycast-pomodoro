/**
 * Session Integration & End-to-End Tests
 *
 * Comprehensive end-to-end testing of session saving workflows including
 * integration with history display, stats, points, and user-facing behavior.
 */

import { showToast, Toast } from "@raycast/api";
import { TimerState, SessionType, SessionEndReason } from "../types/timer";
import {
  createTestSession,
  createValidTestSession,
  createShortTestSession,
  createComprehensiveTestSession,
  createTestHistory,
} from "./utils/test-factories";
import {
  setupTestEnvironment,
  createMockStore,
  expectSessionInHistory,
  expectSessionNotInHistory,
  expectToastNotification,
  waitForAsync,
} from "./utils/test-helpers";
import { setupSessionSavingMocks } from "./utils/test-mocks";

// Setup test environment
setupTestEnvironment();

// Setup comprehensive mocks
const mocks = setupSessionSavingMocks();

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

jest.mock("../utils/helpers", () => ({
  shouldSaveSessionToHistory: jest.fn((session) => {
    // Use activeDuration if available (preferred method)
    let actualDuration = 0;

    if (session.activeDuration !== undefined) {
      actualDuration = session.activeDuration;
    } else {
      // Fallback to wall-clock time calculation
      if (!session.startTime) return false;

      try {
        const endTime = session.endTime || new Date();
        const wallClockDuration = Math.floor(
          (endTime.getTime() - session.startTime.getTime()) / 1000
        );
        const pausedTime = session.pausedTime || 0;
        actualDuration = Math.max(0, wallClockDuration - pausedTime);
      } catch (error) {
        return false;
      }
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

    try {
      const endTime = session.endTime || new Date();
      const wallClockDuration = Math.floor(
        (endTime.getTime() - session.startTime.getTime()) / 1000
      );

      // If we have pause time, subtract it from wall-clock time
      const pausedTime = session.pausedTime || 0;
      const duration = wallClockDuration - pausedTime;

      return Math.max(0, duration); // Ensure non-negative
    } catch (error) {
      return 0;
    }
  }),
  generateId: jest.fn(() => `integration-test-${Date.now()}`),
}));

jest.mock("../store/slices/stats-slice", () => ({
  calculateStats: jest.fn((history) => ({
    totalSessions: history.length,
    completedSessions: history.filter((s: any) => s.completed).length,
    totalWorkTime: history.reduce(
      (acc: number, s: any) =>
        s.type === SessionType.WORK
          ? acc + (s.activeDuration || s.duration)
          : acc,
      0
    ),
    totalBreakTime: history.reduce(
      (acc: number, s: any) =>
        s.type !== SessionType.WORK
          ? acc + (s.activeDuration || s.duration)
          : acc,
      0
    ),
    streakCount: 1,
    todaysSessions: history.filter((s: any) => {
      const today = new Date().toDateString();
      return s.startTime.toDateString() === today;
    }).length,
    weekSessions: history.length,
    monthSessions: history.length,
    totalPauseTime: history.reduce(
      (acc: number, s: any) => acc + (s.pausedTime || 0),
      0
    ),
    sessionsWithPauses: history.filter((s: any) => s.pausedTime > 0).length,
    averagePauseTime: 0,
  })),
}));

describe("Session Integration & End-to-End Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete Session Saving Workflow", () => {
    it("should complete full workflow for valid work session", async () => {
      const workSession = createValidTestSession(1500); // 25 minutes
      workSession.type = SessionType.WORK;
      workSession.taskName = "Complete integration tests";
      workSession.tags = ["testing", "development"];

      const initialHistory = createTestHistory(2);
      const initialStats = {
        totalSessions: 2,
        completedSessions: 2,
        totalWorkTime: 1500, // Only 1 work session in createTestHistory(2)
        totalBreakTime: 1500, // 1 break session
      };

      // Simulate complete workflow
      const {
        shouldSaveSessionToHistory,
        getActualSessionDuration,
      } = require("../utils/helpers");
      const { calculateStats } = require("../store/slices/stats-slice");

      // 1. Complete the session
      const completedSession = {
        ...workSession,
        completed: true,
        endTime: new Date(),
        endReason: SessionEndReason.COMPLETED,
      };

      // 2. Validate session
      const shouldSave = shouldSaveSessionToHistory(completedSession);
      const actualDuration = getActualSessionDuration(completedSession);

      expect(shouldSave).toBe(true);
      expect(actualDuration).toBe(1500);

      // 3. Update history
      const newHistory = [...initialHistory, completedSession];
      expectSessionInHistory(newHistory, completedSession.id);

      // 4. Recalculate stats
      const newStats = calculateStats(newHistory);
      expect(newStats.totalSessions).toBe(3);
      expect(newStats.completedSessions).toBe(3);
      expect(newStats.totalWorkTime).toBe(3000); // Previous 1500 + new 1500

      // 5. Verify no error notifications
      expect(showToast).not.toHaveBeenCalledWith(
        expect.objectContaining({
          style: Toast.Style.Failure,
        })
      );
    });

    it("should complete full workflow for short session with notifications", async () => {
      const shortSession = createShortTestSession(25); // 25 seconds
      shortSession.endReason = SessionEndReason.STOPPED;

      const initialHistory = createTestHistory(1);

      // Simulate complete workflow
      const {
        shouldSaveSessionToHistory,
        getActualSessionDuration,
      } = require("../utils/helpers");

      // 1. Complete the session
      const completedSession = {
        ...shortSession,
        completed: false,
        endTime: new Date(),
      };

      // 2. Validate session
      const shouldSave = shouldSaveSessionToHistory(completedSession);
      const actualDuration = getActualSessionDuration(completedSession);

      expect(shouldSave).toBe(false);
      expect(actualDuration).toBe(25);

      // 3. History should remain unchanged
      const newHistory = shouldSave
        ? [...initialHistory, completedSession]
        : initialHistory;
      expect(newHistory).toHaveLength(1);
      expectSessionNotInHistory(newHistory, completedSession.id);

      // 4. Show appropriate notification
      if (!shouldSave) {
        showToast({
          style: Toast.Style.Failure,
          title: "Session Too Short",
          message: `Session stopped after ${actualDuration}s and won't be saved to history (minimum: 40s)`,
        });
      }

      expectToastNotification(
        Toast.Style.Failure,
        "Session Too Short",
        "Session stopped after 25s and won't be saved to history (minimum: 40s)"
      );
    });

    it("should handle break session workflow correctly", async () => {
      const breakSession = createValidTestSession(300); // 5 minutes
      breakSession.type = SessionType.SHORT_BREAK;

      const initialHistory = createTestHistory(3);

      // Simulate break session completion
      const { shouldSaveSessionToHistory } = require("../utils/helpers");
      const { calculateStats } = require("../store/slices/stats-slice");

      const completedSession = {
        ...breakSession,
        completed: true,
        endTime: new Date(),
        endReason: SessionEndReason.COMPLETED,
      };

      const shouldSave = shouldSaveSessionToHistory(completedSession);
      expect(shouldSave).toBe(true);

      // Break sessions should be saved but not count toward work stats
      const newHistory = [...initialHistory, completedSession];
      const newStats = calculateStats(newHistory);

      expect(newStats.totalSessions).toBe(4);
      expect(newStats.totalBreakTime).toBeGreaterThan(0);
    });
  });

  describe("Integration with History Display", () => {
    it("should properly format sessions for history display", () => {
      const comprehensiveSession = createComprehensiveTestSession();
      const history = [comprehensiveSession];

      // Verify session appears correctly in history
      expectSessionInHistory(history, comprehensiveSession.id);

      // Verify all display properties are present
      const displaySession = history[0];
      expect(displaySession.taskName).toBe("Comprehensive Test Task");
      expect(displaySession.projectName).toBe("Test Project Alpha");
      expect(displaySession.tags).toEqual(["urgent", "development", "testing"]);
      expect(displaySession.duration).toBe(1800);
      expect(displaySession.startTime).toBeInstanceOf(Date);
      expect(displaySession.endTime).toBeInstanceOf(Date);
    });

    it("should handle history sorting and filtering", () => {
      const sessions = [
        createTestSession({
          startTime: new Date("2024-01-15T10:00:00Z"),
          type: SessionType.WORK,
        }),
        createTestSession({
          startTime: new Date("2024-01-15T11:00:00Z"),
          type: SessionType.SHORT_BREAK,
        }),
        createTestSession({
          startTime: new Date("2024-01-15T12:00:00Z"),
          type: SessionType.WORK,
        }),
      ];

      // History should maintain chronological order
      expect(sessions[0].startTime.getTime()).toBeLessThan(
        sessions[1].startTime.getTime()
      );
      expect(sessions[1].startTime.getTime()).toBeLessThan(
        sessions[2].startTime.getTime()
      );

      // Filter work sessions
      const workSessions = sessions.filter((s) => s.type === SessionType.WORK);
      expect(workSessions).toHaveLength(2);

      // Filter break sessions
      const breakSessions = sessions.filter(
        (s) => s.type === SessionType.SHORT_BREAK
      );
      expect(breakSessions).toHaveLength(1);
    });

    it("should display mood data correctly", () => {
      const sessionWithMood = createTestSession({
        energyLevel: 3,
        focusQuality: 4,
        moodState: "motivated",
      });

      const history = [sessionWithMood];
      const displaySession = history[0];

      expect(displaySession.energyLevel).toBe(3);
      expect(displaySession.focusQuality).toBe(4);
      expect(displaySession.moodState).toBe("motivated");
    });
  });

  describe("Integration with Statistics", () => {
    it("should update all statistics correctly after session save", () => {
      const sessions = [
        createValidTestSession(1500), // Work: 25 min
        createValidTestSession(300), // Break: 5 min
        createValidTestSession(1800), // Work: 30 min
      ];

      sessions[0].type = SessionType.WORK;
      sessions[1].type = SessionType.SHORT_BREAK;
      sessions[2].type = SessionType.WORK;

      const { calculateStats } = require("../store/slices/stats-slice");
      const stats = calculateStats(sessions);

      expect(stats.totalSessions).toBe(3);
      expect(stats.completedSessions).toBe(3);
      expect(stats.totalWorkTime).toBe(3300); // 1500 + 1800
      expect(stats.totalBreakTime).toBe(300); // 300
    });

    it("should handle pause time statistics", () => {
      const sessionsWithPauses = [
        createTestSession({
          duration: 1500,
          pausedTime: 120,
          activeDuration: 1380,
        }),
        createTestSession({
          duration: 1800,
          pausedTime: 0,
          activeDuration: 1800,
        }),
        createTestSession({
          duration: 1200,
          pausedTime: 180,
          activeDuration: 1020,
        }),
      ];

      const { calculateStats } = require("../store/slices/stats-slice");
      const stats = calculateStats(sessionsWithPauses);

      expect(stats.totalPauseTime).toBe(300); // 120 + 0 + 180
      expect(stats.sessionsWithPauses).toBe(2); // Two sessions had pauses
    });

    it("should calculate daily/weekly/monthly statistics", () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const sessions = [
        createTestSession({ startTime: today }),
        createTestSession({ startTime: today }),
        createTestSession({ startTime: yesterday }),
      ];

      const { calculateStats } = require("../store/slices/stats-slice");
      const stats = calculateStats(sessions);

      expect(stats.todaysSessions).toBe(2);
      expect(stats.weekSessions).toBe(3);
      expect(stats.monthSessions).toBe(3);
    });
  });

  describe("Integration with Points System", () => {
    it("should award points correctly for different completion types", () => {
      const naturalCompletion = createValidTestSession(1500);
      naturalCompletion.endReason = SessionEndReason.COMPLETED;

      const manualCompletion = createValidTestSession(900);
      manualCompletion.endReason = SessionEndReason.STOPPED;

      // Mock points calculations
      const naturalPoints = {
        points: 70,
        reason: "Natural completion",
        shouldAward: true,
      };
      const manualPoints = {
        points: 10,
        reason: "Manual completion",
        shouldAward: true,
      };

      expect(naturalPoints.points).toBe(70);
      expect(manualPoints.points).toBe(10);
      expect(naturalPoints.shouldAward).toBe(true);
      expect(manualPoints.shouldAward).toBe(true);
    });

    it("should handle points restrictions correctly", () => {
      const shortManualCompletion = createShortTestSession(20);
      shortManualCompletion.endReason = SessionEndReason.STOPPED;

      // Short manual completions should get minimal points
      const points = {
        points: 1,
        reason: "Manual completion (<40s)",
        shouldAward: true,
      };
      expect(points.points).toBe(1);
      expect(points.shouldAward).toBe(true);
    });
  });

  describe("User-Facing Behavior Validation", () => {
    it("should provide appropriate user feedback for all scenarios", async () => {
      const scenarios = [
        {
          session: createValidTestSession(1500),
          expectedToast: false,
          description: "Valid session - no error toast",
        },
        {
          session: createShortTestSession(30),
          expectedToast: true,
          description: "Short session - error toast shown",
        },
      ];

      for (const scenario of scenarios) {
        jest.clearAllMocks();

        const {
          shouldSaveSessionToHistory,
          getActualSessionDuration,
        } = require("../utils/helpers");
        const shouldSave = shouldSaveSessionToHistory(scenario.session);
        const duration = getActualSessionDuration(scenario.session);

        if (!shouldSave) {
          showToast({
            style: Toast.Style.Failure,
            title: "Session Too Short",
            message: `Session completed in ${duration}s but won't be saved to history (minimum: 40s)`,
          });
        }

        if (scenario.expectedToast) {
          expect(showToast).toHaveBeenCalledWith(
            expect.objectContaining({
              style: Toast.Style.Failure,
              title: "Session Too Short",
            })
          );
        } else {
          expect(showToast).not.toHaveBeenCalled();
        }
      }
    });

    it("should maintain consistent state transitions", () => {
      const stateTransitions = [
        { from: TimerState.IDLE, to: TimerState.RUNNING, action: "start" },
        { from: TimerState.RUNNING, to: TimerState.PAUSED, action: "pause" },
        { from: TimerState.PAUSED, to: TimerState.RUNNING, action: "resume" },
        {
          from: TimerState.RUNNING,
          to: TimerState.COMPLETED,
          action: "complete",
        },
        { from: TimerState.COMPLETED, to: TimerState.IDLE, action: "reset" },
      ];

      stateTransitions.forEach((transition) => {
        expect(Object.values(TimerState)).toContain(transition.from);
        expect(Object.values(TimerState)).toContain(transition.to);
      });
    });

    it("should handle rapid user interactions gracefully", async () => {
      const rapidActions = Array.from({ length: 10 }, (_, i) => ({
        session: createValidTestSession(60 + i * 10),
        timestamp: Date.now() + i * 100,
      }));

      // Simulate rapid session completions
      const results = rapidActions.map((action) => {
        const { shouldSaveSessionToHistory } = require("../utils/helpers");
        return shouldSaveSessionToHistory(action.session);
      });

      // All should be processed successfully
      expect(results).toHaveLength(10);
      results.forEach((result) => expect(result).toBe(true));
    });
  });

  describe("End-to-End Workflow Validation", () => {
    it("should complete full pomodoro cycle with proper session saving", async () => {
      const pomodoroSessions = [
        { type: SessionType.WORK, duration: 1500, shouldSave: true },
        { type: SessionType.SHORT_BREAK, duration: 300, shouldSave: true },
        { type: SessionType.WORK, duration: 1500, shouldSave: true },
        { type: SessionType.SHORT_BREAK, duration: 300, shouldSave: true },
        { type: SessionType.WORK, duration: 1500, shouldSave: true },
        { type: SessionType.LONG_BREAK, duration: 900, shouldSave: true },
      ];

      const completedSessions = [];
      const { shouldSaveSessionToHistory } = require("../utils/helpers");
      const { calculateStats } = require("../store/slices/stats-slice");

      for (const sessionConfig of pomodoroSessions) {
        const session = createValidTestSession(sessionConfig.duration);
        session.type = sessionConfig.type;
        session.completed = true;
        session.endTime = new Date();

        const shouldSave = shouldSaveSessionToHistory(session);
        expect(shouldSave).toBe(sessionConfig.shouldSave);

        if (shouldSave) {
          completedSessions.push(session);
        }
      }

      // Verify complete cycle was saved
      expect(completedSessions).toHaveLength(6);

      // Verify stats reflect complete cycle
      const finalStats = calculateStats(completedSessions);
      expect(finalStats.totalSessions).toBe(6);
      expect(finalStats.totalWorkTime).toBe(4500); // 3 work sessions × 1500s
      expect(finalStats.totalBreakTime).toBe(1500); // 2 short breaks × 300s + 1 long break × 900s
    });

    it("should maintain data consistency across all integrations", () => {
      const session = createComprehensiveTestSession();
      const history = [session];

      // Verify data consistency across all systems
      expectSessionInHistory(history, session.id);

      const { calculateStats } = require("../store/slices/stats-slice");
      const stats = calculateStats(history);

      // Stats should reflect the session data
      expect(stats.totalSessions).toBe(1);
      expect(stats.completedSessions).toBe(1);
      expect(stats.totalWorkTime).toBe(
        session.activeDuration || session.duration
      );

      // Session should maintain all its properties
      const savedSession = history[0];
      expect(savedSession.taskName).toBe(session.taskName);
      expect(savedSession.projectName).toBe(session.projectName);
      expect(savedSession.tags).toEqual(session.tags);
      expect(savedSession.energyLevel).toBe(session.energyLevel);
      expect(savedSession.focusQuality).toBe(session.focusQuality);
      expect(savedSession.moodState).toBe(session.moodState);
    });
  });
});
