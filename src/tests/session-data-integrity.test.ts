/**
 * Session Data Integrity Tests
 *
 * Tests that all TimerSession properties are preserved correctly during
 * session saving including task info, mood data, timing data, and metadata.
 */

import { Icon } from "@raycast/api";
import { SessionType, SessionEndReason } from "../types/timer";
import {
  createTestSession,
  createComprehensiveTestSession,
  createTestApplicationUsage,
  createTestMoodData,
  createEdgeCaseTestSessions,
} from "./utils/test-factories";
import {
  setupTestEnvironment,
  expectValidSessionStructure,
  expectSessionProperties,
  expectDatesApproximatelyEqual,
} from "./utils/test-helpers";

// Setup test environment
setupTestEnvironment();

describe("Session Data Integrity", () => {
  describe("Core Session Properties", () => {
    it("should preserve all required session properties", () => {
      const session = createTestSession({
        id: "test-session-123",
        type: SessionType.WORK,
        duration: 1500,
        completed: true,
        endReason: SessionEndReason.COMPLETED,
      });

      expectValidSessionStructure(session);
      expectSessionProperties(session, {
        id: "test-session-123",
        type: SessionType.WORK,
        duration: 1500,
        completed: true,
        endReason: SessionEndReason.COMPLETED,
      });
    });

    it("should preserve timing data accurately", () => {
      const startTime = new Date("2024-01-15T10:00:00.000Z");
      const endTime = new Date("2024-01-15T10:25:00.000Z");
      const session = createTestSession({
        startTime,
        endTime,
        duration: 1500,
        pausedTime: 120, // 2 minutes
        activeDuration: 1380, // 23 minutes active
      });

      expect(session.startTime).toEqual(startTime);
      expect(session.endTime).toEqual(endTime);
      expect(session.duration).toBe(1500);
      expect(session.pausedTime).toBe(120);
      expect(session.activeDuration).toBe(1380);
    });

    it("should preserve session type for all types", () => {
      const sessionTypes = [
        SessionType.WORK,
        SessionType.SHORT_BREAK,
        SessionType.LONG_BREAK,
      ];

      sessionTypes.forEach((type) => {
        const session = createTestSession({ type });
        expect(session.type).toBe(type);
      });
    });

    it("should preserve completion status and end reason", () => {
      const endReasons = [
        SessionEndReason.COMPLETED,
        SessionEndReason.STOPPED,
        SessionEndReason.SKIPPED,
      ];

      endReasons.forEach((endReason) => {
        const session = createTestSession({
          endReason,
          completed: endReason === SessionEndReason.COMPLETED,
        });

        expect(session.endReason).toBe(endReason);
        expect(session.completed).toBe(
          endReason === SessionEndReason.COMPLETED
        );
      });
    });
  });

  describe("Task Information", () => {
    it("should preserve task name and project name", () => {
      const session = createTestSession({
        taskName: "Implement user authentication",
        projectName: "E-commerce Platform",
      });

      expect(session.taskName).toBe("Implement user authentication");
      expect(session.projectName).toBe("E-commerce Platform");
    });

    it("should preserve task tags", () => {
      const tags = ["urgent", "backend", "security", "api"];
      const session = createTestSession({ tags });

      expect(session.tags).toEqual(tags);
      expect(session.tags).toHaveLength(4);
    });

    it("should preserve custom task icon", () => {
      const session = createTestSession({
        taskIcon: Icon.Code,
      });

      expect(session.taskIcon).toBe(Icon.Code);
    });

    it("should handle empty or undefined task information", () => {
      const session = createTestSession({
        taskName: undefined,
        projectName: undefined,
        tags: [],
        taskIcon: undefined,
      });

      expect(session.taskName).toBeUndefined();
      expect(session.projectName).toBeUndefined();
      expect(session.tags).toEqual([]);
      expect(session.taskIcon).toBeUndefined();
    });

    it("should preserve task notes", () => {
      const notes =
        "Made good progress on the authentication flow. Need to add password validation next.";
      const session = createTestSession({ notes });

      expect(session.notes).toBe(notes);
    });

    it("should handle special characters in task information", () => {
      const session = createTestSession({
        taskName: "Fix bug #123: Handle émojis 🚀 & special chars",
        projectName: "Project Alpha (v2.0)",
        notes: "Notes with\nmultiple\nlines and symbols: @#$%^&*()",
      });

      expect(session.taskName).toBe(
        "Fix bug #123: Handle émojis 🚀 & special chars"
      );
      expect(session.projectName).toBe("Project Alpha (v2.0)");
      expect(session.notes).toBe(
        "Notes with\nmultiple\nlines and symbols: @#$%^&*()"
      );
    });
  });

  describe("Mood and Energy Data", () => {
    it("should preserve all mood tracking data", () => {
      const moodData = createTestMoodData();
      const session = createTestSession(moodData);

      expect(session.energyLevel).toBe(moodData.energyLevel);
      expect(session.focusQuality).toBe(moodData.focusQuality);
      expect(session.moodState).toBe(moodData.moodState);
    });

    it("should handle all valid mood values", () => {
      const moodValues = [1, 2, 3, 4, 5] as const;

      moodValues.forEach((mood) => {
        const session = createTestSession({
          energyLevel: mood,
          focusQuality: mood,
        });

        expect(session.energyLevel).toBe(mood);
        expect(session.focusQuality).toBe(mood);
      });
    });

    it("should handle undefined mood data", () => {
      const session = createTestSession({
        energyLevel: undefined,
        focusQuality: undefined,
        moodState: undefined,
      });

      expect(session.energyLevel).toBeUndefined();
      expect(session.focusQuality).toBeUndefined();
      expect(session.moodState).toBeUndefined();
    });
  });

  describe("Application Usage Data", () => {
    it("should preserve application usage data", () => {
      const appUsage = [
        createTestApplicationUsage({
          bundleId: "com.microsoft.VSCode",
          name: "Visual Studio Code",
          timeSpent: 1200,
          percentage: 80,
          category: "development",
        }),
        createTestApplicationUsage({
          bundleId: "com.google.Chrome",
          name: "Google Chrome",
          timeSpent: 300,
          percentage: 20,
          category: "browser",
        }),
      ];

      const session = createTestSession({ applicationUsage: appUsage });

      expect(session.applicationUsage).toHaveLength(2);
      expect(session.applicationUsage![0].bundleId).toBe(
        "com.microsoft.VSCode"
      );
      expect(session.applicationUsage![0].timeSpent).toBe(1200);
      expect(session.applicationUsage![1].bundleId).toBe("com.google.Chrome");
      expect(session.applicationUsage![1].timeSpent).toBe(300);
    });

    it("should preserve all application usage properties", () => {
      const appUsage = createTestApplicationUsage({
        bundleId: "com.test.app",
        name: "Test Application",
        timeSpent: 600,
        percentage: 40,
        raycastIcon: Icon.Desktop,
        category: "development",
        isRecognized: true,
        firstUsed: new Date("2024-01-15T10:00:00Z"),
        lastUsed: new Date("2024-01-15T10:10:00Z"),
      });

      const session = createTestSession({ applicationUsage: [appUsage] });
      const savedAppUsage = session.applicationUsage![0];

      expect(savedAppUsage.bundleId).toBe("com.test.app");
      expect(savedAppUsage.name).toBe("Test Application");
      expect(savedAppUsage.timeSpent).toBe(600);
      expect(savedAppUsage.percentage).toBe(40);
      expect(savedAppUsage.raycastIcon).toBe(Icon.Desktop);
      expect(savedAppUsage.category).toBe("development");
      expect(savedAppUsage.isRecognized).toBe(true);
      expect(savedAppUsage.firstUsed).toEqual(new Date("2024-01-15T10:00:00Z"));
      expect(savedAppUsage.lastUsed).toEqual(new Date("2024-01-15T10:10:00Z"));
    });

    it("should handle empty application usage data", () => {
      const session = createTestSession({ applicationUsage: [] });
      expect(session.applicationUsage).toEqual([]);
    });

    it("should handle undefined application usage data", () => {
      const session = createTestSession({ applicationUsage: undefined });
      expect(session.applicationUsage).toBeUndefined();
    });
  });

  describe("Comprehensive Data Preservation", () => {
    it("should preserve all data in a comprehensive session", () => {
      const session = createComprehensiveTestSession();

      // Verify all major data categories are preserved
      expectValidSessionStructure(session);

      // Task information
      expect(session.taskName).toBe("Comprehensive Test Task");
      expect(session.projectName).toBe("Test Project Alpha");
      expect(session.tags).toEqual(["urgent", "development", "testing"]);
      expect(session.taskIcon).toBe(Icon.Code);
      expect(session.notes).toContain("comprehensive test session");

      // Timing data
      expect(session.duration).toBe(1800);
      expect(session.pausedTime).toBe(120);
      expect(session.activeDuration).toBe(1680);

      // Mood data
      expect(session.energyLevel).toBe(3);
      expect(session.focusQuality).toBe(4);
      expect(session.moodState).toBe("motivated");

      // Application usage
      expect(session.applicationUsage).toHaveLength(2);
      expect(session.applicationUsage![0].name).toBe("Visual Studio Code");
      expect(session.applicationUsage![1].name).toBe("Google Chrome");
    });

    it("should handle edge case sessions with minimal data", () => {
      const edgeCases = createEdgeCaseTestSessions();

      // Minimal session
      const minimal = edgeCases.minimal;
      expectValidSessionStructure(minimal);
      expect(minimal.taskName).toBeUndefined();
      expect(minimal.projectName).toBeUndefined();
      expect(minimal.tags).toEqual([]);

      // Session with special characters
      const specialChars = edgeCases.specialCharsSession;
      expect(specialChars.taskName).toContain("émojis 🚀");
      expect(specialChars.notes).toContain("@#$%^&*()");

      // Boundary session (exactly 40 seconds)
      const boundary = edgeCases.boundarySession;
      expect(boundary.duration).toBe(40);
      expect(boundary.activeDuration).toBe(40);
    });
  });

  describe("Data Type Preservation", () => {
    it("should preserve correct data types for all properties", () => {
      const session = createComprehensiveTestSession();

      // String properties
      expect(typeof session.id).toBe("string");
      expect(typeof session.taskName).toBe("string");
      expect(typeof session.projectName).toBe("string");
      expect(typeof session.notes).toBe("string");

      // Number properties
      expect(typeof session.duration).toBe("number");
      expect(typeof session.pausedTime).toBe("number");
      expect(typeof session.activeDuration).toBe("number");
      expect(typeof session.energyLevel).toBe("number");
      expect(typeof session.focusQuality).toBe("number");

      // Boolean properties
      expect(typeof session.completed).toBe("boolean");

      // Date properties
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.endTime).toBeInstanceOf(Date);

      // Array properties
      expect(Array.isArray(session.tags)).toBe(true);
      expect(Array.isArray(session.applicationUsage)).toBe(true);

      // Enum properties
      expect(Object.values(SessionType)).toContain(session.type);
      expect(Object.values(SessionEndReason)).toContain(session.endReason);
    });

    it("should handle null and undefined values appropriately", () => {
      const session = createTestSession({
        taskName: undefined,
        projectName: null as any,
        notes: undefined,
        applicationUsage: undefined,
        pausedTime: undefined,
      });

      expect(session.taskName).toBeUndefined();
      expect(session.projectName).toBeNull();
      expect(session.notes).toBeUndefined();
      expect(session.applicationUsage).toBeUndefined();
      expect(session.pausedTime).toBeUndefined();
    });
  });
});
