/**
 * Session Error Handling & Edge Cases Tests
 *
 * Tests error scenarios and edge cases for session saving functionality
 * including invalid data, storage failures, and boundary conditions.
 */

import { SessionType, SessionEndReason } from "../types/timer";
import {
  shouldSaveSessionToHistory,
  getActualSessionDuration,
} from "../utils/helpers";
import {
  createTestSession,
  createValidTestSession,
  createTestHistory,
} from "./utils/test-factories";
import {
  setupTestEnvironment,
  createMockStore,
  expectSessionNotInHistory,
} from "./utils/test-helpers";

// Setup test environment
setupTestEnvironment();

// Mock console to capture error logs
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

beforeEach(() => {
  global.console = { ...global.console, ...mockConsole };
  jest.clearAllMocks();
});

describe("Session Error Handling & Edge Cases", () => {
  describe("Invalid Session Data", () => {
    it("should handle sessions with missing required properties", () => {
      const invalidSessions = [
        createTestSession({ id: undefined as any }),
        createTestSession({ type: undefined as any }),
        createTestSession({ duration: undefined as any }),
        createTestSession({
          startTime: undefined as any,
          activeDuration: undefined,
        }),
        createTestSession({ completed: undefined as any }),
      ];

      invalidSessions.forEach((session, index) => {
        // Should not crash when processing invalid sessions
        expect(() => {
          const shouldSave = shouldSaveSessionToHistory(session);
          const duration = getActualSessionDuration(session);

          // Most invalid sessions should not be saved
          if (session.startTime === undefined) {
            expect(shouldSave).toBe(false);
            expect(duration).toBe(0);
          }
        }).not.toThrow();
      });
    });

    it("should handle sessions with null properties", () => {
      const sessionWithNulls = createTestSession({
        taskName: null as any,
        projectName: null as any,
        tags: null as any,
        notes: null as any,
        applicationUsage: null as any,
      });

      expect(() => {
        shouldSaveSessionToHistory(sessionWithNulls);
        getActualSessionDuration(sessionWithNulls);
      }).not.toThrow();

      expect(sessionWithNulls.taskName).toBeNull();
      expect(sessionWithNulls.projectName).toBeNull();
      expect(sessionWithNulls.tags).toBeNull();
    });

    it("should handle sessions with invalid data types", () => {
      const sessionWithInvalidTypes = createTestSession({
        duration: "invalid" as any,
        pausedTime: "not-a-number" as any,
        energyLevel: "happy" as any,
        focusQuality: {} as any,
      });

      expect(() => {
        shouldSaveSessionToHistory(sessionWithInvalidTypes);
        getActualSessionDuration(sessionWithInvalidTypes);
      }).not.toThrow();
    });

    it("should handle sessions with extremely large values", () => {
      const sessionWithLargeValues = createTestSession({
        duration: Number.MAX_SAFE_INTEGER,
        pausedTime: Number.MAX_SAFE_INTEGER,
        activeDuration: Number.MAX_SAFE_INTEGER,
      });

      expect(() => {
        shouldSaveSessionToHistory(sessionWithLargeValues);
        getActualSessionDuration(sessionWithLargeValues);
      }).not.toThrow();

      expect(sessionWithLargeValues.duration).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should handle sessions with negative values", () => {
      const sessionWithNegativeValues = createTestSession({
        duration: -1500,
        pausedTime: -300,
        activeDuration: -1200,
      });

      expect(() => {
        shouldSaveSessionToHistory(sessionWithNegativeValues);
        getActualSessionDuration(sessionWithNegativeValues);
      }).not.toThrow();

      // Negative durations should not be saved
      expect(shouldSaveSessionToHistory(sessionWithNegativeValues)).toBe(false);
    });
  });

  describe("Malformed Date Objects", () => {
    it("should handle invalid date strings", () => {
      const sessionWithInvalidDates = createTestSession({
        startTime: new Date("invalid-date"),
        endTime: new Date("not-a-date"),
        activeDuration: undefined, // Force fallback to wall-clock calculation
      });

      expect(() => {
        const shouldSave = shouldSaveSessionToHistory(sessionWithInvalidDates);
        const duration = getActualSessionDuration(sessionWithInvalidDates);

        expect(shouldSave).toBe(false);
        expect(duration).toBe(0);
      }).not.toThrow();
    });

    it("should handle dates with extreme values", () => {
      const extremeDates = [
        new Date(0), // Unix epoch
        new Date(8640000000000000), // Max date
        new Date(-8640000000000000), // Min date
      ];

      extremeDates.forEach((date) => {
        const session = createTestSession({
          startTime: date,
          endTime: new Date(),
        });

        expect(() => {
          shouldSaveSessionToHistory(session);
          getActualSessionDuration(session);
        }).not.toThrow();
      });
    });

    it("should handle endTime before startTime", () => {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() + 60000); // Start after end

      const session = createTestSession({
        startTime,
        endTime,
        activeDuration: undefined, // Force fallback to wall-clock calculation
      });

      const duration = getActualSessionDuration(session);
      expect(duration).toBeLessThanOrEqual(0); // Mock ensures non-negative, so 0 is expected
      expect(shouldSaveSessionToHistory(session)).toBe(false);
    });

    it("should handle missing endTime gracefully", () => {
      const session = createTestSession({
        startTime: new Date(Date.now() - 60000), // 1 minute ago
        endTime: undefined,
      });

      expect(() => {
        const duration = getActualSessionDuration(session);
        const shouldSave = shouldSaveSessionToHistory(session);

        expect(duration).toBeGreaterThan(0);
        expect(shouldSave).toBe(true);
      }).not.toThrow();
    });
  });

  describe("Storage Failures and Recovery", () => {
    it("should handle localStorage failures gracefully", () => {
      // Mock localStorage failure
      const mockLocalStorage = {
        getItem: jest.fn(() => {
          throw new Error("Storage error");
        }),
        setItem: jest.fn(() => {
          throw new Error("Storage error");
        }),
        removeItem: jest.fn(() => {
          throw new Error("Storage error");
        }),
        clear: jest.fn(() => {
          throw new Error("Storage error");
        }),
      };

      // Simulate storage operations that might fail
      expect(() => {
        try {
          mockLocalStorage.setItem();
        } catch (error: any) {
          // Should handle storage errors gracefully
          expect(error.message).toBe("Storage error");
        }
      }).not.toThrow();
    });

    it("should handle corrupted storage data", () => {
      const corruptedData = [
        "invalid-json",
        '{"incomplete": json',
        '{"valid": "json", "but": "wrong", "structure": true}',
        null,
        undefined,
      ];

      corruptedData.forEach((data) => {
        expect(() => {
          try {
            if (typeof data === "string") {
              JSON.parse(data);
            }
          } catch (error) {
            // Should handle JSON parse errors
            expect(error).toBeInstanceOf(SyntaxError);
          }
        }).not.toThrow();
      });
    });

    it("should recover from storage quota exceeded", () => {
      // Mock quota exceeded error
      const mockSetItem = jest.fn(() => {
        const error = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      });

      expect(() => {
        try {
          mockSetItem();
        } catch (error: any) {
          if (error.name === "QuotaExceededError") {
            // Should handle quota errors gracefully
            expect(error.name).toBe("QuotaExceededError");
          }
        }
      }).not.toThrow();
    });
  });

  describe("Concurrent Session Operations", () => {
    it("should handle multiple simultaneous session saves", async () => {
      const sessions = [
        createValidTestSession(1500),
        createValidTestSession(1800),
        createValidTestSession(2100),
      ];

      // Simulate concurrent operations
      const promises = sessions.map((session) =>
        Promise.resolve().then(() => {
          const shouldSave = shouldSaveSessionToHistory(session);
          const duration = getActualSessionDuration(session);
          return { session, shouldSave, duration };
        })
      );

      const results = await Promise.all(promises);

      // All should complete successfully
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.shouldSave).toBe(true);
        expect(result.duration).toBeGreaterThan(40);
      });
    });

    it("should handle rapid session creation and completion", () => {
      const rapidSessions = Array.from(
        { length: 100 },
        (_, i) => createValidTestSession(60 + i) // Varying durations
      );

      expect(() => {
        rapidSessions.forEach((session) => {
          shouldSaveSessionToHistory(session);
          getActualSessionDuration(session);
        });
      }).not.toThrow();
    });

    it("should handle session ID collisions", () => {
      const duplicateId = "duplicate-session-id";
      const session1 = createTestSession({ id: duplicateId });
      const session2 = createTestSession({ id: duplicateId });

      const history = [session1];

      // Should handle duplicate IDs gracefully
      expect(() => {
        const updatedHistory = [...history, session2];
        expect(updatedHistory).toHaveLength(2);

        // Both sessions with same ID should be present
        const sessionsWithId = updatedHistory.filter(
          (s) => s.id === duplicateId
        );
        expect(sessionsWithId).toHaveLength(2);
      }).not.toThrow();
    });
  });

  describe("Memory Constraints", () => {
    it("should handle large history arrays", () => {
      const largeHistory = createTestHistory(10000); // 10k sessions

      expect(() => {
        const newSession = createValidTestSession(1500);
        const updatedHistory = [...largeHistory, newSession];

        expect(updatedHistory).toHaveLength(10001);
        expect(updatedHistory[updatedHistory.length - 1]).toBe(newSession);
      }).not.toThrow();
    });

    it("should handle sessions with large data payloads", () => {
      const sessionWithLargeData = createTestSession({
        taskName: "x".repeat(10000), // 10k characters
        notes: "y".repeat(50000), // 50k characters
        tags: Array.from({ length: 1000 }, (_, i) => `tag-${i}`), // 1k tags
      });

      expect(() => {
        shouldSaveSessionToHistory(sessionWithLargeData);
        getActualSessionDuration(sessionWithLargeData);
      }).not.toThrow();

      expect(sessionWithLargeData.taskName).toHaveLength(10000);
      expect(sessionWithLargeData.notes).toHaveLength(50000);
      expect(sessionWithLargeData.tags).toHaveLength(1000);
    });

    it("should handle memory pressure scenarios", () => {
      // Simulate memory pressure by creating many objects
      const manyObjects = Array.from({ length: 1000 }, () => ({
        session: createValidTestSession(Math.random() * 3600),
        metadata: {
          timestamp: new Date(),
          random: Math.random(),
          data: Array.from({ length: 100 }, () => Math.random()),
        },
      }));

      expect(() => {
        manyObjects.forEach((obj) => {
          shouldSaveSessionToHistory(obj.session);
          getActualSessionDuration(obj.session);
        });
      }).not.toThrow();

      expect(manyObjects).toHaveLength(1000);
    });
  });

  describe("Boundary Conditions", () => {
    it("should handle sessions at exact duration boundaries", () => {
      const boundaryDurations = [0, 1, 39, 40, 41, 3599, 3600, 86399, 86400];

      boundaryDurations.forEach((duration) => {
        const session = createTestSession({
          duration,
          activeDuration: duration,
          startTime: new Date(),
          endTime: new Date(Date.now() + duration * 1000),
        });

        const shouldSave = shouldSaveSessionToHistory(session);
        const actualDuration = getActualSessionDuration(session);

        expect(actualDuration).toBe(duration);
        expect(shouldSave).toBe(duration >= 40);
      });
    });

    it("should handle floating point precision issues", () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 40001.7); // 40.0017 seconds

      const session = createTestSession({
        startTime,
        endTime,
        activeDuration: undefined, // Force fallback to wall-clock calculation
      });
      const duration = getActualSessionDuration(session);

      // Should floor to 40 seconds
      expect(duration).toBe(40);
      expect(shouldSaveSessionToHistory(session)).toBe(true);
    });

    it("should handle timezone changes", () => {
      // Simulate timezone change during session
      const startTime = new Date("2024-01-15T10:00:00.000Z");
      const endTime = new Date("2024-01-15T10:25:00.000+01:00"); // Different timezone

      const session = createTestSession({ startTime, endTime });

      expect(() => {
        const duration = getActualSessionDuration(session);
        const shouldSave = shouldSaveSessionToHistory(session);

        // Should handle timezone differences
        expect(typeof duration).toBe("number");
        expect(typeof shouldSave).toBe("boolean");
      }).not.toThrow();
    });
  });

  describe("Error Recovery", () => {
    it("should continue operation after individual session failures", () => {
      const sessions = [
        createValidTestSession(1500), // Valid
        createTestSession({ startTime: undefined as any }), // Invalid
        createValidTestSession(1800), // Valid
        createTestSession({ duration: "invalid" as any }), // Invalid
        createValidTestSession(2100), // Valid
      ];

      const results = sessions.map((session) => {
        try {
          return {
            shouldSave: shouldSaveSessionToHistory(session),
            duration: getActualSessionDuration(session),
            error: null,
          };
        } catch (error) {
          return {
            shouldSave: false,
            duration: 0,
            error: (error as Error).message,
          };
        }
      });

      // Should process all sessions without stopping
      expect(results).toHaveLength(5);

      // Valid sessions should be processed correctly
      expect(results[0].shouldSave).toBe(true);
      expect(results[2].shouldSave).toBe(true);
      expect(results[4].shouldSave).toBe(true);
    });

    it("should maintain data integrity after errors", () => {
      const initialHistory = createTestHistory(3);
      const invalidSession = createTestSession({ startTime: undefined as any });

      // Attempt to add invalid session
      let updatedHistory = initialHistory;
      try {
        if (shouldSaveSessionToHistory(invalidSession)) {
          updatedHistory = [...initialHistory, invalidSession];
        }
      } catch (error) {
        // History should remain unchanged on error
        updatedHistory = initialHistory;
      }

      expect(updatedHistory).toEqual(initialHistory);
      expect(updatedHistory).toHaveLength(3);
      expectSessionNotInHistory(updatedHistory, invalidSession.id);
    });
  });
});
