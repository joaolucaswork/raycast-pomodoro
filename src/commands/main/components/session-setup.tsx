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
import { createTaskIconSelectionActions } from "../../../components/icons/inline-icon-selection";

interface SessionSetupProps {
  currentTaskName: string;
  currentTags: string[];
  selectedTaskIcon?: Icon;
  setSelectedTaskIcon: (icon: Icon | undefined) => void;
  targetRounds: string;
  preRoundMood: MoodType | null;
  config: TimerConfig;
  getTagConfig: (tag: string) => { icon?: Icon; color: Color } | undefined;
  onStartWork: () => void;
  onSetpreRoundMood: (mood: MoodType | null) => void;
}

export function SessionSetup({
  currentTaskName,
  currentTags,
  selectedTaskIcon,
  setSelectedTaskIcon,
  targetRounds,
  preRoundMood,
  config,
  getTagConfig,
  onStartWork,
  onSetpreRoundMood,
}: SessionSetupProps) {
  return (
    <List.Item
      icon={selectedTaskIcon || Icon.Play}
      title={currentTaskName || "Start Round"}
      subtitle={`${config.workDuration} min round`}
      accessories={[
        ...(currentTags.length > 0
          ? currentTags.map((tag) => ({
              tag: { value: tag, color: getTagColor(tag, getTagConfig) },
            }))
          : []),
        ...(preRoundMood
          ? [
              {
                icon: {
                  source: getMoodIcon(preRoundMood),
                  tintColor: getMoodColor(preRoundMood),
                },
                tooltip: `Pre-round mood: ${preRoundMood}`,
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
              title="Start Round"
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

            <ActionPanel.Submenu title="Set Pre-round Mood" icon={Icon.Heart}>
              {MOOD_OPTIONS.map((mood) => (
                <Action
                  key={mood.value}
                  title={mood.title}
                  icon={{
                    source: getMoodIcon(mood.value),
                    tintColor: getMoodColor(mood.value),
                  }}
                  onAction={() => onSetpreRoundMood(mood.value)}
                />
              ))}
              {preRoundMood && (
                <Action
                  title="Clear Mood Selection"
                  icon={Icon.XMarkCircle}
                  onAction={() => onSetpreRoundMood(null)}
                />
              )}
            </ActionPanel.Submenu>
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
