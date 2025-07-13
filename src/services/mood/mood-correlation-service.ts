import { MoodEntry, MoodType, TimerSession } from "../../types/timer";

/**
 * Service for mood-productivity correlation analysis.
 *
 * Handles:
 * - Productivity correlation calculations
 * - Performance analysis by mood
 * - Session correlation insights
 * - Contextual productivity analysis
 */
export class MoodCorrelationService {
  private static instance: MoodCorrelationService;

  private constructor() {}

  public static getInstance(): MoodCorrelationService {
    if (!MoodCorrelationService.instance) {
      MoodCorrelationService.instance = new MoodCorrelationService();
    }
    return MoodCorrelationService.instance;
  }

  /**
   * Calculate productivity correlation with different moods
   */
  public calculateProductivityCorrelation(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
  ): Array<{
    mood: MoodType;
    averageSessionCompletion: number;
    averageFocusQuality: number;
  }> {
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
                  new Date(session.startTime).getTime()
              ) <
                30 * 60 * 1000
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

  /**
   * Get best performance moods based on completion rate and focus quality
   */
  public getBestPerformanceMoods(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
  ): MoodType[] {
    const correlations = this.calculateProductivityCorrelation(
      moodEntries,
      sessions
    );

    return correlations
      .filter(
        (c) => c.averageSessionCompletion >= 80 && c.averageFocusQuality >= 4
      )
      .sort((a, b) => b.averageSessionCompletion - a.averageSessionCompletion)
      .slice(0, 3)
      .map((c) => c.mood);
  }

  /**
   * Calculate mood-session correlation details
   */
  public calculateMoodSessionCorrelation(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
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
            (entry) => entry.sessionId === session.id && entry.mood === mood
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

  /**
   * Calculate contextual productivity insights
   */
  public calculateContextualInsights(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
  ): {
    context: string;
    bestMoods: MoodType[];
    avgProductivity: number;
  }[] {
    const contexts = [
      "pre-session",
      "during-session",
      "post-session",
      "standalone",
    ];

    return contexts
      .map((context) => {
        const contextEntries = moodEntries.filter(
          (entry) => entry.context === context
        );
        const contextSessions = sessions.filter((session) => {
          return contextEntries.some((entry) => entry.sessionId === session.id);
        });

        // Calculate mood productivity for this context
        const moodProductivity: Record<string, number[]> = {};
        contextEntries.forEach((entry) => {
          const relatedSession = sessions.find((s) => s.id === entry.sessionId);
          if (relatedSession) {
            if (!moodProductivity[entry.mood]) {
              moodProductivity[entry.mood] = [];
            }
            moodProductivity[entry.mood].push(relatedSession.completed ? 1 : 0);
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
    const optimalMoodTimes = this.calculateOptimalMoodTimes(
      moodEntries,
      sessions
    );
    const moodSessionCorrelation = this.calculateMoodSessionCorrelation(
      moodEntries,
      sessions
    );
    const energyLevelImpact = this.calculateEnergyLevelImpact(
      moodEntries,
      sessions
    );
    const contextualInsights = this.calculateContextualInsights(
      moodEntries,
      sessions
    );

    return {
      optimalMoodTimes,
      moodSessionCorrelation,
      energyLevelImpact,
      contextualInsights,
    };
  }

  /**
   * Calculate optimal mood times (from analytics service)
   */
  private calculateOptimalMoodTimes(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
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
              new Date(session.startTime).getTime()
          ) <
            30 * 60 * 1000
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
            : b
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
   * Calculate energy level impact (from analytics service)
   */
  private calculateEnergyLevelImpact(
    moodEntries: MoodEntry[],
    sessions: TimerSession[]
  ): { level: number; avgFocusQuality: number; completionRate: number }[] {
    const energyLevels = [1, 2, 3, 4, 5];

    return energyLevels
      .map((level) => {
        const levelSessions = sessions.filter((session) => {
          const relatedMood = moodEntries.find(
            (entry) =>
              entry.sessionId === session.id && entry.intensity === level
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
}

export const moodCorrelationService = MoodCorrelationService.getInstance();
