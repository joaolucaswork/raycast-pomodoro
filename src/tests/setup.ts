/**
 * Jest Test Setup
 *
 * This file configures the testing environment for the Raycast Pomodoro Extension.
 * It sets up global mocks and test utilities needed across all test files.
 */

// Mock date-fns to ensure consistent test results
jest.mock("date-fns", () => ({
  format: jest.fn((date, formatStr) => date.toISOString()),
  isToday: jest.fn(() => true),
  isThisWeek: jest.fn(() => true),
  isThisMonth: jest.fn(() => true),
  startOfDay: jest.fn((date) => date),
  endOfDay: jest.fn((date) => date),
  subDays: jest.fn(
    (date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)
  ),
  addMinutes: jest.fn(
    (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000)
  ),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up fake timers for timer-related tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});
