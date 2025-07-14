import { Icon, Color } from "@raycast/api";
import {
  Achievement,
  AchievementCategory,
  AchievementRequirement,
  BoxingProgress,
  BoxingLevel,
  AchievementStats,
  TimerSession,
  RewardSystem,
  MoodEntry,
  MoodType,
} from "../../types/timer";

/**
 * Boxing-themed achievement service for "Another Round" extension
 * Implements the "knocking out procrastination" achievement system
 */
export class BoxingAchievementService {
  /**
   * Get all boxing-themed achievements
   */
  public getBoxingAchievements(): Achievement[] {
    return [
      // Training Milestones (Basic Achievements)
      {
        id: "first-bell",
        name: "First Bell",
        description: "Complete your first round against procrastination",
        icon: Icon.Play,
        rarity: "common",
        points: 25,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 1 }],
        isBoxingThemed: true,
      },
      {
        id: "training-begins",
        name: "Training Begins",
        description: "Complete 5 rounds - your training is underway",
        icon: Icon.Hammer,
        rarity: "common",
        points: 50,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 5 }],
        isBoxingThemed: true,
      },
      {
        id: "getting-stronger",
        name: "Getting Stronger",
        description: "Complete 25 rounds - you're building strength",
        icon: Icon.BullsEye,
        rarity: "rare",
        points: 100,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 25 }],
        isBoxingThemed: true,
      },
      {
        id: "seasoned-fighter",
        name: "Seasoned Fighter",
        description: "Complete 100 rounds - you're a seasoned fighter",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 250,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 100 }],
        isBoxingThemed: true,
      },
      {
        id: "champion-material",
        name: "Champion Material",
        description: "Complete 500 rounds - you have champion potential",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 500,
        category: "training_milestones",
        requirements: [{ type: "sessions_completed", value: 500 }],
        isBoxingThemed: true,
      },

      // Knockout Streaks (Consistency)
      {
        id: "double-jab",
        name: "Double Jab",
        description: "Complete 2 rounds in a row - nice combo!",
        icon: Icon.ArrowRight,
        rarity: "common",
        points: 30,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 2 }],
        isBoxingThemed: true,
      },
      {
        id: "combo-strike",
        name: "Combo Strike",
        description: "Complete 5 rounds in a row - excellent combination",
        icon: Icon.Bolt,
        rarity: "rare",
        points: 75,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 5 }],
        isBoxingThemed: true,
      },
      {
        id: "power-punch",
        name: "Power Punch",
        description: "Complete 10 rounds in a row - devastating power",
        icon: Icon.Star,
        rarity: "epic",
        points: 150,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 10 }],
        isBoxingThemed: true,
      },
      {
        id: "knockout-artist",
        name: "Knockout Artist",
        description: "Complete 20 rounds in a row - you're a knockout artist",
        icon: Icon.Star,
        rarity: "epic",
        points: 300,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 20 }],
        isBoxingThemed: true,
      },
      {
        id: "undefeated",
        name: "Undefeated",
        description: "Complete 50 rounds in a row - undefeated champion",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 750,
        category: "knockout_streaks",
        requirements: [{ type: "streak_length", value: 50 }],
        isBoxingThemed: true,
      },

      // Championship Belts (Major Milestones)
      {
        id: "rookie-belt",
        name: "Rookie Belt",
        description: "Complete 10 hours of training - earned your rookie belt",
        icon: Icon.Trophy,
        rarity: "rare",
        points: 100,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 600 }], // 10 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "amateur-belt",
        name: "Amateur Belt",
        description: "Complete 25 hours of training - amateur champion",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 200,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 1500 }], // 25 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "professional-belt",
        name: "Professional Belt",
        description: "Complete 50 hours of training - professional fighter",
        icon: Icon.Crown,
        rarity: "epic",
        points: 400,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 3000 }], // 50 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "championship-belt",
        name: "Championship Belt",
        description: "Complete 100 hours of training - world champion",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 800,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 6000 }], // 100 hours in minutes
        isBoxingThemed: true,
      },
      {
        id: "hall-of-fame",
        name: "Hall of Fame",
        description: "Complete 250 hours of training - hall of fame legend",
        icon: Icon.Star,
        rarity: "legendary",
        points: 1500,
        category: "championship_belts",
        requirements: [{ type: "total_time", value: 15000 }], // 250 hours in minutes
        isBoxingThemed: true,
      },

      // Daily Training (Daily Goals)
      {
        id: "morning-warrior",
        name: "Morning Warrior",
        description: "Complete 3 rounds before noon - morning champion",
        icon: Icon.Sun,
        rarity: "rare",
        points: 75,
        category: "daily_training",
        requirements: [
          { type: "daily_goal", value: 3, timeframe: "daily" },
          { type: "time_of_day", value: 12, metadata: { before: true } },
        ],
        isBoxingThemed: true,
      },
      {
        id: "afternoon-champion",
        name: "Afternoon Champion",
        description: "Complete 5 rounds in one day - daily champion",
        icon: Icon.BullsEye,
        rarity: "rare",
        points: 100,
        category: "daily_training",
        requirements: [{ type: "daily_goal", value: 5, timeframe: "daily" }],
        isBoxingThemed: true,
      },
      {
        id: "training-beast",
        name: "Training Beast",
        description: "Complete 8 rounds in one day - training beast",
        icon: Icon.Bolt,
        rarity: "epic",
        points: 200,
        category: "daily_training",
        requirements: [{ type: "daily_goal", value: 8, timeframe: "daily" }],
        isBoxingThemed: true,
      },
      {
        id: "iron-will",
        name: "Iron Will",
        description: "Complete 12 rounds in one day - iron will",
        icon: Icon.Hammer,
        rarity: "legendary",
        points: 400,
        category: "daily_training",
        requirements: [{ type: "daily_goal", value: 12, timeframe: "daily" }],
        isBoxingThemed: true,
      },

      // Endurance Challenges (Long Sessions)
      {
        id: "stamina-builder",
        name: "Stamina Builder",
        description: "Complete a 45-minute round - building stamina",
        icon: Icon.Clock,
        rarity: "rare",
        points: 75,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 45 }],
        isBoxingThemed: true,
      },
      {
        id: "endurance-fighter",
        name: "Endurance Fighter",
        description: "Complete a 60-minute round - endurance fighter",
        icon: Icon.Clock,
        rarity: "epic",
        points: 150,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 60 }],
        isBoxingThemed: true,
      },
      {
        id: "marathon-boxer",
        name: "Marathon Boxer",
        description: "Complete a 90-minute round - marathon boxer",
        icon: Icon.Stopwatch,
        rarity: "epic",
        points: 250,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 90 }],
        isBoxingThemed: true,
      },
      {
        id: "iron-man",
        name: "Iron Man",
        description: "Complete a 2-hour round - iron man endurance",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 500,
        category: "endurance_challenges",
        requirements: [{ type: "session_duration", value: 120 }],
        isBoxingThemed: true,
      },

      // Consistency Championships (Weekly/Monthly)
      {
        id: "weekly-warrior",
        name: "Weekly Warrior",
        description: "Complete rounds 5 days in a week - weekly warrior",
        icon: Icon.Calendar,
        rarity: "rare",
        points: 100,
        category: "consistency_championships",
        requirements: [
          { type: "consecutive_days", value: 5, timeframe: "weekly" },
        ],
        isBoxingThemed: true,
      },
      {
        id: "training-dedication",
        name: "Training Dedication",
        description: "Complete rounds 7 days in a week - full dedication",
        icon: Icon.CheckCircle,
        rarity: "epic",
        points: 200,
        category: "consistency_championships",
        requirements: [
          { type: "consecutive_days", value: 7, timeframe: "weekly" },
        ],
        isBoxingThemed: true,
      },
      {
        id: "monthly-champion",
        name: "Monthly Champion",
        description: "Complete 50 rounds in a month - monthly champion",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 300,
        category: "consistency_championships",
        requirements: [
          { type: "sessions_completed", value: 50, timeframe: "monthly" },
        ],
        isBoxingThemed: true,
      },
      {
        id: "consistency-king",
        name: "Consistency King",
        description:
          "Complete rounds for 30 consecutive days - consistency king",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 600,
        category: "consistency_championships",
        requirements: [
          { type: "consecutive_days", value: 30, timeframe: "all_time" },
        ],
        isBoxingThemed: true,
      },

      // Special Achievements (Unique)
      {
        id: "early-bird",
        name: "Early Bird",
        description: "Complete 10 rounds before 8 AM - early bird fighter",
        icon: Icon.Sun,
        rarity: "rare",
        points: 100,
        category: "special_achievements",
        requirements: [
          { type: "sessions_completed", value: 10 },
          { type: "time_of_day", value: 8, metadata: { before: true } },
        ],
        isBoxingThemed: true,
      },
      {
        id: "night-owl",
        name: "Night Owl",
        description: "Complete 10 rounds after 10 PM - night owl fighter",
        icon: Icon.Moon,
        rarity: "rare",
        points: 100,
        category: "special_achievements",
        requirements: [
          { type: "sessions_completed", value: 10 },
          { type: "time_of_day", value: 22, metadata: { after: true } },
        ],
        isBoxingThemed: true,
      },
      {
        id: "weekend-warrior",
        name: "Weekend Warrior",
        description: "Complete 20 rounds on weekends - weekend warrior",
        icon: Icon.Calendar,
        rarity: "epic",
        points: 150,
        category: "special_achievements",
        requirements: [{ type: "weekend_sessions", value: 20 }],
        isBoxingThemed: true,
      },
      // === MOOD LOGGING ACHIEVEMENTS (Beginner to Advanced) ===

      // COMMON - First Steps (25 points)
      {
        id: "first-mood-log",
        name: "Emotional Awareness",
        description: "Log your first mood entry - beginning of self-awareness",
        icon: Icon.Heart,
        rarity: "common",
        points: 25,
        category: "mood_mastery",
        requirements: [{ type: "mood_entries_total", value: 1 }],
        isBoxingThemed: true,
      },

      // RARE - Building Habits (100-150 points)
      {
        id: "mood-consistency",
        name: "Emotional Discipline",
        description:
          "Log moods for 10 consecutive sessions - building discipline",
        icon: Icon.Calendar,
        rarity: "rare",
        points: 100,
        category: "mood_mastery",
        requirements: [{ type: "mood_tracking_streak", value: 10 }],
        isBoxingThemed: true,
      },
      {
        id: "detailed-mood-tracker",
        name: "Thoughtful Fighter",
        description: "Add notes to 20 mood entries - thoughtful reflection",
        icon: Icon.Document,
        rarity: "rare",
        points: 125,
        category: "mood_mastery",
        requirements: [{ type: "mood_entries_with_notes", value: 20 }],
        isBoxingThemed: true,
      },

      // EPIC - Advanced Tracking (175-250 points)
      {
        id: "intensity-explorer",
        name: "Emotional Range Fighter",
        description:
          "Log moods at all intensity levels (1-5) - complete emotional range",
        icon: Icon.BarChart,
        rarity: "epic",
        points: 175,
        category: "mood_mastery",
        requirements: [{ type: "mood_intensity_range", value: 5 }],
        isBoxingThemed: true,
      },
      {
        id: "mood-dedication",
        name: "Mental Training Champion",
        description: "Log moods for 25 consecutive sessions - mental champion",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 200,
        category: "mood_mastery",
        requirements: [{ type: "mood_tracking_streak", value: 25 }],
        isBoxingThemed: true,
      },

      // LEGENDARY - Mastery Level (300+ points)
      {
        id: "mood-master",
        name: "Emotional Intelligence Master",
        description:
          "Log moods for 50 consecutive sessions - emotional mastery",
        icon: Icon.Crown,
        rarity: "legendary",
        points: 400,
        category: "mood_mastery",
        requirements: [{ type: "mood_tracking_streak", value: 50 }],
        isBoxingThemed: true,
      },

      // === SPECIFIC MOOD STATE ACHIEVEMENTS (Easy to Challenging) ===

      // RARE - Positive Mood States (100-150 points)
      {
        id: "neutral-steady",
        name: "Steady Fighter",
        description: "Complete 10 rounds while neutral - consistent performer",
        icon: Icon.Circle,
        rarity: "rare",
        points: 100,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 10,
            metadata: { mood: "neutral" },
          },
        ],
        isBoxingThemed: true,
      },
      {
        id: "energized-warrior",
        name: "Energized Warrior",
        description: "Complete 10 rounds while energized - high-energy fighter",
        icon: Icon.Bolt,
        rarity: "rare",
        points: 125,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 10,
            metadata: { mood: "energized" },
          },
        ],
        isBoxingThemed: true,
      },
      {
        id: "calm-master",
        name: "Calm Master",
        description: "Complete 12 rounds while calm - zen fighter",
        icon: Icon.Cloud,
        rarity: "rare",
        points: 125,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 12,
            metadata: { mood: "calm" },
          },
        ],
        isBoxingThemed: true,
      },
      {
        id: "focused-champion",
        name: "Focused Champion",
        description: "Complete 15 rounds while focused - laser-focused fighter",
        icon: Icon.BullsEye,
        rarity: "rare",
        points: 150,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 15,
            metadata: { mood: "focused" },
          },
        ],
        isBoxingThemed: true,
      },

      // EPIC - Challenging Mood States (175-250 points)
      {
        id: "motivated-champion",
        name: "Motivated Champion",
        description: "Complete 20 rounds while motivated - driven fighter",
        icon: Icon.Rocket,
        rarity: "epic",
        points: 175,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 20,
            metadata: { mood: "motivated" },
          },
        ],
        isBoxingThemed: true,
      },
      {
        id: "tired-resilience",
        name: "Resilient Fighter",
        description: "Complete 8 rounds while tired - showing resilience",
        icon: Icon.Battery,
        rarity: "epic",
        points: 200,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 8,
            metadata: { mood: "tired" },
          },
        ],
        isBoxingThemed: true,
      },
      {
        id: "stressed-perseverance",
        name: "Perseverance Champion",
        description: "Complete 5 rounds while stressed - mental toughness",
        icon: Icon.ExclamationMark,
        rarity: "epic",
        points: 250,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 5,
            metadata: { mood: "stressed" },
          },
        ],
        isBoxingThemed: true,
      },

      // LEGENDARY - Extreme Challenges (300+ points)
      {
        id: "overwhelmed-warrior",
        name: "Overwhelmed Warrior",
        description:
          "Complete 3 rounds while overwhelmed - incredible strength",
        icon: Icon.Warning,
        rarity: "legendary",
        points: 300,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 3,
            metadata: { mood: "overwhelmed" },
          },
        ],
        isBoxingThemed: true,
      },

      {
        id: "focus-ninja",
        name: "Focus Ninja",
        description: "Complete 100 rounds without interruption - focus ninja",
        icon: Icon.BullsEye,
        rarity: "legendary",
        points: 500,
        category: "special_achievements",
        requirements: [
          {
            type: "sessions_completed",
            value: 100,
            metadata: { uninterrupted: true },
          },
        ],
        isBoxingThemed: true,
      },

      // === MOOD CONTEXT ACHIEVEMENTS (Session-Based Tracking) ===

      // RARE - Basic Context Tracking (100-150 points)
      {
        id: "standalone-tracker",
        name: "Independent Monitor",
        description: "Log 15 standalone moods - self-awareness champion",
        icon: Icon.Heart,
        rarity: "rare",
        points: 100,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_context_entries",
            value: 15,
            metadata: { context: "standalone" },
          },
        ],
        isBoxingThemed: true,
      },
      {
        id: "pre-session-tracker",
        name: "Pre-Fight Analyst",
        description: "Log mood before 20 sessions - strategic preparation",
        icon: Icon.Play,
        rarity: "rare",
        points: 125,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_context_entries",
            value: 20,
            metadata: { context: "pre-session" },
          },
        ],
        isBoxingThemed: true,
      },
      {
        id: "post-session-tracker",
        name: "Post-Fight Reviewer",
        description: "Log mood after 25 sessions - reflective champion",
        icon: Icon.CheckCircle,
        rarity: "rare",
        points: 150,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_context_entries",
            value: 25,
            metadata: { context: "post-session" },
          },
        ],
        isBoxingThemed: true,
      },

      // EPIC - Advanced Context Tracking (175+ points)
      {
        id: "during-session-tracker",
        name: "Mid-Fight Monitor",
        description: "Log mood during 15 active sessions - real-time awareness",
        icon: Icon.Clock,
        rarity: "epic",
        points: 175,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_context_entries",
            value: 15,
            metadata: { context: "during-session" },
          },
        ],
        isBoxingThemed: true,
      },

      // === MOOD PATTERN ACHIEVEMENTS (Advanced Mastery) ===

      // EPIC - Pattern Recognition (200-250 points)
      {
        id: "mood-improvement",
        name: "Emotional Growth Fighter",
        description: "Show mood improvement in 10 sessions - growing stronger",
        icon: Icon.ChevronUp,
        rarity: "epic",
        points: 200,
        category: "mood_mastery",
        requirements: [{ type: "mood_improvement_pattern", value: 10 }],
        isBoxingThemed: true,
      },

      // LEGENDARY - Ultimate Mastery (300+ points)
      {
        id: "mood-awareness",
        name: "Emotional Range Master",
        description: "Log all 9 different mood types - complete awareness",
        icon: Icon.Compass,
        rarity: "legendary",
        points: 350,
        category: "mood_mastery",
        requirements: [{ type: "mood_awareness_diversity", value: 9 }],
        isBoxingThemed: true,
      },
      {
        id: "emotional-resilience",
        name: "Emotional Resilience Champion",
        description: "Complete sessions despite negative moods - true grit",
        icon: Icon.Shield,
        rarity: "legendary",
        points: 400,
        category: "mood_mastery",
        requirements: [
          {
            type: "mood_specific_sessions",
            value: 5,
            metadata: { mood: "stressed" },
          },
          {
            type: "mood_specific_sessions",
            value: 3,
            metadata: { mood: "overwhelmed" },
          },
          {
            type: "mood_specific_sessions",
            value: 7,
            metadata: { mood: "tired" },
          },
        ],
        isBoxingThemed: true,
      },
    ];
  }

  /**
   * Get boxing levels progression system
   */
  public getBoxingLevels(): BoxingLevel[] {
    return [
      {
        level: 1,
        title: "Rookie",
        description: "Just starting your boxing journey",
        minPoints: 0,
        maxPoints: 100,
        icon: Icon.Play,
        color: Color.SecondaryText,
      },
      {
        level: 2,
        title: "Amateur",
        description: "Learning the ropes",
        minPoints: 101,
        maxPoints: 500,
        icon: Icon.Hammer,
        color: Color.Orange,
      },
      {
        level: 3,
        title: "Professional",
        description: "Skilled fighter",
        minPoints: 501,
        maxPoints: 1500,
        icon: Icon.Trophy,
        color: Color.Blue,
      },
      {
        level: 4,
        title: "Champion",
        description: "Elite level fighter",
        minPoints: 1501,
        maxPoints: 3000,
        icon: Icon.Crown,
        color: Color.Purple,
      },
      {
        level: 5,
        title: "Hall of Famer",
        description: "Legendary status achieved",
        minPoints: 3001,
        maxPoints: Infinity,
        icon: Icon.Star,
        color: Color.Yellow,
      },
    ];
  }

  /**
   * Calculate current boxing level based on points
   */
  public calculateBoxingLevel(points: number): BoxingLevel {
    const levels = this.getBoxingLevels();
    return (
      levels.find(
        (level) => points >= level.minPoints && points <= level.maxPoints
      ) || levels[0]
    );
  }

  /**
   * Calculate points needed for next level
   */
  public getPointsToNextLevel(points: number): number {
    const currentLevel = this.calculateBoxingLevel(points);
    const levels = this.getBoxingLevels();
    const nextLevel = levels.find(
      (level) => level.level === currentLevel.level + 1
    );

    if (!nextLevel) return 0; // Already at max level
    return nextLevel.minPoints - points;
  }

  /**
   * Calculate boxing progress from session history and mood entries
   */
  public calculateBoxingProgress(
    history: TimerSession[],
    moodEntries: MoodEntry[] = []
  ): BoxingProgress {
    const completedSessions = history.filter((session) => session.completed);
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate basic stats
    const totalRounds = completedSessions.length;
    const totalTrainingTime = completedSessions.reduce(
      (total, session) => total + session.duration,
      0
    );

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort sessions by start time (newest first)
    const sortedSessions = [...completedSessions].sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Calculate current streak (from most recent session backwards)
    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      const sessionDate = new Date(session.startTime);

      if (i === 0) {
        // First session (most recent)
        currentStreak = 1;
        tempStreak = 1;
      } else {
        const prevSession = sortedSessions[i - 1];
        const prevDate = new Date(prevSession.startTime);
        const daysDiff = Math.floor(
          (prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 1) {
          tempStreak++;
          if (i === 1) currentStreak = tempStreak; // Update current streak only for consecutive recent sessions
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 1;
          if (i === 1) currentStreak = 1; // Reset current streak if there's a gap
        }
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

    // Calculate time-based stats
    const todaysSessions = completedSessions.filter(
      (session) => new Date(session.startTime) >= startOfToday
    );
    const weekSessions = completedSessions.filter(
      (session) => new Date(session.startTime) >= startOfWeek
    );
    const monthSessions = completedSessions.filter(
      (session) => new Date(session.startTime) >= startOfMonth
    );

    // Calculate special achievement stats
    const earlyBirdRounds = completedSessions.filter((session) => {
      const hour = new Date(session.startTime).getHours();
      return hour < 8;
    }).length;

    const nightOwlRounds = completedSessions.filter((session) => {
      const hour = new Date(session.startTime).getHours();
      return hour >= 22;
    }).length;

    const weekendWarriorRounds = completedSessions.filter((session) => {
      const day = new Date(session.startTime).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;

    // Calculate mood tracking streak
    const moodTrackingStreak = this.calculateMoodTrackingStreak(
      completedSessions,
      moodEntries
    );

    // Calculate mood-related statistics
    const moodStats = this.calculateMoodStatistics(
      completedSessions,
      moodEntries
    );

    // Calculate durations
    const durations = completedSessions.map((session) => session.duration);
    const bestRoundDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const averageRoundDuration =
      durations.length > 0
        ? durations.reduce((sum, duration) => sum + duration, 0) /
          durations.length
        : 0;

    return {
      totalRounds,
      currentStreak,
      longestStreak,
      totalTrainingTime,
      championshipLevel: this.calculateBoxingLevel(totalRounds * 10).level, // Simplified calculation
      dailyRoundsToday: todaysSessions.length,
      weeklyRoundsThisWeek: weekSessions.length,
      monthlyRoundsThisMonth: monthSessions.length,
      lastRoundDate:
        sortedSessions.length > 0
          ? new Date(sortedSessions[0].startTime)
          : undefined,
      bestRoundDuration,
      averageRoundDuration,
      moodTrackingStreak,
      earlyBirdRounds,
      nightOwlRounds,
      weekendWarriorRounds,
      // Include mood statistics
      ...moodStats,
    };
  }

  /**
   * Calculate mood tracking streak (consecutive sessions with mood entries)
   */
  private calculateMoodTrackingStreak(
    sessions: TimerSession[],
    moodEntries: MoodEntry[]
  ): number {
    if (sessions.length === 0) return 0;

    // Sort sessions by start time (most recent first)
    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    let streak = 0;
    for (const session of sortedSessions) {
      // Check if this session has any mood entries
      const sessionMoodEntries = moodEntries.filter(
        (entry) => entry.sessionId === session.id
      );

      if (sessionMoodEntries.length > 0) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }

    return streak;
  }

  /**
   * Calculate comprehensive mood statistics for achievements
   */
  private calculateMoodStatistics(
    sessions: TimerSession[],
    moodEntries: MoodEntry[]
  ): {
    totalMoodEntries: number;
    moodEntriesWithNotes: number;
    uniqueIntensityLevelsUsed: number;
    uniqueMoodTypesLogged: number;
    preSessionMoodEntries: number;
    duringSessionMoodEntries: number;
    postSessionMoodEntries: number;
    standaloneMoodEntries: number;
    energizedSessions: number;
    focusedSessions: number;
    calmSessions: number;
    motivatedSessions: number;
    neutralSessions: number;
    tiredSessions: number;
    stressedSessions: number;
    overwhelmedSessions: number;
    distractedSessions: number;
    moodImprovementPatterns: number;
  } {
    // Basic mood entry statistics
    const totalMoodEntries = moodEntries.length;
    const moodEntriesWithNotes = moodEntries.filter(
      (entry) => entry.notes && entry.notes.trim().length > 0
    ).length;

    // Unique intensity levels and mood types
    const uniqueIntensityLevels = new Set(
      moodEntries.map((entry) => entry.intensity)
    );
    const uniqueMoodTypes = new Set(moodEntries.map((entry) => entry.mood));

    // Context-based mood entries
    const preSessionMoodEntries = moodEntries.filter(
      (entry) => entry.context === "pre-session"
    ).length;
    const duringSessionMoodEntries = moodEntries.filter(
      (entry) => entry.context === "during-session"
    ).length;
    const postSessionMoodEntries = moodEntries.filter(
      (entry) => entry.context === "post-session"
    ).length;
    const standaloneMoodEntries = moodEntries.filter(
      (entry) => entry.context === "standalone"
    ).length;

    // Calculate mood-specific session counts
    const moodSessionCounts = this.calculateMoodSpecificSessions(
      sessions,
      moodEntries
    );

    // Calculate mood improvement patterns (simplified)
    const moodImprovementPatterns =
      this.calculateMoodImprovementPatterns(moodEntries);

    return {
      totalMoodEntries,
      moodEntriesWithNotes,
      uniqueIntensityLevelsUsed: uniqueIntensityLevels.size,
      uniqueMoodTypesLogged: uniqueMoodTypes.size,
      preSessionMoodEntries,
      duringSessionMoodEntries,
      postSessionMoodEntries,
      standaloneMoodEntries,
      ...moodSessionCounts,
      moodImprovementPatterns,
    };
  }

  /**
   * Calculate mood-specific session counts
   */
  private calculateMoodSpecificSessions(
    sessions: TimerSession[],
    moodEntries: MoodEntry[]
  ): {
    energizedSessions: number;
    focusedSessions: number;
    calmSessions: number;
    motivatedSessions: number;
    neutralSessions: number;
    tiredSessions: number;
    stressedSessions: number;
    overwhelmedSessions: number;
    distractedSessions: number;
  } {
    const moodCounts = {
      energizedSessions: 0,
      focusedSessions: 0,
      calmSessions: 0,
      motivatedSessions: 0,
      neutralSessions: 0,
      tiredSessions: 0,
      stressedSessions: 0,
      overwhelmedSessions: 0,
      distractedSessions: 0,
    };

    // Count sessions based on pre-session mood entries
    for (const session of sessions) {
      const preSessionMood = moodEntries.find(
        (entry) =>
          entry.sessionId === session.id && entry.context === "pre-session"
      );

      if (preSessionMood) {
        switch (preSessionMood.mood) {
          case "energized":
            moodCounts.energizedSessions++;
            break;
          case "focused":
            moodCounts.focusedSessions++;
            break;
          case "calm":
            moodCounts.calmSessions++;
            break;
          case "motivated":
            moodCounts.motivatedSessions++;
            break;
          case "neutral":
            moodCounts.neutralSessions++;
            break;
          case "tired":
            moodCounts.tiredSessions++;
            break;
          case "stressed":
            moodCounts.stressedSessions++;
            break;
          case "overwhelmed":
            moodCounts.overwhelmedSessions++;
            break;
          case "distracted":
            moodCounts.distractedSessions++;
            break;
        }
      }
    }

    return moodCounts;
  }

  /**
   * Calculate mood improvement patterns (simplified implementation)
   */
  private calculateMoodImprovementPatterns(moodEntries: MoodEntry[]): number {
    // Simple implementation: count instances where post-session mood is better than pre-session mood
    let improvementCount = 0;

    // Group mood entries by session
    const sessionMoods = new Map<string, MoodEntry[]>();
    for (const entry of moodEntries) {
      if (entry.sessionId) {
        if (!sessionMoods.has(entry.sessionId)) {
          sessionMoods.set(entry.sessionId, []);
        }
        sessionMoods.get(entry.sessionId)!.push(entry);
      }
    }

    // Check for improvement patterns
    for (const [, entries] of sessionMoods) {
      const preSession = entries.find((e) => e.context === "pre-session");
      const postSession = entries.find((e) => e.context === "post-session");

      if (preSession && postSession) {
        // Simple improvement check: higher intensity or better mood
        const moodImprovement = this.isMoodImprovement(
          preSession.mood,
          postSession.mood
        );
        const intensityImprovement =
          postSession.intensity > preSession.intensity;

        if (moodImprovement || intensityImprovement) {
          improvementCount++;
        }
      }
    }

    return improvementCount;
  }

  /**
   * Check if second mood is an improvement over first mood
   */
  private isMoodImprovement(fromMood: string, toMood: string): boolean {
    const moodRanking = {
      overwhelmed: 1,
      stressed: 2,
      distracted: 3,
      tired: 4,
      neutral: 5,
      calm: 6,
      focused: 7,
      motivated: 8,
      energized: 9,
    };

    return (
      (moodRanking[toMood as keyof typeof moodRanking] || 5) >
      (moodRanking[fromMood as keyof typeof moodRanking] || 5)
    );
  }

  /**
   * Check which achievements should be unlocked based on current progress
   */
  public checkAchievements(
    history: TimerSession[],
    currentAchievements: Achievement[],
    boxingProgress: BoxingProgress
  ): Achievement[] {
    const allAchievements = this.getBoxingAchievements();
    const unlockedIds = currentAchievements.map((a) => a.id);
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      let shouldUnlock = true;

      for (const requirement of achievement.requirements) {
        if (!this.checkRequirement(requirement, boxingProgress, history)) {
          shouldUnlock = false;
          break;
        }
      }

      if (shouldUnlock) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date(),
        });
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if a specific requirement is met
   */
  private checkRequirement(
    requirement: AchievementRequirement,
    progress: BoxingProgress,
    history: TimerSession[]
  ): boolean {
    switch (requirement.type) {
      case "sessions_completed":
        if (requirement.timeframe === "daily") {
          return progress.dailyRoundsToday >= requirement.value;
        } else if (requirement.timeframe === "weekly") {
          return progress.weeklyRoundsThisWeek >= requirement.value;
        } else if (requirement.timeframe === "monthly") {
          return progress.monthlyRoundsThisMonth >= requirement.value;
        }
        return progress.totalRounds >= requirement.value;

      case "streak_length":
        return progress.currentStreak >= requirement.value;

      case "total_time":
        return progress.totalTrainingTime >= requirement.value;

      case "daily_goal":
        return progress.dailyRoundsToday >= requirement.value;

      case "session_duration":
        return progress.bestRoundDuration >= requirement.value;

      case "mood_tracking":
        return progress.moodTrackingStreak >= requirement.value;

      // New mood-related achievement types
      case "mood_entries_total":
        return progress.totalMoodEntries >= requirement.value;

      case "mood_tracking_streak":
        return progress.moodTrackingStreak >= requirement.value;

      case "mood_entries_with_notes":
        return progress.moodEntriesWithNotes >= requirement.value;

      case "mood_intensity_range":
        return progress.uniqueIntensityLevelsUsed >= requirement.value;

      case "mood_context_entries":
        // Handle specific context requirements via metadata
        if (requirement.metadata?.context === "pre-session") {
          return progress.preSessionMoodEntries >= requirement.value;
        } else if (requirement.metadata?.context === "during-session") {
          return progress.duringSessionMoodEntries >= requirement.value;
        } else if (requirement.metadata?.context === "post-session") {
          return progress.postSessionMoodEntries >= requirement.value;
        } else if (requirement.metadata?.context === "standalone") {
          return progress.standaloneMoodEntries >= requirement.value;
        }
        return false;

      case "mood_specific_sessions":
        // Handle specific mood requirements via metadata
        if (requirement.metadata?.mood === "energized") {
          return progress.energizedSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "focused") {
          return progress.focusedSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "calm") {
          return progress.calmSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "motivated") {
          return progress.motivatedSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "neutral") {
          return progress.neutralSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "tired") {
          return progress.tiredSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "stressed") {
          return progress.stressedSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "overwhelmed") {
          return progress.overwhelmedSessions >= requirement.value;
        } else if (requirement.metadata?.mood === "distracted") {
          return progress.distractedSessions >= requirement.value;
        }
        return false;

      case "mood_improvement_pattern":
        return progress.moodImprovementPatterns >= requirement.value;

      case "mood_awareness_diversity":
        return progress.uniqueMoodTypesLogged >= requirement.value;

      case "time_of_day":
        if (requirement.metadata?.before) {
          return (
            progress.earlyBirdRounds >= (requirement.metadata.sessions || 10)
          );
        } else if (requirement.metadata?.after) {
          return (
            progress.nightOwlRounds >= (requirement.metadata.sessions || 10)
          );
        }
        return false;

      case "weekend_sessions":
        return progress.weekendWarriorRounds >= requirement.value;

      case "consecutive_days":
        // This would need more sophisticated calculation based on session dates
        // Simplified for now
        return progress.currentStreak >= requirement.value;

      default:
        return false;
    }
  }
}

// Export singleton instance
export const boxingAchievementService = new BoxingAchievementService();
