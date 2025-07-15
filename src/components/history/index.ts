// History-specific components
export { SessionListItem } from "./SessionListItem";
export { SessionMoodIndicators } from "./SessionMoodIndicators";

// Export new modular components
export {
  HistoryFilters,
  useHistoryFilters,
  filterAndSortSessions,
  getFilterSummary,
  getFilterOptions,
  validateFilters,
} from "./HistoryFilters";

export { HistoryDetail, SessionStats } from "./HistoryDetail";

export {
  HistoryActions,
  BulkHistoryActions,
  QuickActions,
  ContextMenuActions,
} from "./HistoryActions";

export {
  HistoryList,
  SessionGroup,
  CompactHistoryList,
  VirtualHistoryList,
  useSessionGrouping,
  getGroupStatistics,
} from "./HistoryList";

// Type exports
export type { SessionListItemProps } from "./SessionListItem";
export type { SessionMoodIndicatorsProps } from "./SessionMoodIndicators";

// Re-export types for convenience
export type {
  SortOption,
  FilterType,
  CompletionFilter,
} from "./HistoryFilters";
