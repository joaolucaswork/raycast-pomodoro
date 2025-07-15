/**
 * Test Data Factories for Session Saving and Achievement Tests
 *
 * This file provides factory functions to create consistent test data
 * for session saving functionality and achievement system tests across the test suite.
 */

import {
  TimerSession,
  SessionType,
  SessionEndReason,
  TimerConfig,
  ApplicationUsage,
  Achievement,
  BoxingProgress,
  AchievementRequirement,
  RewardSystem,
  MoodEntry,
  MoodType,
} from "../../types/timer";

// Mock Icon since it's not available in test environment
const Icon = {
  Hammer: "hammer" as any,
  Code: "code" as any,
  Desktop: "desktop" as any,
  Book: "book" as any,
  Heart: "heart" as any,
  Person: "person" as any,
  TwoPeople: "two-people" as any,
  Building: "building" as any,
  Calendar: "calendar" as any,
  Clock: "clock" as any,
  Envelope: "envelope" as any,
  Phone: "phone" as any,
  Gear: "gear" as any,
  Monitor: "monitor" as any,
  Globe: "globe" as any,
  Link: "link" as any,
  Trophy: "trophy" as any,
  BarChart: "bar-chart" as any,
  Circle: "circle" as any,
  Play: "play" as any,
  Pause: "pause" as any,
  Stop: "stop" as any,
  XMarkCircle: "x-mark-circle" as any,
  CheckCircle: "check-circle" as any,
  ExclamationMark: "exclamation-mark" as any,
  Rocket: "rocket" as any,
  BullsEye: "bulls-eye" as any,
  Battery: "battery" as any,
  Bolt: "bolt" as any,
  Message: "message" as any,
  Brush: "brush" as any,
  Music: "music" as any,
  Terminal: "terminal" as any,
  Document: "document" as any,
};

/**
 * Default test configuration for timer settings
 */
export const createTestConfig = (
  overrides: Partial<TimerConfig> = {}
): TimerConfig => ({
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
  ...overrides,
});

/**
 * Create a test TimerSession with configurable properties
 */
