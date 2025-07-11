import { Icon, Color } from "@raycast/api";

/**
 * Design tokens for consistent styling across the Raycast Pomodoro extension.
 *
 * This module provides a centralized system of design tokens that ensure visual
 * consistency and adherence to Raycast's native design patterns and guidelines.
 * All UI components should use these tokens instead of hardcoded values.
 *
 * Features:
 * - Consistent iconography across all components
 * - Semantic color usage following Raycast patterns
 * - Standardized keyboard shortcuts
 * - Helper functions for dynamic styling
 * - Type-safe design token access
 *
 * @example
 * ```typescript
 * import { ACTION_ICONS, SESSION_COLORS, SHORTCUTS } from './design-tokens';
 *
 * // Use consistent icons
 * <Action icon={ACTION_ICONS.PLAY} />
 *
 * // Use semantic colors
 * <Icon tintColor={SESSION_COLORS.COMPLETED} />
 *
 * // Use standardized shortcuts
 * <Action shortcut={SHORTCUTS.PRIMARY_ACTION} />
 * ```
 */

// Session Type Icons - Consistent iconography for different session types
export const SESSION_ICONS = {
  WORK: Icon.Hammer,
  SHORT_BREAK: Icon.Pause,
  LONG_BREAK: Icon.Mug, // Using Mug instead of Coffee
  COMPLETED: Icon.CheckCircle,
  INCOMPLETE: Icon.XMarkCircle,
  PAUSED: Icon.Pause,
  RUNNING: Icon.Play,
  IDLE: Icon.Clock,
} as const;

// Application Tracking Icons
export const APP_TRACKING_ICONS = {
  DESKTOP: Icon.Desktop,
  LIVE_TRACKING: Icon.Dot,
  ANALYTICS: Icon.BarChart,
  TROPHY: Icon.Trophy,
  STAR: Icon.Star,
  TARGET: Icon.BullsEye, // Using BullsEye instead of Target
  HEALTH_CHECK: Icon.ExclamationMark,
} as const;

// Mood Tracking Icons - Native Raycast icons for different mood states
export const MOOD_ICONS = {
  ENERGIZED: Icon.Bolt,
  FOCUSED: Icon.BullsEye,
  CALM: Icon.Cloud,
  MOTIVATED: Icon.Rocket,
  NEUTRAL: Icon.Circle,
  TIRED: Icon.Battery,
  STRESSED: Icon.ExclamationMark,
  OVERWHELMED: Icon.Warning,
  DISTRACTED: Icon.QuestionMark,
  // Context icons
  PRE_SESSION: Icon.Play,
  DURING_SESSION: Icon.Clock,
  POST_SESSION: Icon.CheckCircle,
  STANDALONE: Icon.Heart,
} as const;

// Action Icons - Consistent icons for common actions
export const ACTION_ICONS = {
  PLAY: Icon.Play,
  PAUSE: Icon.Pause,
  STOP: Icon.Stop,
  RESET: Icon.ArrowClockwise,
  SKIP: Icon.Forward,
  COMPLETE: Icon.CheckCircle,
  VIEW_DETAILS: Icon.Eye,
  BACK: Icon.ArrowLeft,
  COPY: Icon.Clipboard,
  SETTINGS: Icon.Gear,
  SAVE: Icon.SaveDocument,
} as const;

// Status Colors - Semantic color usage
export const STATUS_COLORS = {
  SUCCESS: Color.Green,
  WARNING: Color.Orange,
  ERROR: Color.Red,
  INFO: Color.Blue,
  NEUTRAL: Color.SecondaryText,
  PRIMARY: Color.PrimaryText,
  ACCENT: Color.Purple,
} as const;

// Session State Indicator Colors - Colored dots for different session states
export const SESSION_STATE_COLORS = {
  ACTIVE: Color.Green,
  COMPLETED: Color.Green,
  PAUSED: Color.Orange,
  STOPPED: Color.Red,
  SKIPPED: Color.Orange,
  INCOMPLETE: Color.Red,
  IDLE: Color.SecondaryText,
  WORK: Color.Green,
  SHORT_BREAK: Color.Blue,
  LONG_BREAK: Color.Purple,
} as const;

