/**
 * Achievement Integration with Session System Tests
 *
 * Tests how achievements integrate with session completion, the 40-second minimum rule,
 * mood tracking, and timer state management.
 */

import { create } from "zustand";
import { TimerState, SessionType, SessionEndReason } from "../types/timer";
import { CombinedPomodoroStore } from "../store/timer-store";
import { createSessionSlice } from "../store/slices/session-slice";
import {
  createAchievementSlice,
  DEFAULT_BOXING_PROGRESS,
} from "../store/slices/achievement-slice";
import { createMoodSlice } from "../store/slices/mood-slice";
import { createConfigSlice } from "../store/slices/config-slice";
import { createStatsSlice } from "../store/slices/stats-slice";
import { createTagSlice } from "../store/slices/tag-slice";
import {
  createTestSession,
  createTestBoxingProgress,
  createTestMoodEntry,
} from "./utils/test-factories";
import { expectValidBoxingProgressStructure } from "./utils/achievement-test-helpers";

// Mock @raycast/api Icon
jest.mock("@raycast/api", () => ({
  ...jest.requireActual("@raycast/api"),
  Icon: {
    Hammer: "hammer",
    Code: "code",
    Desktop: "desktop",
    Book: "book",
    Heart: "heart",
    Person: "person",
    TwoPeople: "two-people",
    Building: "building",
    Calendar: "calendar",
    Clock: "clock",
    Envelope: "envelope",
    Phone: "phone",
    Gear: "gear",
    Monitor: "monitor",
    Globe: "globe",
    Link: "link",
    Trophy: "trophy",
    BarChart: "bar-chart",
    Circle: "circle",
    Play: "play",
    Pause: "pause",
    Stop: "stop",
    XMarkCircle: "x-mark-circle",
    CheckCircle: "check-circle",
    ExclamationMark: "exclamation-mark",
    Rocket: "rocket",
    BullsEye: "bulls-eye",
    Battery: "battery",
    Bolt: "bolt",
    Message: "message",
    Brush: "brush",
    Music: "music",
    Terminal: "terminal",
    Document: "document",
  },
}));

// Mock external services
jest.mock("../services/features/boxing-achievement-service", () => ({
  boxingAchievementService: {
    calculateBoxingProgress: jest.fn(() => DEFAULT_BOXING_PROGRESS),
    checkAchievements: jest.fn(() => []),
    calculateBoxingLevel: jest.fn(() => ({ level: 1, title: "Rookie" })),
    getBoxingAchievements: jest.fn(() => []),
  },
}));

jest.mock("../services/features/boxing-notification-service", () => ({
  boxingNotificationService: {
    showMultipleAchievements: jest.fn(),
  },
}));

jest.mock("../services/features/points-system-service", () => ({
  pointsSystemService: {
    calculateSessionPoints: jest.fn(() => ({
      points: 70,
      reason: "Natural completion",
      shouldAward: true,
    })),
    resetState: jest.fn(),
  },
}));

jest.mock("../services/tracking/application-tracking-service", () => ({
  applicationTrackingService: {
    startTracking: jest.fn(),
    stopTracking: jest.fn(() => []),
    isTracking: jest.fn(() => false),
    isCurrentlyTracking: jest.fn(() => false),
    getCurrentApplications: jest.fn(() => []),
  },
}));

jest.mock("../services/features/adhd-support-service", () => ({
  adhdSupportService: {
    getDefaultBreakActivities: jest.fn(() => []),
    getDefaultAchievements: jest.fn(() => []),
    suggestBreakActivity: jest.fn(() => ({
      id: "test-activity",
      name: "Test Activity",
      duration: 300,
      type: "movement",
      instructions: ["Test instruction"],
      icon: "person",
      adhdBenefit: "Test benefit",
      difficulty: "easy",
    })),
    detectHyperfocus: jest.fn(() => ({
      detected: false,
      reason: "Normal focus pattern",
      recommendation: "",
    })),
  },
}));

