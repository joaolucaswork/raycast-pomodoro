import { MoodEntry, MoodType, TimerSession } from "../../types/timer";

/**
 * Service for mood data validation and recommendations.
 *
 * Handles:
 * - Mood entry validation
 * - Recommendation generation
 * - Improvement suggestions
 * - Session mood recommendations
 */
export class MoodValidationService {
  private static instance: MoodValidationService;

  private constructor() {}

  public static getInstance(): MoodValidationService {
    if (!MoodValidationService.instance) {
      MoodValidationService.instance = new MoodValidationService();
    }
    return MoodValidationService.instance;
  }

  /**
   * Validate mood entry data
   */
  public validateMoodEntry(
    mood: MoodType,
    intensity: number,
    context: string
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
    recentEntries: MoodEntry[]
  ): string[] {
    const recommendations: string[] = [];

    // High stress recommendations
    if (currentMood === "stressed" || currentMood === "overwhelmed") {
      if (intensity >= 4) {
        recommendations.push(
          "Consider taking a longer break before starting your next session"
        );
        recommendations.push(
          "Try a 5-minute breathing exercise or mindfulness activity"
        );
      }
      recommendations.push(
        "Reduce session duration by 25-50% to prevent burnout"
      );
    }

    // Low energy recommendations
    if (currentMood === "tired" && intensity >= 3) {
      recommendations.push(
        "Consider shorter 15-minute sessions to maintain focus"
      );
      recommendations.push("Take a 5-minute walk or do light stretching");
    }

    // High energy optimization
    if (currentMood === "energized" && intensity >= 4) {
      recommendations.push(
        "This is a great time for longer or more challenging tasks"
      );
      recommendations.push("Consider extending your session by 10-15 minutes");
    }

    // Pattern-based recommendations
    const recentStressfulMoods = recentEntries
      .slice(-5)
      .filter((entry) => ["stressed", "overwhelmed"].includes(entry.mood));

    if (recentStressfulMoods.length >= 3) {
      recommendations.push(
        "You've been experiencing stress lately - consider adjusting your daily goals"
      );
    }

    return recommendations;
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
    // Find similar mood patterns in historical data
    const similarMoodSessions = historicalData.sessions.filter((session) => {
      const relatedMood = historicalData.moodEntries.find(
        (entry) => entry.sessionId === session.id && entry.mood === currentMood
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

    // Adjust duration based on current mood and intensity
    let recommendedDuration = avgDuration;
    let sessionType: "short" | "normal" | "extended" = "normal";
    let breakRecommendation = "Take a 5-minute break";
    let focusStrategy = "Use your preferred focus technique";

    // Mood-specific adjustments
    if (currentMood === "stressed" || currentMood === "overwhelmed") {
      recommendedDuration = Math.max(15, avgDuration * 0.7);
      sessionType = "short";
      breakRecommendation = "Take a 10-minute mindfulness break";
      focusStrategy = "Focus on breathing and single-tasking";
    } else if (currentMood === "tired") {
      recommendedDuration = Math.max(15, avgDuration * 0.8);
      sessionType = intensity >= 3 ? "short" : "normal";
      breakRecommendation = "Take a 5-minute movement break";
      focusStrategy = "Use the Pomodoro technique with shorter intervals";
    } else if (currentMood === "energized" || currentMood === "motivated") {
      recommendedDuration = Math.min(60, avgDuration * 1.2);
      sessionType = intensity >= 4 ? "extended" : "normal";
      breakRecommendation = "Take a 3-minute active break";
      focusStrategy = "Tackle your most challenging tasks first";
    }

    // Time of day adjustments
    if (timeOfDay < 9 || timeOfDay > 17) {
      recommendedDuration *= 0.9; // Slightly shorter outside work hours
    }

    const confidenceScore = Math.min(
      100,
      Math.round(
        (similarMoodSessions.length / 5) * 50 + // Historical data confidence
          completionRate * 30 + // Success rate confidence
          (intensity >= 3 ? 20 : 10) // Current state confidence
      )
    );

    return {
      recommendedDuration: Math.round(recommendedDuration),
      sessionType,
      breakRecommendation,
      focusStrategy,
      confidenceScore,
    };
  }

  /**
   * Generate improvement suggestions based on mood patterns
   */
  public generateImprovementSuggestions(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
  ): string[] {
    const suggestions: string[] = [];
    const recentEntries = moodEntries.slice(-10); // Last 10 entries

    // Check for stress patterns
    const stressfulEntries = recentEntries.filter((entry) =>
      ["stressed", "overwhelmed"].includes(entry.mood)
    );
    if (stressfulEntries.length >= 3) {
      suggestions.push("Consider shorter sessions when feeling stressed");
      suggestions.push("Try mindfulness breaks between focus sessions");
    }

    // Check for low energy patterns
    const lowEnergyEntries = recentEntries.filter(
      (entry) => entry.mood === "tired" && entry.intensity >= 3
    );
    if (lowEnergyEntries.length >= 3) {
      suggestions.push(
        "Schedule demanding tasks during your peak energy hours"
      );
      suggestions.push("Consider adjusting your sleep schedule");
    }

    // Check for distraction patterns
    const distractedEntries = recentEntries.filter(
      (entry) => entry.mood === "distracted"
    );
    if (distractedEntries.length >= 2) {
      suggestions.push("Try using website blockers during focus sessions");
      suggestions.push("Create a dedicated workspace free from distractions");
    }

    // Check for motivation patterns
    const motivatedEntries = recentEntries.filter(
      (entry) => entry.mood === "motivated" && entry.intensity >= 4
    );
    if (motivatedEntries.length >= 2) {
      suggestions.push(
        "Take advantage of high motivation with longer sessions"
      );
      suggestions.push(
        "Schedule your most important tasks during motivated periods"
      );
    }

    // Session completion analysis
    const recentSessions = sessions.slice(-10);
    const completionRate =
      recentSessions.length > 0
        ? recentSessions.filter((s) => s.completed).length /
          recentSessions.length
        : 0;

    if (completionRate < 0.6) {
      suggestions.push(
        "Try shorter session durations to improve completion rate"
      );
      suggestions.push("Break large tasks into smaller, manageable chunks");
    }

    // Default suggestions if no patterns found
    if (suggestions.length === 0) {
      suggestions.push("Continue tracking your mood to identify patterns");
      suggestions.push(
        "Experiment with different session lengths to find your optimal duration"
      );
    }

    return suggestions;
  }

  /**
   * Get today's mood entries for quick analysis
   */
  public getTodaysMoodEntries(moodEntries: MoodEntry[]): MoodEntry[] {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    return moodEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfToday && entryDate < endOfToday;
    });
  }
}

export const moodValidationService = MoodValidationService.getInstance();
