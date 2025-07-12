import { List } from "@raycast/api";
import { MoodEntry } from "../../types/timer";
import { getMoodIcon, getMoodColor } from "../../constants/design-tokens";

export interface SessionMoodIndicatorsProps {
  /** Array of mood entries associated with the session */
  moodEntries: MoodEntry[];
  /** Maximum number of mood indicators to display before showing count */
  maxVisible?: number;
}

/**
 * Displays mood indicators for a timer session in the history list.
 * Shows mood icons with tooltips and a count indicator for additional entries.
 */
export function SessionMoodIndicators({
  moodEntries,
  maxVisible = 2,
}: SessionMoodIndicatorsProps): List.Item.Accessory[] {
  if (moodEntries.length === 0) {
    return [];
  }

  const accessories: List.Item.Accessory[] = [];

  // Add mood icons for visible entries
  const visibleEntries = moodEntries.slice(0, maxVisible);
  visibleEntries.forEach((moodEntry) => {
    accessories.push({
      icon: {
        source: getMoodIcon(moodEntry.mood),
        tintColor: getMoodColor(moodEntry.mood),
      },
      tooltip: formatMoodTooltip(moodEntry),
    });
  });

  // Add count indicator for additional entries
  if (moodEntries.length > maxVisible) {
    accessories.push({
      text: `+${moodEntries.length - maxVisible}`,
      tooltip: `${moodEntries.length} total mood entries`,
    });
  }

  return accessories;
}

/**
 * Formats a mood entry into a user-friendly tooltip string.
 *
 * @param moodEntry - The mood entry to format
 * @returns Formatted tooltip string
 */
function formatMoodTooltip(moodEntry: MoodEntry): string {
  const moodName =
    moodEntry.mood.charAt(0).toUpperCase() + moodEntry.mood.slice(1);
  const context = moodEntry.context.replace("-", " ");
  return `${moodName} (${moodEntry.intensity}/5) - ${context}`;
}
