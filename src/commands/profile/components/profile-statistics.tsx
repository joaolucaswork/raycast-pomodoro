import { Icon, List } from "@raycast/api";
import {
  SESSION_ICONS,
  STATUS_COLORS,
  getMoodIcon,
  getMoodColor,
  MOOD_ICONS,
} from "../../../constants/design-tokens";
import { formatDuration } from "../../../utils/helpers";
import {
  TimerSession,
  TimerStats,
  MoodEntry,
  MoodAnalytics,
} from "../../../types/timer";
import { getTodaysSessions } from "../utils/profile-metrics";

interface ProfileStatisticsProps {
  stats: TimerStats;
  history: TimerSession[];
  moodEntries: MoodEntry[];
  getMoodAnalytics: () => MoodAnalytics | null;
  detailedStats: {
    averageSessionLength: number;
    completionRate: number;
    mostProductiveHour: number | null;
  };
  viewMode: string;
}

export function ProfileStatistics({
  stats,
  history,
  moodEntries,
  getMoodAnalytics,
  detailedStats,
  viewMode,
}: ProfileStatisticsProps) {
  // Only render when in statistics mode
  if (viewMode !== "statistics") return null;
  // Calculate mood analytics for statistics view
  const moodAnalytics = moodEntries.length === 0 ? null : getMoodAnalytics();

  // Calculate today's sessions
  const todaysSessions = getTodaysSessions(history);

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

        <List.Item
          title="Total Focus Time"
          subtitle={`${formatDuration(stats.totalWorkTime)} across all sessions`}
          icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.PRIMARY }}
          accessories={[
            { text: formatDuration(stats.totalWorkTime) },
            {
              icon: {
                source: Icon.Circle,
                tintColor: STATUS_COLORS.PRIMARY,
              },
              tooltip: "Lifetime focus time",
            },
          ]}
        />
      </List.Section>
    </>
  );
}
