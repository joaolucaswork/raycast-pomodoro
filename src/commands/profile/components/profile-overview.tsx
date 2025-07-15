import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useNavigation } from "@raycast/api";
import { formatDistanceToNow } from "date-fns";
import {
  STATUS_COLORS,
  ACTION_ICONS,
  SESSION_ICONS,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
} from "../../../constants/design-tokens";
import { MoodEntryDetail } from "../../../components/ui/mood-entry-detail";
import { MoodLoggingForm } from "../../../components/mood-tracking";
import { RewardSystem, MoodEntry, TimerSession } from "../../../types/timer";
import { getAchievementStyling, getSessionStatus } from "../utils";
import {
  formatDuration,
  getActualSessionDuration,
  getSessionTypeIcon,
} from "../../../utils/helpers";
import { boxingAchievementService } from "../../../services/features/boxing-achievement-service";

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

  // Get boxing level information
  const currentBoxingLevel = boxingAchievementService.calculateBoxingLevel(
    rewardSystem.points
  );

  return (
    <>
      {/* Boxing Level Information Section */}
      <List.Section title="Boxing Level">
        <List.Item
          title={`${currentBoxingLevel.title} (Level ${rewardSystem.level})`}
          subtitle={`${rewardSystem.points} points • ${profileMetrics.pointsForNextLevel} to next level`}
          icon={{
            source: currentBoxingLevel.icon,
            tintColor: currentBoxingLevel.color,
          }}
          accessories={[
            {
              text: `${profileMetrics.progressToNextLevel}%`,
              tooltip: `${profileMetrics.progressToNextLevel}% progress to level ${rewardSystem.level + 1}`,
            },
            {
              icon: {
                source: Icon.Circle,
                tintColor: currentBoxingLevel.color,
              },
              tooltip: `${currentBoxingLevel.title} - ${currentBoxingLevel.description}`,
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

      {/* Last Round Info Section */}
      {lastSession && (
        <List.Section title="Last Round Info">
          <List.Item
            title={lastSession.taskName || "Focus Round"}
            subtitle={`${formatDuration(getActualSessionDuration(lastSession))} • ${formatDistanceToNow(new Date(lastSession.startTime), { addSuffix: true })}`}
            icon={{
              source: getSessionTypeIcon(lastSession.type),
              tintColor: getSessionStatus(lastSession).color as any,
            }}
            accessories={[
              {
                text: getSessionStatus(lastSession).status,
                tooltip: `Round ${getSessionStatus(lastSession).status.toLowerCase()}`,
              },
              {
                icon: {
                  source: Icon.Circle,
                  tintColor: getSessionStatus(lastSession).color as any,
                },
                tooltip: `Round completion status`,
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
