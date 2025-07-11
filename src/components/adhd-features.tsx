import { Action, ActionPanel, Icon, List, Color } from "@raycast/api";
import { useTimerStore } from "../store/timer-store";
import { adhdSupportService } from "../services/adhd-support-service";
import { STATUS_COLORS, ACTION_ICONS } from "../constants/design-tokens";

interface ADHDQuickSetupProps {
  onEnergyLevelChange: (level: 1 | 2 | 3 | 4 | 5) => void;
  onMoodStateChange: (
    mood: "motivated" | "neutral" | "struggling" | "hyperfocus"
  ) => void;
  currentEnergyLevel: 1 | 2 | 3 | 4 | 5;
  currentMoodState: "motivated" | "neutral" | "struggling" | "hyperfocus";
}

export function ADHDQuickSetup({
  onEnergyLevelChange,
  onMoodStateChange,
  currentEnergyLevel,
  currentMoodState,
}: ADHDQuickSetupProps) {
  const getEnergyIcon = (level: number): Icon => {
    if (level <= 2) return Icon.Battery;
    if (level >= 4) return Icon.Bolt;
    return Icon.Circle;
  };

  const getEnergyColor = (level: number): Color => {
    if (level <= 2) return STATUS_COLORS.ERROR;
    if (level >= 4) return STATUS_COLORS.SUCCESS;
    return STATUS_COLORS.WARNING;
  };

  const getMoodIcon = (mood: string): Icon => {
    switch (mood) {
      case "motivated":
        return Icon.Rocket;
      case "struggling":
        return Icon.ExclamationMark;
      case "hyperfocus":
        return Icon.BullsEye;
      default:
        return Icon.Circle;
    }
  };

  const getMoodColor = (mood: string): Color => {
    switch (mood) {
      case "motivated":
        return STATUS_COLORS.SUCCESS;
      case "struggling":
        return STATUS_COLORS.ERROR;
      case "hyperfocus":
        return STATUS_COLORS.ACCENT;
      default:
        return STATUS_COLORS.NEUTRAL;
    }
  };

  return (
    <>
      <List.Section title="Focus Setup">
        <List.Item
          title="Energy Level"
          subtitle={`Current: ${currentEnergyLevel}/5 ${currentEnergyLevel <= 2 ? "(Low)" : currentEnergyLevel >= 4 ? "(High)" : "(Medium)"}`}
          icon={{
            source: getEnergyIcon(currentEnergyLevel),
            tintColor: getEnergyColor(currentEnergyLevel),
          }}
          accessories={[
            {
              text: `${currentEnergyLevel}/5`,
              tooltip: "Your current energy level affects session duration",
            },
          ]}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Set Energy Level">
                <Action
                  title="Very Low (1/5)"
                  icon={{
                    source: Icon.Battery,
                    tintColor: STATUS_COLORS.ERROR,
                  }}
                  onAction={() => onEnergyLevelChange(1)}
                />
                <Action
                  title="Low (2/5)"
                  icon={{
                    source: Icon.Battery,
                    tintColor: STATUS_COLORS.ERROR,
                  }}
                  onAction={() => onEnergyLevelChange(2)}
                />
                <Action
                  title="Medium (3/5)"
                  icon={{
                    source: Icon.Circle,
                    tintColor: STATUS_COLORS.WARNING,
                  }}
                  onAction={() => onEnergyLevelChange(3)}
                />
                <Action
                  title="High (4/5)"
                  icon={{ source: Icon.Bolt, tintColor: STATUS_COLORS.SUCCESS }}
                  onAction={() => onEnergyLevelChange(4)}
                />
                <Action
                  title="Very High (5/5)"
                  icon={{ source: Icon.Bolt, tintColor: STATUS_COLORS.SUCCESS }}
                  onAction={() => onEnergyLevelChange(5)}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />

        <List.Item
          title="Mood State"
          subtitle={`Currently feeling: ${currentMoodState}`}
          icon={{
            source: getMoodIcon(currentMoodState),
            tintColor: getMoodColor(currentMoodState),
          }}
          accessories={[
            {
              icon: {
                source: Icon.Circle,
                tintColor: getMoodColor(currentMoodState),
              },
              tooltip: "Your mood affects session recommendations",
            },
          ]}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Set Mood State">
                <Action
                  title="Motivated"
                  icon={{
                    source: Icon.Rocket,
                    tintColor: STATUS_COLORS.SUCCESS,
                  }}
                  onAction={() => onMoodStateChange("motivated")}
                />
                <Action
                  title="Neutral"
                  icon={{
                    source: Icon.Circle,
                    tintColor: STATUS_COLORS.NEUTRAL,
                  }}
                  onAction={() => onMoodStateChange("neutral")}
                />
                <Action
                  title="Struggling"
                  icon={{
                    source: Icon.ExclamationMark,
                    tintColor: STATUS_COLORS.ERROR,
                  }}
                  onAction={() => onMoodStateChange("struggling")}
                />
                <Action
                  title="Hyperfocus"
                  icon={{
                    source: Icon.BullsEye,
                    tintColor: STATUS_COLORS.ACCENT,
                  }}
                  onAction={() => onMoodStateChange("hyperfocus")}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      </List.Section>
    </>
  );
}

