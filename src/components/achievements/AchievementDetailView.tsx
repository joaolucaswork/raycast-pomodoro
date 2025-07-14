import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  Color,
  useNavigation,
} from "@raycast/api";
import { Achievement, BoxingProgress, TimerSession } from "../../types/timer";
import { ACHIEVEMENT_COLORS } from "../../constants/design-tokens";
import { formatDistanceToNow, format } from "date-fns";
import { useTimerStore } from "../../store/timer-store";

interface AchievementDetailViewProps {
  achievement: Achievement;
  isUnlocked?: boolean;
  progress?: BoxingProgress;
}

export function AchievementDetailView({
  achievement,
  isUnlocked = false,
  progress,
}: AchievementDetailViewProps) {
  const { pop } = useNavigation();
  const { history } = useTimerStore();

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
        return "Knockout Streaks";
      case "championship_belts":
        return "Championship Belts";
      case "daily_training":
        return "Daily Training";
      case "endurance_challenges":
        return "Endurance Challenges";
      case "consistency_championships":
        return "Consistency Championships";
      case "special_achievements":
        return "Special Achievements";
      case "mood_mastery":
        return "Mood Mastery";
      default:
        return category.replace("_", " ");
    }
  };

  // Calculate requirement progress
  const getRequirementProgress = (
    requirement: any
  ): { current: number; target: number; percentage: number } => {
    if (!progress)
      return { current: 0, target: requirement.value, percentage: 0 };

    let current = 0;
    const target = requirement.value;

    switch (requirement.type) {
      case "sessions_completed":
        current = progress.totalRounds;
        break;
      case "streak_length":
        current = progress.currentStreak;
        break;
      case "total_time":
        current = progress.totalTrainingTime;
        break;
      case "daily_goal":
        current = progress.dailyRoundsToday;
        break;
      case "mood_tracking":
        current = progress.moodTrackingStreak || 0;
        break;
      case "consecutive_days":
        // Calculate consecutive days with sessions
        current = calculateConsecutiveDays();
        break;
      // New mood-related achievement types
      case "mood_entries_total":
        current = progress.totalMoodEntries || 0;
        break;
      case "mood_tracking_streak":
        current = progress.moodTrackingStreak || 0;
        break;
      case "mood_entries_with_notes":
        current = progress.moodEntriesWithNotes || 0;
        break;
      case "mood_intensity_range":
        current = progress.uniqueIntensityLevelsUsed || 0;
        break;
      case "mood_context_entries":
        if (requirement.metadata?.context === "pre-session") {
          current = progress.preSessionMoodEntries || 0;
        } else if (requirement.metadata?.context === "during-session") {
          current = progress.duringSessionMoodEntries || 0;
        } else if (requirement.metadata?.context === "post-session") {
          current = progress.postSessionMoodEntries || 0;
        } else if (requirement.metadata?.context === "standalone") {
          current = progress.standaloneMoodEntries || 0;
        }
        break;
      case "mood_specific_sessions":
        if (requirement.metadata?.mood === "energized") {
          current = progress.energizedSessions || 0;
        } else if (requirement.metadata?.mood === "focused") {
          current = progress.focusedSessions || 0;
        } else if (requirement.metadata?.mood === "calm") {
          current = progress.calmSessions || 0;
        } else if (requirement.metadata?.mood === "motivated") {
          current = progress.motivatedSessions || 0;
        } else if (requirement.metadata?.mood === "neutral") {
          current = progress.neutralSessions || 0;
        } else if (requirement.metadata?.mood === "tired") {
          current = progress.tiredSessions || 0;
        } else if (requirement.metadata?.mood === "stressed") {
          current = progress.stressedSessions || 0;
        } else if (requirement.metadata?.mood === "overwhelmed") {
          current = progress.overwhelmedSessions || 0;
        } else if (requirement.metadata?.mood === "distracted") {
          current = progress.distractedSessions || 0;
        }
        break;
      case "mood_improvement_pattern":
        current = progress.moodImprovementPatterns || 0;
        break;
      case "mood_awareness_diversity":
        current = progress.uniqueMoodTypesLogged || 0;
        break;
      default:
        current = 0;
    }

    const percentage = Math.min((current / target) * 100, 100);
    return { current, target, percentage };
  };

  const calculateConsecutiveDays = (): number => {
    if (!history.length) return 0;

    const today = new Date();
    const sortedSessions = history
      .filter((session) => session.endTime)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

    let consecutiveDays = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      // Check up to a year
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasSessionThisDay = sortedSessions.some((session) => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });

      if (hasSessionThisDay) {
        consecutiveDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return consecutiveDays;
  };

  // Build markdown content
  const buildMarkdownContent = (): string => {
    let content = `# ${achievement.name}\n\n`;
    content += `${achievement.description}\n\n`;

    if (achievement.unlockedAt && isUnlocked) {
      content += `**Unlocked:** ${format(new Date(achievement.unlockedAt), "PPP")}\n\n`;
    }

    // Requirements section
    content += `## Requirements\n\n`;
    achievement.requirements.forEach((req) => {
      const progressData = getRequirementProgress(req);
      const progressBar =
        "█".repeat(Math.floor(progressData.percentage / 10)) +
        "░".repeat(10 - Math.floor(progressData.percentage / 10));

      content += `• ${getRequirementDescription(req)}\n`;
      content += `  \`${progressBar}\` ${progressData.current}/${progressData.target}\n\n`;
    });

    return content;
  };

  const getRequirementDescription = (requirement: any): string => {
    switch (requirement.type) {
      case "sessions_completed":
        return `Complete ${requirement.value} focus sessions`;
      case "streak_length":
        return `Maintain a streak of ${requirement.value} consecutive sessions`;
      case "total_time":
        return `Accumulate ${requirement.value} minutes of total focus time`;
      case "daily_goal":
        return `Complete ${requirement.value} sessions in a single day`;
      case "session_duration":
        return `Complete a single session lasting ${requirement.value} minutes`;
      case "mood_tracking":
        return `Track your mood for ${requirement.value} consecutive sessions`;
      case "consecutive_days":
        return `Complete at least one session for ${requirement.value} consecutive days`;
      case "weekend_sessions":
        return `Complete ${requirement.value} sessions on weekends`;
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
        return `Complete requirement: ${requirement.type} (${requirement.value})`;
    }
  };

  return (
    <Detail
      navigationTitle={`${achievement.name} Achievement`}
      markdown={buildMarkdownContent()}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Status"
            text={isUnlocked ? "Unlocked" : "Locked"}
            icon={{
              source: isUnlocked ? Icon.CheckCircle : Icon.Circle,
              tintColor: isUnlocked ? Color.Green : Color.SecondaryText,
            }}
          />
          <Detail.Metadata.Label
            title="Rarity"
            text={
              achievement.rarity.charAt(0).toUpperCase() +
              achievement.rarity.slice(1)
            }
            icon={{
              source: Icon.Star,
              tintColor: getRarityColor(achievement.rarity),
            }}
          />
          <Detail.Metadata.Label
            title="Points"
            text={`${achievement.points} pts`}
            icon={Icon.Trophy}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Category"
            text={getCategoryDisplayName(achievement.category)}
            icon={Icon.Tag}
          />
          {achievement.unlockedAt && (
            <Detail.Metadata.Label
              title="Unlocked"
              text={format(new Date(achievement.unlockedAt), "PPP")}
              icon={Icon.Calendar}
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
          {isUnlocked && achievement.unlockedAt && (
            <Action.CopyToClipboard
              title="Copy Achievement Info"
              content={`${achievement.name} - Unlocked ${formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}`}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
