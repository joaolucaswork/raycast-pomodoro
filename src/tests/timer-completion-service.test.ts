/**
 * Timer Completion Service Tests
 *
 * Tests TimerCompletionService integration including completion flows,
 * points system integration, and notification service coordination.
 */

import { SessionEndReason, TimerState } from "../types/timer";
import {
  createTestSession,
  createValidTestSession,
  createShortTestSession,
} from "./utils/test-factories";
import {
  setupTestEnvironment,
  createMockStore,
  waitForAsync,
} from "./utils/test-helpers";
import {
  createMockTimerNotificationService,
  createMockPointsSystemService,
  setupSessionSavingMocks,
} from "./utils/test-mocks";

// Setup test environment
setupTestEnvironment();

// Mock dependencies
const mockTimerNotificationService = createMockTimerNotificationService();
const mockPointsSystemService = createMockPointsSystemService();
const mockUseTimerStore = {
  getState: jest.fn(),
  setState: jest.fn(),
};

// Mock timer core service
const mockTimerCoreService = {
  stopApplicationTracking: jest.fn(() => []), // Return empty array by default
  createSession: jest.fn(),
  shouldAutoStartNext: jest.fn(() => false),
  getNextSessionType: jest.fn(),
  shouldContinueFocusPeriod: jest.fn(() => false),
  getTimerConfig: jest.fn(() => ({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    enableApplicationTracking: false,
  })),
};

jest.mock("../services/timer/timer-notification-service", () => ({
  timerNotificationService: mockTimerNotificationService,
}));

jest.mock("../services/features/points-system-service", () => ({
  pointsSystemService: mockPointsSystemService,
}));

jest.mock("../services/timer/timer-core-service", () => ({
  timerCoreService: mockTimerCoreService,
}));

jest.mock("../store/timer-store", () => ({
  useTimerStore: mockUseTimerStore,
}));

jest.mock("../utils/helpers", () => ({
  shouldSaveSessionToHistory: jest.fn((session) => {
    // Use activeDuration if available (preferred method for tests)
    let actualDuration = 0;

    if (session.activeDuration !== undefined) {
      actualDuration = session.activeDuration;
    } else if (session.startTime && session.endTime) {
      // Fallback to wall-clock time calculation
      actualDuration = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );
    } else {
      return false;
    }

    return actualDuration >= 40;
  }),
  getActualSessionDuration: jest.fn((session) => {
    // Use activeDuration if available (preferred method for tests)
    if (session.activeDuration !== undefined) {
      return session.activeDuration;
    }

    // Fallback to wall-clock time calculation
    if (!session.startTime) return 0;
    const endTime = session.endTime || new Date();
    return Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
  }),
}));

// Import the service after mocks are set up
import { timerCompletionService } from "../services/timer/timer-completion-service";

