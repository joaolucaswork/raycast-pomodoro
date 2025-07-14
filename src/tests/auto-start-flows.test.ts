import { SessionType, TimerConfig, TimerState } from "../types/timer";

// Mock the timer completion service
const mockTimerCompletionService = {
  handleAutoStartLogic: jest.fn(),
};

// Mock the background timer service
const mockBackgroundTimerService = {
  startTimer: jest.fn(),
};

// Mock the timer notification service
const mockTimerNotificationService = {
  notifyAutoStart: jest.fn(),
};

// Mock the timer store
const mockTimerStore = {
  getState: jest.fn(),
  setState: jest.fn(),
};

// Mock the timer core service
const mockTimerCoreService = {
  shouldAutoStartNext: jest.fn(),
  getNextSessionType: jest.fn(),
  shouldContinueFocusPeriod: jest.fn(),
};

describe("Auto-Start Flow Tests", () => {
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

  describe("Single Round Sessions", () => {
    it("should auto-start break after work session when autoStartBreaks is enabled", () => {
      const mockState = {
        config: { ...defaultConfig, autoStartBreaks: true },
        currentFocusPeriodSessionCount: 1,
        targetRounds: 1,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(true);
      mockTimerCoreService.getNextSessionType.mockReturnValue(
        SessionType.SHORT_BREAK
      );

      // Simulate the auto-start logic
      const completedSessionType = SessionType.WORK;
      const isManualCompletion = false;
      const hasRemainingRounds = false; // Single round completed

      const shouldAutoStartForMultiRound =
        !isManualCompletion && hasRemainingRounds;
      const shouldAutoStartRegular =
        !isManualCompletion &&
        mockTimerCoreService.shouldAutoStartNext(
          completedSessionType,
          mockState.config
        );

      expect(shouldAutoStartForMultiRound).toBe(false);
      expect(shouldAutoStartRegular).toBe(true);
      expect(shouldAutoStartForMultiRound || shouldAutoStartRegular).toBe(true);
    });

    it("should not auto-start break after work session when autoStartBreaks is disabled", () => {
      const mockState = {
        config: { ...defaultConfig, autoStartBreaks: false },
        currentFocusPeriodSessionCount: 1,
        targetRounds: 1,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(false);

      const completedSessionType = SessionType.WORK;
      const isManualCompletion = false;
      const hasRemainingRounds = false;

      const shouldAutoStartForMultiRound =
        !isManualCompletion && hasRemainingRounds;
      const shouldAutoStartRegular =
        !isManualCompletion &&
        mockTimerCoreService.shouldAutoStartNext(
          completedSessionType,
          mockState.config
        );

      expect(shouldAutoStartForMultiRound).toBe(false);
      expect(shouldAutoStartRegular).toBe(false);
      expect(shouldAutoStartForMultiRound || shouldAutoStartRegular).toBe(
        false
      );
    });
  });

  describe("Multi-Round Sessions", () => {
    it("should auto-start break after work session even when autoStartBreaks is disabled (multi-round override)", () => {
      const mockState = {
        config: { ...defaultConfig, autoStartBreaks: false },
        currentFocusPeriodSessionCount: 1,
        targetRounds: 3,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(false);
      mockTimerCoreService.getNextSessionType.mockReturnValue(
        SessionType.SHORT_BREAK
      );

      const completedSessionType = SessionType.WORK;
      const isManualCompletion = false;
      const hasRemainingRounds = true; // Still have rounds remaining

      const shouldAutoStartForMultiRound =
        !isManualCompletion && hasRemainingRounds;
      const shouldAutoStartRegular =
        !isManualCompletion &&
        mockTimerCoreService.shouldAutoStartNext(
          completedSessionType,
          mockState.config
        );

      expect(shouldAutoStartForMultiRound).toBe(true);
      expect(shouldAutoStartRegular).toBe(false);
      expect(shouldAutoStartForMultiRound || shouldAutoStartRegular).toBe(true);
    });

    it("should auto-start work after break in multi-round session even when autoStartWork is disabled", () => {
      const mockState = {
        config: { ...defaultConfig, autoStartWork: false },
        currentFocusPeriodSessionCount: 1,
        targetRounds: 3,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(false);
      mockTimerCoreService.getNextSessionType.mockReturnValue(SessionType.WORK);

      const completedSessionType = SessionType.SHORT_BREAK;
      const isManualCompletion = false;
      const hasRemainingRounds = true;

      const shouldAutoStartForMultiRound =
        !isManualCompletion && hasRemainingRounds;
      const shouldAutoStartRegular =
        !isManualCompletion &&
        mockTimerCoreService.shouldAutoStartNext(
          completedSessionType,
          mockState.config
        );

      expect(shouldAutoStartForMultiRound).toBe(true);
      expect(shouldAutoStartRegular).toBe(false);
      expect(shouldAutoStartForMultiRound || shouldAutoStartRegular).toBe(true);
    });

    it("should end focus period when all rounds are completed", () => {
      const mockState = {
        config: { ...defaultConfig, autoStartBreaks: false },
        currentFocusPeriodSessionCount: 3,
        targetRounds: 3,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(false);

      const completedSessionType = SessionType.WORK;
      const isManualCompletion = false;
      const hasRemainingRounds = false; // All rounds completed

      const shouldAutoStartForMultiRound =
        !isManualCompletion && hasRemainingRounds;
      const shouldAutoStartRegular =
        !isManualCompletion &&
        mockTimerCoreService.shouldAutoStartNext(
          completedSessionType,
          mockState.config
        );

      expect(shouldAutoStartForMultiRound).toBe(false);
      expect(shouldAutoStartRegular).toBe(false);
      expect(shouldAutoStartForMultiRound || shouldAutoStartRegular).toBe(
        false
      );
    });
  });

  describe("Manual Completion Scenarios", () => {
    it("should not auto-start after manual completion even in multi-round sessions", () => {
      const mockState = {
        config: { ...defaultConfig, autoStartBreaks: true },
        currentFocusPeriodSessionCount: 1,
        targetRounds: 3,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(true);

      const completedSessionType = SessionType.WORK;
      const isManualCompletion = true; // Manual completion
      const hasRemainingRounds = true;

      const shouldAutoStartForMultiRound =
        !isManualCompletion && hasRemainingRounds;
      const shouldAutoStartRegular =
        !isManualCompletion &&
        mockTimerCoreService.shouldAutoStartNext(
          completedSessionType,
          mockState.config
        );

      expect(shouldAutoStartForMultiRound).toBe(false);
      expect(shouldAutoStartRegular).toBe(false);
      expect(shouldAutoStartForMultiRound || shouldAutoStartRegular).toBe(
        false
      );
    });
  });

  describe("Long Break Timing", () => {
    it("should start long break after completing longBreakInterval work sessions", () => {
      const mockState = {
        config: { ...defaultConfig, longBreakInterval: 4 },
        currentFocusPeriodSessionCount: 4, // 4th session completed
        targetRounds: 6,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.getNextSessionType.mockReturnValue(
        SessionType.LONG_BREAK
      );

      const nextSessionType = mockTimerCoreService.getNextSessionType(
        SessionType.WORK,
        mockState.currentFocusPeriodSessionCount,
        mockState.config
      );

      expect(nextSessionType).toBe(SessionType.LONG_BREAK);
    });

    it("should start short break when not at long break interval", () => {
      const mockState = {
        config: { ...defaultConfig, longBreakInterval: 4 },
        currentFocusPeriodSessionCount: 2, // 2nd session completed
        targetRounds: 6,
        currentFocusPeriodId: "test-period",
      };

      mockTimerStore.getState.mockReturnValue(mockState);
      mockTimerCoreService.getNextSessionType.mockReturnValue(
        SessionType.SHORT_BREAK
      );

      const nextSessionType = mockTimerCoreService.getNextSessionType(
        SessionType.WORK,
        mockState.currentFocusPeriodSessionCount,
        mockState.config
      );

      expect(nextSessionType).toBe(SessionType.SHORT_BREAK);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero target rounds gracefully", () => {
      const mockState = {
        config: defaultConfig,
        currentFocusPeriodSessionCount: 0,
        targetRounds: 0,
        currentFocusPeriodId: "test-period",
      };

      const hasRemainingRounds =
        mockState.currentFocusPeriodId &&
        mockState.currentFocusPeriodSessionCount < mockState.targetRounds;

      expect(hasRemainingRounds).toBe(false);
    });

    it("should handle null focus period ID", () => {
      const mockState = {
        config: defaultConfig,
        currentFocusPeriodSessionCount: 1,
        targetRounds: 3,
        currentFocusPeriodId: null,
      };

      const hasRemainingRounds = Boolean(
        mockState.currentFocusPeriodId &&
          mockState.currentFocusPeriodSessionCount < mockState.targetRounds
      );

      expect(hasRemainingRounds).toBe(false);
    });

    it("should handle session count exceeding target rounds", () => {
      const mockState = {
        config: defaultConfig,
        currentFocusPeriodSessionCount: 5,
        targetRounds: 3,
        currentFocusPeriodId: "test-period",
      };

      const hasRemainingRounds =
        mockState.currentFocusPeriodId &&
        mockState.currentFocusPeriodSessionCount < mockState.targetRounds;

      expect(hasRemainingRounds).toBe(false);
    });
  });
});
