import { List, Icon, Color } from "@raycast/api";
import { format } from "date-fns";
import { TimerSession, SessionType, MoodEntry } from "../../types/timer";
import {
  formatTime,
  getSessionTypeLabel,
  getSessionTypeIcon,
} from "../../utils/helpers";
import {
  getSessionColor,
  getSessionStateDot,
  STATUS_COLORS,
} from "../../constants/design-tokens";
import { SessionMoodIndicators } from "./SessionMoodIndicators";

export interface SessionListItemProps {
  /** The timer session to display */
  session: TimerSession;
  /** Array of mood entries associated with this session */
  moodEntries: MoodEntry[];
  /** Whether to show the detail view */
  showDetail?: boolean;
  /** Detail view component to render */
  detailComponent?: React.ReactNode;
  /** Function to get tag color for a given tag name */
  getTagColor: (tag: string) => Color;
  /** Actions to display in the action panel */
  actions?: React.ReactNode;
}

/**
 * Renders a single session item in the history list with all associated information.
 * Displays session title, subtitle, icon, and various accessories including mood indicators.
 */
export function SessionListItem({
  session,
  moodEntries,
  showDetail = false,
  detailComponent,
  getTagColor,
  actions,
}: SessionListItemProps) {
  const hasAppData =
    session.applicationUsage && session.applicationUsage.length > 0;
  const sessionIcon = getSessionTypeIcon(session.type);
  const sessionColor = getSessionColor(session.type, session.completed);
  const statusDot = getSessionStateDot(
    session.type,
    session.completed,
    false,
    false,
    session.endReason
  );

  // Filter mood entries for this specific session
  const sessionMoodEntries = moodEntries.filter(
    (entry) => entry.sessionId === session.id
  );

  return (
    <List.Item
      key={session.id}
      title={getSessionDisplayTitle(session)}
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
        // Show mood information using the dedicated component
        ...SessionMoodIndicators({ moodEntries: sessionMoodEntries }),
        // Show session duration
        {
          text: formatTime(session.duration),
          tooltip: `Session duration: ${formatTime(session.duration)}`,
        },
        // Show application usage indicator
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
        // Show session status
        {
          icon: {
            source: statusDot.icon,
            tintColor: statusDot.tintColor,
          },
          tooltip: getStatusTooltip(session),
        },
      ]}
      detail={showDetail ? detailComponent : undefined}
      actions={actions}
    />
  );
}

/**
 * Gets the display title for a timer session.
 * For work sessions, shows task name if available, otherwise falls back to session type.
 *
 * @param session - The timer session to get title for
 * @returns The display title string
 */
function getSessionDisplayTitle(session: TimerSession): string {
  // Show task name for work sessions to improve scanability
  if (session.type === SessionType.WORK && session.taskName) {
    return session.taskName;
  }

  // For all other cases, use the standard session type label
  return getSessionTypeLabel(session.type);
}

/**
 * Gets the subtitle for a timer session showing time range and context.
 *
 * @param session - The timer session to get subtitle for
 * @returns The formatted subtitle string
 */
function getSessionSubtitle(session: TimerSession): string {
  const startTime = format(new Date(session.startTime), "HH:mm");
  const endTime = session.endTime
    ? format(new Date(session.endTime), "HH:mm")
    : null;

  let subtitle = endTime
    ? `${startTime} - ${endTime}`
    : `${startTime} (ongoing)`;

  // For work sessions, don't repeat task name in subtitle since it's now in the title
  if (session.type === SessionType.WORK && session.taskName) {
    // Only add project name if available
    if (session.projectName) {
      subtitle += ` • ${session.projectName}`;
    }
  } else {
    // For non-work sessions or work sessions without task names, keep original logic
    if (session.taskName) {
      subtitle += ` • ${session.taskName}`;
    }

    if (session.projectName) {
      subtitle += ` (${session.projectName})`;
    }
  }

  return subtitle;
}

/**
 * Gets the appropriate tooltip text for the session status indicator.
 *
 * @param session - The timer session
 * @returns The tooltip text describing the session status
 */
function getStatusTooltip(session: TimerSession): string {
  if (session.completed) {
    return "Session completed";
  }

  switch (session.endReason) {
    case "stopped":
      return "Session stopped early";
    case "skipped":
      return "Session skipped";
    default:
      return "Session incomplete";
  }
}
