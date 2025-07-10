import {
  Action,
  ActionPanel,
  Icon,
  List,
  Detail,
  showToast,
  Toast
} from "@raycast/api"
import { useState } from "react"
import { useTimerStore } from "./store/timer-store"
import {
  formatTime,
  formatDuration,
  getSessionTypeLabel,
  getSessionTypeIcon,
  calculateProductivityScore
} from "./utils/helpers"
import { SessionType, TimerSession } from "./types/timer"
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns"
import { dataService } from "./services/data-service"
import { taskService } from "./services/task-service"

export default function TimerHistory() {
  const [selectedSession, setSelectedSession] = useState<TimerSession | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list')
  const { history } = useTimerStore()

  if (selectedSession) {
    return <SessionDetail session={selectedSession} onBack={() => setSelectedSession(null)} />
  }

  if (viewMode === 'stats') {
    return <StatsView onBack={() => setViewMode('list')} />
  }

  const groupedSessions = groupSessionsByDate(history)
  
  return (
    <List
      searchBarPlaceholder="Search sessions..."
      actions={
        <ActionPanel>
          <Action
            title="View Statistics"
            icon={Icon.BarChart}
            onAction={() => setViewMode('stats')}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
          />
        </ActionPanel>
      }
    >
      {Object.entries(groupedSessions).map(([dateGroup, sessions]) => (
        <List.Section key={dateGroup} title={dateGroup}>
          {sessions.map((session) => (
            <List.Item
              key={session.id}
              title={getSessionTypeLabel(session.type)}
              subtitle={getSessionSubtitle(session)}
              icon={getSessionTypeIcon(session.type)}
              accessories={[
                { text: formatTime(session.duration) },
                { icon: session.completed ? Icon.Checkmark : Icon.XMarkCircle }
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="View Details"
                    icon={Icon.Eye}
                    onAction={() => setSelectedSession(session)}
                  />
                  <Action
                    title="View Statistics"
                    icon={Icon.BarChart}
                    onAction={() => setViewMode('stats')}
                    shortcut={{ modifiers: ["cmd"], key: "s" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
      
      {history.length === 0 && (
        <List.EmptyView
          title="No sessions yet"
          description="Start your first Pomodoro session to see your history here"
          icon="🍅"
        />
      )}
    </List>
  )
}

function SessionDetail({ session, onBack }: { session: TimerSession; onBack: () => void }) {
  const duration = session.endTime 
    ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : session.duration

  const markdown = `
# ${getSessionTypeIcon(session.type)} ${getSessionTypeLabel(session.type)}

## Session Details
- **Started**: ${format(session.startTime, 'PPpp')}
${session.endTime ? `- **Ended**: ${format(session.endTime, 'PPpp')}` : ''}
- **Planned Duration**: ${formatTime(session.duration)}
- **Actual Duration**: ${formatTime(duration)}
- **Status**: ${session.completed ? '✅ Completed' : '❌ Incomplete'}
${session.taskName ? `- **Task**: ${session.taskName}` : ''}
${session.projectName ? `- **Project**: ${session.projectName}` : ''}

## Performance
${session.completed ? 
  `Great job completing this session! ${session.type === SessionType.WORK ? 'You stayed focused and productive.' : 'You took a well-deserved break.'}` :
  'This session was not completed. That\'s okay - every attempt counts towards building your focus habit!'
}

${session.type === SessionType.WORK && session.completed ? 
  '🎯 **Productivity Tip**: Completed work sessions contribute to your daily focus streak!' : ''
}
  `

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action
            title="Back to History"
            icon={Icon.ArrowLeft}
            onAction={onBack}
          />
        </ActionPanel>
      }
    />
  )
}

function StatsView({ onBack }: { onBack: () => void }) {
  const { stats, history } = useTimerStore()

  const workSessions = history.filter((s: TimerSession) => s.type === SessionType.WORK && s.completed)
  const breakSessions = history.filter((s: TimerSession) => s.type !== SessionType.WORK && s.completed)

  const detailedStats = dataService.calculateDetailedStats(history)
  const taskStats = taskService.getTaskStats()
  const productivityScore = calculateProductivityScore(stats.completedSessions, stats.totalSessions)
  
  const markdown = `
# 📊 Pomodoro Statistics

## Overview
- **Total Sessions**: ${stats.totalSessions}
- **Completed Sessions**: ${stats.completedSessions}
- **Productivity Score**: ${productivityScore}%
- **Completion Rate**: ${detailedStats.completionRate.toFixed(1)}%
- **Current Streak**: ${stats.streakCount} days
- **Longest Streak**: ${detailedStats.longestStreak} days

## Time Analysis
- **Total Work Time**: ${formatDuration(stats.totalWorkTime)}
- **Total Break Time**: ${formatDuration(stats.totalBreakTime)}
- **Average Session Length**: ${detailedStats.averageSessionLength.toFixed(1)} minutes
- **Most Productive Hour**: ${detailedStats.mostProductiveHour}:00
- **Most Productive Day**: ${detailedStats.mostProductiveDay}

## Recent Activity
- **Today**: ${stats.todaysSessions} sessions
- **This Week**: ${stats.weekSessions} sessions
- **This Month**: ${stats.monthSessions} sessions

## Session Breakdown
- **Work Sessions**: ${workSessions.length} completed
- **Break Sessions**: ${breakSessions.length} completed
- **Short Breaks**: ${breakSessions.filter(s => s.type === SessionType.SHORT_BREAK).length}
- **Long Breaks**: ${breakSessions.filter(s => s.type === SessionType.LONG_BREAK).length}

## Task & Project Stats
- **Total Tasks**: ${taskStats.totalTasks}
- **Completed Tasks**: ${taskStats.completedTasks}
- **Total Projects**: ${taskStats.totalProjects}
- **Average Pomodoros/Task**: ${taskStats.averagePomodorosPerTask.toFixed(1)}
${taskStats.mostProductiveProject ? `- **Most Productive Project**: ${taskStats.mostProductiveProject}` : ''}

## Productivity Insights
${getProductivityInsights(detailedStats)}

---

${stats.streakCount > 0 ?
  `🔥 **${stats.streakCount} Day Streak!** Keep up the great work!` :
  '💪 **Start Your Streak!** Complete sessions daily to build momentum.'
}
  `

  const handleExportJSON = async () => {
    try {
      const jsonData = dataService.exportDataAsJSON()
      // Clipboard not available in Raycast environment
      console.log('JSON Export:', jsonData)
      await showToast({
        style: Toast.Style.Success,
        title: "Data Exported",
        message: "JSON data logged to console"
      })
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Export Failed",
        message: "Could not export data"
      })
    }
  }

  const handleExportCSV = async () => {
    try {
      const csvData = dataService.exportDataAsCSV()
      console.log('CSV Export:', csvData)
      await showToast({
        style: Toast.Style.Success,
        title: "Data Exported",
        message: "CSV data logged to console"
      })
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Export Failed",
        message: "Could not export data"
      })
    }
  }

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action
            title="Back to History"
            icon={Icon.ArrowLeft}
            onAction={onBack}
          />
          <ActionPanel.Section title="Export Data">
            <Action
              title="Export as JSON"
              icon={Icon.Document}
              onAction={handleExportJSON}
            />
            <Action
              title="Export as CSV"
              icon={Icon.Document}
              onAction={handleExportCSV}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  )
}

function groupSessionsByDate(sessions: TimerSession[]): Record<string, TimerSession[]> {
  const groups: Record<string, TimerSession[]> = {}
  
  sessions
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .forEach(session => {
      let groupKey: string
      
      if (isToday(session.startTime)) {
        groupKey = 'Today'
      } else if (isYesterday(session.startTime)) {
        groupKey = 'Yesterday'
      } else if (isThisWeek(session.startTime)) {
        groupKey = format(session.startTime, 'EEEE')
      } else if (isThisMonth(session.startTime)) {
        groupKey = format(session.startTime, 'MMMM d')
      } else {
        groupKey = format(session.startTime, 'MMMM yyyy')
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(session)
    })
  
  return groups
}

function getSessionSubtitle(session: TimerSession): string {
  const time = format(session.startTime, 'HH:mm')
  let subtitle = time
  
  if (session.taskName) {
    subtitle += ` • ${session.taskName}`
  }
  
  if (session.projectName) {
    subtitle += ` (${session.projectName})`
  }
  
  return subtitle
}

function getProductivityInsights(detailedStats: any): string {
  const insights: string[] = []

  if (detailedStats.completedSessions === 0) {
    insights.push('🌱 **Getting Started**: Complete your first session to unlock insights!')
  } else {
    const completionRate = detailedStats.completionRate

    if (completionRate >= 80) {
      insights.push('🌟 **Excellent Focus**: You complete most of your sessions!')
    } else if (completionRate >= 60) {
      insights.push('👍 **Good Consistency**: You\'re building a solid focus habit.')
    } else {
      insights.push('💪 **Room for Growth**: Try shorter sessions to improve completion rate.')
    }

    if (detailedStats.streakCount >= 7) {
      insights.push('🔥 **Streak Master**: A week+ streak shows great dedication!')
    } else if (detailedStats.streakCount >= 3) {
      insights.push('📈 **Building Momentum**: Your consistency is paying off!')
    }

    if (detailedStats.todaysSessions >= 4) {
      insights.push('🎯 **Productive Day**: You\'re having a focused day!')
    }

    if (detailedStats.averageSessionLength > 30) {
      insights.push('🧠 **Deep Focus**: Your longer sessions show great concentration ability!')
    }

    if (detailedStats.mostProductiveHour >= 6 && detailedStats.mostProductiveHour <= 10) {
      insights.push('🌅 **Morning Person**: You\'re most productive in the morning hours!')
    } else if (detailedStats.mostProductiveHour >= 14 && detailedStats.mostProductiveHour <= 18) {
      insights.push('☀️ **Afternoon Focus**: Your peak productivity is in the afternoon!')
    } else if (detailedStats.mostProductiveHour >= 19 && detailedStats.mostProductiveHour <= 23) {
      insights.push('🌙 **Night Owl**: You focus best during evening hours!')
    }

    if (detailedStats.longestStreak > detailedStats.streakCount && detailedStats.longestStreak >= 7) {
      insights.push('💪 **Comeback Potential**: You\'ve had longer streaks before - you can do it again!')
    }
  }

  return insights.join('\n\n')
}
