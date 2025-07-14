export enum TimerState {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
}

export enum SessionType {
  WORK = "work",
  SHORT_BREAK = "short_break",
  LONG_BREAK = "long_break",
}

export interface ApplicationUsage {
  bundleId: string;
  name: string;
  timeSpent: number; // in seconds
  percentage: number;
  icon?: string; // Legacy field for compatibility
  raycastIcon?: import("@raycast/api").Icon; // Native Raycast icon
  category?:
    | "development"
    | "browser"
    | "communication"
    | "design"
    | "productivity"
    | "media"
    | "system"
    | "gaming"
    | "finance"
    | "education"
    | "other";
  isRecognized?: boolean; // Whether the app was recognized in our mapping
  firstUsed?: Date; // When the app was first used in the session
  lastUsed?: Date; // When the app was last used in the session
}

export enum SessionEndReason {
  COMPLETED = "completed",
  STOPPED = "stopped",
  SKIPPED = "skipped",
}

// Mood tracking types
export type MoodType =
  | "energized"
  | "focused"
  | "calm"
  | "motivated"
  | "neutral"
  | "tired"
  | "stressed"
  | "overwhelmed"
  | "distracted";

export interface MoodEntry {
  id: string;
  mood: MoodType;
  intensity: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  timestamp: Date;
  sessionId?: string; // Optional link to a timer session
  notes?: string; // Optional user notes
  context: "pre-session" | "during-session" | "post-session" | "standalone";
}

export interface MoodAnalytics {
  totalEntries: number;
  averageIntensity: number;
  mostCommonMood: MoodType;
  moodDistribution: Record<MoodType, number>;
  weeklyTrend: {
    date: string;
    averageMood: number;
    entryCount: number;
  }[];
  correlationWithProductivity: {
    mood: MoodType;
    averageSessionCompletion: number;
    averageFocusQuality: number;
  }[];
  bestPerformanceMoods: MoodType[];
  improvementSuggestions: string[];
}

export interface TimerSession {
  id: string;
  type: SessionType;
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  endReason?: SessionEndReason; // How the session ended
  taskName?: string;
  projectName?: string;
  tags?: string[]; // Task tags for categorization
  taskIcon?: import("@raycast/api").Icon; // Custom icon for the task
  notes?: string; // User notes/reflections about the session
  applicationUsage?: ApplicationUsage[]; // Track app usage during session
  // ADHD-specific fields
  energyLevel?: 1 | 2 | 3 | 4 | 5; // User-reported energy at start
  focusQuality?: 1 | 2 | 3 | 4 | 5; // Auto-calculated or user-reported
  moodState?: "motivated" | "neutral" | "struggling" | "hyperfocus";
  adaptiveAdjustments?: {
    originalDuration: number;
    adjustedDuration: number;
    reason: string;
  };
  rewardPoints?: number; // Points earned for this session
}

export interface TimerConfig {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of work sessions before long break
  enableNotifications: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  enableApplicationTracking: boolean; // Track application usage during work sessions
  trackingInterval: number; // Polling interval in seconds (default: 5)
  // ADHD-friendly features
  enableAdaptiveTimers: boolean;
  adaptiveMode: "energy-based" | "focus-based" | "mood-based";
  minWorkDuration: number; // 10-60 minutes
  maxWorkDuration: number; // 15-90 minutes
  adaptiveBreakRatio: number; // 0.1-0.3 (break = work * ratio)
  enableRewardSystem: boolean;
  enableTransitionWarnings: boolean;
  warningIntervals: number[]; // [300, 120, 60] = 5min, 2min, 1min warnings
  enableHyperfocusDetection: boolean;
  maxConsecutiveSessions: number; // Default: 3
  forcedBreakAfterHours: number; // Default: 2.5
}

export interface TimerStats {
  totalSessions: number;
  completedSessions: number;
  totalWorkTime: number; // in seconds
  totalBreakTime: number; // in seconds
  streakCount: number;
  todaysSessions: number;
  weekSessions: number;
  monthSessions: number;
}

export interface CustomTagConfig {
  name: string;
  color: import("@raycast/api").Color;
  icon?: import("@raycast/api").Icon;
}

