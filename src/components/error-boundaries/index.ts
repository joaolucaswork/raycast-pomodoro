// Export all error boundary components
export {
  ErrorBoundary,
  TimerErrorBoundary,
  FormErrorBoundary,
  DataErrorBoundary,
  withErrorBoundary,
  useErrorReporting,
  createErrorBoundary,
} from "./ErrorBoundary";

export {
  CommandErrorBoundary,
  withCommandErrorBoundary,
  TimerCommandErrorBoundary,
  HistoryCommandErrorBoundary,
  MoodCommandErrorBoundary,
  TagCommandErrorBoundary,
  AnalyticsCommandErrorBoundary,
} from "./CommandErrorBoundary";

// Re-export React types for convenience
export type { ReactNode } from "react";
