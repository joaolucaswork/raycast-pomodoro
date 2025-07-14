import { pointsSystemService } from "../services/features/points-system-service";
import { TimerSession, SessionType, SessionEndReason } from "../types/timer";

// Mock the helpers module
jest.mock("../utils/helpers", () => ({
  getActualSessionDuration: jest.fn((session: TimerSession) => {
    if (session.endTime && session.startTime) {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();
      return Math.floor((end - start) / 1000);
    }
    return 0;
  }),
}));

describe("PointsSystemService", () => {
  beforeEach(() => {
    // Reset the service state before each test
    pointsSystemService.resetState();
  });

  describe("Natural Completion (Timer Expires)", () => {
    it("should award 70 points for natural completion", () => {
      const session = createTestSession({
        duration: 1500, // 25 minutes
        actualDuration: 1500,
        endReason: SessionEndReason.COMPLETED,
      });

      const result = pointsSystemService.calculateSessionPoints(session, false);

      expect(result.points).toBe(70);
      expect(result.reason).toBe("Natural completion (timer expired)");
      expect(result.shouldAward).toBe(true);
    });

    it("should reset manual completion flag after natural completion", () => {
      // First, do a manual completion to set the flag
      const manualSession = createTestSession({
        duration: 1500,
        actualDuration: 100,
        endReason: SessionEndReason.STOPPED,
      });
      pointsSystemService.calculateSessionPoints(manualSession, true);

      // Then do a natural completion
      const naturalSession = createTestSession({
        duration: 1500,
        actualDuration: 1500,
        endReason: SessionEndReason.COMPLETED,
      });
      const result = pointsSystemService.calculateSessionPoints(
        naturalSession,
        false
      );

      expect(result.points).toBe(70);
      expect(result.shouldAward).toBe(true);
      expect(pointsSystemService.getState().lastCompletionWasManual).toBe(
        false
      );
    });
  });

  describe("Manual Completion Before 40 Seconds", () => {
    it("should award 1 point for manual completion before 40s", () => {
      const session = createTestSession({
        duration: 1500,
        actualDuration: 30,
        endReason: SessionEndReason.STOPPED,
      });

      const result = pointsSystemService.calculateSessionPoints(session, true);

      expect(result.points).toBe(1);
      expect(result.reason).toBe("Manual completion (30s < 40s minimum)");
      expect(result.shouldAward).toBe(true);
    });

    it("should set manual completion flag", () => {
      const session = createTestSession({
        duration: 1500,
        actualDuration: 30,
        endReason: SessionEndReason.STOPPED,
      });

      pointsSystemService.calculateSessionPoints(session, true);

      expect(pointsSystemService.getState().lastCompletionWasManual).toBe(true);
    });
  });

  describe("Manual Completion After 40 Seconds", () => {
    it("should award 10 points for manual completion after 40s", () => {
      const session = createTestSession({
        duration: 1500,
        actualDuration: 100,
        endReason: SessionEndReason.STOPPED,
      });

      const result = pointsSystemService.calculateSessionPoints(session, true);

      expect(result.points).toBe(10);
      expect(result.reason).toBe("Manual completion (100s ≥ 40s)");
      expect(result.shouldAward).toBe(true);
    });

    it("should handle exactly 40 seconds", () => {
      const session = createTestSession({
        duration: 1500,
        actualDuration: 40,
        endReason: SessionEndReason.STOPPED,
      });

      const result = pointsSystemService.calculateSessionPoints(session, true);

      expect(result.points).toBe(10);
      expect(result.reason).toBe("Manual completion (40s ≥ 40s)");
      expect(result.shouldAward).toBe(true);
    });
  });

  describe("Point Timing Restriction", () => {
    it("should restrict points after manual completion until next natural completion", () => {
      // First manual completion - should award points
      const firstManualSession = createTestSession({
        duration: 1500,
        actualDuration: 100,
        endReason: SessionEndReason.STOPPED,
      });
      const firstResult = pointsSystemService.calculateSessionPoints(
        firstManualSession,
        true
      );
      expect(firstResult.shouldAward).toBe(true);
      expect(firstResult.points).toBe(10);

      // Second manual completion - should NOT award points
      const secondManualSession = createTestSession({
        duration: 1500,
        actualDuration: 200,
        endReason: SessionEndReason.STOPPED,
      });
      const secondResult = pointsSystemService.calculateSessionPoints(
        secondManualSession,
        true
      );
      expect(secondResult.shouldAward).toBe(false);
      expect(secondResult.points).toBe(0);
      expect(secondResult.reason).toBe(
        "Manual completion (200s ≥ 40s) - Points restricted after manual completion"
      );

      // Natural completion - should award points and reset restriction
      const naturalSession = createTestSession({
        duration: 1500,
        actualDuration: 1500,
        endReason: SessionEndReason.COMPLETED,
      });
      const naturalResult = pointsSystemService.calculateSessionPoints(
        naturalSession,
        false
      );
      expect(naturalResult.shouldAward).toBe(true);
      expect(naturalResult.points).toBe(70);

      // Next manual completion - should award points again
      const thirdManualSession = createTestSession({
        duration: 1500,
        actualDuration: 150,
        endReason: SessionEndReason.STOPPED,
      });
      const thirdResult = pointsSystemService.calculateSessionPoints(
        thirdManualSession,
        true
      );
      expect(thirdResult.shouldAward).toBe(true);
      expect(thirdResult.points).toBe(10);
    });
  });

  describe("Session End Reason Detection", () => {
    it("should correctly identify natural completion", () => {
      const session = createTestSession({
        endReason: SessionEndReason.COMPLETED,
      });

      expect(pointsSystemService.isNaturalCompletion(session)).toBe(true);
    });

    it("should correctly identify manual completion (STOPPED)", () => {
      const session = createTestSession({
        endReason: SessionEndReason.STOPPED,
      });

      expect(pointsSystemService.isNaturalCompletion(session)).toBe(false);
    });

    it("should correctly identify manual completion (SKIPPED)", () => {
      const session = createTestSession({
        endReason: SessionEndReason.SKIPPED,
      });

      expect(pointsSystemService.isNaturalCompletion(session)).toBe(false);
    });
  });

  describe("Legacy Session Points", () => {
    it("should calculate points for legacy sessions without endReason", () => {
      // Natural completion (90% of duration)
      const naturalLegacySession = createTestSession({
        duration: 1500,
        actualDuration: 1350, // 90% of 1500
        completed: true,
        endReason: undefined,
      });
      expect(
        pointsSystemService.calculateLegacySessionPoints(naturalLegacySession)
      ).toBe(70);

      // Manual completion after 40s
      const manualLegacySession = createTestSession({
        duration: 1500,
        actualDuration: 100,
        completed: true,
        endReason: undefined,
      });
      expect(
        pointsSystemService.calculateLegacySessionPoints(manualLegacySession)
      ).toBe(10);

      // Manual completion before 40s
      const shortLegacySession = createTestSession({
        duration: 1500,
        actualDuration: 30,
        completed: true,
        endReason: undefined,
      });
      expect(
        pointsSystemService.calculateLegacySessionPoints(shortLegacySession)
      ).toBe(1);

      // Not completed
      const incompleteSession = createTestSession({
        duration: 1500,
        actualDuration: 100,
        completed: false,
        endReason: undefined,
      });
      expect(
        pointsSystemService.calculateLegacySessionPoints(incompleteSession)
      ).toBe(0);
    });
  });
});

// Helper function to create test sessions
function createTestSession(
  overrides: Partial<TimerSession & { actualDuration: number }> = {}
): TimerSession {
  const now = new Date();
  const actualDuration = overrides.actualDuration || 1500;
  const startTime = new Date(now.getTime() - actualDuration * 1000);

  return {
    id: "test-session-" + Math.random(),
    type: SessionType.WORK,
    duration: 1500,
    startTime,
    endTime: now,
    completed: true,
    endReason: SessionEndReason.COMPLETED,
    taskName: "Test Task",
    tags: [],
    ...overrides,
  };
}
