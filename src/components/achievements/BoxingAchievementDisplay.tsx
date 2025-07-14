import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";
import { Achievement, AchievementStats, BoxingLevel } from "../../types/timer";
import { ACHIEVEMENT_COLORS, ACHIEVEMENT_ICONS } from "../../constants/design-tokens";

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
  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

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
      training_milestones: "🥊 Training Milestones",
      knockout_streaks: "🔥 Knockout Streaks",
      championship_belts: "🏆 Championship Belts",
      daily_training: "📅 Daily Training",
      endurance_challenges: "💪 Endurance Challenges",
      consistency_championships: "🎯 Consistency Championships",
      special_achievements: "⭐ Special Achievements",
      mood_mastery: "❤️ Mood Mastery",
      legacy: "📜 Legacy Achievements",
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
        <List.Section title="🥊 Boxing Level">
          <List.Item
            icon={{
              source: currentLevel.icon,
              tintColor: currentLevel.color,
            }}
            title={`${currentLevel.title} (Level ${currentLevel.level})`}
            subtitle={currentLevel.description}
            accessories={[
              { text: `${stats.totalPoints} points` },
              ...(nextLevel
                ? [{ text: `${stats.pointsToNextLevel} to next level` }]
                : [{ text: "Max Level!" }]),
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="View Level Details"
                  icon={Icon.Info}
                  onAction={() => {
                    // Could open detailed level view
                  }}
                />
              </ActionPanel>
            }
          />
        </List.Section>

        {/* Achievement Stats */}
        <List.Section title="📊 Achievement Progress">
          <List.Item
            icon={Icon.Trophy}
            title="Achievement Progress"
            subtitle={`${stats.unlockedAchievements}/${stats.totalAchievements} achievements unlocked`}
            accessories={[
              { text: `${stats.completionPercentage}%` },
              {
                tag: {
                  value: `${stats.legendaryAchievements} Legendary`,
                  color: ACHIEVEMENT_COLORS.LEGENDARY,
                },
              },
            ]}
          />
          
          <List.Item
            icon={Icon.Star}
            title="Rarity Breakdown"
            subtitle="Achievement distribution by rarity"
            accessories={[
              {
                tag: {
                  value: `${stats.commonAchievements} Common`,
                  color: ACHIEVEMENT_COLORS.COMMON,
                },
              },
              {
                tag: {
                  value: `${stats.rareAchievements} Rare`,
                  color: ACHIEVEMENT_COLORS.RARE,
                },
              },
              {
                tag: {
                  value: `${stats.epicAchievements} Epic`,
                  color: ACHIEVEMENT_COLORS.EPIC,
                },
              },
            ]}
          />
        </List.Section>

        {/* Recent Achievements */}
        <List.Section title="🏆 Recent Achievements">
          {achievements
            .filter(a => a.unlockedAt)
            .sort((a, b) => 
              new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
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
                        // Could open detailed achievement view
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
      {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
        <List.Section key={category} title={getCategoryDisplayName(category)}>
          {categoryAchievements.map((achievement) => (
            <List.Item
              key={achievement.id}
              icon={{
                source: achievement.unlockedAt ? achievement.icon : Icon.Circle,
                tintColor: achievement.unlockedAt 
                  ? getRarityColor(achievement.rarity)
                  : Color.SecondaryText,
              }}
              title={achievement.name}
              subtitle={formatDescription(achievement)}
              accessories={[
                {
                  tag: {
                    value: `${achievement.points} pts`,
                    color: achievement.unlockedAt 
                      ? getRarityColor(achievement.rarity)
                      : Color.SecondaryText,
                  },
                },
                {
                  tag: {
                    value: achievement.rarity,
                    color: achievement.unlockedAt 
                      ? getRarityColor(achievement.rarity)
                      : Color.SecondaryText,
                  },
                },
                ...(achievement.unlockedAt
                  ? [{ icon: { source: Icon.CheckCircle, tintColor: Color.Green } }]
                  : [{ icon: { source: Icon.Circle, tintColor: Color.SecondaryText } }]),
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title={achievement.unlockedAt ? "View Achievement" : "View Requirements"}
                    icon={achievement.unlockedAt ? Icon.Trophy : Icon.Info}
                    onAction={() => {
                      // Could open detailed achievement view with requirements
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </>
  );
}
