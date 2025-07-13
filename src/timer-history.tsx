// Re-export all history components from the new modular structure
export {
  HistoryFilters,
  useHistoryFilters,
  filterAndSortSessions,
  getFilterSummary,
  getFilterOptions,
  validateFilters,
  HistoryDetail,
  SessionStats,
  HistoryActions,
  BulkHistoryActions,
  QuickActions,
  ContextMenuActions,
  HistoryList,
  SessionGroup,
  CompactHistoryList,
  VirtualHistoryList,
  useSessionGrouping,
  getGroupStatistics,
  SessionListItem,
  SessionMoodIndicators,
} from "./components/history";

// Re-export types for backward compatibility
export type {
  SortOption,
  FilterType,
  CompletionFilter,
  SessionListItemProps,
  SessionMoodIndicatorsProps,
} from "./components/history";

// Keep the main TimerHistory component for backward compatibility
import { List, useNavigation, Color } from "@raycast/api";
import { useState, useMemo, useEffect } from "react";
import { useTimerStore } from "./store/timer-store";
import {
  HistoryFilters,
  useHistoryFilters,
  filterAndSortSessions,
  HistoryList,
  SortOption,
  FilterType,
  CompletionFilter,
} from "./components/history";

export default function TimerHistory() {
  const { push } = useNavigation();
  // Default to hidden details, but preserve user preference during session
  const [isShowingDetail, setIsShowingDetail] = useState(false);
  // Track which session is currently selected for detail view
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  // Use the new history filters hook
  const {
    sortBy,
    setSortBy,
    filterType,
    setFilterType,
    completionFilter,
    setCompletionFilter,
  } = useHistoryFilters();

  const { history, getTagConfig, moodEntries, refreshConfigFromPreferences } =
    useTimerStore();

  // Refresh preferences when the history command is opened
  useEffect(() => {
    refreshConfigFromPreferences();
    console.log("[TimerHistory] Refreshed config from preferences");
  }, [refreshConfigFromPreferences]);

  // Handle detail toggle
  const handleDetailToggle = (sessionId?: string) => {
    if (!isShowingDetail) {
      // If showing details for the first time, set the selected session
      if (sessionId) {
        setSelectedSessionId(sessionId);
      } else if (filteredAndSortedSessions.length > 0) {
        // Default to first session if no specific session provided
        setSelectedSessionId(filteredAndSortedSessions[0].id);
      }
    }
    setIsShowingDetail(!isShowingDetail);
  };

  // Handle session selection for detail view
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    if (!isShowingDetail) {
      setIsShowingDetail(true);
    }
  };

  // Get tag color based on tag name (with custom config support)
  const getTagColor = (tag: string): Color => {
    // Check if there's a custom configuration for this tag
    const customConfig = getTagConfig(tag);
    if (customConfig) {
      return customConfig.color;
    }

    // Fall back to default color mapping for predefined tags
    const colorMap: Record<string, Color> = {
      work: Color.Blue,
      study: Color.Yellow,
      personal: Color.Green,
    };
    return colorMap[tag.toLowerCase()] || Color.Blue;
  };

  // Use the new filtering and sorting utility
  const filteredAndSortedSessions = useMemo(() => {
    return filterAndSortSessions(history, {
      sortBy,
      filterType,
      completionFilter,
    });
  }, [history, sortBy, filterType, completionFilter]);

  // Get the filters configuration
  const filtersConfig = HistoryFilters({
    sortBy,
    setSortBy,
    filterType,
    setFilterType,
    completionFilter,
    setCompletionFilter,
    isShowingDetail,
    onDetailToggle: handleDetailToggle,
  });

  return (
    <List
      navigationTitle="Focus History"
      searchBarPlaceholder="Search rounds..."
      isShowingDetail={isShowingDetail && filteredAndSortedSessions.length > 0}
      onSelectionChange={(id) => {
        if (id) {
          setSelectedSessionId(id);
        }
      }}
      searchBarAccessory={filtersConfig.searchBarAccessory}
      actions={filtersConfig.actions}
    >
      <HistoryList
        sessions={filteredAndSortedSessions}
        moodEntries={moodEntries}
        isShowingDetail={isShowingDetail}
        selectedSessionId={selectedSessionId}
        onSelectionChange={setSelectedSessionId}
        onDetailToggle={handleDetailToggle}
        getTagColor={getTagColor}
      />
    </List>
  );
}
