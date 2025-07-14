// Mock the timer store before imports
const mockTimerStore = {
  getState: jest.fn(),
  setState: jest.fn(),
};

jest.mock("../store/timer-store", () => ({
  useTimerStore: mockTimerStore,
}));

import { timerCoreService } from "../services/timer/timer-core-service";
import { SessionType, TimerConfig } from "../types/timer";

describe("Multi-Round Session Logic", () => {
  const defaultConfig: TimerConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    enableNotifications: true,
    autoStartBreaks: true,
    autoStartWork: false,
    enableApplicationTracking: true,
    trackingInterval: 5,
    enableAdaptiveTimers: false,
    adaptiveMode: "energy-based",
    minWorkDuration: 10,
    maxWorkDuration: 60,
    adaptiveBreakRatio: 0.2,
    enableRewardSystem: true,
    enableTransitionWarnings: true,
    warningIntervals: [300, 120, 60],
    enableHyperfocusDetection: true,
    maxConsecutiveSessions: 3,
    forcedBreakAfterHours: 2.5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("shouldAutoStartNext", () => {
    it("should return true for work sessions when autoStartBreaks is enabled", () => {
      const result = timerCoreService.shouldAutoStartNext(SessionType.WORK, {
        ...defaultConfig,
        autoStartBreaks: true,
      });
      expect(result).toBe(true);
    });

    it("should return false for work sessions when autoStartBreaks is disabled", () => {
      const result = timerCoreService.shouldAutoStartNext(SessionType.WORK, {
        ...defaultConfig,
        autoStartBreaks: false,
      });
      expect(result).toBe(false);
    });

    it("should return true for break sessions when autoStartWork is enabled", () => {
      const result = timerCoreService.shouldAutoStartNext(
        SessionType.SHORT_BREAK,
        {
          ...defaultConfig,
          autoStartWork: true,
        }
      );
      expect(result).toBe(true);
    });

    it("should return false for break sessions when autoStartWork is disabled", () => {
      const result = timerCoreService.shouldAutoStartNext(
        SessionType.SHORT_BREAK,
        {
          ...defaultConfig,
          autoStartWork: false,
        }
      );
      expect(result).toBe(false);
    });
  });

  describe("getNextSessionType", () => {
    it("should return SHORT_BREAK after work session (not long break time)", () => {
      const result = timerCoreService.getNextSessionType(
        SessionType.WORK,
        1, // 1 session completed, not time for long break (interval is 4)
        defaultConfig
      );
      expect(result).toBe(SessionType.SHORT_BREAK);
    });

    it("should return LONG_BREAK after work session when it's time for long break", () => {
      const result = timerCoreService.getNextSessionType(
        SessionType.WORK,
        4, // 4 sessions completed, time for long break (interval is 4)
        defaultConfig
      );
      expect(result).toBe(SessionType.LONG_BREAK);
    });

    it("should return WORK after any break session", () => {
      const shortBreakResult = timerCoreService.getNextSessionType(
        SessionType.SHORT_BREAK,
        2,
        defaultConfig
      );
      expect(shortBreakResult).toBe(SessionType.WORK);

      const longBreakResult = timerCoreService.getNextSessionType(
        SessionType.LONG_BREAK,
        4,
        defaultConfig
      );
      expect(longBreakResult).toBe(SessionType.WORK);
    });

    it("should handle edge case where session count is 0", () => {
      const result = timerCoreService.getNextSessionType(
        SessionType.WORK,
        0,
        defaultConfig
      );
      expect(result).toBe(SessionType.SHORT_BREAK);
    });

    it("should handle custom long break intervals", () => {
      const customConfig = {
        ...defaultConfig,
        longBreakInterval: 3, // Every 3 sessions instead of 4
      };

      // Should be short break after 1 session
      expect(
        timerCoreService.getNextSessionType(SessionType.WORK, 1, customConfig)
      ).toBe(SessionType.SHORT_BREAK);

      // Should be short break after 2 sessions
      expect(
        timerCoreService.getNextSessionType(SessionType.WORK, 2, customConfig)
      ).toBe(SessionType.SHORT_BREAK);

      // Should be long break after 3 sessions
      expect(
        timerCoreService.getNextSessionType(SessionType.WORK, 3, customConfig)
      ).toBe(SessionType.LONG_BREAK);

      // Should be short break after 4 sessions (not divisible by 3)
      expect(
        timerCoreService.getNextSessionType(SessionType.WORK, 4, customConfig)
      ).toBe(SessionType.SHORT_BREAK);

      // Should be long break after 6 sessions (divisible by 3)
      expect(
        timerCoreService.getNextSessionType(SessionType.WORK, 6, customConfig)
      ).toBe(SessionType.LONG_BREAK);
    });
  });

  describe("shouldContinueFocusPeriod", () => {
    it("should return true when there are remaining rounds", () => {
      const result = timerCoreService.shouldContinueFocusPeriod(
        2, // 2 sessions completed
        4, // 4 target rounds
        "focus-period-id"
      );
      expect(result).toBe(true);
    });

    it("should return false when all rounds are completed", () => {
      const result = timerCoreService.shouldContinueFocusPeriod(
        4, // 4 sessions completed
        4, // 4 target rounds
        "focus-period-id"
      );
      expect(result).toBe(false);
    });

    it("should return false when there is no active focus period", () => {
      const result = timerCoreService.shouldContinueFocusPeriod(
        2, // 2 sessions completed
        4, // 4 target rounds
        null // no active focus period
      );
      expect(result).toBe(false);
    });

    it("should return false when sessions exceed target rounds", () => {
      const result = timerCoreService.shouldContinueFocusPeriod(
        5, // 5 sessions completed
        4, // 4 target rounds
        "focus-period-id"
      );
      expect(result).toBe(false);
    });

    it("should handle single round focus periods", () => {
      // Should return false when single round is completed
      const completedResult = timerCoreService.shouldContinueFocusPeriod(
        1, // 1 session completed
        1, // 1 target round
        "focus-period-id"
      );
      expect(completedResult).toBe(false);

      // Should return true when single round is not yet completed
      const incompleteResult = timerCoreService.shouldContinueFocusPeriod(
        0, // 0 sessions completed
        1, // 1 target round
        "focus-period-id"
      );
      expect(incompleteResult).toBe(true);
    });
  });

  describe("Session Creation", () => {
    beforeEach(() => {
      mockTimerStore.getState.mockReturnValue({
        config: defaultConfig,
      });
    });

    it("should create work session with correct duration", () => {
      const result = timerCoreService.createSession(
        SessionType.WORK,
        "Test Task",
        "Test Project",
        ["tag1", "tag2"]
      );

      expect(result.session.type).toBe(SessionType.WORK);
      expect(result.session.taskName).toBe("Test Task");
      expect(result.session.projectName).toBe("Test Project");
      expect(result.session.tags).toEqual(["tag1", "tag2"]);
      expect(result.duration).toBe(25 * 60); // 25 minutes in seconds
      expect(result.session.duration).toBe(25 * 60);
    });

    it("should create short break session with correct duration", () => {
      const result = timerCoreService.createSession(SessionType.SHORT_BREAK);

      expect(result.session.type).toBe(SessionType.SHORT_BREAK);
      expect(result.duration).toBe(5 * 60); // 5 minutes in seconds
      expect(result.session.duration).toBe(5 * 60);
    });

    it("should create long break session with correct duration", () => {
      const result = timerCoreService.createSession(SessionType.LONG_BREAK);

      expect(result.session.type).toBe(SessionType.LONG_BREAK);
      expect(result.duration).toBe(15 * 60); // 15 minutes in seconds
      expect(result.session.duration).toBe(15 * 60);
    });

    it("should generate unique session IDs", () => {
      const result1 = timerCoreService.createSession(SessionType.WORK);
      const result2 = timerCoreService.createSession(SessionType.WORK);

      expect(result1.session.id).toBeDefined();
      expect(result2.session.id).toBeDefined();
      expect(result1.session.id).not.toBe(result2.session.id);
    });

    it("should set correct start and end times", () => {
      const beforeCreation = Date.now();
      const result = timerCoreService.createSession(SessionType.WORK);
      const afterCreation = Date.now();

      const sessionStartTime = result.session.startTime.getTime();
      const endTime = result.endTime.getTime();

      expect(sessionStartTime).toBeGreaterThanOrEqual(beforeCreation);
      expect(sessionStartTime).toBeLessThanOrEqual(afterCreation);
      expect(endTime).toBe(sessionStartTime + result.duration * 1000);
    });
  });
});
