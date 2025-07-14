import {
  Action,
  ActionPanel,
  List,
  Icon,
  Color,
  useNavigation,
} from "@raycast/api";
import { useState, useMemo } from "react";
import { Achievement, AchievementRequirement } from "../../types/timer";
import { ACHIEVEMENT_COLORS } from "../../constants/design-tokens";
import { useTimerStore } from "../../store/timer-store";
import { AchievementDetailView } from "./AchievementDetailView";

interface AchievementBrowserProps {
  onBack?: () => void;
}

export function AchievementBrowser({ onBack }: AchievementBrowserProps) {
  const { push, pop } = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { rewardSystem, boxingProgress, getBoxingAchievements } =
    useTimerStore();

  // Get all achievements and unlocked achievement IDs
  const allAchievements = getBoxingAchievements();
  const unlockedIds = rewardSystem.achievements.map((a) => a.id);

  // Enhanced achievements with unlock status
  const enhancedAchievements = useMemo(() => {
    return allAchievements.map((achievement) => ({
      ...achievement,
      isUnlocked: unlockedIds.includes(achievement.id),
      unlockedAt: rewardSystem.achievements.find((a) => a.id === achievement.id)
        ?.unlockedAt,
    }));
  }, [allAchievements, unlockedIds, rewardSystem.achievements]);

  // Filter achievements based on search and filters
  const filteredAchievements = useMemo(() => {
    return enhancedAchievements.filter((achievement) => {
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          achievement.name.toLowerCase().includes(searchLower) ||
          achievement.description.toLowerCase().includes(searchLower) ||
          achievement.category.toLowerCase().includes(searchLower) ||
          achievement.rarity.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (
        selectedCategory !== "all" &&
        achievement.category !== selectedCategory
      ) {
        return false;
      }

      // Rarity filter
      if (selectedRarity !== "all" && achievement.rarity !== selectedRarity) {
        return false;
      }

      // Status filter
      if (selectedStatus === "unlocked" && !achievement.isUnlocked) {
        return false;
      }
      if (selectedStatus === "locked" && achievement.isUnlocked) {
        return false;
      }

      return true;
    });
  }, [
    enhancedAchievements,
    searchText,
    selectedCategory,
    selectedRarity,
    selectedStatus,
  ]);

  // Helper function to get achievement difficulty score (lower = easier)
  const getAchievementDifficulty = (
    achievement: (typeof enhancedAchievements)[0]
  ): number => {
    // Calculate difficulty based on requirements
    let difficultyScore = 0;

    for (const requirement of achievement.requirements) {
      switch (requirement.type) {
        case "sessions_completed":
          difficultyScore += requirement.value;
          break;
        case "streak_length":
          difficultyScore += requirement.value * 2; // Streaks are harder
          break;
        case "total_time":
          difficultyScore += requirement.value / 60; // Convert minutes to hours for scoring
          break;
        case "daily_goal":
          difficultyScore += requirement.value * 3; // Daily goals are challenging
          break;
        case "session_duration":
          difficultyScore += requirement.value / 10; // Long sessions are harder
          break;
        case "mood_tracking":
          difficultyScore += requirement.value * 1.5; // Mood tracking requires consistency
          break;
        // New mood-related achievement types
        case "mood_entries_total":
          difficultyScore += requirement.value * 0.5; // Basic mood logging
          break;
        case "mood_tracking_streak":
          difficultyScore += requirement.value * 2; // Streaks are challenging
          break;
        case "mood_entries_with_notes":
          difficultyScore += requirement.value * 1.5; // Requires thoughtfulness
          break;
        case "mood_intensity_range":
          difficultyScore += requirement.value * 3; // Requires exploring different intensities
          break;
        case "mood_context_entries":
          difficultyScore += requirement.value * 1.2; // Context-specific logging
          break;
        case "mood_specific_sessions":
          difficultyScore += requirement.value * 2; // Requires specific mood states
          break;
        case "mood_improvement_pattern":
          difficultyScore += requirement.value * 3; // Requires actual improvement
          break;
        case "mood_awareness_diversity":
          difficultyScore += requirement.value * 4; // Requires exploring all moods
          break;
        case "time_of_day":
          difficultyScore += 15; // Time-specific achievements are moderately hard
          break;
        case "weekend_sessions":
          difficultyScore += requirement.value * 2; // Weekend sessions require dedication
          break;
        case "consecutive_days":
          difficultyScore += requirement.value * 4; // Consecutive days are very challenging
          break;
        default:
          difficultyScore += 10; // Default moderate difficulty
      }
    }

    return difficultyScore;
  };

  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    const grouped = filteredAchievements.reduce(
      (acc, achievement) => {
        if (!acc[achievement.category]) {
          acc[achievement.category] = [];
        }
        acc[achievement.category].push(achievement);
        return acc;
      },
      {} as Record<string, typeof enhancedAchievements>
    );

    // Sort achievements within each category by difficulty (easiest first)
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        const difficultyA = getAchievementDifficulty(a);
        const difficultyB = getAchievementDifficulty(b);

        // Primary sort: by difficulty (easiest first)
        if (difficultyA !== difficultyB) {
          return difficultyA - difficultyB;
        }

        // Secondary sort: by points (lower first for same difficulty)
        if (a.points !== b.points) {
          return a.points - b.points;
        }

        // Tertiary sort: alphabetical by name
        return a.name.localeCompare(b.name);
      });
    });

    return grouped;
  }, [filteredAchievements]);

  // Get unique categories, rarities for filters
  const categories = useMemo(() => {
    const cats = [...new Set(allAchievements.map((a) => a.category))];
    return cats.sort();
  }, [allAchievements]);

  const rarities = ["common", "rare", "epic", "legendary"];

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
    switch (category) {
      case "training_milestones":
        return "Training Milestones";
      case "knockout_streaks":
        return "Streak Achievements";
      case "championship_belts":
        return "Major Milestones";
      case "daily_training":
        return "Daily Goals";
      case "endurance_challenges":
        return "Endurance Challenges";
      case "consistency_championships":
        return "Consistency Achievements";
      case "special_achievements":
        return "Special Achievements";
      case "mood_mastery":
        return "Mood Tracking";
      default:
        return category.replace("_", " ");
    }
  };

  // Format achievement subtitle
  const formatAchievementSubtitle = (
    achievement: (typeof enhancedAchievements)[0]
  ): string => {
    if (achievement.isUnlocked && achievement.unlockedAt) {
      const date = new Date(achievement.unlockedAt);
      return `Unlocked ${date.toLocaleDateString()}`;
    } else {
      // Show what the user needs to do to unlock this achievement
      if (achievement.requirements.length === 1) {
        return getRequirementDescription(achievement.requirements[0]);
      } else {
        return `Complete ${achievement.requirements.length} requirements to unlock`;
      }
    }
  };

  // Get requirement description for subtitles
  const getRequirementDescription = (
    requirement: AchievementRequirement
  ): string => {
    switch (requirement.type) {
      case "sessions_completed":
        return `Complete ${requirement.value} focus sessions`;
      case "streak_length":
        return `Maintain a ${requirement.value}-session streak`;
      case "total_time":
        return `Accumulate ${requirement.value} minutes of focus time`;
      case "daily_goal":
        return `Complete ${requirement.value} sessions in one day`;
      case "session_duration":
        return `Complete a ${requirement.value}-minute session`;
      case "mood_tracking":
        return `Track mood for ${requirement.value} sessions`;
      case "consecutive_days":
        return `Focus for ${requirement.value} consecutive days`;
      case "weekend_sessions":
        return `Complete ${requirement.value} weekend sessions`;
      case "tag_usage":
        return `Use custom tags in ${requirement.value} sessions`;
      case "session_notes":
        return `Add notes to ${requirement.value} sessions`;
      // Mood-related requirements
      case "mood_entries_total":
        return `Log ${requirement.value} mood entries`;
      case "mood_tracking_streak":
        return `Track mood for ${requirement.value} consecutive sessions`;
      case "mood_entries_with_notes":
        return `Add notes to ${requirement.value} mood entries`;
      case "mood_specific_sessions":
        if (requirement.metadata?.mood) {
          const moodName =
            requirement.metadata.mood.charAt(0).toUpperCase() +
            requirement.metadata.mood.slice(1);
          return `Complete ${requirement.value} sessions while ${moodName.toLowerCase()}`;
        }
        return `Complete ${requirement.value} sessions with specific mood`;
      case "mood_context_entries":
        if (requirement.metadata?.context) {
          const contextMap: Record<string, string> = {
            standalone: "standalone mood logs",
            "pre-session": "pre-session mood logs",
            "post-session": "post-session mood logs",
          };
          return `Log ${requirement.value} ${contextMap[requirement.metadata.context] || requirement.metadata.context + " mood entries"}`;
        }
        return `Log ${requirement.value} contextual mood entries`;
      case "mood_intensity_range":
        return `Experience ${requirement.value} different mood intensity levels`;
      case "mood_improvement_pattern":
        return `Show mood improvement in ${requirement.value} sessions`;
      case "mood_awareness_diversity":
        return `Experience ${requirement.value} different mood types`;
      default:
        return `Complete ${requirement.type} requirement`;
    }
  };

  const handleViewAchievement = (
    achievement: (typeof enhancedAchievements)[0]
  ) => {
    push(
      <AchievementDetailView
        achievement={achievement}
        isUnlocked={achievement.isUnlocked}
        progress={boxingProgress}
      />
    );
  };

  // Statistics for display
  const stats = {
    total: allAchievements.length,
    unlocked: enhancedAchievements.filter((a) => a.isUnlocked).length,
    filtered: filteredAchievements.length,
  };

  return (
    <List
      navigationTitle="Achievement Browser"
      searchBarPlaceholder="Search achievements by name, description, category, or rarity..."
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Category"
          value={selectedCategory}
          onChange={setSelectedCategory}
        >
          <List.Dropdown.Item title="All Categories" value="all" />
          {categories.map((category) => (
            <List.Dropdown.Item
              key={category}
              title={getCategoryDisplayName(category).replace(/^[^\s]+ /, "")}
              value={category}
            />
          ))}
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Navigation">
            <Action
              title="Back to Achievements"
              icon={Icon.ArrowLeft}
              onAction={onBack || pop}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Filters">
            <ActionPanel.Submenu title="Filter by Rarity" icon={Icon.Star}>
              <Action
                title="All Rarities"
                onAction={() => setSelectedRarity("all")}
                icon={selectedRarity === "all" ? Icon.CheckCircle : Icon.Circle}
              />
              {rarities.map((rarity) => (
                <Action
                  key={rarity}
                  title={rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  onAction={() => setSelectedRarity(rarity)}
                  icon={{
                    source:
                      selectedRarity === rarity
                        ? Icon.CheckCircle
                        : Icon.Circle,
                    tintColor: getRarityColor(rarity),
                  }}
                />
              ))}
            </ActionPanel.Submenu>

            <ActionPanel.Submenu title="Filter by Status" icon={Icon.Filter}>
              <Action
                title="All Achievements"
                onAction={() => setSelectedStatus("all")}
                icon={selectedStatus === "all" ? Icon.CheckCircle : Icon.Circle}
              />
              <Action
                title="Unlocked Only"
                onAction={() => setSelectedStatus("unlocked")}
                icon={{
                  source:
                    selectedStatus === "unlocked"
                      ? Icon.CheckCircle
                      : Icon.Circle,
                  tintColor: Color.Green,
                }}
              />
              <Action
                title="Locked Only"
                onAction={() => setSelectedStatus("locked")}
                icon={{
                  source:
                    selectedStatus === "locked"
                      ? Icon.CheckCircle
                      : Icon.Circle,
                  tintColor: Color.SecondaryText,
                }}
              />
            </ActionPanel.Submenu>
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      {/* Statistics Section */}
      <List.Section
        title={`Statistics (${stats.filtered} of ${stats.total} achievements)`}
      >
        <List.Item
          title="Achievement Progress"
          subtitle={`${stats.unlocked} unlocked • ${stats.total - stats.unlocked} remaining • ${Math.round((stats.unlocked / stats.total) * 100)}% complete`}
          icon={{
            source: Icon.BarChart,
            tintColor: Color.Blue,
          }}
          accessories={[
            {
              tag: {
                value: `${Math.round((stats.unlocked / stats.total) * 100)}%`,
                color: Color.Blue,
              },
            },
          ]}
        />
      </List.Section>

      {/* Achievement Categories */}
      {Object.entries(achievementsByCategory).map(
        ([category, achievements]) => (
          <List.Section
            key={category}
            title={`${getCategoryDisplayName(category)} (${achievements.length})`}
          >
            {achievements.map((achievement) => (
              <List.Item
                key={achievement.id}
                icon={{
                  source: achievement.isUnlocked
                    ? achievement.icon
                    : Icon.Circle,
                  tintColor: achievement.isUnlocked
                    ? getRarityColor(achievement.rarity)
                    : Color.SecondaryText,
                }}
                title={achievement.name}
                subtitle={formatAchievementSubtitle(achievement)}
                accessories={[
                  {
                    tag: {
                      value: achievement.isUnlocked ? "Unlocked" : "Locked",
                      color: achievement.isUnlocked
                        ? Color.Green
                        : Color.SecondaryText,
                    },
                  },
                  {
                    tag: {
                      value: `${achievement.points} pts`,
                      color: getRarityColor(achievement.rarity),
                    },
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action
                      title={
                        achievement.isUnlocked
                          ? "View Achievement"
                          : "View Requirements"
                      }
                      icon={achievement.isUnlocked ? Icon.Trophy : Icon.Info}
                      onAction={() => handleViewAchievement(achievement)}
                    />
                    <Action
                      title="Back to Achievements"
                      icon={Icon.ArrowLeft}
                      onAction={onBack || pop}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        )
      )}

      {filteredAchievements.length === 0 && (
        <List.EmptyView
          title="No achievements found"
          description="Try adjusting your search terms or filters"
          icon={Icon.MagnifyingGlass}
        />
      )}
    </List>
  );
}
