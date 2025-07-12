import { StateCreator } from "zustand";
import { Color, Icon } from "@raycast/api";
import { CustomTagConfig, PomodoroStore } from "../../types/timer";

/**
 * Predefined tags with their default configurations
 */
export const PREDEFINED_TAGS = ["work", "study", "personal"];

export const PREDEFINED_TAG_CONFIGS: CustomTagConfig[] = [
  { name: "work", icon: Icon.Hammer, color: Color.Blue },
  { name: "study", icon: Icon.Book, color: Color.Yellow },
  { name: "personal", icon: Icon.Heart, color: Color.Green },
];

/**
 * Tag slice interface - defines tag management-related state and actions
 */
export interface TagSlice {
  // Tag state
  customTags: string[];
  customTagConfigs: CustomTagConfig[];
  hasCreatedCustomTag: boolean;

  // Tag actions
  addCustomTag: (tag: string) => void;
  getCustomTags: () => string[];
  markCustomTagCreated: () => void;
  updateTagConfig: (tagName: string, config: Partial<CustomTagConfig>) => void;
  deleteCustomTag: (tagName: string) => void;
  getTagConfig: (tagName: string) => CustomTagConfig | undefined;
  clearAllTags: () => void;

  // Session tag actions
  addTagToCurrentSession: (tag: string) => void;
  removeTagFromCurrentSession: (tag: string) => void;

  // Tag utilities
  getAllTags: () => string[];
  getTagsWithConfigs: () => { tag: string; config?: CustomTagConfig }[];
  isPredefinedTag: (tag: string) => boolean;
  isCustomTag: (tag: string) => boolean;
  getTagColor: (tag: string) => Color;
  getTagIcon: (tag: string) => Icon | undefined;
  initializePredefinedTags: () => void;
}

/**
 * Create tag slice with all tag management-related functionality
 */
export const createTagSlice: StateCreator<
  PomodoroStore,
  [],
  [],
  TagSlice
> = (set, get) => ({
  // Initial state
  customTags: [],
  customTagConfigs: [],
  hasCreatedCustomTag: false,

  // Tag actions
  addCustomTag: (tag: string) => {
    const { customTags } = get();
    const normalizedTag = tag.toLowerCase().trim();

    if (!customTags.includes(normalizedTag)) {
      set({
        customTags: [...customTags, normalizedTag],
        hasCreatedCustomTag: true,
      });
    }
  },

  getCustomTags: (): string[] => {
    return get().customTags;
  },

  markCustomTagCreated: () => {
    set({ hasCreatedCustomTag: true });
  },

  updateTagConfig: (
    tagName: string,
    config: Partial<CustomTagConfig>
  ) => {
    const { customTagConfigs } = get();
    const existingIndex = customTagConfigs.findIndex(
      (tc) => tc.name === tagName
    );

    if (existingIndex >= 0) {
      // Update existing config
      const updatedConfigs = [...customTagConfigs];
      updatedConfigs[existingIndex] = {
        ...updatedConfigs[existingIndex],
        ...config,
      };
      set({ customTagConfigs: updatedConfigs });
    } else {
      // Create new config
      const newConfig: CustomTagConfig = {
        name: tagName,
        color: Color.Blue,
        ...config,
      };
      set({ customTagConfigs: [...customTagConfigs, newConfig] });
    }
  },

  deleteCustomTag: (tagName: string) => {
    const { customTags, customTagConfigs } = get();
    set({
      customTags: customTags.filter((tag) => tag !== tagName),
      customTagConfigs: customTagConfigs.filter(
        (tc) => tc.name !== tagName
      ),
    });
  },

  getTagConfig: (tagName: string): CustomTagConfig | undefined => {
    const { customTagConfigs } = get();
    return customTagConfigs.find((tc) => tc.name === tagName);
  },

  clearAllTags: () => {
    const { customTags, customTagConfigs } = get();

    // Keep only built-in tags
    const filteredCustomTags = customTags.filter((tag) =>
      PREDEFINED_TAGS.includes(tag)
    );
    const filteredCustomTagConfigs = customTagConfigs.filter((tc) =>
      PREDEFINED_TAGS.includes(tc.name)
    );

    set({
      customTags: filteredCustomTags,
      customTagConfigs: filteredCustomTagConfigs,
      hasCreatedCustomTag: filteredCustomTags.length > PREDEFINED_TAGS.length,
    });
  },

  // Session tag actions
  addTagToCurrentSession: (tag: string) => {
    const { currentSession } = get();
    if (currentSession) {
      const currentTags = currentSession.tags || [];
      const normalizedTag = tag.toLowerCase().trim();

      // Prevent duplicate tags
      if (!currentTags.includes(normalizedTag)) {
        set({
          currentSession: {
            ...currentSession,
            tags: [...currentTags, normalizedTag],
          },
        });
      }
    }
  },

  removeTagFromCurrentSession: (tag: string) => {
    const { currentSession } = get();
    if (currentSession) {
      const currentTags = currentSession.tags || [];
      const normalizedTag = tag.toLowerCase().trim();

      set({
        currentSession: {
          ...currentSession,
          tags: currentTags.filter((t) => t !== normalizedTag),
        },
      });
    }
  },

  // Tag utilities
  getAllTags: () => {
    const { customTags } = get();
    return [...PREDEFINED_TAGS, ...customTags.filter(tag => !PREDEFINED_TAGS.includes(tag))];
  },

  getTagsWithConfigs: () => {
    const { customTags, customTagConfigs } = get();
    return customTags.map(tag => ({
      tag,
      config: customTagConfigs.find(tc => tc.name === tag),
    }));
  },

  isPredefinedTag: (tag: string) => {
    return PREDEFINED_TAGS.includes(tag.toLowerCase());
  },

  isCustomTag: (tag: string) => {
    const { customTags } = get();
    return customTags.includes(tag.toLowerCase()) && !PREDEFINED_TAGS.includes(tag.toLowerCase());
  },

  getTagColor: (tag: string) => {
    const { customTagConfigs } = get();
    const config = customTagConfigs.find((tc) => tc.name === tag.toLowerCase());
    
    if (config) {
      return config.color;
    }

    // Fall back to default color mapping for predefined tags
    const colorMap: Record<string, Color> = {
      work: Color.Blue,
      study: Color.Yellow,
      personal: Color.Green,
    };
    return colorMap[tag.toLowerCase()] || Color.Blue;
  },

  getTagIcon: (tag: string) => {
    const { customTagConfigs } = get();
    const config = customTagConfigs.find((tc) => tc.name === tag.toLowerCase());
    
    if (config && config.icon) {
      return config.icon;
    }

    // Fall back to default icon mapping for predefined tags
    const iconMap: Record<string, Icon> = {
      work: Icon.Hammer,
      study: Icon.Book,
      personal: Icon.Heart,
    };
    return iconMap[tag.toLowerCase()];
  },

  initializePredefinedTags: () => {
    const { customTags, addCustomTag, updateTagConfig } = get();

    PREDEFINED_TAG_CONFIGS.forEach(({ name, icon, color }) => {
      // Only add if not already in custom tags
      if (!customTags.includes(name)) {
        addCustomTag(name);
      }
      // Always ensure the icon and color are configured
      updateTagConfig(name, { icon, color });
    });
  },
});
