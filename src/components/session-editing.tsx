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
  SESSION_ICONS,
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
  getMoodContextIcon,
  STATUS_COLORS,
} from "../constants/design-tokens";

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
                title="Questionmark"
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
                title="Checklist"
                icon={Icon.CheckList}
                onAction={() => handleIconSelect(Icon.CheckList)}
              />
              <Action
                title="Target"
                icon={Icon.BullsEye}
                onAction={() => handleIconSelect(Icon.BullsEye)}
              />
              <Action
                title="Bullseye"
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

  // Mood options for the form
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

  const iconCategories = [
    {
      title: "Work & Productivity",
      icons: [
        Icon.Hammer,
        Icon.Cog,
        Icon.Gear,
        Icon.Desktop,
        Icon.Terminal,
        Icon.Code,
        Icon.Document,
        Icon.Folder,
        Icon.Clipboard,
        Icon.Calculator,
      ],
    },
    {
      title: "Learning & Study",
      icons: [
        Icon.Book,
        Icon.Book,
        Icon.LightBulb,
        Icon.Eye,
        Icon.Pencil,
        Icon.QuestionMark,
        Icon.BullsEye,
        Icon.Trophy,
        Icon.Star,
        Icon.Bookmark,
      ],
    },
    {
      title: "Creative & Design",
      icons: [
        Icon.Brush,
        Icon.Swatch,
        Icon.Camera,
        Icon.Image,
        Icon.Video,
        Icon.Music,
        Icon.Microphone,
        Icon.Wand,
        Icon.Stars,
        Icon.CircleFilled,
      ],
    },
    {
      title: "Communication",
      icons: [
        Icon.Message,
        Icon.Phone,
        Icon.Envelope,
        Icon.SpeechBubble,
        Icon.Megaphone,
        Icon.Bell,
        Icon.AtSymbol,
        Icon.Globe,
        Icon.Network,
        Icon.Wifi,
      ],
    },
    {
      title: "Personal & Health",
      icons: [
        Icon.Heart,
        Icon.Person,
        Icon.House,
        Icon.Car,
        Icon.Airplane,
        Icon.GameController,
        Icon.Gift,
        Icon.Cart,
        Icon.CreditCard,
        Icon.Calendar,
      ],
    },
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

          <ActionPanel.Section title="Icon Selection">
            {iconCategories.map((category) => (
              <ActionPanel.Submenu
                key={category.title}
                title={category.title}
                icon={Icon.AppWindowGrid3x3}
              >
                {category.icons.map((icon) => (
                  <Action
                    key={icon}
                    title={`Select ${icon}`}
                    icon={icon}
                    onAction={() => setSelectedIcon(icon)}
                  />
                ))}
              </ActionPanel.Submenu>
            ))}
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
            id="moodNotes"
            title="Mood Notes (Optional)"
            placeholder="Any additional thoughts or context about your mood..."
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