// Session State Colors
export const SESSION_COLORS = {
  WORK: Color.Green,
  BREAK: Color.Blue,
  COMPLETED: Color.Green,
  INCOMPLETE: Color.Red,
  PAUSED: Color.Orange,
  RUNNING: Color.Green,
  IDLE: Color.SecondaryText,
} as const;

// Application Tracking Colors
export const TRACKING_COLORS = {
  LIVE: Color.Green,
  TOP_APP: Color.Green,
  SECOND_APP: Color.Blue,
  THIRD_APP: Color.Orange,
  OTHER_APPS: Color.SecondaryText,
  TROPHY: Color.Yellow,
  FOCUS_GOOD: Color.Green,
  FOCUS_MODERATE: Color.Orange,
  FOCUS_POOR: Color.Red,
} as const;

// Mood Tracking Colors - Semantic colors for different mood states
export const MOOD_COLORS = {
  // Positive moods
  ENERGIZED: Color.Yellow,
  FOCUSED: Color.Green,
  CALM: Color.Blue,
  MOTIVATED: Color.Purple,
  // Neutral mood
  NEUTRAL: Color.SecondaryText,
  // Challenging moods
  TIRED: Color.Orange,
  STRESSED: Color.Red,
  OVERWHELMED: Color.Red,
  DISTRACTED: Color.Orange,
  // Intensity levels
  INTENSITY_1: Color.SecondaryText,
  INTENSITY_2: Color.Orange,
  INTENSITY_3: Color.Blue,
  INTENSITY_4: Color.Green,
  INTENSITY_5: Color.Purple,
} as const;

// Typography and Spacing - Removed emoji usage in favor of native Raycast icons
export const TYPOGRAPHY = {
  // Legacy emoji constants removed - use SESSION_ICONS, ACTION_ICONS, and APP_TRACKING_ICONS instead
} as const;

// Common text patterns
export const TEXT_PATTERNS = {
  LIVE_INDICATOR: "Live",
  TRACKING_ACTIVE: "Tracking Active",
  TRACKING_INACTIVE: "Tracking Inactive",
  NO_DATA: "No data available",
  ENABLE_TRACKING: "Enable tracking in preferences",
} as const;

// Keyboard shortcuts - Intuitive and non-conflicting patterns
export const SHORTCUTS = {
  // Primary actions - simple and intuitive
  PRIMARY_ACTION: { modifiers: ["cmd" as const], key: "return" as const },
  SECONDARY_ACTION: { modifiers: ["cmd" as const], key: "j" as const }, // Quick start

  // Timer controls - using space for pause (common pattern)
  PAUSE_RESUME: { modifiers: ["cmd" as const], key: "space" as const },
  STOP: { modifiers: ["cmd" as const], key: "." as const },
  RESET: { modifiers: ["cmd" as const], key: "r" as const },

  // Navigation - using arrow keys for intuitive navigation
  BACK: { modifiers: ["cmd" as const], key: "arrowLeft" as const },

  // Data actions
  COPY: { modifiers: ["cmd" as const], key: "c" as const },

  // Views - using Ctrl+Shift for secondary views to avoid conflicts
  STATISTICS: {
    modifiers: ["ctrl" as const, "shift" as const],
    key: "s" as const,
  },
  ANALYTICS: {
    modifiers: ["ctrl" as const, "shift" as const],
    key: "a" as const,
  },

  // Break controls - intuitive B for break
  BREAK_SHORT: { modifiers: ["cmd" as const], key: "b" as const },
  BREAK_LONG: {
    modifiers: ["cmd" as const, "shift" as const],
    key: "b" as const,
  },
};

/**
 * Helper functions for consistent styling and dynamic design token selection.
 * These functions provide intelligent defaults and context-aware styling.
 */

