import { PomodoroStore } from "../../types/timer";

/**
 * Session-related selectors for the timer store
 */

// Basic session selectors
export const selectCurrentSession = (state: PomodoroStore) => state.currentSession;
export const selectTimerState = (state: PomodoroStore) => state.state;
export const selectTimeRemaining = (state: PomodoroStore) => state.timeRemaining;
export const selectSessionCount = (state: PomodoroStore) => state.sessionCount;
export const selectHistory = (state: PomodoroStore) => state.history;

// Focus period selectors
export const selectCurrentFocusPeriodId = (state: PomodoroStore) => state.currentFocusPeriodId;
export const selectCurrentFocusPeriodSessionCount = (state: PomodoroStore) => state.currentFocusPeriodSessionCount;
export const selectTargetRounds = (state: PomodoroStore) => state.targetRounds;

// Computed session selectors
export const selectIsRunning = (state: PomodoroStore) => state.state === "running";
export const selectIsPaused = (state: PomodoroStore) => state.state === "paused";
export const selectIsIdle = (state: PomodoroStore) => state.state === "idle";
export const selectIsCompleted = (state: PomodoroStore) => state.state === "completed";

export const selectHasActiveSession = (state: PomodoroStore) => state.currentSession !== null;

export const selectCurrentSessionType = (state: PomodoroStore) => 
  state.currentSession?.type;

export const selectCurrentSessionDuration = (state: PomodoroStore) => 
  state.currentSession?.duration;

export const selectCurrentSessionTaskName = (state: PomodoroStore) => 
  state.currentSession?.taskName;

export const selectCurrentSessionTags = (state: PomodoroStore) => 
  state.currentSession?.tags || [];

export const selectCurrentSessionIcon = (state: PomodoroStore) => 
  state.currentSession?.taskIcon;

// History selectors
export const selectCompletedSessions = (state: PomodoroStore) => 
  state.history.filter(session => session.completed);

export const selectWorkSessions = (state: PomodoroStore) => 
  state.history.filter(session => session.type === "work");

export const selectCompletedWorkSessions = (state: PomodoroStore) => 
  state.history.filter(session => session.completed && session.type === "work");

export const selectTodaysSessions = (state: PomodoroStore) => {
  const today = new Date().toDateString();
  return state.history.filter(session => 
    new Date(session.startTime).toDateString() === today
  );
};

export const selectRecentSessions = (count: number = 10) => (state: PomodoroStore) => 
  state.history
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, count);

// Focus period progress selectors
export const selectFocusPeriodProgress = (state: PomodoroStore) => {
  if (state.targetRounds === 0) return 0;
  return (state.currentFocusPeriodSessionCount / state.targetRounds) * 100;
};

export const selectRemainingRounds = (state: PomodoroStore) => 
  Math.max(0, state.targetRounds - state.currentFocusPeriodSessionCount);

export const selectIsLastRound = (state: PomodoroStore) => 
  state.currentFocusPeriodSessionCount >= state.targetRounds - 1;

// Session filtering selectors
export const selectSessionsByTag = (tag: string) => (state: PomodoroStore) =>
  state.history.filter(session => 
    session.tags?.includes(tag.toLowerCase())
  );

export const selectSessionsByProject = (projectName: string) => (state: PomodoroStore) =>
  state.history.filter(session => 
    session.projectName?.toLowerCase() === projectName.toLowerCase()
  );

export const selectSessionsInDateRange = (startDate: Date, endDate: Date) => (state: PomodoroStore) =>
  state.history.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
