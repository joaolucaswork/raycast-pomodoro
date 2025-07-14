import { Icon, List, Color } from "@raycast/api";
import { format } from "date-fns";
import { TimerSession, MoodEntry } from "../../types/timer";
import {
  formatTime,
  getSessionTypeLabel,
  getSessionTypeIcon,
} from "../../utils/helpers";
import {
  STATUS_COLORS,
  getMoodIcon,
  getMoodColor,
} from "../../constants/design-tokens";
import { useTimerStore } from "../../store/timer-store";
import { jsonApplicationIconService } from "../../services/data/json-app-icon-service";

interface HistoryDetailProps {
  session: TimerSession;
}

export function HistoryDetail({ session }: HistoryDetailProps) {
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

  // Get application usage data if available
  const applicationUsage = session.applicationUsage || [];

  const getStatusText = () => {
    if (session.completed) {
      return endTime
        ? `Completed at ${format(endTime, "h:mm a")}`
        : "Completed";
    } else {
      return "Incomplete";
    }
  };

  const getTagColor = (tag: string) => {
    const { getTagConfig } = useTimerStore.getState();
    const config = getTagConfig(tag);
    return config?.color || Color.Blue;
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

          {/* Tags Section */}
          {session.tags && session.tags.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Tags"
                text={session.tags.join(", ")}
                icon={{ source: Icon.Tag, tintColor: STATUS_COLORS.ACCENT }}
              />
            </>
          )}

          {/* Notes Section */}
          {session.notes && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Notes"
                text={session.notes}
                icon={{
                  source: Icon.Document,
                  tintColor: STATUS_COLORS.NEUTRAL,
                }}
              />
            </>
          )}

          {/* Application Usage Section */}
          {applicationUsage.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Application Usage"
                text={`${applicationUsage.length} application${applicationUsage.length === 1 ? "" : "s"} tracked`}
                icon={{ source: Icon.Desktop, tintColor: STATUS_COLORS.INFO }}
              />
              {applicationUsage.slice(0, 3).map((usage, index) => {
                const appIcon =
                  jsonApplicationIconService.getIconByBundleId(
                    usage.bundleId || usage.name
                  ) || jsonApplicationIconService.getIconByName(usage.name);

                return (
                  <List.Item.Detail.Metadata.Label
                    key={`${usage.bundleId}-${index}`}
                    title={usage.name}
                    text={`${Math.round(usage.timeSpent / 60)}m (${Math.round((usage.timeSpent / duration) * 100)}%)`}
                    icon={{ source: appIcon, tintColor: STATUS_COLORS.NEUTRAL }}
                  />
                );
              })}
              {applicationUsage.length > 3 && (
                <List.Item.Detail.Metadata.Label
                  title="More Applications"
                  text={`+${applicationUsage.length - 3} additional apps`}
                  icon={{
                    source: Icon.Ellipsis,
                    tintColor: STATUS_COLORS.NEUTRAL,
                  }}
                />
              )}
            </>
          )}

          {/* Mood Entries Section */}
          {associatedMoodEntries.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Mood Tracking"
                text={`${associatedMoodEntries.length} mood ${associatedMoodEntries.length === 1 ? "entry" : "entries"} recorded`}
                icon={{ source: Icon.Heart, tintColor: STATUS_COLORS.ACCENT }}
              />
              {associatedMoodEntries.slice(0, 3).map((entry) => {
                const contextText = {
                  "pre-session": "Before",
                  "during-session": "During",
                  "post-session": "After",
                  standalone: "General",
                }[entry.context];

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

          {/* Session Statistics */}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Session Type"
            text={getSessionTypeLabel(session.type)}
            icon={{
              source: getSessionTypeIcon(session.type),
              tintColor: STATUS_COLORS.PRIMARY,
            }}
          />

          {session.type === "work" && (
            <List.Item.Detail.Metadata.Label
              title="Productivity Score"
              text={calculateProductivityScore(session)}
              icon={{ source: Icon.BarChart, tintColor: STATUS_COLORS.SUCCESS }}
            />
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
}

/**
 * Calculate a simple productivity score based on session completion and duration
 */
function calculateProductivityScore(session: TimerSession): string {
  if (!session.completed) {
    return "Incomplete";
  }

  const targetDuration = session.duration;
  const actualDuration = session.endTime
    ? Math.floor(
        (new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime()) /
          1000
      )
    : session.duration;

  const completionRatio = Math.min(actualDuration / targetDuration, 1);

  if (completionRatio >= 0.95) {
    return "Excellent (95%+)";
  } else if (completionRatio >= 0.8) {
    return "Good (80%+)";
  } else if (completionRatio >= 0.6) {
    return "Fair (60%+)";
  } else {
    return "Needs Improvement";
  }
}

/**
 * Component for displaying session statistics in a compact format
 */
interface SessionStatsProps {
  session: TimerSession;
  moodEntries: MoodEntry[];
}

export function SessionStats({ session, moodEntries }: SessionStatsProps) {
  const associatedMoodEntries = moodEntries.filter(
    (entry) => entry.sessionId === session.id
  );

  const stats = {
    duration: session.endTime
      ? Math.floor(
          (new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime()) /
            1000
        )
      : session.duration,
    completed: session.completed,
    moodCount: associatedMoodEntries.length,
    appCount: session.applicationUsage?.length || 0,
    hasNotes: !!session.notes,
    hasTags: !!(session.tags && session.tags.length > 0),
  };

  return (
    <div className="session-stats">
      <span>{formatTime(stats.duration)}</span>
      {stats.completed && <span>✓</span>}
      {stats.moodCount > 0 && <span>♥ {stats.moodCount}</span>}
      {stats.appCount > 0 && <span>📱 {stats.appCount}</span>}
      {stats.hasNotes && <span>📝</span>}
      {stats.hasTags && <span>🏷️</span>}
    </div>
  );
}
