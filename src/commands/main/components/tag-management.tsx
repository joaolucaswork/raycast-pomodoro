import {
  Action,
  ActionPanel,
  Icon,
  List,
  Color,
  confirmAlert,
  Alert,
} from "@raycast/api";
import {
  getTagColor,
  getTagIcon,
  PREDEFINED_TAGS,
} from "../utils/search-parsing";
import { shouldShowTagSuggestions } from "../utils/timer-display-helpers";
import { createTagIconSelectionActions } from "../../../components/inline-icon-selection";

interface TagManagementProps {
  searchText: string;
  currentTags: string[];
  customTags: string[];
  getTagConfig: (tag: string) => { icon?: Icon; color: any } | undefined;
  updateTagConfig: (tag: string, config: { icon?: Icon; color?: any }) => void;
  deleteCustomTag: (tag: string) => void;
  clearAllTags: () => void;
  setSearchText: (text: string | ((prev: string) => string)) => void;
}

export function TagManagement({
  searchText,
  currentTags,
  customTags,
  getTagConfig,
  updateTagConfig,
  deleteCustomTag,
  clearAllTags,
  setSearchText,
}: TagManagementProps) {
  if (!shouldShowTagSuggestions(searchText, currentTags)) {
    return null;
  }

  const createTagColorActions = (tag: string) => {
    const colors = [
      { name: "Blue", value: Color.Blue },
      { name: "Green", value: Color.Green },
      { name: "Red", value: Color.Red },
      { name: "Orange", value: Color.Orange },
      { name: "Purple", value: Color.Purple },
      { name: "Yellow", value: Color.Yellow },
    ];

    return colors.map((color) => (
      <Action
        key={color.name}
        title={color.name}
        icon={{
          source: Icon.Circle,
          tintColor: color.value,
        }}
        onAction={() => updateTagConfig(tag, { color: color.value })}
      />
    ));
  };

  const customTagsOnly = customTags.filter(
    (tag) => !PREDEFINED_TAGS.includes(tag)
  );
  const builtInTags = customTags.filter((tag) => PREDEFINED_TAGS.includes(tag));

  return (
    <>
      {/* Custom Tags Section - Higher Priority */}
      {customTagsOnly.length > 0 && (
        <List.Section title="Custom Tags">
          {customTagsOnly.map((tag, index) => (
            <List.Item
              key={`custom-${tag}`}
              icon={getTagIcon(tag, getTagConfig)}
              title={`#${tag}`}
              subtitle="Custom tag"
              accessories={[
                { tag: { value: tag, color: getTagColor(tag, getTagConfig) } },
              ]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="Tag Actions">
                    <Action
                      title={`Add #${tag} Tag`}
                      icon={Icon.Plus}
                      onAction={() => {
                        setSearchText((prevText) => {
                          const currentText = prevText.trim();
                          return currentText
                            ? `${currentText} #${tag}`
                            : `#${tag}`;
                        });
                      }}
                    />
                  </ActionPanel.Section>

                  <ActionPanel.Section title="Customize Tag">
                    <ActionPanel.Submenu title="Change Color" icon={Icon.Brush}>
                      {createTagColorActions(tag)}
                    </ActionPanel.Submenu>

                    {createTagIconSelectionActions(
                      tag,
                      updateTagConfig,
                      getTagConfig(tag)?.icon
                    )}
                  </ActionPanel.Section>

                  <ActionPanel.Section title="Management">
                    <Action
                      title="Delete Tag"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={async () => {
                        const confirmed = await confirmAlert({
                          title: `Delete #${tag} Tag`,
                          message: `Are you sure you want to delete the #${tag} tag? This action cannot be undone.`,
                          primaryAction: {
                            title: "Delete Tag",
                            style: Alert.ActionStyle.Destructive,
                          },
                        });
                        if (confirmed) {
                          deleteCustomTag(tag);
                        }
                      }}
                    />

                    {/* Show "Clear All Custom Tags" action only on the first custom tag */}
                    {index === 0 && customTagsOnly.length > 1 && (
                      <Action
                        title="Clear All Custom Tags"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        onAction={async () => {
                          const confirmed = await confirmAlert({
                            title: "Clear All Custom Tags",
                            message:
                              "Are you sure you want to delete all custom tags? This action cannot be undone.",
                            primaryAction: {
                              title: "Delete All Tags",
                              style: Alert.ActionStyle.Destructive,
                            },
                          });
                          if (confirmed) {
                            clearAllTags();
                          }
                        }}
                      />
                    )}
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}

      {/* Built-in Tags Section - Subtle/Muted */}
      {builtInTags.length > 0 && (
        <List.Section title="Built-in Tags">
          {builtInTags.map((tag) => (
            <List.Item
              key={`builtin-${tag}`}
              icon={{
                source: getTagIcon(tag, getTagConfig),
                tintColor: Color.SecondaryText,
              }}
              title={`#${tag}`}
              subtitle=""
              accessories={[
                { tag: { value: tag, color: Color.SecondaryText } },
              ]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="Tag Actions">
                    <Action
                      title={`Add #${tag} Tag`}
                      icon={Icon.Plus}
                      onAction={() => {
                        setSearchText((prevText) => {
                          const currentText = prevText.trim();
                          return currentText
                            ? `${currentText} #${tag}`
                            : `#${tag}`;
                        });
                      }}
                    />
                  </ActionPanel.Section>

                  <ActionPanel.Section title="Customize Tag">
                    <ActionPanel.Submenu title="Change Color" icon={Icon.Brush}>
                      {createTagColorActions(tag)}
                    </ActionPanel.Submenu>

                    {createTagIconSelectionActions(
                      tag,
                      updateTagConfig,
                      getTagConfig(tag)?.icon
                    )}
                  </ActionPanel.Section>

                  {/* Built-in tags cannot be deleted */}
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </>
  );
}
