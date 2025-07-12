/**
 * Application Tracking Module
 *
 * This module provides comprehensive application usage tracking during Pomodoro work sessions.
 * It has been refactored into focused, maintainable components following the project's 500-line rule.
 *
 * Architecture:
 * - Types: Core interfaces, types, and constants
 * - State: Persistence and state lifecycle management
 * - Analytics: Statistics, insights, and data analysis
 * - Core: Application detection and data capture
 * - Service: Main coordination layer
 */

// Export all types and interfaces
export type {
  ApplicationTrackingData,
  ApplicationTrackingStats,
  TrackingHealth,
  ProductivityInsights,
  PersistedTrackingState,
  AppCategory,
} from "./application-tracking-types";

// Export constants and utilities
export {
  TRACKING_CONSTANTS,
  APP_CATEGORIES,
  getApplicationCategory,
  isProductiveApplication,
  isDistractionApplication,
} from "./application-tracking-types";

// Export state management
export {
  ApplicationTrackingStateManager,
  applicationTrackingStateManager,
} from "./application-tracking-state";

// Export analytics and insights
export {
  ApplicationTrackingAnalytics,
  applicationTrackingAnalytics,
} from "./application-tracking-analytics";

// Export core tracking functionality
export {
  ApplicationTrackingCore,
  applicationTrackingCore,
} from "./application-tracking-core";

// Export main service (this maintains backward compatibility)
export { applicationTrackingService } from "../application-tracking-service";

/**
 * Re-export the main service as default for convenience
 */
export { applicationTrackingService as default } from "../application-tracking-service";
