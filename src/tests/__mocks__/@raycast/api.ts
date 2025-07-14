/**
 * Mock implementation of @raycast/api for testing
 */

export const Toast = {
  Style: {
    Success: 'success',
    Failure: 'failure',
    Animated: 'animated'
  }
};

export const showToast = jest.fn();

export const getPreferenceValues = jest.fn(() => ({}));

export const LocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

export const environment = {
  commandName: 'test-command',
  extensionName: 'test-extension'
};

export const Icon = {
  // Common icons used in tests
  Play: 'play',
  Pause: 'pause',
  Stop: 'stop',
  Clock: 'clock',
  CheckCircle: 'check-circle',
  XCircle: 'x-circle',
  Tag: 'tag',
  Person: 'person',
  Hammer: 'hammer',
  Book: 'book',
  Heart: 'heart'
};

export const Color = {
  Red: 'red',
  Green: 'green',
  Blue: 'blue',
  Yellow: 'yellow',
  Orange: 'orange',
  Purple: 'purple',
  PrimaryText: 'primary-text',
  SecondaryText: 'secondary-text'
};

// Mock React components
export const List = ({ children, ...props }: any) => children;
List.Item = ({ children, ...props }: any) => children;
List.Section = ({ children, ...props }: any) => children;

export const Detail = ({ children, ...props }: any) => children;

export const Form = ({ children, ...props }: any) => children;
Form.TextField = ({ children, ...props }: any) => children;
Form.Dropdown = ({ children, ...props }: any) => children;
Form.Dropdown.Item = ({ children, ...props }: any) => children;

export const ActionPanel = ({ children, ...props }: any) => children;
ActionPanel.Section = ({ children, ...props }: any) => children;

export const Action = ({ children, ...props }: any) => children;
Action.Push = ({ children, ...props }: any) => children;
Action.Pop = ({ children, ...props }: any) => children;

export const popToRoot = jest.fn();
export const closeMainWindow = jest.fn();

// Navigation functions
export const useNavigation = jest.fn(() => ({
  push: jest.fn(),
  pop: jest.fn()
}));

// Preferences mock
export const getPreferences = jest.fn(() => ({}));

// Cache mock
export const Cache = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn()
}));

export default {
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
  getPreferences,
  Cache
};