// ADHD-specific interfaces
export interface RewardSystem {
  points: number;
  level: number;
  streakMultiplier: number;
  achievements: Achievement[];
  dailyGoal: number;
  weeklyChallenge?: Challenge;
  lastRewardDate?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: import("@raycast/api").Icon;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  category: AchievementCategory;
  requirements: AchievementRequirement[];
  progress?: number;
  maxProgress?: number;
  isBoxingThemed?: boolean; // Flag for boxing-themed achievements
}

export type AchievementCategory =
  | "training_milestones" // Basic completion achievements
  | "knockout_streaks" // Consistency streaks
  | "championship_belts" // Major time-based milestones
  | "daily_training" // Daily goal achievements
  | "endurance_challenges" // Long session achievements
  | "consistency_championships" // Weekly/monthly consistency
  | "special_achievements" // Unique/special accomplishments
  | "mood_mastery" // Mood tracking related
  | "legacy"; // Old achievements (for backward compatibility)

export interface AchievementRequirement {
  type: AchievementRequirementType;
  value: number;
  timeframe?: "daily" | "weekly" | "monthly" | "all_time";
  metadata?: Record<string, any>; // Additional requirement data
}

export type AchievementRequirementType =
  | "sessions_completed" // Total sessions completed
  | "streak_length" // Consecutive sessions
  | "total_time" // Total focus time in minutes
  | "daily_goal" // Sessions in a single day
  | "session_duration" // Single session duration
  | "mood_tracking" // Mood entries tracked
  | "time_of_day" // Sessions at specific times
  | "weekend_sessions" // Sessions on weekends
  | "consecutive_days" // Days with at least one session
  | "tag_usage" // Using custom tags
  | "session_notes"; // Adding notes to sessions

export interface Challenge {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  expiresAt: Date;
  type: "daily" | "weekly" | "monthly";
}

// Boxing-themed achievement progress tracking
export interface BoxingProgress {
  totalRounds: number; // Total completed focus sessions
  currentStreak: number; // Current consecutive sessions
  longestStreak: number; // Best streak ever
  totalTrainingTime: number; // Total focus time in minutes
  championshipLevel: number; // Current championship level (1-5)
  dailyRoundsToday: number; // Rounds completed today
  weeklyRoundsThisWeek: number; // Rounds completed this week
  monthlyRoundsThisMonth: number; // Rounds completed this month
  lastRoundDate?: Date; // When the last round was completed
  bestRoundDuration: number; // Longest single session in minutes
  averageRoundDuration: number; // Average session duration
  moodTrackingStreak: number; // Consecutive sessions with mood tracking
  earlyBirdRounds: number; // Rounds completed before 8 AM
  nightOwlRounds: number; // Rounds completed after 10 PM
  weekendWarriorRounds: number; // Rounds completed on weekends
}

// Achievement notification data
export interface AchievementNotification {
  achievement: Achievement;
  isNewUnlock: boolean;
  progressUpdate?: {
    current: number;
    max: number;
    percentage: number;
  };
  celebrationLevel: "minimal" | "standard" | "enthusiastic";
}

// Boxing-themed level system
export interface BoxingLevel {
  level: number;
  title: string;
  description: string;
  minPoints: number;
  maxPoints: number;
  icon: import("@raycast/api").Icon;
  color: import("@raycast/api").Color;
}

// Achievement statistics for analytics
export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  commonAchievements: number;
  rareAchievements: number;
  epicAchievements: number;
  legendaryAchievements: number;
  totalPoints: number;
  currentLevel: BoxingLevel;
  nextLevel?: BoxingLevel;
  pointsToNextLevel: number;
  completionPercentage: number;
}

export interface HyperfocusDetection {
  isHyperfocusDetected: boolean;
  consecutiveSessions: number;
  totalFocusTime: number;
  appSwitchFrequency: number;
  lastBreakTime?: Date;
  warningShown: boolean;
}

