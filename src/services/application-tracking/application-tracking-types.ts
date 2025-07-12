import { Application } from "@raycast/api";
import { ApplicationUsage } from "../../types/timer";

/**
 * Interface for tracking application usage data during Pomodoro sessions
 */
export interface ApplicationTrackingData {
  /** Map of application bundle IDs to usage statistics */
  applications: Map<string, ApplicationUsage>;
  /** Currently active application */
  currentApplication: Application | null;
  /** Timestamp of last tracking update */
  lastUpdateTime: number;
  /** Total time tracked in seconds */
  totalTrackingTime: number;
  /** Session start timestamp */
  sessionStartTime: number;
  /** Number of tracking errors encountered */
  errorCount: number;
  /** Last error message if any */
  lastError?: string;
}

/**
 * Interface for comprehensive tracking statistics
 */
export interface ApplicationTrackingStats {
  /** Total number of applications tracked */
  totalApplications: number;
  /** Application with the most usage time */
  mostUsedApplication: ApplicationUsage | null;
  /** Application with the least usage time */
  leastUsedApplication: ApplicationUsage | null;
  /** Average time spent per application */
  averageTimePerApp: number;
  /** Total session duration in seconds */
  sessionDuration: number;
  /** Percentage of time successfully tracked (0-100) */
  trackingAccuracy: number;
}

/**
 * Interface for tracking health status
 */
export interface TrackingHealth {
  /** Whether tracking is functioning properly */
  isHealthy: boolean;
  /** Number of errors encountered */
  errorCount: number;
  /** Last error message if any */
  lastError?: string;
  /** Percentage of successful tracking attempts */
  successRate: number;
  /** Uptime in milliseconds */
  uptime: number;
}

/**
 * Interface for productivity insights
 */
export interface ProductivityInsights {
  /** Focus score from 0-100 */
  focusScore: number;
  /** Applications that may be distracting */
  distractionApps: ApplicationUsage[];
  /** Applications that are productive */
  productiveApps: ApplicationUsage[];
  /** Recommendations for improving focus */
  recommendations: string[];
}

/**
 * Interface for persisted tracking state
 */
export interface PersistedTrackingState {
  /** Whether tracking was active */
  isTracking: boolean;
  /** When the session started */
  sessionStartTime: number;
  /** Last update timestamp */
  lastUpdateTime: number;
  /** Tracking interval in seconds */
  intervalSeconds: number;
}

/**
 * Constants for application tracking configuration
 */
export const TRACKING_CONSTANTS = {
  /** Maximum number of consecutive errors before pausing tracking */
  MAX_ERROR_COUNT: 10,
  /** Time to wait before resetting error count (milliseconds) */
  ERROR_RESET_INTERVAL: 60000,
  /** Key for storing tracking state in storage */
  TRACKING_STATE_KEY: "raycast-pomodoro-tracking-state",
  /** Maximum time to resume tracking after restart (2 hours) */
  MAX_RESUME_TIME: 2 * 60 * 60 * 1000,
  /** Default tracking interval in seconds */
  DEFAULT_INTERVAL: 5,
} as const;

/**
 * Application categories for productivity analysis
 */
export const APP_CATEGORIES = {
  PRODUCTIVE: [
    "com.microsoft.VSCode",
    "com.jetbrains.intellij",
    "com.apple.dt.Xcode",
    "com.sublimetext.4",
    "com.github.atom",
    "com.microsoft.Word",
    "com.microsoft.Excel",
    "com.microsoft.PowerPoint",
    "com.adobe.Photoshop",
    "com.figma.Desktop",
  ],
  COMMUNICATION: [
    "com.microsoft.teams",
    "com.slack.desktop",
    "us.zoom.xos",
    "com.skype.skype",
    "com.discord.discord",
    "com.apple.mail",
    "com.microsoft.Outlook",
  ],
  DISTRACTION: [
    "com.facebook.Facebook",
    "com.twitter.twitter-mac",
    "com.instagram.instagram",
    "com.reddit.reddit",
    "com.youtube.youtube",
    "com.netflix.Netflix",
    "com.spotify.client",
    "com.apple.TV",
  ],
  BROWSERS: [
    "com.google.Chrome",
    "com.apple.Safari",
    "org.mozilla.firefox",
    "com.microsoft.edgemac",
    "com.operasoftware.Opera",
  ],
} as const;

/**
 * Type for application category keys
 */
export type AppCategory = keyof typeof APP_CATEGORIES;

/**
 * Helper function to get application category
 */
export function getApplicationCategory(bundleId: string): AppCategory | null {
  for (const [category, apps] of Object.entries(APP_CATEGORIES) as [
    AppCategory,
    readonly string[],
  ][]) {
    if (apps.includes(bundleId)) {
      return category;
    }
  }
  return null;
}

/**
 * Helper function to check if an application is considered productive
 */
export function isProductiveApplication(bundleId: string): boolean {
  const category = getApplicationCategory(bundleId);
  return category === "PRODUCTIVE" || category === "COMMUNICATION";
}

/**
 * Helper function to check if an application is considered distracting
 */
export function isDistractionApplication(bundleId: string): boolean {
  const category = getApplicationCategory(bundleId);
  return category === "DISTRACTION";
}
