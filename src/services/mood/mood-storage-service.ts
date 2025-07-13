import {
  MoodEntry,
  MoodType,
  TimerSession,
} from "../types/timer";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";

/**
 * Service for mood data storage and retrieval operations.
 * 
 * Handles:
 * - Data filtering and querying
 * - Date range operations
 * - Mood entry retrieval
 * - Data organization
 */
export class MoodStorageService {
  private static instance: MoodStorageService;

  private constructor() {}

  public static getInstance(): MoodStorageService {
    if (!MoodStorageService.instance) {
      MoodStorageService.instance = new MoodStorageService();
    }
    return MoodStorageService.instance;
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
   * Get today's mood entries
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
   * Get this week's mood entries
   */
  public getThisWeeksMoodEntries(moodEntries: MoodEntry[]): MoodEntry[] {
    const today = new Date();
    return this.getMoodEntriesInRange(
      moodEntries,
      startOfWeek(today),
      endOfWeek(today),
    );
  }

  /**
   * Get this month's mood entries
   */
  public getThisMonthsMoodEntries(moodEntries: MoodEntry[]): MoodEntry[] {
    const today = new Date();
    return this.getMoodEntriesInRange(
      moodEntries,
      startOfMonth(today),
      endOfMonth(today),
    );
  }

  /**
   * Get recent mood entries (last N entries)
   */
  public getRecentMoodEntries(moodEntries: MoodEntry[], count: number = 10): MoodEntry[] {
    return moodEntries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }

  /**
   * Get mood entries by specific mood type
   */
  public getMoodEntriesByType(moodEntries: MoodEntry[], moodType: MoodType): MoodEntry[] {
    return moodEntries.filter((entry) => entry.mood === moodType);
  }

  /**
   * Get mood entries by intensity level
   */
  public getMoodEntriesByIntensity(
    moodEntries: MoodEntry[],
    intensity: number,
  ): MoodEntry[] {
    return moodEntries.filter((entry) => entry.intensity === intensity);
  }

  /**
   * Get mood entries by context
   */
  public getMoodEntriesByContext(
    moodEntries: MoodEntry[],
    context: "pre-session" | "during-session" | "post-session" | "standalone",
  ): MoodEntry[] {
    return moodEntries.filter((entry) => entry.context === context);
  }

  /**
   * Get mood entries associated with specific session
   */
  public getMoodEntriesForSession(
    moodEntries: MoodEntry[],
    sessionId: string,
  ): MoodEntry[] {
    return moodEntries.filter((entry) => entry.sessionId === sessionId);
  }

  /**
   * Get mood entries within intensity range
   */
  public getMoodEntriesInIntensityRange(
    moodEntries: MoodEntry[],
    minIntensity: number,
    maxIntensity: number,
  ): MoodEntry[] {
    return moodEntries.filter(
      (entry) => entry.intensity >= minIntensity && entry.intensity <= maxIntensity,
    );
  }

  /**
   * Get mood entries from last N days
   */
  public getMoodEntriesFromLastDays(
    moodEntries: MoodEntry[],
    days: number,
  ): MoodEntry[] {
    const cutoffDate = subDays(new Date(), days);
    return moodEntries.filter((entry) => new Date(entry.timestamp) >= cutoffDate);
  }

  /**
   * Group mood entries by date
   */
  public groupMoodEntriesByDate(
    moodEntries: MoodEntry[],
  ): Record<string, MoodEntry[]> {
    const grouped: Record<string, MoodEntry[]> = {};

    moodEntries.forEach((entry) => {
      const dateKey = startOfDay(new Date(entry.timestamp)).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return grouped;
  }

  /**
   * Group mood entries by mood type
   */
  public groupMoodEntriesByType(
    moodEntries: MoodEntry[],
  ): Record<MoodType, MoodEntry[]> {
    const grouped: Record<string, MoodEntry[]> = {};

    moodEntries.forEach((entry) => {
      if (!grouped[entry.mood]) {
        grouped[entry.mood] = [];
      }
      grouped[entry.mood].push(entry);
    });

    return grouped as Record<MoodType, MoodEntry[]>;
  }

  /**
   * Group mood entries by context
   */
  public groupMoodEntriesByContext(
    moodEntries: MoodEntry[],
  ): Record<string, MoodEntry[]> {
    const grouped: Record<string, MoodEntry[]> = {};

    moodEntries.forEach((entry) => {
      const context = entry.context || "standalone";
      if (!grouped[context]) {
        grouped[context] = [];
      }
      grouped[context].push(entry);
    });

    return grouped;
  }

  /**
   * Find mood entries near a specific timestamp (within time window)
   */
  public findMoodEntriesNearTimestamp(
    moodEntries: MoodEntry[],
    timestamp: Date,
    windowMinutes: number = 30,
  ): MoodEntry[] {
    const windowMs = windowMinutes * 60 * 1000;
    const targetTime = timestamp.getTime();

    return moodEntries.filter((entry) => {
      const entryTime = new Date(entry.timestamp).getTime();
      return Math.abs(entryTime - targetTime) <= windowMs;
    });
  }

  /**
   * Get mood entries with notes
   */
  public getMoodEntriesWithNotes(moodEntries: MoodEntry[]): MoodEntry[] {
    return moodEntries.filter((entry) => entry.notes && entry.notes.trim().length > 0);
  }

  /**
   * Search mood entries by notes content
   */
  public searchMoodEntriesByNotes(
    moodEntries: MoodEntry[],
    searchTerm: string,
  ): MoodEntry[] {
    const term = searchTerm.toLowerCase();
    return moodEntries.filter(
      (entry) =>
        entry.notes && entry.notes.toLowerCase().includes(term),
    );
  }

  /**
   * Get mood entry statistics for a given set
   */
  public getMoodEntryStatistics(moodEntries: MoodEntry[]): {
    totalEntries: number;
    averageIntensity: number;
    moodCounts: Record<MoodType, number>;
    contextCounts: Record<string, number>;
    intensityDistribution: Record<number, number>;
  } {
    const moodCounts: Record<string, number> = {};
    const contextCounts: Record<string, number> = {};
    const intensityDistribution: Record<number, number> = {};
    let totalIntensity = 0;

    moodEntries.forEach((entry) => {
      // Count moods
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      
      // Count contexts
      const context = entry.context || "standalone";
      contextCounts[context] = (contextCounts[context] || 0) + 1;
      
      // Count intensities
      intensityDistribution[entry.intensity] = 
        (intensityDistribution[entry.intensity] || 0) + 1;
      
      totalIntensity += entry.intensity;
    });

    return {
      totalEntries: moodEntries.length,
      averageIntensity: moodEntries.length > 0 
        ? Math.round((totalIntensity / moodEntries.length) * 10) / 10 
        : 0,
      moodCounts: moodCounts as Record<MoodType, number>,
      contextCounts,
      intensityDistribution,
    };
  }

  /**
   * Sort mood entries by timestamp (newest first by default)
   */
  public sortMoodEntries(
    moodEntries: MoodEntry[],
    ascending: boolean = false,
  ): MoodEntry[] {
    return [...moodEntries].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return ascending ? timeA - timeB : timeB - timeA;
    });
  }
}

export const moodStorageService = MoodStorageService.getInstance();
