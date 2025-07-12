import {
  Action,
  ActionPanel,
  Form,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
  Color,
  getPreferenceValues,
} from "@raycast/api";
import { useState, useMemo } from "react";
import { useTimerStore } from "./store/timer-store";
import { dataService } from "./services/data-service";
import { applicationTrackingService } from "./services/application-tracking-service";
import { adhdSupportService } from "./services/adhd-support-service";
import {
  formatTime,
  formatDuration,
  calculateProductivityScore,
} from "./utils/helpers";
import {
  SessionType,
  TimerSession,
  MoodEntry,
  MoodAnalytics,
} from "./types/timer";
import { MoodLoggingForm, MoodHistoryList } from "./components/mood-tracking";
import { MoodEntryDetail } from "./components/mood-entry-detail";
import { moodTrackingService } from "./services/mood-tracking-service";
import { formatDistanceToNow } from "date-fns";
import {
  SESSION_ICONS,
  ACTION_ICONS,
  STATUS_COLORS,
  TRACKING_COLORS,
  MOOD_ICONS,
  MOOD_COLORS,
  ACHIEVEMENT_COLORS,
  ACHIEVEMENT_ICONS,
  getFocusQualityColor,
  getFocusQualityText,
  getAppRankingColor,
  getSessionStateDot,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
} from "./constants/design-tokens";

type ViewMode =
  | "overview"
  | "settings"
  | "statistics"
  | "achievements"
  | "mood";

interface Preferences {
  enableApplicationTracking: boolean;
}

