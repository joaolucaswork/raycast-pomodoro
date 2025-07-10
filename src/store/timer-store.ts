import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Color } from "@raycast/api";
import {
  PomodoroStore,
  TimerState,
  SessionType,
  TimerSession,
  TimerConfig,
  TimerStats,
  SessionEndReason,
  CustomTagConfig,
} from "../types/timer";
import { generateId } from "../utils/helpers";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { zustandStorage } from "../utils/zustand-storage";
import { applicationTrackingService } from "../services/application-tracking-service";

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  enableNotifications: true,
  autoStartBreaks: false,
  autoStartWork: false,
  enableApplicationTracking: true,
  trackingInterval: 5,
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
      customTags: [],
      customTagConfigs: [],
      hasCreatedCustomTag: false,

      // Actions
      startTimer: (
        type: SessionType,
        taskName?: string,
        projectName?: string,
        tags?: string[]
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
          tags: tags || [],
        };

        // Start application tracking for work sessions if enabled
        if (type === SessionType.WORK && config.enableApplicationTracking) {
          applicationTrackingService.startTracking(config.trackingInterval);
        }

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
        const { currentSession, history } = get();

        if (currentSession) {
          // Stop application tracking and capture usage data if it was a work session
          let applicationUsage = undefined;
          if (
            currentSession.type === SessionType.WORK &&
            applicationTrackingService.isCurrentlyTracking()
          ) {
            applicationUsage = applicationTrackingService.stopTracking();
          }

          // Save the stopped session to history
          const stoppedSession: TimerSession = {
            ...currentSession,
            endTime: new Date(),
            completed: false, // marked as stopped/incomplete
            endReason: SessionEndReason.STOPPED,
            applicationUsage,
          };

          const newHistory = [...history, stoppedSession];

          set({
            currentSession: null,
            state: TimerState.IDLE,
            timeRemaining: 0,
            history: newHistory,
            stats: calculateStats(newHistory),
          });
        } else {
          // No current session, just reset state
          set({
            currentSession: null,
            state: TimerState.IDLE,
            timeRemaining: 0,
          });
        }
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
          // Stop application tracking if it was running
          let applicationUsage = undefined;
          if (
            currentSession.type === SessionType.WORK &&
            applicationTrackingService.isCurrentlyTracking()
          ) {
            applicationUsage = applicationTrackingService.stopTracking();
          }

          const completedSession: TimerSession = {
            ...currentSession,
            endTime: new Date(),
            completed: false, // marked as skipped
            endReason: SessionEndReason.SKIPPED,
            applicationUsage,
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

      completeSession: () => {
        const { currentSession, history, sessionCount } = get();
        if (currentSession) {
          // Stop application tracking and capture usage data if it was a work session
          let applicationUsage = undefined;
          if (
            currentSession.type === SessionType.WORK &&
            applicationTrackingService.isCurrentlyTracking()
          ) {
            applicationUsage = applicationTrackingService.stopTracking();
          }

          const completedSession: TimerSession = {
            ...currentSession,
            endTime: new Date(),
            completed: true,
            endReason: SessionEndReason.COMPLETED,
            applicationUsage,
          };

          const newHistory = [...history, completedSession];
          const newSessionCount =
            currentSession.type === SessionType.WORK
              ? sessionCount + 1
              : sessionCount;

          set({
            currentSession: null,
            state: TimerState.COMPLETED,
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

      addTaskToSession: (
        taskName: string,
        projectName?: string,
        tags?: string[]
      ) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              taskName,
              projectName,
              tags: tags || currentSession.tags || [],
            },
          });
        }
      },

      // Real-time session update methods
      updateCurrentSessionName: (taskName: string) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              taskName,
            },
          });
        }
      },

      updateCurrentSessionIcon: (taskIcon: import("@raycast/api").Icon) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              taskIcon,
            },
          });
        }
      },

      addTagToCurrentSession: (tag: string) => {
        const { currentSession } = get();
        if (currentSession) {
          const currentTags = currentSession.tags || [];
          const normalizedTag = tag.toLowerCase().trim();

          // Prevent duplicate tags
          if (!currentTags.includes(normalizedTag)) {
            set({
              currentSession: {
                ...currentSession,
                tags: [...currentTags, normalizedTag],
              },
            });
          }
        }
      },

      removeTagFromCurrentSession: (tag: string) => {
        const { currentSession } = get();
        if (currentSession) {
          const currentTags = currentSession.tags || [];
          const normalizedTag = tag.toLowerCase().trim();

          set({
            currentSession: {
              ...currentSession,
              tags: currentTags.filter((t) => t !== normalizedTag),
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

      deleteSession: (sessionId: string) => {
        const { history } = get();
        const newHistory = history.filter(
          (session) => session.id !== sessionId
        );

        set({
          history: newHistory,
          stats: calculateStats(newHistory),
        });
      },

      clearAllHistory: () => {
        set({
          history: [],
          stats: DEFAULT_STATS,
          sessionCount: 0,
        });
      },

      // Tag-related actions
      addCustomTag: (tag: string) => {
        const { customTags } = get();
        const normalizedTag = tag.toLowerCase().trim();

        if (!customTags.includes(normalizedTag)) {
          set({
            customTags: [...customTags, normalizedTag],
            hasCreatedCustomTag: true,
          });
        }
      },

      getCustomTags: (): string[] => {
        return get().customTags;
      },

      markCustomTagCreated: () => {
        set({ hasCreatedCustomTag: true });
      },

      updateTagConfig: (
        tagName: string,
        config: Partial<import("../types/timer").CustomTagConfig>
      ) => {
        const { customTagConfigs } = get();
        const existingIndex = customTagConfigs.findIndex(
          (tc) => tc.name === tagName
        );

        if (existingIndex >= 0) {
          // Update existing config
          const updatedConfigs = [...customTagConfigs];
          updatedConfigs[existingIndex] = {
            ...updatedConfigs[existingIndex],
            ...config,
          };
          set({ customTagConfigs: updatedConfigs });
        } else {
          // Create new config
          const newConfig: CustomTagConfig = {
            name: tagName,
            color: Color.Blue,
            ...config,
          };
          set({ customTagConfigs: [...customTagConfigs, newConfig] });
        }
      },

      deleteCustomTag: (tagName: string) => {
        const { customTags, customTagConfigs } = get();
        set({
          customTags: customTags.filter((tag) => tag !== tagName),
          customTagConfigs: customTagConfigs.filter(
            (tc) => tc.name !== tagName
          ),
        });
      },

      getTagConfig: (
        tagName: string
      ): import("../types/timer").CustomTagConfig | undefined => {
        const { customTagConfigs } = get();
        return customTagConfigs.find((tc) => tc.name === tagName);
      },

      clearAllTags: () => {
        const { customTags, customTagConfigs } = get();
        const predefinedTags = ["work", "study", "personal"];

        // Keep only built-in tags
        const filteredCustomTags = customTags.filter((tag) =>
          predefinedTags.includes(tag)
        );
        const filteredCustomTagConfigs = customTagConfigs.filter((tc) =>
          predefinedTags.includes(tc.name)
        );

        set({
          customTags: filteredCustomTags,
          customTagConfigs: filteredCustomTagConfigs,
          hasCreatedCustomTag:
            filteredCustomTags.length > predefinedTags.length,
        });
      },
    }),
    {
      name: "pomodoro-timer-storage",
      storage: zustandStorage,
      partialize: (state) => ({
        ...state,
        // Don't persist runtime state
        currentSession: null,
        state: TimerState.IDLE,
        timeRemaining: 0,
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
