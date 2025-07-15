/**
 * Test Helper Functions for Session Saving Tests
 *
 * This file provides utility functions to assist with testing
 * session saving functionality across the test suite.
 */

import { TimerSession, PomodoroStore, TimerState } from "../../types/timer";
import { showToast, Toast } from "@raycast/api";

/**
 * Advance Jest fake timers by specified milliseconds
 */
export const advanceTimerBy = (milliseconds: number): void => {
  jest.advanceTimersByTime(milliseconds);
};

/**
 * Advance Jest fake timers by specified seconds
 */
export const advanceTimerBySeconds = (seconds: number): void => {
  advanceTimerBy(seconds * 1000);
};

/**
 * Assert that a session was saved to history
 */
export const expectSessionInHistory = (
  history: TimerSession[],
  sessionId: string,
  message?: string
): void => {
  const session = history.find((s) => s.id === sessionId);
  expect(session).toBeDefined();
  if (message) {
    expect(session).toBeDefined();
  }
};

/**
 * Assert that a session was NOT saved to history
 */
export const expectSessionNotInHistory = (
  history: TimerSession[],
  sessionId: string,
  message?: string
): void => {
  const session = history.find((s) => s.id === sessionId);
  expect(session).toBeUndefined();
  if (message) {
    expect(session).toBeUndefined();
  }
};

/**
 * Assert that a toast notification was shown with specific properties
 */
export const expectToastNotification = (
  style: string,
  title: string,
  message?: string
): void => {
  expect(showToast).toHaveBeenCalledWith(
    expect.objectContaining({
      style,
      title,
      ...(message && { message }),
    })
  );
};

/**
 * Assert that a failure toast was shown for short session
 */
export const expectShortSessionToast = (actualDuration: number): void => {
  expectToastNotification(
    Toast.Style.Failure,
    "Session Too Short",
    expect.stringContaining(`${actualDuration}s`)
  );
};

/**
 * Assert that no toast notifications were shown
 */
export const expectNoToastNotifications = (): void => {
  expect(showToast).not.toHaveBeenCalled();
};

/**
 * Create a mock Zustand store with controlled state
 */
export const createMockStore = (
  initialState: Partial<PomodoroStore> = {}
): Partial<PomodoroStore> => {
  const defaultState: Partial<PomodoroStore> = {
    history: [],
    sessionCount: 0,
    currentFocusPeriodSessionCount: 0,
    rewardSystem: {
      points: 0,
      level: 1,
      streakMultiplier: 1,
      achievements: [],
      dailyGoal: 4,
    },
    state: TimerState.IDLE,
    currentSession: null,
    timeRemaining: 0,
    pauseStartTime: null,
    totalPausedTime: 0,
    isPostSessionMoodPromptVisible: false,
    lastCompletedSession: null,
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
    stats: {
      totalSessions: 0,
      completedSessions: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      streakCount: 0,
      todaysSessions: 0,
      weekSessions: 0,
      monthSessions: 0,
      totalPauseTime: 0,
      sessionsWithPauses: 0,
      averagePauseTime: 0,
    },
    // Mock functions
    startTimer: jest.fn(),
    pauseTimer: jest.fn(),
    resumeTimer: jest.fn(),
    stopTimer: jest.fn(),
    completeSession: jest.fn(),
    resetTimer: jest.fn(),
    addTaskToSession: jest.fn(),
    awardPoints: jest.fn(),
    checkHyperfocus: jest.fn(),
    ...initialState,
  };

  return defaultState;
};

/**
 * Create a mock store getter function for useTimerStore.getState()
 */
export const createMockStoreGetter = (state: Partial<PomodoroStore>) => {
  return jest.fn(() => state);
};

/**
 * Create a mock store setter function for useTimerStore.setState()
 */
export const createMockStoreSetter = () => {
  return jest.fn();
};

/**
 * Wait for async operations to complete in tests
 */
export const waitForAsync = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Create a date that is X seconds ago from now
 */
export const createDateSecondsAgo = (seconds: number): Date => {
  return new Date(Date.now() - seconds * 1000);
};

/**
 * Create a date that is X seconds from now
 */
export const createDateSecondsFromNow = (seconds: number): Date => {
  return new Date(Date.now() + seconds * 1000);
};

/**
 * Calculate the actual duration between two dates in seconds
 */
export const calculateDurationSeconds = (
  startTime: Date,
  endTime: Date
): number => {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
};

/**
 * Assert that two dates are approximately equal (within tolerance)
 */
export const expectDatesApproximatelyEqual = (
  actual: Date,
  expected: Date,
  toleranceMs: number = 1000
): void => {
  const diff = Math.abs(actual.getTime() - expected.getTime());
  expect(diff).toBeLessThanOrEqual(toleranceMs);
};

/**
 * Assert that a session has all required properties
 */
export const expectValidSessionStructure = (session: TimerSession): void => {
  expect(session).toHaveProperty("id");
  expect(session).toHaveProperty("type");
  expect(session).toHaveProperty("duration");
  expect(session).toHaveProperty("startTime");
  expect(session).toHaveProperty("completed");
  expect(typeof session.id).toBe("string");
  expect(typeof session.duration).toBe("number");
  expect(session.startTime).toBeInstanceOf(Date);
  expect(typeof session.completed).toBe("boolean");
};

/**
 * Assert that session properties match expected values
 */
export const expectSessionProperties = (
  session: TimerSession,
  expectedProperties: Partial<TimerSession>
): void => {
  Object.keys(expectedProperties).forEach((key) => {
    const typedKey = key as keyof TimerSession;
    expect(session[typedKey]).toEqual(expectedProperties[typedKey]);
  });
};

/**
 * Mock console methods to capture log output in tests
 */
export const mockConsole = () => {
  const originalConsole = global.console;
  const mockConsole = {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    global.console = { ...originalConsole, ...mockConsole };
  });

  afterEach(() => {
    global.console = originalConsole;
    Object.values(mockConsole).forEach((mock) => mock.mockClear());
  });

  return mockConsole;
};

/**
 * Reset all mocks to clean state
 */
export const resetAllMocks = (): void => {
  jest.clearAllMocks();
  jest.clearAllTimers();
};

/**
 * Setup common test environment
 */
export const setupTestEnvironment = () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    resetAllMocks();
  });
};
