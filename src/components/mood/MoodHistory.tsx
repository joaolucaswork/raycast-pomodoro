import {
  Action,
  ActionPanel,
  Icon,
  List,
  useNavigation,
  confirmAlert,
  Alert,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { useTimerStore } from "../../store/timer-store";
import { MoodEntry } from "../../types/timer";
import {
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
  getMoodContextIcon,
} from "../../constants/design-tokens";
import { formatDistanceToNow } from "date-fns";
import { MoodEntryDetail } from "../ui/mood-entry-detail";
import { MoodEntryForm } from "./MoodEntryForm";

interface MoodHistoryProps {
  moodEntries: MoodEntry[];
  onMoodUpdated?: () => void;
  onDeleteEntry?: (id: string) => void;
  showSessionLink?: boolean;
}

export function MoodHistory({ moodEntries, onMoodUpdated }: MoodHistoryProps) {
  const { deleteMoodEntry } = useTimerStore();
  const { push } = useNavigation();
  const [searchText, setSearchText] = useState("");

  // Filter mood entries based on search text
  const filteredEntries = moodEntries.filter((entry) => {
    const searchLower = searchText.toLowerCase();
    return (
      entry.mood.toLowerCase().includes(searchLower) ||
      entry.notes?.toLowerCase().includes(searchLower) ||
      entry.context.toLowerCase().includes(searchLower)
    );
  });

  // Sort entries by timestamp (newest first)
  const sortedEntries = filteredEntries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleDeleteEntry = async (entry: MoodEntry) => {
    const confirmed = await confirmAlert({
      title: "Delete Mood Entry",
      message: `Are you sure you want to delete this ${entry.mood} mood entry?`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      deleteMoodEntry(entry.id);
      showToast({
        style: Toast.Style.Success,
        title: "Mood Entry Deleted",
        message: `${entry.mood} entry removed from history`,
      });
    }
  };

  const handleEditEntry = (entry: MoodEntry) => {
    push(
      <MoodEntryForm
        existingEntry={entry}
        sessionId={entry.sessionId}
        onMoodUpdated={onMoodUpdated}
      />
    );
  };

  const handleViewDetails = (entry: MoodEntry) => {
    push(<MoodEntryDetail entry={entry} />);
  };

  if (sortedEntries.length === 0) {
    return (
      <List.EmptyView
        icon={Icon.Heart}
        title="No Mood Entries"
        description={
          searchText
            ? "No mood entries match your search"
            : "Start tracking your mood to see entries here"
        }
      />
    );
  }

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search mood entries..."
      navigationTitle="Mood History"
    >
      {sortedEntries.map((entry) => {
        const timeAgo = formatDistanceToNow(new Date(entry.timestamp), {
          addSuffix: true,
        });

        const accessories = [
          {
            text: `${entry.intensity}/5`,
            tooltip: `Intensity: ${entry.intensity}/5`,
            icon: {
              source: Icon.Circle,
              tintColor: getMoodIntensityColor(entry.intensity),
            },
          },
          {
            text: timeAgo,
            tooltip: `Logged ${timeAgo}`,
          },
        ];

        if (entry.context) {
          accessories.unshift({
            text: entry.context,
            icon: {
              source: getMoodContextIcon(entry.context),
              tintColor: getMoodColor(entry.mood),
            },
            tooltip: `Context: ${entry.context}`,
          });
        }

        return (
          <List.Item
            key={entry.id}
            title={entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
            subtitle={entry.notes || "No notes"}
            icon={{
              source: getMoodIcon(entry.mood),
              tintColor: getMoodColor(entry.mood),
            }}
            accessories={accessories}
            actions={
              <ActionPanel>
                <Action
                  title="View Details"
                  icon={ACTION_ICONS.VIEW}
                  onAction={() => handleViewDetails(entry)}
                />
                <Action
                  title="Edit Entry"
                  icon={ACTION_ICONS.EDIT}
                  onAction={() => handleEditEntry(entry)}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                />
                <Action
                  title="Delete Entry"
                  icon={ACTION_ICONS.DELETE}
                  style={Action.Style.Destructive}
                  onAction={() => handleDeleteEntry(entry)}
                  shortcut={{ modifiers: ["cmd"], key: "delete" }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

// Legacy export for backward compatibility
export const MoodHistoryList = MoodHistory;
