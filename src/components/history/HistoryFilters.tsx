import { Action, ActionPanel, Icon, List } from "@raycast/api";

export type SortOption = "newest" | "oldest" | "longest" | "shortest";
export type FilterType = "all" | "work" | "short_break" | "long_break";
export type CompletionFilter = "all" | "completed" | "incomplete";

interface HistoryFiltersProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filterType: FilterType;
  setFilterType: (filter: FilterType) => void;
  completionFilter: CompletionFilter;
  setCompletionFilter: (filter: CompletionFilter) => void;
  isShowingDetail: boolean;
  onDetailToggle: () => void;
}

export function HistoryFilters({
  sortBy,
  setSortBy,
  filterType,
  setFilterType,
  completionFilter,
  setCompletionFilter,
  isShowingDetail,
  onDetailToggle,
}: HistoryFiltersProps) {
  return {
    searchBarAccessory: (
      <List.Dropdown
        tooltip="Sort Rounds"
        value={sortBy}
        onChange={(value) => setSortBy(value as SortOption)}
      >
        <List.Dropdown.Item title="Newest First" value="newest" />
        <List.Dropdown.Item title="Oldest First" value="oldest" />
        <List.Dropdown.Item title="Longest Rounds" value="longest" />
        <List.Dropdown.Item title="Shortest Rounds" value="shortest" />
      </List.Dropdown>
    ),
    actions: (
      <ActionPanel>
        <ActionPanel.Section title="View">
          <Action
            title={isShowingDetail ? "Hide Details" : "Show Details"}
            icon={isShowingDetail ? Icon.EyeDisabled : Icon.Eye}
            onAction={() => onDetailToggle()}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
          />
        </ActionPanel.Section>
        <ActionPanel.Section title="Filter">
          <ActionPanel.Submenu title="Round Type" icon={Icon.Filter}>
            <Action title="All Rounds" onAction={() => setFilterType("all")} />
            <Action
              title="Focus Rounds"
              onAction={() => setFilterType("work")}
            />
            <Action
              title="Short Breaks"
              onAction={() => setFilterType("short_break")}
            />
            <Action
              title="Long Breaks"
              onAction={() => setFilterType("long_break")}
            />
          </ActionPanel.Submenu>
          <ActionPanel.Submenu
            title="Completion Status"
            icon={Icon.CheckCircle}
          >
            <Action
              title="All Rounds"
              onAction={() => setCompletionFilter("all")}
            />
            <Action
              title="Completed Only"
              onAction={() => setCompletionFilter("completed")}
            />
            <Action
              title="Incomplete Only"
              onAction={() => setCompletionFilter("incomplete")}
            />
          </ActionPanel.Submenu>
        </ActionPanel.Section>
      </ActionPanel>
    ),
  };
}

/**
 * Hook for managing history filter state
 */
export function useHistoryFilters() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");

  return {
    sortBy,
    setSortBy,
    filterType,
    setFilterType,
    completionFilter,
    setCompletionFilter,
  };
}

/**
 * Utility functions for filtering and sorting sessions
 */
export function filterAndSortSessions(
  sessions: any[],
  filters: {
    sortBy: SortOption;
    filterType: FilterType;
    completionFilter: CompletionFilter;
  }
) {
  let filtered = sessions;

  // Apply type filter
  if (filters.filterType !== "all") {
    filtered = filtered.filter(
      (session) => session.type === filters.filterType
    );
  }

  // Apply completion filter
  if (filters.completionFilter !== "all") {
    filtered = filtered.filter((session) =>
      filters.completionFilter === "completed"
        ? session.completed
        : !session.completed
    );
  }

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case "newest":
        return (
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      case "oldest":
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      case "longest":
        return b.duration - a.duration;
      case "shortest":
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Get filter summary text for display
 */
export function getFilterSummary(filters: {
  filterType: FilterType;
  completionFilter: CompletionFilter;
  sortBy: SortOption;
}): string {
  const parts: string[] = [];

  if (filters.filterType !== "all") {
    const typeLabels = {
      work: "Rounds",
      short_break: "Rest Breaks",
      long_break: "Recovery Breaks",
    };
    parts.push(typeLabels[filters.filterType]);
  }

  if (filters.completionFilter !== "all") {
    parts.push(
      filters.completionFilter === "completed" ? "Completed" : "Incomplete"
    );
  }

  const sortLabels = {
    newest: "Newest First",
    oldest: "Oldest First",
    longest: "Longest First",
    shortest: "Shortest First",
  };
  parts.push(`Sorted by ${sortLabels[filters.sortBy]}`);

  return parts.join(" • ");
}

/**
 * Get available filter options
 */
export function getFilterOptions() {
  return {
    sortOptions: [
      {
        value: "newest" as const,
        title: "Newest First",
        description: "Most recent sessions first",
      },
      {
        value: "oldest" as const,
        title: "Oldest First",
        description: "Oldest sessions first",
      },
      {
        value: "longest" as const,
        title: "Longest Rounds",
        description: "Longest duration first",
      },
      {
        value: "shortest" as const,
        title: "Shortest Rounds",
        description: "Shortest duration first",
      },
    ],
    typeOptions: [
      {
        value: "all" as const,
        title: "All Rounds",
        description: "Show all session types",
      },
      {
        value: "work" as const,
        title: "Focus Rounds",
        description: "Work sessions only",
      },
      {
        value: "short_break" as const,
        title: "Short Breaks",
        description: "Short break sessions only",
      },
      {
        value: "long_break" as const,
        title: "Long Breaks",
        description: "Long break sessions only",
      },
    ],
    completionOptions: [
      {
        value: "all" as const,
        title: "All Rounds",
        description: "Show completed and incomplete",
      },
      {
        value: "completed" as const,
        title: "Completed Only",
        description: "Completed sessions only",
      },
      {
        value: "incomplete" as const,
        title: "Incomplete Only",
        description: "Incomplete sessions only",
      },
    ],
  };
}

/**
 * Validate filter values
 */
export function validateFilters(filters: {
  sortBy: string;
  filterType: string;
  completionFilter: string;
}): boolean {
  const { sortOptions, typeOptions, completionOptions } = getFilterOptions();

  return (
    sortOptions.some((option) => option.value === filters.sortBy) &&
    typeOptions.some((option) => option.value === filters.filterType) &&
    completionOptions.some(
      (option) => option.value === filters.completionFilter
    )
  );
}

// Missing import
import { useState } from "react";
