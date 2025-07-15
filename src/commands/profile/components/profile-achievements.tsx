import { List } from "@raycast/api";
import {
  ACHIEVEMENT_COLORS,
  ACHIEVEMENT_ICONS,
} from "../../../constants/design-tokens";
import { RewardSystem } from "../../../types/timer";
import { getAchievementStyling } from "../utils/achievement-styling";
import { adhdSupportService } from "../../../services/features/adhd-support-service";
import {
  BoxingAchievementDisplay,
  BoxingProgressDisplay,
} from "../../../components/achievements";
import { useTimerStore } from "../../../store/timer-store";

interface ProfileAchievementsProps {
  rewardSystem: RewardSystem;
  viewMode: string;
}

export function ProfileAchievements({
  rewardSystem,
  viewMode,
}: ProfileAchievementsProps) {
  // Get boxing achievement data from store
  const {
    getBoxingAchievements,
    getAchievementStats,
    getBoxingLevel,
    getNextBoxingLevel,
    boxingProgress,
  } = useTimerStore();

  // Only render when in achievements mode
  if (viewMode !== "achievements") return null;

  const boxingAchievements = getBoxingAchievements();
  const achievementStats = getAchievementStats();
  const currentLevel = getBoxingLevel();
  const nextLevel = getNextBoxingLevel();

  return (
    <>
      {/* Boxing Progress Display */}
      <BoxingProgressDisplay
        progress={boxingProgress}
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        showDetailed={false}
      />

      {/* Boxing Achievement Display */}
      <BoxingAchievementDisplay
        achievements={boxingAchievements}
        stats={achievementStats}
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        viewMode="overview"
      />
    </>
  );
}
