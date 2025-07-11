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
import { moodTrackingService } from "./services/mood-tracking-service";
import {
  SESSION_ICONS,
  ACTION_ICONS,
  STATUS_COLORS,
  TRACKING_COLORS,
  MOOD_ICONS,
  MOOD_COLORS,
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
      .sort(
        (a, b) =>
          new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
      )
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

  const renderOverview = () => (
    <>
      <List.Section title="User Profile">
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

        <List.Item
          title="Daily Progress"
          subtitle={`${stats.todaysSessions}/${rewardSystem.dailyGoal} sessions completed today`}
          icon={{ source: Icon.BullsEye, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            {
              text: `${Math.round((stats.todaysSessions / rewardSystem.dailyGoal) * 100)}%`,
              tooltip: "Daily goal progress",
            },
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

        <List.Item
          title="Current Streak"
          subtitle={`${stats.streakCount} consecutive days`}
          icon={{ source: Icon.Bolt, tintColor: STATUS_COLORS.WARNING }}
          accessories={[
            { text: stats.streakCount.toString() },
            {
              icon: {
                source: Icon.Circle,
                tintColor:
                  stats.streakCount > 0
                    ? STATUS_COLORS.WARNING
                    : STATUS_COLORS.NEUTRAL,
              },
              tooltip: "Consecutive days with completed sessions",
            },
          ]}
        />
      </List.Section>

      <List.Section title="Quick Stats">
        <List.Item
          title="Total Focus Time"
          subtitle={formatDuration(stats.totalWorkTime)}
          icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            { text: formatDuration(stats.totalWorkTime) },
            {
              icon: { source: Icon.Circle, tintColor: STATUS_COLORS.INFO },
              tooltip: "Total time spent in focus sessions",
            },
          ]}
        />

        <List.Item
          title="Completion Rate"
          subtitle={`${stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}% sessions completed`}
          icon={{ source: Icon.CheckCircle, tintColor: STATUS_COLORS.SUCCESS }}
          accessories={[
            { text: `${stats.completedSessions}/${stats.totalSessions}` },
            {
              icon: { source: Icon.Circle, tintColor: STATUS_COLORS.SUCCESS },
              tooltip: "Percentage of sessions completed successfully",
            },
          ]}
        />

        <List.Item
          title="Recent Achievements"
          subtitle={`${profileMetrics.totalAchievements}/${profileMetrics.availableAchievements} unlocked`}
          icon={{ source: Icon.Trophy, tintColor: STATUS_COLORS.SUCCESS }}
          accessories={[
            {
              text: `${profileMetrics.totalAchievements}/${profileMetrics.availableAchievements}`,
            },
            {
              icon: { source: Icon.Circle, tintColor: STATUS_COLORS.SUCCESS },
              tooltip: "Achievement progress",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="View All Achievements"
                icon={ACTION_ICONS.VIEW_DETAILS}
                onAction={() => setViewMode("achievements")}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </>
  );

  const renderSettings = () => (
    <>
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
              <Action
                title="Configure Adaptive Settings"
                icon={ACTION_ICONS.SETTINGS}
                onAction={() => push(<AdaptiveTimerSettings />)}
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
              <Action
                title="Configure Hyperfocus Settings"
                icon={ACTION_ICONS.SETTINGS}
                onAction={() => push(<HyperfocusSettings />)}
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
            title="Overview"
            value="overview"
            icon={Icon.Person}
          />
          <List.Dropdown.Item
            title="ADHD Settings"
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

  function renderStatistics() {
    return (
      <>
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
    const getRarityColor = (rarity: string): Color => {
      switch (rarity) {
        case "legendary":
          return Color.Purple;
        case "epic":
          return Color.Blue;
        case "rare":
          return Color.Green;
        default:
          return Color.SecondaryText;
      }
    };

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
          {unlockedAchievements.map((achievement) => (
            <List.Item
              key={achievement.id}
              title={achievement.name}
              subtitle={achievement.description}
              icon={{
                source: achievement.icon,
                tintColor: getRarityColor(achievement.rarity),
              }}
              accessories={[
                { text: `+${achievement.points}` },
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor: getRarityColor(achievement.rarity),
                  },
                  tooltip: `${achievement.rarity} achievement`,
                },
              ]}
            />
          ))}
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
                tintColor: STATUS_COLORS.NEUTRAL,
              }}
              accessories={[
                { text: `+${achievement.points}` },
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor: STATUS_COLORS.NEUTRAL,
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
            title="Total Mood Entries"
            subtitle={`${moodAnalytics.totalEntries} entries logged`}
            icon={{ source: Icon.Heart, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              { text: moodAnalytics.totalEntries.toString() },
              {
                icon: { source: Icon.Circle, tintColor: STATUS_COLORS.INFO },
                tooltip: "Total mood entries recorded",
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Log New Mood"
                  icon={ACTION_ICONS.SAVE}
                  onAction={() => push(<MoodLoggingForm />)}
                />
              </ActionPanel>
            }
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
