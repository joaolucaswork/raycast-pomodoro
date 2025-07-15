/**
 * Achievement System Test Helpers
 *
 * This file provides specialized helper functions for testing the achievement system,
 * including assertion helpers, mock utilities, and test scenario builders.
 */

import {
  Achievement,
  BoxingProgress,
  TimerSession,
  AchievementRequirement,
} from "../../types/timer";
import {
  createTestSession,
  createTestBoxingProgress,
  createTestAchievement,
} from "./test-factories";

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert that an achievement has the expected structure and properties
 */
export function expectValidAchievementStructure(
  achievement: Achievement
): void {
  expect(achievement).toHaveProperty("id");
  expect(achievement).toHaveProperty("name");
  expect(achievement).toHaveProperty("description");
  expect(achievement).toHaveProperty("icon");
  expect(achievement).toHaveProperty("rarity");
  expect(achievement).toHaveProperty("points");
  expect(achievement).toHaveProperty("category");
  expect(achievement).toHaveProperty("requirements");
  expect(achievement).toHaveProperty("isBoxingThemed");

  expect(typeof achievement.id).toBe("string");
  expect(typeof achievement.name).toBe("string");
  expect(typeof achievement.description).toBe("string");
  expect(typeof achievement.points).toBe("number");
  expect(typeof achievement.isBoxingThemed).toBe("boolean");
  expect(Array.isArray(achievement.requirements)).toBe(true);
  expect(achievement.requirements.length).toBeGreaterThan(0);

  // Validate rarity values
  expect(["common", "rare", "epic", "legendary"]).toContain(achievement.rarity);

  // Validate category values (based on actual implementation)
  expect([
    "training_milestones",
    "knockout_streaks",
    "championship_belts",
    "daily_training",
    "endurance_challenges",
    "consistency_championships",
    "special_achievements",
    "mood_mastery",
  ]).toContain(achievement.category);
}

/**
 * Assert that boxing progress has valid structure and values
 */
export function expectValidBoxingProgressStructure(
  progress: BoxingProgress
): void {
  // Basic numeric fields should be non-negative
  expect(progress.totalRounds).toBeGreaterThanOrEqual(0);
  expect(progress.currentStreak).toBeGreaterThanOrEqual(0);
  expect(progress.longestStreak).toBeGreaterThanOrEqual(0);
  expect(progress.totalTrainingTime).toBeGreaterThanOrEqual(0);
  expect(progress.championshipLevel).toBeGreaterThanOrEqual(1);
  expect(progress.championshipLevel).toBeLessThanOrEqual(5);

  // Time-based counters should be non-negative
  expect(progress.dailyRoundsToday).toBeGreaterThanOrEqual(0);
  expect(progress.weeklyRoundsThisWeek).toBeGreaterThanOrEqual(0);
  expect(progress.monthlyRoundsThisMonth).toBeGreaterThanOrEqual(0);

  // Duration fields should be non-negative
  expect(progress.bestRoundDuration).toBeGreaterThanOrEqual(0);
  expect(progress.averageRoundDuration).toBeGreaterThanOrEqual(0);

  // Mood-related fields should be non-negative
  expect(progress.totalMoodEntries).toBeGreaterThanOrEqual(0);
  expect(progress.moodEntriesWithNotes).toBeGreaterThanOrEqual(0);
  expect(progress.uniqueIntensityLevelsUsed).toBeGreaterThanOrEqual(0);
  expect(progress.uniqueMoodTypesLogged).toBeGreaterThanOrEqual(0);

  // Logical constraints
  expect(progress.currentStreak).toBeLessThanOrEqual(progress.longestStreak);
  expect(progress.moodEntriesWithNotes).toBeLessThanOrEqual(
    progress.totalMoodEntries
  );
  expect(progress.dailyRoundsToday).toBeLessThanOrEqual(
    progress.weeklyRoundsThisWeek
  );
  expect(progress.weeklyRoundsThisWeek).toBeLessThanOrEqual(
    progress.monthlyRoundsThisMonth
  );
}

/**
 * Assert that an achievement requirement is valid
 */