export default function ProfileCommand() {
  const preferences: Preferences = getPreferenceValues();
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const {
    config,
    updateConfig,
    stats,
    history,
    rewardSystem,
    hyperfocusDetection,
    moodEntries,
    addMoodEntry,
    deleteMoodEntry,
    getMoodAnalytics,
  } = useTimerStore();
  const { push } = useNavigation();

  // Calculate detailed statistics
  const detailedStats = useMemo(() => {
    return dataService.calculateDetailedStats(history);
  }, [history]);

  // Calculate user profile metrics
  const profileMetrics = useMemo(() => {
    const pointsForNextLevel = adhdSupportService.getPointsForNextLevel(
      rewardSystem.points
    );
    const progressToNextLevel = Math.round(
      ((rewardSystem.points - Math.pow(rewardSystem.level - 1, 2) * 50) /
        (Math.pow(rewardSystem.level, 2) * 50 -
          Math.pow(rewardSystem.level - 1, 2) * 50)) *
        100
    );

    const recentAchievements = rewardSystem.achievements
      .filter((a) => a.unlockedAt)
      .sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      pointsForNextLevel,
      progressToNextLevel,
      recentAchievements,
      totalAchievements: rewardSystem.achievements.filter((a) => a.unlockedAt)
        .length,
      availableAchievements: adhdSupportService.getDefaultAchievements().length,
    };
  }, [rewardSystem]);

  // Simplified Profile page with essential information
  const renderOverview = () => {
    // Get recent achievements (last 2-3 for profile)
    const recentAchievements = rewardSystem.achievements
      .filter((a) => a.unlockedAt)
      .sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);

    // Get most recent mood entry
    const lastMoodEntry =
      moodEntries.length > 0 ? moodEntries[moodEntries.length - 1] : null;

    // Get most recent session
    const lastSession = history.length > 0 ? history[history.length - 1] : null;

    // Helper function to get session completion status
    const getSessionStatus = (session: TimerSession) => {
      if (session.completed) {
        return {
          status: "Completed",
          color: STATUS_COLORS.SUCCESS,
          icon: Icon.CheckCircle,
        };
      } else if (session.endTime && !session.completed) {
        return {
          status: "Manual Stop",
          color: STATUS_COLORS.WARNING,
          icon: Icon.Stop,
        };
      } else {
        return {
          status: "Incomplete",
          color: STATUS_COLORS.ERROR,
          icon: Icon.XMarkCircle,
        };
      }
    };

    return (
      <>
        {/* Level Information Section */}
        <List.Section title="Level">
          <List.Item
            title={`Level ${rewardSystem.level} Focus Master`}
            subtitle={`${rewardSystem.points} points • ${profileMetrics.pointsForNextLevel} to next level`}
            icon={{ source: Icon.Person, tintColor: STATUS_COLORS.PRIMARY }}
            accessories={[
              {
                text: `${profileMetrics.progressToNextLevel}%`,
                tooltip: `${profileMetrics.progressToNextLevel}% progress to level ${rewardSystem.level + 1}`,
              },
              {
                icon: { source: Icon.Circle, tintColor: STATUS_COLORS.SUCCESS },
                tooltip: `Level ${rewardSystem.level}`,
              },
            ]}
          />
        </List.Section>

        {/* Recent Achievements Section */}
        {recentAchievements.length > 0 && (
          <List.Section title="Recent Achievements">
            {recentAchievements.map((achievement) => {
              const styling = getAchievementStyling(achievement);
              return (
                <List.Item
                  key={achievement.id}
                  title={achievement.name}
                  subtitle={achievement.description}
                  icon={{
                    source: achievement.icon,
                    tintColor: styling.iconColor,
                  }}
                  accessories={[
                    {
                      text: `+${achievement.points}`,
                      tooltip: `${achievement.points} points earned`,
                    },
                    {
                      icon: {
                        source: styling.accessoryIcon,
                        tintColor: styling.accessoryColor,
                      },
                      tooltip: styling.tooltip,
                    },
                  ]}
                />
              );
            })}
          </List.Section>
        )}

        {/* Last Mood Entry Section */}
        {lastMoodEntry && (
          <List.Section title="Last Mood Entry">
            <List.Item
              title={`${lastMoodEntry.mood.charAt(0).toUpperCase() + lastMoodEntry.mood.slice(1)}`}
              subtitle={
                lastMoodEntry.notes ||
                `Intensity: ${lastMoodEntry.intensity}/5 • ${formatDistanceToNow(lastMoodEntry.timestamp, { addSuffix: true })}`
              }
              icon={{
                source: getMoodIcon(lastMoodEntry.mood),
                tintColor: getMoodColor(lastMoodEntry.mood),
              }}
              accessories={[
                { text: `${lastMoodEntry.intensity}/5` },
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor: getMoodIntensityColor(lastMoodEntry.intensity),
                  },
                  tooltip: `${lastMoodEntry.context} - ${formatDistanceToNow(lastMoodEntry.timestamp, { addSuffix: true })}`,
                },
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="View Details"
                    icon={ACTION_ICONS.VIEW_DETAILS}
                    onAction={() =>
                      push(<MoodEntryDetail entry={lastMoodEntry} />)
                    }
                  />
                  <Action
                    title="Log New Mood"
                    icon={ACTION_ICONS.SAVE}
                    onAction={() => push(<MoodLoggingForm />)}
                  />
                </ActionPanel>
              }
            />
          </List.Section>
        )}

        {/* Last Session Info Section */}
        {lastSession && (
          <List.Section title="Last Session Info">
            <List.Item
              title={lastSession.taskName || "Focus Session"}
              subtitle={`${formatDuration(lastSession.endTime ? new Date(lastSession.endTime).getTime() - new Date(lastSession.startTime).getTime() : lastSession.duration * 1000)} • ${formatDistanceToNow(new Date(lastSession.startTime), { addSuffix: true })}`}
              icon={{
                source: getSessionStatus(lastSession).icon,
                tintColor: getSessionStatus(lastSession).color,
              }}
              accessories={[
                {
                  text: getSessionStatus(lastSession).status,
                  tooltip: `Session ${getSessionStatus(lastSession).status.toLowerCase()}`,
                },
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor: getSessionStatus(lastSession).color,
                  },
                  tooltip: `Session completion status`,
                },
              ]}
            />
          </List.Section>
        )}

        {/* Empty state when no data */}
        {recentAchievements.length === 0 && !lastMoodEntry && !lastSession && (
          <List.Section title="Getting Started">
            <List.Item
              title="No recent activity"
              subtitle="Start a focus session to see your profile information"
              icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.NEUTRAL }}
              accessories={[
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor: STATUS_COLORS.NEUTRAL,
                  },
                  tooltip: "Start using the timer to see your activity",
                },
              ]}
            />
          </List.Section>
        )}
      </>
    );
  };

  // Enhanced achievement display with distinctive visual elements
  const getRarityColor = (rarity: string): Color => {
    switch (rarity) {
      case "legendary":
        return ACHIEVEMENT_COLORS.LEGENDARY;
      case "epic":
        return ACHIEVEMENT_COLORS.EPIC;
      case "rare":
        return ACHIEVEMENT_COLORS.RARE;
      default:
        return ACHIEVEMENT_COLORS.COMMON;
    }
  };

  const getRarityIcon = (rarity: string): Icon => {
    switch (rarity) {
      case "legendary":
        return ACHIEVEMENT_ICONS.LEGENDARY;
      case "epic":
        return ACHIEVEMENT_ICONS.EPIC;
      case "rare":
        return ACHIEVEMENT_ICONS.RARE;
      default:
        return ACHIEVEMENT_ICONS.COMMON;
    }
  };

  // Check if achievement was unlocked recently (within last 7 days)
  const isRecentlyUnlocked = (unlockedAt?: Date): boolean => {
    if (!unlockedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(unlockedAt) > weekAgo;
  };

  // Get enhanced achievement styling with special effects for recent unlocks
  const getAchievementStyling = (achievement: any) => {
    const isRecent = isRecentlyUnlocked(achievement.unlockedAt);
    const baseColor = getRarityColor(achievement.rarity);

    return {
      iconColor: isRecent ? ACHIEVEMENT_COLORS.RECENT : baseColor,
      accessoryIcon: isRecent
        ? ACHIEVEMENT_ICONS.RECENT
        : getRarityIcon(achievement.rarity),
      accessoryColor: isRecent ? ACHIEVEMENT_COLORS.RECENT : baseColor,
      tooltip: isRecent
        ? `${achievement.rarity} achievement - unlocked recently!`
        : `${achievement.rarity} achievement - unlocked ${
            achievement.unlockedAt
              ? formatDistanceToNow(new Date(achievement.unlockedAt), {
                  addSuffix: true,
                })
              : ""
          }`,
    };
  };

  function renderUnifiedProfile() {
    const moodAnalytics = getMoodAnalytics();
    const recentMoodEntries = moodEntries.slice(-3); // Last 3 entries for compact display

    // Get recent achievements (last 5)
    const recentAchievements = rewardSystem.achievements
      .filter((a) => a.unlockedAt)
      .sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    const availableAchievements = adhdSupportService.getDefaultAchievements();
    const totalAchievements = rewardSystem.achievements.filter(
      (a) => a.unlockedAt
    ).length;

    return (
      <>
        {/* Profile Overview Section */}
        <List.Section title="Profile Overview">
          <List.Item
            title={`Level ${rewardSystem.level}`}
            subtitle={`${rewardSystem.points} points • ${stats.streakCount} day streak`}
            icon={{ source: Icon.Person, tintColor: STATUS_COLORS.PRIMARY }}
            accessories={[
              { text: `Lv.${rewardSystem.level}` },
              {
                icon: { source: Icon.Circle, tintColor: STATUS_COLORS.SUCCESS },
                tooltip: "Current level and points",
              },
            ]}
          />

          <List.Item
            title="Today's Progress"
            subtitle={`${stats.todaysSessions}/${rewardSystem.dailyGoal} rounds completed`}
            icon={{ source: Icon.BullsEye, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              { text: `${stats.todaysSessions}/${rewardSystem.dailyGoal}` },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor:
                    stats.todaysSessions >= rewardSystem.dailyGoal
                      ? STATUS_COLORS.SUCCESS
                      : STATUS_COLORS.INFO,
                },
                tooltip:
                  stats.todaysSessions >= rewardSystem.dailyGoal
                    ? "Daily goal achieved!"
                    : "Keep going!",
              },
            ]}
          />
        </List.Section>

        {/* Recent Achievements Section - Enhanced Display */}
        {recentAchievements.length > 0 && (
          <List.Section
            title={`Recent Achievements (${totalAchievements}/${availableAchievements.length})`}
          >
            {recentAchievements.map((achievement) => {
              const styling = getAchievementStyling(achievement);
              return (
                <List.Item
                  key={achievement.id}
                  title={achievement.name}
                  subtitle={achievement.description}
                  icon={{
                    source: achievement.icon,
                    tintColor: styling.iconColor,
                  }}
                  accessories={[
                    {
                      text: `+${achievement.points}`,
                      tooltip: `${achievement.points} points earned`,
                    },
                    {
                      icon: {
                        source: styling.accessoryIcon,
                        tintColor: styling.accessoryColor,
                      },
                      tooltip: styling.tooltip,
                    },
                  ]}
                />
              );
            })}
          </List.Section>
        )}

        {/* Key Statistics Section - Enhanced with better visual hierarchy */}
        <List.Section title="Key Statistics">
          <List.Item
            title="Total Focus Time"
            subtitle={`${formatDuration(stats.totalWorkTime)} across ${stats.totalSessions} sessions`}
            icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              {
                text: formatDuration(stats.totalWorkTime),
                tooltip: `${stats.totalSessions} total sessions`,
              },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor:
                    stats.totalWorkTime > 0
                      ? STATUS_COLORS.INFO
                      : STATUS_COLORS.NEUTRAL,
                },
                tooltip: "Total time spent in focus sessions",
              },
            ]}
          />

          <List.Item
            title="Success Rate"
            subtitle={`${stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}% completion rate`}
            icon={{
              source: Icon.CheckCircle,
              tintColor:
                stats.totalSessions > 0 &&
                stats.completedSessions / stats.totalSessions >= 0.8
                  ? STATUS_COLORS.SUCCESS
                  : stats.totalSessions > 0 &&
                      stats.completedSessions / stats.totalSessions >= 0.6
                    ? STATUS_COLORS.WARNING
                    : STATUS_COLORS.ERROR,
            }}
            accessories={[
              {
                text: `${stats.completedSessions}/${stats.totalSessions}`,
                tooltip: "Completed vs total sessions",
              },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor:
                    stats.totalSessions > 0 &&
                    stats.completedSessions / stats.totalSessions >= 0.8
                      ? STATUS_COLORS.SUCCESS
                      : stats.totalSessions > 0 &&
                          stats.completedSessions / stats.totalSessions >= 0.6
                        ? STATUS_COLORS.WARNING
                        : STATUS_COLORS.ERROR,
                },
                tooltip: "Session completion performance",
              },
            ]}
          />

          <List.Item
            title="Weekly Progress"
            subtitle={`${stats.weekSessions} rounds • ${Math.round((stats.weekSessions / 7) * 10) / 10} avg/day`}
            icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              {
                text: `${stats.weekSessions}/week`,
                tooltip: `Average ${Math.round((stats.weekSessions / 7) * 10) / 10} rounds per day`,
              },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor:
                    stats.weekSessions >= 7 // At least 1 per day
                      ? STATUS_COLORS.SUCCESS
                      : stats.weekSessions >= 3 // At least 3 per week
                        ? STATUS_COLORS.INFO
                        : STATUS_COLORS.NEUTRAL,
                },
                tooltip:
                  stats.weekSessions >= 7
                    ? "Great weekly consistency!"
                    : stats.weekSessions >= 3
                      ? "Good weekly progress"
                      : "Room for improvement",
              },
            ]}
          />

          {/* Add current streak if it exists */}
          {stats.streakCount > 0 && (
            <List.Item
              title="Current Streak"
              subtitle={`${stats.streakCount} consecutive days of focus`}
              icon={{
                source: Icon.Bolt,
                tintColor:
                  stats.streakCount >= 7
                    ? STATUS_COLORS.SUCCESS
                    : stats.streakCount >= 3
                      ? STATUS_COLORS.WARNING
                      : STATUS_COLORS.INFO,
              }}
              accessories={[
                {
                  text: `${stats.streakCount} days`,
                  tooltip: "Consecutive days with completed sessions",
                },
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor:
                      stats.streakCount >= 7
                        ? STATUS_COLORS.SUCCESS
                        : stats.streakCount >= 3
                          ? STATUS_COLORS.WARNING
                          : STATUS_COLORS.INFO,
                  },
                  tooltip:
                    stats.streakCount >= 7
                      ? "Amazing streak! Keep it up!"
                      : stats.streakCount >= 3
                        ? "Building momentum!"
                        : "Great start!",
                },
              ]}
            />
          )}
        </List.Section>

        {/* Recent Mood Entries Section */}
        {recentMoodEntries.length > 0 && (
          <List.Section title="Recent Mood">
            {recentMoodEntries.map((entry) => (
              <List.Item
                key={entry.id}
                title={`${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}`}
                subtitle={entry.notes || `Intensity: ${entry.intensity}/5`}
                icon={{
                  source: getMoodIcon(entry.mood),
                  tintColor: getMoodColor(entry.mood),
                }}
                accessories={[
                  { text: `${entry.intensity}/5` },
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: getMoodIntensityColor(entry.intensity),
                    },
                    tooltip: `${entry.context} - ${formatDistanceToNow(entry.timestamp, { addSuffix: true })}`,
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action
                      title="View Details"
                      icon={ACTION_ICONS.VIEW_DETAILS}
                      onAction={() => push(<MoodEntryDetail entry={entry} />)}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        )}

        {/* ADHD Settings Section - Compact */}
        <List.Section title="ADHD Features">
          <List.Item
            title="Adaptive Timers"
            subtitle={config.enableAdaptiveTimers ? "Enabled" : "Disabled"}
            icon={{
              source: Icon.Clock,
              tintColor: config.enableAdaptiveTimers
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.NEUTRAL,
            }}
            accessories={[
              {
                icon: {
                  source: config.enableAdaptiveTimers
                    ? Icon.CheckCircle
                    : Icon.Circle,
                  tintColor: config.enableAdaptiveTimers
                    ? STATUS_COLORS.SUCCESS
                    : STATUS_COLORS.NEUTRAL,
                },
                tooltip: config.enableAdaptiveTimers
                  ? "Adaptive timers enabled"
                  : "Adaptive timers disabled",
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={
                    config.enableAdaptiveTimers
                      ? "Disable Adaptive Timers"
                      : "Enable Adaptive Timers"
                  }
                  icon={
                    config.enableAdaptiveTimers
                      ? Icon.XMarkCircle
                      : Icon.CheckCircle
                  }
                  onAction={() => {
                    updateConfig({
                      enableAdaptiveTimers: !config.enableAdaptiveTimers,
                    });
                    showToast({
                      style: Toast.Style.Success,
                      title: config.enableAdaptiveTimers
                        ? "Adaptive Timers Disabled"
                        : "Adaptive Timers Enabled",
                    });
                  }}
                />
              </ActionPanel>
            }
          />

          <List.Item
            title="Reward System"
            subtitle={config.enableRewardSystem ? "Enabled" : "Disabled"}
            icon={{
              source: Icon.Trophy,
              tintColor: config.enableRewardSystem
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.NEUTRAL,
            }}
            accessories={[
              {
                icon: {
                  source: config.enableRewardSystem
                    ? Icon.CheckCircle
                    : Icon.Circle,
                  tintColor: config.enableRewardSystem
                    ? STATUS_COLORS.SUCCESS
                    : STATUS_COLORS.NEUTRAL,
                },
                tooltip: config.enableRewardSystem
                  ? "Reward system enabled"
                  : "Reward system disabled",
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={
                    config.enableRewardSystem
                      ? "Disable Rewards"
                      : "Enable Rewards"
                  }
                  icon={
                    config.enableRewardSystem
                      ? Icon.XMarkCircle
                      : Icon.CheckCircle
                  }
                  onAction={() => {
                    updateConfig({
                      enableRewardSystem: !config.enableRewardSystem,
                    });
                    showToast({
                      style: Toast.Style.Success,
                      title: config.enableRewardSystem
                        ? "Reward System Disabled"
                        : "Reward System Enabled",
                    });
                  }}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      </>
    );
  }

  // Render functions for different views
  const renderSettings = () => (
    <>
      <List.Section title="Timer Settings">
        <List.Item
          title="Work Duration"
          subtitle={`${config.workDuration} minutes`}
          icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.PRIMARY }}
          accessories={[
            {
              text: `${config.workDuration}m`,
              tooltip: "Duration of work sessions",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Work Duration"
                icon={Icon.Pencil}
                onAction={() => push(<TimerDurationSettings type="work" />)}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Short Break Duration"
          subtitle={`${config.shortBreakDuration} minutes`}
          icon={{ source: Icon.Pause, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            {
              text: `${config.shortBreakDuration}m`,
              tooltip: "Duration of short breaks",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Short Break Duration"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<TimerDurationSettings type="shortBreak" />)
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Long Break Duration"
          subtitle={`${config.longBreakDuration} minutes`}
          icon={{ source: Icon.Pause, tintColor: STATUS_COLORS.WARNING }}
          accessories={[
            {
              text: `${config.longBreakDuration}m`,
              tooltip: "Duration of long breaks",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Long Break Duration"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<TimerDurationSettings type="longBreak" />)
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Long Break Interval"
          subtitle={`Every ${config.longBreakInterval} work sessions`}
          icon={{ source: Icon.Repeat, tintColor: STATUS_COLORS.ACCENT }}
          accessories={[
            {
              text: `${config.longBreakInterval}x`,
              tooltip: "Work sessions before long break",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Long Break Interval"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<TimerDurationSettings type="longBreakInterval" />)
                }
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Automation">
        <List.Item
          title="Auto-start Breaks"
          subtitle={config.autoStartBreaks ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Play,
            tintColor: config.autoStartBreaks
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.autoStartBreaks ? Icon.CheckCircle : Icon.Circle,
                tintColor: config.autoStartBreaks
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.autoStartBreaks
                ? "Breaks start automatically"
                : "Manual break start",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={config.autoStartBreaks ? "Disable" : "Enable"}
                icon={
                  config.autoStartBreaks ? Icon.XMarkCircle : Icon.CheckCircle
                }
                onAction={() =>
                  updateConfig({ autoStartBreaks: !config.autoStartBreaks })
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Auto-start Work"
          subtitle={config.autoStartWork ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Play,
            tintColor: config.autoStartWork
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.autoStartWork ? Icon.CheckCircle : Icon.Circle,
                tintColor: config.autoStartWork
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.autoStartWork
                ? "Work sessions start automatically"
                : "Manual work start",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={config.autoStartWork ? "Disable" : "Enable"}
                icon={
                  config.autoStartWork ? Icon.XMarkCircle : Icon.CheckCircle
                }
                onAction={() =>
                  updateConfig({ autoStartWork: !config.autoStartWork })
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Audio Notifications"
          subtitle={config.enableNotifications ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.SpeakerOn,
            tintColor: config.enableNotifications
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.enableNotifications
                  ? Icon.CheckCircle
                  : Icon.Circle,
                tintColor: config.enableNotifications
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.enableNotifications
                ? "Audio notifications enabled"
                : "Audio notifications disabled",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={config.enableNotifications ? "Disable" : "Enable"}
                icon={
                  config.enableNotifications
                    ? Icon.XMarkCircle
                    : Icon.CheckCircle
                }
                onAction={() =>
                  updateConfig({
                    enableNotifications: !config.enableNotifications,
                  })
                }
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Application Tracking">
        <List.Item
          title="Enable Tracking"
          subtitle={config.enableApplicationTracking ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Desktop,
            tintColor: config.enableApplicationTracking
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.enableApplicationTracking
                  ? Icon.CheckCircle
                  : Icon.Circle,
                tintColor: config.enableApplicationTracking
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.enableApplicationTracking
                ? "Application usage tracking enabled"
                : "Application usage tracking disabled",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={config.enableApplicationTracking ? "Disable" : "Enable"}
                icon={
                  config.enableApplicationTracking
                    ? Icon.XMarkCircle
                    : Icon.CheckCircle
                }
                onAction={() =>
                  updateConfig({
                    enableApplicationTracking:
                      !config.enableApplicationTracking,
                  })
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Tracking Interval"
          subtitle={`Every ${config.trackingInterval} seconds`}
          icon={{ source: Icon.Stopwatch, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            {
              text: `${config.trackingInterval}s`,
              tooltip: "How often to check active application",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Tracking Interval"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<TimerDurationSettings type="trackingInterval" />)
                }
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="ADHD Features">
        <List.Item
          title="Adaptive Timers"
          subtitle={config.enableAdaptiveTimers ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Clock,
            tintColor: config.enableAdaptiveTimers
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.enableAdaptiveTimers
                  ? Icon.CheckCircle
                  : Icon.Circle,
                tintColor: config.enableAdaptiveTimers
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.enableAdaptiveTimers
                ? "Adaptive timers enabled"
                : "Adaptive timers disabled",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={
                  config.enableAdaptiveTimers
                    ? "Disable Adaptive Timers"
                    : "Enable Adaptive Timers"
                }
                icon={
                  config.enableAdaptiveTimers
                    ? Icon.XMarkCircle
                    : Icon.CheckCircle
                }
                onAction={() => {
                  updateConfig({
                    enableAdaptiveTimers: !config.enableAdaptiveTimers,
                  });
                  showToast({
                    style: Toast.Style.Success,
                    title: config.enableAdaptiveTimers
                      ? "Adaptive Timers Disabled"
                      : "Adaptive Timers Enabled",
                  });
                }}
              />
            </ActionPanel>
          }
        />

        <List.Item
          title="Reward System"
          subtitle={config.enableRewardSystem ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Trophy,
            tintColor: config.enableRewardSystem
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.enableRewardSystem
                  ? Icon.CheckCircle
                  : Icon.Circle,
                tintColor: config.enableRewardSystem
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.enableRewardSystem
                ? "Reward system enabled"
                : "Reward system disabled",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={
                  config.enableRewardSystem
                    ? "Disable Rewards"
                    : "Enable Rewards"
                }
                icon={
                  config.enableRewardSystem
                    ? Icon.XMarkCircle
                    : Icon.CheckCircle
                }
                onAction={() => {
                  updateConfig({
                    enableRewardSystem: !config.enableRewardSystem,
                  });
                  showToast({
                    style: Toast.Style.Success,
                    title: config.enableRewardSystem
                      ? "Reward System Disabled"
                      : "Reward System Enabled",
                  });
                }}
              />
            </ActionPanel>
          }
        />

        <List.Item
          title="Hyperfocus Detection"
          subtitle={config.enableHyperfocusDetection ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.BullsEye,
            tintColor: config.enableHyperfocusDetection
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.enableHyperfocusDetection
                  ? Icon.CheckCircle
                  : Icon.Circle,
                tintColor: config.enableHyperfocusDetection
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.enableHyperfocusDetection
                ? "Hyperfocus detection enabled"
                : "Hyperfocus detection disabled",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={
                  config.enableHyperfocusDetection
                    ? "Disable Detection"
                    : "Enable Detection"
                }
                icon={
                  config.enableHyperfocusDetection
                    ? Icon.XMarkCircle
                    : Icon.CheckCircle
                }
                onAction={() => {
                  updateConfig({
                    enableHyperfocusDetection:
                      !config.enableHyperfocusDetection,
                  });
                  showToast({
                    style: Toast.Style.Success,
                    title: config.enableHyperfocusDetection
                      ? "Hyperfocus Detection Disabled"
                      : "Hyperfocus Detection Enabled",
                  });
                }}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="General Settings">
        <List.Item
          title="Transition Warnings"
          subtitle={config.enableTransitionWarnings ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Bell,
            tintColor: config.enableTransitionWarnings
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.enableTransitionWarnings
                  ? Icon.CheckCircle
                  : Icon.Circle,
                tintColor: config.enableTransitionWarnings
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.enableTransitionWarnings
                ? "Transition warnings enabled"
                : "Transition warnings disabled",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={
                  config.enableTransitionWarnings
                    ? "Disable Warnings"
                    : "Enable Warnings"
                }
                icon={
                  config.enableTransitionWarnings
                    ? Icon.XMarkCircle
                    : Icon.CheckCircle
                }
                onAction={() => {
                  updateConfig({
                    enableTransitionWarnings: !config.enableTransitionWarnings,
                  });
                  showToast({
                    style: Toast.Style.Success,
                    title: config.enableTransitionWarnings
                      ? "Transition Warnings Disabled"
                      : "Transition Warnings Enabled",
                  });
                }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </>
  );

  return (
    <List
      navigationTitle="Focus Profile"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select View"
          value={viewMode}
          onChange={(newValue) => setViewMode(newValue as ViewMode)}
        >
          <List.Dropdown.Item
            title="Profile"
            value="overview"
            icon={Icon.Person}
          />
          <List.Dropdown.Item
            title="Settings"
            value="settings"
            icon={Icon.Gear}
          />
          <List.Dropdown.Item
            title="Statistics"
            value="statistics"
            icon={Icon.BarChart}
          />
          <List.Dropdown.Item
            title="Achievements"
            value="achievements"
            icon={Icon.Trophy}
          />
          <List.Dropdown.Item
            title="Mood Tracking"
            value="mood"
            icon={Icon.Heart}
          />
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action
              title="Export Profile Data"
              icon={ACTION_ICONS.COPY}
              onAction={async () => {
                const jsonData = dataService.exportDataAsJSON();
                console.log("Profile data exported:", jsonData);
                showToast({
                  style: Toast.Style.Success,
                  title: "Profile Data Exported",
                  message: "Check console for exported data",
                });
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      {viewMode === "overview" && renderOverview()}
      {viewMode === "settings" && renderSettings()}
      {viewMode === "statistics" && renderStatistics()}
      {viewMode === "achievements" && renderAchievements()}
      {viewMode === "mood" && renderMoodTracking()}

      {history.length === 0 && viewMode === "statistics" && (
        <List.EmptyView
          title="No statistics available"
          description="Start a focus round to see your statistics"
          icon={Icon.BarChart}
        />
      )}
    </List>
  );

  // Other render functions are defined above

  function renderStatistics() {
    // Calculate mood analytics for statistics view
    const moodAnalytics = moodEntries.length === 0 ? null : getMoodAnalytics();

    // Calculate today's sessions
    const todaysSessions = history.filter((s) => {
      const sessionDate = new Date(s.startTime);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    }).length;

    return (
      <>
        {/* Daily Overview Section */}
        <List.Section title="Daily Overview">
          <List.Item
            title="Today's Sessions"
            subtitle={`${todaysSessions} rounds completed today`}
            icon={{
              source: SESSION_ICONS.WORK,
              tintColor: STATUS_COLORS.SUCCESS,
            }}
            accessories={[
              {
                text: `${stats.streakCount} day streak`,
                icon: { source: Icon.Trophy, tintColor: STATUS_COLORS.SUCCESS },
                tooltip: "Current daily streak",
              },
            ]}
          />
          <List.Item
            title="Total Sessions"
            subtitle={`${stats.completedSessions} completed of ${stats.totalSessions} total`}
            icon={{ source: Icon.BarChart, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              {
                text: `${Math.round((stats.completedSessions / Math.max(stats.totalSessions, 1)) * 100)}%`,
                icon: { source: Icon.Circle, tintColor: STATUS_COLORS.INFO },
                tooltip: "Overall completion rate",
              },
            ]}
          />
        </List.Section>

        {/* Mood Statistics Section */}
        {moodAnalytics && (
          <List.Section title="Mood Analytics">
            <List.Item
              title="Most Common Mood"
              subtitle={`${moodAnalytics.mostCommonMood.charAt(0).toUpperCase() + moodAnalytics.mostCommonMood.slice(1)} (${moodAnalytics.totalEntries} entries)`}
              icon={{
                source: getMoodIcon(moodAnalytics.mostCommonMood),
                tintColor: getMoodColor(moodAnalytics.mostCommonMood),
              }}
              accessories={[
                {
                  text: `${moodAnalytics.averageIntensity.toFixed(1)}/5`,
                  icon: {
                    source: Icon.Circle,
                    tintColor: STATUS_COLORS.ACCENT,
                  },
                  tooltip: "Average intensity",
                },
              ]}
            />
            {moodAnalytics.bestPerformanceMoods.length > 0 && (
              <List.Item
                title="Best Performance Moods"
                subtitle={moodAnalytics.bestPerformanceMoods
                  .map((mood) => mood.charAt(0).toUpperCase() + mood.slice(1))
                  .join(", ")}
                icon={{
                  source: MOOD_ICONS.MOTIVATED,
                  tintColor: STATUS_COLORS.SUCCESS,
                }}
                accessories={[
                  {
                    text: "Optimal",
                    icon: {
                      source: Icon.Star,
                      tintColor: STATUS_COLORS.SUCCESS,
                    },
                    tooltip: "Moods with highest session completion rates",
                  },
                ]}
              />
            )}
          </List.Section>
        )}

        <List.Section title="Performance Analysis">
          <List.Item
            title="Average Session Length"
            subtitle={`${Math.round(detailedStats.averageSessionLength)} minutes per focus round`}
            icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              { text: `${Math.round(detailedStats.averageSessionLength)}m` },
              {
                icon: { source: Icon.Circle, tintColor: STATUS_COLORS.INFO },
                tooltip: "Average duration per session",
              },
            ]}
          />

          <List.Item
            title="Completion Rate"
            subtitle={`${Math.round(detailedStats.completionRate)}% sessions completed successfully`}
            icon={{
              source: Icon.CheckCircle,
              tintColor: STATUS_COLORS.SUCCESS,
            }}
            accessories={[
              {
                text: `${Math.round(detailedStats.completionRate)}%`,
              },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor: STATUS_COLORS.SUCCESS,
                },
                tooltip: "Session completion rate",
              },
            ]}
          />

          <List.Item
            title="Most Productive Time"
            subtitle={
              detailedStats.mostProductiveHour
                ? `${detailedStats.mostProductiveHour}:00 - ${detailedStats.mostProductiveHour + 1}:00`
                : "No data"
            }
            icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.SUCCESS }}
            accessories={[
              {
                icon: { source: Icon.Circle, tintColor: STATUS_COLORS.SUCCESS },
                tooltip: "Your most productive hour of the day",
              },
            ]}
          />
        </List.Section>

        <List.Section title="Recent Activity">
          <List.Item
            title="This Week"
            subtitle={`${stats.weekSessions} rounds in the last 7 days`}
            icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              { text: stats.weekSessions.toString() },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor:
                    stats.weekSessions > 0
                      ? STATUS_COLORS.INFO
                      : STATUS_COLORS.NEUTRAL,
                },
                tooltip: "Rounds this week",
              },
            ]}
          />

          <List.Item
            title="This Month"
            subtitle={`${stats.monthSessions} rounds in the last 30 days`}
            icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              { text: stats.monthSessions.toString() },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor:
                    stats.monthSessions > 0
                      ? STATUS_COLORS.INFO
                      : STATUS_COLORS.NEUTRAL,
                },
                tooltip: "Rounds this month",
              },
            ]}
          />
        </List.Section>

        {preferences.enableApplicationTracking && (
          <List.Section title="Application Usage">
            <List.Item
              title="Top Applications"
              subtitle="View detailed application usage statistics"
              icon={{ source: Icon.Desktop, tintColor: STATUS_COLORS.INFO }}
              actions={
                <ActionPanel>
                  <Action
                    title="View Application Details"
                    icon={ACTION_ICONS.VIEW_DETAILS}
                    onAction={() => {
                      // This would show detailed app usage
                      showToast({
                        style: Toast.Style.Success,
                        title: "Feature Coming Soon",
                        message: "Detailed application tracking view",
                      });
                    }}
                  />
                </ActionPanel>
              }
            />
          </List.Section>
        )}
      </>
    );
  }

  function renderAchievements() {
    const unlockedAchievements = rewardSystem.achievements.filter(
      (a) => a.unlockedAt
    );
    const availableAchievements = adhdSupportService.getDefaultAchievements();
    const lockedAchievements = availableAchievements.filter(
      (a) => !rewardSystem.achievements.some((ua) => ua.id === a.id)
    );

    return (
      <>
        <List.Section
          title={`Unlocked Achievements (${unlockedAchievements.length})`}
        >
          {unlockedAchievements.map((achievement) => {
            const styling = getAchievementStyling(achievement);
            return (
              <List.Item
                key={achievement.id}
                title={achievement.name}
                subtitle={achievement.description}
                icon={{
                  source: achievement.icon,
                  tintColor: styling.iconColor,
                }}
                accessories={[
                  {
                    text: `+${achievement.points}`,
                    tooltip: `${achievement.points} points earned`,
                  },
                  {
                    icon: {
                      source: styling.accessoryIcon,
                      tintColor: styling.accessoryColor,
                    },
                    tooltip: styling.tooltip,
                  },
                ]}
              />
            );
          })}
        </List.Section>

        <List.Section
          title={`Available Achievements (${lockedAchievements.length})`}
        >
          {lockedAchievements.map((achievement) => (
            <List.Item
              key={achievement.id}
              title={achievement.name}
              subtitle={achievement.description}
              icon={{
                source: achievement.icon,
                tintColor: ACHIEVEMENT_COLORS.LOCKED,
              }}
              accessories={[
                { text: `+${achievement.points}` },
                {
                  icon: {
                    source: ACHIEVEMENT_ICONS.LOCKED,
                    tintColor: ACHIEVEMENT_COLORS.LOCKED,
                  },
                  tooltip: `${achievement.rarity} achievement - locked`,
                },
              ]}
            />
          ))}
        </List.Section>
      </>
    );
  }
  function renderMoodTracking() {
    const moodAnalytics = getMoodAnalytics();
    const recentMoodEntries = moodEntries.slice(-10); // Last 10 entries
    const todaysMoods = moodTrackingService.getTodaysMoodEntries(moodEntries);

    return (
      <>
        <List.Section title="Mood Overview">
          <List.Item
            title="Log Current Mood"
            subtitle="Quick mood logging"
            icon={{ source: Icon.Heart, tintColor: STATUS_COLORS.PRIMARY }}
            accessories={[
              {
                icon: { source: Icon.Plus, tintColor: STATUS_COLORS.PRIMARY },
                tooltip: "Log your current mood",
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Log New Mood"
                  icon={ACTION_ICONS.SAVE}
                  onAction={() => push(<MoodLoggingForm />)}
                />
                <ActionPanel.Submenu title="Quick Mood Log" icon={Icon.Heart}>
                  <Action
                    title="😌 Calm (3/5)"
                    icon={{ source: Icon.Heart, tintColor: STATUS_COLORS.INFO }}
                    onAction={() => addMoodEntry("calm", 3, "standalone")}
                  />
                  <Action
                    title="😐 Neutral (3/5)"
                    icon={{
                      source: Icon.Heart,
                      tintColor: STATUS_COLORS.NEUTRAL,
                    }}
                    onAction={() => addMoodEntry("neutral", 3, "standalone")}
                  />
                  <Action
                    title="😰 Stressed (2/5)"
                    icon={{
                      source: Icon.Heart,
                      tintColor: STATUS_COLORS.ERROR,
                    }}
                    onAction={() => addMoodEntry("stressed", 2, "standalone")}
                  />
                  <Action
                    title="💪 Energized (4/5)"
                    icon={{
                      source: Icon.Heart,
                      tintColor: STATUS_COLORS.SUCCESS,
                    }}
                    onAction={() => addMoodEntry("energized", 4, "standalone")}
                  />
                  <Action
                    title="😴 Tired (2/5)"
                    icon={{
                      source: Icon.Heart,
                      tintColor: STATUS_COLORS.NEUTRAL,
                    }}
                    onAction={() => addMoodEntry("tired", 2, "standalone")}
                  />
                  <Action
                    title="🎯 Focused (4/5)"
                    icon={{
                      source: Icon.Heart,
                      tintColor: STATUS_COLORS.SUCCESS,
                    }}
                    onAction={() => addMoodEntry("focused", 4, "standalone")}
                  />
                  <Action
                    title="💪 Motivated (4/5)"
                    icon={{
                      source: Icon.Heart,
                      tintColor: STATUS_COLORS.SUCCESS,
                    }}
                    onAction={() => addMoodEntry("motivated", 4, "standalone")}
                  />
                </ActionPanel.Submenu>
              </ActionPanel>
            }
          />
          <List.Item
            title="Total Mood Entries"
            subtitle={`${moodAnalytics.totalEntries} entries logged`}
            icon={{ source: Icon.BarChart, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              { text: moodAnalytics.totalEntries.toString() },
              {
                icon: { source: Icon.Circle, tintColor: STATUS_COLORS.INFO },
                tooltip: "Total mood entries recorded",
              },
            ]}
          />

          {moodAnalytics.totalEntries > 0 && (
            <>
              <List.Item
                title="Most Common Mood"
                subtitle={`${moodAnalytics.mostCommonMood.charAt(0).toUpperCase() + moodAnalytics.mostCommonMood.slice(1)}`}
                icon={{
                  source: getMoodIcon(moodAnalytics.mostCommonMood),
                  tintColor: getMoodColor(moodAnalytics.mostCommonMood),
                }}
                accessories={[
                  {
                    text: `${moodAnalytics.moodDistribution[moodAnalytics.mostCommonMood] || 0} times`,
                  },
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: getMoodColor(moodAnalytics.mostCommonMood),
                    },
                    tooltip: "Your most frequently logged mood",
                  },
                ]}
              />

              <List.Item
                title="Average Intensity"
                subtitle={`${moodAnalytics.averageIntensity}/5 average mood intensity`}
                icon={{
                  source: Icon.BarChart,
                  tintColor: getMoodIntensityColor(
                    Math.round(moodAnalytics.averageIntensity) as
                      | 1
                      | 2
                      | 3
                      | 4
                      | 5
                  ),
                }}
                accessories={[
                  { text: `${moodAnalytics.averageIntensity}/5` },
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: getMoodIntensityColor(
                        Math.round(moodAnalytics.averageIntensity) as
                          | 1
                          | 2
                          | 3
                          | 4
                          | 5
                      ),
                    },
                    tooltip: "Average intensity of your mood entries",
                  },
                ]}
              />

              <List.Item
                title="Today's Mood Entries"
                subtitle={`${todaysMoods.length} entries logged today`}
                icon={{
                  source: Icon.Calendar,
                  tintColor: STATUS_COLORS.SUCCESS,
                }}
                accessories={[
                  { text: todaysMoods.length.toString() },
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: STATUS_COLORS.SUCCESS,
                    },
                    tooltip: "Mood entries for today",
                  },
                ]}
              />
            </>
          )}
        </List.Section>

        {moodAnalytics.bestPerformanceMoods.length > 0 && (
          <List.Section title="Performance Insights">
            <List.Item
              title="Best Performance Moods"
              subtitle={`You perform best when feeling: ${moodAnalytics.bestPerformanceMoods.join(", ")}`}
              icon={{ source: Icon.Trophy, tintColor: STATUS_COLORS.SUCCESS }}
              accessories={[
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor: STATUS_COLORS.SUCCESS,
                  },
                  tooltip: "Moods associated with high productivity",
                },
              ]}
            />
          </List.Section>
        )}

        {moodAnalytics.improvementSuggestions.length > 0 && (
          <List.Section title="Recommendations">
            {moodAnalytics.improvementSuggestions
              .slice(0, 3)
              .map((suggestion, index) => (
                <List.Item
                  key={index}
                  title={suggestion}
                  icon={{
                    source: Icon.LightBulb,
                    tintColor: STATUS_COLORS.WARNING,
                  }}
                  accessories={[
                    {
                      icon: {
                        source: Icon.Circle,
                        tintColor: STATUS_COLORS.WARNING,
                      },
                      tooltip: "Personalized recommendation",
                    },
                  ]}
                />
              ))}
          </List.Section>
        )}

        <List.Section title="Recent Mood Entries">
          <MoodHistoryList
            moodEntries={recentMoodEntries}
            onDeleteEntry={deleteMoodEntry}
            showSessionLink={true}
          />
        </List.Section>
      </>
    );
  }
}

function AdaptiveTimerSettings() {
  const { config, updateConfig } = useTimerStore();
  const [adaptiveMode, setAdaptiveMode] = useState(config.adaptiveMode);
  const [minWorkDuration, setMinWorkDuration] = useState(
    config.minWorkDuration.toString()
  );
  const [maxWorkDuration, setMaxWorkDuration] = useState(
    config.maxWorkDuration.toString()
  );
  const [adaptiveBreakRatio, setAdaptiveBreakRatio] = useState(
    config.adaptiveBreakRatio.toString()
  );

  const handleSubmit = () => {
    updateConfig({
      adaptiveMode,
      minWorkDuration: parseInt(minWorkDuration) || 10,
      maxWorkDuration: parseInt(maxWorkDuration) || 60,
      adaptiveBreakRatio: parseFloat(adaptiveBreakRatio) || 0.2,
    });
    showToast({
      style: Toast.Style.Success,
      title: "Adaptive Timer Settings Updated",
    });
  };

  return (
    <Form
      navigationTitle="Adaptive Timer Settings"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Settings"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="adaptiveMode"
        title="Adaptation Mode"
        value={adaptiveMode}
        onChange={(value) =>
          setAdaptiveMode(
            value as "energy-based" | "focus-based" | "mood-based"
          )
        }
      >
        <Form.Dropdown.Item
          value="energy-based"
          title="Energy-Based"
          icon={Icon.Bolt}
        />
        <Form.Dropdown.Item
          value="mood-based"
          title="Mood-Based"
          icon={Icon.Heart}
        />
        <Form.Dropdown.Item
          value="focus-based"
          title="Focus-Based"
          icon={Icon.BullsEye}
        />
      </Form.Dropdown>

      <Form.TextField
        id="minWorkDuration"
        title="Minimum Work Duration (minutes)"
        placeholder="15"
        value={minWorkDuration}
        onChange={setMinWorkDuration}
        info="Shortest allowed work session duration"
      />

      <Form.TextField
        id="maxWorkDuration"
        title="Maximum Work Duration (minutes)"
        placeholder="45"
        value={maxWorkDuration}
        onChange={setMaxWorkDuration}
        info="Longest allowed work session duration"
      />

      <Form.TextField
        id="adaptiveBreakRatio"
        title="Adaptive Break Ratio"
        placeholder="0.2"
        value={adaptiveBreakRatio}
        onChange={setAdaptiveBreakRatio}
        info="Break duration as ratio of work duration (0.1-0.3)"
      />
    </Form>
  );
}

function TimerDurationSettings({
  type,
}: {
  type:
    | "work"
    | "shortBreak"
    | "longBreak"
    | "longBreakInterval"
    | "trackingInterval";
}) {
  const { config, updateConfig } = useTimerStore();
  const { pop } = useNavigation();

  const getCurrentValue = () => {
    switch (type) {
      case "work":
        return config.workDuration.toString();
      case "shortBreak":
        return config.shortBreakDuration.toString();
      case "longBreak":
        return config.longBreakDuration.toString();
      case "longBreakInterval":
        return config.longBreakInterval.toString();
      case "trackingInterval":
        return config.trackingInterval.toString();
      default:
        return "25";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "work":
        return "Work Duration";
      case "shortBreak":
        return "Short Break Duration";
      case "longBreak":
        return "Long Break Duration";
      case "longBreakInterval":
        return "Long Break Interval";
      case "trackingInterval":
        return "Tracking Interval";
      default:
        return "Timer Setting";
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case "work":
        return "25";
      case "shortBreak":
        return "5";
      case "longBreak":
        return "15";
      case "longBreakInterval":
        return "4";
      case "trackingInterval":
        return "5";
      default:
        return "25";
    }
  };

  const getUnit = () => {
    switch (type) {
      case "longBreakInterval":
        return "sessions";
      case "trackingInterval":
        return "seconds";
      default:
        return "minutes";
    }
  };

  const [value, setValue] = useState(getCurrentValue());

  const handleSubmit = () => {
    const numValue = parseInt(value) || parseInt(getPlaceholder());

    switch (type) {
      case "work":
        updateConfig({ workDuration: numValue });
        break;
      case "shortBreak":
        updateConfig({ shortBreakDuration: numValue });
        break;
      case "longBreak":
        updateConfig({ longBreakDuration: numValue });
        break;
      case "longBreakInterval":
        updateConfig({ longBreakInterval: numValue });
        break;
      case "trackingInterval":
        updateConfig({ trackingInterval: numValue });
        break;
    }

    showToast({
      style: Toast.Style.Success,
      title: `${getTitle()} Updated`,
      message: `Set to ${numValue} ${getUnit()}`,
    });
    pop();
  };

  return (
    <Form
      navigationTitle={`Edit ${getTitle()}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Setting"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="value"
        title={getTitle()}
        placeholder={getPlaceholder()}
        value={value}
        onChange={setValue}
        info={`Enter the ${getTitle().toLowerCase()} in ${getUnit()}`}
      />
    </Form>
  );
}

function HyperfocusSettings() {
  const { config, updateConfig } = useTimerStore();
  const [maxConsecutiveSessions, setMaxConsecutiveSessions] = useState(
    config.maxConsecutiveSessions.toString()
  );
  const [forcedBreakAfterHours, setForcedBreakAfterHours] = useState(
    config.forcedBreakAfterHours.toString()
  );

  const handleSubmit = () => {
    updateConfig({
      maxConsecutiveSessions: parseInt(maxConsecutiveSessions) || 3,
      forcedBreakAfterHours: parseFloat(forcedBreakAfterHours) || 2.5,
    });
    showToast({
      style: Toast.Style.Success,
      title: "Hyperfocus Settings Updated",
    });
  };

  return (
    <Form
      navigationTitle="Hyperfocus Detection Settings"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Settings"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="maxConsecutiveSessions"
        title="Max Consecutive Sessions"
        placeholder="3"
        value={maxConsecutiveSessions}
        onChange={setMaxConsecutiveSessions}
        info="Number of sessions before hyperfocus warning"
      />

      <Form.TextField
        id="forcedBreakAfterHours"
        title="Forced Break After (hours)"
        placeholder="2.5"
        value={forcedBreakAfterHours}
        onChange={setForcedBreakAfterHours}
        info="Hours of continuous focus before mandatory break"
      />
    </Form>
  );
}
