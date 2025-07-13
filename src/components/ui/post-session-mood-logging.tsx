import {
  Action,
  ActionPanel,
  Form,
  Icon,
  showToast,
  Toast,
  useNavigation,
  Color,
} from "@raycast/api";
import { useState } from "react";
import { useTimerStore } from "../store/timer-store";
import { MoodType, MoodEntry, TimerSession } from "../types/timer";
import {
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
} from "../constants/design-tokens";

interface PostSessionMoodLoggingProps {
  completedSession: TimerSession;
  onMoodLogged?: (entry: MoodEntry) => void;
  onDismiss?: () => void;
}

const moodOptions = [
  {
    value: "energized",
    title: "Energized",
    description: "Feeling alert and ready for more",
  },
  {
    value: "focused",
    title: "Focused",
    description: "Clear-minded and concentrated",
  },
  { value: "calm", title: "Calm", description: "Peaceful and relaxed" },
  {
    value: "motivated",
    title: "Motivated",
    description: "Inspired to continue working",
  },
  {
    value: "neutral",
    title: "Neutral",
    description: "Balanced, neither positive nor negative",
  },
  {
    value: "tired",
    title: "Tired",
    description: "Feeling drained or fatigued",
  },
  {
    value: "stressed",
    title: "Stressed",
    description: "Feeling pressure or tension",
  },
  {
    value: "overwhelmed",
    title: "Overwhelmed",
    description: "Feeling like there's too much to handle",
  },
  {
    value: "distracted",
    title: "Distracted",
    description: "Having trouble maintaining focus",
  },
] as const;

export function PostSessionMoodLogging({
  completedSession,
  onMoodLogged,
  onDismiss,
}: PostSessionMoodLoggingProps) {
  const { addMoodEntry, hidePostSessionMoodPrompt } = useTimerStore();
  const { pop } = useNavigation();

  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral");
  const [intensity, setIntensity] = useState<string>("3");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = () => {
    const intensityNum = parseInt(intensity) as 1 | 2 | 3 | 4 | 5;

    addMoodEntry(
      selectedMood,
      intensityNum,
      "post-session",
      completedSession.id,
      notes || undefined,
    );

    showToast({
      style: Toast.Style.Success,
      title: "Mood Logged",
      message: `${selectedMood} (${intensityNum}/5) recorded`,
    });

    if (onMoodLogged) {
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        mood: selectedMood,
        intensity: intensityNum,
        timestamp: new Date(),
        sessionId: completedSession.id,
        notes: notes || undefined,
        context: "post-session",
      };
      onMoodLogged(newEntry);
    }

    // Hide the mood prompt and ensure timer transitions to idle
    hidePostSessionMoodPrompt();

    if (onDismiss) {
      onDismiss();
    } else {
      pop();
    }
  };

  const handleDismiss = () => {
    // Hide the mood prompt and ensure timer transitions to idle
    hidePostSessionMoodPrompt();

    if (onDismiss) {
      onDismiss();
    } else {
      pop();
    }
  };

  const getSessionTypeLabel = () => {
    switch (completedSession.type) {
      case "work":
        return "Focus Session";
      case "short_break":
        return "Short Break";
      case "long_break":
        return "Long Break";
      default:
        return "Session";
    }
  };

  return (
    <Form
      navigationTitle="Session Reflection"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Reflection"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
          <Action
            title="Skip for Now"
            icon={Icon.XMarkCircle}
            shortcut={{ modifiers: ["cmd"], key: "w" }}
            onAction={handleDismiss}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title="🎉 Session Complete!"
        text={`Excellent work! You just completed a ${getSessionTypeLabel().toLowerCase()}${
          completedSession.taskName
            ? ` working on "${completedSession.taskName}"`
            : ""
        }.

Take a moment to reflect on your experience and current emotional state. This helps build self-awareness and improve future focus sessions.`}
      />

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
            title={`${option.title} • ${option.description}`}
            icon={{
              source: getMoodIcon(option.value),
              tintColor: getMoodColor(option.value),
            }}
          />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="intensity"
        title="Intensity"
        value={intensity}
        onChange={setIntensity}
        info="How strongly are you experiencing this mood? (1 = Very Mild, 5 = Very Strong)"
      >
        <Form.Dropdown.Item
          value="1"
          title="1 • Very Mild"
          icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }}
        />
        <Form.Dropdown.Item
          value="2"
          title="2 • Mild"
          icon={{ source: Icon.CircleFilled, tintColor: Color.Blue }}
        />
        <Form.Dropdown.Item
          value="3"
          title="3 • Moderate"
          icon={{ source: Icon.CircleFilled, tintColor: Color.Orange }}
        />
        <Form.Dropdown.Item
          value="4"
          title="4 • Strong"
          icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        />
        <Form.Dropdown.Item
          value="5"
          title="5 • Very Strong"
          icon={{ source: Icon.CircleFilled, tintColor: Color.Magenta }}
        />
      </Form.Dropdown>

      <Form.TextArea
        id="notes"
        title="Reflection Notes"
        placeholder="How did this session go for you?

Consider reflecting on:
• What contributed to your current mood?
• How was your focus and concentration?
• What strategies worked well?
• Any insights about your energy or productivity?
• What would you adjust for next time?"
        value={notes}
        onChange={setNotes}
        info="Optional: Add your thoughts to build self-awareness and improve future sessions"
      />
    </Form>
  );
}
