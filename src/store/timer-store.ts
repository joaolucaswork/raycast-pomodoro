import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PomodoroStore,
  TimerState,
  SessionType,
  TimerSession,
  TimerConfig,
  TimerStats,
} from "../types/timer";
import { generateId } from "../utils/helpers";
import { isToday, isThisWeek, isThisMonth } from "date-fns";

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  enableNotifications: true,
  autoStartBreaks: false,
  autoStartWork: false,
};

const DEFAULT_STATS: TimerStats = {
  totalSessions: 0,
  completedSessions: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  streakCount: 0,
  todaysSessions: 0,
  weekSessions: 0,
  monthSessions: 0,
};

export const useTimerStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      // State
      currentSession: null,
      state: TimerState.IDLE,
      timeRemaining: 0,
      sessionCount: 0,
      config: DEFAULT_CONFIG,
      stats: DEFAULT_STATS,
      history: [],

      // Actions
      startTimer: (
        type: SessionType,
        taskName?: string,
        projectName?: string
      ) => {
        const { config } = get();
        let duration: number;

        switch (type) {
          case SessionType.WORK:
            duration = config.workDuration * 60;
            break;
          case SessionType.SHORT_BREAK:
            duration = config.shortBreakDuration * 60;
            break;
          case SessionType.LONG_BREAK:
            duration = config.longBreakDuration * 60;
            break;
          default:
            duration = config.workDuration * 60;
            break;
        }

        const session: TimerSession = {
          id: generateId(),
          type,
          duration,
          startTime: new Date(),
          completed: false,
          taskName,
          projectName,
        };

        set({
          currentSession: session,
          state: TimerState.RUNNING,
          timeRemaining: duration,
        });
      },

      pauseTimer: () => {
        const { state } = get();
        if (state === TimerState.RUNNING) {
          set({ state: TimerState.PAUSED });
        }
      },

      resumeTimer: () => {
        const { state } = get();
        if (state === TimerState.PAUSED) {
          set({ state: TimerState.RUNNING });
        }
      },

      stopTimer: () => {
        set({
          currentSession: null,
          state: TimerState.IDLE,
          timeRemaining: 0,
        });
      },

      resetTimer: () => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            timeRemaining: currentSession.duration,
            state: TimerState.IDLE,
          });
        }
      },

      skipSession: () => {
        const { currentSession, history, sessionCount } = get();
        if (currentSession) {
          const completedSession: TimerSession = {
            ...currentSession,
            endTime: new Date(),
            completed: false, // marked as skipped
          };

          const newHistory = [...history, completedSession];
          const newSessionCount =
            currentSession.type === SessionType.WORK
              ? sessionCount + 1
              : sessionCount;

          set({
            currentSession: null,
            state: TimerState.IDLE,
            timeRemaining: 0,
            history: newHistory,
            sessionCount: newSessionCount,
            stats: calculateStats(newHistory),
          });
        }
      },

      updateConfig: (newConfig: Partial<TimerConfig>) => {
        const { config } = get();
        set({
          config: { ...config, ...newConfig },
        });
      },

      addTaskToSession: (taskName: string, projectName?: string) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              taskName,
              projectName,
            },
          });
        }
      },

      getNextSessionType: (): SessionType => {
        const { sessionCount, config } = get();

        if (sessionCount > 0 && sessionCount % config.longBreakInterval === 0) {
          return SessionType.LONG_BREAK;
        }

        return SessionType.SHORT_BREAK;
      },
    }),
    {
      name: "pomodoro-timer-storage",
      partialize: (state) => ({
        config: state.config,
        history: state.history,
        sessionCount: state.sessionCount,
        stats: state.stats,
      }),
    }
  )
);

function calculateStats(history: TimerSession[]): TimerStats {
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
    isToday(s.startTime)
  ).length;
  const weekSessions = completedSessions.filter((s) =>
    isThisWeek(s.startTime)
  ).length;
  const monthSessions = completedSessions.filter((s) =>
    isThisMonth(s.startTime)
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

function calculateStreak(sessions: TimerSession[]): number {
  if (sessions.length === 0) return 0;

  const sessionsByDate = new Map<string, TimerSession[]>();

  sessions.forEach((session) => {
    const dateKey = session.startTime.toDateString();
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  const sortedDates = Array.from(sessionsByDate.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 0;
  let currentDate = new Date();

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
