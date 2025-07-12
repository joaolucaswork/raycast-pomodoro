import {
  Action,
  ActionPanel,
  Form,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { MoodEntryDetail } from "./mood-entry-detail";
import { useState } from "react";
import { useTimerStore } from "../store/timer-store";
import { MoodType, MoodEntry } from "../types/timer";
import {
  MOOD_ICONS,
  MOOD_COLORS,
  ACTION_ICONS,
  STATUS_COLORS,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
  getMoodContextIcon,
} from "../constants/design-tokens";
import { formatDistanceToNow } from "date-fns";

interface MoodLoggingFormProps {
  sessionId?: string;
  defaultContext?:
    | "pre-session"
    | "during-session"
    | "post-session"
    | "standalone";
  onMoodLogged?: (entry: MoodEntry) => void;
}

export function MoodLoggingForm({
  sessionId,
  defaultContext = "standalone",
  onMoodLogged,
}: MoodLoggingFormProps) {
  const { addMoodEntry } = useTimerStore();
  const { pop } = useNavigation();

  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral");
  const [intensity, setIntensity] = useState<string>("3");
  const [context, setContext] = useState<string>(defaultContext);
  const [notes, setNotes] = useState<string>("");

  const moodOptions: { value: MoodType; title: string; description: string }[] =
    [
      {
        value: "energized",
        title: "Energized",
        description: "Feeling full of energy and ready to tackle tasks",
      },
      {
        value: "focused",
        title: "Focused",
        description: "Clear mind, able to concentrate well",
      },
      {
        value: "calm",
        title: "Calm",
        description: "Peaceful and relaxed state",
      },
      {
        value: "motivated",
        title: "Motivated",
        description: "Driven and enthusiastic about work",
      },
      {
        value: "neutral",
        title: "Neutral",
        description: "Balanced, neither positive nor negative",
      },
      {
        value: "tired",
        title: "Tired",
        description: "Low energy, feeling fatigued",
      },
      {
        value: "stressed",
        title: "Stressed",
        description: "Feeling pressure or tension",
      },
      {
        value: "overwhelmed",
        title: "Overwhelmed",
        description: "Too much to handle, feeling swamped",
      },
      {
        value: "distracted",
        title: "Distracted",
        description: "Difficulty maintaining focus",
      },
    ];

  const intensityOptions = [
    { value: "1", title: "Very Low (1/5)", description: "Barely noticeable" },
    { value: "2", title: "Low (2/5)", description: "Mild intensity" },
    {
      value: "3",
      title: "Moderate (3/5)",
      description: "Noticeable but manageable",
    },
    { value: "4", title: "High (4/5)", description: "Strong and prominent" },
    {
      value: "5",
      title: "Very High (5/5)",
      description: "Overwhelming intensity",
    },
  ];

  const contextOptions = [
    {
      value: "pre-session",
      title: "Before Session",
      description: "How you feel before starting work",
    },
    {
      value: "during-session",
      title: "During Session",
      description: "How you feel while working",
    },
    {
      value: "post-session",
      title: "After Session",
      description: "How you feel after completing work",
    },
    {
      value: "standalone",
      title: "General Check-in",
      description: "Independent mood tracking",
    },
  ];

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

    pop();
  };

  return (
    <Form
      navigationTitle="Log Your Mood"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Log Mood"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
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
        info="How strongly are you experiencing this mood?"
      >
        {intensityOptions.map((option) => (
          <Form.Dropdown.Item
            key={option.value}
            value={option.value}
            title={option.title}
            icon={{
              source: Icon.Circle,
              tintColor: getMoodIntensityColor(
                parseInt(option.value) as 1 | 2 | 3 | 4 | 5
              ),
            }}
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
            icon={{
              source: getMoodContextIcon(option.value),
              tintColor: STATUS_COLORS.INFO,
            }}
          />
        ))}
      </Form.Dropdown>

      <Form.TextArea
        id="notes"
        title="Notes (Optional)"
        placeholder="Any additional thoughts or context about your mood..."
        value={notes}
        onChange={setNotes}
        info="Optional notes to help you remember what influenced this mood"
      />
    </Form>
  );
}