export const createTestSession = (
  overrides: Partial<TimerSession> = {}
): TimerSession => {
  const now = new Date();
  const startTime = overrides.startTime || now;
  const duration = overrides.duration || 1500; // 25 minutes default
  const endTime =
    overrides.endTime || new Date(startTime.getTime() + duration * 1000);

  return {
    id: `test-session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    type: SessionType.WORK,
    duration,
    startTime,
    endTime,
    completed: true,
    endReason: SessionEndReason.COMPLETED,
    taskName: "Test Task",
    projectName: "Test Project",
    tags: ["test", "work"],
    taskIcon: Icon.Hammer,
    notes: "Test session notes",
    applicationUsage: [],
    pausedTime: 0,
    activeDuration: duration,
    energyLevel: 3,
    focusQuality: 4,
    moodState: "motivated",
    ...overrides,
  };
};

/**
 * Create a short test session (under 40 seconds)
 */
export const createShortTestSession = (
  durationSeconds: number = 30
): TimerSession => {
  const now = new Date();
  const endTime = new Date(now.getTime() + durationSeconds * 1000);

  return createTestSession({
    duration: durationSeconds,
    startTime: now,
    endTime,
    activeDuration: durationSeconds, // This will be used by getActualSessionDuration
    endReason: SessionEndReason.STOPPED,
  });
};

/**
 * Create a test session that meets the minimum duration requirement
 */
export const createValidTestSession = (
  durationSeconds: number = 1500
): TimerSession => {
  const now = new Date();
  const endTime = new Date(now.getTime() + durationSeconds * 1000);

  return createTestSession({
    duration: durationSeconds,
    startTime: now,
    endTime,
    activeDuration: durationSeconds,
  });
};

/**
 * Create a test session for duration validation tests (no activeDuration set)
 * This forces getActualSessionDuration to use wall-clock calculation
 */
export const createDurationTestSession = (
  durationSeconds: number,
  overrides: Partial<TimerSession> = {}
): TimerSession => {
  const now = new Date();
  const startTime = overrides.startTime || now;
  const endTime =
    overrides.endTime || new Date(startTime.getTime() + durationSeconds * 1000);

  return createTestSession({
    duration: durationSeconds,
    startTime,
    endTime,
    activeDuration: undefined, // Force wall-clock calculation
    ...overrides,
  });
};

/**
 * Create a short test session for duration validation (no activeDuration set)
 */
export const createShortDurationTestSession = (
  durationSeconds: number = 30
): TimerSession => {
  return createDurationTestSession(durationSeconds, {
    endReason: SessionEndReason.STOPPED,
  });
};

/**
 * Create test application usage data
 */
export const createTestApplicationUsage = (
  overrides: Partial<ApplicationUsage> = {}
): ApplicationUsage => ({
  bundleId: "com.test.app",
  name: "Test Application",
  timeSpent: 300, // 5 minutes
  percentage: 20,
  raycastIcon: Icon.Desktop,
  category: "development",
  isRecognized: true,
  firstUsed: new Date(),
  lastUsed: new Date(),
  ...overrides,
});

/**
 * Create an array of test sessions for history testing
 */
export const createTestHistory = (count: number = 5): TimerSession[] => {
  const sessions: TimerSession[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const sessionStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000); // Each session 1 hour apart
    const sessionEnd = new Date(sessionStart.getTime() + 1500 * 1000); // 25 minutes duration

    sessions.push(
      createTestSession({
        id: `history-session-${i}`,
        startTime: sessionStart,
        endTime: sessionEnd,
        taskName: `Task ${i + 1}`,
        type: i % 3 === 0 ? SessionType.SHORT_BREAK : SessionType.WORK,
      })
    );
  }

  return sessions.reverse(); // Most recent first
};

/**
 * Create test mood data
 */
export const createTestMoodData = () => ({
  energyLevel: 3 as const,
  focusQuality: 4 as const,
  moodState: "motivated" as const,
});

/**
 * Create test session with comprehensive data
 */
export const createComprehensiveTestSession = (): TimerSession => {
  const now = new Date();
  const duration = 1800; // 30 minutes
  const endTime = new Date(now.getTime() + duration * 1000);

  return createTestSession({
    duration,
    startTime: now,
    endTime,
    taskName: "Comprehensive Test Task",
    projectName: "Test Project Alpha",
    tags: ["urgent", "development", "testing"],
    taskIcon: Icon.Code,
    notes:
      "This is a comprehensive test session with all possible data fields populated for thorough testing.",
    applicationUsage: [
      createTestApplicationUsage({
        bundleId: "com.microsoft.VSCode",
        name: "Visual Studio Code",
        timeSpent: 1200,
        percentage: 66.7,
        category: "development",
      }),
      createTestApplicationUsage({
        bundleId: "com.google.Chrome",
        name: "Google Chrome",
        timeSpent: 600,
        percentage: 33.3,
        category: "browser",
      }),
    ],
    pausedTime: 120, // 2 minutes paused
    activeDuration: duration - 120, // Actual work time
    ...createTestMoodData(),
  });
};

/**
 * Create test sessions with various edge cases
 */
export const createEdgeCaseTestSessions = () => ({
  // Session with missing optional fields
  minimal: createTestSession({
    taskName: undefined,
    projectName: undefined,
    tags: [],
    notes: undefined,
    applicationUsage: undefined,
  }),

  // Session with very long duration
  longSession: createTestSession({
    duration: 7200, // 2 hours
    activeDuration: 7200,
  }),

  // Session with lots of pause time
  pausedSession: createTestSession({
    duration: 1500,
    pausedTime: 300, // 5 minutes paused
    activeDuration: 1200, // 20 minutes active
  }),

  // Session with special characters in task name
  specialCharsSession: createTestSession({
    taskName: "Task with émojis 🚀 and spëcial chars & symbols!",
    notes: "Notes with\nmultiple\nlines and special chars: @#$%^&*()",
  }),

  // Session exactly at 40-second boundary
  boundarySession: createTestSession({
    duration: 40,
    activeDuration: 40,
    startTime: new Date(),
    endTime: new Date(Date.now() + 40000),
  }),
});

// ============================================================================
// ACHIEVEMENT SYSTEM TEST FACTORIES
// ============================================================================

/**
 * Create a test Achievement with configurable properties
 */
export const createTestAchievement = (
  overrides: Partial<Achievement> = {}
): Achievement => ({
  id: `test-achievement-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  name: "Test Achievement",
  description: "A test achievement for unit testing",
  icon: Icon.Hammer,
  rarity: "common",
  points: 25,
  category: "training_milestones",
  requirements: [{ type: "sessions_completed", value: 1 }],
  isBoxingThemed: true,
  unlockedAt: undefined,
  ...overrides,
});

/**
 * Create a test BoxingProgress with configurable properties
 */
export const createTestBoxingProgress = (
  overrides: Partial<BoxingProgress> = {}
): BoxingProgress => ({
  totalRounds: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTrainingTime: 0,
  championshipLevel: 1,
  dailyRoundsToday: 0,
  weeklyRoundsThisWeek: 0,
  monthlyRoundsThisMonth: 0,
  bestRoundDuration: 0,
  averageRoundDuration: 0,
  moodTrackingStreak: 0,
  earlyBirdRounds: 0,
  nightOwlRounds: 0,
  weekendWarriorRounds: 0,
  totalMoodEntries: 0,
  moodEntriesWithNotes: 0,
  uniqueIntensityLevelsUsed: 0,
  uniqueMoodTypesLogged: 0,
  preSessionMoodEntries: 0,
  duringSessionMoodEntries: 0,
  postSessionMoodEntries: 0,
  standaloneMoodEntries: 0,
  energizedSessions: 0,
  focusedSessions: 0,
  calmSessions: 0,
  motivatedSessions: 0,
  neutralSessions: 0,
  tiredSessions: 0,
  stressedSessions: 0,
  overwhelmedSessions: 0,
  distractedSessions: 0,
  moodImprovementPatterns: 0,
  ...overrides,
});

