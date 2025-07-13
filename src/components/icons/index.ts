// Icon components barrel export
export { 
  createTaskIconSelectionActions,
  createUniversalIconSelectionActions,
  createIconSelectionSubmenu,
  IconSelectionPopup,
  IconCategorySubmenu,
  SearchAllIconsSubmenu,
  PopularIconsSubmenu,
  getIconsByCategory,
  getAllIcons,
  searchIcons,
  getPopularIcons,
} from "./inline-icon-selection";

// Re-export types for convenience
export type { Icon } from "@raycast/api";
