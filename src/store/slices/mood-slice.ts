import { StateCreator } from "zustand";
import { MoodEntry, MoodType, MoodAnalytics, TimerSession, PomodoroStore } from "../../types/timer";
import { generateId } from "../../utils/helpers";
import { moodTrackingService } from "../../services/mood-tracking-service";

/**
 * Mood slice interface - defines mood tracking-related state and actions
 */
export interface MoodSlice {
  // Mood state
  moodEntries: MoodEntry[];
  isPostSessionMoodPromptVisible: boolean;
  lastCompletedSession: TimerSession | null;

  // Mood actions
  addMoodEntry: (
    mood: MoodType,
    intensity: 1 | 2 | 3 | 4 | 5,
    context: "pre-session" | "during-session" | "post-session" | "standalone",
    sessionId?: string,
    notes?: string
  ) => void;
  deleteMoodEntry: (entryId: string) => void;
  updateMoodEntry: (
    entryId: string,
    updates: Partial<Omit<MoodEntry, "id" | "timestamp">>
  ) => void;
  getMoodEntries: () => MoodEntry[];
  getMoodAnalytics: () => MoodAnalytics;
  clearAllMoodEntries: () => void;

  // Post-session mood prompt actions
  showPostSessionMoodPrompt: (session: TimerSession) => void;
  hidePostSessionMoodPrompt: () => void;

  // Session mood state actions
  updateSessionMoodState: (
    mood: "motivated" | "neutral" | "struggling" | "hyperfocus"
  ) => void;

  // Mood utilities
  getMoodEntriesForSession: (sessionId: string) => MoodEntry[];
  getMoodEntriesInDateRange: (startDate: Date, endDate: Date) => MoodEntry[];
  getRecentMoodEntries: (count?: number) => MoodEntry[];
  getMostCommonMood: () => MoodType | null;
  getAverageMoodIntensity: () => number;
}

/**
 * Create mood slice with all mood tracking-related functionality
 */
export const createMoodSlice: StateCreator<
  PomodoroStore,
  [],
  [],
  MoodSlice
> = (set, get) => ({
  // Initial state
  moodEntries: [],
  isPostSessionMoodPromptVisible: false,
  lastCompletedSession: null,

  // Mood actions
  addMoodEntry: (
    mood: MoodType,
    intensity: 1 | 2 | 3 | 4 | 5,
    context: "pre-session" | "during-session" | "post-session" | "standalone",
    sessionId?: string,
    notes?: string
  ) => {
    const { moodEntries } = get();
    const newEntry: MoodEntry = {
      id: generateId(),
      mood,
      intensity,
      timestamp: new Date(),
      sessionId,
      notes,
      context,
    };

    set({
      moodEntries: [...moodEntries, newEntry],
    });
  },

  deleteMoodEntry: (entryId: string) => {
    const { moodEntries } = get();
    set({
      moodEntries: moodEntries.filter((entry) => entry.id !== entryId),
    });
  },

  updateMoodEntry: (
    entryId: string,
    updates: Partial<Omit<MoodEntry, "id" | "timestamp">>
  ) => {
    const { moodEntries } = get();
    const newMoodEntries = moodEntries.map((entry) =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    set({
      moodEntries: newMoodEntries,
    });
  },

  getMoodEntries: () => {
    const { moodEntries } = get();
    return moodEntries;
  },

  getMoodAnalytics: () => {
    const { moodEntries, history } = get();
    return moodTrackingService.calculateMoodAnalytics(moodEntries, history);
  },

  clearAllMoodEntries: () => {
    set({
      moodEntries: [],
    });
  },

  // Post-session mood prompt actions
  showPostSessionMoodPrompt: (session: TimerSession) => {
    set({
      isPostSessionMoodPromptVisible: true,
      lastCompletedSession: session,
    });
  },

  hidePostSessionMoodPrompt: () => {
    set({
      isPostSessionMoodPromptVisible: false,
      lastCompletedSession: null,
    });
  },

  // Session mood state actions
  updateSessionMoodState: (
    mood: "motivated" | "neutral" | "struggling" | "hyperfocus"
  ) => {
    const { currentSession } = get();
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          moodState: mood,
        },
      });
    }
  },

  // Mood utilities
  getMoodEntriesForSession: (sessionId: string) => {
    const { moodEntries } = get();
    return moodEntries.filter((entry) => entry.sessionId === sessionId);
  },

  getMoodEntriesInDateRange: (startDate: Date, endDate: Date) => {
    const { moodEntries } = get();
    return moodEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  },

  getRecentMoodEntries: (count: number = 10) => {
    const { moodEntries } = get();
    return moodEntries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  },

  getMostCommonMood: () => {
    const { moodEntries } = get();
    if (moodEntries.length === 0) return null;

    const moodCounts = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);

    return Object.entries(moodCounts).reduce((a, b) =>
      moodCounts[a[0] as MoodType] > moodCounts[b[0] as MoodType] ? a : b
    )[0] as MoodType;
  },

  getAverageMoodIntensity: () => {
    const { moodEntries } = get();
    if (moodEntries.length === 0) return 0;

    const totalIntensity = moodEntries.reduce((acc, entry) => acc + entry.intensity, 0);
    return totalIntensity / moodEntries.length;
  },
});