/**
 * Get the appropriate icon for a session based on type and completion status.
 *
 * @param sessionType - The type of session ('work', 'short_break', 'long_break')
 * @param isCompleted - Optional completion status override
 * @returns Appropriate Raycast Icon for the session
 *
 * @example
 * ```typescript
 * const workIcon = getSessionIcon('work'); // Returns hammer icon
 * const completedIcon = getSessionIcon('work', true); // Returns checkmark icon
 * const incompleteIcon = getSessionIcon('work', false); // Returns X icon
 * ```
 */
export const getSessionIcon = (sessionType: string, isCompleted?: boolean) => {
  if (isCompleted === false) return SESSION_ICONS.INCOMPLETE;
  if (isCompleted === true) return SESSION_ICONS.COMPLETED;

  switch (sessionType.toLowerCase()) {
    case "work":
      return SESSION_ICONS.WORK;
    case "short_break":
      return SESSION_ICONS.SHORT_BREAK;
    case "long_break":
      return SESSION_ICONS.LONG_BREAK;
    default:
      return SESSION_ICONS.IDLE;
  }
};

export const getSessionColor = (sessionType: string, isCompleted?: boolean) => {
  if (isCompleted === false) return SESSION_COLORS.INCOMPLETE;
  if (isCompleted === true) return SESSION_COLORS.COMPLETED;

  switch (sessionType.toLowerCase()) {
    case "work":
      return SESSION_COLORS.WORK;
    case "short_break":
    case "long_break":
      return SESSION_COLORS.BREAK;
    default:
      return SESSION_COLORS.IDLE;
  }
};

export const getAppRankingColor = (index: number) => {
  switch (index) {
    case 0:
      return TRACKING_COLORS.TOP_APP;
    case 1:
      return TRACKING_COLORS.SECOND_APP;
    case 2:
      return TRACKING_COLORS.THIRD_APP;
    default:
      return TRACKING_COLORS.OTHER_APPS;
  }
};

export const getFocusQualityColor = (focusScore: number) => {
  if (focusScore >= 70) return TRACKING_COLORS.FOCUS_GOOD;
  if (focusScore >= 40) return TRACKING_COLORS.FOCUS_MODERATE;
  return TRACKING_COLORS.FOCUS_POOR;
};

export const getFocusQualityText = (focusScore: number) => {
  if (focusScore >= 70) return "Excellent";
  if (focusScore >= 40) return "Good";
  return "Needs Improvement";
};

/**
 * Get a colored dot indicator for session state visualization.
 *
 * @param sessionType - The type of session ('work', 'short_break', 'long_break')
 * @param isCompleted - Whether the session was completed
 * @param isActive - Whether the session is currently active
 * @param isPaused - Whether the session is currently paused
 * @param endReason - How the session ended (completed, stopped, skipped)
 * @returns Object with icon and color for the indicator dot
 *
 * @example
 * ```typescript
 * const activeDot = getSessionStateDot('work', false, true, false); // Green dot for active work
 * const completedDot = getSessionStateDot('work', true, false, false, 'completed'); // Green dot for completed
 * const stoppedDot = getSessionStateDot('work', false, false, false, 'stopped'); // Red dot for stopped
 * const skippedDot = getSessionStateDot('work', false, false, false, 'skipped'); // Orange dot for skipped
 * ```
 */
export const getSessionStateDot = (
  sessionType: string,
  isCompleted: boolean,
  isActive: boolean = false,
  isPaused: boolean = false,
  endReason?: string
) => {
  let color: Color;

  if (isActive && !isPaused) {
    color = SESSION_STATE_COLORS.ACTIVE;
  } else if (isPaused) {
    color = SESSION_STATE_COLORS.PAUSED;
  } else if (isCompleted) {
    color = SESSION_STATE_COLORS.COMPLETED;
  } else if (!isCompleted) {
    // Use end reason to determine specific color for incomplete sessions
    switch (endReason) {
      case "stopped":
        color = SESSION_STATE_COLORS.STOPPED;
        break;
      case "skipped":
        color = SESSION_STATE_COLORS.SKIPPED;
        break;
      default:
        color = SESSION_STATE_COLORS.INCOMPLETE;
    }
  } else {
    // Default to session type color
    switch (sessionType) {
      case "work":
        color = SESSION_STATE_COLORS.WORK;
        break;
      case "short_break":
        color = SESSION_STATE_COLORS.SHORT_BREAK;
        break;
      case "long_break":
        color = SESSION_STATE_COLORS.LONG_BREAK;
        break;
      default:
        color = SESSION_STATE_COLORS.IDLE;
    }
  }

  return {
    icon: Icon.Circle,
    tintColor: color,
  };
};

