import { List } from "@raycast/api";
import {
  ACHIEVEMENT_COLORS,
  ACHIEVEMENT_ICONS,
} from "../../../constants/design-tokens";
import { RewardSystem } from "../../../types/timer";
import { getAchievementStyling } from "../utils/achievement-styling";
import { adhdSupportService } from "../../../services/adhd-support-service";

interface ProfileAchievementsProps {
  rewardSystem: RewardSystem;
  viewMode: string;
}

export function ProfileAchievements({
  rewardSystem,
  viewMode,
}: ProfileAchievementsProps) {
  // Only render when in achievements mode
  if (viewMode !== "achievements") return null;
  const unlockedAchievements = rewardSystem.achievements.filter(
    (a) => a.unlockedAt
  );
  const availableAchievements = adhdSupportService.getDefaultAchievements();
  const lockedAchievements = availableAchievements.filter(
    (a) => !rewardSystem.achievements.some((ua) => ua.id === a.id)
  );

  return (
    <>
      <List.Section
        title={`Unlocked Achievements (${unlockedAchievements.length})`}
      >
        {unlockedAchievements.map((achievement) => {
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

      <List.Section
        title={`Available Achievements (${lockedAchievements.length})`}
      >
        {lockedAchievements.map((achievement) => (
          <List.Item
            key={achievement.id}
            title={achievement.name}
            subtitle={achievement.description}
            icon={{
              source: achievement.icon,
              tintColor: ACHIEVEMENT_COLORS.LOCKED,
            }}
            accessories={[
              { text: `+${achievement.points}` },
              {
                icon: {
                  source: ACHIEVEMENT_ICONS.LOCKED,
                  tintColor: ACHIEVEMENT_COLORS.LOCKED,
                },
                tooltip: `${achievement.rarity} achievement - locked`,
              },
            ]}
          />
        ))}
      </List.Section>
    </>
  );
}
