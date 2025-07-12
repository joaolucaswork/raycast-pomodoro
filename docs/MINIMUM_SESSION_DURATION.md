# Minimum Session Duration Feature

## Overview

The Focus Timer now implements a minimum session duration requirement for sessions to be saved to history. This prevents very short sessions from cluttering the history and statistics.

## Configuration

- **Minimum Duration**: 40 seconds
- **Applies to**: All session types (work, short break, long break)
- **Actions affected**: Complete, Stop, Skip

## Behavior

### Sessions ≥ 40 seconds
- ✅ Saved to history
- ✅ Count towards statistics
- ✅ Count towards achievements
- ✅ Count towards focus period progress

### Sessions < 40 seconds
- ❌ Not saved to history
- ❌ Don't count towards statistics
- ❌ Don't count towards achievements
- ❌ Don't count towards focus period progress
- ℹ️ User receives notification explaining why session wasn't saved

## User Experience

When a user completes, stops, or skips a session that is shorter than 40 seconds, they will see a toast notification:

**For completed sessions:**
> "Session Too Short: Session completed in 25s but won't be saved to history (minimum: 40s)"

**For stopped sessions:**
> "Session Too Short: Session stopped after 15s and won't be saved to history (minimum: 40s)"

**For skipped sessions:**
> "Session Too Short: Session skipped after 30s and won't be saved to history (minimum: 40s)"

## Technical Implementation

### Key Functions

1. `shouldSaveSessionToHistory(session)` - Determines if a session meets the minimum duration
2. `getActualSessionDuration(session)` - Calculates the actual time spent in a session
3. `MIN_SESSION_DURATION_FOR_HISTORY` - Constant defining the minimum duration (40 seconds)

### Modified Components

- **Timer Store** (`timer-store.ts`):
  - `completeSession()` - Checks duration before saving
  - `stopTimer()` - Checks duration before saving
  - `skipSession()` - Checks duration before saving

- **Background Timer Service** (`background-timer-service.ts`):
  - `handleTimerCompletion()` - Checks duration for automatic completions

### Duration Calculation

The actual session duration is calculated as:
```typescript
const actualDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
```

This ensures accurate timing regardless of the original session duration setting.

## Benefits

1. **Cleaner History**: Prevents accidental short sessions from cluttering the history
2. **Better Statistics**: More accurate productivity metrics
3. **User Awareness**: Clear feedback when sessions are too short
4. **Consistent Behavior**: Same logic applies across all session end scenarios

## Testing

To test the functionality:
1. Start a focus session
2. Complete/stop/skip it within 40 seconds
3. Verify the notification appears
4. Check that the session doesn't appear in history
5. Verify statistics remain unchanged