interface RewardSystemDisplayProps {
  rewardSystem: {
    points: number;
    level: number;
    achievements: Array<{
      id: string;
      name: string;
      description: string;
      icon: Icon;
      unlockedAt?: Date;
      rarity: "common" | "rare" | "epic" | "legendary";
      points: number;
    }>;
    dailyGoal: number;
  };
  todaysSessions: number;
}

export function RewardSystemDisplay({
  rewardSystem,
  todaysSessions,
}: RewardSystemDisplayProps) {
  const pointsForNextLevel = adhdSupportService.getPointsForNextLevel(
    rewardSystem.points
  );
  const progressToNextLevel = Math.round(
    ((rewardSystem.points - Math.pow(rewardSystem.level - 1, 2) * 50) /
      (Math.pow(rewardSystem.level, 2) * 50 -
        Math.pow(rewardSystem.level - 1, 2) * 50)) *
      100
  );

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

  const recentAchievements = rewardSystem.achievements
    .filter((a) => a.unlockedAt)
    .sort(
      (a, b) =>
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
    )
    .slice(0, 3);

  return (
    <>
      <List.Section title="Progress & Rewards">
        <List.Item
          title={`Level ${rewardSystem.level}`}
          subtitle={`${rewardSystem.points} points • ${pointsForNextLevel} to next level`}
          icon={{ source: Icon.Trophy, tintColor: STATUS_COLORS.SUCCESS }}
          accessories={[
            {
              text: `${progressToNextLevel}%`,
              tooltip: `${progressToNextLevel}% progress to level ${rewardSystem.level + 1}`,
            },
            {
              icon: { source: Icon.Circle, tintColor: STATUS_COLORS.SUCCESS },
              tooltip: `Level ${rewardSystem.level}`,
            },
          ]}
        />

        <List.Item
          title="Daily Goal"
          subtitle={`${todaysSessions}/${rewardSystem.dailyGoal} sessions completed today`}
          icon={{ source: Icon.BullsEye, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            {
              text: `${Math.round((todaysSessions / rewardSystem.dailyGoal) * 100)}%`,
              tooltip: "Daily goal progress",
            },
            {
              icon: {
                source: Icon.Circle,
                tintColor:
                  todaysSessions >= rewardSystem.dailyGoal
                    ? STATUS_COLORS.SUCCESS
                    : STATUS_COLORS.INFO,
              },
              tooltip:
                todaysSessions >= rewardSystem.dailyGoal
                  ? "Daily goal achieved!"
                  : "Keep going!",
            },
          ]}
        />
      </List.Section>

      {recentAchievements.length > 0 && (
        <List.Section title="Recent Achievements">
          {recentAchievements.map((achievement) => (
            <List.Item
              key={achievement.id}
              title={achievement.name}
              subtitle={achievement.description}
              icon={{
                source: achievement.icon,
                tintColor: getRarityColor(achievement.rarity),
              }}
              accessories={[
                {
                  text: `+${achievement.points}`,
                  tooltip: `Earned ${achievement.points} points`,
                },
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
      )}
    </>
  );
}

interface BreakActivitySuggestionProps {
  energyLevel?: number;
  moodState?: string;
  onSelectActivity: (activityId: string) => void;
}

export function BreakActivitySuggestion({
  energyLevel,
  moodState,
  onSelectActivity,
}: BreakActivitySuggestionProps) {
  const suggestedActivity = adhdSupportService.suggestBreakActivity(
    energyLevel as 1 | 2 | 3 | 4 | 5,
    moodState as "motivated" | "neutral" | "struggling" | "hyperfocus"
  );

  const getTypeColor = (type: string): Color => {
    switch (type) {
      case "movement":
        return STATUS_COLORS.SUCCESS;
      case "mindfulness":
        return STATUS_COLORS.INFO;
      case "sensory":
        return STATUS_COLORS.ACCENT;
      case "cognitive":
        return STATUS_COLORS.WARNING;
      default:
        return STATUS_COLORS.NEUTRAL;
    }
  };

  return (
    <List.Section title="Suggested Break Activity">
      <List.Item
        title={suggestedActivity.name}
        subtitle={`${Math.round(suggestedActivity.duration / 60)} min • ${suggestedActivity.adhdBenefit}`}
        icon={{
          source: suggestedActivity.icon,
          tintColor: getTypeColor(suggestedActivity.type),
        }}
        accessories={[
          {
            text: suggestedActivity.type,
            tooltip: `${suggestedActivity.type} activity`,
          },
          {
            icon: {
              source: Icon.Circle,
              tintColor: getTypeColor(suggestedActivity.type),
            },
            tooltip: suggestedActivity.difficulty,
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Select This Activity"
              icon={ACTION_ICONS.PLAY}
              onAction={() => onSelectActivity(suggestedActivity.id)}
            />
            <ActionPanel.Section title="Instructions">
              {suggestedActivity.instructions.map((instruction, index) => (
                <Action
                  key={index}
                  title={`${index + 1}. ${instruction}`}
                  icon={Icon.List}
                  onAction={() => {}}
                />
              ))}
            </ActionPanel.Section>
          </ActionPanel>
        }
      />
    </List.Section>
  );
}
