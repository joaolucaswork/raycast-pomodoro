import { StateCreator } from "zustand";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { TimerStats, TimerSession, SessionType, PomodoroStore } from "../../types/timer";

/**
 * Default timer statistics
 */
export const DEFAULT_STATS: TimerStats = {
  totalSessions: 0,
  completedSessions: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  streakCount: 0,
  todaysSessions: 0,
  weekSessions: 0,
  monthSessions: 0,
};

/**
 * Statistics slice interface - defines stats-related state and actions
 */
export interface StatsSlice {
  // Statistics state
  stats: TimerStats;

  // Statistics actions
  recalculateStats: () => void;
  resetStats: () => void;
  
  // Statistics utilities
  getTotalSessions: () => number;
  getCompletedSessions: () => number;
  getTotalWorkTime: () => number;
  getTotalBreakTime: () => number;
  getStreakCount: () => number;
  getTodaysSessions: () => number;
  getWeekSessions: () => number;
  getMonthSessions: () => number;
  getCompletionRate: () => number;
  getAverageSessionLength: () => number;
}

/**
 * Calculate comprehensive statistics from session history
 */
export function calculateStats(history: TimerSession[]): TimerStats {
  const completedSessions = history.filter((s) => s.completed);
  const workSessions = completedSessions.filter(
    (s) => s.type === SessionType.WORK
  );
  const breakSessions = completedSessions.filter(
    (s) => s.type !== SessionType.WORK
  );

  const totalWorkTime = workSessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );
  const totalBreakTime = breakSessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );

  const todaysSessions = completedSessions.filter((s) =>
    isToday(new Date(s.startTime))
  ).length;
  const weekSessions = completedSessions.filter((s) =>
    isThisWeek(new Date(s.startTime))
  ).length;
  const monthSessions = completedSessions.filter((s) =>
    isThisMonth(new Date(s.startTime))
  ).length;

  // Calculate streak (consecutive days with completed sessions)
  const streakCount = calculateStreak(completedSessions);

  return {
    totalSessions: history.length,
    completedSessions: completedSessions.length,
    totalWorkTime,
    totalBreakTime,
    streakCount,
    todaysSessions,
    weekSessions,
    monthSessions,
  };
}

/**
 * Calculate consecutive days streak
 */
function calculateStreak(sessions: TimerSession[]): number {
  if (sessions.length === 0) return 0;

  const sessionsByDate = new Map<string, TimerSession[]>();

  sessions.forEach((session) => {
    const dateKey = new Date(session.startTime).toDateString();
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  const sortedDates = Array.from(sessionsByDate.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 0;
  const currentDate = new Date();

  for (const dateStr of sortedDates) {
    const sessionDate = new Date(dateStr);
    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

/**
 * Create statistics slice with all stats-related functionality
 */
export const createStatsSlice: StateCreator<
  PomodoroStore,
  [],
  [],
  StatsSlice
> = (set, get) => ({
  // Initial state
  stats: DEFAULT_STATS,

  // Statistics actions
  recalculateStats: () => {
    const { history } = get();
    const newStats = calculateStats(history);
    set({ stats: newStats });
  },

  resetStats: () => {
    set({ stats: DEFAULT_STATS });
  },

  // Statistics utilities
  getTotalSessions: () => {
    return get().stats.totalSessions;
  },

  getCompletedSessions: () => {
    return get().stats.completedSessions;
  },

  getTotalWorkTime: () => {
    return get().stats.totalWorkTime;
  },

  getTotalBreakTime: () => {
    return get().stats.totalBreakTime;
  },

  getStreakCount: () => {
    return get().stats.streakCount;
  },

  getTodaysSessions: () => {
    return get().stats.todaysSessions;
  },

  getWeekSessions: () => {
    return get().stats.weekSessions;
  },

  getMonthSessions: () => {
    return get().stats.monthSessions;
  },

  getCompletionRate: () => {
    const { totalSessions, completedSessions } = get().stats;
    return totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  },

  getAverageSessionLength: () => {
    const { history } = get();
    const workSessions = history.filter(
      (s) => s.completed && s.type === SessionType.WORK
    );
    
    if (workSessions.length === 0) return 0;
    
    const totalDuration = workSessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );
    
    return totalDuration / workSessions.length / 60; // Return in minutes
  },
});
