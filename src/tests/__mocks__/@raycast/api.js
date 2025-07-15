const React = require('react');

const Toast = {
  Style: {
    Success: "success",
    Failure: "failure",
    Animated: "animated",
  },
};

const showToast = jest.fn();
const getPreferenceValues = jest.fn(() => ({}));

const LocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const environment = {
  commandName: "test-command",
  extensionName: "test-extension",
};

const Icon = {
  Play: "play",
  Pause: "pause",
  Stop: "stop",
  Clock: "clock",
  CheckCircle: "check-circle",
  XCircle: "x-circle",
  XMarkCircle: "x-mark-circle",
  Tag: "tag",
  Person: "person",
  Hammer: "hammer",
  Book: "book",
  Heart: "heart",
  Code: "code",
  Desktop: "desktop",
  Mug: "mug",
  Dot: "dot",
  BarChart: "bar-chart",
  Trophy: "trophy",
  Star: "star",
  BullsEye: "bulls-eye",
  ExclamationMark: "exclamation-mark",
  Bolt: "bolt",
  Cloud: "cloud",
  Rocket: "rocket",
  Circle: "circle",
  Battery: "battery",
  Warning: "warning",
  QuestionMark: "question-mark",
  ArrowClockwise: "arrow-clockwise",
  Forward: "forward",
  Eye: "eye",
  ArrowLeft: "arrow-left",
  Clipboard: "clipboard",
  Gear: "gear",
  SaveDocument: "save-document",
  Pencil: "pencil",
  Trash: "trash",
  Crown: "crown",
  Info: "info",
};

const Color = {
  Red: "red",
  Green: "green",
  Blue: "blue",
  Yellow: "yellow",
  Orange: "orange",
  Purple: "purple",
  PrimaryText: "primary-text",
  SecondaryText: "secondary-text",
};

// Mock React components
const List = ({ children, searchBarAccessory, ...props }) => 
  React.createElement("div", { "data-testid": "list" }, searchBarAccessory, children);

List.Item = ({ children, title, subtitle, accessories, actions, ...props }) => 
  React.createElement("div", { 
    "data-testid": "list-item", 
    "data-title": title, 
    "data-subtitle": subtitle 
  }, children, actions);

List.Section = ({ children, title, ...props }) => 
  React.createElement("div", { 
    "data-testid": "list-section", 
    "data-title": title 
  }, children);

List.EmptyView = ({ children, title, description, ...props }) => 
  React.createElement("div", { 
    "data-testid": "list-empty-view", 
    "data-title": title, 
    "data-description": description 
  }, children);

const ListDropdown = ({ children, tooltip, value, onChange, ...props }) => 
  React.createElement("div", { 
    "data-testid": "list-dropdown", 
    "data-tooltip": tooltip, 
    "data-value": value 
  }, children);

ListDropdown.Item = ({ children, title, value, ...props }) => 
  React.createElement("div", { 
    "data-testid": "list-dropdown-item", 
    "data-title": title, 
    "data-value": value 
  }, children);

List.Dropdown = ListDropdown;

const Detail = ({ children, markdown, navigationTitle, ...props }) => {
  const markdownElement = markdown ? React.createElement("div", { "data-testid": "detail-markdown" }, markdown) : null;
  return React.createElement("div", { 
    "data-testid": "detail", 
    "data-navigation-title": navigationTitle 
  }, markdownElement, children);
};

const Form = ({ children, navigationTitle, actions, ...props }) => 
  React.createElement("div", { 
    "data-testid": "form", 
    "data-navigation-title": navigationTitle 
  }, children, actions);

Form.TextField = ({ children, id, title, value, onChange, ...props }) => 
  React.createElement("div", { 
    "data-testid": "form-textfield", 
    "data-id": id, 
    "data-title": title, 
    "data-value": value 
  }, children);

const FormDropdown = ({ children, id, title, value, onChange, ...props }) => 
  React.createElement("div", { 
    "data-testid": "form-dropdown", 
    "data-id": id, 
    "data-title": title, 
    "data-value": value 
  }, children);

FormDropdown.Item = ({ children, title, value, ...props }) => 
  React.createElement("div", { 
    "data-testid": "form-dropdown-item", 
    "data-title": title, 
    "data-value": value 
  }, children);

Form.Dropdown = FormDropdown;

const ActionPanel = ({ children, title, ...props }) => 
  React.createElement("div", { 
    "data-testid": "action-panel", 
    "data-title": title 
  }, children);

ActionPanel.Section = ({ children, title, ...props }) => 
  React.createElement("div", { 
    "data-testid": "action-panel-section", 
    "data-title": title 
  }, children);

const Action = ({ children, title, icon, onAction, ...props }) => 
  React.createElement("div", { 
    "data-testid": "action", 
    "data-title": title, 
    "data-icon": icon,
    onClick: onAction
  }, children);

Action.Push = ({ children, title, icon, target, ...props }) => 
  React.createElement("div", { 
    "data-testid": "action-push", 
    "data-title": title, 
    "data-icon": icon,
    "data-target": target
  }, children);

Action.Pop = ({ children, title, icon, ...props }) => 
  React.createElement("div", { 
    "data-testid": "action-pop", 
    "data-title": title, 
    "data-icon": icon
  }, children);

const popToRoot = jest.fn();
const closeMainWindow = jest.fn();

const mockPush = jest.fn();
const mockPop = jest.fn();

const useNavigation = jest.fn(() => ({
  push: mockPush,
  pop: mockPop,
}));

const navigationMocks = {
  push: mockPush,
  pop: mockPop,
};

const getPreferences = jest.fn(() => ({}));

const Cache = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
}));

module.exports = {
  Toast,
  showToast,
  getPreferenceValues,
  LocalStorage,
  environment,
  Icon,
  Color,
  List,
  Detail,
  Form,
  ActionPanel,
  Action,
  popToRoot,
  closeMainWindow,
  useNavigation,
  navigationMocks,
  getPreferences,
  Cache,
};
