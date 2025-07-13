import {
  MoodEntry,
  MoodType,
  MoodAnalytics,
  TimerSession,
} from "../types/timer";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  subDays,
  eachDayOfInterval,
} from "date-fns";

/**
 * Service for mood analytics and trend calculations.
 * 
 * Handles:
 * - Mood analytics calculation
 * - Trend analysis and pattern recognition
 * - Statistical calculations
 * - Weekly/monthly trend analysis
 */
export class MoodAnalyticsService {
  private static instance: MoodAnalyticsService;

  private constructor() {}

  public static getInstance(): MoodAnalyticsService {
    if (!MoodAnalyticsService.instance) {
      MoodAnalyticsService.instance = new MoodAnalyticsService();
    }
    return MoodAnalyticsService.instance;
  }

  /**
   * Calculate comprehensive mood analytics from mood entries
   */
  public calculateMoodAnalytics(
    moodEntries: MoodEntry[],
    sessions: TimerSession[] = [],
  ): MoodAnalytics {
    if (moodEntries.length === 0) {
      return this.getEmptyAnalytics();
    }

    const totalEntries = moodEntries.length;
    const averageIntensity = this.calculateAverageIntensity(moodEntries);
    const mostCommonMood = this.getMostCommonMood(moodEntries);
    const moodDistribution = this.calculateMoodDistribution(moodEntries);
    const weeklyTrend = this.calculateWeeklyTrend(moodEntries);

    return {
      totalEntries,
      averageIntensity,
      mostCommonMood,
      moodDistribution,
      weeklyTrend,
      correlationWithProductivity: [], // Handled by correlation service
      bestPerformanceMoods: [], // Handled by correlation service
      improvementSuggestions: [], // Handled by validation service
    };
  }

  /**
   * Calculate average mood intensity
   */
  public calculateAverageIntensity(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.intensity, 0);
    return Math.round((sum / moodEntries.length) * 10) / 10;
  }

  /**
   * Get the most common mood from entries
   */
  public getMostCommonMood(moodEntries: MoodEntry[]): MoodType {
    if (moodEntries.length === 0) return "neutral";

    const moodCounts: Record<string, number> = {};
    moodEntries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    return Object.entries(moodCounts).reduce((a, b) =>
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b,
    )[0] as MoodType;
  }

  /**
   * Calculate mood distribution percentages
   */
  public calculateMoodDistribution(moodEntries: MoodEntry[]): Record<MoodType, number> {
    const distribution: Record<string, number> = {};
    const total = moodEntries.length;

    if (total === 0) {
      return {} as Record<MoodType, number>;
    }

    moodEntries.forEach((entry) => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
    });

    // Convert counts to percentages
    Object.keys(distribution).forEach((mood) => {
      distribution[mood] = Math.round((distribution[mood] / total) * 100);
    });

    return distribution as Record<MoodType, number>;
  }

  /**
   * Calculate weekly mood trend
   */
  public calculateWeeklyTrend(moodEntries: MoodEntry[]): Array<{
    date: string;
    averageIntensity: number;
    mostCommonMood: MoodType;
    entryCount: number;
  }> {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayEntries = moodEntries.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });

      return {
        date: format(day, "yyyy-MM-dd"),
        averageIntensity: this.calculateAverageIntensity(dayEntries),
        mostCommonMood: this.getMostCommonMood(dayEntries),
        entryCount: dayEntries.length,
      };
    });
  }

  /**
   * Get optimal mood times analysis
   */
  public calculateOptimalMoodTimes(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
  ): { hour: number; mood: MoodType; productivity: number }[] {
    const hourlyData: Record<
      number,
      { moods: MoodType[]; productivity: number[] }
    > = {};

    sessions.forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      const relatedMood = moodEntries.find(
        (entry) =>
          entry.sessionId === session.id ||
          Math.abs(
            new Date(entry.timestamp).getTime() -
              new Date(session.startTime).getTime(),
          ) <
            30 * 60 * 1000,
      );

      if (relatedMood) {
        if (!hourlyData[hour]) {
          hourlyData[hour] = { moods: [], productivity: [] };
        }
        hourlyData[hour].moods.push(relatedMood.mood);
        hourlyData[hour].productivity.push(session.completed ? 1 : 0);
      }
    });

    return Object.entries(hourlyData)
      .map(([hour, data]) => {
        const mostCommonMood = data.moods.reduce((a, b, _, arr) =>
          arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
            ? a
            : b,
        );
        const avgProductivity =
          data.productivity.reduce((a, b) => a + b, 0) /
          data.productivity.length;

        return {
          hour: parseInt(hour),
          mood: mostCommonMood,
          productivity: Math.round(avgProductivity * 100),
        };
      })
      .sort((a, b) => b.productivity - a.productivity);
  }

  /**
   * Calculate energy level impact on performance
   */
  public calculateEnergyLevelImpact(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
  ): { level: number; avgFocusQuality: number; completionRate: number }[] {
    const energyLevels = [1, 2, 3, 4, 5];

    return energyLevels
      .map((level) => {
        const levelSessions = sessions.filter((session) => {
          const relatedMood = moodEntries.find(
            (entry) =>
              entry.sessionId === session.id && entry.intensity === level,
          );
          return relatedMood;
        });

        const avgFocusQuality =
          levelSessions.length > 0
            ? levelSessions.reduce((acc, s) => acc + (s.focusQuality || 3), 0) /
              levelSessions.length
            : 0;

        const completionRate =
          levelSessions.length > 0
            ? (levelSessions.filter((s) => s.completed).length /
                levelSessions.length) *
              100
            : 0;

        return {
          level,
          avgFocusQuality: Math.round(avgFocusQuality * 10) / 10,
          completionRate: Math.round(completionRate),
        };
      })
      .filter((impact) => impact.avgFocusQuality > 0);
  }

  private getEmptyAnalytics(): MoodAnalytics {
    return {
      totalEntries: 0,
      averageIntensity: 0,
      mostCommonMood: "neutral",
      moodDistribution: {} as Record<MoodType, number>,
      weeklyTrend: [],
      correlationWithProductivity: [],
      bestPerformanceMoods: [],
      improvementSuggestions: [
        "Start tracking your mood to see personalized insights",
      ],
    };
  }
}

export const moodAnalyticsService = MoodAnalyticsService.getInstance();
