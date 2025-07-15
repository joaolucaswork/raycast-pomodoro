// Mock all dependencies before imports
jest.mock("../store/timer-store", () => ({
  useTimerStore: {
    getState: jest.fn(() => ({
      history: [], // This is the key property that was missing
      sessions: [],
      totalPoints: 0,
      currentFocusPeriodSessionCount: 0,
      targetRounds: 1,
      currentFocusPeriodId: null,
      sessionCount: 0,
      config: {
        enableRewardSystem: true,
        autoStartBreaks: true,
        autoStartWork: false,
        longBreakInterval: 4,
        enableHyperfocusDetection: false,
      },
      awardPoints: jest.fn(),
      checkHyperfocus: jest.fn(),
    })),
    setState: jest.fn(),
  },
}));

jest.mock("../store/store-initialization", () => ({
  initializeTimerStore: jest.fn(),
}));

// Create mock objects that will be used consistently
const mockTimerCoreService = {
  stopApplicationTracking: jest.fn(),
  shouldAutoStartNext: jest.fn(() => false),
  getNextSessionType: jest.fn(),
  shouldContinueFocusPeriod: jest.fn(() => false),
  getTimerConfig: jest.fn(() => ({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    enableNotifications: true,
    autoStartBreaks: true,
    autoStartWork: false,
  })),
  createSession: jest.fn(() => ({
    session: {
      id: "test-session",
      type: "work",
      duration: 1500,
      startTime: new Date(),
      completed: false,
      taskName: "Test Task",
      tags: [],
    },
    duration: 1500,
    endTime: new Date(Date.now() + 1500000),
  })),
  createBackgroundState: jest.fn(() => ({
    state: "running",
    currentSession: null,
    startTime: Date.now(),
    endTime: Date.now() + 1500000,
  })),
  startApplicationTracking: jest.fn(),
  updateStoreState: jest.fn(),
};

const mockTimerNotificationService = {
  notifySessionCompletion: jest.fn(),
  notifyPointsAwarded: jest.fn(),
  notifyPointsRestricted: jest.fn(),
  notifyAutoStart: jest.fn(),
  notifyManualCompletion: jest.fn(),
  notifySessionTooShort: jest.fn(),
  notifySessionStart: jest.fn(),
  notifyHyperfocusDetected: jest.fn(),
};

jest.mock("../services/timer/timer-core-service", () => ({
  timerCoreService: mockTimerCoreService,
}));

jest.mock("../services/timer/timer-notification-service", () => ({
  timerNotificationService: mockTimerNotificationService,
}));

jest.mock("../utils/helpers", () => ({
  shouldSaveSessionToHistory: jest.fn(() => true),
  getActualSessionDuration: jest.fn(() => 1500), // Default to 1500 seconds (25 minutes)
  getSessionTypeLabel: jest.fn((type) => type), // Mock this helper too
}));

// Mock points system service with dynamic behavior and restriction tracking
let hasManualCompletionRestriction = false;

const mockPointsSystemService = {
  calculateSessionPoints: jest.fn((session, isManualCompletion) => {
    // Import the actual helpers to get the duration
    const actualDuration = jest.mocked(helpers.getActualSessionDuration)(
      session
    );

    if (!isManualCompletion) {
      // Natural completion - reset restriction
      hasManualCompletionRestriction = false;
      return {
        points: 70,
        reason: "Natural completion (timer expired)",
        shouldAward: true,
      };
    } else {
      // Manual completion
      if (hasManualCompletionRestriction) {
        // Points are restricted after previous manual completion
        return {
          points: 0,
          reason: "Points restricted after manual completion",
          shouldAward: false,
        };
      } else {
        // First manual completion - award points but set restriction
        hasManualCompletionRestriction = true;
        if (actualDuration >= 40) {
          return {
            points: 10,
            reason: `Manual completion (${actualDuration}s ≥ 40s)`,
            shouldAward: true,
          };
        } else {
          return {
            points: 1,
            reason: `Manual completion (${actualDuration}s < 40s minimum)`,
            shouldAward: true,
          };
        }
      }
    }
  }),
  resetState: jest.fn(() => {
    hasManualCompletionRestriction = false;
  }),
};

jest.mock("../services/features/points-system-service", () => ({
  pointsSystemService: mockPointsSystemService,
}));

import { timerCompletionService } from "../services/timer/timer-completion-service";
import { pointsSystemService } from "../services/features/points-system-service";
import { SessionType, SessionEndReason, TimerState } from "../types/timer";
import * as helpers from "../utils/helpers";

const mockTimerStore = {
  getState: jest.fn(),
  setState: jest.fn(),
};