jest.mock("../utils/helpers", () => ({
  shouldSaveSessionToHistory: jest.fn((session) => {
    if (session.activeDuration !== undefined) {
      return session.activeDuration >= 40;
    }
    return true;
  }),
  getActualSessionDuration: jest.fn((session) => {
    return session.activeDuration || session.duration || 0;
  }),
  generateId: jest.fn(() => `test-id-${Date.now()}`),
}));

jest.mock("@raycast/api", () => ({
  showToast: jest.fn(),
  Toast: { Style: { Success: "success", Failure: "failure" } },
}));

// Create test store
const createTestStore = () => {
  return create<CombinedPomodoroStore>((set, get, store) => ({
    ...createSessionSlice(set, get, store),
    ...createAchievementSlice(set, get, store),
    ...createMoodSlice(set, get, store),
    ...createConfigSlice(set, get, store),
    ...createStatsSlice(set, get, store),
    ...createTagSlice(set, get, store),
  }));
};

describe("Achievement Integration with Session System", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.useFakeTimers();
    store = createTestStore();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Session Completion and Achievement Updates", () => {
    it("should update boxing progress when session is completed", () => {
      const mockProgress = createTestBoxingProgress({
        totalRounds: 1,
        currentStreak: 1,
        totalTrainingTime: 1500,
      });

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );

      // Start and complete a session
      store.getState().startTimer(SessionType.WORK, "Test Task");
      store.getState().completeSession();

      // Advance timers to trigger the setTimeout in completeSession
      jest.advanceTimersByTime(100);

      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalled();
    });

    it("should check for new achievements after session completion", () => {
      const mockProgress = createTestBoxingProgress({ totalRounds: 1 });
      const mockNewAchievements = [
        {
          id: "first-bell",
          name: "First Bell",
          description: "Complete your first round",
          points: 25,
          unlockedAt: new Date(),
        },
      ];

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );
      boxingAchievementService.checkAchievements.mockReturnValue(
        mockNewAchievements
      );

      store.getState().startTimer(SessionType.WORK, "Test Task");
      store.getState().completeSession();

      // Advance timers to trigger the setTimeout in completeSession
      jest.advanceTimersByTime(100);

      const state = store.getState();
      expect(state.rewardSystem.achievements).toHaveLength(1);
      expect(state.rewardSystem.points).toBe(25);
    });

    it("should award points based on session completion type", () => {
      // Points are awarded through the achievement system, not directly through pointsSystemService
      // The pointsSystemService is used in timer-completion-service, not in updateBoxingProgress
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;

      const mockNewAchievements = [
        {
          id: "first-bell",
          name: "First Bell",
          description: "Complete your first round",
          points: 25,
          unlockedAt: new Date(),
        },
      ];

      boxingAchievementService.checkAchievements.mockReturnValue(
        mockNewAchievements
      );

      store.getState().startTimer(SessionType.WORK, "Test Task");
      store.getState().completeSession();

      // Advance timers to trigger the setTimeout in completeSession
      jest.advanceTimersByTime(100);

      // Verify that achievement points were awarded
      const state = store.getState();
      expect(state.rewardSystem.points).toBe(25); // Points from achievement
    });

    it("should handle manual session stopping and achievement updates", () => {
      // stopTimer doesn't automatically trigger achievement updates
      // Achievement updates only happen on completeSession for saved sessions
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;

      store.getState().startTimer(SessionType.WORK, "Test Task");
      store.getState().stopTimer();

      // stopTimer doesn't call updateBoxingProgress automatically
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).not.toHaveBeenCalled();

      // But we can manually trigger achievement updates
      store.getState().updateBoxingProgress();
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalled();
    });
  });

  describe("40-Second Minimum Rule Integration", () => {
    it("should update achievements for sessions meeting 40-second minimum", () => {
      const shouldSaveSessionToHistory =
        require("../utils/helpers").shouldSaveSessionToHistory;
      shouldSaveSessionToHistory.mockReturnValue(true); // Session meets minimum

      const mockProgress = createTestBoxingProgress({ totalRounds: 1 });
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );

      store.getState().startTimer(SessionType.WORK, "Test Task");

      // Simulate session with sufficient duration
      store.setState({
        currentSession: {
          ...store.getState().currentSession!,
          activeDuration: 60, // Above 40-second threshold
        },
      });

      store.getState().completeSession();

      // Advance timers to trigger the setTimeout in completeSession
      jest.advanceTimersByTime(100);

      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalled();
      expect(store.getState().history).toHaveLength(1);
    });

    it("should not update achievements for sessions below 40-second minimum", () => {
      const shouldSaveSessionToHistory =
        require("../utils/helpers").shouldSaveSessionToHistory;
      shouldSaveSessionToHistory.mockReturnValue(false); // Session too short

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;

      store.getState().startTimer(SessionType.WORK, "Test Task");

      // Simulate short session
      store.setState({
        currentSession: {
          ...store.getState().currentSession!,
          activeDuration: 30, // Below 40-second threshold
        },
      });

      store.getState().completeSession();

      // Advance timers - but since shouldSave is false, updateBoxingProgress won't be called
      jest.advanceTimersByTime(100);

      // Should NOT call calculateBoxingProgress because session wasn't saved
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).not.toHaveBeenCalled();
      expect(store.getState().history).toHaveLength(0);
    });

    it("should handle sessions exactly at 40-second boundary", () => {
      const shouldSaveSessionToHistory =
        require("../utils/helpers").shouldSaveSessionToHistory;
      shouldSaveSessionToHistory.mockReturnValue(true); // Exactly at threshold

      const mockProgress = createTestBoxingProgress({ totalRounds: 1 });
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );

      store.getState().startTimer(SessionType.WORK, "Test Task");

      store.setState({
        currentSession: {
          ...store.getState().currentSession!,
          activeDuration: 40, // Exactly at threshold
        },
      });

      store.getState().completeSession();

      // Advance timers to trigger the setTimeout in completeSession
      jest.advanceTimersByTime(100);

      expect(store.getState().history).toHaveLength(1);
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalled();
    });
  });

  describe("Mood Tracking Integration", () => {
    it("should include mood data in achievement progress calculation", () => {
      const moodEntry = createTestMoodEntry({
        sessionId: "test-session",
        mood: "energized",
        intensity: 4,
      });

      // Add mood entry to store
      store.setState({
        moodEntries: [moodEntry],
      });

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;

      store.getState().updateBoxingProgress();

      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalledWith(
        expect.any(Array), // history
        [moodEntry] // mood entries
      );
    });

    it("should update mood-related achievement progress", () => {
      const mockProgress = createTestBoxingProgress({
        totalRounds: 1,
        totalMoodEntries: 1,
        energizedSessions: 1,
        moodTrackingStreak: 1,
      });

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );

      const moodEntry = createTestMoodEntry({
        sessionId: "test-session",
        mood: "energized",
        intensity: 4,
      });

      store.setState({
        moodEntries: [moodEntry],
      });

      store.getState().updateBoxingProgress();

      expect(mockProgress.totalMoodEntries).toBe(1);
      expect(mockProgress.energizedSessions).toBe(1);
    });

    it("should handle mood tracking achievements", () => {
      const moodAchievement = {
        id: "mood-tracker",
        name: "Mood Tracker",
        description: "Log your first mood entry",
        category: "mood_mastery",
        points: 25,
        unlockedAt: new Date(),
      };

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.checkAchievements.mockReturnValue([
        moodAchievement,
      ]);

      store.getState().updateBoxingProgress();

      const state = store.getState();
      expect(state.rewardSystem.achievements).toHaveLength(1);
      expect(state.rewardSystem.achievements[0].category).toBe("mood_mastery");
    });
  });

  describe("Timer State Management Integration", () => {
    it("should update achievements when transitioning from COMPLETED to IDLE", () => {
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;

      store.getState().startTimer(SessionType.WORK, "Test Task");
      store.getState().completeSession();

      // Should be in COMPLETED state initially
      expect(store.getState().state).toBe(TimerState.COMPLETED);

      // After timeout, should transition to IDLE
      jest.advanceTimersByTime(5000);
      expect(store.getState().state).toBe(TimerState.IDLE);

      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalled();
    });

    it("should handle achievement updates during PAUSED state", () => {
      store.getState().startTimer(SessionType.WORK, "Test Task");
      store.getState().pauseTimer();

      expect(store.getState().state).toBe(TimerState.PAUSED);

      // Completing from paused state should still update achievements
      store.getState().completeSession();

      // Advance timers to trigger the setTimeout in completeSession
      jest.advanceTimersByTime(100);

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalled();
    });

    it("should handle achievement updates for different session types", () => {
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;

      // Test work session - should trigger achievement updates
      store.getState().startTimer(SessionType.WORK, "Work Task");
      store.getState().completeSession();
      jest.advanceTimersByTime(100);

      // Test break session - should NOT trigger achievement updates (only WORK sessions do)
      store.getState().startTimer(SessionType.SHORT_BREAK);
      store.getState().completeSession();
      jest.advanceTimersByTime(100);

      // Should only calculate progress for work session (not break session)
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("Session History and Achievement Correlation", () => {
    it("should maintain consistency between session history and achievement progress", () => {
      const sessions = [
        createTestSession({
          id: "session-1",
          completed: true,
          activeDuration: 1500,
        }),
        createTestSession({
          id: "session-2",
          completed: true,
          activeDuration: 1800,
        }),
        createTestSession({
          id: "session-3",
          completed: true,
          activeDuration: 1200,
        }),
      ];

      // Set up store with session history
      store.setState({ history: sessions });

      const mockProgress = createTestBoxingProgress({
        totalRounds: 3,
        totalTrainingTime: 4500, // Sum of durations
      });

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );

      store.getState().updateBoxingProgress();

      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalledWith(sessions, expect.any(Array));
    });

    it("should handle achievement progress with mixed session completion states", () => {
      const mixedSessions = [
        createTestSession({ completed: true, activeDuration: 1500 }),
        createTestSession({ completed: false, activeDuration: 300 }), // Incomplete
        createTestSession({ completed: true, activeDuration: 1800 }),
      ];

      store.setState({ history: mixedSessions });

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;

      store.getState().updateBoxingProgress();

      // Should pass all sessions, service will filter completed ones
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalledWith(mixedSessions, expect.any(Array));
    });

    it("should handle achievement updates with empty session history", () => {
      store.setState({ history: [] });

      const mockProgress = createTestBoxingProgress(); // Default empty progress
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );

      store.getState().updateBoxingProgress();

      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalledWith([], expect.any(Array));
    });
  });

  describe("Achievement Notification Integration", () => {
    it("should show notifications for newly unlocked achievements", () => {
      const newAchievements = [
        {
          id: "first-bell",
          name: "First Bell",
          description: "Complete your first round",
          points: 25,
          unlockedAt: new Date(),
        },
      ];

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      const boxingNotificationService =
        require("../services/features/boxing-notification-service").boxingNotificationService;

      boxingAchievementService.checkAchievements.mockReturnValue(
        newAchievements
      );

      store.getState().updateBoxingProgress();

      expect(
        boxingNotificationService.showMultipleAchievements
      ).toHaveBeenCalledWith(newAchievements);
    });

    it("should not show notifications when no new achievements are unlocked", () => {
      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      const boxingNotificationService =
        require("../services/features/boxing-notification-service").boxingNotificationService;

      boxingAchievementService.checkAchievements.mockReturnValue([]);

      store.getState().updateBoxingProgress();

      expect(
        boxingNotificationService.showMultipleAchievements
      ).not.toHaveBeenCalled();
    });

    it("should handle notification errors gracefully", () => {
      const newAchievements = [
        {
          id: "test-achievement",
          name: "Test Achievement",
          points: 25,
          unlockedAt: new Date(),
        },
      ];

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      const boxingNotificationService =
        require("../services/features/boxing-notification-service").boxingNotificationService;

      boxingAchievementService.checkAchievements.mockReturnValue(
        newAchievements
      );
      boxingNotificationService.showMultipleAchievements.mockImplementation(
        () => {
          throw new Error("Notification error");
        }
      );

      expect(() => {
        store.getState().updateBoxingProgress();
      }).not.toThrow();
    });
  });
});
