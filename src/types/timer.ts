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
    | "other";
  isRecognized?: boolean; // Whether the app was recognized in our mapping
}

export enum SessionEndReason {
  COMPLETED = "completed",
  STOPPED = "stopped",
  SKIPPED = "skipped",
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
  applicationUsage?: ApplicationUsage[]; // Track app usage during session
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
  updateConfig: (config: Partial<TimerConfig>) => void;
  addTaskToSession: (
    taskName: string,
    projectName?: string,
    tags?: string[]
  ) => void;
  getNextSessionType: () => SessionType;
  deleteSession: (sessionId: string) => void;
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
}

export type PomodoroStore = PomodoroState & TimerActions;
