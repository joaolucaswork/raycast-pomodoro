import {
  List,
  Icon,
  Color,
  ActionPanel,
  Action,
  useNavigation,
} from "@raycast/api";
import { Achievement, AchievementStats, BoxingLevel } from "../../types/timer";
import { ACHIEVEMENT_COLORS } from "../../constants/design-tokens";
import { AchievementDetailView } from "./AchievementDetailView";
import { BoxingLevelDetailView } from "./BoxingLevelDetailView";
import { AchievementBrowser } from "./AchievementBrowser";
import { useTimerStore } from "../../store/timer-store";

interface BoxingAchievementDisplayProps {
  achievements: Achievement[];
  stats: AchievementStats;
  currentLevel: BoxingLevel;
  nextLevel?: BoxingLevel | null;
  viewMode?: "overview" | "detailed";
}

export function BoxingAchievementDisplay({
  achievements,
  stats,
  currentLevel,
  nextLevel,
  viewMode = "overview",
}: BoxingAchievementDisplayProps) {
  const { push } = useNavigation();
  const { boxingProgress, rewardSystem } = useTimerStore();

  // Get unlocked achievement IDs for proper unlock status checking
  const unlockedIds = rewardSystem.achievements.map((a) => a.id);

  // Group achievements by category
  const achievementsByCategory = achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<string, Achievement[]>
  );

  // Get rarity color
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

  // Get category display name
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames = {
      training_milestones: "Training Milestones",
      knockout_streaks: "Knockout Streaks",
      championship_belts: "Championship Belts",
      daily_training: "Daily Training",
      endurance_challenges: "Endurance Challenges",
      consistency_championships: "Consistency Championships",
      special_achievements: "Special Achievements",
      mood_mastery: "Mood Mastery",
      legacy: "Legacy Achievements",
    };
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  // Format achievement description with boxing theme
  const formatDescription = (achievement: Achievement): string => {
    if (achievement.unlockedAt) {
      const date = new Date(achievement.unlockedAt).toLocaleDateString();
      return `${achievement.description} • Unlocked ${date}`;
    }
    return achievement.description;
  };

  if (viewMode === "overview") {
    return (
      <>
        {/* Boxing Level Display */}
        <List.Section title="Boxing Level">
          <List.Item
            icon={{
              source: currentLevel.icon,
              tintColor: currentLevel.color,
            }}
            title={`${currentLevel.title} (Level ${currentLevel.level})`}
            subtitle={currentLevel.description}
            accessories={[
              { text: `${stats.totalPoints} points` },
              {
                text: nextLevel
                  ? `${stats.pointsToNextLevel} to next level`
                  : "Max Level!",
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="View Level Details"
                  icon={Icon.Info}
                  onAction={() => {
                    push(
                      <BoxingLevelDetailView
                        currentLevel={currentLevel}
                        stats={stats}
                      />
                    );
                  }}
                />
              </ActionPanel>
            }
          />
        </List.Section>

        {/* Achievement Stats */}
        <List.Section title="Achievement Progress">
          <List.Item
            icon={Icon.Trophy}
            title="Achievement Collection"
            subtitle={`${stats.unlockedAchievements}/${stats.totalAchievements} achievements unlocked (${stats.completionPercentage}%)`}
            accessories={[
              {
                tag: {
                  value: `${stats.commonAchievements}`,
                  color: ACHIEVEMENT_COLORS.COMMON,
                },
              },
              {
                tag: {
                  value: `${stats.rareAchievements}`,
                  color: ACHIEVEMENT_COLORS.RARE,
                },
              },
              {
                tag: {
                  value: `${stats.epicAchievements}`,
                  color: ACHIEVEMENT_COLORS.EPIC,
                },
              },
              {
                tag: {
                  value: `${stats.legendaryAchievements}`,
                  color: ACHIEVEMENT_COLORS.LEGENDARY,
                },
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="View All Achievements"
                  icon={Icon.List}
                  onAction={() => {
                    push(<AchievementBrowser />);
                  }}
                />
              </ActionPanel>
            }
          />
        </List.Section>

        {/* Recent Achievements */}
        <List.Section title="Recent Achievements">
          {achievements
            .filter((a) => a.unlockedAt)
            .sort(
              (a, b) =>
                new Date(b.unlockedAt!).getTime() -
                new Date(a.unlockedAt!).getTime()
            )
            .slice(0, 5)
            .map((achievement) => (
              <List.Item
                key={achievement.id}
                icon={{
                  source: achievement.icon,
                  tintColor: getRarityColor(achievement.rarity),
                }}
                title={achievement.name}
                subtitle={formatDescription(achievement)}
                accessories={[
                  {
                    tag: {
                      value: `${achievement.points} pts`,
                      color: getRarityColor(achievement.rarity),
                    },
                  },
                  {
                    tag: {
                      value: achievement.rarity,
                      color: getRarityColor(achievement.rarity),
                    },
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action
                      title="View Achievement Details"
                      icon={Icon.Info}
                      onAction={() => {
                        push(
                          <AchievementDetailView
                            achievement={achievement}
                            isUnlocked={true}
                            progress={boxingProgress}
                          />
                        );
                      }}
                    />
                    <Action
                      title="View All Achievements"
                      icon={Icon.List}
                      onAction={() => {
                        push(<AchievementBrowser />);
                      }}
                    />
                  </ActionPanel>
                }
              />
            ))}
        </List.Section>
      </>
    );
  }

  // Detailed view - show all achievements by category
  return (
    <>
      {Object.entries(achievementsByCategory).map(
        ([category, categoryAchievements]) => (
          <List.Section key={category} title={getCategoryDisplayName(category)}>
            {categoryAchievements.map((achievement) => {
              const isUnlocked = unlockedIds.includes(achievement.id);
              const unlockedAchievement = rewardSystem.achievements.find(
                (a) => a.id === achievement.id
              );

              return (
                <List.Item
                  key={achievement.id}
                  icon={{
                    source: isUnlocked ? achievement.icon : Icon.Circle,
                    tintColor: isUnlocked
                      ? getRarityColor(achievement.rarity)
                      : Color.SecondaryText,
                  }}
                  title={achievement.name}
                  subtitle={formatDescription(achievement)}
                  accessories={[
                    {
                      tag: {
                        value: `${achievement.points} pts`,
                        color: isUnlocked
                          ? getRarityColor(achievement.rarity)
                          : Color.SecondaryText,
                      },
                    },
                    {
                      tag: {
                        value: achievement.rarity,
                        color: isUnlocked
                          ? getRarityColor(achievement.rarity)
                          : Color.SecondaryText,
                      },
                    },
                    {
                      icon: {
                        source: isUnlocked ? Icon.CheckCircle : Icon.Circle,
                        tintColor: isUnlocked
                          ? Color.Green
                          : Color.SecondaryText,
                      },
                    },
                  ]}
                  actions={
                    <ActionPanel>
                      <Action
                        title={
                          isUnlocked ? "View Achievement" : "View Requirements"
                        }
                        icon={isUnlocked ? Icon.Trophy : Icon.Info}
                        onAction={() => {
                          push(
                            <AchievementDetailView
                              achievement={{
                                ...achievement,
                                unlockedAt: unlockedAchievement?.unlockedAt,
                              }}
                              isUnlocked={isUnlocked}
                              progress={boxingProgress}
                            />
                          );
                        }}
                      />
                      <Action
                        title="View All Achievements"
                        icon={Icon.List}
                        onAction={() => {
                          push(<AchievementBrowser />);
                        }}
                      />
                    </ActionPanel>
                  }
                />
              );
            })}
          </List.Section>
        )
      )}
    </>
  );
}