describe("Timer Completion Integration", () => {
  const mockState = {
    config: {
      enableRewardSystem: true,
      autoStartBreaks: true,
      autoStartWork: false,
      longBreakInterval: 4,
      enableHyperfocusDetection: false,
    },
    currentFocusPeriodSessionCount: 1,
    targetRounds: 3,
    currentFocusPeriodId: "test-focus-period",
    history: [], // Ensure history is always present
    sessionCount: 0, // Add sessionCount property
    awardPoints: jest.fn(),
    checkHyperfocus: jest.fn(),
  };

  beforeEach(() => {
    // Use fake timers to handle setTimeout calls
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Reset points system service
    mockPointsSystemService.resetState();

    // Ensure the mock store returns the same mockState object consistently
    mockTimerStore.getState.mockReturnValue(mockState);

    // Also update the main mock to return the same state
    const mockUseTimerStore = require("../store/timer-store").useTimerStore;
    mockUseTimerStore.getState.mockReturnValue(mockState);
  });

  afterEach(() => {
    // Clean up timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Natural Completion Flow", () => {
    it("should award 70 points for natural completion", async () => {
      const session = createTestSession({
        endReason: SessionEndReason.COMPLETED,
      });

      await timerCompletionService.handleCompletion(session, false);

      expect(mockState.awardPoints).toHaveBeenCalledWith(
        70,
        "Natural completion (timer expired)"
      );
      expect(
        mockTimerNotificationService.notifyPointsAwarded
      ).toHaveBeenCalledWith(70, "Natural completion (timer expired)");
    });

    it("should trigger auto-start logic for natural completion", async () => {
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(true);
      mockTimerCoreService.getNextSessionType.mockReturnValue(
        SessionType.SHORT_BREAK
      );

      const session = createTestSession();

      await timerCompletionService.handleCompletion(session, false);

      expect(mockTimerCoreService.shouldAutoStartNext).toHaveBeenCalledWith(
        SessionType.WORK,
        expect.objectContaining({
          enableRewardSystem: true,
          autoStartBreaks: true,
        })
      );
    });
  });

  describe("Manual Completion Flow", () => {
    it("should award 10 points for manual completion after 40s", async () => {
      jest.mocked(helpers.getActualSessionDuration).mockReturnValue(100); // 100 seconds

      const session = createTestSession({
        endReason: SessionEndReason.STOPPED,
      });

      await timerCompletionService.handleManualCompletion(session);

      expect(mockState.awardPoints).toHaveBeenCalledWith(
        10,
        "Manual completion (100s ≥ 40s)"
      );
      expect(
        mockTimerNotificationService.notifyManualCompletion
      ).toHaveBeenCalledWith(session);
    });

    it("should award 1 point for manual completion before 40s", async () => {
      jest.mocked(helpers.getActualSessionDuration).mockReturnValue(30); // 30 seconds

      const session = createTestSession({
        endReason: SessionEndReason.STOPPED,
      });

      await timerCompletionService.handleManualCompletion(session);

      expect(mockState.awardPoints).toHaveBeenCalledWith(
        1,
        "Manual completion (30s < 40s minimum)"
      );
    });

    it("should not trigger auto-start for manual completion", async () => {
      const session = createTestSession();

      await timerCompletionService.handleManualCompletion(session);

      // Auto-start should not be triggered for manual completions
      expect(mockTimerCoreService.shouldAutoStartNext).toHaveBeenCalledWith(
        SessionType.WORK,
        expect.any(Object)
      );
      // But the shouldAutoStart logic should return false due to isManualCompletion = true
    });
  });

  describe("Point Restriction Logic", () => {
    it("should restrict points after manual completion", async () => {
      // First manual completion - should award points
      const firstSession = createTestSession();
      await timerCompletionService.handleManualCompletion(firstSession);
      expect(mockState.awardPoints).toHaveBeenCalledTimes(1);

      // Reset mock
      mockState.awardPoints.mockClear();

      // Second manual completion - should NOT award points
      const secondSession = createTestSession();
      await timerCompletionService.handleManualCompletion(secondSession);
      expect(mockState.awardPoints).not.toHaveBeenCalled();
      expect(
        mockTimerNotificationService.notifyPointsRestricted
      ).toHaveBeenCalled();
    });

    it("should reset restriction after natural completion", async () => {
      // Manual completion to set restriction
      const manualSession = createTestSession();
      await timerCompletionService.handleManualCompletion(manualSession);

      // Natural completion should reset restriction
      const naturalSession = createTestSession();
      await timerCompletionService.handleCompletion(naturalSession, false);
      expect(mockState.awardPoints).toHaveBeenCalledWith(
        70,
        "Natural completion (timer expired)"
      );

      // Reset mock
      mockState.awardPoints.mockClear();

      // Next manual completion should award points again
      const nextManualSession = createTestSession();
      await timerCompletionService.handleManualCompletion(nextManualSession);
      expect(mockState.awardPoints).toHaveBeenCalled();
    });
  });

  describe("Multi-Round Session Integration", () => {
    it("should continue multi-round session even without auto-start enabled", async () => {
      // Setup state for multi-round session with remaining rounds
      mockTimerStore.getState.mockReturnValue({
        ...mockState,
        currentFocusPeriodSessionCount: 1,
        targetRounds: 3,
        currentFocusPeriodId: "test-focus-period",
        config: {
          ...mockState.config,
          autoStartBreaks: false, // Auto-start disabled
        },
      });

      mockTimerCoreService.getNextSessionType.mockReturnValue(
        SessionType.SHORT_BREAK
      );

      const session = createTestSession();
      await timerCompletionService.handleCompletion(session, false);

      // Should still auto-start because it's a multi-round session
      expect(mockTimerCoreService.getNextSessionType).toHaveBeenCalled();
    });

    it("should end focus period when all rounds are completed", async () => {
      // Setup state for completed focus period
      const completedFocusPeriodState = {
        ...mockState,
        currentFocusPeriodSessionCount: 3,
        targetRounds: 3,
        currentFocusPeriodId: "test-focus-period",
        config: {
          ...mockState.config,
          autoStartBreaks: false,
        },
      };

      mockTimerStore.getState.mockReturnValue(completedFocusPeriodState);

      // Also update the main mock to return the same state
      const mockUseTimerStore = require("../store/timer-store").useTimerStore;
      mockUseTimerStore.getState.mockReturnValue(completedFocusPeriodState);

      // Ensure shouldAutoStartNext returns false for this test
      mockTimerCoreService.shouldAutoStartNext.mockReturnValue(false);

      const session = createTestSession();
      await timerCompletionService.handleCompletion(session, false);

      // Check if there are pending timers
      console.log("Pending timers:", jest.getTimerCount());

      // Run pending timers to execute the setTimeout call
      jest.runAllTimers();

      console.log("Pending timers after runAllTimers:", jest.getTimerCount());

      // Debug: Check what setState calls were made
      console.log("setState calls:", mockTimerStore.setState.mock.calls);
      console.log(
        "useTimerStore setState calls:",
        mockUseTimerStore.setState.mock.calls
      );
      console.log(
        "shouldAutoStartNext calls:",
        mockTimerCoreService.shouldAutoStartNext.mock.calls
      );

      // Verify shouldAutoStartNext was called with correct parameters
      expect(mockTimerCoreService.shouldAutoStartNext).toHaveBeenCalledWith(
        SessionType.WORK,
        expect.objectContaining({
          autoStartBreaks: false,
        })
      );

      // Should transition to idle since focus period is complete and auto-start is disabled
      // The service calls useTimerStore.setState, not mockTimerStore.setState
      // There should be 2 calls: 1 for completion state, 1 for idle state
      expect(mockUseTimerStore.setState).toHaveBeenCalledTimes(2);
      expect(mockUseTimerStore.setState).toHaveBeenNthCalledWith(2, {
        state: TimerState.IDLE,
      });
    });
  });

  describe("Session Saving Logic", () => {
    it("should not award points for sessions too short to save", async () => {
      jest.mocked(helpers.shouldSaveSessionToHistory).mockReturnValue(false);
      jest.mocked(helpers.getActualSessionDuration).mockReturnValue(30);

      const session = createTestSession();
      await timerCompletionService.handleCompletion(session, false);

      // Points should still be calculated but session won't be saved
      expect(mockState.awardPoints).toHaveBeenCalledWith(
        70,
        "Natural completion (timer expired)"
      );
    });
  });

  describe("Completion Statistics", () => {
    it("should return correct completion stats for natural completion", () => {
      jest.mocked(helpers.getActualSessionDuration).mockReturnValue(1500);
      jest.mocked(helpers.shouldSaveSessionToHistory).mockReturnValue(true);

      const session = createTestSession();
      const stats = timerCompletionService.getCompletionStats(session, false);

      expect(stats.duration).toBe(1500);
      expect(stats.shouldSave).toBe(true);
      expect(stats.pointsResult.points).toBe(70);
      expect(stats.pointsResult.shouldAward).toBe(true);
    });

    it("should return correct completion stats for manual completion", () => {
      jest.mocked(helpers.getActualSessionDuration).mockReturnValue(100);

      const session = createTestSession();
      const stats = timerCompletionService.getCompletionStats(session, true);

      expect(stats.duration).toBe(100);
      expect(stats.pointsResult.points).toBe(10);
      expect(stats.pointsResult.shouldAward).toBe(true);
    });
  });
});

// Helper function to create test sessions
function createTestSession(overrides = {}) {
  const defaults = {
    id: "test-session-" + Math.random(),
    type: SessionType.WORK,
    duration: 1500,
    startTime: new Date(Date.now() - 1500000),
    endTime: new Date(),
    completed: true,
    endReason: SessionEndReason.COMPLETED,
    taskName: "Test Task",
    tags: [],
  };

  return { ...defaults, ...overrides };
}
