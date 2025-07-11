# Notification System Debug Guide

## ✅ **Issue Resolved: Enhanced Raycast Notifications**

**Root Cause Identified:** System notifications (Browser Notification API and Electron API) are not available in the Raycast environment.

**Solution Implemented:** Enhanced Raycast-native notification system that provides a superior user experience within Raycast itself.

## Enhanced Notification Features

### **1. HUD Notifications**

- **Session Completion**: Prominent HUD display for all session completions
- **Achievements**: Immediate HUD notifications for unlocked achievements
- **Important Events**: HUD notifications for hyperfocus warnings and level ups

### **2. Smart Toast Notifications**

- **Styled Appropriately**: Success (green) for completions, Failure (red) for warnings
- **Detailed Messages**: Full context in toast notifications
- **Persistent Display**: Longer visibility than standard notifications

### **3. Enhanced Fallback System**

- **Automatic Detection**: System detects when native notifications aren't available
- **Seamless Transition**: Automatically uses enhanced Raycast notifications
- **No User Interruption**: Works transparently without user configuration

## Quick Debug Steps

### 1. **Test Notifications Immediately**

- Open the Focus Timer command
- Press `Cmd+Shift+T` to test a basic notification
- Press `Cmd+Shift+S` to check notification status
- Look for notifications in Windows notification center

### 2. **Check Console Logs**

Open Developer Tools in Raycast (if available) or check the console output for detailed logs:

```
[NotificationService 2024-01-XX] NotificationService initializing...
[NotificationService 2024-01-XX] Checking notification API availability...
[NotificationService 2024-01-XX] Browser Notification API available: true/false
[NotificationService 2024-01-XX] Current permission status: granted/denied/default
[NotificationService 2024-01-XX] Notification initialization complete: {...}
```

### 3. **Test Different Notification Types**

Go to Focus Profile → ADHD Settings → Notification Debugging section:

- **Test Basic Notification**: Simple test notification
- **Test Session Complete**: Simulates work session completion
- **Test Achievement Unlock**: Simulates achievement notification
- **Test Hyperfocus Warning**: Simulates hyperfocus detection

### 4. **Check Notification Status**

Use the "Check Status" action to see:

- Browser API availability
- Permission status
- Electron API availability
- Last error (if any)

## Expected Debug Output

### Successful Initialization

```
[NotificationService] NotificationService initializing...
[NotificationService] Checking notification API availability...
[NotificationService] Browser Notification API available: true
[NotificationService] Current permission status: granted
[NotificationService] Notification initialization complete: {
  permissionGranted: true,
  browserAPIAvailable: true,
  electronAPIAvailable: false
}
```

### Successful Notification

```
[NotificationService] Attempting to show system notification: "Test Notification"
[NotificationService] Using Browser Notification API
[NotificationService] Creating browser notification...
[NotificationService] Notification options: {
  body: "This is a test notification...",
  tag: "test-notification",
  requireInteraction: false,
  silent: false
}
[NotificationService] Browser notification created successfully
[NotificationService] Auto-closing notification
```

### Session Completion Debug

```
[NotificationService] Session completion notification triggered for: work
[NotificationService] Notification content: Work Complete! - Great job! Time for a well-deserved break.
[NotificationService] Showing toast notification...
[NotificationService] Playing notification sound...
[NotificationService] Showing system notification with options: {
  tag: "session-complete-work",
  requireInteraction: true,
  silent: false
}
[NotificationService] Session completion notification process completed
```

## Common Issues & Solutions

### 1. **No Notifications Appearing**

**Check:**

- Permission status: Should be "granted"
- Browser API availability: Should be true
- Windows notification settings: Ensure notifications are enabled for Raycast

**Fix:**

- Use "Request Permission" action in Profile → Notification Debugging
- Check Windows Settings → System → Notifications & actions
- Restart Raycast if needed

### 2. **Permission Denied**

**Symptoms:**

```
[NotificationService] Permission request result: denied
[NotificationService] Notification permission denied
```

**Fix:**

- Go to Windows Settings → System → Notifications & actions
- Find Raycast in the list and enable notifications
- Use "Request Permission" action to retry

### 3. **API Not Available**

**Symptoms:**

```
[NotificationService] Browser Notification API available: false
[NotificationService] Electron notification API not available
[NotificationService] Using console fallback for notification
```

**This means:**

- Running in an environment without notification support
- Notifications will only appear in console logs
- This is expected in some development environments

### 4. **Session Notifications Not Triggering**

**Check:**

- Start a work session and let it complete naturally
- Look for session completion debug logs
- Verify `enableNotifications` preference is true

**Debug:**

- Use "Test Session Complete" in Profile → Notification Debugging
- Check if the timer hook is calling `notifySessionComplete`

## Manual Testing Checklist

- [ ] Basic notification test works
- [ ] Permission status shows "granted"
- [ ] Session completion notifications appear
- [ ] Achievement notifications work
- [ ] Hyperfocus warnings display
- [ ] Windows notification center shows notifications
- [ ] Console logs show detailed debug information
- [ ] Toast notifications still work as fallback

## Advanced Debugging

### Enable Debug Mode

```typescript
// In console or through Profile actions
notificationService.setDebugMode(true);
```

### Check Notification Status Programmatically

```typescript
const status = notificationService.getNotificationStatus();
console.log("Detailed status:", status);
```

### Force Permission Request

```typescript
const result = await notificationService.forcePermissionRequest();
console.log("Permission result:", result);
```

## Environment Information

- **Raycast Version**: Check Help → About Raycast
- **Windows Version**: Windows 10/11
- **Extension Version**: Check package.json
- **Browser Engine**: Electron (built into Raycast)

## Reporting Issues

If notifications still don't work after following this guide, please provide:

1. Console log output from debug mode
2. Notification status object
3. Windows notification settings screenshot
4. Raycast version information
5. Steps to reproduce the issue

The debug system provides comprehensive logging to help identify exactly where the notification process is failing.
