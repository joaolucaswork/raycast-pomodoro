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
  getTagConfig: (tag: string) => { icon?: Icon; color: any } | undefined;
  updateTagConfig: (tag: string, config: { icon?: Icon; color?: any }) => void;
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
  updateTagConfig,
  onStartWork,
  onSetPreSessionMood,
}: SessionSetupProps) {
  const createTagColorActions = (tag: string) => {
    const colors = [
      { name: "Blue", value: Color.Blue },
      { name: "Green", value: Color.Green },
      { name: "Red", value: Color.Red },
      { name: "Orange", value: Color.Orange },
      { name: "Purple", value: Color.Purple },
      { name: "Yellow", value: Color.Yellow },
    ];

    return colors.map((color) => (
      <Action
        key={color.name}
        title={color.name}
        icon={{
          source: Icon.Circle,
          tintColor: color.value,
        }}
        onAction={() => updateTagConfig(tag, { color: color.value })}
      />
    ));
  };

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

            {/* Dynamic Tag Color Selection - Only show if there are current tags */}
            {currentTags.length > 0 && (
              <>
                {currentTags.map((tag) => (
                  <ActionPanel.Submenu
                    key={`color-${tag}`}
                    title={`Change #${tag} Color`}
                    icon={Icon.Brush}
                  >
                    {createTagColorActions(tag)}
                  </ActionPanel.Submenu>
                ))}
              </>
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
