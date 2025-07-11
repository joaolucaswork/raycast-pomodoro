# Windows Notifications Enhancement

## Overview

The Raycast Pomodoro extension now supports enhanced Windows notifications that appear in the Windows notification center alongside the existing Raycast toast notifications.

## Features

### Native Windows Notifications
- **Timer Completion Alerts**: System notifications when work sessions or breaks complete
- **Achievement Unlocks**: Prominent notifications when you unlock new achievements
- **Hyperfocus Detection**: Important warnings when extended focus sessions are detected
- **Level Up Notifications**: Celebratory notifications when you reach a new level
- **Transition Warnings**: Subtle reminders before sessions end (ADHD-friendly)

### Smart Notification Behavior
- **Permission Handling**: Automatically requests notification permissions on first use
- **Fallback System**: Gracefully falls back to console logging if notifications aren't available
- **Interaction Control**: Important notifications (like hyperfocus warnings) require user interaction
- **Auto-dismiss**: Most notifications auto-close after 5 seconds to avoid clutter
- **Silent Options**: Transition warnings are silent to avoid disruption

## Notification Types

### 1. Session Completion
- **Work Sessions**: Require interaction to ensure you take breaks
- **Break Sessions**: Auto-dismiss to smoothly transition back to work
- **Tag**: `session-complete-{sessionType}`

### 2. ADHD Support Features
- **Hyperfocus Warnings**: Require interaction, not silent
- **Transition Warnings**: Silent, auto-dismiss
- **Tags**: `hyperfocus-warning`, `transition-warning-{minutes}min`

### 3. Reward System
- **Achievements**: Celebratory, auto-dismiss, not silent
- **Level Up**: Celebratory, auto-dismiss, not silent
- **Points**: Only for significant gains (10+ points), silent
- **Tags**: `achievement-{name}`, `level-up-{level}`, `points-earned`

## Technical Implementation

### Browser Notification API
The extension uses the standard browser Notification API which works in Electron-based applications like Raycast:

```typescript
// Request permission
await Notification.requestPermission();

// Show notification
const notification = new Notification(title, {
  body: message,
  tag: 'unique-identifier',
  requireInteraction: false,
  silent: true
});
```

### Fallback System
1. **Primary**: Browser Notification API (works in Raycast/Electron)
2. **Secondary**: Electron's native notification system (if available)
3. **Fallback**: Console logging for debugging

### Permission Management
- Permissions are requested automatically when the extension initializes
- If permission is denied, notifications fall back to Raycast toasts only
- No user interruption if notifications aren't supported

## User Experience

### Profile Navigation Fix
The "View Full Profile" action now provides helpful guidance instead of broken navigation:
- **Copy Command**: Copies "Focus Profile" to clipboard for easy access
- **Instructions**: Shows toast with clear steps to access the full profile
- **No More Errors**: Eliminates the blinking/disappearing interface issue

### Windows Integration
- Notifications appear in the Windows Action Center
- Consistent with Windows notification styling
- Respects Windows notification settings and Do Not Disturb mode
- Works alongside existing Raycast toast notifications

## Configuration

All notification features respect existing extension preferences:
- `enableNotifications`: Controls audio notifications (unchanged)
- `enableRewardSystem`: Controls achievement and level notifications
- `enableTransitionWarnings`: Controls ADHD transition warnings
- `enableHyperfocusDetection`: Controls hyperfocus warning notifications

## Compatibility

- **Windows 10/11**: Full native notification support
- **Raycast Environment**: Tested and optimized for Raycast on Windows
- **Electron Apps**: Compatible with Electron-based applications
- **Graceful Degradation**: Falls back to existing toast notifications if system notifications aren't available

## Benefits

1. **Better Visibility**: System notifications are more prominent than in-app toasts
2. **Persistent Reminders**: Notifications remain in the notification center until dismissed
3. **ADHD-Friendly**: Configurable interaction requirements and sound settings
4. **Non-Intrusive**: Smart auto-dismiss and silent options for different notification types
5. **Windows Integration**: Native Windows notification center integration
