import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";
import { BoxingProgress, BoxingLevel } from "../../types/timer";
import { formatDuration } from "../../utils/helpers";

interface BoxingProgressDisplayProps {
  progress: BoxingProgress;
  currentLevel: BoxingLevel;
  nextLevel?: BoxingLevel | null;
  showDetailed?: boolean;
}

export function BoxingProgressDisplay({
  progress,
  currentLevel,
  nextLevel,
  showDetailed = false,
}: BoxingProgressDisplayProps) {
  // Calculate training time in hours
  const trainingHours = Math.floor(progress.totalTrainingTime / 60);
  const trainingMinutes = progress.totalTrainingTime % 60;

  // Calculate average session duration in minutes
  const avgDurationMinutes = Math.round(progress.averageRoundDuration);
  const bestDurationMinutes = Math.round(progress.bestRoundDuration);

  // Get streak status
  const getStreakStatus = () => {
    if (progress.currentStreak === 0) return "No active streak";
    if (progress.currentStreak === 1) return "1 round streak";
    return `${progress.currentStreak} round streak 🔥`;
  };

  // Get championship level display
  const getChampionshipDisplay = () => {
    const levels = [
      "Rookie",
      "Amateur",
      "Professional",
      "Champion",
      "Hall of Famer",
    ];
    return (
      levels[Math.min(progress.championshipLevel - 1, levels.length - 1)] ||
      "Rookie"
    );
  };

  if (!showDetailed) {
    // Compact overview for profile page
    return (
      <>
        <List.Item
          icon={Icon.Trophy}
          title="Boxing Statistics"
          subtitle={`${progress.totalRounds} rounds completed • ${getStreakStatus()}`}
          accessories={[
            { text: `${trainingHours}h ${trainingMinutes}m trained` },
            {
              tag: {
                value: getChampionshipDisplay(),
                color: currentLevel.color,
              },
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="View Detailed Stats"
                icon={Icon.BarChart}
                onAction={() => {
                  // Could navigate to detailed stats view
                }}
              />
            </ActionPanel>
          }
        />
      </>
    );
  }

  // Detailed view
  return (
    <>
      {/* Overall Progress */}
      <List.Section title="🥊 Training Overview">
        <List.Item
          icon={Icon.Trophy}
          title="Total Rounds"
          subtitle={`${progress.totalRounds} rounds completed in your training career`}
          accessories={[
            { text: `${progress.totalRounds} rounds` },
            { icon: { source: Icon.CheckCircle, tintColor: Color.Green } },
          ]}
        />

        <List.Item
          icon={Icon.Clock}
          title="Total Training Time"
          subtitle={`${trainingHours} hours and ${trainingMinutes} minutes of focused training`}
          accessories={[
            { text: formatDuration(progress.totalTrainingTime * 60) },
            { icon: { source: Icon.Stopwatch, tintColor: Color.Blue } },
          ]}
        />

        <List.Item
          icon={Icon.Crown}
          title="Championship Level"
          subtitle={`You've reached ${getChampionshipDisplay()} status`}
          accessories={[
            {
              tag: {
                value: getChampionshipDisplay(),
                color: currentLevel.color,
              },
            },
            { text: `Level ${progress.championshipLevel}` },
          ]}
        />
      </List.Section>

      {/* Streak Information */}
      <List.Section title="🔥 Streak Performance">
        <List.Item
          icon={Icon.Bolt}
          title="Current Streak"
          subtitle={getStreakStatus()}
          accessories={[
            { text: `${progress.currentStreak} rounds` },
            ...(progress.currentStreak > 0
              ? [{ icon: { source: Icon.Bolt, tintColor: Color.Orange } }]
              : []),
          ]}
        />

        <List.Item
          icon={Icon.Star}
          title="Best Streak"
          subtitle={`Your longest streak was ${progress.longestStreak} rounds`}
          accessories={[
            { text: `${progress.longestStreak} rounds` },
            { icon: { source: Icon.Trophy, tintColor: Color.Yellow } },
          ]}
        />
      </List.Section>

      {/* Session Quality */}
      <List.Section title="💪 Session Quality">
        <List.Item
          icon={Icon.Clock}
          title="Average Round Duration"
          subtitle={`Your typical training round lasts ${avgDurationMinutes} minutes`}
          accessories={[
            { text: `${avgDurationMinutes} min` },
            { icon: { source: Icon.BarChart, tintColor: Color.Blue } },
          ]}
        />

        <List.Item
          icon={Icon.Stopwatch}
          title="Best Round Duration"
          subtitle={`Your longest training round was ${bestDurationMinutes} minutes`}
          accessories={[
            { text: `${bestDurationMinutes} min` },
            { icon: { source: Icon.Crown, tintColor: Color.Purple } },
          ]}
        />
      </List.Section>

      {/* Time-based Stats */}
      <List.Section title="📅 Training Schedule">
        <List.Item
          icon={Icon.Calendar}
          title="Today's Training"
          subtitle={`${progress.dailyRoundsToday} rounds completed today`}
          accessories={[
            { text: `${progress.dailyRoundsToday} rounds` },
            ...(progress.dailyRoundsToday > 0
              ? [{ icon: { source: Icon.CheckCircle, tintColor: Color.Green } }]
              : []),
          ]}
        />

        <List.Item
          icon={Icon.Calendar}
          title="This Week's Training"
          subtitle={`${progress.weeklyRoundsThisWeek} rounds completed this week`}
          accessories={[
            { text: `${progress.weeklyRoundsThisWeek} rounds` },
            { icon: { source: Icon.BarChart, tintColor: Color.Blue } },
          ]}
        />

        <List.Item
          icon={Icon.Calendar}
          title="This Month's Training"
          subtitle={`${progress.monthlyRoundsThisMonth} rounds completed this month`}
          accessories={[
            { text: `${progress.monthlyRoundsThisMonth} rounds` },
            { icon: { source: Icon.BarChart, tintColor: Color.Purple } },
          ]}
        />
      </List.Section>

      {/* Special Achievements */}
      <List.Section title="⭐ Special Training">
        <List.Item
          icon={Icon.Sun}
          title="Early Bird Training"
          subtitle={`${progress.earlyBirdRounds} rounds completed before 8 AM`}
          accessories={[
            { text: `${progress.earlyBirdRounds} rounds` },
            { icon: { source: Icon.Sun, tintColor: Color.Yellow } },
          ]}
        />

        <List.Item
          icon={Icon.Moon}
          title="Night Owl Training"
          subtitle={`${progress.nightOwlRounds} rounds completed after 10 PM`}
          accessories={[
            { text: `${progress.nightOwlRounds} rounds` },
            { icon: { source: Icon.Moon, tintColor: Color.Blue } },
          ]}
        />

        <List.Item
          icon={Icon.Calendar}
          title="Weekend Warrior"
          subtitle={`${progress.weekendWarriorRounds} rounds completed on weekends`}
          accessories={[
            { text: `${progress.weekendWarriorRounds} rounds` },
            { icon: { source: Icon.Trophy, tintColor: Color.Orange } },
          ]}
        />

        {progress.moodTrackingStreak > 0 && (
          <List.Item
            icon={Icon.Heart}
            title="Mood Tracking Streak"
            subtitle={`${progress.moodTrackingStreak} consecutive sessions with mood tracking`}
            accessories={[
              { text: `${progress.moodTrackingStreak} sessions` },
              { icon: { source: Icon.Heart, tintColor: Color.Red } },
            ]}
          />
        )}
      </List.Section>

      {/* Last Training Session */}
      {progress.lastRoundDate && (
        <List.Section title="📝 Recent Activity">
          <List.Item
            icon={Icon.Clock}
            title="Last Training Round"
            subtitle={`Completed on ${progress.lastRoundDate.toLocaleDateString()}`}
            accessories={[
              {
                text: progress.lastRoundDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
              { icon: { source: Icon.CheckCircle, tintColor: Color.Green } },
            ]}
          />
        </List.Section>
      )}
    </>
  );
}
