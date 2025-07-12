# Preference Synchronization Fix

## Problem Description

The work duration pre-selection setting on the Raycast native preferences page was not updating the session duration for focus sessions. When a user changed the work duration in the extension's native Raycast preferences/settings, the new duration was not reflected in the focus session timer, which continued to use the previous/default duration instead of the newly selected preference value.

## Root Cause Analysis

The issue was caused by a lack of real-time preference synchronization:

1. **Timer store initialized once**: The timer store was initialized only when the module loaded, reading preferences once at startup
2. **No preference change detection**: Raycast extensions don't have a built-in mechanism to detect when preferences change in real-time
3. **Cached configuration**: The config was cached in the Zustand store and only updated when `refreshConfigFromPreferences()` was explicitly called
4. **Missing refresh triggers**: There were no triggers to refresh preferences when users returned to the extension after changing settings

## Solution Implementation

### 1. Enhanced Main Command Initialization

**File**: `src/commands/main/hooks/use-session-management.tsx`

- Added preference refresh at component mount before timer state initialization
- Added window focus and visibility change event listeners to refresh preferences when user returns to extension
- Added preference refresh before starting each new session to ensure latest duration settings

```typescript
// Refresh config from preferences first to ensure we have the latest settings
const { refreshConfigFromPreferences } = useTimerStore.getState();
refreshConfigFromPreferences();

// Additional refresh on component mount
useEffect(() => {
  const { refreshConfigFromPreferences } = useTimerStore.getState();
  refreshConfigFromPreferences();
  console.log("[useSessionManagement] Additional config refresh on mount");
}, []);

// Refresh before starting session
const handleStartWork = useCallback(async () => {
  const { refreshConfigFromPreferences } = useTimerStore.getState();
  refreshConfigFromPreferences();
  // ... rest of session start logic
}, []);
```

### 2. Timer History Command Enhancement

**File**: `src/timer-history.tsx`

- Added preference refresh when the history command is opened
- Ensures consistent configuration across all extension commands

```typescript
// Refresh preferences when the history command is opened
useEffect(() => {
  refreshConfigFromPreferences();
  console.log("[TimerHistory] Refreshed config from preferences");
}, [refreshConfigFromPreferences]);
```

### 3. Profile Command Enhancement

**File**: `src/profile-command.tsx`

- Added preference refresh when the profile command is opened
- Maintains configuration consistency across the entire extension

```typescript
// Refresh preferences when the profile command is opened
useEffect(() => {
  refreshConfigFromPreferences();
  console.log("[ProfileCommand] Refreshed config from preferences");
}, [refreshConfigFromPreferences]);
```

### 4. Test Implementation

**File**: `src/test-preference-sync.ts`

- Created comprehensive tests to verify preference synchronization
- Tests both config refresh and session duration synchronization
- Provides debugging tools for future preference-related issues

## How It Works

### Preference Refresh Triggers

1. **Extension Launch**: Preferences are refreshed when any command is first opened
2. **Window Focus**: Preferences are refreshed when the user returns to the extension window
3. **Tab Visibility**: Preferences are refreshed when the extension tab becomes visible
4. **Session Start**: Preferences are refreshed immediately before starting a new focus session

### User Workflow

1. User opens Raycast extension preferences (Cmd+,)
2. User changes work duration from 25 minutes to 45 minutes
3. User returns to the extension
4. Extension automatically detects the focus/visibility change and refreshes preferences
5. Session setup now shows "45 min" instead of "25 min"
6. When user starts a session, it uses the new 45-minute duration

### Fallback Mechanisms

- If window focus events don't fire, preferences are still refreshed before each session start
- If user navigates between commands, each command refreshes preferences on mount
- Console logging provides debugging information for troubleshooting

## Testing

### Manual Testing Steps

1. Start the extension and note the current work duration
2. Open Raycast preferences (Cmd+,)
3. Change the work duration setting
4. Return to the extension
5. Verify the session setup shows the new duration
6. Start a session and verify it uses the new duration

### Automated Testing

Run the test script to verify synchronization:

```typescript
import { runAllPreferenceSyncTests } from "./src/test-preference-sync";
runAllPreferenceSyncTests();
```

## Benefits

- **Immediate Synchronization**: Changes to preferences are reflected immediately when returning to the extension
- **Consistent Behavior**: All commands now refresh preferences consistently
- **Better User Experience**: No need to restart the extension after changing preferences
- **Debugging Support**: Console logging helps identify synchronization issues
- **Future-Proof**: Framework supports adding more preference refresh triggers as needed

## Technical Notes

- Uses native browser events (focus, visibilitychange) for reliable detection
- Minimal performance impact as preference reading is lightweight
- Maintains backward compatibility with existing functionality
- Leverages existing `refreshConfigFromPreferences()` method from the config slice
