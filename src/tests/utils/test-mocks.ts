/**
 * Mock Configurations for Session Saving Tests
 *
 * This file provides consistent mock configurations for external dependencies
 * used across the session saving test suite.
 */

import { TimerSession, SessionEndReason } from "../../types/timer";

/**
 * Mock implementation for shouldSaveSessionToHistory helper
 */
export const createMockShouldSaveSessionToHistory = (
  defaultReturn: boolean = true
) => {
  return jest.fn((session: TimerSession) => {
    // Match the actual implementation logic - use same duration calculation as getActualSessionDuration
    let actualDuration = 0;

    // Use activeDuration if available (preferred method)
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
  });
};

/**
 * Mock implementation for getActualSessionDuration helper
 */
export const createMockGetActualSessionDuration = () => {
  return jest.fn((session: TimerSession) => {
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

    // If we have pause time, subtract it from wall-clock time
    const pausedTime = session.pausedTime || 0;
    const duration = wallClockDuration - pausedTime;

    return Math.max(0, duration); // Ensure non-negative
  });
};

/**
 * Mock implementation for timer notification service
 */
export const createMockTimerNotificationService = () => ({
  notifySessionTooShort: jest.fn(),
  notifyManualCompletion: jest.fn(),
  notifyPointsAwarded: jest.fn(),
  notifyAutoStart: jest.fn(),
  notifySessionCompletion: jest.fn(),
  notifyPointsRestricted: jest.fn(),
  notifySessionStart: jest.fn(),
  notifyHyperfocusDetected: jest.fn(),
});

/**
 * Mock implementation for points system service
 */
export const createMockPointsSystemService = () => ({
  calculateSessionPoints: jest.fn(
    (session: TimerSession, isManualCompletion: boolean) => {
      const duration = session.activeDuration || session.duration;

      if (isManualCompletion) {
        if (duration < 40) {
          return {
            points: 1,
            reason: "Manual completion (<40s)",
            shouldAward: true,
          };
        } else {
          return {
            points: 10,
            reason: `Manual completion (${duration}s ≥ 40s)`,
            shouldAward: true,
          };
        }
      } else {
        return {
          points: 70,
          reason: "Natural completion (timer expired)",
          shouldAward: true,
        };
      }
    }
  ),
  awardPoints: jest.fn(),
  getPointsHistory: jest.fn(() => []),
  getTotalPoints: jest.fn(() => 0),
});

/**
 * Mock implementation for timer core service
 */
export const createMockTimerCoreService = () => ({
  createSession: jest.fn(),
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
});

/**
 * Mock implementation for application tracking service
 */
export const createMockApplicationTrackingService = () => ({
  startTracking: jest.fn(),
  stopTracking: jest.fn(),
  getUsageData: jest.fn(() => []),
  isTracking: jest.fn(() => false),
});

/**
 * Mock implementation for background timer service
 */
export const createMockBackgroundTimerService = () => ({
  startTimer: jest.fn(),
  stopTimer: jest.fn(),
  pauseTimer: jest.fn(),
  resumeTimer: jest.fn(),
  completeTimer: jest.fn(),
  isRunning: jest.fn(() => false),
});

/**
 * Common mock setup for session saving tests
 */
export const setupSessionSavingMocks = () => {
  // Mock Raycast API
  const mockShowToast = jest.fn();
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  // Mock helper functions
  const mockShouldSaveSessionToHistory = createMockShouldSaveSessionToHistory();
  const mockGetActualSessionDuration = createMockGetActualSessionDuration();

  // Mock services
  const mockTimerNotificationService = createMockTimerNotificationService();
  const mockPointsSystemService = createMockPointsSystemService();
  const mockTimerCoreService = createMockTimerCoreService();
  const mockApplicationTrackingService = createMockApplicationTrackingService();
  const mockBackgroundTimerService = createMockBackgroundTimerService();

  // Mock store
  const mockUseTimerStore = {
    getState: jest.fn(),
    setState: jest.fn(),
    subscribe: jest.fn(),
  };

  return {
    // Raycast API mocks
    mockShowToast,
    mockLocalStorage,

    // Helper function mocks
    mockShouldSaveSessionToHistory,
    mockGetActualSessionDuration,

    // Service mocks
    mockTimerNotificationService,
    mockPointsSystemService,
    mockTimerCoreService,
    mockApplicationTrackingService,
    mockBackgroundTimerService,

    // Store mocks
    mockUseTimerStore,
  };
};

/**
 * Reset all mocks to their initial state
 */
export const resetSessionSavingMocks = (
  mocks: ReturnType<typeof setupSessionSavingMocks>
) => {
  Object.values(mocks).forEach((mock) => {
    if (typeof mock === "function" && mock.mockReset) {
      mock.mockReset();
    } else if (typeof mock === "object" && mock !== null) {
      Object.values(mock).forEach((nestedMock) => {
        if (typeof nestedMock === "function" && nestedMock.mockReset) {
          nestedMock.mockReset();
        }
      });
    }
  });
};

/**
 * Create a test session that will be saved to history (meets 40-second rule)
 */
export const createValidTestSessionForMocks = (): TimerSession => {
  const now = new Date();
  const duration = 1500; // 25 minutes

  return {
    id: `valid-session-${Date.now()}`,
    type: "work" as any,
    duration,
    startTime: now,
    endTime: new Date(now.getTime() + duration * 1000),
    completed: true,
    endReason: SessionEndReason.COMPLETED,
    taskName: "Test Task",
    tags: [],
    activeDuration: duration,
  } as TimerSession;
};

/**
 * Create a test session that will NOT be saved to history (under 40 seconds)
 */
export const createInvalidTestSessionForMocks = (): TimerSession => {
  const now = new Date();
  const duration = 30; // 30 seconds - under the 40-second minimum

  return {
    id: `invalid-session-${Date.now()}`,
    type: "work" as any,
    duration,
    startTime: now,
    endTime: new Date(now.getTime() + duration * 1000),
    completed: true,
    endReason: SessionEndReason.STOPPED,
    taskName: "Short Test Task",
    tags: [],
    activeDuration: duration,
  } as TimerSession;
};

/**
 * Mock jest modules for session saving tests
 */
export const mockJestModules = () => {
  // Mock the timer store
  jest.mock("../../store/timer-store", () => ({
    useTimerStore: {
      getState: jest.fn(),
      setState: jest.fn(),
      subscribe: jest.fn(),
    },
  }));

  // Mock helper functions
  jest.mock("../../utils/helpers", () => ({
    shouldSaveSessionToHistory: createMockShouldSaveSessionToHistory(),
    getActualSessionDuration: createMockGetActualSessionDuration(),
    generateId: jest.fn(() => `test-id-${Date.now()}`),
    getSessionTypeLabel: jest.fn((type) => type),
  }));

  // Mock Raycast API
  jest.mock("@raycast/api", () => ({
    showToast: jest.fn(),
    Toast: {
      Style: {
        Success: "success",
        Failure: "failure",
        Animated: "animated",
      },
    },
    LocalStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    Icon: {
      Play: "play",
      Pause: "pause",
      Stop: "stop",
      Clock: "clock",
      CheckCircle: "check-circle",
      Hammer: "hammer",
      Book: "book",
      Heart: "heart",
    },
  }));

  // Mock services
  jest.mock("../../services/timer/timer-notification-service", () => ({
    timerNotificationService: createMockTimerNotificationService(),
  }));

  jest.mock("../../services/points/points-system-service", () => ({
    pointsSystemService: createMockPointsSystemService(),
  }));
};