/**
 * Create a test AchievementRequirement with configurable properties
 */
export const createTestAchievementRequirement = (
  overrides: Partial<AchievementRequirement> = {}
): AchievementRequirement => ({
  type: "sessions_completed",
  value: 1,
  ...overrides,
});

/**
 * Create a test RewardSystem with configurable properties
 */
export const createTestRewardSystem = (
  overrides: Partial<RewardSystem> = {}
): RewardSystem => ({
  points: 0,
  level: 1,
  streakMultiplier: 1,
  achievements: [],
  dailyGoal: 4,
  ...overrides,
});

/**
 * Pre-configured achievement test scenarios (using actual achievement IDs from the service)
 */
export const achievementTestScenarios = {
  // Basic achievement that should unlock after 1 session
  firstBellAchievement: createTestAchievement({
    id: "first-bell",
    name: "First Bell",
    description: "Complete your first round against procrastination",
    points: 25,
    category: "training_milestones",
    requirements: [{ type: "sessions_completed", value: 1 }],
  }),

  // Streak-based achievement
  streakAchievement: createTestAchievement({
    id: "double-jab",
    name: "Double Jab",
    description: "Land 2 consecutive rounds",
    points: 30,
    rarity: "common",
    category: "knockout_streaks",
    requirements: [{ type: "streak_length", value: 2 }],
  }),

  // Time-based achievement (using actual ID and requirements)
  timeBasedAchievement: createTestAchievement({
    id: "rookie-belt",
    name: "Rookie Belt",
    description: "Complete 10 hours of training",
    points: 100,
    rarity: "rare",
    category: "championship_belts",
    requirements: [{ type: "total_time", value: 600 }], // 10 hours in minutes
  }),

  // Daily achievement (using actual ID)
  dailyAchievement: createTestAchievement({
    id: "morning-warrior",
    name: "Morning Warrior",
    description: "Complete 3 sessions before noon",
    points: 75,
    rarity: "rare",
    category: "daily_training",
    requirements: [
      { type: "daily_goal", value: 3, timeframe: "daily" },
      { type: "time_of_day", value: 12, metadata: { before: true } },
    ],
  }),

  // Complex multi-requirement achievement (using actual ID with multiple requirements)
  complexAchievement: createTestAchievement({
    id: "morning-warrior", // This has multiple requirements
    name: "Morning Warrior",
    description: "Complete 3 rounds before noon - morning champion",
    points: 75,
    rarity: "rare",
    category: "daily_training",
    requirements: [
      { type: "daily_goal", value: 3, timeframe: "daily" },
      { type: "time_of_day", value: 12, metadata: { before: true } },
    ],
  }),
};

/**
 * Pre-configured boxing progress test scenarios
 */
export const boxingProgressTestScenarios = {
  // New user with no progress
  newUser: createTestBoxingProgress(),

  // User with some basic progress
  beginnerProgress: createTestBoxingProgress({
    totalRounds: 5,
    currentStreak: 2,
    longestStreak: 3,
    totalTrainingTime: 7500, // 2.08 hours
    dailyRoundsToday: 2,
    weeklyRoundsThisWeek: 5,
    monthlyRoundsThisMonth: 5,
  }),

  // Advanced user with significant progress
  advancedProgress: createTestBoxingProgress({
    totalRounds: 150,
    currentStreak: 12,
    longestStreak: 25,
    totalTrainingTime: 225000, // 62.5 hours
    championshipLevel: 5,
    dailyRoundsToday: 6,
    weeklyRoundsThisWeek: 30,
    monthlyRoundsThisMonth: 120,
    bestRoundDuration: 1800, // 30 minutes
    averageRoundDuration: 1500, // 25 minutes
    moodTrackingStreak: 10,
    totalMoodEntries: 75,
    energizedSessions: 40,
    focusedSessions: 60,
    calmSessions: 30,
    motivatedSessions: 20,
  }),

  // User at achievement thresholds
  thresholdProgress: createTestBoxingProgress({
    totalRounds: 99, // Just below 100-session achievement
    currentStreak: 9, // Just below 10-streak achievement
    totalTrainingTime: 71999, // Just below 20-hour achievement
    dailyRoundsToday: 3, // Just below daily goal
  }),
};

/**
 * Create a test MoodEntry with configurable properties
 */
export const createTestMoodEntry = (
  overrides: Partial<MoodEntry> = {}
): MoodEntry => ({
  id: `mood-${Date.now()}`,
  sessionId: "test-session-id",
  mood: "focused" as MoodType,
  intensity: 3,
  context: "post-session" as const,
  timestamp: new Date(),
  notes: undefined,
  ...overrides,
});
