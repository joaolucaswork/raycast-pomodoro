import {
  Action,
  ActionPanel,
  Icon,
  List,
  Color,
  useNavigation,
} from "@raycast/api";
import { useState, useMemo, useEffect } from "react";
import { useTimerStore } from "./store/timer-store";
import {
  formatTime,
  getSessionTypeLabel,
  getSessionTypeIcon,
} from "./utils/helpers";
import { TimerSession } from "./types/timer";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import { SessionManagementForm } from "./components/session-editing";
import { SessionListItem } from "./components/history";
import {
  getAppRankingColor,
  SESSION_ICONS,
  STATUS_COLORS,
  ACTION_ICONS,
  SHORTCUTS,
  getMoodIcon,
  getMoodColor,
} from "./constants/design-tokens";

type SortOption = "newest" | "oldest" | "longest" | "shortest";
type FilterType = "all" | "work" | "short_break" | "long_break";
type CompletionFilter = "all" | "completed" | "incomplete";

export default function TimerHistory() {
  const { push } = useNavigation();
  // Default to hidden details, but preserve user preference during session
  const [isShowingDetail, setIsShowingDetail] = useState(false);
  // Track which session is currently selected for detail view
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const {
    history,
    deleteSession,
    getTagConfig,
    moodEntries,
    refreshConfigFromPreferences,
  } = useTimerStore();

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

  // Filter and sort sessions - moved before conditional returns
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = history;

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((session) => session.type === filterType);
    }

    // Apply completion filter
    if (completionFilter !== "all") {
      filtered = filtered.filter((session) =>
        completionFilter === "completed"
          ? session.completed
          : !session.completed
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
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
  }, [history, filterType, completionFilter, sortBy]);

  // Find the currently selected session for detail view
  const selectedSession = selectedSessionId
    ? history.find((session) => session.id === selectedSessionId)
    : null;

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
      searchBarAccessory={
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
      }
      actions={
        <ActionPanel>
          <ActionPanel.Section title="View">
            <Action
              title={isShowingDetail ? "Hide Details" : "Show Details"}
              icon={
                isShowingDetail ? Icon.EyeDisabled : ACTION_ICONS.VIEW_DETAILS
              }
              onAction={() => handleDetailToggle()}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="Filter">
            <ActionPanel.Submenu title="Round Type" icon={Icon.Filter}>
              <Action
                title="All Rounds"
                onAction={() => setFilterType("all")}
              />
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
      }
    >
      {Object.entries(
        filteredAndSortedSessions.reduce(
          (groups, session) => {
            const startTime = new Date(session.startTime);
            let groupKey: string;

            if (isToday(startTime)) {
              groupKey = "Today";
            } else if (isYesterday(startTime)) {
              groupKey = "Yesterday";
            } else if (isThisWeek(startTime)) {
              groupKey = format(startTime, "EEEE");
            } else if (isThisMonth(startTime)) {
              groupKey = format(startTime, "MMMM d");
            } else {
              groupKey = format(startTime, "MMMM yyyy");
            }

            if (!groups[groupKey]) {
              groups[groupKey] = [];
            }
            groups[groupKey].push(session);
            return groups;
          },
          {} as Record<string, TimerSession[]>
        )
      ).map(([dateGroup, sessions]) => (
        <List.Section key={dateGroup} title={dateGroup}>
          {sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              moodEntries={moodEntries}
              showDetail={isShowingDetail}
              detailComponent={<SessionDetailView session={session} />}
              getTagColor={getTagColor}
              actions={
                <ActionPanel>
                  {/* Primary action: View Details */}
                  <Action
                    title={isShowingDetail ? "Hide Details" : "Show Details"}
                    icon={
                      isShowingDetail
                        ? Icon.EyeDisabled
                        : ACTION_ICONS.VIEW_DETAILS
                    }
                    onAction={() => handleDetailToggle(session.id)}
                    shortcut={SHORTCUTS.PRIMARY_ACTION}
                  />

                  {/* Secondary action: Manage Session */}
                  <Action
                    title="Manage Session"
                    icon={Icon.Gear}
                    onAction={() =>
                      push(<SessionManagementForm session={session} />)
                    }
                    shortcut={{ modifiers: ["cmd"], key: "m" }}
                  />
                  <ActionPanel.Section title="Actions">
                    <Action
                      title="Delete Session"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={async () => {
                        deleteSession(session.id);
                        // Toast disabled for Windows compatibility
                      }}
                      shortcut={{ modifiers: ["cmd"], key: "delete" }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}

      {history.length === 0 && (
        <List.EmptyView
          title="No Focus Sessions"
          description="Start your first focus round to see your session history here"
          icon={{
            source: SESSION_ICONS.IDLE,
            tintColor: STATUS_COLORS.NEUTRAL,
          }}
        />
      )}
    </List>
  );
}

interface SessionDetailViewProps {
  session: TimerSession;
}

function SessionDetailView({ session }: SessionDetailViewProps) {
  const { moodEntries } = useTimerStore();

  // Ensure dates are Date objects (they might be strings when loaded from storage)
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : null;

  const duration = endTime
    ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    : session.duration;

  // Find mood entries associated with this session
  const associatedMoodEntries = moodEntries.filter(
    (entry) => entry.sessionId === session.id
  );

  const getStatusText = () => {
    if (session.completed) return "Completed";
    switch (session.endReason) {
      case "stopped":
        return "Stopped Early";
      case "skipped":
        return "Skipped";
      default:
        return "Incomplete";
    }
  };

  return (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          {/* Session Overview Section */}
          <List.Item.Detail.Metadata.Label
            title="Session Overview"
            text={session.taskName || getSessionTypeLabel(session.type)}
            icon={{
              source: session.taskIcon || getSessionTypeIcon(session.type),
              tintColor: STATUS_COLORS.PRIMARY,
            }}
          />

          <List.Item.Detail.Metadata.Label
            title="Duration"
            text={formatTime(duration)}
            icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.INFO }}
          />

          <List.Item.Detail.Metadata.Label
            title="Status"
            text={getStatusText()}
            icon={{
              source: session.completed ? Icon.CheckCircle : Icon.XMarkCircle,
              tintColor: session.completed
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.ERROR,
            }}
          />

          {/* Time Information Section */}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Started"
            text={format(startTime, "MMM d, yyyy 'at' h:mm a")}
            icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.NEUTRAL }}
          />
          {endTime && (
            <List.Item.Detail.Metadata.Label
              title="Ended"
              text={format(endTime, "MMM d, yyyy 'at' h:mm a")}
              icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.NEUTRAL }}
            />
          )}

          {/* Project Information Section */}
          {session.projectName && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Project"
                text={session.projectName}
                icon={{ source: Icon.Folder, tintColor: STATUS_COLORS.ACCENT }}
              />
            </>
          )}

          {session.tags && session.tags.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.TagList title="Tags">
                {session.tags.map((tag) => (
                  <List.Item.Detail.Metadata.TagList.Item
                    key={tag}
                    text={tag}
                  />
                ))}
              </List.Item.Detail.Metadata.TagList>
            </>
          )}

          {session.notes && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Notes"
                text={session.notes}
                icon={{ source: Icon.Document, tintColor: STATUS_COLORS.INFO }}
              />
            </>
          )}

          {associatedMoodEntries.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Mood Entries"
                text={`${associatedMoodEntries.length} ${associatedMoodEntries.length === 1 ? "entry" : "entries"}`}
                icon={{ source: Icon.Heart, tintColor: STATUS_COLORS.ACCENT }}
              />
              {associatedMoodEntries.slice(0, 3).map((entry) => {
                const contextText =
                  entry.context === "pre-session"
                    ? "Before session"
                    : entry.context === "post-session"
                      ? "After session"
                      : entry.context === "during-session"
                        ? "During session"
                        : "Standalone";

                return (
                  <List.Item.Detail.Metadata.Label
                    key={entry.id}
                    title={`${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} (${entry.intensity}/5)`}
                    text={`${contextText} - ${format(new Date(entry.timestamp), "h:mm a")}`}
                    icon={{
                      source: getMoodIcon(entry.mood),
                      tintColor: getMoodColor(entry.mood),
                    }}
                  />
                );
              })}
              {associatedMoodEntries.length > 3 && (
                <List.Item.Detail.Metadata.Label
                  title="More Mood Entries"
                  text={`+${associatedMoodEntries.length - 3} additional entries`}
                  icon={{
                    source: Icon.Ellipsis,
                    tintColor: STATUS_COLORS.NEUTRAL,
                  }}
                />
              )}
            </>
          )}

          {session.applicationUsage && session.applicationUsage.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Application Usage"
                text={`${session.applicationUsage.length} applications tracked`}
                icon={{ source: Icon.Desktop, tintColor: STATUS_COLORS.INFO }}
              />
              {session.applicationUsage.slice(0, 5).map((app, index) => (
                <List.Item.Detail.Metadata.Label
                  key={app.bundleId}
                  title={app.name}
                  text={`${app.percentage}% (${formatTime(app.timeSpent)})`}
                  icon={{
                    source: Icon.Circle,
                    tintColor:
                      index < 3
                        ? getAppRankingColor(index)
                        : STATUS_COLORS.NEUTRAL,
                  }}
                />
              ))}
              {session.applicationUsage.length > 5 && (
                <List.Item.Detail.Metadata.Label
                  title="More Applications"
                  text={`+${session.applicationUsage.length - 5} additional apps`}
                  icon={{
                    source: Icon.Ellipsis,
                    tintColor: STATUS_COLORS.NEUTRAL,
                  }}
                />
              )}
            </>
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
}