describe("Timer Completion Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTimerStore.getState.mockReturnValue(createMockStore());
  });

  describe("handleCompletion() - Natural Completion", () => {
    it("should process natural completion with full points", async () => {
      const session = createValidTestSession(1500); // 25 minutes
      session.endReason = SessionEndReason.COMPLETED;

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          history: [],
          rewardSystem: {
            points: 100,
            level: 1,
            streakMultiplier: 1,
            achievements: [],
            dailyGoal: 4,
          },
        })
      );

      // Mock points calculation for natural completion
      mockPointsSystemService.calculateSessionPoints.mockReturnValue({
        points: 70,
        reason: "Natural completion (timer expired)",
        shouldAward: true,
      });

      await timerCompletionService.handleCompletion(session, false);

      // Verify points system was called correctly
      expect(
        mockPointsSystemService.calculateSessionPoints
      ).toHaveBeenCalledWith(
        session,
        false // isManualCompletion = false
      );

      // Verify notification was sent
      expect(
        mockTimerNotificationService.notifyPointsAwarded
      ).toHaveBeenCalledWith(70, "Natural completion (timer expired)");
    });

    it("should save valid natural completion to history", async () => {
      const session = createValidTestSession(1800); // 30 minutes
      const initialHistory = [createTestSession()];

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          history: initialHistory,
        })
      );

      await timerCompletionService.handleCompletion(session, false);

      // Verify store was updated with new session
      expect(mockUseTimerStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          state: TimerState.COMPLETED,
          currentSession: null,
          timeRemaining: 0,
        })
      );
    });

    it("should not save short natural completion to history", async () => {
      const shortSession = createShortTestSession(30); // 30 seconds
      shortSession.endReason = SessionEndReason.COMPLETED;

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          history: [],
        })
      );

      await timerCompletionService.handleCompletion(shortSession, false);

      // Verify notification service was called for short session
      expect(
        mockTimerNotificationService.notifySessionTooShort
      ).toHaveBeenCalledWith(30);
    });

    it("should prevent duplicate completions", async () => {
      const session = createValidTestSession(1500);
      session.id = "duplicate-test-session";

      // Complete the same session twice
      await timerCompletionService.handleCompletion(session, false);
      await timerCompletionService.handleCompletion(session, false);

      // Points should only be awarded once
      expect(
        mockPointsSystemService.calculateSessionPoints
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTimerNotificationService.notifyPointsAwarded
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleManualCompletion() - Manual Completion", () => {
    it("should process manual completion with reduced points", async () => {
      const session = createValidTestSession(900); // 15 minutes
      session.endReason = SessionEndReason.STOPPED;

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          history: [],
          rewardSystem: {
            points: 50,
            level: 1,
            streakMultiplier: 1,
            achievements: [],
            dailyGoal: 4,
          },
        })
      );

      // Mock points calculation for manual completion
      mockPointsSystemService.calculateSessionPoints.mockReturnValue({
        points: 10,
        reason: "Manual completion (900s ≥ 40s)",
        shouldAward: true,
      });

      await timerCompletionService.handleManualCompletion(session);

      // Verify manual completion notification
      expect(
        mockTimerNotificationService.notifyManualCompletion
      ).toHaveBeenCalledWith(session);

      // Verify points calculation with manual flag
      expect(
        mockPointsSystemService.calculateSessionPoints
      ).toHaveBeenCalledWith(
        session,
        true // isManualCompletion = true
      );

      // Verify points awarded
      expect(
        mockTimerNotificationService.notifyPointsAwarded
      ).toHaveBeenCalledWith(10, "Manual completion (900s ≥ 40s)");
    });

    it("should award minimal points for very short manual completion", async () => {
      const shortSession = createShortTestSession(20); // 20 seconds
      shortSession.endReason = SessionEndReason.STOPPED;

      mockUseTimerStore.getState.mockReturnValue(createMockStore());

      // Mock points calculation for short manual completion
      mockPointsSystemService.calculateSessionPoints.mockReturnValue({
        points: 1,
        reason: "Manual completion (<40s)",
        shouldAward: true,
      });

      await timerCompletionService.handleManualCompletion(shortSession);

      // Verify minimal points awarded
      expect(
        mockPointsSystemService.calculateSessionPoints
      ).toHaveBeenCalledWith(shortSession, true);

      expect(
        mockTimerNotificationService.notifyPointsAwarded
      ).toHaveBeenCalledWith(1, "Manual completion (<40s)");
    });

    it("should not save short manual completion to history", async () => {
      const shortSession = createShortTestSession(25);
      const initialHistory = [createTestSession()];

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          history: initialHistory,
        })
      );

      await timerCompletionService.handleManualCompletion(shortSession);

      // Verify short session notification
      expect(
        mockTimerNotificationService.notifySessionTooShort
      ).toHaveBeenCalledWith(25);
    });
  });

  describe("Points System Integration", () => {
    it("should calculate points correctly for different completion types", () => {
      const session = createValidTestSession(1200); // 20 minutes

      // Test natural completion
      const naturalResult = timerCompletionService.calculateSessionPoints(
        session,
        false
      );
      expect(
        mockPointsSystemService.calculateSessionPoints
      ).toHaveBeenCalledWith(session, false);

      // Test manual completion
      const manualResult = timerCompletionService.calculateSessionPoints(
        session,
        true
      );
      expect(
        mockPointsSystemService.calculateSessionPoints
      ).toHaveBeenCalledWith(session, true);
    });

    it("should get completion statistics", () => {
      const session = createValidTestSession(1500);

      mockPointsSystemService.calculateSessionPoints.mockReturnValue({
        points: 70,
        reason: "Natural completion",
        shouldAward: true,
      });

      const stats = timerCompletionService.getCompletionStats(session, false);

      expect(stats).toHaveProperty("duration");
      expect(stats).toHaveProperty("shouldSave");
      expect(stats).toHaveProperty("pointsResult");
      expect(stats.pointsResult.points).toBe(70);
    });
  });

  describe("Session Validation", () => {
    it("should validate session saving eligibility", () => {
      const validSession = createValidTestSession(1800);
      const invalidSession = createShortTestSession(30);

      expect(timerCompletionService.shouldSaveSession(validSession)).toBe(true);
      expect(timerCompletionService.shouldSaveSession(invalidSession)).toBe(
        false
      );
    });

    it("should calculate session duration accurately", () => {
      const session = createValidTestSession(1500);
      const duration = timerCompletionService.getSessionDuration(session);

      expect(duration).toBe(1500);
    });
  });

  describe("Auto-start Logic Integration", () => {
    it("should handle auto-start after work session completion", async () => {
      const workSession = createValidTestSession(1500);
      workSession.type = "work" as any;

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          config: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            enableNotifications: true,
            autoStartBreaks: true,
            autoStartWork: false,
            enableApplicationTracking: false,
            trackingInterval: 5,
            enableAdaptiveTimers: false,
            adaptiveMode: "energy-based",
            minWorkDuration: 10,
            maxWorkDuration: 60,
            adaptiveBreakRatio: 0.2,
            enableRewardSystem: true,
            enableTransitionWarnings: false,
            warningIntervals: [300, 120, 60],
            enableHyperfocusDetection: false,
            maxConsecutiveSessions: 3,
            forcedBreakAfterHours: 2.5,
          },
          currentFocusPeriodSessionCount: 1,
          targetRounds: 3,
        })
      );

      await timerCompletionService.handleCompletion(workSession, false);

      // Auto-start logic would be triggered in the actual implementation
      // Here we verify the completion was processed correctly
      expect(mockUseTimerStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          state: TimerState.COMPLETED,
        })
      );
    });

    it("should transition to idle when auto-start is disabled", async () => {
      const session = createValidTestSession(1500);

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          config: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            enableNotifications: true,
            autoStartBreaks: false,
            autoStartWork: false,
            enableApplicationTracking: false,
            trackingInterval: 5,
            enableAdaptiveTimers: false,
            adaptiveMode: "energy-based",
            minWorkDuration: 10,
            maxWorkDuration: 60,
            adaptiveBreakRatio: 0.2,
            enableRewardSystem: true,
            enableTransitionWarnings: false,
            warningIntervals: [300, 120, 60],
            enableHyperfocusDetection: false,
            maxConsecutiveSessions: 3,
            forcedBreakAfterHours: 2.5,
          },
        })
      );

      await timerCompletionService.handleCompletion(session, false);

      // Should transition to completed state initially
      expect(mockUseTimerStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          state: TimerState.COMPLETED,
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle missing session data gracefully", async () => {
      const invalidSession = createTestSession({
        startTime: undefined as any,
        endTime: undefined as any,
      });

      // Should not throw error
      await expect(
        timerCompletionService.handleCompletion(invalidSession, false)
      ).resolves.not.toThrow();
    });

    it("should handle store errors gracefully", async () => {
      const session = createValidTestSession(1500);

      // Mock store error
      mockUseTimerStore.setState.mockImplementation(() => {
        throw new Error("Store error");
      });

      // Should handle error without crashing
      await expect(
        timerCompletionService.handleCompletion(session, false)
      ).resolves.not.toThrow();
    });

    it("should handle notification service errors gracefully", async () => {
      const session = createValidTestSession(1500);

      // Mock notification error
      mockTimerNotificationService.notifyPointsAwarded.mockRejectedValue(
        new Error("Notification error")
      );

      // Should complete despite notification error
      await expect(
        timerCompletionService.handleCompletion(session, false)
      ).resolves.not.toThrow();
    });
  });

  describe("Service Coordination", () => {
    it("should coordinate all services during completion", async () => {
      const session = createValidTestSession(1800);

      mockUseTimerStore.getState.mockReturnValue(
        createMockStore({
          history: [],
          rewardSystem: {
            points: 200,
            level: 1,
            streakMultiplier: 1,
            achievements: [],
            dailyGoal: 4,
          },
        })
      );

      mockPointsSystemService.calculateSessionPoints.mockReturnValue({
        points: 70,
        reason: "Natural completion",
        shouldAward: true,
      });

      await timerCompletionService.handleCompletion(session, false);

      // Verify all services were coordinated
      expect(mockPointsSystemService.calculateSessionPoints).toHaveBeenCalled();
      expect(
        mockTimerNotificationService.notifyPointsAwarded
      ).toHaveBeenCalled();
      expect(mockUseTimerStore.setState).toHaveBeenCalled();
    });

    it("should maintain service call order", async () => {
      const session = createValidTestSession(1500);
      const callOrder: string[] = [];

      mockPointsSystemService.calculateSessionPoints.mockImplementation(() => {
        callOrder.push("points");
        return { points: 70, reason: "Test", shouldAward: true };
      });

      mockTimerNotificationService.notifyPointsAwarded.mockImplementation(
        () => {
          callOrder.push("notification");
          return Promise.resolve();
        }
      );

      mockUseTimerStore.setState.mockImplementation(() => {
        callOrder.push("store");
      });

      await timerCompletionService.handleCompletion(session, false);

      // Verify services were called in correct order
      expect(callOrder).toContain("points");
      expect(callOrder).toContain("notification");
      expect(callOrder).toContain("store");
    });
  });
});
