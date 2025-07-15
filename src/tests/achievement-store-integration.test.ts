/**
 * Achievement Store Integration Tests
 *
 * Tests the achievement slice of the store, including state management,
 * achievement unlocking, boxing progress updates, and persistence.
 */

import { create } from "zustand";
import { CombinedPomodoroStore } from "../store/timer-store";
import {
  createAchievementSlice,
  DEFAULT_BOXING_PROGRESS,
  DEFAULT_REWARD_SYSTEM,
} from "../store/slices/achievement-slice";
import { createSessionSlice } from "../store/slices/session-slice";
import { createMoodSlice } from "../store/slices/mood-slice";
import { createConfigSlice } from "../store/slices/config-slice";
import { createStatsSlice } from "../store/slices/stats-slice";
import { createTagSlice } from "../store/slices/tag-slice";
import {
  createTestSession,
  createTestBoxingProgress,
  createTestRewardSystem,
  achievementTestScenarios,
} from "./utils/test-factories";
import {
  expectValidBoxingProgressStructure,
  createMockAchievementService,
  createMockPointsSystemService,
} from "./utils/achievement-test-helpers";

// Mock external services
jest.mock("../services/features/boxing-achievement-service", () => ({
  boxingAchievementService: {
    calculateBoxingProgress: jest.fn(() => DEFAULT_BOXING_PROGRESS),
    checkAchievements: jest.fn(() => []),
    calculateBoxingLevel: jest.fn(() => ({ level: 1, title: "Rookie" })),
    getBoxingAchievements: jest.fn(() => []),
    getBoxingLevels: jest.fn(() => [
      { level: 1, title: "Rookie", minPoints: 0, maxPoints: 99 },
      { level: 2, title: "Amateur", minPoints: 100, maxPoints: 299 },
      { level: 3, title: "Contender", minPoints: 300, maxPoints: 599 },
    ]),
    getPointsToNextLevel: jest.fn(() => 50),
  },
}));

jest.mock("../services/features/boxing-notification-service", () => ({
  boxingNotificationService: {
    showMultipleAchievements: jest.fn(),
  },
}));

jest.mock("../services/features/adhd-support-service", () => ({
  adhdSupportService: {
    calculateLevel: jest.fn(() => 1),
    checkAchievements: jest.fn(() => []),
    getDefaultAchievements: jest.fn(() => []),
    getDefaultBreakActivities: jest.fn(() => []),
    detectHyperfocus: jest.fn(() => ({
      detected: false,
      reason: "Normal focus pattern",
      recommendation: "",
    })),
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
  },
}));

// Create a test store
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

