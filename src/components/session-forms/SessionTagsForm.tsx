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

interface SessionTagsFormProps {
  session: TimerSession;
  onTagsUpdated?: (tags: string[]) => void;
}

export function SessionTagsForm({
  session,
  onTagsUpdated,
}: SessionTagsFormProps) {
  const { updateSessionTags, customTags, customTagConfigs } = useTimerStore();
  const { pop } = useNavigation();

  const [selectedTags, setSelectedTags] = useState<string[]>(session.tags || []);
  const [newTag, setNewTag] = useState<string>("");

  // Get available tags (custom tags + any existing session tags not in custom tags)
  const availableTags = [...new Set([...customTags, ...(session.tags || [])])];

  const handleSubmit = () => {
    updateSessionTags(session.id, selectedTags);

    showToast({
      style: Toast.Style.Success,
      title: "Tags Updated",
      message: `Session now has ${selectedTags.length} tag${selectedTags.length === 1 ? "" : "s"}`,
    });

    if (onTagsUpdated) {
      onTagsUpdated(selectedTags);
    }

    pop();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      const updatedTags = [...selectedTags, newTag.trim()];
      setSelectedTags(updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      handleRemoveTag(tag);
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getTagConfig = (tag: string) => {
    return customTagConfigs.find(config => config.name === tag);
  };

  return (
    <Form
      navigationTitle="Edit Session Tags"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Tags"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
          <Action
            title="Add New Tag"
            icon={Icon.Plus}
            onAction={handleAddTag}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
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
      <Form.Description
        title="Session Tags"
        text="Tags help you categorize and organize your focus sessions for better tracking and analysis"
      />

      {/* Add new tag */}
      <Form.TextField
        id="newTag"
        title="Add New Tag"
        placeholder="Enter a new tag name..."
        value={newTag}
        onChange={setNewTag}
        info="Type a tag name and press Cmd+N to add it to this session"
      />

      <Form.Separator />

      {/* Available tags */}
      {availableTags.length > 0 && (
        <>
          <Form.Description
            title="Available Tags"
            text="Select tags to apply to this session"
          />

          {availableTags.map((tag) => {
            const config = getTagConfig(tag);
            const isSelected = selectedTags.includes(tag);

            return (
              <Form.Checkbox
                key={tag}
                id={`tag-${tag}`}
                title={tag}
                label={`Apply ${tag} tag to this session`}
                value={isSelected}
                onChange={() => handleToggleTag(tag)}
                info={config ? `Color: ${config.color}` : "Custom tag"}
              />
            );
          })}
        </>
      )}

      {/* Currently selected tags */}
      {selectedTags.length > 0 && (
        <>
          <Form.Separator />
          <Form.Description
            title="Selected Tags"
            text={`This session will have ${selectedTags.length} tag${selectedTags.length === 1 ? "" : "s"}: ${selectedTags.join(", ")}`}
          />
        </>
      )}

      <Form.Separator />

      <Form.Description
        title="Session Details"
        text={`${session.taskName || "Untitled Session"} • ${
          session.completed ? "Completed" : "Incomplete"
        } • ${new Date(session.startTime).toLocaleDateString()}`}
      />

      <Form.Description
        title="Tag Management"
        text="Use the main tag management interface to create, edit, and organize your custom tags"
      />
    </Form>
  );
}

// Component for displaying session tags in read-only mode
interface SessionTagsDisplayProps {
  session: TimerSession;
  customTagConfigs: Array<{ name: string; color: string; icon?: Icon }>;
}

export function SessionTagsDisplay({
  session,
  customTagConfigs,
}: SessionTagsDisplayProps) {
  const getTagConfig = (tag: string) => {
    return customTagConfigs.find(config => config.name === tag);
  };

  if (!session.tags || session.tags.length === 0) {
    return (
      <Form.Description
        title="Tags"
        text="No tags assigned to this session"
      />
    );
  }

  return (
    <>
      <Form.Description
        title="Tags"
        text={`${session.tags.length} tag${session.tags.length === 1 ? "" : "s"} assigned`}
      />
      
      {session.tags.map((tag) => {
        const config = getTagConfig(tag);
        return (
          <Form.Description
            key={tag}
            title={tag}
            text={config ? `Color: ${config.color}` : "Custom tag"}
          />
        );
      })}
    </>
  );
}

// Quick tag selector for common tags
interface QuickTagSelectorProps {
  session: TimerSession;
  onTagsSelected: (tags: string[]) => void;
  availableTags: string[];
}

export function QuickTagSelector({
  session,
  onTagsSelected,
  availableTags,
}: QuickTagSelectorProps) {
  const { updateSessionTags } = useTimerStore();
  const { pop } = useNavigation();

  const handleQuickSelect = (tags: string[]) => {
    updateSessionTags(session.id, tags);
    
    showToast({
      style: Toast.Style.Success,
      title: "Quick Tags Applied",
      message: `${tags.length} tag${tags.length === 1 ? "" : "s"} applied to session`,
    });

    onTagsSelected(tags);
    pop();
  };

  // Common tag combinations
  const quickCombinations = [
    { name: "Work", tags: ["work"] },
    { name: "Study", tags: ["study"] },
    { name: "Personal", tags: ["personal"] },
    { name: "Work + Important", tags: ["work", "important"] },
    { name: "Study + Research", tags: ["study", "research"] },
    { name: "Personal + Health", tags: ["personal", "health"] },
  ].filter(combo => combo.tags.every(tag => availableTags.includes(tag)));

  return (
    <Form
      navigationTitle="Quick Tag Selection"
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
        title="Quick Tag Combinations"
        text="Select a common tag combination to quickly categorize this session"
      />

      {quickCombinations.map((combo) => (
        <Form.Description
          key={combo.name}
          title={combo.name}
          text={`Apply tags: ${combo.tags.join(", ")}`}
        />
      ))}

      {quickCombinations.length === 0 && (
        <Form.Description
          title="No Quick Combinations"
          text="Create some custom tags first to see quick tag combinations here"
        />
      )}

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

// Bulk tag operations for multiple sessions
interface BulkTagOperationsProps {
  sessions: TimerSession[];
  onOperationComplete: () => void;
}

export function BulkTagOperations({
  sessions,
  onOperationComplete,
}: BulkTagOperationsProps) {
  const { updateSessionTags, customTags } = useTimerStore();
  const { pop } = useNavigation();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [operation, setOperation] = useState<"add" | "remove" | "replace">("add");

  const handleSubmit = () => {
    sessions.forEach((session) => {
      let newTags: string[] = [];
      
      switch (operation) {
        case "add":
          newTags = [...new Set([...(session.tags || []), ...selectedTags])];
          break;
        case "remove":
          newTags = (session.tags || []).filter(tag => !selectedTags.includes(tag));
          break;
        case "replace":
          newTags = selectedTags;
          break;
      }
      
      updateSessionTags(session.id, newTags);
    });

    showToast({
      style: Toast.Style.Success,
      title: "Bulk Operation Complete",
      message: `${operation} operation applied to ${sessions.length} session${sessions.length === 1 ? "" : "s"}`,
    });

    onOperationComplete();
    pop();
  };

  return (
    <Form
      navigationTitle="Bulk Tag Operations"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Apply Operation"
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
        id="operation"
        title="Operation"
        value={operation}
        onChange={(value) => setOperation(value as "add" | "remove" | "replace")}
        info="Choose how to apply the selected tags to all sessions"
      >
        <Form.Dropdown.Item value="add" title="Add Tags" />
        <Form.Dropdown.Item value="remove" title="Remove Tags" />
        <Form.Dropdown.Item value="replace" title="Replace All Tags" />
      </Form.Dropdown>

      {customTags.map((tag) => (
        <Form.Checkbox
          key={tag}
          id={`bulk-tag-${tag}`}
          title={tag}
          label={`Include ${tag} in bulk operation`}
          value={selectedTags.includes(tag)}
          onChange={(checked) => {
            if (checked) {
              setSelectedTags([...selectedTags, tag]);
            } else {
              setSelectedTags(selectedTags.filter(t => t !== tag));
            }
          }}
        />
      ))}

      <Form.Separator />

      <Form.Description
        title="Selected Sessions"
        text={`This operation will affect ${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
      />

      <Form.Description
        title="Selected Tags"
        text={selectedTags.length > 0 ? selectedTags.join(", ") : "No tags selected"}
      />
    </Form>
  );
}
