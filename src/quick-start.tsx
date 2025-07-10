import { showToast, Toast, getPreferenceValues, closeMainWindow } from "@raycast/api"
import { useTimerStore } from "./store/timer-store"
import { SessionType, TimerConfig } from "./types/timer"
import { getMotivationalMessage } from "./utils/helpers"

interface Preferences {
  workDuration: string
  shortBreakDuration: string
  longBreakDuration: string
  longBreakInterval: string
  enableNotifications: boolean
  autoStartBreaks: boolean
  autoStartWork: boolean
}

export default function QuickStart() {
  const preferences: Preferences = getPreferenceValues()
  const { startTimer, updateConfig, sessionCount } = useTimerStore()

  // Update config from preferences
  const config: TimerConfig = {
    workDuration: parseInt(preferences.workDuration) || 25,
    shortBreakDuration: parseInt(preferences.shortBreakDuration) || 5,
    longBreakDuration: parseInt(preferences.longBreakDuration) || 15,
    longBreakInterval: parseInt(preferences.longBreakInterval) || 4,
    enableNotifications: preferences.enableNotifications ?? true,
    autoStartBreaks: preferences.autoStartBreaks ?? false,
    autoStartWork: preferences.autoStartWork ?? false
  }

  updateConfig(config)

  // Start a work session immediately
  startTimer(SessionType.WORK)

  showToast({
    style: Toast.Style.Success,
    title: "Work session started!",
    message: getMotivationalMessage(SessionType.WORK, sessionCount)
  })

  // Close the main window to get out of the user's way
  closeMainWindow()

  return null
}
