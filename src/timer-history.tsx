import {
  Action,
  ActionPanel,
  Icon,
  List,
  Color,
  useNavigation,
} from "@raycast/api";
import { useState, useMemo } from "react";
import { useTimerStore } from "./store/timer-store";
import {
  formatTime,
  formatDuration,
  getSessionTypeLabel,
  getSessionTypeIcon,
} from "./utils/helpers";
import { SessionType, TimerSession } from "./types/timer";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import {
  SessionNotesForm,
  SessionIconForm,
  SessionNameForm,
} from "./components/session-editing";

import {
  getSessionColor,
  getSessionStateDot,
  getAppRankingColor,
  SESSION_ICONS,
  STATUS_COLORS,
  ACTION_ICONS,
  SHORTCUTS,
  getMoodIcon,
  getMoodColor,
  MOOD_ICONS,
} from "./constants/design-tokens";

type SortOption = "newest" | "oldest" | "longest" | "shortest";
type FilterType = "all" | "work" | "short_break" | "long_break";
type CompletionFilter = "all" | "completed" | "incomplete";

export default function TimerHistory() {
  const { push } = useNavigation();
  const [selectedSession, setSelectedSession] = useState<TimerSession | null>(
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
    getMoodAnalytics,
    moodEntries,
  } = useTimerStore();

  // Calculate mood analytics
  const moodAnalytics = useMemo(() => {
    if (moodEntries.length === 0) {
      return null;
    }
    return getMoodAnalytics();
  }, [moodEntries, getMoodAnalytics]);

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

  const groupedSessions = groupSessionsByDate(filteredAndSortedSessions);

  // Conditional returns after all hooks
  if (selectedSession) {
    return (
      <List
        navigationTitle={`${getSessionTypeLabel(selectedSession.type)} Session Details`}
        searchBarPlaceholder="Search session details..."
        actions={
          <ActionPanel>
            <Action
              title="Back to History"
              icon={ACTION_ICONS.BACK}
              onAction={() => setSelectedSession(null)}
              shortcut={SHORTCUTS.BACK}
            />
            <ActionPanel.Section title="Edit">
              <Action
                title="Edit Icon"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<SessionIconForm session={selectedSession} />)
                }
                shortcut={{ modifiers: ["cmd"], key: "i" }}
              />
              <Action
                title="Edit Notes"
                icon={Icon.Document}
                onAction={() =>
                  push(<SessionNotesForm session={selectedSession} />)
                }
                shortcut={{ modifiers: ["cmd"], key: "n" }}
              />
              <Action
                title="Edit Name"
                icon={Icon.Text}
                onAction={() =>
                  push(<SessionNameForm session={selectedSession} />)
                }
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            </ActionPanel.Section>
            <ActionPanel.Section title="Manage">
              <Action
                title="Delete Session"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={async () => {
                  deleteSession(selectedSession.id);
                  setSelectedSession(null);
                }}
                shortcut={{ modifiers: ["cmd"], key: "delete" }}
              />
            </ActionPanel.Section>
          </ActionPanel>
        }
      >
        <SessionDetailView session={selectedSession} />
      </List>
    );
  }

  return (
    <List
      navigationTitle="Focus History"
      searchBarPlaceholder="Search rounds..."
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
      {/* Quick Overview */}
      <List.Section title="Overview">
        <List.Item
          title="Today's Sessions"
          subtitle={`${
            history.filter((s) => {
              const sessionDate = new Date(s.startTime);
              const today = new Date();
              return sessionDate.toDateString() === today.toDateString();
            }).length
          } rounds completed today`}
          icon={{
            source: SESSION_ICONS.WORK,
            tintColor: STATUS_COLORS.SUCCESS,
          }}
          accessories={[
            {
              text: `${useTimerStore.getState().stats.streakCount} day streak`,
              icon: { source: Icon.Trophy, tintColor: STATUS_COLORS.SUCCESS },
              tooltip: "Current daily streak",
            },
          ]}
        />
        <List.Item
          title="Total Sessions"
          subtitle={`${useTimerStore.getState().stats.completedSessions} completed of ${useTimerStore.getState().stats.totalSessions} total`}
          icon={{ source: Icon.BarChart, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            {
              text: `${Math.round((useTimerStore.getState().stats.completedSessions / Math.max(useTimerStore.getState().stats.totalSessions, 1)) * 100)}%`,
              icon: { source: Icon.Circle, tintColor: STATUS_COLORS.INFO },
              tooltip: "Completion rate",
            },
          ]}
        />

        {/* Mood Statistics */}
        {moodAnalytics && (
          <>
            <List.Item
              title="Most Common Mood"
              subtitle={`${moodAnalytics.mostCommonMood.charAt(0).toUpperCase() + moodAnalytics.mostCommonMood.slice(1)} (${moodAnalytics.totalEntries} entries)`}
              icon={{
                source: getMoodIcon(moodAnalytics.mostCommonMood),
                tintColor: getMoodColor(moodAnalytics.mostCommonMood),
              }}
              accessories={[
                {
                  text: `${moodAnalytics.averageIntensity.toFixed(1)}/5`,
                  icon: {
                    source: Icon.Circle,
                    tintColor: STATUS_COLORS.ACCENT,
                  },
                  tooltip: "Average intensity",
                },
              ]}
            />
            {moodAnalytics.bestPerformanceMoods.length > 0 && (
              <List.Item
                title="Best Performance Moods"
                subtitle={moodAnalytics.bestPerformanceMoods
                  .map((mood) => mood.charAt(0).toUpperCase() + mood.slice(1))
                  .join(", ")}
                icon={{
                  source: MOOD_ICONS.MOTIVATED,
                  tintColor: STATUS_COLORS.SUCCESS,
                }}
                accessories={[
                  {
                    text: "Optimal",
                    icon: {
                      source: Icon.Star,
                      tintColor: STATUS_COLORS.SUCCESS,
                    },
                    tooltip: "Moods with highest session completion rates",
                  },
                ]}
              />
            )}
          </>
        )}
      </List.Section>

      {Object.entries(groupedSessions).map(([dateGroup, sessions]) => (
        <List.Section key={dateGroup} title={dateGroup}>
          {sessions.map((session) => {
            const hasAppData =
              session.applicationUsage && session.applicationUsage.length > 0;
            const sessionIcon = getSessionTypeIcon(session.type);
            const sessionColor = getSessionColor(
              session.type,
              session.completed
            );
            const statusDot = getSessionStateDot(
              session.type,
              session.completed,
              false,
              false,
              session.endReason
            );

            return (
              <List.Item
                key={session.id}
                title={getSessionTypeLabel(session.type)}
                subtitle={getSessionSubtitle(session)}
                icon={{
                  source:
                    session.type === SessionType.WORK && session.taskIcon
                      ? session.taskIcon
                      : sessionIcon,
                  tintColor: sessionColor,
                }}
                accessories={[
                  // Show tags if available
                  ...(session.tags && session.tags.length > 0
                    ? session.tags.map((tag) => ({
                        tag: { value: tag, color: getTagColor(tag) },
                      }))
                    : []),
                  {
                    text: formatTime(session.duration),
                    tooltip: `Session duration: ${formatTime(session.duration)}`,
                  },
                  ...(hasAppData
                    ? [
                        {
                          icon: {
                            source: Icon.Desktop,
                            tintColor: STATUS_COLORS.INFO,
                          },
                          tooltip: "Application usage tracked",
                        },
                      ]
                    : []),
                  {
                    icon: {
                      source: statusDot.icon,
                      tintColor: statusDot.tintColor,
                    },
                    tooltip: session.completed
                      ? "Session completed"
                      : session.endReason === "stopped"
                        ? "Session stopped early"
                        : session.endReason === "skipped"
                          ? "Session skipped"
                          : "Session incomplete",
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action
                      title="View Details"
                      icon={ACTION_ICONS.VIEW_DETAILS}
                      onAction={() => setSelectedSession(session)}
                      shortcut={SHORTCUTS.PRIMARY_ACTION}
                    />
                    <ActionPanel.Section title="Edit">
                      <Action
                        title="Edit Icon"
                        icon={Icon.Pencil}
                        onAction={() =>
                          push(<SessionIconForm session={session} />)
                        }
                        shortcut={{ modifiers: ["cmd"], key: "i" }}
                      />
                      <Action
                        title="Edit Notes"
                        icon={Icon.Document}
                        onAction={() =>
                          push(<SessionNotesForm session={session} />)
                        }
                        shortcut={{ modifiers: ["cmd"], key: "n" }}
                      />
                      <Action
                        title="Edit Name"
                        icon={Icon.Text}
                        onAction={() =>
                          push(<SessionNameForm session={session} />)
                        }
                        shortcut={{ modifiers: ["cmd"], key: "r" }}
                      />
                    </ActionPanel.Section>
                    <ActionPanel.Section title="Manage">
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
            );
          })}
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

function SessionDetailView({ session }: { session: TimerSession }) {
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

  // Get status information using native design tokens
  const statusDot = getSessionStateDot(
    session.type,
    session.completed,
    false,
    false,
    session.endReason
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
    <>
      {/* Session Details Section */}
      <List.Section title="Session Information">
        <List.Item
          title="Session Type"
          subtitle={getSessionTypeLabel(session.type)}
          icon={{
            source: getSessionTypeIcon(session.type),
            tintColor: getSessionColor(session.type, session.completed),
          }}
          accessories={[
            {
              icon: {
                source: statusDot.icon,
                tintColor: statusDot.tintColor,
              },
              tooltip: getStatusText(),
            },
          ]}
        />
        <List.Item
          title="Duration"
          subtitle={formatTime(duration)}
          icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            {
              text: formatTime(duration),
              tooltip: `Session lasted ${formatTime(duration)}`,
            },
          ]}
        />
        <List.Item
          title="Started"
          subtitle={format(startTime, "MMM d, yyyy 'at' h:mm a")}
          icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.NEUTRAL }}
          accessories={[
            {
              text: format(startTime, "h:mm a"),
              tooltip: "Start time",
            },
          ]}
        />
        {endTime && (
          <List.Item
            title="Ended"
            subtitle={format(endTime, "MMM d, yyyy 'at' h:mm a")}
            icon={{ source: Icon.Calendar, tintColor: STATUS_COLORS.NEUTRAL }}
            accessories={[
              {
                text: format(endTime, "h:mm a"),
                tooltip: "End time",
              },
            ]}
          />
        )}
      </List.Section>

      {/* Task Information Section */}
      {(session.taskName || session.projectName) && (
        <List.Section title="Task Information">
          {session.taskName && (
            <List.Item
              title="Task"
              subtitle={session.taskName}
              icon={{
                source: session.taskIcon || Icon.Document,
                tintColor: STATUS_COLORS.PRIMARY,
              }}
            />
          )}
          {session.projectName && (
            <List.Item
              title="Project"
              subtitle={session.projectName}
              icon={{ source: Icon.Folder, tintColor: STATUS_COLORS.ACCENT }}
            />
          )}
        </List.Section>
      )}

      {/* Notes Section */}
      {session.notes && (
        <List.Section title="Session Notes">
          <List.Item
            title="Notes"
            subtitle={session.notes}
            icon={{ source: Icon.Document, tintColor: STATUS_COLORS.INFO }}
            accessories={[
              {
                icon: {
                  source: Icon.Pencil,
                  tintColor: STATUS_COLORS.NEUTRAL,
                },
                tooltip: "Click to edit notes",
              },
            ]}
          />
        </List.Section>
      )}

      {/* Tags Section */}
      {session.tags && session.tags.length > 0 && (
        <List.Section title="Tags">
          {session.tags.map((tag, index) => (
            <List.Item
              key={index}
              title={`#${tag}`}
              icon={{ source: Icon.Tag, tintColor: STATUS_COLORS.INFO }}
            />
          ))}
        </List.Section>
      )}

      {/* Mood Entries Section */}
      {associatedMoodEntries.length > 0 && (
        <List.Section title="Mood Tracking">
          {associatedMoodEntries.map((entry) => (
            <List.Item
              key={entry.id}
              title={`${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} (${entry.intensity}/5)`}
              subtitle={
                entry.context === "pre-session"
                  ? "Before session"
                  : entry.context === "post-session"
                    ? "After session"
                    : entry.context === "during-session"
                      ? "During session"
                      : "Standalone"
              }
              icon={{
                source: getMoodIcon(entry.mood),
                tintColor: getMoodColor(entry.mood),
              }}
              accessories={[
                {
                  text: format(new Date(entry.timestamp), "h:mm a"),
                  tooltip: `Logged at ${format(new Date(entry.timestamp), "h:mm a")}`,
                },
                ...(entry.notes
                  ? [
                      {
                        icon: {
                          source: Icon.Document,
                          tintColor: STATUS_COLORS.INFO,
                        },
                        tooltip: "Has notes",
                      },
                    ]
                  : []),
              ]}
            />
          ))}
        </List.Section>
      )}

      {/* Application Usage Section */}
      {session.applicationUsage && session.applicationUsage.length > 0 && (
        <List.Section title="Application Usage">
          {session.applicationUsage.slice(0, 10).map((app, index) => (
            <List.Item
              key={app.bundleId}
              title={app.name}
              subtitle={`${app.percentage}% of session time`}
              icon={{
                source: Icon.Desktop,
                tintColor:
                  index < 3 ? getAppRankingColor(index) : STATUS_COLORS.NEUTRAL,
              }}
              accessories={[
                {
                  text: formatTime(app.timeSpent),
                  tooltip: `Used for ${formatTime(app.timeSpent)}`,
                },
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor:
                      index < 3
                        ? getAppRankingColor(index)
                        : STATUS_COLORS.NEUTRAL,
                  },
                  tooltip: `#${index + 1} most used app`,
                },
              ]}
            />
          ))}
          {session.applicationUsage.length > 10 && (
            <List.Item
              title={`+${session.applicationUsage.length - 10} more applications`}
              subtitle="Additional apps used during this session"
              icon={{ source: Icon.Ellipsis, tintColor: STATUS_COLORS.NEUTRAL }}
            />
          )}
        </List.Section>
      )}
    </>
  );
}

function groupSessionsByDate(
  sessions: TimerSession[]
): Record<string, TimerSession[]> {
  const groups: Record<string, TimerSession[]> = {};

  sessions
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
    .forEach((session) => {
      // Ensure startTime is a Date object
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
    });

  return groups;
}

function getSessionSubtitle(session: TimerSession): string {
  const time = format(new Date(session.startTime), "HH:mm");
  let subtitle = time;

  if (session.taskName) {
    subtitle += ` • ${session.taskName}`;
  }

  if (session.projectName) {
    subtitle += ` (${session.projectName})`;
  }

  return subtitle;
}
