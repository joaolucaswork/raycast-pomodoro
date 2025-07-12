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
 * Service for mood tracking and analytics.
 *
 * This service provides comprehensive mood tracking functionality including:
 * - Mood entry management and validation
 * - Trend analysis and pattern recognition
 * - Correlation with session productivity and focus quality
 * - ADHD-friendly insights and recommendations
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
    const correlationWithProductivity = this.calculateProductivityCorrelation(
      moodEntries,
      sessions,
    );
    const bestPerformanceMoods = this.getBestPerformanceMoods(
      moodEntries,
      sessions,
    );
    const improvementSuggestions = this.generateImprovementSuggestions(
      moodEntries,
      sessions,
    );

    return {
      totalEntries,
      averageIntensity,
      mostCommonMood,
      moodDistribution,
      weeklyTrend,
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
    endDate: Date,
  ): MoodEntry[] {
    return moodEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Get mood entries for today
   */
  public getTodaysMoodEntries(moodEntries: MoodEntry[]): MoodEntry[] {
    const today = new Date();
    return this.getMoodEntriesInRange(
      moodEntries,
      startOfDay(today),
      endOfDay(today),
    );
  }

  /**
   * Get mood entries for this week
   */
  public getWeeklyMoodEntries(moodEntries: MoodEntry[]): MoodEntry[] {
    const today = new Date();
    return this.getMoodEntriesInRange(
      moodEntries,
      startOfWeek(today, { weekStartsOn: 1 }),
      endOfWeek(today, { weekStartsOn: 1 }),
    );
  }

  /**
   * Validate mood entry data
   */
  public validateMoodEntry(
    mood: MoodType,
    intensity: number,
    context: string,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate mood type
    const validMoods: MoodType[] = [
      "energized",
      "focused",
      "calm",
      "motivated",
      "neutral",
      "tired",
      "stressed",
      "overwhelmed",
      "distracted",
    ];
    if (!validMoods.includes(mood)) {
      errors.push("Invalid mood type");
    }

    // Validate intensity
    if (intensity < 1 || intensity > 5 || !Number.isInteger(intensity)) {
      errors.push("Intensity must be an integer between 1 and 5");
    }

    // Validate context
    const validContexts = [
      "pre-session",
      "during-session",
      "post-session",
      "standalone",
    ];
    if (!validContexts.includes(context)) {
      errors.push("Invalid context");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get mood recommendations based on current state and history
   */
  public getMoodRecommendations(
    currentMood: MoodType,
    intensity: number,
    recentEntries: MoodEntry[],
  ): string[] {
    const recommendations: string[] = [];

    // High stress recommendations
    if (currentMood === "stressed" || currentMood === "overwhelmed") {
      if (intensity >= 4) {
        recommendations.push(
          "Consider taking a longer break before starting your next session",
        );
        recommendations.push(
          "Try a 5-minute breathing exercise or mindfulness activity",
        );
      }
      recommendations.push(
        "Reduce session duration by 25-50% to prevent burnout",
      );
    }

    // Low energy recommendations
    if (currentMood === "tired" && intensity >= 3) {
      recommendations.push("Consider shorter 15-20 minute sessions");
      recommendations.push(
        "Take a brief walk or do light stretching before focusing",
      );
    }

    // Optimal state recommendations
    if (
      (currentMood === "focused" || currentMood === "energized") &&
      intensity >= 4
    ) {
      recommendations.push("This is a great time for challenging tasks");
      recommendations.push(
        "Consider extending your session duration by 20-30%",
      );
    }

    // Pattern-based recommendations
    const recentStressfulMoods = recentEntries.filter(
      (entry) =>
        ["stressed", "overwhelmed"].includes(entry.mood) &&
        entry.intensity >= 3,
    );
    if (recentStressfulMoods.length >= 3) {
      recommendations.push(
        "You've been experiencing stress lately - consider adjusting your daily goals",
      );
    }

    return recommendations;
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

  private calculateAverageIntensity(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.intensity, 0);
    return Math.round((sum / moodEntries.length) * 10) / 10;
  }

  private getMostCommonMood(moodEntries: MoodEntry[]): MoodType {
    const moodCounts = this.calculateMoodDistribution(moodEntries);
    return Object.entries(moodCounts).reduce((a, b) =>
      moodCounts[a[0] as MoodType] > moodCounts[b[0] as MoodType] ? a : b,
    )[0] as MoodType;
  }

  private calculateMoodDistribution(
    moodEntries: MoodEntry[],
  ): Record<MoodType, number> {
    const distribution = {} as Record<MoodType, number>;

    moodEntries.forEach((entry) => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
    });

    return distribution;
  }

  private calculateWeeklyTrend(
    moodEntries: MoodEntry[],
  ): MoodAnalytics["weeklyTrend"] {
    const sevenDaysAgo = subDays(new Date(), 7);
    const today = new Date();
    const days = eachDayOfInterval({ start: sevenDaysAgo, end: today });

    return days.map((date) => {
      const dayEntries = this.getMoodEntriesInRange(
        moodEntries,
        startOfDay(date),
        endOfDay(date),
      );

      const averageMood =
        dayEntries.length > 0 ? this.calculateAverageIntensity(dayEntries) : 0;

      return {
        date: format(date, "yyyy-MM-dd"),
        averageMood,
        entryCount: dayEntries.length,
      };
    });
  }

  private calculateProductivityCorrelation(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
  ): MoodAnalytics["correlationWithProductivity"] {
    const moodTypes: MoodType[] = [
      "energized",
      "focused",
      "calm",
      "motivated",
      "neutral",
      "tired",
      "stressed",
      "overwhelmed",
      "distracted",
    ];

    return moodTypes
      .map((mood) => {
        const moodSessions = sessions.filter((session) => {
          const relatedMoodEntry = moodEntries.find(
            (entry) =>
              entry.sessionId === session.id ||
              Math.abs(
                new Date(entry.timestamp).getTime() -
                  new Date(session.startTime).getTime(),
              ) <
                30 * 60 * 1000,
          );
          return relatedMoodEntry?.mood === mood;
        });

        const completionRate =
          moodSessions.length > 0
            ? (moodSessions.filter((s) => s.completed).length /
                moodSessions.length) *
              100
            : 0;

        const averageFocusQuality =
          moodSessions.length > 0
            ? moodSessions.reduce((acc, s) => acc + (s.focusQuality || 3), 0) /
              moodSessions.length
            : 0;

        return {
          mood,
          averageSessionCompletion: Math.round(completionRate),
          averageFocusQuality: Math.round(averageFocusQuality * 10) / 10,
        };
      })
      .filter((correlation) => correlation.averageSessionCompletion > 0);
  }

  private getBestPerformanceMoods(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
  ): MoodType[] {
    const correlations = this.calculateProductivityCorrelation(
      moodEntries,
      sessions,
    );

    return correlations
      .filter(
        (c) => c.averageSessionCompletion >= 80 && c.averageFocusQuality >= 4,
      )
      .sort((a, b) => b.averageSessionCompletion - a.averageSessionCompletion)
      .slice(0, 3)
      .map((c) => c.mood);
  }

  /**
   * Get detailed mood-productivity correlation insights
   */
  public getMoodProductivityInsights(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
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
    const optimalMoodTimes = this.calculateOptimalMoodTimes(
      moodEntries,
      sessions,
    );
    const moodSessionCorrelation = this.calculateMoodSessionCorrelation(
      moodEntries,
      sessions,
    );
    const energyLevelImpact = this.calculateEnergyLevelImpact(
      moodEntries,
      sessions,
    );
    const contextualInsights = this.calculateContextualInsights(
      moodEntries,
      sessions,
    );

    return {
      optimalMoodTimes,
      moodSessionCorrelation,
      energyLevelImpact,
      contextualInsights,
    };
  }

  /**
   * Get mood recommendations for upcoming session based on current state
   */
  public getSessionMoodRecommendations(
    currentMood: MoodType,
    intensity: number,
    timeOfDay: number,
    recentEntries: MoodEntry[],
    historicalData: { moodEntries: MoodEntry[]; sessions: TimerSession[] },
  ): {
    recommendedDuration: number;
    sessionType: "short" | "normal" | "extended";
    breakRecommendation: string;
    focusStrategy: string;
    confidenceScore: number;
  } {
    const insights = this.getMoodProductivityInsights(
      historicalData.moodEntries,
      historicalData.sessions,
    );

    // Find similar mood patterns in historical data
    const similarMoodSessions = historicalData.sessions.filter((session) => {
      const relatedMood = historicalData.moodEntries.find(
        (entry) => entry.sessionId === session.id && entry.mood === currentMood,
      );
      return relatedMood && Math.abs(relatedMood.intensity - intensity) <= 1;
    });

    const avgDuration =
      similarMoodSessions.length > 0
        ? similarMoodSessions.reduce((acc, s) => acc + s.duration, 0) /
          similarMoodSessions.length /
          60
        : 25; // Default 25 minutes

    const completionRate =
      similarMoodSessions.length > 0
        ? similarMoodSessions.filter((s) => s.completed).length /
          similarMoodSessions.length
        : 0.7; // Default 70%

    let recommendedDuration = avgDuration;
    let sessionType: "short" | "normal" | "extended" = "normal";
    let breakRecommendation = "Take a 5-minute break";
    let focusStrategy = "Use standard focus techniques";

    // Adjust based on current mood and intensity
    if (["stressed", "overwhelmed"].includes(currentMood) && intensity >= 3) {
      recommendedDuration = Math.max(15, avgDuration * 0.7);
      sessionType = "short";
      breakRecommendation = "Take a 10-minute mindfulness break";
      focusStrategy =
        "Break tasks into smaller chunks, use breathing exercises";
    } else if (
      ["energized", "motivated"].includes(currentMood) &&
      intensity >= 4
    ) {
      recommendedDuration = Math.min(45, avgDuration * 1.3);
      sessionType = "extended";
      breakRecommendation = "Take a 5-minute active break";
      focusStrategy = "Tackle challenging tasks, maintain momentum";
    } else if (currentMood === "tired" && intensity >= 3) {
      recommendedDuration = Math.max(15, avgDuration * 0.8);
      sessionType = "short";
      breakRecommendation = "Take a 15-minute energizing break";
      focusStrategy =
        "Focus on easier tasks, consider caffeine or light exercise";
    }

    const confidenceScore = Math.min(
      0.95,
      Math.max(0.3, similarMoodSessions.length / 10),
    );

    return {
      recommendedDuration: Math.round(recommendedDuration),
      sessionType,
      breakRecommendation,
      focusStrategy,
      confidenceScore,
    };
  }

  private calculateOptimalMoodTimes(
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

  private calculateMoodSessionCorrelation(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
  ): { mood: MoodType; avgDuration: number; completionRate: number }[] {
    const moodTypes: MoodType[] = [
      "energized",
      "focused",
      "calm",
      "motivated",
      "neutral",
      "tired",
      "stressed",
      "overwhelmed",
      "distracted",
    ];

    return moodTypes
      .map((mood) => {
        const moodSessions = sessions.filter((session) => {
          const relatedMood = moodEntries.find(
            (entry) => entry.sessionId === session.id && entry.mood === mood,
          );
          return relatedMood;
        });

        const avgDuration =
          moodSessions.length > 0
            ? moodSessions.reduce((acc, s) => acc + s.duration, 0) /
              moodSessions.length /
              60
            : 0;

        const completionRate =
          moodSessions.length > 0
            ? (moodSessions.filter((s) => s.completed).length /
                moodSessions.length) *
              100
            : 0;

        return {
          mood,
          avgDuration: Math.round(avgDuration * 10) / 10,
          completionRate: Math.round(completionRate),
        };
      })
      .filter((correlation) => correlation.avgDuration > 0);
  }

  private calculateEnergyLevelImpact(
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

  private calculateContextualInsights(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
  ): { context: string; bestMoods: MoodType[]; avgProductivity: number }[] {
    const contexts = [
      "pre-session",
      "during-session",
      "post-session",
      "standalone",
    ];

    return contexts
      .map((context) => {
        const contextEntries = moodEntries.filter(
          (entry) => entry.context === context,
        );
        const contextSessions = sessions.filter((session) =>
          contextEntries.some((entry) => entry.sessionId === session.id),
        );

        const moodProductivity: Record<MoodType, number[]> = {} as Record<
          MoodType,
          number[]
        >;

        contextSessions.forEach((session) => {
          const relatedMood = contextEntries.find(
            (entry) => entry.sessionId === session.id,
          );
          if (relatedMood) {
            if (!moodProductivity[relatedMood.mood]) {
              moodProductivity[relatedMood.mood] = [];
            }
            moodProductivity[relatedMood.mood].push(session.completed ? 1 : 0);
          }
        });

        const bestMoods = Object.entries(moodProductivity)
          .map(([mood, productivity]) => ({
            mood: mood as MoodType,
            avgProductivity:
              productivity.reduce((a, b) => a + b, 0) / productivity.length,
          }))
          .filter((item) => item.avgProductivity >= 0.8)
          .sort((a, b) => b.avgProductivity - a.avgProductivity)
          .slice(0, 3)
          .map((item) => item.mood);

        const avgProductivity =
          contextSessions.length > 0
            ? (contextSessions.filter((s) => s.completed).length /
                contextSessions.length) *
              100
            : 0;

        return {
          context,
          bestMoods,
          avgProductivity: Math.round(avgProductivity),
        };
      })
      .filter((insight) => insight.avgProductivity > 0);
  }

  private generateImprovementSuggestions(
    moodEntries: MoodEntry[],
    sessions: TimerSession[],
  ): string[] {
    const suggestions: string[] = [];
    const recentEntries = moodEntries.slice(-10); // Last 10 entries
    const insights = this.getMoodProductivityInsights(moodEntries, sessions);

    // Check for stress patterns
    const stressfulEntries = recentEntries.filter((entry) =>
      ["stressed", "overwhelmed"].includes(entry.mood),
    );
    if (stressfulEntries.length >= 3) {
      suggestions.push("Consider shorter sessions when feeling stressed");
      suggestions.push("Try mindfulness breaks between focus sessions");
    }

    // Check for low energy patterns
    const lowEnergyEntries = recentEntries.filter(
      (entry) => entry.mood === "tired" && entry.intensity >= 3,
    );
    if (lowEnergyEntries.length >= 2) {
      suggestions.push(
        "Schedule demanding tasks during your high-energy periods",
      );
    }

    // Check for optimal mood patterns
    const bestMoods = this.getBestPerformanceMoods(moodEntries, sessions);
    if (bestMoods.length > 0) {
      suggestions.push(
        `You perform best when feeling ${bestMoods[0]} - try to identify what creates this state`,
      );
    }

    // Add insights from correlation analysis
    if (insights.optimalMoodTimes.length > 0) {
      const bestTime = insights.optimalMoodTimes[0];
      suggestions.push(
        `Your most productive time is ${bestTime.hour}:00 when feeling ${bestTime.mood}`,
      );
    }

    // Energy level insights
    const highEnergyImpact = insights.energyLevelImpact.find(
      (impact) => impact.level >= 4,
    );
    if (highEnergyImpact && highEnergyImpact.completionRate >= 80) {
      suggestions.push(
        "High energy levels significantly boost your performance - prioritize energy management",
      );
    }

    // General suggestions if no specific patterns
    if (suggestions.length === 0) {
      suggestions.push("Track your mood consistently to identify patterns");
      suggestions.push(
        "Notice how different activities affect your mood and focus",
      );
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }
}

export const moodTrackingService = MoodTrackingService.getInstance();
