import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  Color,
  useNavigation,
} from "@raycast/api";
import { MoodEntry, TimerSession } from "../types/timer";
import {
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
  ACTION_ICONS,
} from "../constants/design-tokens";
import { formatDistanceToNow, format } from "date-fns";
import { useTimerStore } from "../store/timer-store";

interface MoodEntryDetailProps {
  entry: MoodEntry;
  onDelete?: (entryId: string) => void;
}

export function MoodEntryDetail({ entry, onDelete }: MoodEntryDetailProps) {
  const { pop } = useNavigation();
  const { history } = useTimerStore();

  // Find the associated session if it exists
  const associatedSession = entry.sessionId
    ? history.find((session) => session.id === entry.sessionId)
    : null;

  const getContextDescription = (context: string) => {
    switch (context) {
      case "pre-session":
        return "Before Focus Session";
      case "during-session":
        return "During Focus Session";
      case "post-session":
        return "After Focus Session";
      case "standalone":
        return "Standalone Entry";
      default:
        return context.replace("-", " ");
    }
  };

  const getIntensityDescription = (intensity: number) => {
    switch (intensity) {
      case 1:
        return "Very Mild";
      case 2:
        return "Mild";
      case 3:
        return "Moderate";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return `Level ${intensity}`;
    }
  };

  const getMoodDescription = (mood: string) => {
    const descriptions = {
      energized: "Feeling alert, active, and ready to tackle challenges",
      focused: "Clear-minded, concentrated, and mentally sharp",
      calm: "Peaceful, relaxed, and emotionally balanced",
      motivated: "Inspired, driven, and eager to accomplish goals",
      neutral: "Balanced emotional state, neither positive nor negative",
      tired: "Feeling drained, fatigued, or low on energy",
      stressed: "Experiencing pressure, tension, or anxiety",
      overwhelmed: "Feeling like there's too much to handle",
      distracted: "Having difficulty maintaining focus or concentration",
    };
    return descriptions[mood as keyof typeof descriptions] || mood;
  };

  // Build the markdown content for the detail view
  const buildMarkdownContent = () => {
    // Display only raw reflection notes without headers or titles
    if (entry.notes && entry.notes.trim()) {
      return entry.notes;
    } else {
      return `*No reflection notes were added for this mood entry.*\n\nUse the reflection notes to capture:\n• What contributed to your mood\n• How your focus and energy felt\n• What strategies worked well\n• Insights for future sessions`;
    }
  };

  return (
    <Detail
      navigationTitle="Mood Entry Details"
      markdown={buildMarkdownContent()}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Mood"
            text={entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
            icon={{
              source: getMoodIcon(entry.mood),
              tintColor: getMoodColor(entry.mood),
            }}
          />
          <Detail.Metadata.Label
            title="Intensity"
            text={`${entry.intensity}/5`}
            icon={{
              source: Icon.Circle,
              tintColor: getMoodIntensityColor(entry.intensity),
            }}
          />
          <Detail.Metadata.Label
            title="Context"
            text={getContextDescription(entry.context)}
            icon={Icon.Tag}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Logged"
            text={formatDistanceToNow(new Date(entry.timestamp), {
              addSuffix: true,
            })}
            icon={Icon.Clock}
          />
          <Detail.Metadata.Label
            title="Date"
            text={format(new Date(entry.timestamp), "MMM do, yyyy")}
            icon={Icon.Calendar}
          />
          {associatedSession && (
            <>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label
                title="Session"
                text={associatedSession.taskName || "Untitled"}
                icon={Icon.Hammer}
              />
              <Detail.Metadata.Label
                title="Duration"
                text={`${Math.round(associatedSession.duration / 60)} min`}
                icon={Icon.Clock}
              />
            </>
          )}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action
            title="Back to Mood History"
            icon={ACTION_ICONS.BACK}
            onAction={pop}
          />
          {onDelete && (
            <ActionPanel.Section>
              <Action
                title="Delete Entry"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={() => {
                  onDelete(entry.id);
                  pop();
                }}
              />
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
    />
  );
}
