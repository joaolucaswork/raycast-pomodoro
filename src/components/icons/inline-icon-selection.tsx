import { Action, ActionPanel, Icon } from "@raycast/api";

// Comprehensive icon categories with verified Raycast icons
const ICON_CATEGORIES = {
  Work: [
    { name: "Hammer", icon: Icon.Hammer },
    { name: "Building", icon: Icon.Building },
    { name: "Calendar", icon: Icon.Calendar },
    { name: "Clock", icon: Icon.Clock },
    { name: "Envelope", icon: Icon.Envelope },
    { name: "Phone", icon: Icon.Phone },
    { name: "Person", icon: Icon.Person },
    { name: "TwoPeople", icon: Icon.TwoPeople },
    { name: "Gear", icon: Icon.Gear },
    { name: "Desktop", icon: Icon.Desktop },
    { name: "Monitor", icon: Icon.Monitor },
    { name: "Globe", icon: Icon.Globe },
    { name: "Link", icon: Icon.Link },
  ],
  Learning: [
    { name: "Book", icon: Icon.Book },
    { name: "Bookmark", icon: Icon.Bookmark },
    { name: "Document", icon: Icon.Document },
    { name: "Text", icon: Icon.Text },
    { name: "MagnifyingGlass", icon: Icon.MagnifyingGlass },
    { name: "Binoculars", icon: Icon.Binoculars },
    { name: "Eye", icon: Icon.Eye },
    { name: "LightBulb", icon: Icon.LightBulb },
    { name: "QuestionMark", icon: Icon.QuestionMark },
    { name: "ExclamationMark", icon: Icon.ExclamationMark },
    { name: "Info", icon: Icon.Info },
    { name: "Important", icon: Icon.Important },
    { name: "Pin", icon: Icon.Pin },
  ],
  Creative: [
    { name: "Brush", icon: Icon.Brush },
    { name: "Pencil", icon: Icon.Pencil },
    { name: "Camera", icon: Icon.Camera },
    { name: "Video", icon: Icon.Video },
    { name: "Music", icon: Icon.Music },
    { name: "Microphone", icon: Icon.Microphone },
    { name: "Speaker", icon: Icon.Speaker },
    { name: "Image", icon: Icon.Image },
    { name: "Wand", icon: Icon.Wand },
    { name: "Star", icon: Icon.Star },
    { name: "Crown", icon: Icon.Crown },
    { name: "Trophy", icon: Icon.Trophy },
  ],
  Planning: [
    { name: "List", icon: Icon.List },
    { name: "BullsEye", icon: Icon.BullsEye },
    { name: "BarChart", icon: Icon.BarChart },
    { name: "LineChart", icon: Icon.LineChart },
    { name: "PieChart", icon: Icon.PieChart },
    { name: "Clipboard", icon: Icon.Clipboard },
    { name: "CheckCircle", icon: Icon.CheckCircle },
    { name: "Checkmark", icon: Icon.Checkmark },
    { name: "XMarkCircle", icon: Icon.XMarkCircle },
    { name: "Plus", icon: Icon.Plus },
    { name: "Minus", icon: Icon.Minus },
    { name: "Folder", icon: Icon.Folder },
    { name: "Tray", icon: Icon.Tray },
    { name: "Box", icon: Icon.Box },
  ],
  Personal: [
    { name: "Heart", icon: Icon.Heart },
    { name: "Car", icon: Icon.Car },
    { name: "Airplane", icon: Icon.Airplane },
    { name: "Bike", icon: Icon.Bike },
    { name: "Boat", icon: Icon.Boat },
    { name: "Map", icon: Icon.Map },
    { name: "Pin", icon: Icon.Pin },
    { name: "Compass", icon: Icon.Compass },
    { name: "Sun", icon: Icon.Sun },
    { name: "Moon", icon: Icon.Moon },
    { name: "Cloud", icon: Icon.Cloud },
    { name: "Umbrella", icon: Icon.Umbrella },
  ],
  Technology: [
    { name: "Code", icon: Icon.Code },
    { name: "Terminal", icon: Icon.Terminal },
    { name: "CommandSymbol", icon: Icon.CommandSymbol },
    { name: "Keyboard", icon: Icon.Keyboard },
    { name: "Mouse", icon: Icon.Mouse },
    { name: "HardDrive", icon: Icon.HardDrive },
    { name: "MemoryChip", icon: Icon.MemoryChip },
    { name: "Battery", icon: Icon.Battery },
    { name: "Plug", icon: Icon.Plug },
    { name: "Wifi", icon: Icon.Wifi },
    { name: "Bluetooth", icon: Icon.Bluetooth },
    { name: "Mobile", icon: Icon.Mobile },
    { name: "Bug", icon: Icon.Bug },
  ],
  Communication: [
    { name: "Message", icon: Icon.Message },
    { name: "Bubble", icon: Icon.Bubble },
    { name: "Megaphone", icon: Icon.Megaphone },
    { name: "Bell", icon: Icon.Bell },
    { name: "AtSymbol", icon: Icon.AtSymbol },
    { name: "Hashtag", icon: Icon.Hashtag },
    { name: "Reply", icon: Icon.Reply },
    { name: "Forward", icon: Icon.Forward },
    { name: "Upload", icon: Icon.Upload },
    { name: "Download", icon: Icon.Download },
    { name: "Airplane", icon: Icon.Airplane },
  ],
  Navigation: [
    { name: "ArrowUp", icon: Icon.ArrowUp },
    { name: "ArrowDown", icon: Icon.ArrowDown },
    { name: "ArrowLeft", icon: Icon.ArrowLeft },
    { name: "ArrowRight", icon: Icon.ArrowRight },
    { name: "ChevronUp", icon: Icon.ChevronUp },
    { name: "ChevronDown", icon: Icon.ChevronDown },
    { name: "ChevronLeft", icon: Icon.ChevronLeft },
    { name: "ChevronRight", icon: Icon.ChevronRight },
    { name: "ArrowClockwise", icon: Icon.ArrowClockwise },
    { name: "ArrowCounterClockwise", icon: Icon.ArrowCounterClockwise },
    { name: "Repeat", icon: Icon.Repeat },
    { name: "Rewind", icon: Icon.Rewind },
    { name: "Play", icon: Icon.Play },
    { name: "Pause", icon: Icon.Pause },
    { name: "Stop", icon: Icon.Stop },
  ],
  Symbols: [
    { name: "Tag", icon: Icon.Tag },
    { name: "Circle", icon: Icon.Circle },
    { name: "CircleFilled", icon: Icon.CircleFilled },
    { name: "Dot", icon: Icon.Dot },
    { name: "Minus", icon: Icon.Minus },
    { name: "Plus", icon: Icon.Plus },
    { name: "Multiply", icon: Icon.Multiply },
    { name: "AtSymbol", icon: Icon.AtSymbol },
  ],
};

