import {
  Action,
  ActionPanel,
  Icon,
  Detail,
  getPreferenceValues,
  Form
} from "@raycast/api"
import React, { useState } from "react"
import { useTimer } from "./hooks/useTimer"
import { useTimerStore } from "./store/timer-store"
import {
  formatTime,
  getSessionTypeLabel,
  getSessionTypeIcon,
  getProgressPercentage,
  formatSessionSummary
} from "./utils/helpers"
import { SessionType, TimerConfig } from "./types/timer"

interface Preferences {
  workDuration: string
  shortBreakDuration: string
  longBreakDuration: string
  longBreakInterval: string
  enableNotifications: boolean
  autoStartBreaks: boolean
  autoStartWork: boolean
}

export default function PomodoroTimer() {
  const preferences: Preferences = getPreferenceValues()
  const [taskName, setTaskName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [showTaskForm, setShowTaskForm] = useState(false)

  const {
    timeRemaining,
    currentSession,
    sessionCount,
    startWorkSession,
    startBreakSession,
    pause,
    resume,
    stop,
    reset,
    skip,
    getNextSessionType,
    isRunning,
    isPaused,
    isIdle
  } = useTimer()

  const { stats, updateConfig } = useTimerStore()

  // Update config from preferences on load
  React.useEffect(() => {
    const newConfig: TimerConfig = {
      workDuration: parseInt(preferences.workDuration) || 25,
      shortBreakDuration: parseInt(preferences.shortBreakDuration) || 5,
      longBreakDuration: parseInt(preferences.longBreakDuration) || 15,
      longBreakInterval: parseInt(preferences.longBreakInterval) || 4,
      enableNotifications: preferences.enableNotifications ?? true,
      autoStartBreaks: preferences.autoStartBreaks ?? false,
      autoStartWork: preferences.autoStartWork ?? false
    }
    updateConfig(newConfig)
  }, [preferences])

  const handleStartWork = () => {
    if (taskName.trim()) {
      startWorkSession(taskName.trim(), projectName.trim() || undefined)
      setTaskName("")
      setProjectName("")
      setShowTaskForm(false)
    } else {
      startWorkSession()
    }
  }

  const handleStartBreak = (isLong: boolean = false) => {
    startBreakSession(isLong)
  }

  const getTimerDisplay = () => {
    if (!currentSession) {
      return {
        title: "🍅 Pomodoro Timer",
        subtitle: "Ready to start your next session",
        progress: 0
      }
    }

    const progress = getProgressPercentage(timeRemaining, currentSession.duration)
    const sessionIcon = getSessionTypeIcon(currentSession.type)
    const sessionLabel = getSessionTypeLabel(currentSession.type)

    return {
      title: `${sessionIcon} ${sessionLabel}`,
      subtitle: `${formatTime(timeRemaining)} remaining`,
      progress
    }
  }

  const timerDisplay = getTimerDisplay()

  const markdown = `
# ${timerDisplay.title}

## ${timerDisplay.subtitle}

${currentSession ? `
### Session Details
- **Type**: ${getSessionTypeLabel(currentSession.type)}
- **Duration**: ${formatTime(currentSession.duration)}
- **Progress**: ${Math.round(timerDisplay.progress)}%
${currentSession.taskName ? `- **Task**: ${currentSession.taskName}` : ''}
${currentSession.projectName ? `- **Project**: ${currentSession.projectName}` : ''}

### Progress Bar
${'█'.repeat(Math.floor(timerDisplay.progress / 5))}${'░'.repeat(20 - Math.floor(timerDisplay.progress / 5))} ${Math.round(timerDisplay.progress)}%
` : ''}

### Today's Progress
${formatSessionSummary(
  stats.todaysSessions,
  stats.totalWorkTime,
  stats.todaysSessions
)}

### Session Statistics
- **Total Sessions**: ${stats.totalSessions}
- **Completed**: ${stats.completedSessions}
- **Work Sessions Today**: ${sessionCount}
- **Current Streak**: ${stats.streakCount} days

---

${isIdle ? '**Ready to start your next Pomodoro session!**' : ''}
${isRunning ? '**Stay focused! You\'re doing great!**' : ''}
${isPaused ? '**Timer paused. Resume when you\'re ready.**' : ''}
  `

  if (showTaskForm) {
    return (
      <Form
        actions={
          <ActionPanel>
            <Action
              title="Start Work Session"
              icon={Icon.Play}
              onAction={handleStartWork}
            />
            <Action
              title="Start Without Task"
              icon={Icon.Play}
              onAction={() => {
                startWorkSession()
                setShowTaskForm(false)
              }}
            />
            <Action
              title="Cancel"
              icon={Icon.XMarkCircle}
              onAction={() => setShowTaskForm(false)}
            />
          </ActionPanel>
        }
      >
        <Form.TextField
          id="taskName"
          title="Task Name"
          placeholder="What are you working on?"
          value={taskName}
          onChange={setTaskName}
        />
        <Form.TextField
          id="projectName"
          title="Project (Optional)"
          placeholder="Project or category"
          value={projectName}
          onChange={setProjectName}
        />
      </Form>
    )
  }

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Timer Controls">
            {isIdle && (
              <>
                <Action
                  title="Start Work Session"
                  icon={Icon.Play}
                  onAction={() => setShowTaskForm(true)}
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                />
                <Action
                  title="Quick Start Work"
                  icon={Icon.Play}
                  onAction={() => startWorkSession()}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                />
                <Action
                  title="Start Short Break"
                  icon={Icon.Pause}
                  onAction={() => handleStartBreak(false)}
                />
                <Action
                  title="Start Long Break"
                  icon={Icon.Pause}
                  onAction={() => handleStartBreak(true)}
                />
              </>
            )}

            {isRunning && (
              <>
                <Action
                  title="Pause Timer"
                  icon={Icon.Pause}
                  onAction={pause}
                  shortcut={{ modifiers: ["cmd"], key: "p" }}
                />
                <Action
                  title="Stop Timer"
                  icon={Icon.Stop}
                  onAction={stop}
                  shortcut={{ modifiers: ["cmd"], key: "s" }}
                />
                <Action
                  title="Skip Session"
                  icon={Icon.Forward}
                  onAction={skip}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                />
              </>
            )}

            {isPaused && (
              <>
                <Action
                  title="Resume Timer"
                  icon={Icon.Play}
                  onAction={resume}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
                <Action
                  title="Stop Timer"
                  icon={Icon.Stop}
                  onAction={stop}
                  shortcut={{ modifiers: ["cmd"], key: "s" }}
                />
                <Action
                  title="Reset Timer"
                  icon={Icon.ArrowClockwise}
                  onAction={reset}
                />
              </>
            )}
          </ActionPanel.Section>

          <ActionPanel.Section title="Quick Actions">
            {currentSession?.type === SessionType.WORK && (
              <Action
                title="Start Next Break"
                icon={Icon.Pause}
                onAction={() => {
                  const nextBreakType = getNextSessionType()
                  handleStartBreak(nextBreakType === SessionType.LONG_BREAK)
                }}
              />
            )}

            {currentSession?.type !== SessionType.WORK && (
              <Action
                title="Start Work Session"
                icon={Icon.Hammer}
                onAction={() => startWorkSession()}
              />
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  )
}
