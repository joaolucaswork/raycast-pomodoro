import { Action, ActionPanel, Icon, List, Detail, Color } from "@raycast/api";
import { useState, useMemo } from "react";
import { useTimerStore } from "./store/timer-store";
import {
  formatTime,
  formatDuration,
  getSessionTypeLabel,
  getSessionTypeIcon,
  calculateProductivityScore,
} from "./utils/helpers";
import { SessionType, TimerSession } from "./types/timer";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import { dataService } from "./services/data-service";

import { applicationTrackingService } from "./services/application-tracking-service";
import { getSessionColor, getSessionStateDot } from "./constants/design-tokens";

type SortOption = "newest" | "oldest" | "longest" | "shortest";
type FilterType = "all" | "work" | "short_break" | "long_break";
type CompletionFilter = "all" | "completed" | "incomplete";

export default function TimerHistory() {
  const [selectedSession, setSelectedSession] = useState<TimerSession | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "stats" | "app-analytics">(
    "list"
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const { history, deleteSession, getTagConfig } = useTimerStore();

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
      <SessionDetailWithSidebar
        session={selectedSession}
        allSessions={history}
        onSessionSelect={setSelectedSession}
        onBack={() => setSelectedSession(null)}
      />
    );
  }

  if (viewMode === "stats") {
    return <StatsView onBack={() => setViewMode("list")} />;
  }

  if (viewMode === "app-analytics") {
    return <AppAnalyticsView onBack={() => setViewMode("list")} />;
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
          <ActionPanel.Section>
            <Action
              title="Statistics"
              icon={Icon.BarChart}
              onAction={() => setViewMode("stats")}
              shortcut={{ modifiers: ["ctrl", "shift"], key: "s" }}
            />
            <Action
              title="App Analytics"
              icon={Icon.Desktop}
              onAction={() => setViewMode("app-analytics")}
              shortcut={{ modifiers: ["ctrl", "shift"], key: "a" }}
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
      {/* Statistics Section */}
      <List.Section title="Statistics">
        <List.Item
          title="Today's Progress"
          subtitle={`${
            history.filter((s) => {
              const sessionDate = new Date(s.startTime);
              const today = new Date();
              return sessionDate.toDateString() === today.toDateString();
            }).length
          } rounds completed • ${useTimerStore.getState().stats.streakCount} day streak`}
          icon={Icon.Calendar}
        />
        <List.Item
          title="All Time"
          subtitle={`${useTimerStore.getState().stats.totalSessions} total rounds • ${useTimerStore.getState().stats.completedSessions} completed`}
          icon={Icon.BarChart}
        />
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
                  { text: formatTime(session.duration) },
                  ...(hasAppData ? [{ icon: Icon.Desktop }] : []),
                  {
                    icon: {
                      source: statusDot.icon,
                      tintColor: statusDot.tintColor,
                    },
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action
                      title="View Details"
                      icon={Icon.Eye}
                      onAction={() => setSelectedSession(session)}
                      shortcut={{ modifiers: ["cmd"], key: "return" }}
                    />
                    <ActionPanel.Section>
                      <Action
                        title="Statistics"
                        icon={Icon.BarChart}
                        onAction={() => setViewMode("stats")}
                        shortcut={{ modifiers: ["ctrl", "shift"], key: "s" }}
                      />
                      <Action
                        title="App Analytics"
                        icon={Icon.Desktop}
                        onAction={() => setViewMode("app-analytics")}
                        shortcut={{ modifiers: ["ctrl", "shift"], key: "a" }}
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
                          // await showToast({
                          //   style: Toast.Style.Success,
                          //   title: "Session Deleted",
                          //   message: "Session removed from history",
                          // });
                        }}
                        shortcut={{ modifiers: ["cmd"], key: "backspace" }}
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
          title="No rounds"
          description="Start a focus round to see your history"
          icon={Icon.Clock}
        />
      )}
    </List>
  );
}

