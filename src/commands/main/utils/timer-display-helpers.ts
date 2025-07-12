import { MoodType, MoodEntry } from "../../../types/timer";

/**
 * Timer display helper utilities
 */

/**
 * Mood options for pre-session selection
 */
export const MOOD_OPTIONS: { value: MoodType; title: string }[] = [
  { value: "energized", title: "Energized" },
  { value: "focused", title: "Focused" },
  { value: "calm", title: "Calm" },
  { value: "motivated", title: "Motivated" },
  { value: "neutral", title: "Neutral" },
  { value: "tired", title: "Tired" },
  { value: "stressed", title: "Stressed" },
];

/**
 * Get the most recent mood entry
 */
export const getMostRecentMoodEntry = (moodEntries: MoodEntry[]): MoodEntry | null => {
  if (moodEntries.length === 0) return null;

  const sortedEntries = [...moodEntries].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return sortedEntries[0];
};

/**
 * Format target rounds for display
 */
export const formatTargetRounds = (rounds: string): string => {
  const num = parseInt(rounds);
  return num === 1 ? "1 Round" : `${num} Rounds`;
};

/**
 * Get round options for dropdown
 */
export const ROUND_OPTIONS = [
  { value: "1", title: "1 Round" },
  { value: "2", title: "2 Rounds" },
  { value: "3", title: "3 Rounds" },
  { value: "4", title: "4 Rounds" },
  { value: "5", title: "5 Rounds" },
  { value: "6", title: "6 Rounds" },
  { value: "8", title: "8 Rounds" },
  { value: "10", title: "10 Rounds" },
];

/**
 * Check if search text should show tag suggestions
 */
export const shouldShowTagSuggestions = (searchText: string, currentTags: string[]): boolean => {
  return currentTags.length === 0 || searchText.trim() === "#";
};

/**
 * Check if search text should show start action
 */
export const shouldShowStartAction = (searchText: string): boolean => {
  return searchText.trim().length > 0;
};
