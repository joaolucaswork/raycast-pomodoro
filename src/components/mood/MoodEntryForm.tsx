import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { useTimerStore } from "../../store/timer-store";
import { MoodType, MoodEntry } from "../../types/timer";
import {
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
} from "../../constants/design-tokens";

interface MoodEntryFormProps {
  sessionId?: string;
  defaultContext?:
    | "pre-session"
    | "during-session"
    | "post-session"
    | "standalone";
  onMoodLogged?: (entry: MoodEntry) => void;
  existingEntry?: MoodEntry;
  onMoodUpdated?: () => void;
}

const moodOptions = [
  { value: "energized", title: "Energized", description: "High energy and alertness" },
  { value: "focused", title: "Focused", description: "Clear mental clarity" },
  { value: "calm", title: "Calm", description: "Peaceful and relaxed" },
  { value: "motivated", title: "Motivated", description: "Ready to tackle tasks" },
  { value: "neutral", title: "Neutral", description: "Balanced emotional state" },
  { value: "tired", title: "Tired", description: "Low energy or fatigue" },
  { value: "stressed", title: "Stressed", description: "Feeling pressure or tension" },
  { value: "overwhelmed", title: "Overwhelmed", description: "Too much to handle" },
  { value: "distracted", title: "Distracted", description: "Difficulty concentrating" },
] as const;

const intensityOptions = [
  { value: "1", title: "1 - Very Low", description: "Barely noticeable" },
  { value: "2", title: "2 - Low", description: "Mild intensity" },
  { value: "3", title: "3 - Moderate", description: "Noticeable but manageable" },
  { value: "4", title: "4 - High", description: "Strong and prominent" },
  { value: "5", title: "5 - Very High", description: "Overwhelming intensity" },
];

const contextOptions = [
  { value: "pre-session", title: "Before Session", description: "How you feel before starting" },
  { value: "during-session", title: "During Session", description: "How you feel while working" },
  { value: "post-session", title: "After Session", description: "How you feel after completing" },
  { value: "standalone", title: "General Check-in", description: "Independent mood logging" },
];

export function MoodEntryForm({
  sessionId,
  defaultContext = "standalone",
  onMoodLogged,
  existingEntry,
  onMoodUpdated,
}: MoodEntryFormProps) {
  const { addMoodEntry, updateMoodEntry } = useTimerStore();
  const { pop } = useNavigation();

  const isEditing = !!existingEntry;

  const [selectedMood, setSelectedMood] = useState<MoodType>(
    existingEntry?.mood || "neutral"
  );
  const [intensity, setIntensity] = useState<string>(
    existingEntry?.intensity.toString() || "3"
  );
  const [context, setContext] = useState<string>(
    existingEntry?.context || defaultContext
  );
  const [notes, setNotes] = useState<string>(existingEntry?.notes || "");

  const handleSubmit = () => {
    const intensityNum = parseInt(intensity) as 1 | 2 | 3 | 4 | 5;
    const contextValue = context as
      | "pre-session"
      | "during-session"
      | "post-session"
      | "standalone";

    if (isEditing && existingEntry) {
      // Update existing mood entry
      updateMoodEntry(existingEntry.id, {
        mood: selectedMood,
        intensity: intensityNum,
        context: contextValue,
        sessionId,
        notes: notes || undefined,
      });

      showToast({
        style: Toast.Style.Success,
        title: "Mood Updated",
        message: `${selectedMood} (${intensityNum}/5) updated`,
      });

      if (onMoodUpdated) {
        onMoodUpdated();
      }
    } else {
      // Add new mood entry
      addMoodEntry(
        selectedMood,
        intensityNum,
        contextValue,
        sessionId,
        notes || undefined
      );

      showToast({
        style: Toast.Style.Success,
        title: "Mood Logged",
        message: `${selectedMood} (${intensityNum}/5) recorded`,
      });

      if (onMoodLogged) {
        const newEntry: MoodEntry = {
          id: Date.now().toString(), // Temporary ID for callback
          mood: selectedMood,
          intensity: intensityNum,
          timestamp: new Date(),
          sessionId,
          notes: notes || undefined,
          context: contextValue,
        };
        onMoodLogged(newEntry);
      }
    }

    pop();
  };

  return (
    <Form
      navigationTitle={isEditing ? "Edit Mood Entry" : "Log Your Mood"}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={isEditing ? "Update Mood" : "Log Mood"}
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
      <Form.Dropdown
        id="mood"
        title="Current Mood"
        value={selectedMood}
        onChange={(value) => setSelectedMood(value as MoodType)}
        info="Select the mood that best describes how you're feeling right now"
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
        info="When are you logging this mood?"
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
        id="notes"
        title="Notes (Optional)"
        placeholder="Add any additional notes about your mood..."
        value={notes}
        onChange={setNotes}
        info="Optional notes to help you remember what influenced this mood"
      />
    </Form>
  );
}

// Legacy exports for backward compatibility
export const MoodLoggingForm = MoodEntryForm;
export const MoodManagementForm = MoodEntryForm;
