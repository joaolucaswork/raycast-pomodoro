import React, { useState, useEffect } from "react";
import {
  Action,
  ActionPanel,
  Icon,
  List,
  Color,
  confirmAlert,
  Alert,
  showToast,
  Toast,
  popToRoot,
} from "@raycast/api";
import {
  getTagColor,
  getTagIcon,
  PREDEFINED_TAGS,
} from "../utils/search-parsing";
import { shouldShowTagSuggestions } from "../utils/timer-display-helpers";
import { createTagIconSelectionActions } from "../../../components/icons/inline-icon-selection";

interface TagManagementProps {
  searchText: string;
  currentTags: string[];
  customTags: string[];
  getTagConfig: (tag: string) => { icon?: Icon; color: Color } | undefined;
  updateTagConfig: (
    tag: string,
    config: { icon?: Icon; color?: Color }
  ) => void;
  deleteCustomTag: (tag: string) => void;
  clearAllTags: () => void;
  setSearchText: (text: string | ((prev: string) => string)) => void;
  addCustomTag: (tag: string) => void;
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
  addCustomTag,
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

  // Create color actions for new tag creation
  const createNewTagColorActions = (tagName: string) => {
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
        onAction={async () => {
          // Just set the selected color, don't create the tag yet
          setSelectedNewTagColor(color.value);

          // Show feedback that color was selected
          await showToast({
            style: Toast.Style.Success,
            title: "Color selected",
            message: `${color.name} color selected for #${tagName}`,
          });
        }}
      />
    ));
  };

  // All tags are now custom tags since we removed predefined ones
  const customTagsOnly = customTags;
  const hasAnyCustomTags = customTagsOnly.length > 0;

  // Check if user is typing a new tag (starts with # and has at least one letter)
  const trimmedSearch = searchText.trim();
  const isTypingNewTag =
    trimmedSearch.startsWith("#") &&
    trimmedSearch.length > 1 &&
    /^#[a-zA-Z]/.test(trimmedSearch); // Must have at least one letter after #
  const newTagName = isTypingNewTag ? trimmedSearch.substring(1) : "";
  const isNewTagAlreadyExists =
    newTagName && customTags.includes(newTagName.toLowerCase());

  // State for tracking selected icon and color for new tag
  const [selectedNewTagIcon, setSelectedNewTagIcon] = useState<
    Icon | undefined
  >(undefined);
  const [selectedNewTagColor, setSelectedNewTagColor] = useState<
    any | undefined
  >(undefined);

  // Reset selected icon and color when tag name changes or user stops typing
  useEffect(() => {
    if (!isTypingNewTag) {
      setSelectedNewTagIcon(undefined);
      setSelectedNewTagColor(undefined);
    }
  }, [newTagName, isTypingNewTag]);

  return (
    <>
      {/* Show "Create tag" option only when no custom tags exist */}
      {!hasAnyCustomTags && (
        <List.Section title="Tag Management">
          <List.Item
            icon={Icon.Plus}
            title="Create a tag"
            subtitle="by typing #"
            accessories={[
              { tag: { value: "new", color: Color.SecondaryText } },
            ]}
            actions={
              isTypingNewTag ? (
                <ActionPanel>
                  <ActionPanel.Section title="Create a Tag">
                    <Action
                      title={`Create "#${newTagName}"`}
                      icon={Icon.Plus}
                      onAction={async () => {
                        // Create the tag with the exact name user typed
                        addCustomTag(newTagName.toLowerCase());

                        // Show success message
                        await showToast({
                          style: Toast.Style.Success,
                          title: "Tag created",
                          message: `#${newTagName} created successfully`,
                        });

                        // Clear search text to return to idle state
                        setSearchText("");
                      }}
                    />
                    <Action
                      title="Just Create a Tag"
                      icon={Icon.Plus}
                      onAction={async () => {
                        // Create a simple default tag and return to idle
                        const defaultTagName = `tag${Date.now().toString().slice(-4)}`;
                        addCustomTag(defaultTagName);

                        // Show success message
                        await showToast({
                          style: Toast.Style.Success,
                          title: "Tag created",
                          message: `#${defaultTagName} created successfully`,
                        });

                        // Return to idle (main command root)
                        popToRoot();
                      }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              ) : (
                <ActionPanel>
                  <ActionPanel.Section title="Create a Tag">
                    <Action
                      title="Type Tag (#) in Search"
                      icon={Icon.Pencil}
                      onAction={() => {
                        // Focus on search bar - user should type #tagname
                      }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              )
            }
          />
        </List.Section>
      )}

      {/* Custom Tags Section - Show when tags exist */}
      {hasAnyCustomTags && (
        <List.Section title="Your Tags">
          {customTagsOnly.map((tag, index) => (
            <List.Item
              key={`custom-${tag}`}
              icon={getTagIcon(tag, getTagConfig)}
              title={`#${tag}`}
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

      {/* Show "Create Tag" option when user is typing a new tag */}
      {isTypingNewTag && !isNewTagAlreadyExists && (
        <List.Section title="Create New Tag">
          <List.Item
            icon={selectedNewTagIcon || Icon.Tag}
            title={`Create "#${newTagName}"`}
            accessories={
              selectedNewTagColor
                ? [
                    {
                      tag: {
                        value: "color selected",
                        color: selectedNewTagColor,
                      },
                    },
                  ]
                : undefined
            }
            actions={
              <ActionPanel>
                <ActionPanel.Section title="Create Tag">
                  <Action
                    title="Create Tag"
                    icon={Icon.Plus}
                    onAction={async () => {
                      // Create the tag with the exact name user typed
                      addCustomTag(newTagName.toLowerCase());

                      // Apply selected icon and/or color if any
                      const config: { icon?: Icon; color?: Color } = {};
                      if (selectedNewTagIcon) {
                        config.icon = selectedNewTagIcon;
                      }
                      if (selectedNewTagColor) {
                        config.color = selectedNewTagColor;
                      }

                      if (Object.keys(config).length > 0) {
                        updateTagConfig(newTagName.toLowerCase(), config);
                      }

                      // Show success message
                      await showToast({
                        style: Toast.Style.Success,
                        title: "Tag created",
                        message: `#${newTagName} created successfully`,
                      });

                      // Clear search text and reset selections
                      setSearchText("");
                      setSelectedNewTagIcon(undefined);
                      setSelectedNewTagColor(undefined);
                    }}
                  />
                  <Action
                    title="Continue Typing"
                    icon={Icon.Pencil}
                    onAction={() => {
                      // Do nothing - let user continue typing
                    }}
                  />
                </ActionPanel.Section>

                <ActionPanel.Section title="Tag Customization">
                  <ActionPanel.Submenu title="Change Color" icon={Icon.Brush}>
                    {createNewTagColorActions(newTagName)}
                  </ActionPanel.Submenu>

                  {createTagIconSelectionActions(
                    newTagName,
                    (tagName, config) => {
                      // Update the selected icon state for real-time preview
                      if (config.icon) {
                        setSelectedNewTagIcon(config.icon);
                      }
                      // Also update the tag config for when the tag is created
                      updateTagConfig(tagName, config);
                    },
                    selectedNewTagIcon // Show currently selected icon
                  )}
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        </List.Section>
      )}
    </>
  );
}