function SessionDetailWithSidebar({
  session,
  allSessions,
  onSessionSelect,
  onBack,
}: {
  session: TimerSession;
  allSessions: TimerSession[];
  onSessionSelect: (session: TimerSession) => void;
  onBack: () => void;
}) {
  const { deleteSession } = useTimerStore();
  const groupedSessions = groupSessionsByDate(allSessions);

  return (
    <List
      navigationTitle={`${getSessionTypeLabel(session.type)} Session`}
      isShowingDetail
      searchBarPlaceholder="Search sessions..."
    >
      {Object.entries(groupedSessions).map(([dateGroup, sessions]) => (
        <List.Section key={dateGroup} title={dateGroup}>
          {sessions.map((sessionItem) => {
            const isSelected = sessionItem.id === session.id;
            const sessionIcon = getSessionTypeIcon(sessionItem.type);
            const sessionColor = getSessionColor(
              sessionItem.type,
              sessionItem.completed
            );
            const statusDot = getSessionStateDot(
              sessionItem.type,
              sessionItem.completed,
              false,
              false,
              sessionItem.endReason
            );

            return (
              <List.Item
                key={sessionItem.id}
                title={getSessionTypeLabel(sessionItem.type)}
                subtitle={getSessionSubtitle(sessionItem)}
                icon={{ source: sessionIcon, tintColor: sessionColor }}
                accessories={[
                  { text: formatTime(sessionItem.duration) },
                  ...(sessionItem.applicationUsage &&
                  sessionItem.applicationUsage.length > 0
                    ? [{ icon: Icon.Desktop }]
                    : []),
                  {
                    icon: {
                      source: statusDot.icon,
                      tintColor: statusDot.tintColor,
                    },
                  },
                ]}
                detail={
                  isSelected ? (
                    <SessionDetailView session={session} />
                  ) : undefined
                }
                actions={
                  <ActionPanel>
                    <Action
                      title="View Details"
                      icon={Icon.Eye}
                      onAction={() => onSessionSelect(sessionItem)}
                      shortcut={{ modifiers: ["cmd"], key: "return" }}
                    />
                    <Action
                      title="Back"
                      icon={Icon.ArrowLeft}
                      onAction={onBack}
                      shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }}
                    />
                    <ActionPanel.Section title="Manage">
                      <Action
                        title="Delete Session"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        onAction={async () => {
                          deleteSession(sessionItem.id);
                          // Toast disabled for Windows compatibility
                          // await showToast({
                          //   style: Toast.Style.Success,
                          //   title: "Session Deleted",
                          //   message: "Session removed from history",
                          // });
                          // If we deleted the currently viewed session, go back
                          if (sessionItem.id === session.id) {
                            onBack();
                          }
                        }}
                        shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                      />
                    </ActionPanel.Section>
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}

function SessionDetailView({ session }: { session: TimerSession }) {
  // Ensure dates are Date objects (they might be strings when loaded from storage)
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : null;

  const duration = endTime
    ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    : session.duration;

  // Generate application usage section
  const applicationUsageSection =
    session.applicationUsage && session.applicationUsage.length > 0
      ? `
## Apps
${session.applicationUsage
  .slice(0, 3)
  .map((app) => `**${app.name}** ${formatTime(app.timeSpent)}`)
  .join(" • ")}
`
      : "";

  // Get status text based on end reason
  const getStatusText = () => {
    if (session.completed) {
      return "**Completed**";
    }

    switch (session.endReason) {
      case "stopped":
        return "**Stopped**";
      case "skipped":
        return "**Skipped**";
      default:
        return "**Incomplete**";
    }
  };

  // Generate tags section
  const tagsSection =
    session.tags && session.tags.length > 0
      ? `
## Tags
${session.tags.map((tag) => `\`#${tag}\``).join(" ")}
`
      : "";

  const markdown = `
# ${getSessionTypeLabel(session.type)}

${getStatusText()} • ${formatTime(duration)}
${session.taskName ? `**${session.taskName}**` : ""}
${session.projectName ? ` (${session.projectName})` : ""}
${session.taskIcon ? `\n**Icon:** ${session.taskIcon}` : ""}

${tagsSection}
${applicationUsageSection}
  `;

  return <List.Item.Detail markdown={markdown} />;
}

function StatsView({ onBack }: { onBack: () => void }) {
  const { stats, history } = useTimerStore();

  const workSessions = history.filter(
    (s: TimerSession) => s.type === SessionType.WORK && s.completed
  );
  const productivityScore = calculateProductivityScore(
    stats.completedSessions,
    stats.totalSessions
  );

  // Calculate application usage statistics
  const sessionsWithAppUsage = workSessions.filter(
    (s) => s.applicationUsage && s.applicationUsage.length > 0
  );
  const allAppUsage = new Map<
    string,
    { name: string; totalTime: number; sessionCount: number }
  >();

  sessionsWithAppUsage.forEach((session) => {
    session.applicationUsage?.forEach((app) => {
      const existing = allAppUsage.get(app.bundleId) || {
        name: app.name,
        totalTime: 0,
        sessionCount: 0,
      };
      existing.totalTime += app.timeSpent;
      existing.sessionCount += 1;
      allAppUsage.set(app.bundleId, existing);
    });
  });

  const topApps = Array.from(allAppUsage.values())
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 5);

  const markdown = `
# Statistics

| | |
|--|--|
| Total | ${stats.totalSessions} |
| Completed | ${stats.completedSessions} |
| Score | ${productivityScore}% |
| Streak | ${stats.streakCount} days |
| Work Time | ${formatDuration(stats.totalWorkTime)} |
| Today | ${stats.todaysSessions} |
${
  topApps.length > 0
    ? `
## Top Apps
${topApps
  .slice(0, 3)
  .map((app) => `**${app.name}** ${formatTime(app.totalTime)}`)
  .join(" • ")}
`
    : ""
}

---

${
  stats.streakCount > 0
    ? `**${stats.streakCount} Day Streak**`
    : "**Start Your Streak** - Complete sessions daily"
}
  `;

  const handleExportJSON = async () => {
    try {
      const jsonData = dataService.exportDataAsJSON();
      // Clipboard not available in Raycast environment
      console.log("JSON Export:", jsonData);
      // Toast disabled for Windows compatibility
      // await showToast({
      //   style: Toast.Style.Success,
      //   title: "Data Exported",
      //   message: "JSON data logged to console",
      // });
    } catch (error) {
      // Toast disabled for Windows compatibility
      // await showToast({
      //   style: Toast.Style.Failure,
      //   title: "Export Failed",
      //   message: "Could not export data",
      // });
      console.error("Export failed:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = dataService.exportDataAsCSV();
      console.log("CSV Export:", csvData);
      // Toast disabled for Windows compatibility
      // await showToast({
      //   style: Toast.Style.Success,
      //   title: "Data Exported",
      //   message: "CSV data logged to console",
      // });
    } catch (error) {
      // Toast disabled for Windows compatibility
      // await showToast({
      //   style: Toast.Style.Failure,
      //   title: "Export Failed",
      //   message: "Could not export data",
      // });
      console.error("Export failed:", error);
    }
  };

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action
            title="Back to History"
            icon={Icon.ArrowLeft}
            onAction={onBack}
          />
          <ActionPanel.Section title="Export Data">
            <Action
              title="Export as JSON"
              icon={Icon.Document}
              onAction={handleExportJSON}
            />
            <Action
              title="Export as CSV"
              icon={Icon.Document}
              onAction={handleExportCSV}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
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

function AppAnalyticsView({ onBack }: { onBack: () => void }) {
  const { history } = useTimerStore();

  // Get sessions with application usage data
  const sessionsWithAppUsage = history.filter(
    (s: TimerSession) =>
      s.type === SessionType.WORK &&
      s.applicationUsage &&
      s.applicationUsage.length > 0
  );

  // Aggregate application usage across all sessions
  const allAppUsage = new Map<
    string,
    {
      name: string;
      totalTime: number;
      sessionCount: number;
      averageTime: number;
    }
  >();

  sessionsWithAppUsage.forEach((session) => {
    session.applicationUsage?.forEach((app) => {
      const existing = allAppUsage.get(app.bundleId) || {
        name: app.name,
        totalTime: 0,
        sessionCount: 0,
        averageTime: 0,
      };
      existing.totalTime += app.timeSpent;
      existing.sessionCount += 1;
      existing.averageTime = Math.floor(
        existing.totalTime / existing.sessionCount
      );
      allAppUsage.set(app.bundleId, existing);
    });
  });

  const topApps = Array.from(allAppUsage.values())
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 10);

  // Get productivity insights from the service
  const insights = applicationTrackingService.getProductivityInsights();

  const markdown = `
# Application Analytics

## Overview
- **Sessions with App Data**: ${sessionsWithAppUsage.length} / ${history.filter((s) => s.type === SessionType.WORK).length} work sessions
- **Total Applications Used**: ${allAppUsage.size}
- **Data Coverage**: ${history.length > 0 ? Math.round((sessionsWithAppUsage.length / history.filter((s) => s.type === SessionType.WORK).length) * 100) : 0}%

${
  topApps.length > 0
    ? `
## Top Applications
${topApps
  .map(
    (app, index) =>
      `${index + 1}. **${app.name}**
   - Total time: ${formatTime(app.totalTime)}
   - Used in ${app.sessionCount} sessions
   - Average per session: ${formatTime(app.averageTime)}`
  )
  .join("\n\n")}
`
    : ""
}

${
  insights.focusScore > 0
    ? `
## Productivity Analysis
- **Focus Score**: ${insights.focusScore}%
- **Productive Apps**: ${insights.productiveApps.length}
- **Distraction Apps**: ${insights.distractionApps.length}

${
  insights.productiveApps.length > 0
    ? `
### Productive Applications
${insights.productiveApps
  .map(
    (app, index) =>
      `${index + 1}. **${app.name}** - ${formatTime(app.timeSpent)} (${app.percentage}%)`
  )
  .join("\n")}
`
    : ""
}

${
  insights.distractionApps.length > 0
    ? `
### Potential Distractions
${insights.distractionApps
  .map(
    (app, index) =>
      `${index + 1}. **${app.name}** - ${formatTime(app.timeSpent)} (${app.percentage}%)`
  )
  .join("\n")}
`
    : ""
}

${
  insights.recommendations.length > 0
    ? `
## Recommendations
${insights.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n")}
`
    : ""
}
`
    : ""
}

${
  sessionsWithAppUsage.length === 0
    ? `
## Get Started with Application Tracking

Application tracking is currently enabled in your preferences, but no data has been collected yet.

**To start collecting application usage data:**
1. Start a work session (application tracking only works during work sessions)
2. Switch between different applications while the timer is running
3. Complete the session to save the data
4. Return here to see your application usage analytics

**Benefits of Application Tracking:**
- Understand which applications you spend the most time in
- Get productivity insights and recommendations
- Track your focus patterns over time
- Identify potential distractions during work sessions
`
    : ""
}

---

*Application tracking helps you understand your work patterns and improve focus. Data is collected only during work sessions and stored locally.*
  `;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action
            title="Back to History"
            icon={Icon.ArrowLeft}
            onAction={onBack}
          />
        </ActionPanel>
      }
    />
  );
}
