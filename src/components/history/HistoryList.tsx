import { List, Icon } from "@raycast/api";
import { useMemo } from "react";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import { TimerSession, MoodEntry } from "../../types/timer";
import { SessionListItem } from "./SessionListItem";
import { HistoryDetail } from "./HistoryDetail";
import { HistoryActions } from "./HistoryActions";
import { SESSION_ICONS, STATUS_COLORS } from "../../constants/design-tokens";

interface HistoryListProps {
  sessions: TimerSession[];
  moodEntries: MoodEntry[];
  isShowingDetail: boolean;
  selectedSessionId: string | null;
  onSelectionChange: (id: string | null) => void;
  onDetailToggle: (sessionId?: string) => void;
  getTagColor: (tag: string) => string;
}

export function HistoryList({
  sessions,
  moodEntries,
  isShowingDetail,
  selectedSessionId,
  onSelectionChange,
  onDetailToggle,
  getTagColor,
}: HistoryListProps) {
  // Group sessions by date
  const groupedSessions = useMemo(() => {
    return sessions.reduce(
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
    );
  }, [sessions]);

  // Find the currently selected session for detail view
  const selectedSession = selectedSessionId
    ? sessions.find((session) => session.id === selectedSessionId)
    : null;

  if (sessions.length === 0) {
    return (
      <List.EmptyView
        title="No Focus Sessions"
        description="Start your first focus round to see your session history here"
        icon={{
          source: SESSION_ICONS.IDLE,
          tintColor: STATUS_COLORS.NEUTRAL,
        }}
      />
    );
  }

  return (
    <>
      {Object.entries(groupedSessions).map(([dateGroup, groupSessions]) => (
        <List.Section key={dateGroup} title={dateGroup}>
          {groupSessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              moodEntries={moodEntries}
              showDetail={isShowingDetail}
              detailComponent={
                selectedSession?.id === session.id ? (
                  <HistoryDetail session={session} />
                ) : undefined
              }
              getTagColor={getTagColor}
              actions={
                <HistoryActions
                  session={session}
                  isShowingDetail={isShowingDetail}
                  onDetailToggle={onDetailToggle}
                />
              }
            />
          ))}
        </List.Section>
      ))}
    </>
  );
}

/**
 * Utility component for rendering session groups with custom formatting
 */
interface SessionGroupProps {
  title: string;
  sessions: TimerSession[];
  moodEntries: MoodEntry[];
  isShowingDetail: boolean;
  selectedSessionId: string | null;
  onDetailToggle: (sessionId?: string) => void;
  getTagColor: (tag: string) => string;
  customRenderer?: (session: TimerSession) => React.ReactNode;
}

export function SessionGroup({
  title,
  sessions,
  moodEntries,
  isShowingDetail,
  selectedSessionId,
  onDetailToggle,
  getTagColor,
  customRenderer,
}: SessionGroupProps) {
  const sessionCount = sessions.length;
  const completedCount = sessions.filter(s => s.completed).length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  
  const sectionTitle = `${title} (${completedCount}/${sessionCount} completed, ${Math.floor(totalDuration / 60)}m total)`;

  return (
    <List.Section title={sectionTitle}>
      {sessions.map((session) => {
        if (customRenderer) {
          return customRenderer(session);
        }

        return (
          <SessionListItem
            key={session.id}
            session={session}
            moodEntries={moodEntries}
            showDetail={isShowingDetail}
            detailComponent={
              selectedSessionId === session.id ? (
                <HistoryDetail session={session} />
              ) : undefined
            }
            getTagColor={getTagColor}
            actions={
              <HistoryActions
                session={session}
                isShowingDetail={isShowingDetail}
                onDetailToggle={onDetailToggle}
              />
            }
          />
        );
      })}
    </List.Section>
  );
}

/**
 * Compact list view for displaying many sessions
 */
interface CompactHistoryListProps {
  sessions: TimerSession[];
  onSessionSelect: (session: TimerSession) => void;
  maxItems?: number;
}

export function CompactHistoryList({
  sessions,
  onSessionSelect,
  maxItems = 10,
}: CompactHistoryListProps) {
  const displaySessions = sessions.slice(0, maxItems);

  return (
    <div className="compact-history-list">
      {displaySessions.map((session) => (
        <div
          key={session.id}
          className="compact-session-item"
          onClick={() => onSessionSelect(session)}
        >
          <div className="session-info">
            <span className="session-name">
              {session.taskName || "Untitled Session"}
            </span>
            <span className="session-duration">
              {Math.floor(session.duration / 60)}m
            </span>
          </div>
          <div className="session-status">
            {session.completed ? "✓" : "○"}
          </div>
        </div>
      ))}
      {sessions.length > maxItems && (
        <div className="more-sessions">
          +{sessions.length - maxItems} more sessions
        </div>
      )}
    </div>
  );
}

/**
 * Virtual list component for handling large numbers of sessions
 */
interface VirtualHistoryListProps {
  sessions: TimerSession[];
  moodEntries: MoodEntry[];
  itemHeight: number;
  containerHeight: number;
  isShowingDetail: boolean;
  onDetailToggle: (sessionId?: string) => void;
  getTagColor: (tag: string) => string;
}

export function VirtualHistoryList({
  sessions,
  moodEntries,
  itemHeight,
  containerHeight,
  isShowingDetail,
  onDetailToggle,
  getTagColor,
}: VirtualHistoryListProps) {
  // This would implement virtual scrolling for performance with large lists
  // For now, we'll just render all items
  return (
    <div style={{ height: containerHeight, overflow: "auto" }}>
      {sessions.map((session) => (
        <div key={session.id} style={{ height: itemHeight }}>
          <SessionListItem
            session={session}
            moodEntries={moodEntries}
            showDetail={isShowingDetail}
            getTagColor={getTagColor}
            actions={
              <HistoryActions
                session={session}
                isShowingDetail={isShowingDetail}
                onDetailToggle={onDetailToggle}
              />
            }
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Hook for managing session grouping logic
 */
export function useSessionGrouping(sessions: TimerSession[]) {
  return useMemo(() => {
    const groups = {
      today: sessions.filter(s => isToday(new Date(s.startTime))),
      yesterday: sessions.filter(s => isYesterday(new Date(s.startTime))),
      thisWeek: sessions.filter(s => 
        isThisWeek(new Date(s.startTime)) && 
        !isToday(new Date(s.startTime)) && 
        !isYesterday(new Date(s.startTime))
      ),
      thisMonth: sessions.filter(s => 
        isThisMonth(new Date(s.startTime)) && 
        !isThisWeek(new Date(s.startTime))
      ),
      older: sessions.filter(s => !isThisMonth(new Date(s.startTime))),
    };

    return groups;
  }, [sessions]);
}

/**
 * Get session statistics for a group
 */
export function getGroupStatistics(sessions: TimerSession[]) {
  const total = sessions.length;
  const completed = sessions.filter(s => s.completed).length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgDuration = total > 0 ? totalDuration / total : 0;
  
  const byType = sessions.reduce((acc, session) => {
    acc[session.type] = (acc[session.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    completed,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    totalDuration,
    avgDuration,
    byType,
  };
}
