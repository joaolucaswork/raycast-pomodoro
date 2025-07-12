import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { formatDistanceToNow } from "date-fns";
import {
  formatTime,
  getSessionTypeLabel,
  getProgressPercentage,
} from "../../../utils/helpers";
import { SessionType, TimerSession, MoodEntry } from "../../../types/timer";
import {
  ACTION_ICONS,
  SHORTCUTS,
  getMoodIcon,
  getMoodColor,
} from "../../../constants/design-tokens";
import { getMostRecentMoodEntry } from "../utils/timer-display-helpers";
import { getTagColor } from "../utils/search-parsing";

interface TimerDisplayProps {
  currentSession: TimerSession;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  currentFocusPeriodSessionCount: number;
  targetRounds: string;
  searchText: string;
  moodEntries: MoodEntry[];
  getTagConfig: (tag: string) => { icon?: Icon; color: any } | undefined;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onStop: () => void;
  onStartNewSession: () => Promise<void>;
}

export function TimerDisplay({
  currentSession,
  timeRemaining,
  isRunning,
  isPaused,
  currentFocusPeriodSessionCount,
  targetRounds,
  searchText,
  moodEntries,
  getTagConfig,
  onPause,
  onResume,
  onComplete,
  onStop,
  onStartNewSession,
}: TimerDisplayProps) {
  const getTimerDisplay = () => {
    const progress = getProgressPercentage(
      timeRemaining,
      currentSession.duration
    );
    const sessionLabel = getSessionTypeLabel(currentSession.type);
    const timeDisplay = formatTime(timeRemaining);

    // Calculate next break time (actual clock time)
    const nextBreakTime =
      currentSession.type === SessionType.WORK
        ? new Date(Date.now() + timeRemaining * 1000)
        : null;

    return {
      title: sessionLabel,
      subtitle: `${timeDisplay} remaining`,
      progress,
      timeDisplay,
      nextBreakTime,
    };
  };

  const timerDisplay = getTimerDisplay();
  const recentMood = getMostRecentMoodEntry(moodEntries);

  return (
    <>
      {/* Active Timer Display */}
      <List.Item
        icon={
          currentSession.type === SessionType.WORK
            ? currentSession.taskIcon || Icon.Hammer
            : Icon.Pause
        }
        title={timerDisplay.timeDisplay}
        subtitle={
          currentSession.type === SessionType.WORK
            ? `${currentSession.taskName ? `${currentSession.taskName} - ` : ""}${currentFocusPeriodSessionCount + 1}/${targetRounds}`
            : `${timerDisplay.title}${currentSession.taskName ? ` • ${currentSession.taskName}` : ""}`
        }
        accessories={[
          ...(currentSession.tags && currentSession.tags.length > 0
            ? currentSession.tags.map((tag) => ({
                tag: { value: tag, color: getTagColor(tag, getTagConfig) },
              }))
            : []),
          {
            text: `${Math.round(timerDisplay.progress)}%`,
            icon: Icon.BarChart,
          },
        ]}
        actions={
          <ActionPanel>
            <ActionPanel.Section title="Timer Controls">
              {isRunning && (
                <>
                  <Action
                    title="Pause Timer"
                    icon={ACTION_ICONS.PAUSE}
                    onAction={onPause}
                    shortcut={SHORTCUTS.PAUSE_RESUME}
                  />
                  <Action
                    title="Complete Round"
                    icon={ACTION_ICONS.COMPLETE}
                    onAction={onComplete}
                    shortcut={SHORTCUTS.PRIMARY_ACTION}
                  />
                </>
              )}

              {isPaused && (
                <Action
                  title="Resume Timer"
                  icon={Icon.Play}
                  onAction={onResume}
                  shortcut={SHORTCUTS.PAUSE_RESUME}
                />
              )}
            </ActionPanel.Section>

            {/* Start New Session - Only show when user has typed something */}
            {searchText.trim().length > 0 && (
              <ActionPanel.Section title="Quick Actions">
                <Action
                  title="Start New Session"
                  icon={Icon.ArrowRight}
                  onAction={onStartNewSession}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                />
              </ActionPanel.Section>
            )}
          </ActionPanel>
        }
      />

      {/* Session Details */}
      <List.Section title="Session Info">
        {/* Recent Mood Entry Display */}
        {recentMood && (
          <List.Item
            icon={{
              source: getMoodIcon(recentMood.mood),
              tintColor: getMoodColor(recentMood.mood),
            }}
            title="Recent Mood"
            subtitle={`${recentMood.mood.charAt(0).toUpperCase() + recentMood.mood.slice(1)} • ${formatDistanceToNow(new Date(recentMood.timestamp), { addSuffix: true })}`}
            accessories={[
              {
                text: `${recentMood.intensity}/5`,
                tooltip: `Intensity: ${recentMood.intensity}/5`,
              },
            ]}
          />
        )}

        {timerDisplay.nextBreakTime && (
          <List.Item
            icon={Icon.Clock}
            title="Next Break"
            subtitle={timerDisplay.nextBreakTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            accessories={[{ text: "Scheduled" }]}
          />
        )}

        {currentSession.taskName && (
          <List.Item
            icon={Icon.Document}
            title="Current Task"
            subtitle={currentSession.taskName}
            accessories={[
              ...(currentSession.projectName
                ? [{ text: currentSession.projectName }]
                : []),
            ]}
          />
        )}

        {currentSession.tags && currentSession.tags.length > 0 && (
          <List.Item
            icon={Icon.Tag}
            title="Tags"
            subtitle={currentSession.tags.map((tag) => `#${tag}`).join(" ")}
            accessories={currentSession.tags.map((tag) => ({
              tag: { value: tag, color: getTagColor(tag, getTagConfig) },
            }))}
          />
        )}

        <List.Item
          icon={Icon.BullsEye}
          title="Progress"
          subtitle={`Round ${currentFocusPeriodSessionCount + 1} of ${targetRounds}`}
          accessories={[
            {
              text: `${Math.round(timerDisplay.progress)}%`,
              icon: Icon.BarChart,
            },
          ]}
        />
      </List.Section>
    </>
  );
}
