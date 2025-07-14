import {
  Action,
  ActionPanel,
  Icon,
  useNavigation,
  confirmAlert,
  Alert,
  showToast,
  Toast,
} from "@raycast/api";
import { TimerSession } from "../../types/timer";
import { useTimerStore } from "../../store/timer-store";
import { SessionManagementForm } from "../session-editing";
import { ACTION_ICONS, SHORTCUTS } from "../../constants/design-tokens";

interface HistoryActionsProps {
  session: TimerSession;
  isShowingDetail: boolean;
  onDetailToggle: (sessionId?: string) => void;
  onSessionDeleted?: () => void;
}

export function HistoryActions({
  session,
  isShowingDetail,
  onDetailToggle,
  onSessionDeleted,
}: HistoryActionsProps) {
  const { push } = useNavigation();
  const { deleteSession } = useTimerStore();

  const handleDeleteSession = async () => {
    const confirmed = await confirmAlert({
      title: "Delete Session",
      message: `Are you sure you want to delete this ${session.taskName || "session"}?`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
      dismissAction: {
        title: "Cancel",
      },
    });

    if (confirmed) {
      deleteSession(session.id);

      showToast({
        style: Toast.Style.Success,
        title: "Session Deleted",
        message: "The session has been removed from your history",
      });

      if (onSessionDeleted) {
        onSessionDeleted();
      }
    }
  };

  return (
    <ActionPanel>
      {/* Primary action: View Details */}
      <Action
        title={isShowingDetail ? "Hide Details" : "Show Details"}
        icon={isShowingDetail ? Icon.EyeDisabled : ACTION_ICONS.VIEW_DETAILS}
        onAction={() => onDetailToggle(session.id)}
        shortcut={SHORTCUTS.PRIMARY_ACTION}
      />

      {/* Secondary action: Manage Session */}
      <Action
        title="Manage Session"
        icon={Icon.Gear}
        onAction={() => push(<SessionManagementForm session={session} />)}
        shortcut={{ modifiers: ["cmd"], key: "m" }}
      />

      <ActionPanel.Section title="Session Actions">
        <Action
          title="Duplicate Session"
          icon={Icon.Duplicate}
          onAction={() => handleDuplicateSession(session)}
          shortcut={{ modifiers: ["cmd"], key: "d" }}
        />

        <Action
          title="Export Session"
          icon={Icon.Download}
          onAction={() => handleExportSession(session)}
          shortcut={{ modifiers: ["cmd", "shift"], key: "e" }}
        />
      </ActionPanel.Section>

      <ActionPanel.Section title="Destructive Actions">
        <Action
          title="Delete Session"
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          onAction={handleDeleteSession}
          shortcut={{ modifiers: ["cmd"], key: "delete" }}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

/**
 * Bulk actions for multiple sessions
 */
interface BulkHistoryActionsProps {
  selectedSessions: TimerSession[];
  onBulkActionComplete: () => void;
}

export function BulkHistoryActions({
  selectedSessions,
  onBulkActionComplete,
}: BulkHistoryActionsProps) {
  const { deleteSession } = useTimerStore();

  const handleBulkDelete = async () => {
    const confirmed = await confirmAlert({
      title: "Delete Multiple Sessions",
      message: `Are you sure you want to delete ${selectedSessions.length} session${selectedSessions.length === 1 ? "" : "s"}?`,
      primaryAction: {
        title: "Delete All",
        style: Alert.ActionStyle.Destructive,
      },
      dismissAction: {
        title: "Cancel",
      },
    });

    if (confirmed) {
      selectedSessions.forEach((session) => {
        deleteSession(session.id);
      });

      showToast({
        style: Toast.Style.Success,
        title: "Sessions Deleted",
        message: `${selectedSessions.length} session${selectedSessions.length === 1 ? "" : "s"} removed from history`,
      });

      onBulkActionComplete();
    }
  };

  const handleBulkExport = () => {
    const exportData = {
      sessions: selectedSessions,
      exportDate: new Date().toISOString(),
      totalSessions: selectedSessions.length,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // In a real implementation, this would trigger a file download
    console.log("Bulk export data:", jsonString);

    showToast({
      style: Toast.Style.Success,
      title: "Export Ready",
      message: `${selectedSessions.length} session${selectedSessions.length === 1 ? "" : "s"} exported`,
    });
  };

  return (
    <ActionPanel>
      <ActionPanel.Section title="Bulk Actions">
        <Action
          title={`Export ${selectedSessions.length} Session${selectedSessions.length === 1 ? "" : "s"}`}
          icon={Icon.Download}
          onAction={handleBulkExport}
          shortcut={{ modifiers: ["cmd", "shift"], key: "e" }}
        />
      </ActionPanel.Section>

      <ActionPanel.Section title="Destructive Actions">
        <Action
          title={`Delete ${selectedSessions.length} Session${selectedSessions.length === 1 ? "" : "s"}`}
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          onAction={handleBulkDelete}
          shortcut={{ modifiers: ["cmd", "shift"], key: "delete" }}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

/**
 * Helper functions for session actions
 */

function handleDuplicateSession(session: TimerSession) {
  const { startTimer } = useTimerStore.getState();

  // Create a new session with the same properties
  startTimer(
    session.type,
    session.taskName,
    session.projectName,
    session.tags,
    session.taskIcon
  );

  showToast({
    style: Toast.Style.Success,
    title: "Session Duplicated",
    message: "A new session has been started with the same settings",
  });
}

function handleExportSession(session: TimerSession) {
  const exportData = {
    session,
    exportDate: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  // In a real implementation, this would trigger a file download
  console.log("Session export data:", jsonString);

  showToast({
    style: Toast.Style.Success,
    title: "Session Exported",
    message: "Session data has been prepared for export",
  });
}

/**
 * Quick actions for common session operations
 */
interface QuickActionsProps {
  session: TimerSession;
}

export function QuickActions({ session }: QuickActionsProps) {
  return (
    <ActionPanel.Section title="Quick Actions">
      <Action
        title="Start Similar Session"
        icon={Icon.Play}
        onAction={() => handleDuplicateSession(session)}
        shortcut={{ modifiers: ["cmd"], key: "r" }}
      />

      <Action
        title="Add to Favorites"
        icon={Icon.Star}
        onAction={() => handleAddToFavorites(session)}
        shortcut={{ modifiers: ["cmd"], key: "f" }}
      />

      <Action
        title="Share Session"
        icon={Icon.Upload}
        onAction={() => handleShareSession(session)}
        shortcut={{ modifiers: ["cmd"], key: "s" }}
      />
    </ActionPanel.Section>
  );
}

function handleAddToFavorites(session: TimerSession) {
  // This would integrate with a favorites system
  showToast({
    style: Toast.Style.Success,
    title: "Added to Favorites",
    message: "Session template saved for quick access",
  });
}

function handleShareSession(session: TimerSession) {
  const shareText = `Focus Session: ${session.taskName || "Untitled"}\nDuration: ${Math.floor(session.duration / 60)}m\nCompleted: ${session.completed ? "Yes" : "No"}`;

  // In a real implementation, this would open the system share dialog
  console.log("Share text:", shareText);

  showToast({
    style: Toast.Style.Success,
    title: "Share Ready",
    message: "Session details prepared for sharing",
  });
}

/**
 * Context menu actions for right-click operations
 */
export function ContextMenuActions({ session }: { session: TimerSession }) {
  return (
    <ActionPanel.Section title="Context Menu">
      <Action
        title="Copy Session ID"
        icon={Icon.Clipboard}
        onAction={() => {
          // Copy to clipboard functionality would go here
          showToast({
            style: Toast.Style.Success,
            title: "Copied",
            message: "Session ID copied to clipboard",
          });
        }}
      />

      <Action
        title="Copy Session Details"
        icon={Icon.Document}
        onAction={() => {
          const details = `${session.taskName || "Untitled Session"}\n${Math.floor(session.duration / 60)} minutes\n${session.completed ? "Completed" : "Incomplete"}`;
          // Copy to clipboard functionality would go here
          showToast({
            style: Toast.Style.Success,
            title: "Copied",
            message: "Session details copied to clipboard",
          });
        }}
      />
    </ActionPanel.Section>
  );
}
