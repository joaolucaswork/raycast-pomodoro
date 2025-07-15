import {
  Action,
  ActionPanel,
  Form,
  Icon,
  useNavigation,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { useTimerStore } from "../../store/timer-store";
import { TimerSession } from "../../types/timer";
import { ACTION_ICONS } from "../../constants/design-tokens";
import { createTaskIconSelectionActions } from "../icons/inline-icon-selection";

interface SessionBasicFormProps {
  session: TimerSession;
  onSessionUpdated?: () => void;
}

export function SessionBasicForm({
  session,
  onSessionUpdated,
}: SessionBasicFormProps) {
  const { updateSessionName, updateSessionNotes, updateSessionIcon } =
    useTimerStore();
  const { pop } = useNavigation();

  const [taskName, setTaskName] = useState(session.taskName || "");
  const [notes, setNotes] = useState(session.notes || "");
  const [selectedIcon, setSelectedIcon] = useState<Icon | undefined>(
    session.taskIcon
  );

  const handleSubmit = () => {
    // Update all basic session fields
    updateSessionName(session.id, taskName || undefined);
    updateSessionNotes(session.id, notes || undefined);
    updateSessionIcon(session.id, selectedIcon);

    showToast({
      style: Toast.Style.Success,
      title: "Session Updated",
      message: "Basic session details have been saved",
    });

    if (onSessionUpdated) {
      onSessionUpdated();
    }

    pop();
  };

  const handleClearIcon = () => {
    setSelectedIcon(undefined);
  };

  return (
    <Form
      navigationTitle="Edit Session Details"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Changes"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />

          {createTaskIconSelectionActions(
            (icon) => setSelectedIcon(icon),
            selectedIcon
          )}

          <ActionPanel.Section title="Actions">
            <Action
              title="Clear Icon"
              icon={Icon.XMarkCircle}
              onAction={handleClearIcon}
              style={Action.Style.Destructive}
            />
            <Action
              title="Cancel"
              icon={ACTION_ICONS.BACK}
              onAction={() => pop()}
              shortcut={{ modifiers: ["cmd"], key: "escape" }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextField
        id="taskName"
        title="Session Name"
        placeholder="Enter a name for this session..."
        value={taskName}
        onChange={setTaskName}
        info="Give this session a descriptive name to help you remember what you worked on"
      />

      <Form.TextArea
        id="notes"
        title="Notes"
        placeholder="Add any notes or reflections about this session..."
        value={notes}
        onChange={setNotes}
        info="Optional notes to help you remember details about this session"
      />

      <Form.Separator />

      <Form.Description
        title="Current Icon"
        text={selectedIcon ? "Icon selected" : "No icon selected"}
      />

      <Form.Description
        title="Session Details"
        text={`${session.completed ? "Completed" : "Incomplete"} • ${new Date(session.startTime).toLocaleDateString()}`}
      />

      <Form.Description
        title="Instructions"
        text="Use the action menu to select an icon category and choose a new icon for this session"
      />
    </Form>
  );
}

// Individual form components for specific editing tasks

interface SessionNotesFormProps {
  session: TimerSession;
  onNotesUpdated?: (notes: string) => void;
}

export function SessionNotesForm({
  session,
  onNotesUpdated,
}: SessionNotesFormProps) {
  const { updateSessionNotes } = useTimerStore();
  const { pop } = useNavigation();
  const [notes, setNotes] = useState(session.notes || "");

  const handleSubmit = () => {
    updateSessionNotes(session.id, notes || undefined);

    if (onNotesUpdated) {
      onNotesUpdated(notes);
    }

    pop();
  };

  return (
    <Form
      navigationTitle="Edit Session Notes"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Notes"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
          <Action
            title="Cancel"
            icon={ACTION_ICONS.BACK}
            onAction={() => pop()}
            shortcut={{ modifiers: ["cmd"], key: "escape" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="notes"
        title="Session Notes"
        placeholder="Add your thoughts, reflections, or notes about this focus session..."
        value={notes}
        onChange={setNotes}
        info="Use this space to capture insights, challenges, or achievements from your focus session"
      />

      <Form.Description
        title="Session Details"
        text={`${session.taskName || "Untitled Session"} • ${
          session.completed ? "Completed" : "Incomplete"
        } • ${new Date(session.startTime).toLocaleDateString()}`}
      />
    </Form>
  );
}

interface SessionNameFormProps {
  session: TimerSession;
  onNameUpdated?: (name: string) => void;
}

export function SessionNameForm({
  session,
  onNameUpdated,
}: SessionNameFormProps) {
  const { updateSessionName } = useTimerStore();
  const { pop } = useNavigation();
  const [taskName, setTaskName] = useState(session.taskName || "");

  const handleSubmit = () => {
    updateSessionName(session.id, taskName || undefined);

    if (onNameUpdated) {
      onNameUpdated(taskName);
    }

    pop();
  };

  return (
    <Form
      navigationTitle="Edit Session Name"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Name"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
          <Action
            title="Cancel"
            icon={ACTION_ICONS.BACK}
            onAction={() => pop()}
            shortcut={{ modifiers: ["cmd"], key: "escape" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="taskName"
        title="Session Name"
        placeholder="Enter a name for this session..."
        value={taskName}
        onChange={setTaskName}
        info="Give this session a descriptive name to help you remember what you worked on"
      />

      <Form.Description
        title="Session Details"
        text={`${session.completed ? "Completed" : "Incomplete"} • ${new Date(session.startTime).toLocaleDateString()}`}
      />
    </Form>
  );
}

interface SessionIconFormProps {
  session: TimerSession;
  onIconUpdated?: (icon?: Icon) => void;
}

export function SessionIconForm({
  session,
  onIconUpdated,
}: SessionIconFormProps) {
  const { updateSessionIcon } = useTimerStore();
  const { pop } = useNavigation();
  const [selectedIcon, setSelectedIcon] = useState<Icon | undefined>(
    session.taskIcon
  );

  const handleIconSelect = (icon: Icon) => {
    setSelectedIcon(icon);
    updateSessionIcon(session.id, icon);

    if (onIconUpdated) {
      onIconUpdated(icon);
    }

    pop();
  };

  const handleClearIcon = () => {
    setSelectedIcon(undefined);
    updateSessionIcon(session.id, undefined);

    if (onIconUpdated) {
      onIconUpdated(undefined);
    }

    pop();
  };

  return (
    <Form
      navigationTitle="Edit Session Icon"
      actions={
        <ActionPanel>
          {createTaskIconSelectionActions(handleIconSelect, selectedIcon)}

          <ActionPanel.Section title="Actions">
            <Action
              title="Clear Icon"
              icon={Icon.XMarkCircle}
              onAction={handleClearIcon}
              style={Action.Style.Destructive}
            />
            <Action
              title="Cancel"
              icon={ACTION_ICONS.BACK}
              onAction={() => pop()}
              shortcut={{ modifiers: ["cmd"], key: "escape" }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.Description
        title="Current Icon"
        text={selectedIcon ? "Icon selected" : "No icon selected"}
      />

      <Form.Description
        title="Session Details"
        text={`${session.taskName || "Untitled Session"} • ${
          session.completed ? "Completed" : "Incomplete"
        } • ${new Date(session.startTime).toLocaleDateString()}`}
      />

      <Form.Description
        title="Instructions"
        text="Use the action menu to select an icon category and choose a new icon for this session"
      />
    </Form>
  );
}
