// Components barrel export - organized by domain

// Core component groups (already organized from Phase 2)
export * from "./history";
export * from "./mood";
export * from "./session-forms";
export * from "./error-boundaries";

// UI components
export * from "./ui";

// Icon components
export * from "./icons";

// Statistics components
export * from "./stats";

// Feature components
export * from "./features";

// Legacy exports for backward compatibility
export { SessionManagementForm } from "./session-editing";
export {
  MoodEntryForm,
  MoodLoggingForm,
  MoodManagementForm,
  MoodHistory,
  MoodHistoryList,
  MoodAnalytics,
  QuickMoodSelector,
} from "./mood-tracking";

// Re-export types for convenience
export type { TimerSession, MoodType, MoodEntry } from "../types/timer";
