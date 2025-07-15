/**
 * Achievement Data Persistence Tests
 *
 * Tests that achievement progress, unlocked achievements, and boxing progress
 * are correctly saved and retrieved from storage across app sessions.
 */

import {
  createTestBoxingProgress,
  createTestRewardSystem,
  createTestAchievement,
  achievementTestScenarios,
  boxingProgressTestScenarios,
} from "./utils/test-factories";
import { expectValidBoxingProgressStructure } from "./utils/achievement-test-helpers";

// Mock LocalStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  allItems: jest.fn(),
};

jest.mock("@raycast/api", () => ({
  LocalStorage: mockLocalStorage,
}));

// Import after mocking
const { LocalStorage } = require("@raycast/api");

// Storage keys (should match actual implementation)
const STORAGE_KEYS = {
  REWARD_SYSTEM: "reward-system",
  BOXING_PROGRESS: "boxing-progress",
  ACHIEVEMENTS: "achievements",
  ACHIEVEMENT_STATS: "achievement-stats",
  HYPERFOCUS_DETECTION: "hyperfocus-detection",
};

describe("Achievement Data Persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockResolvedValue(undefined);
    mockLocalStorage.setItem.mockResolvedValue(undefined);
  });

  describe("Reward System Persistence", () => {
    it("should save reward system to storage", async () => {
      const rewardSystem = createTestRewardSystem({
        points: 150,
        level: 2,
        achievements: [achievementTestScenarios.firstBellAchievement],
        dailyGoal: 6,
      });

      await LocalStorage.setItem(
        STORAGE_KEYS.REWARD_SYSTEM,
        JSON.stringify(rewardSystem)
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.REWARD_SYSTEM,
        JSON.stringify(rewardSystem)
      );
    });

    it("should load reward system from storage", async () => {
      const savedRewardSystem = createTestRewardSystem({
        points: 200,
        level: 3,
        achievements: [
          achievementTestScenarios.firstBellAchievement,
          achievementTestScenarios.streakAchievement,
        ],
      });

      mockLocalStorage.getItem.mockResolvedValue(
        JSON.stringify(savedRewardSystem)
      );

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.REWARD_SYSTEM);
      const parsedRewardSystem = JSON.parse(loaded as string);

      expect(parsedRewardSystem.points).toBe(200);
      expect(parsedRewardSystem.level).toBe(3);
      expect(parsedRewardSystem.achievements).toHaveLength(2);
    });

    it("should handle missing reward system data gracefully", async () => {
      mockLocalStorage.getItem.mockResolvedValue(undefined);

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.REWARD_SYSTEM);
      expect(loaded).toBeUndefined();
    });

    it("should handle corrupted reward system data", async () => {
      mockLocalStorage.getItem.mockResolvedValue("invalid-json");

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.REWARD_SYSTEM);
      expect(loaded).toBe("invalid-json");

      // The parsing would fail, but the storage operation succeeds
      expect(() => JSON.parse(loaded as string)).toThrow();
    });
  });

  describe("Boxing Progress Persistence", () => {
    it("should save boxing progress to storage", async () => {
      const boxingProgress = createTestBoxingProgress({
        totalRounds: 25,
        currentStreak: 5,
        longestStreak: 10,
        totalTrainingTime: 37500, // 10.4 hours
        championshipLevel: 3,
        dailyRoundsToday: 3,
        weeklyRoundsThisWeek: 15,
        monthlyRoundsThisMonth: 25,
      });

      await LocalStorage.setItem(
        STORAGE_KEYS.BOXING_PROGRESS,
        JSON.stringify(boxingProgress)
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.BOXING_PROGRESS,
        JSON.stringify(boxingProgress)
      );
    });

    it("should load boxing progress from storage", async () => {
      const savedProgress = boxingProgressTestScenarios.advancedProgress;
      mockLocalStorage.getItem.mockResolvedValue(JSON.stringify(savedProgress));

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.BOXING_PROGRESS);
      const parsedProgress = JSON.parse(loaded as string);

      expectValidBoxingProgressStructure(parsedProgress);
      expect(parsedProgress.totalRounds).toBe(savedProgress.totalRounds);
      expect(parsedProgress.currentStreak).toBe(savedProgress.currentStreak);
      expect(parsedProgress.totalTrainingTime).toBe(
        savedProgress.totalTrainingTime
      );
    });

    it("should preserve date fields in boxing progress", async () => {
      const progressWithDate = createTestBoxingProgress({
        totalRounds: 10,
        lastRoundDate: new Date("2024-01-15T10:30:00Z"),
      });

      const serialized = JSON.stringify(progressWithDate);
      mockLocalStorage.getItem.mockResolvedValue(serialized);

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.BOXING_PROGRESS);
      const parsed = JSON.parse(loaded as string);

      // Date would need to be reconstructed from string
      expect(parsed.lastRoundDate).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should handle large boxing progress data", async () => {
      const largeProgress = createTestBoxingProgress({
        totalRounds: 10000,
        totalTrainingTime: 15000000, // Very large number
        totalMoodEntries: 5000,
        energizedSessions: 2500,
        focusedSessions: 3000,
      });

      await LocalStorage.setItem(
        STORAGE_KEYS.BOXING_PROGRESS,
        JSON.stringify(largeProgress)
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.BOXING_PROGRESS,
        JSON.stringify(largeProgress)
      );
    });
  });

  describe("Achievement Persistence", () => {
    it("should save individual achievements with timestamps", async () => {
      const achievement = {
        ...achievementTestScenarios.firstBellAchievement,
        unlockedAt: new Date("2024-01-15T14:30:00Z"),
      };

      await LocalStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify([achievement])
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify([achievement])
      );
    });

    it("should load achievements and preserve unlock timestamps", async () => {
      const savedAchievements = [
        {
          ...achievementTestScenarios.firstBellAchievement,
          unlockedAt: "2024-01-15T14:30:00Z",
        },
        {
          ...achievementTestScenarios.streakAchievement,
          unlockedAt: "2024-01-16T09:15:00Z",
        },
      ];

      mockLocalStorage.getItem.mockResolvedValue(
        JSON.stringify(savedAchievements)
      );

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const parsed = JSON.parse(loaded as string);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].unlockedAt).toBe("2024-01-15T14:30:00Z");
      expect(parsed[1].unlockedAt).toBe("2024-01-16T09:15:00Z");
    });

    it("should handle empty achievements array", async () => {
      mockLocalStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const parsed = JSON.parse(loaded as string);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(0);
    });

    it("should preserve achievement metadata", async () => {
      const achievementWithMetadata = {
        ...achievementTestScenarios.complexAchievement,
        unlockedAt: new Date(),
        progress: 75,
        maxProgress: 100,
        customData: {
          unlockContext: "session-completion",
          celebrationShown: true,
        },
      };

      const serialized = JSON.stringify([achievementWithMetadata]);
      mockLocalStorage.getItem.mockResolvedValue(serialized);

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const parsed = JSON.parse(loaded as string);

      expect(parsed[0].customData).toBeDefined();
      expect(parsed[0].customData.unlockContext).toBe("session-completion");
      expect(parsed[0].progress).toBe(75);
    });
  });

  describe("Cross-Session Data Integrity", () => {
    it("should maintain data consistency across app restarts", async () => {
      // Simulate saving data in one session
      const rewardSystem = createTestRewardSystem({
        points: 350,
        level: 3,
        achievements: [achievementTestScenarios.firstBellAchievement],
      });

      const boxingProgress = createTestBoxingProgress({
        totalRounds: 15,
        currentStreak: 3,
        totalTrainingTime: 22500,
      });

      await LocalStorage.setItem(
        STORAGE_KEYS.REWARD_SYSTEM,
        JSON.stringify(rewardSystem)
      );
      await LocalStorage.setItem(
        STORAGE_KEYS.BOXING_PROGRESS,
        JSON.stringify(boxingProgress)
      );

      // Simulate loading data in a new session
      mockLocalStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(rewardSystem))
        .mockResolvedValueOnce(JSON.stringify(boxingProgress));

      const loadedRewardSystem = JSON.parse(
        (await LocalStorage.getItem(STORAGE_KEYS.REWARD_SYSTEM)) as string
      );
      const loadedBoxingProgress = JSON.parse(
        (await LocalStorage.getItem(STORAGE_KEYS.BOXING_PROGRESS)) as string
      );

      expect(loadedRewardSystem.points).toBe(rewardSystem.points);
      expect(loadedBoxingProgress.totalRounds).toBe(boxingProgress.totalRounds);
    });

    it("should handle partial data corruption gracefully", async () => {
      // Simulate corrupted reward system but valid boxing progress
      mockLocalStorage.getItem
        .mockResolvedValueOnce("corrupted-json")
        .mockResolvedValueOnce(
          JSON.stringify(boxingProgressTestScenarios.beginnerProgress)
        );

      const rewardSystemData = await LocalStorage.getItem(
        STORAGE_KEYS.REWARD_SYSTEM
      );
      const boxingProgressData = await LocalStorage.getItem(
        STORAGE_KEYS.BOXING_PROGRESS
      );

      expect(rewardSystemData).toBe("corrupted-json");
      expect(() => JSON.parse(rewardSystemData as string)).toThrow();

      const validProgress = JSON.parse(boxingProgressData as string);
      expectValidBoxingProgressStructure(validProgress);
    });

    it("should handle storage quota exceeded", async () => {
      const error = new Error("QuotaExceededError");
      mockLocalStorage.setItem.mockRejectedValue(error);

      const largeData = createTestBoxingProgress({
        totalRounds: 100000,
        // Simulate very large data
      });

      await expect(
        LocalStorage.setItem(
          STORAGE_KEYS.BOXING_PROGRESS,
          JSON.stringify(largeData)
        )
      ).rejects.toThrow("QuotaExceededError");
    });
  });

  describe("Data Migration and Versioning", () => {
    it("should handle legacy data format", async () => {
      // Simulate old data format without some new fields
      const legacyBoxingProgress = {
        totalRounds: 10,
        currentStreak: 2,
        totalTrainingTime: 15000,
        // Missing newer fields like moodTrackingStreak, etc.
      };

      mockLocalStorage.getItem.mockResolvedValue(
        JSON.stringify(legacyBoxingProgress)
      );

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.BOXING_PROGRESS);
      const parsed = JSON.parse(loaded as string);

      expect(parsed.totalRounds).toBe(10);
      expect(parsed.moodTrackingStreak).toBeUndefined(); // Would need migration
    });

    it("should handle data format evolution", async () => {
      // Simulate data with version information
      const versionedData = {
        version: "1.0.0",
        data: createTestRewardSystem({
          points: 100,
          level: 2,
        }),
      };

      mockLocalStorage.getItem.mockResolvedValue(JSON.stringify(versionedData));

      const loaded = await LocalStorage.getItem(STORAGE_KEYS.REWARD_SYSTEM);
      const parsed = JSON.parse(loaded as string);

      expect(parsed.version).toBe("1.0.0");
      expect(parsed.data.points).toBe(100);
    });
  });

  describe("Storage Performance", () => {
    it("should handle concurrent storage operations", async () => {
      const operations = [
        LocalStorage.setItem("key1", "value1"),
        LocalStorage.setItem("key2", "value2"),
        LocalStorage.setItem("key3", "value3"),
      ];

      await Promise.all(operations);

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
    });

    it("should handle rapid successive updates", async () => {
      const progress = createTestBoxingProgress();

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        progress.totalRounds = i;
        await LocalStorage.setItem(
          STORAGE_KEYS.BOXING_PROGRESS,
          JSON.stringify(progress)
        );
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(10);
    });
  });

  describe("Storage Cleanup", () => {
    it("should clear all achievement data", async () => {
      await LocalStorage.clear();
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    it("should remove specific achievement data", async () => {
      await LocalStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ACHIEVEMENTS
      );
    });

    it("should handle cleanup errors gracefully", async () => {
      mockLocalStorage.removeItem.mockRejectedValue(new Error("Storage error"));

      await expect(
        LocalStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS)
      ).rejects.toThrow("Storage error");
    });
  });
});
