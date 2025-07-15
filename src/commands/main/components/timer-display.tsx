import { useState, useEffect } from "react";
import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  Form,
  showToast,
  Toast,
} from "@raycast/api";
import { createTaskIconSelectionActions } from "../../../components/icons/inline-icon-selection";
import { formatDistanceToNow } from "date-fns";
import {
  formatTime,
  getSessionTypeLabel,
  getProgressPercentage,
} from "../../../utils/helpers";
import {
  SessionType,
  TimerSession,
  MoodEntry,
  MoodType,
} from "../../../types/timer";
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
  getTagConfig: (tag: string) => { icon?: Icon; color: Color } | undefined;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onStop: () => void;
  onStartNewSession: () => Promise<void>;
  updateCurrentSessionName: (taskName: string) => void;
  updateCurrentSessionIcon: (taskIcon: Icon) => void;
  addMoodEntry: (
    mood: MoodType,
    intensity: 1 | 2 | 3 | 4 | 5,
    context: "pre-session" | "during-session" | "post-session" | "standalone",
    sessionId?: string,
    notes?: string
  ) => void;
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
  updateCurrentSessionName,
  updateCurrentSessionIcon,
  addMoodEntry,
}: TimerDisplayProps) {
  // Task configuration state
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [wasRunningBeforeConfig, setWasRunningBeforeConfig] = useState(false);

  // Handle entering configuration mode
  const enterConfigMode = () => {
    if (isRunning) {
      setWasRunningBeforeConfig(true);
      onPause();
    }
    setIsConfiguring(true);
  };

  // Handle exiting configuration mode
  const exitConfigMode = async () => {
    setIsConfiguring(false);
    if (wasRunningBeforeConfig) {
      await onResume();
      setWasRunningBeforeConfig(false);
      await showToast({
        style: Toast.Style.Success,
        title: "Configuration saved",
        message: "Timer resumed",
      });
    }
  };

  // Handle icon selection with toast feedback
  const handleIconSelection = async (icon: Icon) => {
    try {
      updateCurrentSessionIcon(icon);
      await showToast({
        style: Toast.Style.Success,
        title: "Task icon updated",
        message: `Changed to ${icon}`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to update icon",
        message: "Please try again",
      });
    }
  };

  // Handle mood logging
  const handleMoodLogging = async (
    mood: MoodType,
    intensity: 1 | 2 | 3 | 4 | 5
  ) => {
    try {
      addMoodEntry(
        mood,
        intensity,
        "during-session",
        currentSession.id,
        `Logged during ${currentSession.taskName || "focus session"}`
      );
      await showToast({
        style: Toast.Style.Success,
        title: "Mood logged",
        message: `${mood} (${intensity}/5) recorded`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to log mood",
        message: "Please try again",
      });
    }
  };

  // Mood options for quick logging - using correct MoodType values and icons
  const moodOptions = [
    {
      mood: "energized" as MoodType,
      icon: getMoodIcon("energized"),
      intensity: 4 as const,
    },
    {
      mood: "focused" as MoodType,
      icon: getMoodIcon("focused"),
      intensity: 4 as const,
    },
    {
      mood: "calm" as MoodType,
      icon: getMoodIcon("calm"),
      intensity: 3 as const,
    },
    {
      mood: "motivated" as MoodType,
      icon: getMoodIcon("motivated"),
      intensity: 5 as const,
    },
    {
      mood: "stressed" as MoodType,
      icon: getMoodIcon("stressed"),
      intensity: 2 as const,
    },
    {
      mood: "tired" as MoodType,
      icon: getMoodIcon("tired"),
      intensity: 2 as const,
    },
  ];

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

  // Get mood entries for current session
  const currentSessionMoods = moodEntries.filter(
    (entry) => entry.sessionId === currentSession.id
  );

  // Get pre-session mood (mood logged before session started)
  const preSessionMood = currentSessionMoods.find(
    (entry) => entry.context === "pre-session"
  );

  // Get post-session mood (mood that will be/was logged after session)
  const postSessionMood = currentSessionMoods.find(
    (entry) => entry.context === "post-session"
  );

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
            ? currentSession.taskName
              ? `${currentSession.taskName} - ${currentFocusPeriodSessionCount + 1}/${targetRounds}`
              : searchText.trim().length > 0
                ? `${currentFocusPeriodSessionCount + 1}/${targetRounds}`
                : `define your training goal • ${currentFocusPeriodSessionCount + 1}/${targetRounds}`
            : `${timerDisplay.title}${currentSession.taskName ? ` • ${currentSession.taskName}` : ""}`
        }
        accessories={[
          // Show mood indicator first if available
          ...(recentMood
            ? [
                {
                  icon: {
                    source: getMoodIcon(recentMood.mood),
                    tintColor: getMoodColor(recentMood.mood),
                  },
                  tooltip: `Current mood: ${recentMood.mood} (${recentMood.intensity}/5)`,
                },
              ]
            : []),
          // Show tags
          ...(currentSession.tags && currentSession.tags.length > 0
            ? currentSession.tags.map((tag) => ({
                tag: { value: tag, color: getTagColor(tag, getTagConfig) },
              }))
            : []),
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
                  title="Start New Round"
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
        {timerDisplay.nextBreakTime && (
          <List.Item
            icon={Icon.Bell}
            title="Bell Time"
            subtitle={timerDisplay.nextBreakTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            accessories={[{ text: "Round ends" }]}
          />
        )}

        {currentSession.taskName && (
          <List.Item
            icon={currentSession.taskIcon || Icon.Document}
            title="Training Focus"
            subtitle={
              isConfiguring
                ? "Editing training details..."
                : currentSession.taskName
            }
            accessories={[
              ...(currentSession.projectName
                ? [{ text: currentSession.projectName }]
                : []),
              ...(isConfiguring
                ? [{ text: "Timer Paused", icon: Icon.Pause }]
                : []),
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={
                    isConfiguring
                      ? "Finish Configuration"
                      : "Configure Training"
                  }
                  icon={isConfiguring ? Icon.Check : Icon.Pencil}
                  onAction={isConfiguring ? exitConfigMode : enterConfigMode}
                />
                {isConfiguring && (
                  <>
                    <ActionPanel.Section title="Task Configuration">
                      {/* Universal Icon Selection Component */}
                      {createTaskIconSelectionActions(
                        handleIconSelection,
                        currentSession.taskIcon
                      )}
                    </ActionPanel.Section>

                    {/* Quick Mood Logging */}
                    <ActionPanel.Section title="Log Current Mood">
                      {moodOptions.map((moodOption) => (
                        <Action
                          key={moodOption.mood}
                          title={`${moodOption.mood.charAt(0).toUpperCase() + moodOption.mood.slice(1)} (${moodOption.intensity}/5)`}
                          icon={moodOption.icon}
                          onAction={() =>
                            handleMoodLogging(
                              moodOption.mood,
                              moodOption.intensity
                            )
                          }
                        />
                      ))}
                    </ActionPanel.Section>
                  </>
                )}
              </ActionPanel>
            }
          />
        )}

        {currentSession.tags && currentSession.tags.length > 0 && (
          <List.Item
            icon={Icon.Tag}
            title="Tags"
            subtitle={currentSession.tags.join(" ")}
            accessories={currentSession.tags.map((tag) => ({
              tag: { value: tag, color: getTagColor(tag, getTagConfig) },
            }))}
          />
        )}

        {/* Pre-round mood display */}
        {preSessionMood && (
          <List.Item
            icon={{
              source: getMoodIcon(preSessionMood.mood),
              tintColor: getMoodColor(preSessionMood.mood),
            }}
            title="Pre-Round Mood"
            subtitle={`${preSessionMood.mood.charAt(0).toUpperCase() + preSessionMood.mood.slice(1)} (${preSessionMood.intensity}/5)`}
            accessories={[
              {
                text: formatDistanceToNow(new Date(preSessionMood.timestamp), {
                  addSuffix: true,
                }),
              },
            ]}
          />
        )}

        {/* Post-round mood display */}
        {postSessionMood && (
          <List.Item
            icon={{
              source: getMoodIcon(postSessionMood.mood),
              tintColor: getMoodColor(postSessionMood.mood),
            }}
            title="Post-Round Mood"
            subtitle={`${postSessionMood.mood.charAt(0).toUpperCase() + postSessionMood.mood.slice(1)} (${postSessionMood.intensity}/5)`}
            accessories={[
              {
                text: formatDistanceToNow(new Date(postSessionMood.timestamp), {
                  addSuffix: true,
                }),
              },
            ]}
          />
        )}
      </List.Section>
    </>
  );
}