interface InlineIconSelectionProps {
  title: string;
  onIconSelect: (icon: Icon) => void;
  currentIcon?: Icon;
}

export function createIconSelectionActions({
  title,
  onIconSelect,
  currentIcon,
}: InlineIconSelectionProps) {
  // Popular/frequently used icons for quick access
  const popularIcons = [
    { name: "Hammer", icon: Icon.Hammer, category: "Work" },
    { name: "Book", icon: Icon.Book, category: "Learning" },
    { name: "Heart", icon: Icon.Heart, category: "Personal" },
    { name: "Code", icon: Icon.Code, category: "Technology" },
    { name: "Calendar", icon: Icon.Calendar, category: "Work" },
    { name: "Brush", icon: Icon.Brush, category: "Creative" },
    { name: "List", icon: Icon.List, category: "Planning" },
    { name: "Message", icon: Icon.Message, category: "Communication" },
    { name: "Star", icon: Icon.Star, category: "Creative" },
    { name: "Clock", icon: Icon.Clock, category: "Time" },
  ];

  // Create search functionality organized by category
  const createSearchAction = () => (
    <ActionPanel.Submenu title="Search All Icons" icon={Icon.MagnifyingGlass}>
      {/* Popular icons first */}
      <ActionPanel.Section title="Popular">
        {popularIcons.map((iconItem) => (
          <Action
            key={`popular-${iconItem.name}`}
            title={`${iconItem.name} (${iconItem.category})${
              currentIcon === iconItem.icon ? " ✓" : ""
            }`}
            icon={iconItem.icon}
            onAction={() => onIconSelect(iconItem.icon)}
          />
        ))}
      </ActionPanel.Section>

      {/* All icons organized by category */}
      {Object.entries(ICON_CATEGORIES).map(([categoryName, icons]) => (
        <ActionPanel.Section
          key={`search-${categoryName}`}
          title={categoryName}
        >
          {icons.map((iconItem) => (
            <Action
              key={`search-${categoryName}-${iconItem.name}`}
              title={`${iconItem.name}${
                currentIcon === iconItem.icon ? " ✓" : ""
              }`}
              icon={iconItem.icon}
              onAction={() => onIconSelect(iconItem.icon)}
            />
          ))}
        </ActionPanel.Section>
      ))}
    </ActionPanel.Submenu>
  );

  return (
    <ActionPanel.Submenu title={title} icon={Icon.AppWindowSidebarLeft}>
      {/* Quick access section */}
      <ActionPanel.Section title="Quick Access">
        {createSearchAction()}

        {/* Show current selection if available */}
        {currentIcon && (
          <Action
            title="Keep Current Icon ✓"
            icon={currentIcon}
            onAction={() => onIconSelect(currentIcon)}
          />
        )}
      </ActionPanel.Section>

      {/* Category-based browsing with enhanced titles and visual indicators */}
      <ActionPanel.Section title="Browse by Category">
        {Object.entries(ICON_CATEGORIES).map(([categoryName, icons]) => {
          // Get a representative icon for each category
          const getCategoryIcon = (category: string) => {
            const categoryIcons: Record<string, Icon> = {
              Work: Icon.Hammer,
              Learning: Icon.Book,
              Creative: Icon.Brush,
              Planning: Icon.List,
              Personal: Icon.Heart,
              Technology: Icon.Code,
              Communication: Icon.Message,
              Navigation: Icon.ArrowRight,
              Symbols: Icon.Circle,
              Actions: Icon.Play,
              Time: Icon.Clock,
            };
            return categoryIcons[category] || icons[0].icon;
          };

          return (
            <ActionPanel.Submenu
              key={categoryName}
              title={`${categoryName} Icons (${icons.length})`}
              icon={getCategoryIcon(categoryName)}
            >
              <ActionPanel.Section title={`${categoryName} Category`}>
                {icons.map((iconItem) => (
                  <Action
                    key={iconItem.name}
                    title={`${iconItem.name}${
                      currentIcon === iconItem.icon ? " ✓" : ""
                    }`}
                    icon={iconItem.icon}
                    onAction={() => onIconSelect(iconItem.icon)}
                  />
                ))}
              </ActionPanel.Section>
            </ActionPanel.Submenu>
          );
        })}
      </ActionPanel.Section>

      {/* Clear action */}
      <ActionPanel.Section title="Reset">
        <Action
          title="Clear Icon"
          icon={Icon.XMarkCircle}
          onAction={() => onIconSelect(Icon.Hammer)}
        />
      </ActionPanel.Section>
    </ActionPanel.Submenu>
  );
}

// Helper function to create tag icon selection actions
export function createTagIconSelectionActions(
  tagName: string,
  updateTagConfig: (tagName: string, config: { icon?: Icon }) => void,
  currentIcon?: Icon
) {
  return createIconSelectionActions({
    title: "Select Icon",
    onIconSelect: (icon) => updateTagConfig(tagName, { icon }),
    currentIcon,
  });
}

// Helper function to create task icon selection actions
export function createTaskIconSelectionActions(
  onIconSelect: (icon: Icon) => void,
  currentIcon?: Icon
) {
  return createIconSelectionActions({
    title: "Select Task Icon",
    onIconSelect,
    currentIcon,
  });
}