describe("Achievement Store Integration", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with default reward system", () => {
      const state = store.getState();

      expect(state.rewardSystem).toEqual(DEFAULT_REWARD_SYSTEM);
      expect(state.rewardSystem.points).toBe(0);
      expect(state.rewardSystem.level).toBe(1);
      expect(state.rewardSystem.achievements).toEqual([]);
    });

    it("should initialize with default boxing progress", () => {
      const state = store.getState();

      expect(state.boxingProgress).toEqual(DEFAULT_BOXING_PROGRESS);
      expectValidBoxingProgressStructure(state.boxingProgress);
    });

    it("should initialize hyperfocus detection", () => {
      const state = store.getState();

      expect(state.hyperfocusDetection).toBeDefined();
      expect(state.hyperfocusDetection.isActive).toBe(false);
      expect(state.hyperfocusDetection.consecutiveSessions).toBe(0);
    });
  });

  describe("Points System Integration", () => {
    it("should award points and update level", () => {
      const initialState = store.getState();
      expect(initialState.rewardSystem.points).toBe(0);

      store.getState().awardPoints(70, "Natural completion");

      const updatedState = store.getState();
      expect(updatedState.rewardSystem.points).toBe(70);
      // Level calculation is mocked, so it should call the service
    });

    it("should accumulate points from multiple awards", () => {
      store.getState().awardPoints(70, "First session");
      store.getState().awardPoints(10, "Second session");
      store.getState().awardPoints(70, "Third session");

      const state = store.getState();
      expect(state.rewardSystem.points).toBe(150);
    });

    it("should handle zero and negative point awards gracefully", () => {
      store.getState().awardPoints(0, "No points");
      store.getState().awardPoints(-10, "Negative points");

      const state = store.getState();
      expect(state.rewardSystem.points).toBe(-10); // Should allow negative for testing
    });
  });

  describe("Achievement Unlocking", () => {
    it("should unlock achievement by ID", () => {
      const achievementId = "first-bell";
      const mockAchievement = achievementTestScenarios.firstBellAchievement;

      // Mock the service to return our test achievement
      const adhdSupportService =
        require("../services/features/adhd-support-service").adhdSupportService;
      adhdSupportService.getDefaultAchievements.mockReturnValue([
        mockAchievement,
      ]);

      store.getState().unlockAchievement(achievementId);

      const state = store.getState();
      expect(state.rewardSystem.achievements).toHaveLength(1);
      expect(state.rewardSystem.achievements[0].id).toBe(achievementId);
      expect(state.rewardSystem.achievements[0].unlockedAt).toBeInstanceOf(
        Date
      );
      expect(state.rewardSystem.points).toBe(mockAchievement.points);
    });

    it("should not unlock the same achievement twice", () => {
      const achievementId = "first-bell";
      const mockAchievement = achievementTestScenarios.firstBellAchievement;

      const adhdSupportService =
        require("../services/features/adhd-support-service").adhdSupportService;
      adhdSupportService.getDefaultAchievements.mockReturnValue([
        mockAchievement,
      ]);

      // Unlock twice
      store.getState().unlockAchievement(achievementId);
      store.getState().unlockAchievement(achievementId);

      const state = store.getState();
      expect(state.rewardSystem.achievements).toHaveLength(1);
      expect(state.rewardSystem.points).toBe(mockAchievement.points); // Points only awarded once
    });

    it("should handle unlocking non-existent achievement", () => {
      const adhdSupportService =
        require("../services/features/adhd-support-service").adhdSupportService;
      adhdSupportService.getDefaultAchievements.mockReturnValue([]);

      store.getState().unlockAchievement("non-existent");

      const state = store.getState();
      expect(state.rewardSystem.achievements).toHaveLength(0);
      expect(state.rewardSystem.points).toBe(0);
    });
  });

  describe("Boxing Progress Updates", () => {
    it("should update boxing progress from session history", () => {
      const mockProgress = createTestBoxingProgress({
        totalRounds: 5,
        currentStreak: 3,
        totalTrainingTime: 7500,
      });

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );

      store.getState().updateBoxingProgress();

      const state = store.getState();
      expect(state.boxingProgress).toEqual(mockProgress);
      expect(
        boxingAchievementService.calculateBoxingProgress
      ).toHaveBeenCalled();
    });

    it("should check for new achievements when updating boxing progress", () => {
      const mockProgress = createTestBoxingProgress({ totalRounds: 1 });
      const mockNewAchievements = [
        achievementTestScenarios.firstBellAchievement,
      ];

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );
      boxingAchievementService.checkAchievements.mockReturnValue(
        mockNewAchievements
      );
      boxingAchievementService.calculateBoxingLevel.mockReturnValue({
        level: 2,
      });

      store.getState().updateBoxingProgress();

      const state = store.getState();
      expect(state.rewardSystem.achievements).toHaveLength(1);
      expect(state.rewardSystem.points).toBe(mockNewAchievements[0].points);
      expect(state.rewardSystem.level).toBe(2);
    });

    it("should show notifications for new achievements", () => {
      const mockProgress = createTestBoxingProgress({ totalRounds: 1 });
      const mockNewAchievements = [
        achievementTestScenarios.firstBellAchievement,
      ];

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      const boxingNotificationService =
        require("../services/features/boxing-notification-service").boxingNotificationService;

      boxingAchievementService.calculateBoxingProgress.mockReturnValue(
        mockProgress
      );
      boxingAchievementService.checkAchievements.mockReturnValue(
        mockNewAchievements
      );

      store.getState().updateBoxingProgress();

      expect(
        boxingNotificationService.showMultipleAchievements
      ).toHaveBeenCalledWith(mockNewAchievements);
    });
  });

  describe("Reward System Management", () => {
    it("should reset reward system to defaults", () => {
      // First, modify the state
      store.getState().awardPoints(100, "Test");
      store.getState().unlockAchievement("test-achievement");

      // Then reset
      store.getState().resetRewardSystem();

      const state = store.getState();
      expect(state.rewardSystem).toEqual(DEFAULT_REWARD_SYSTEM);
    });

    it("should update daily goal", () => {
      const newGoal = 8;
      store.getState().updateDailyGoal(newGoal);

      const state = store.getState();
      expect(state.rewardSystem.dailyGoal).toBe(newGoal);
    });

    it("should handle invalid daily goal values", () => {
      store.getState().updateDailyGoal(0);
      expect(store.getState().rewardSystem.dailyGoal).toBe(0);

      store.getState().updateDailyGoal(-5);
      expect(store.getState().rewardSystem.dailyGoal).toBe(-5);
    });
  });

  describe("Hyperfocus Detection", () => {
    it("should check hyperfocus status", () => {
      store.getState().checkHyperfocus();

      // The actual logic is in the service, so we just verify it doesn't crash
      const state = store.getState();
      expect(state.hyperfocusDetection).toBeDefined();
    });

    it("should reset hyperfocus warning", () => {
      store.getState().resetHyperfocusWarning();

      const state = store.getState();
      expect(state.hyperfocusDetection.warningShown).toBe(false);
    });

    it("should update hyperfocus detection settings", () => {
      const updates = {
        isActive: true,
        consecutiveSessions: 3,
        warningShown: true,
      };

      store.getState().updateHyperfocusDetection(updates);

      const state = store.getState();
      expect(state.hyperfocusDetection.isActive).toBe(true);
      expect(state.hyperfocusDetection.consecutiveSessions).toBe(3);
      expect(state.hyperfocusDetection.warningShown).toBe(true);
    });
  });

  describe("Break Activities Management", () => {
    it("should initialize with default break activities", () => {
      const state = store.getState();
      expect(Array.isArray(state.breakActivities)).toBe(true);
    });

    it("should set current break activity", () => {
      const activity = {
        id: "test-activity",
        name: "Test Activity",
        duration: 300,
        type: "movement" as const,
        instructions: ["Test instruction 1", "Test instruction 2"],
        icon: "test-icon" as any,
        adhdBenefit: "Test ADHD benefit",
        difficulty: "easy" as const,
      };

      store.getState().setCurrentBreakActivity(activity);

      const state = store.getState();
      expect(state.currentBreakActivity).toEqual(activity);
    });

    it("should clear current break activity", () => {
      const activity = {
        id: "test-activity",
        name: "Test Activity",
        duration: 300,
        type: "movement" as const,
        instructions: ["Test instruction 1", "Test instruction 2"],
        icon: "test-icon" as any,
        adhdBenefit: "Test ADHD benefit",
        difficulty: "easy" as const,
      };

      store.getState().setCurrentBreakActivity(activity);
      store.getState().clearCurrentBreakActivity();

      const state = store.getState();
      expect(state.currentBreakActivity).toBeUndefined();
    });
  });

  describe("Boxing Achievement Methods", () => {
    it("should get boxing achievements", () => {
      const mockAchievements = [achievementTestScenarios.firstBellAchievement];

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.getBoxingAchievements.mockReturnValue(
        mockAchievements
      );

      const achievements = store.getState().getBoxingAchievements();
      expect(achievements).toEqual(mockAchievements);
    });

    it("should get achievement stats", () => {
      // Add some achievements to the state first
      const mockAchievement = {
        ...achievementTestScenarios.firstBellAchievement,
        unlockedAt: new Date(),
      };
      store.setState({
        rewardSystem: {
          ...DEFAULT_REWARD_SYSTEM,
          achievements: [mockAchievement],
          points: 100,
        },
      });

      const stats = store.getState().getAchievementStats();
      expect(stats).toBeDefined();
      expect(stats.unlockedAchievements).toBeGreaterThan(0);
      expect(stats.totalPoints).toBe(100);
    });

    it("should get boxing level", () => {
      const mockLevel = { level: 2, title: "Amateur" };

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingLevel.mockReturnValue(mockLevel);

      const level = store.getState().getBoxingLevel();
      expect(level).toEqual(mockLevel);
    });

    it("should get next boxing level", () => {
      const currentLevel = { level: 2, title: "Amateur" };
      const nextLevel = { level: 3, title: "Professional" };

      const boxingAchievementService =
        require("../services/features/boxing-achievement-service").boxingAchievementService;
      boxingAchievementService.calculateBoxingLevel.mockReturnValue(
        currentLevel
      );
      boxingAchievementService.getBoxingLevels.mockReturnValue([
        { level: 1, title: "Rookie" },
        currentLevel,
        nextLevel,
      ]);

      const next = store.getState().getNextBoxingLevel();
      expect(next).toEqual(nextLevel);
    });
  });
});
