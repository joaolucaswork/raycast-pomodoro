import {
  MoodEntry,
  MoodType,
  MoodAnalytics,
  TimerSession,
} from "../../types/timer";
import { moodAnalyticsService } from "./mood-analytics-service";
import { moodValidationService } from "./mood-validation-service";
import { moodStorageService } from "./mood-storage-service";
import { moodCorrelationService } from "./mood-correlation-service";

/**
 * Facade service for mood tracking functionality.
 *
 * This service provides a unified interface to mood tracking functionality by
 * coordinating between specialized services:
 * - MoodAnalyticsService: Analytics and trend calculations
 * - MoodValidationService: Data validation and recommendations
 * - MoodStorageService: Data storage and retrieval
 * - MoodCorrelationService: Productivity correlation analysis
 *
 * Features:
 * - Real-time mood analytics calculation
 * - Weekly and monthly trend analysis
 * - Productivity correlation insights
 * - Personalized improvement suggestions
 * - Privacy-first design with local data storage only
 */
export class MoodTrackingService {
  private static instance: MoodTrackingService;

  private constructor() {}

  public static getInstance(): MoodTrackingService {
    if (!MoodTrackingService.instance) {
      MoodTrackingService.instance = new MoodTrackingService();
    }
    return MoodTrackingService.instance;
  }

  /**
   * Calculate comprehensive mood analytics from mood entries
   */
  public calculateMoodAnalytics(
    moodEntries: MoodEntry[],
    sessions: TimerSession[] = []
  ): MoodAnalytics {
    const analytics = moodAnalyticsService.calculateMoodAnalytics(
      moodEntries,
      sessions
    );
    const correlationWithProductivity =
      moodCorrelationService.calculateProductivityCorrelation(
        moodEntries,
        sessions
      );
    const bestPerformanceMoods = moodCorrelationService.getBestPerformanceMoods(
      moodEntries,
      sessions
    );
    const improvementSuggestions =
      moodValidationService.generateImprovementSuggestions(
        moodEntries,
        sessions
      );

    return {
      ...analytics,
      correlationWithProductivity,
      bestPerformanceMoods,
      improvementSuggestions,
    };
  }

  /**
   * Get mood entries for a specific date range
   */
  public getMoodEntriesInRange(
    moodEntries: MoodEntry[],
    startDate: Date,
    endDate: Date
  ): MoodEntry[] {
    return moodStorageService.getMoodEntriesInRange(
      moodEntries,
      startDate,
      endDate
    );
  }

  /**
   * Get mood entries for today
   */
  public getTodaysMoodEntries(moodEntries: MoodEntry[]): MoodEntry[] {
    return moodStorageService.getTodaysMoodEntries(moodEntries);
  }

  /**
   * Get mood entries for this week
   */
  public getWeeklyMoodEntries(moodEntries: MoodEntry[]): MoodEntry[] {
    return moodStorageService.getThisWeeksMoodEntries(moodEntries);
  }

  /**
   * Validate mood entry data
   */
  public validateMoodEntry(
    mood: MoodType,
    intensity: number,
    context: string
  ): { isValid: boolean; errors: string[] } {
    return moodValidationService.validateMoodEntry(mood, intensity, context);
  }

  /**
   * Get mood recommendations based on current state and history
   */
  public getMoodRecommendations(
    currentMood: MoodType,
    intensity: number,
    recentEntries: MoodEntry[]
  ): string[] {
    return moodValidationService.getMoodRecommendations(
      currentMood,
      intensity,
      recentEntries
    );
  }

  /**
   * Get detailed mood-productivity correlation insights
   */
  public getMoodProductivityInsights(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
  ): {
    optimalMoodTimes: { hour: number; mood: MoodType; productivity: number }[];
    moodSessionCorrelation: {
      mood: MoodType;
      avgDuration: number;
      completionRate: number;
    }[];
    energyLevelImpact: {
      level: number;
      avgFocusQuality: number;
      completionRate: number;
    }[];
    contextualInsights: {
      context: string;
      bestMoods: MoodType[];
      avgProductivity: number;
    }[];
  } {
    return moodCorrelationService.getMoodProductivityInsights(
      moodEntries,
      sessions
    );
  }

  /**
   * Get mood recommendations for upcoming session based on current state
   */
  public getSessionMoodRecommendations(
    currentMood: MoodType,
    intensity: number,
    timeOfDay: number,
    recentEntries: MoodEntry[],
    historicalData: { moodEntries: MoodEntry[]; sessions: TimerSession[] }
  ): {
    recommendedDuration: number;
    sessionType: "short" | "normal" | "extended";
    breakRecommendation: string;
    focusStrategy: string;
    confidenceScore: number;
  } {
    return moodValidationService.getSessionMoodRecommendations(
      currentMood,
      intensity,
      timeOfDay,
      recentEntries,
      historicalData
    );
  }
}

export const moodTrackingService = MoodTrackingService.getInstance();
