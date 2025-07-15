// Application tracking services barrel export
export { applicationTrackingService } from "./application-tracking-service";

// Re-export application tracking modules
export * from "./application-tracking";

// Re-export types for convenience
export type { ApplicationUsage } from "../../types/timer";
export type {
  ApplicationTrackingData,
  ApplicationTrackingStats,
  TrackingHealth,
  ProductivityInsights,
} from "./application-tracking/application-tracking-types";