export function expectValidAchievementRequirement(
  requirement: AchievementRequirement
): void {
  expect(requirement).toHaveProperty("type");
  expect(requirement).toHaveProperty("value");
  expect(typeof requirement.value).toBe("number");
  expect(requirement.value).toBeGreaterThan(0);

  // Validate requirement types (based on actual implementation)
  const validTypes = [
    "sessions_completed",
    "streak_length",
    "total_time",
    "daily_goal",
    "session_duration",
    "consecutive_days",
    "time_of_day",
    "weekend_sessions",
    "mood_entries_total",
    "mood_tracking_streak",
    "mood_entries_with_notes",
    "mood_intensity_range",
    "mood_specific_sessions",
    "mood_context_entries",
    "mood_improvement_pattern",
    "mood_awareness_diversity",
  ];
  expect(validTypes).toContain(requirement.type);

  // Validate timeframe if present
  if (requirement.timeframe) {
    expect(["daily", "weekly", "monthly", "all_time"]).toContain(
      requirement.timeframe
    );
  }
}

// ============================================================================
// MOCK UTILITIES
// ============================================================================

/**
 * Create a mock achievement service for testing
 */
export function createMockAchievementService() {
  return {
    getBoxingAchievements: jest.fn(() => []),
    checkAchievements: jest.fn(() => []),
    calculateBoxingProgress: jest.fn(() => createTestBoxingProgress()),
    calculateBoxingLevel: jest.fn(() => ({ level: 1, title: "Rookie" })),
    getBoxingLevels: jest.fn(() => []),
    checkRequirement: jest.fn(() => false),
  };
}

/**
 * Create a mock points system service for testing
 */
export function createMockPointsSystemService() {
  return {
    calculateSessionPoints: jest.fn(() => ({
      points: 70,
      reason: "Test",
      shouldAward: true,
    })),
    isNaturalCompletion: jest.fn(() => true),
    calculateLegacySessionPoints: jest.fn(() => 70),
    shouldAwardPoints: jest.fn(() => true),
    resetState: jest.fn(),
    getState: jest.fn(() => ({ lastCompletionWasManual: false })),
  };
}

// ============================================================================
// TEST SCENARIO BUILDERS
// ============================================================================

/**
 * Create a series of sessions that should unlock a specific achievement
 */
export function createSessionsForAchievement(
  achievement: Achievement,
  extraSessions: number = 0
): TimerSession[] {
  const sessions: TimerSession[] = [];

  for (const requirement of achievement.requirements) {
    switch (requirement.type) {
      case "sessions_completed": {
        const sessionCount = requirement.value + extraSessions;
        for (let i = 0; i < sessionCount; i++) {
          sessions.push(
            createTestSession({
              id: `session-${i}`,
              startTime: new Date(
                Date.now() - (sessionCount - i) * 60 * 60 * 1000
              ), // Spread over hours
              endTime: new Date(
                Date.now() - (sessionCount - i - 1) * 60 * 60 * 1000
              ),
              completed: true,
              activeDuration: 1500, // 25 minutes
            })
          );
        }
        break;
      }

      case "total_time": {
        // Create sessions that add up to the required time
        const totalTimeNeeded = requirement.value + extraSessions * 1500;
        const sessionDuration = 1500; // 25 minutes
        const sessionCount2 = Math.ceil(totalTimeNeeded / sessionDuration);

        for (let i = 0; i < sessionCount2; i++) {
          sessions.push(
            createTestSession({
              id: `time-session-${i}`,
              duration: sessionDuration,
              activeDuration: sessionDuration,
              completed: true,
            })
          );
        }
        break;
      }

      case "streak_length": {
        // Create consecutive sessions for streak
        const streakLength = requirement.value + extraSessions;
        for (let i = 0; i < streakLength; i++) {
          sessions.push(
            createTestSession({
              id: `streak-session-${i}`,
              startTime: new Date(
                Date.now() - (streakLength - i) * 24 * 60 * 60 * 1000
              ), // Daily sessions
              endTime: new Date(
                Date.now() - (streakLength - i - 1) * 24 * 60 * 60 * 1000
              ),
              completed: true,
              activeDuration: 1500,
            })
          );
        }
        break;
      }
    }
  }

  return sessions;
}

