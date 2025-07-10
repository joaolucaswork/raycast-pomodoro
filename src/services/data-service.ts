import { TimerSession, TimerStats } from '../types/timer'
import { useTimerStore } from '../store/timer-store'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export interface ExportData {
  sessions: TimerSession[]
  stats: TimerStats
  exportDate: string
  version: string
}

export interface DateRange {
  start: Date
  end: Date
}

export class DataService {
  private static instance: DataService

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  public getSessionsInRange(sessions: TimerSession[], range: DateRange): TimerSession[] {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= range.start && sessionDate <= range.end
    })
  }

  public getSessionsForToday(sessions: TimerSession[]): TimerSession[] {
    const today = new Date()
    return this.getSessionsInRange(sessions, {
      start: startOfDay(today),
      end: endOfDay(today)
    })
  }

  public getSessionsForWeek(sessions: TimerSession[]): TimerSession[] {
    const today = new Date()
    return this.getSessionsInRange(sessions, {
      start: startOfWeek(today, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(today, { weekStartsOn: 1 })
    })
  }

  public getSessionsForMonth(sessions: TimerSession[]): TimerSession[] {
    const today = new Date()
    return this.getSessionsInRange(sessions, {
      start: startOfMonth(today),
      end: endOfMonth(today)
    })
  }

  public calculateDetailedStats(sessions: TimerSession[]): TimerStats & {
    averageSessionLength: number
    completionRate: number
    mostProductiveHour: number
    mostProductiveDay: string
    longestStreak: number
  } {
    const completedSessions = sessions.filter(s => s.completed)
    const workSessions = completedSessions.filter(s => s.type === 'work')
    
    // Basic stats
    const totalWorkTime = workSessions.reduce((acc, session) => acc + session.duration, 0)
    const totalBreakTime = completedSessions
      .filter(s => s.type !== 'work')
      .reduce((acc, session) => acc + session.duration, 0)

    // Advanced calculations
    const averageSessionLength = workSessions.length > 0 
      ? totalWorkTime / workSessions.length / 60 
      : 0

    const completionRate = sessions.length > 0 
      ? (completedSessions.length / sessions.length) * 100 
      : 0

    // Most productive hour (0-23)
    const hourCounts = new Array(24).fill(0)
    workSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours()
      hourCounts[hour]++
    })
    const mostProductiveHour = hourCounts.indexOf(Math.max(...hourCounts))

    // Most productive day of week
    const dayCounts = new Array(7).fill(0)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    workSessions.forEach(session => {
      const day = new Date(session.startTime).getDay()
      dayCounts[day]++
    })
    const mostProductiveDayIndex = dayCounts.indexOf(Math.max(...dayCounts))
    const mostProductiveDay = dayNames[mostProductiveDayIndex]

    // Calculate streak
    const longestStreak = this.calculateLongestStreak(completedSessions)

    // Time-based stats
    const todaysSessions = this.getSessionsForToday(completedSessions).length
    const weekSessions = this.getSessionsForWeek(completedSessions).length
    const monthSessions = this.getSessionsForMonth(completedSessions).length

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalWorkTime,
      totalBreakTime,
      streakCount: this.calculateCurrentStreak(completedSessions),
      todaysSessions,
      weekSessions,
      monthSessions,
      averageSessionLength,
      completionRate,
      mostProductiveHour,
      mostProductiveDay,
      longestStreak
    }
  }

  private calculateCurrentStreak(sessions: TimerSession[]): number {
    if (sessions.length === 0) return 0

    const sessionsByDate = this.groupSessionsByDate(sessions)
    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    )

    let streak = 0
    const today = new Date().toDateString()
    
    for (const dateStr of sortedDates) {
      const date = new Date(dateStr)
      const daysDiff = Math.floor((new Date(today).getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else if (daysDiff > streak) {
        break
      }
    }

    return streak
  }

  private calculateLongestStreak(sessions: TimerSession[]): number {
    if (sessions.length === 0) return 0

    const sessionsByDate = this.groupSessionsByDate(sessions)
    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    )

    let longestStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr)
      
      if (lastDate === null) {
        currentStreak = 1
      } else {
        const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }
      
      lastDate = currentDate
    }

    return Math.max(longestStreak, currentStreak)
  }

  private groupSessionsByDate(sessions: TimerSession[]): Record<string, TimerSession[]> {
    const groups: Record<string, TimerSession[]> = {}
    
    sessions.forEach(session => {
      const dateKey = new Date(session.startTime).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(session)
    })

    return groups
  }

  public exportData(): ExportData {
    const state = useTimerStore.getState()
    
    return {
      sessions: state.history,
      stats: state.stats,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  public exportDataAsJSON(): string {
    const data = this.exportData()
    return JSON.stringify(data, null, 2)
  }

  public exportDataAsCSV(): string {
    const state = useTimerStore.getState()
    const sessions = state.history

    const headers = [
      'Date',
      'Start Time',
      'End Time',
      'Type',
      'Duration (minutes)',
      'Completed',
      'Task',
      'Project'
    ]

    const rows = sessions.map(session => [
      format(new Date(session.startTime), 'yyyy-MM-dd'),
      format(new Date(session.startTime), 'HH:mm:ss'),
      session.endTime ? format(new Date(session.endTime), 'HH:mm:ss') : '',
      session.type,
      Math.round(session.duration / 60),
      session.completed ? 'Yes' : 'No',
      session.taskName || '',
      session.projectName || ''
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  public importData(jsonData: string): boolean {
    try {
      const data: ExportData = JSON.parse(jsonData)
      
      // Validate data structure
      if (!data.sessions || !Array.isArray(data.sessions)) {
        throw new Error('Invalid data format: sessions array missing')
      }

      // Merge with existing data
      const currentState = useTimerStore.getState()
      const existingIds = new Set(currentState.history.map(s => s.id))
      
      const newSessions = data.sessions.filter(session => !existingIds.has(session.id))
      const mergedHistory = [...currentState.history, ...newSessions]
      
      // Recalculate stats
      const newStats = this.calculateDetailedStats(mergedHistory)
      
      // Update store
      useTimerStore.setState({
        history: mergedHistory,
        stats: newStats
      })

      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  public clearAllData(): void {
    useTimerStore.setState({
      history: [],
      stats: {
        totalSessions: 0,
        completedSessions: 0,
        totalWorkTime: 0,
        totalBreakTime: 0,
        streakCount: 0,
        todaysSessions: 0,
        weekSessions: 0,
        monthSessions: 0
      }
    })
  }

  public getDataSummary(): {
    totalSessions: number
    oldestSession: Date | null
    newestSession: Date | null
    dataSize: string
  } {
    const state = useTimerStore.getState()
    const sessions = state.history

    const oldestSession = sessions.length > 0 
      ? new Date(Math.min(...sessions.map(s => new Date(s.startTime).getTime())))
      : null

    const newestSession = sessions.length > 0
      ? new Date(Math.max(...sessions.map(s => new Date(s.startTime).getTime())))
      : null

    const dataSize = new Blob([JSON.stringify(state)]).size
    const dataSizeFormatted = dataSize < 1024 
      ? `${dataSize} bytes`
      : dataSize < 1024 * 1024
      ? `${Math.round(dataSize / 1024)} KB`
      : `${Math.round(dataSize / (1024 * 1024))} MB`

    return {
      totalSessions: sessions.length,
      oldestSession,
      newestSession,
      dataSize: dataSizeFormatted
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance()
