# Session Completion Testing Guide

## Issue Summary
Sessions are not being saved to history after completion. The problem was identified as a conflict between two timer completion systems:

1. **useTimer hook** - Uses setInterval for UI countdown
2. **Background timer service** - Uses timestamp-based tracking

## Fix Applied
1. **Disabled useTimer completion logic** - Removed the `handleTimerComplete()` function that was causing race conditions
2. **Trigger background service** - When useTimer countdown reaches zero, it now calls `backgroundTimerService.updateTimerState()` to handle completion
3. **Added debugging logs** - Added console logs to track session completion flow

## Testing Steps

### 1. Manual Testing
1. Start a work session with a task name (e.g., "Test Task")
2. Let the timer run for at least 45 seconds (above the 40-second minimum)
3. Wait for the timer to complete automatically
4. Check the console logs for completion messages
5. Navigate to "Another Round History" to verify the session appears

### 2. Console Log Monitoring
Look for these log messages during completion:

```
[useTimer] Timer reached zero, triggering background service completion
[TimerCompletionService] Session completion details: { sessionId, type, taskName, actualDuration, shouldSave, shouldSaveToHistory, currentHistoryLength }
[SessionSlice] Completing session: { sessionId, type, taskName, startTime }
[SessionSlice] Session completion details: { actualDuration, shouldSave, minimumRequired: 40, currentHistoryLength }
[SessionSlice] Session completion result: { savedToHistory, newHistoryLength, lastCompletedSessionId }
[TimerCompletionService] Store updated after completion: { newHistoryLength, savedToHistory, newState, lastCompletedSessionId }
```

### 3. Expected Behavior
- Sessions longer than 40 seconds should be saved to history
- Sessions shorter than 40 seconds should show a toast notification and NOT be saved
- The history page should display completed sessions with proper task names
- Statistics should update to reflect the completed sessions

### 4. Debugging Short Sessions
If testing with sessions shorter than 40 seconds:
- Should see: "Session completed in Xs but won't be saved to history (minimum: 40s)" toast
- Should NOT appear in history
- `shouldSave` and `shouldSaveToHistory` should be `false` in logs

## Branding Updates Applied
- History page title: "Focus History" → "Another Round History"
- Search placeholder: "Search rounds..." → "Search training rounds..."
- Empty state title: "No Focus Sessions" → "No Training Rounds"
- Empty state description: Updated to use "Another Round training history"

## Next Steps
1. Test the fix with various session lengths
2. Verify that statistics are updating correctly
3. Confirm that mood tracking still works with completed sessions
4. Test auto-start functionality after completion