/**
 * Create boxing progress that should unlock a specific achievement
 */
export function createProgressForAchievement(
  achievement: Achievement
): BoxingProgress {
  const progress = createTestBoxingProgress();

  for (const requirement of achievement.requirements) {
    switch (requirement.type) {
      case "sessions_completed":
        if (requirement.timeframe === "daily") {
          progress.dailyRoundsToday = requirement.value;
        } else if (requirement.timeframe === "weekly") {
          progress.weeklyRoundsThisWeek = requirement.value;
        } else if (requirement.timeframe === "monthly") {
          progress.monthlyRoundsThisMonth = requirement.value;
        } else {
          progress.totalRounds = requirement.value;
        }
        break;

      case "streak_length":
        progress.currentStreak = requirement.value;
        progress.longestStreak = Math.max(
          progress.longestStreak,
          requirement.value
        );
        break;

      case "total_time":
        progress.totalTrainingTime = requirement.value;
        break;
    }
  }

  return progress;
}

/**
 * Create a progress state just below achievement threshold (for testing edge cases)
 */
export function createProgressBelowThreshold(
  achievement: Achievement
): BoxingProgress {
  const progress = createProgressForAchievement(achievement);

  // Reduce each requirement by 1 to be just below threshold
  for (const requirement of achievement.requirements) {
    switch (requirement.type) {
      case "sessions_completed":
        if (requirement.timeframe === "daily") {
          progress.dailyRoundsToday = Math.max(0, requirement.value - 1);
        } else if (requirement.timeframe === "weekly") {
          progress.weeklyRoundsThisWeek = Math.max(0, requirement.value - 1);
        } else if (requirement.timeframe === "monthly") {
          progress.monthlyRoundsThisMonth = Math.max(0, requirement.value - 1);
        } else {
          progress.totalRounds = Math.max(0, requirement.value - 1);
        }
        break;

      case "streak_length":
        progress.currentStreak = Math.max(0, requirement.value - 1);
        break;

      case "total_time":
        progress.totalTrainingTime = Math.max(0, requirement.value - 1);
        break;
    }
  }

  return progress;
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Create sessions with specific timing patterns for testing time-based achievements
 */
export function createTimedSessions(
  pattern: "daily" | "weekly" | "streak",
  count: number
): TimerSession[] {
  const sessions: TimerSession[] = [];
  const now = new Date();

  switch (pattern) {
    case "daily":
      // Create sessions throughout the current day
      for (let i = 0; i < count; i++) {
        const sessionTime = new Date(now);
        sessionTime.setHours(8 + i * 2, 0, 0, 0); // Every 2 hours starting at 8 AM

        sessions.push(
          createTestSession({
            id: `daily-${i}`,
            startTime: sessionTime,
            endTime: new Date(sessionTime.getTime() + 25 * 60 * 1000), // 25 minutes
            completed: true,
            activeDuration: 1500,
          })
        );
      }
      break;

    case "weekly":
      // Create sessions throughout the current week
      for (let i = 0; i < count; i++) {
        const sessionTime = new Date(now);
        sessionTime.setDate(now.getDate() - now.getDay() + i); // Each day of the week
        sessionTime.setHours(10, 0, 0, 0);

        sessions.push(
          createTestSession({
            id: `weekly-${i}`,
            startTime: sessionTime,
            endTime: new Date(sessionTime.getTime() + 25 * 60 * 1000),
            completed: true,
            activeDuration: 1500,
          })
        );
      }
      break;

    case "streak":
      // Create consecutive daily sessions
      for (let i = 0; i < count; i++) {
        const sessionTime = new Date(now);
        sessionTime.setDate(now.getDate() - count + i + 1);
        sessionTime.setHours(10, 0, 0, 0);

        sessions.push(
          createTestSession({
            id: `streak-${i}`,
            startTime: sessionTime,
            endTime: new Date(sessionTime.getTime() + 25 * 60 * 1000),
            completed: true,
            activeDuration: 1500,
          })
        );
      }
      break;
  }

  return sessions;
}
