import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  Color,
  useNavigation,
} from "@raycast/api";
import { BoxingProgress, BoxingLevel } from "../../types/timer";
import { formatDuration } from "../../utils/helpers";
import { format, startOfWeek, startOfMonth, isWithinInterval } from "date-fns";

interface DetailedStatsViewProps {
  progress: BoxingProgress;
  currentLevel: BoxingLevel;
  nextLevel?: BoxingLevel | null;
}

export function DetailedStatsView({
  progress,
  currentLevel,
  nextLevel,
}: DetailedStatsViewProps) {
  const { pop } = useNavigation();

  // Calculate additional statistics
  const trainingHours = Math.floor(progress.totalTrainingTime / 60);
  const trainingMinutes = progress.totalTrainingTime % 60;
  const avgDurationMinutes = Math.round(progress.averageRoundDuration);
  const bestDurationMinutes = Math.round(progress.bestRoundDuration);

  // Calculate training efficiency metrics
  const getTrainingEfficiency = (): number => {
    if (progress.totalRounds === 0) return 0;
    const averageSessionLength =
      progress.totalTrainingTime / progress.totalRounds;
    const targetSessionLength = 25; // Standard pomodoro length
    return Math.min((averageSessionLength / targetSessionLength) * 100, 100);
  };

  const getConsistencyScore = (): number => {
    if (progress.totalRounds === 0) return 0;
    const maxPossibleStreak = progress.totalRounds;
    return Math.min((progress.longestStreak / maxPossibleStreak) * 100, 100);
  };

  // Build comprehensive markdown content
  const buildMarkdownContent = (): string => {
    let content = `# Training Statistics\n\n`;

    // Training Overview
    content += `## Overview\n\n`;
    content += `• **${progress.totalRounds}** sessions completed\n`;
    content += `• **${trainingHours}h ${trainingMinutes}m** total time\n`;
    content += `• **${progress.currentStreak}** current streak\n`;
    content += `• **${progress.longestStreak}** longest streak\n\n`;

    // Session Quality
    const efficiency = getTrainingEfficiency();
    const consistency = getConsistencyScore();

    content += `## Session Quality\n\n`;
    content += `• **Average:** ${avgDurationMinutes} minutes\n`;
    content += `• **Best:** ${bestDurationMinutes} minutes\n`;
    content += `• **Efficiency:** ${Math.round(efficiency)}%\n`;
    content += `• **Consistency:** ${Math.round(consistency)}%\n\n`;

    // Current Performance
    content += `## Recent Activity\n\n`;
    content += `• **Today:** ${progress.dailyRoundsToday} sessions\n`;
    content += `• **This Week:** ${progress.weeklyRoundsThisWeek} sessions\n`;
    content += `• **This Month:** ${progress.monthlyRoundsThisMonth} sessions\n\n`;

    return content;
  };

  return (
    <Detail
      navigationTitle="Training Statistics"
      markdown={buildMarkdownContent()}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Total Sessions"
            text={`${progress.totalRounds} completed`}
            icon={Icon.Trophy}
          />
          <Detail.Metadata.Label
            title="Total Time"
            text={formatDuration(progress.totalTrainingTime * 60)}
            icon={Icon.Clock}
          />
          <Detail.Metadata.Label
            title="Current Streak"
            text={`${progress.currentStreak} sessions`}
            icon={{
              source: Icon.Bolt,
              tintColor:
                progress.currentStreak >= 7 ? Color.Orange : Color.Blue,
            }}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Level"
            text={`${currentLevel.title} (${currentLevel.level})`}
            icon={{
              source: currentLevel.icon,
              tintColor: currentLevel.color,
            }}
          />
          <Detail.Metadata.Label
            title="Efficiency"
            text={`${Math.round(getTrainingEfficiency())}%`}
            icon={Icon.BarChart}
          />
          <Detail.Metadata.Label
            title="Consistency"
            text={`${Math.round(getConsistencyScore())}%`}
            icon={Icon.CheckCircle}
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action
            title="Back to Achievements"
            icon={Icon.ArrowLeft}
            onAction={pop}
          />
          <Action.CopyToClipboard
            title="Copy Statistics Summary"
            content={`🥊 Boxing Stats: ${progress.totalRounds} rounds, ${trainingHours}h ${trainingMinutes}m trained, ${progress.currentStreak} current streak`}
          />
        </ActionPanel>
      }
    />
  );
}
