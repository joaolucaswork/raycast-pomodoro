import { Action, ActionPanel, List } from "@raycast/api";
import { MoodType } from "../../types/timer";
import {
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
} from "../../constants/design-tokens";

interface QuickMoodSelectorProps {
  onMoodSelected: (mood: MoodType, intensity: 1 | 2 | 3 | 4 | 5) => void;
}

interface QuickMoodItem {
  mood: MoodType;
  intensity: 1 | 2 | 3 | 4 | 5;
}

const commonMoods: QuickMoodItem[] = [
  { mood: "energized", intensity: 4 },
  { mood: "focused", intensity: 4 },
  { mood: "calm", intensity: 3 },
  { mood: "motivated", intensity: 4 },
  { mood: "neutral", intensity: 3 },
  { mood: "tired", intensity: 3 },
  { mood: "stressed", intensity: 3 },
  { mood: "overwhelmed", intensity: 4 },
  { mood: "distracted", intensity: 3 },
];

export function QuickMoodSelector({ onMoodSelected }: QuickMoodSelectorProps) {
  return (
    <List.Section title="Quick Mood Log">
      {commonMoods.map((item, index) => (
        <List.Item
          key={`${item.mood}-${index}`}
          title={`${item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}`}
          subtitle={`Quick log at ${item.intensity}/5 intensity`}
          icon={{
            source: getMoodIcon(item.mood),
            tintColor: getMoodColor(item.mood),
          }}
          accessories={[
            {
              text: `${item.intensity}/5`,
              tooltip: `Log ${item.mood} at ${item.intensity}/5`,
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={`Log ${item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}`}
                icon={ACTION_ICONS.SAVE}
                onAction={() => onMoodSelected(item.mood, item.intensity)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List.Section>
  );
}
