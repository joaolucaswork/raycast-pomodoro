// Re-export all session form components from the new modular structure
export {
  SessionBasicForm,
  SessionNotesForm,
  SessionNameForm,
  SessionIconForm,
  SessionMoodForm,
  SessionMoodDisplay,
  QuickSessionMood,
  SessionTagsForm,
  SessionTagsDisplay,
  QuickTagSelector,
  BulkTagOperations,
} from "./session-forms";

// Re-export types for backward compatibility
export type { TimerSession, MoodType, MoodEntry } from "../types/timer";

// Keep the comprehensive SessionManagementForm for backward compatibility
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
import { TimerSession, MoodType, MoodEntry } from "../types/timer";
import {
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
  getMoodContextIcon,
} from "../constants/design-tokens";
import { createTaskIconSelectionActions } from "./icons/inline-icon-selection";

// Comprehensive session management form that combines all editing functionality
interface SessionManagementFormProps {
  session: TimerSession;
  onSessionUpdated?: () => void;
}

export function SessionManagementForm({
  session,
  onSessionUpdated,
}: SessionManagementFormProps) {
  const {
    updateSessionIcon,
    updateSessionNotes,
    updateSessionName,
    addMoodEntry,
    moodEntries,
  } = useTimerStore();
  const { pop } = useNavigation();

  const [taskName, setTaskName] = useState(session.taskName || "");
  const [notes, setNotes] = useState(session.notes || "");
  const [selectedIcon, setSelectedIcon] = useState<Icon | undefined>(
    session.taskIcon
  );

  // Mood tracking state
  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral");
  const [intensity, setIntensity] = useState<string>("3");
  const [context, setContext] = useState<string>("post-session");
  const [moodNotes, setMoodNotes] = useState<string>("");
  const [addMoodEntry_enabled, setAddMoodEntryEnabled] =
    useState<boolean>(false);

  // Find existing mood entries for this session
  const existingMoodEntries = moodEntries.filter(
    (entry) => entry.sessionId === session.id
  );

  const handleSubmit = () => {
    // Update all session fields at once
    updateSessionName(session.id, taskName || undefined);
    updateSessionNotes(session.id, notes || undefined);
    updateSessionIcon(session.id, selectedIcon);

    // Add mood entry if enabled
    if (addMoodEntry_enabled) {
      const intensityNum = parseInt(intensity) as 1 | 2 | 3 | 4 | 5;
      const contextValue = context as
        | "pre-session"
        | "during-session"
        | "post-session"
        | "standalone";

      addMoodEntry(
        selectedMood,
        intensityNum,
        contextValue,
        session.id,
        moodNotes || undefined
      );
    }

    showToast({
      style: Toast.Style.Success,
      title: addMoodEntry_enabled
        ? "Session & Mood Updated"
        : "Session Updated",
      message: addMoodEntry_enabled
        ? "Session details and mood entry saved"
        : "All changes have been saved",
    });

    if (onSessionUpdated) {
      onSessionUpdated();
    }

    pop();
  };

  const handleClearIcon = () => {
    setSelectedIcon(undefined);
  };

  const moodOptions = [
    { value: "energized", title: "Energized" },
    { value: "focused", title: "Focused" },
    { value: "calm", title: "Calm" },
    { value: "motivated", title: "Motivated" },
    { value: "neutral", title: "Neutral" },
    { value: "tired", title: "Tired" },
    { value: "stressed", title: "Stressed" },
    { value: "overwhelmed", title: "Overwhelmed" },
    { value: "distracted", title: "Distracted" },
  ] as const;

  const intensityOptions = [
    { value: "1", title: "1 - Very Low" },
    { value: "2", title: "2 - Low" },
    { value: "3", title: "3 - Moderate" },
    { value: "4", title: "4 - High" },
    { value: "5", title: "5 - Very High" },
  ];

  const contextOptions = [
    { value: "pre-session", title: "Before Session" },
    { value: "during-session", title: "During Session" },
    { value: "post-session", title: "After Session" },
    { value: "standalone", title: "General Check-in" },
  ];

  return (
    <Form
      navigationTitle="Manage Session"
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

      <Form.Checkbox
        id="addMoodEntry"
        title="Add Mood Entry"
        label="Track your mood for this session"
        value={addMoodEntry_enabled}
        onChange={setAddMoodEntryEnabled}
        info="Enable this to add a mood entry linked to this session"
      />

      {addMoodEntry_enabled && (
        <>
          <Form.Dropdown
            id="mood"
            title="Current Mood"
            value={selectedMood}
            onChange={(value) => setSelectedMood(value as MoodType)}
            info="Select the mood that best describes how you're feeling about this session"
          >
            {moodOptions.map((option) => (
              <Form.Dropdown.Item
                key={option.value}
                value={option.value}
                title={option.title}
                icon={{
                  source: getMoodIcon(option.value),
                  tintColor: getMoodColor(option.value),
                }}
              />
            ))}
          </Form.Dropdown>

          <Form.Dropdown
            id="intensity"
            title="Intensity Level"
            value={intensity}
            onChange={setIntensity}
            info="Rate the intensity of this mood from 1 (very low) to 5 (very high)"
          >
            {intensityOptions.map((option) => (
              <Form.Dropdown.Item
                key={option.value}
                value={option.value}
                title={option.title}
              />
            ))}
          </Form.Dropdown>

          <Form.Dropdown
            id="context"
            title="Context"
            value={context}
            onChange={setContext}
            info="When are you logging this mood in relation to the session?"
          >
            {contextOptions.map((option) => (
              <Form.Dropdown.Item
                key={option.value}
                value={option.value}
                title={option.title}
              />
            ))}
          </Form.Dropdown>

          <Form.TextArea
            id="moodNotes"
            title="Mood Notes (Optional)"
            placeholder="Add any additional notes about your mood during this session..."
            value={moodNotes}
            onChange={setMoodNotes}
            info="Optional notes to help you remember what influenced this mood"
          />
        </>
      )}

      {existingMoodEntries.length > 0 && (
        <Form.Description
          title="Existing Mood Entries"
          text={`This session has ${existingMoodEntries.length} mood ${existingMoodEntries.length === 1 ? "entry" : "entries"} already recorded`}
        />
      )}

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
