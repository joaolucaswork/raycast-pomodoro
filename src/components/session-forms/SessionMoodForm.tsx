import {
  Action,
  ActionPanel,
  Form,
  useNavigation,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { useTimerStore } from "../../store/timer-store";
import { TimerSession, MoodType, MoodEntry } from "../../types/timer";
import {
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
  getMoodContextIcon,
} from "../../constants/design-tokens";

interface SessionMoodFormProps {
  session: TimerSession;
  onMoodAdded?: (entry: MoodEntry) => void;
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
  { value: "pre-session", title: "Before Session", description: "How you felt before starting" },
  { value: "during-session", title: "During Session", description: "How you felt while working" },
  { value: "post-session", title: "After Session", description: "How you feel after completing" },
  { value: "standalone", title: "General Check-in", description: "Independent mood logging" },
];

export function SessionMoodForm({
  session,
  onMoodAdded,
}: SessionMoodFormProps) {
  const { addMoodEntry, moodEntries } = useTimerStore();
  const { pop } = useNavigation();

  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral");
  const [intensity, setIntensity] = useState<string>("3");
  const [context, setContext] = useState<string>("post-session");
  const [notes, setNotes] = useState<string>("");

  // Find existing mood entries for this session
  const existingMoodEntries = moodEntries.filter(
    (entry) => entry.sessionId === session.id
  );

  const handleSubmit = () => {
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
      notes || undefined
    );

    showToast({
      style: Toast.Style.Success,
      title: "Mood Entry Added",
      message: `${selectedMood} (${intensityNum}/5) recorded for this session`,
    });

    if (onMoodAdded) {
      const newEntry: MoodEntry = {
        id: Date.now().toString(), // Temporary ID for callback
        mood: selectedMood,
        intensity: intensityNum,
        timestamp: new Date(),
        sessionId: session.id,
        notes: notes || undefined,
        context: contextValue,
      };
      onMoodAdded(newEntry);
    }

    pop();
  };

  return (
    <Form
      navigationTitle="Add Mood Entry"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Add Mood Entry"
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
        id="notes"
        title="Notes (Optional)"
        placeholder="Add any additional notes about your mood during this session..."
        value={notes}
        onChange={setNotes}
        info="Optional notes to help you remember what influenced this mood"
      />

      <Form.Separator />

      <Form.Description
        title="Session Details"
        text={`${session.taskName || "Untitled Session"} • ${
          session.completed ? "Completed" : "Incomplete"
        } • ${new Date(session.startTime).toLocaleDateString()}`}
      />

      {existingMoodEntries.length > 0 && (
        <Form.Description
          title="Existing Mood Entries"
          text={`This session has ${existingMoodEntries.length} mood ${
            existingMoodEntries.length === 1 ? "entry" : "entries"
          } already recorded`}
        />
      )}

      <Form.Description
        title="Mood Tracking"
        text="Track your emotional state to identify patterns and optimize your focus sessions"
      />
    </Form>
  );
}

// Component for displaying existing mood entries for a session
interface SessionMoodDisplayProps {
  session: TimerSession;
  moodEntries: MoodEntry[];
}

export function SessionMoodDisplay({
  session,
  moodEntries,
}: SessionMoodDisplayProps) {
  const sessionMoodEntries = moodEntries.filter(
    (entry) => entry.sessionId === session.id
  );

  if (sessionMoodEntries.length === 0) {
    return (
      <Form.Description
        title="Mood Entries"
        text="No mood entries recorded for this session"
      />
    );
  }

  return (
    <>
      <Form.Description
        title="Mood Entries"
        text={`${sessionMoodEntries.length} mood ${
          sessionMoodEntries.length === 1 ? "entry" : "entries"
        } recorded for this session`}
      />
      
      {sessionMoodEntries.map((entry, index) => (
        <Form.Description
          key={entry.id}
          title={`Mood ${index + 1}`}
          text={`${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} (${
            entry.intensity
          }/5) - ${entry.context}${entry.notes ? ` • ${entry.notes}` : ""}`}
        />
      ))}
    </>
  );
}

// Quick mood selector for common moods
interface QuickSessionMoodProps {
  session: TimerSession;
  onMoodSelected: (mood: MoodType, intensity: 1 | 2 | 3 | 4 | 5) => void;
}

export function QuickSessionMood({
  session,
  onMoodSelected,
}: QuickSessionMoodProps) {
  const { addMoodEntry } = useTimerStore();
  const { pop } = useNavigation();

  const quickMoods = [
    { mood: "focused" as MoodType, intensity: 4 as const, label: "Focused (4/5)" },
    { mood: "energized" as MoodType, intensity: 4 as const, label: "Energized (4/5)" },
    { mood: "calm" as MoodType, intensity: 3 as const, label: "Calm (3/5)" },
    { mood: "neutral" as MoodType, intensity: 3 as const, label: "Neutral (3/5)" },
    { mood: "tired" as MoodType, intensity: 3 as const, label: "Tired (3/5)" },
    { mood: "stressed" as MoodType, intensity: 3 as const, label: "Stressed (3/5)" },
  ];

  const handleQuickMood = (mood: MoodType, intensity: 1 | 2 | 3 | 4 | 5) => {
    addMoodEntry(mood, intensity, "post-session", session.id);
    
    showToast({
      style: Toast.Style.Success,
      title: "Quick Mood Logged",
      message: `${mood} (${intensity}/5) recorded`,
    });

    onMoodSelected(mood, intensity);
    pop();
  };

  return (
    <Form
      navigationTitle="Quick Mood Log"
      actions={
        <ActionPanel>
          <Action
            title="Cancel"
            icon={ACTION_ICONS.BACK}
            onAction={() => pop()}
            shortcut={{ modifiers: ["cmd"], key: "escape" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Quick Mood Selection"
        text="Select a common mood to quickly log your state for this session"
      />

      {quickMoods.map((item) => (
        <Form.Description
          key={`${item.mood}-${item.intensity}`}
          title={item.label}
          text={`Click to log ${item.mood} at ${item.intensity}/5 intensity`}
        />
      ))}

      <Form.Separator />

      <Form.Description
        title="Session Details"
        text={`${session.taskName || "Untitled Session"} • ${
          session.completed ? "Completed" : "Incomplete"
        } • ${new Date(session.startTime).toLocaleDateString()}`}
      />
    </Form>
  );
}
