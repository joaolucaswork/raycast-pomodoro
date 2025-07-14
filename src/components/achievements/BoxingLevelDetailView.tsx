import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  Color,
  useNavigation,
} from "@raycast/api";
import { BoxingLevel, AchievementStats } from "../../types/timer";
import { useTimerStore } from "../../store/timer-store";
import { boxingAchievementService } from "../../services/features/boxing-achievement-service";

interface BoxingLevelDetailViewProps {
  currentLevel: BoxingLevel;
  stats: AchievementStats;
}

export function BoxingLevelDetailView({
  currentLevel,
  stats,
}: BoxingLevelDetailViewProps) {
  const { pop } = useNavigation();
  const { rewardSystem } = useTimerStore();

  // Get all boxing levels for progression display
  const allLevels = boxingAchievementService.getBoxingLevels();
  const currentLevelIndex = allLevels.findIndex(
    (level) => level.level === currentLevel.level
  );
  const nextLevel =
    currentLevelIndex < allLevels.length - 1
      ? allLevels[currentLevelIndex + 1]
      : null;
  const previousLevel =
    currentLevelIndex > 0 ? allLevels[currentLevelIndex - 1] : null;

  // Calculate progression
  const progressInCurrentLevel = rewardSystem.points - currentLevel.minPoints;
  const pointsNeededForCurrentLevel =
    currentLevel.maxPoints === Infinity
      ? currentLevel.minPoints
      : currentLevel.maxPoints - currentLevel.minPoints;
  const progressPercentage = nextLevel
    ? Math.min(
        (progressInCurrentLevel /
          (nextLevel.minPoints - currentLevel.minPoints)) *
          100,
        100
      )
    : 100;

  // Build markdown content
  const buildMarkdownContent = (): string => {
    let content = `# ${currentLevel.title}\n\n`;
    content += `${currentLevel.description}\n\n`;

    // Current level progress
    if (nextLevel) {
      const progressBar =
        "█".repeat(Math.floor(progressPercentage / 10)) +
        "░".repeat(10 - Math.floor(progressPercentage / 10));
      content += `## Progress to ${nextLevel.title}\n\n`;
      content += `\`${progressBar}\` ${Math.round(progressPercentage)}%\n\n`;
      content += `**${rewardSystem.points}** / **${nextLevel.minPoints}** points\n`;
      content += `**${stats.pointsToNextLevel}** points needed\n\n`;
    } else {
      content += `## Maximum Level Achieved\n\n`;
    }

    // Achievement collection
    content += `## Achievement Collection\n\n`;
    content += `• **${stats.unlockedAchievements}**/${stats.totalAchievements} achievements (${Math.round(stats.completionPercentage)}%)\n`;
    content += `• **${stats.commonAchievements}** Common • **${stats.rareAchievements}** Rare • **${stats.epicAchievements}** Epic • **${stats.legendaryAchievements}** Legendary\n\n`;

    return content;
  };

  // Get level progression display
  const getLevelProgressionDisplay = (): string => {
    const levels = allLevels
      .slice(0, currentLevel.level)
      .map((level) =>
        level.level === currentLevel.level ? `**${level.title}**` : level.title
      )
      .join(" → ");

    if (nextLevel) {
      return `${levels} → ${nextLevel.title}`;
    }
    return levels;
  };

  return (
    <Detail
      navigationTitle={`${currentLevel.title} - Level ${currentLevel.level}`}
      markdown={buildMarkdownContent()}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Current Level"
            text={`${currentLevel.title} (${currentLevel.level})`}
            icon={{
              source: currentLevel.icon,
              tintColor: currentLevel.color,
            }}
          />
          <Detail.Metadata.Label
            title="Total Points"
            text={`${rewardSystem.points} pts`}
            icon={Icon.Trophy}
          />
          {nextLevel && (
            <Detail.Metadata.Label
              title="Next Level"
              text={`${nextLevel.title} (${stats.pointsToNextLevel} pts needed)`}
              icon={{
                source: nextLevel.icon,
                tintColor: Color.SecondaryText,
              }}
            />
          )}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Achievements"
            text={`${stats.unlockedAchievements}/${stats.totalAchievements} (${Math.round(stats.completionPercentage)}%)`}
            icon={Icon.Star}
          />
          <Detail.Metadata.Label
            title="Level Range"
            text={
              currentLevel.maxPoints === Infinity
                ? `${currentLevel.minPoints}+ points`
                : `${currentLevel.minPoints}-${currentLevel.maxPoints} points`
            }
            icon={Icon.BarChart}
          />
          {nextLevel && (
            <Detail.Metadata.Label
              title="Progress"
              text={`${Math.round(progressPercentage)}% to next level`}
              icon={Icon.ChevronUp}
            />
          )}
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
            title="Copy Level Info"
            content={`${currentLevel.title} (Level ${currentLevel.level}) - ${rewardSystem.points} points`}
          />
          {nextLevel && (
            <Action.CopyToClipboard
              title="Copy Progress Info"
              content={`Progress: ${Math.round(progressPercentage)}% to ${nextLevel.title} (${stats.pointsToNextLevel} points needed)`}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
