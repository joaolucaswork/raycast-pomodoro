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
import { useTimerStore } from "../store/timer-store";
import { TimerSession } from "../types/timer";
import { ACTION_ICONS } from "../constants/design-tokens";

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

    // Toast disabled for Windows compatibility
    // showToast({
    //   style: Toast.Style.Success,
    //   title: "Notes Updated",
    //   message: "Session notes have been saved",
    // });

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

    // Toast disabled for Windows compatibility
    // showToast({
    //   style: Toast.Style.Success,
    //   title: "Icon Updated",
    //   message: "Session icon has been changed",
    // });

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
          <ActionPanel.Section title="Icon Categories">
            {/* Work & Productivity Icons */}
            <ActionPanel.Submenu title="Work & Productivity" icon={Icon.Folder}>
              <Action
                title="Folder"
                icon={Icon.Folder}
                onAction={() => handleIconSelect(Icon.Folder)}
              />
              <Action
                title="Hammer"
                icon={Icon.Hammer}
                onAction={() => handleIconSelect(Icon.Hammer)}
              />
              <Action
                title="Tools"
                icon={Icon.Gear}
                onAction={() => handleIconSelect(Icon.Gear)}
              />
              <Action
                title="Gear"
                icon={Icon.Gear}
                onAction={() => handleIconSelect(Icon.Gear)}
              />
              <Action
                title="Terminal"
                icon={Icon.Terminal}
                onAction={() => handleIconSelect(Icon.Terminal)}
              />
              <Action
                title="Code"
                icon={Icon.Code}
                onAction={() => handleIconSelect(Icon.Code)}
              />
              <Action
                title="Desktop"
                icon={Icon.Desktop}
                onAction={() => handleIconSelect(Icon.Desktop)}
              />
              <Action
                title="Computer"
                icon={Icon.ComputerChip}
                onAction={() => handleIconSelect(Icon.ComputerChip)}
              />
            </ActionPanel.Submenu>

            {/* Learning & Study Icons */}
            <ActionPanel.Submenu title="Learning & Study" icon={Icon.Book}>
              <Action
                title="Book"
                icon={Icon.Book}
                onAction={() => handleIconSelect(Icon.Book)}
              />
              <Action
                title="Bookmark"
                icon={Icon.Bookmark}
                onAction={() => handleIconSelect(Icon.Bookmark)}
              />
              <Action
                title="Academy"
                icon={Icon.Book}
                onAction={() => handleIconSelect(Icon.Book)}
              />
              <Action
                title="Pencil"
                icon={Icon.Pencil}
                onAction={() => handleIconSelect(Icon.Pencil)}
              />
              <Action
                title="Document"
                icon={Icon.Document}
                onAction={() => handleIconSelect(Icon.Document)}
              />
              <Action
                title="Text"
                icon={Icon.Text}
                onAction={() => handleIconSelect(Icon.Text)}
              />
              <Action
                title="QuestionMark"
                icon={Icon.QuestionMark}
                onAction={() => handleIconSelect(Icon.QuestionMark)}
              />
            </ActionPanel.Submenu>

            {/* Creative Icons */}
            <ActionPanel.Submenu title="Creative" icon={Icon.Brush}>
              <Action
                title="Brush"
                icon={Icon.Brush}
                onAction={() => handleIconSelect(Icon.Brush)}
              />
              <Action
                title="Image"
                icon={Icon.Image}
                onAction={() => handleIconSelect(Icon.Image)}
              />
              <Action
                title="Video"
                icon={Icon.Video}
                onAction={() => handleIconSelect(Icon.Video)}
              />
              <Action
                title="Music"
                icon={Icon.Music}
                onAction={() => handleIconSelect(Icon.Music)}
              />
              <Action
                title="Camera"
                icon={Icon.Camera}
                onAction={() => handleIconSelect(Icon.Camera)}
              />
              <Action
                title="Microphone"
                icon={Icon.Microphone}
                onAction={() => handleIconSelect(Icon.Microphone)}
              />
              <Action
                title="Colors"
                icon={Icon.EyeDropper}
                onAction={() => handleIconSelect(Icon.EyeDropper)}
              />
            </ActionPanel.Submenu>

            {/* Planning & Organization Icons */}
            <ActionPanel.Submenu
              title="Planning & Organization"
              icon={Icon.Calendar}
            >
              <Action
                title="Calendar"
                icon={Icon.Calendar}
                onAction={() => handleIconSelect(Icon.Calendar)}
              />
              <Action
                title="Clock"
                icon={Icon.Clock}
                onAction={() => handleIconSelect(Icon.Clock)}
              />
              <Action
                title="List"
                icon={Icon.List}
                onAction={() => handleIconSelect(Icon.List)}
              />
              <Action
                title="CheckList"
                icon={Icon.CheckList}
                onAction={() => handleIconSelect(Icon.CheckList)}
              />
              <Action
                title="Target"
                icon={Icon.BullsEye}
                onAction={() => handleIconSelect(Icon.BullsEye)}
              />
              <Action
                title="BullsEye"
                icon={Icon.BullsEye}
                onAction={() => handleIconSelect(Icon.BullsEye)}
              />
              <Action
                title="Flag"
                icon={Icon.Flag}
                onAction={() => handleIconSelect(Icon.Flag)}
              />
            </ActionPanel.Submenu>

            {/* Personal Icons */}
            <ActionPanel.Submenu title="Personal" icon={Icon.Heart}>
              <Action
                title="Heart"
                icon={Icon.Heart}
                onAction={() => handleIconSelect(Icon.Heart)}
              />
              <Action
                title="Person"
                icon={Icon.Person}
                onAction={() => handleIconSelect(Icon.Person)}
              />
              <Action
                title="House"
                icon={Icon.House}
                onAction={() => handleIconSelect(Icon.House)}
              />
              <Action
                title="Leaf"
                icon={Icon.Leaf}
                onAction={() => handleIconSelect(Icon.Leaf)}
              />
              <Action
                title="Heartbeat"
                icon={Icon.Heartbeat}
                onAction={() => handleIconSelect(Icon.Heartbeat)}
              />
              <Action
                title="Sun"
                icon={Icon.Sun}
                onAction={() => handleIconSelect(Icon.Sun)}
              />
              <Action
                title="Moon"
                icon={Icon.Moon}
                onAction={() => handleIconSelect(Icon.Moon)}
              />
            </ActionPanel.Submenu>
          </ActionPanel.Section>

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
        text="Select an icon category from the actions menu to choose a new icon for this session"
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
