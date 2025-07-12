import { PomodoroStore } from "../../types/timer";
import { isToday, isThisWeek, isThisMonth } from "date-fns";

/**
 * Statistics-related selectors for the timer store
 */

// Basic stats selectors
export const selectStats = (state: PomodoroStore) => state.stats;
export const selectStatsTotalSessions = (state: PomodoroStore) =>
  state.stats.totalSessions;
export const selectStatsCompletedSessions = (state: PomodoroStore) =>
  state.stats.completedSessions;
export const selectTotalWorkTime = (state: PomodoroStore) =>
  state.stats.totalWorkTime;
export const selectTotalBreakTime = (state: PomodoroStore) =>
  state.stats.totalBreakTime;
export const selectStreakCount = (state: PomodoroStore) =>
  state.stats.streakCount;
export const selectStatsTodaysSessions = (state: PomodoroStore) =>
  state.stats.todaysSessions;
export const selectWeekSessions = (state: PomodoroStore) =>
  state.stats.weekSessions;
export const selectMonthSessions = (state: PomodoroStore) =>
  state.stats.monthSessions;

// Computed stats selectors
export const selectCompletionRate = (state: PomodoroStore) => {
  const { totalSessions, completedSessions } = state.stats;
  return totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
};

export const selectAverageSessionLength = (state: PomodoroStore) => {
  const workSessions = state.history.filter(
    (session) => session.completed && session.type === "work"
  );

  if (workSessions.length === 0) return 0;

  const totalDuration = workSessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );

  return totalDuration / workSessions.length / 60; // Return in minutes
};

export const selectTotalFocusTime = (state: PomodoroStore) => {
  return state.stats.totalWorkTime; // in seconds
};

export const selectTotalFocusTimeInHours = (state: PomodoroStore) => {
  return state.stats.totalWorkTime / 3600; // Convert to hours
};

export const selectProductivityScore = (state: PomodoroStore) => {
  const completionRate = selectCompletionRate(state);
  const streakBonus = Math.min(state.stats.streakCount * 5, 50); // Max 50 bonus points
  const consistencyBonus = state.stats.weekSessions >= 5 ? 20 : 0;

  return Math.min(100, completionRate + streakBonus + consistencyBonus);
};

// Time-based stats selectors
export const selectTodaysWorkTime = (state: PomodoroStore) => {
  const todaysSessions = state.history.filter(
    (session) =>
      session.completed &&
      session.type === "work" &&
      isToday(new Date(session.startTime))
  );

  return todaysSessions.reduce((acc, session) => acc + session.duration, 0);
};

export const selectWeeksWorkTime = (state: PomodoroStore) => {
  const weeksSessions = state.history.filter(
    (session) =>
      session.completed &&
      session.type === "work" &&
      isThisWeek(new Date(session.startTime))
  );

  return weeksSessions.reduce((acc, session) => acc + session.duration, 0);
};

export const selectMonthsWorkTime = (state: PomodoroStore) => {
  const monthsSessions = state.history.filter(
    (session) =>
      session.completed &&
      session.type === "work" &&
      isThisMonth(new Date(session.startTime))
  );

  return monthsSessions.reduce((acc, session) => acc + session.duration, 0);
};

// Goal progress selectors
export const selectDailyGoalProgress = (state: PomodoroStore) => {
  const dailyGoal = state.rewardSystem.dailyGoal;
  const todaysSessions = state.stats.todaysSessions;

  return dailyGoal > 0 ? (todaysSessions / dailyGoal) * 100 : 0;
};

export const selectIsOnStreak = (state: PomodoroStore) =>
  state.stats.streakCount > 0;

export const selectStreakLevel = (state: PomodoroStore) => {
  const streak = state.stats.streakCount;
  if (streak >= 30) return "legendary";
  if (streak >= 14) return "epic";
  if (streak >= 7) return "great";
  if (streak >= 3) return "good";
  return "starting";
};

// Performance insights selectors
export const selectMostProductiveHour = (state: PomodoroStore) => {
  const hourlyData: Record<number, number> = {};

  state.history
    .filter((session) => session.completed && session.type === "work")
    .forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

  const entries = Object.entries(hourlyData);
  if (entries.length === 0) return null;

  const [mostProductiveHour] = entries.reduce((a, b) =>
    (a[1] as number) > (b[1] as number) ? a : b
  );

  return parseInt(mostProductiveHour);
};

export const selectMostUsedTags = (state: PomodoroStore) => {
  const tagCounts: Record<string, number> = {};

  state.history
    .filter((session) => session.completed && session.tags)
    .forEach((session) => {
      session.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
};
