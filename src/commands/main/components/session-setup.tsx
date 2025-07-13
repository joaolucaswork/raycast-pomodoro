import { Action, ActionPanel, Icon, List, Color } from "@raycast/api";
import { TimerConfig, MoodType } from "../../../types/timer";
import {
  ACTION_ICONS,
  SHORTCUTS,
  getMoodIcon,
  getMoodColor,
} from "../../../constants/design-tokens";
import { getTagColor, getTagIcon } from "../utils/search-parsing";
import { MOOD_OPTIONS } from "../utils/timer-display-helpers";
import { createTaskIconSelectionActions } from "../../../components/inline-icon-selection";

interface SessionSetupProps {
  currentTaskName: string;
  currentTags: string[];
  selectedTaskIcon?: Icon;
  setSelectedTaskIcon: (icon: Icon | undefined) => void;
  targetRounds: string;
  preSessionMood: MoodType | null;
  config: TimerConfig;
  getTagConfig: (tag: string) => { icon?: Icon; color: Color } | undefined;
  onStartWork: () => void;
  onSetPreSessionMood: (mood: MoodType | null) => void;
}

export function SessionSetup({
  currentTaskName,
  currentTags,
  selectedTaskIcon,
  setSelectedTaskIcon,
  targetRounds,
  preSessionMood,
  config,
  getTagConfig,
  onStartWork,
  onSetPreSessionMood,
}: SessionSetupProps) {
  return (
    <List.Item
      icon={selectedTaskIcon || Icon.Play}
      title={currentTaskName || "Focus Session"}
      subtitle={`${config.workDuration} min`}
      accessories={[
        ...(currentTags.length > 0
          ? currentTags.map((tag) => ({
              tag: { value: tag, color: getTagColor(tag, getTagConfig) },
            }))
          : []),
        ...(preSessionMood
          ? [
              {
                icon: {
                  source: getMoodIcon(preSessionMood),
                  tintColor: getMoodColor(preSessionMood),
                },
                tooltip: `Pre-session mood: ${preSessionMood}`,
              },
            ]
          : []),
        {
          text: `${targetRounds} round${targetRounds !== "1" ? "s" : ""}`,
          icon: Icon.BullsEye,
        },
      ]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action
              title="Start Focus Round"
              icon={selectedTaskIcon || ACTION_ICONS.PLAY}
              onAction={onStartWork}
              shortcut={SHORTCUTS.PRIMARY_ACTION}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Customize">
            {/* Session Icon Selection */}
            {createTaskIconSelectionActions(
              (icon) => setSelectedTaskIcon(icon),
              selectedTaskIcon
            )}

            <ActionPanel.Submenu title="Set Pre-session Mood" icon={Icon.Heart}>
              {MOOD_OPTIONS.map((mood) => (
                <Action
                  key={mood.value}
                  title={mood.title}
                  icon={{
                    source: getMoodIcon(mood.value),
                    tintColor: getMoodColor(mood.value),
                  }}
                  onAction={() => onSetPreSessionMood(mood.value)}
                />
              ))}
              {preSessionMood && (
                <Action
                  title="Clear Mood Selection"
                  icon={Icon.XMarkCircle}
                  onAction={() => onSetPreSessionMood(null)}
                />
              )}
            </ActionPanel.Submenu>
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
