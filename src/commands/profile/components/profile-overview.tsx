import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useNavigation } from "@raycast/api";
import { formatDistanceToNow } from "date-fns";
import {
  STATUS_COLORS,
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
} from "../../../constants/design-tokens";
import { MoodEntryDetail } from "../../../components/mood-entry-detail";
import { MoodLoggingForm } from "../../../components/mood-tracking";
import { RewardSystem, MoodEntry, TimerSession } from "../../../types/timer";
import { getAchievementStyling, getSessionStatus } from "../utils";
import { formatDuration } from "../../../utils/helpers";

interface ProfileOverviewProps {
  rewardSystem: RewardSystem;
  moodEntries: MoodEntry[];
  history: TimerSession[];
  profileMetrics: {
    pointsForNextLevel: number;
    progressToNextLevel: number;
  };
  viewMode: string;
}

export function ProfileOverview({
  rewardSystem,
  moodEntries,
  history,
  profileMetrics,
  viewMode,
}: ProfileOverviewProps) {
  // Only render when in overview mode
  if (viewMode !== "overview") return null;
  const { push } = useNavigation();

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
              source: getSessionStatus(lastSession).icon as any,
              tintColor: getSessionStatus(lastSession).color as any,
            }}
            accessories={[
              {
                text: getSessionStatus(lastSession).status,
                tooltip: `Session ${getSessionStatus(lastSession).status.toLowerCase()}`,
              },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor: getSessionStatus(lastSession).color as any,
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
}
