import { Icon, Color } from "@raycast/api";

/**
 * Search parsing utilities for the main timer command
 */

/**
 * Extract tags from search text (words starting with #)
 */
export const extractTags = (text: string): string[] => {
  // Don't extract tags if text is just "#" (incomplete tag)
  if (text.trim() === "#") {
    return [];
  }
  const tagMatches = text.match(/#\w+/g);
  return tagMatches ? tagMatches.map((tag) => tag.substring(1)) : [];
};

/**
 * Parse task name and tags from search text (without storing tags)
 */
export const parseSearchTextOnly = (text: string) => {
  const taskParts = text.split("#");
  const taskName = taskParts[0].trim();
  const tags = extractTags(text);
  return { taskName, tags };
};

/**
 * Parse task name and tags from search text AND store new tags
 */
export const parseSearchTextAndStore = (
  text: string,
  customTags: string[],
  predefinedTags: string[],
  addCustomTag: (tag: string) => void
) => {
  const { taskName, tags } = parseSearchTextOnly(text);

  // Automatically add new tags to custom tags store
  tags.forEach((tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (
      !customTags.includes(normalizedTag) &&
      !predefinedTags.includes(normalizedTag)
    ) {
      addCustomTag(normalizedTag);
    }
  });

  return { taskName, tags };
};

/**
 * Get tag color based on tag name (with custom config support)
 */
export const getTagColor = (
  tag: string,
  getTagConfig: (
    tag: string
  ) => { icon?: Icon; color: Color } | null | undefined
): Color => {
  // Check if there's a custom configuration for this tag
  const customConfig = getTagConfig(tag);
  if (customConfig) {
    return customConfig.color;
  }

  // Fall back to default color mapping for predefined tags
  const colorMap: Record<string, Color> = {
    work: Color.Blue,
    study: Color.Yellow,
    personal: Color.Green,
  };
  return colorMap[tag.toLowerCase()] || Color.Blue;
};

/**
 * Get tag icon based on tag name (with custom config support)
 */
export const getTagIcon = (
  tag: string,
  getTagConfig: (
    tag: string
  ) => { icon?: Icon; color: Color } | null | undefined
): Icon => {
  // Check if there's a custom configuration for this tag
  const customConfig = getTagConfig(tag);
  if (customConfig && customConfig.icon) {
    return customConfig.icon;
  }

  // Fall back to generic tag icon
  return Icon.Tag;
};

/**
 * Pre-defined custom tags with their default configurations
 */
export const PREDEFINED_TAGS = ["work", "study", "personal"];

export const PREDEFINED_TAG_CONFIGS = [
  { name: "work", icon: Icon.Hammer, color: Color.Blue },
  { name: "study", icon: Icon.Book, color: Color.Yellow },
  { name: "personal", icon: Icon.Heart, color: Color.Green },
];

/**
 * Validate and limit task name length
 */
export const validateTaskName = (
  taskName: string,
  maxLength: number = 100
): string => {
  const finalTaskName = taskName || "Focus Session";
  return finalTaskName.length > maxLength
    ? finalTaskName.substring(0, maxLength)
    : finalTaskName;
};