/**
 * Get the appropriate icon for a mood type.
 *
 * @param mood - The mood type
 * @returns Appropriate Raycast Icon for the mood
 *
 * @example
 * ```typescript
 * const energizedIcon = getMoodIcon('energized'); // Returns bolt icon
 * const calmIcon = getMoodIcon('calm'); // Returns cloud icon
 * ```
 */
export const getMoodIcon = (mood: string) => {
  switch (mood.toLowerCase()) {
    case "energized":
      return MOOD_ICONS.ENERGIZED;
    case "focused":
      return MOOD_ICONS.FOCUSED;
    case "calm":
      return MOOD_ICONS.CALM;
    case "motivated":
      return MOOD_ICONS.MOTIVATED;
    case "neutral":
      return MOOD_ICONS.NEUTRAL;
    case "tired":
      return MOOD_ICONS.TIRED;
    case "stressed":
      return MOOD_ICONS.STRESSED;
    case "overwhelmed":
      return MOOD_ICONS.OVERWHELMED;
    case "distracted":
      return MOOD_ICONS.DISTRACTED;
    default:
      return MOOD_ICONS.NEUTRAL;
  }
};

/**
 * Get the appropriate color for a mood type.
 *
 * @param mood - The mood type
 * @returns Appropriate color for the mood
 */
export const getMoodColor = (mood: string) => {
  switch (mood.toLowerCase()) {
    case "energized":
      return MOOD_COLORS.ENERGIZED;
    case "focused":
      return MOOD_COLORS.FOCUSED;
    case "calm":
      return MOOD_COLORS.CALM;
    case "motivated":
      return MOOD_COLORS.MOTIVATED;
    case "neutral":
      return MOOD_COLORS.NEUTRAL;
    case "tired":
      return MOOD_COLORS.TIRED;
    case "stressed":
      return MOOD_COLORS.STRESSED;
    case "overwhelmed":
      return MOOD_COLORS.OVERWHELMED;
    case "distracted":
      return MOOD_COLORS.DISTRACTED;
    default:
      return MOOD_COLORS.NEUTRAL;
  }
};

/**
 * Get the appropriate color for mood intensity level.
 *
 * @param intensity - The intensity level (1-5)
 * @returns Appropriate color for the intensity
 */
export const getMoodIntensityColor = (intensity: 1 | 2 | 3 | 4 | 5) => {
  switch (intensity) {
    case 1:
      return MOOD_COLORS.INTENSITY_1;
    case 2:
      return MOOD_COLORS.INTENSITY_2;
    case 3:
      return MOOD_COLORS.INTENSITY_3;
    case 4:
      return MOOD_COLORS.INTENSITY_4;
    case 5:
      return MOOD_COLORS.INTENSITY_5;
    default:
      return MOOD_COLORS.INTENSITY_3;
  }
};

/**
 * Get the appropriate icon for mood context.
 *
 * @param context - The mood context
 * @returns Appropriate Raycast Icon for the context
 */
export const getMoodContextIcon = (context: string) => {
  switch (context) {
    case "pre-session":
      return MOOD_ICONS.PRE_SESSION;
    case "during-session":
      return MOOD_ICONS.DURING_SESSION;
    case "post-session":
      return MOOD_ICONS.POST_SESSION;
    case "standalone":
      return MOOD_ICONS.STANDALONE;
    default:
      return MOOD_ICONS.STANDALONE;
  }
};