interface MoodHistoryListProps {
  moodEntries: MoodEntry[];
  onDeleteEntry?: (entryId: string) => void;
  showSessionLink?: boolean;
}

export function MoodHistoryList({
  moodEntries,
  onDeleteEntry,
  showSessionLink = false,
}: MoodHistoryListProps) {
  const { push } = useNavigation();
  const sortedEntries = [...moodEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (moodEntries.length === 0) {
    return (
      <List.EmptyView
        title="No mood entries yet"
        description="Start tracking your mood to see patterns and insights"
        icon={Icon.Heart}
      />
    );
  }

  return (
    <>
      {sortedEntries.map((entry) => (
        <List.Item
          key={entry.id}
          title={`${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}`}
          subtitle={`${formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })} • ${entry.context.replace("-", " ")}`}
          icon={{
            source: getMoodIcon(entry.mood),
            tintColor: getMoodColor(entry.mood),
          }}
          accessories={[
            {
              text: `${entry.intensity}/5`,
              tooltip: `Intensity: ${entry.intensity}/5`,
            },
            {
              icon: {
                source: Icon.Circle,
                tintColor: getMoodIntensityColor(entry.intensity),
              },
              tooltip: `${entry.mood} at ${entry.intensity}/5 intensity`,
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="View Details"
                icon={Icon.Document}
                onAction={() => {
                  push(
                    <MoodEntryDetail entry={entry} onDelete={onDeleteEntry} />
                  );
                }}
              />
              {onDeleteEntry && (
                <Action
                  title="Delete Entry"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => onDeleteEntry(entry.id)}
                />
              )}
            </ActionPanel>
          }
        />
      ))}
    </>
  );
}

interface QuickMoodSelectorProps {
  onMoodSelected: (mood: MoodType, intensity: 1 | 2 | 3 | 4 | 5) => void;
  sessionId?: string;
}

export function QuickMoodSelector({
  onMoodSelected,
  sessionId,
}: QuickMoodSelectorProps) {
  const commonMoods: { mood: MoodType; intensity: 1 | 2 | 3 | 4 | 5 }[] = [
    { mood: "focused", intensity: 4 },
    { mood: "energized", intensity: 4 },
    { mood: "calm", intensity: 3 },
    { mood: "motivated", intensity: 4 },
    { mood: "neutral", intensity: 3 },
    { mood: "tired", intensity: 3 },
    { mood: "stressed", intensity: 3 },
    { mood: "distracted", intensity: 3 },
  ];

  return (
    <List.Section title="Quick Mood Log">
      {commonMoods.map((item, index) => (
        <List.Item
          key={`${item.mood}-${index}`}
          title={`${item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}`}
          subtitle={`Quick log at ${item.intensity}/5 intensity`}
          icon={{
            source: getMoodIcon(item.mood),
            tintColor: getMoodColor(item.mood),
          }}
          accessories={[
            {
              text: `${item.intensity}/5`,
              tooltip: `Log ${item.mood} at ${item.intensity}/5`,
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={`Log ${item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}`}
                icon={ACTION_ICONS.SAVE}
                onAction={() => onMoodSelected(item.mood, item.intensity)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List.Section>
  );
}

interface MoodManagementFormProps {
  sessionId: string;
  existingEntry?: MoodEntry;
  onMoodUpdated?: () => void;
}

export function MoodManagementForm({
  sessionId,
  existingEntry,
  onMoodUpdated,
}: MoodManagementFormProps) {
  const { addMoodEntry, updateMoodEntry, moodEntries } = useTimerStore();
  const { pop } = useNavigation();

  const [selectedMood, setSelectedMood] = useState<MoodType>(
    existingEntry?.mood || "neutral"
  );
  const [intensity, setIntensity] = useState<string>(
    existingEntry?.intensity.toString() || "3"
  );
  const [context, setContext] = useState<string>(
    existingEntry?.context || "post-session"
  );
  const [notes, setNotes] = useState<string>(existingEntry?.notes || "");

  const moodOptions: { value: MoodType; title: string; description: string }[] =
    [
      {
        value: "energized",
        title: "Energized",
        description: "Feeling full of energy and ready to tackle tasks",
      },
      {
        value: "focused",
        title: "Focused",
        description: "Clear mind, able to concentrate well",
      },
      {
        value: "calm",
        title: "Calm",
        description: "Peaceful and relaxed state",
      },
      {
        value: "motivated",
        title: "Motivated",
        description: "Driven and enthusiastic about work",
      },
      {
        value: "neutral",
        title: "Neutral",
        description: "Balanced, neither positive nor negative",
      },
      {
        value: "tired",
        title: "Tired",
        description: "Low energy, feeling fatigued",
      },
      {
        value: "stressed",
        title: "Stressed",
        description: "Feeling pressure or tension",
      },
      {
        value: "overwhelmed",
        title: "Overwhelmed",
        description: "Too much to handle, feeling swamped",
      },
      {
        value: "distracted",
        title: "Distracted",
        description: "Difficulty maintaining focus",
      },
    ];

  const intensityOptions = [
    { value: "1", title: "Very Low (1/5)", description: "Barely noticeable" },
    { value: "2", title: "Low (2/5)", description: "Mild intensity" },
    {
      value: "3",
      title: "Moderate (3/5)",
      description: "Noticeable but manageable",
    },
    { value: "4", title: "High (4/5)", description: "Strong and prominent" },
    {
      value: "5",
      title: "Very High (5/5)",
      description: "Overwhelming intensity",
    },
  ];

  const contextOptions = [
    {
      value: "pre-session",
      title: "Before Session",
      description: "How you felt before starting work",
    },
    {
      value: "during-session",
      title: "During Session",
      description: "How you felt while working",
    },
    {
      value: "post-session",
      title: "After Session",
      description: "How you felt after completing work",
    },
    {
      value: "standalone",
      title: "General Check-in",
      description: "Independent mood tracking",
    },
  ];

  const handleSubmit = () => {
    const intensityNum = parseInt(intensity) as 1 | 2 | 3 | 4 | 5;
    const contextValue = context as
      | "pre-session"
      | "during-session"
      | "post-session"
      | "standalone";

    if (existingEntry) {
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
        title: "Mood Added",
        message: `${selectedMood} (${intensityNum}/5) recorded`,
      });
    }

    if (onMoodUpdated) {
      onMoodUpdated();
    }

    pop();
  };

  const isEditing = !!existingEntry;

  return (
    <Form
      navigationTitle={isEditing ? "Edit Mood Entry" : "Add Mood Entry"}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={isEditing ? "Update Mood" : "Add Mood"}
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
        title="Mood"
        value={selectedMood}
        onChange={(value) => setSelectedMood(value as MoodType)}
        info="Select the mood that best describes how you felt"
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
        info="How strongly did you experience this mood?"
      >
        {intensityOptions.map((option) => (
          <Form.Dropdown.Item
            key={option.value}
            value={option.value}
            title={option.title}
            icon={{
              source: Icon.Circle,
              tintColor: getMoodIntensityColor(
                parseInt(option.value) as 1 | 2 | 3 | 4 | 5
              ),
            }}
          />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="context"
        title="Context"
        value={context}
        onChange={setContext}
        info="When did you experience this mood in relation to the session?"
      >
        {contextOptions.map((option) => (
          <Form.Dropdown.Item
            key={option.value}
            value={option.value}
            title={option.title}
            icon={{
              source: getMoodContextIcon(option.value),
              tintColor: STATUS_COLORS.INFO,
            }}
          />
        ))}
      </Form.Dropdown>

      <Form.TextArea
        id="notes"
        title="Notes (Optional)"
        placeholder="Any additional thoughts or context about your mood..."
        value={notes}
        onChange={setNotes}
        info="Optional notes to help you remember what influenced this mood"
      />

      <Form.Description
        title="Session Context"
        text={`This mood entry will be linked to the selected session for tracking patterns and insights.`}
      />
    </Form>
  );
}