export interface BreakActivity {
  id: string;
  name: string;
  duration: number; // in seconds
  type: "movement" | "mindfulness" | "sensory" | "cognitive";
  instructions: string[];
  icon: import("@raycast/api").Icon;
  adhdBenefit: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface PomodoroState {
  currentSession: TimerSession | null;
  state: TimerState;
  timeRemaining: number; // in seconds
  sessionCount: number;
  config: TimerConfig;
  stats: TimerStats;
  history: TimerSession[];
  customTags: string[]; // User-created custom tags (legacy - for backward compatibility)
  customTagConfigs: CustomTagConfig[]; // Enhanced tag configurations
  hasCreatedCustomTag: boolean; // Whether user has created their first custom tag
  // Focus period tracking
  currentFocusPeriodId: string | null; // Unique ID for the current focus period
  currentFocusPeriodSessionCount: number; // Sessions completed in current focus period
  targetRounds: number; // Target sessions for current focus period
  // ADHD-specific state
  rewardSystem: RewardSystem;
  // Boxing-themed progress tracking
  boxingProgress: BoxingProgress;
  hyperfocusDetection: HyperfocusDetection;
  breakActivities: BreakActivity[];
  currentBreakActivity?: BreakActivity;
  // Mood tracking state
  moodEntries: MoodEntry[];
  // Post-session mood logging state
  isPostSessionMoodPromptVisible: boolean;
  lastCompletedSession: TimerSession | null;
}

export interface TimerActions {
  startTimer: (
    type: SessionType,
    taskName?: string,
    projectName?: string,
    tags?: string[],
    taskIcon?: import("@raycast/api").Icon
  ) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  completeSession: () => void;

  addTaskToSession: (
    taskName: string,
    projectName?: string,
    tags?: string[]
  ) => void;
  getNextSessionType: () => SessionType;
  deleteSession: (sessionId: string) => void;
  // Historical session editing methods
  updateSessionIcon: (
    sessionId: string,
    taskIcon?: import("@raycast/api").Icon
  ) => void;
  updateSessionNotes: (sessionId: string, notes?: string) => void;
  updateSessionName: (sessionId: string, taskName?: string) => void;
  addCustomTag: (tag: string) => void;
  getCustomTags: () => string[];
  markCustomTagCreated: () => void;
  updateTagConfig: (tagName: string, config: Partial<CustomTagConfig>) => void;
  deleteCustomTag: (tagName: string) => void;
  getTagConfig: (tagName: string) => CustomTagConfig | undefined;
  clearAllTags: () => void;
  clearAllHistory: () => void;
  // Real-time session update methods
  updateCurrentSessionName: (taskName: string) => void;
  updateCurrentSessionIcon: (taskIcon: import("@raycast/api").Icon) => void;
  addTagToCurrentSession: (tag: string) => void;
  removeTagFromCurrentSession: (tag: string) => void;
  // Focus period management
  startNewFocusPeriod: (targetRounds: number) => void;
  resetFocusPeriod: () => void;
  // ADHD-specific actions
  updateSessionEnergyLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
  updateSessionMoodState: (
    mood: "motivated" | "neutral" | "struggling" | "hyperfocus"
  ) => void;
  awardPoints: (points: number, reason: string) => void;
  unlockAchievement: (achievementId: string) => void;
  adaptSessionDuration: (newDuration: number, reason: string) => void;
  selectBreakActivity: (activityId: string) => void;
  completeBreakActivity: (rating?: 1 | 2 | 3 | 4 | 5) => void;
  checkHyperfocus: () => void;
  resetHyperfocusWarning: () => void;
  // Mood tracking actions
  addMoodEntry: (
    mood: MoodType,
    intensity: 1 | 2 | 3 | 4 | 5,
    context: "pre-session" | "during-session" | "post-session" | "standalone",
    sessionId?: string,
    notes?: string
  ) => void;
  deleteMoodEntry: (entryId: string) => void;
  updateMoodEntry: (
    entryId: string,
    updates: Partial<Omit<MoodEntry, "id" | "timestamp">>
  ) => void;
  getMoodEntries: () => MoodEntry[];
  getMoodAnalytics: () => MoodAnalytics;
  // Post-session mood logging actions
  showPostSessionMoodPrompt: (session: TimerSession) => void;
  hidePostSessionMoodPrompt: () => void;
}

export type PomodoroStore = PomodoroState & TimerActions;
