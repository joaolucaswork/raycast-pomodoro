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
  RewardSystem,
  HyperfocusDetection,
  BreakActivity,
  Achievement,
  MoodEntry,
  MoodType,
  MoodAnalytics,
} from "../types/timer";
import { generateId } from "../utils/helpers";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { zustandStorage } from "../utils/zustand-storage";
import { applicationTrackingService } from "../services/application-tracking-service";
import { adhdSupportService } from "../services/adhd-support-service";
import { moodTrackingService } from "../services/mood-tracking-service";

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
  // ADHD-friendly defaults
  enableAdaptiveTimers: false,
  adaptiveMode: "energy-based",
  minWorkDuration: 10,
  maxWorkDuration: 60,
  adaptiveBreakRatio: 0.2,
  enableRewardSystem: true,
  enableTransitionWarnings: true,
  warningIntervals: [300, 120, 60], // 5min, 2min, 1min
  enableHyperfocusDetection: true,
  maxConsecutiveSessions: 3,
  forcedBreakAfterHours: 2.5,
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
      // Focus period tracking
      currentFocusPeriodId: null,
      currentFocusPeriodSessionCount: 0,
      targetRounds: 1,
      // ADHD-specific state
      rewardSystem: {
        points: 0,
        level: 1,
        streakMultiplier: 1,
        achievements: [],
        dailyGoal: 4, // 4 sessions per day
      },
      hyperfocusDetection: {
        isHyperfocusDetected: false,
        consecutiveSessions: 0,
        totalFocusTime: 0,
        appSwitchFrequency: 0,
        warningShown: false,
      },
      breakActivities: adhdSupportService.getDefaultBreakActivities(),
      currentBreakActivity: undefined,
      // Mood tracking state
      moodEntries: [],
      // Post-session mood logging state
      isPostSessionMoodPromptVisible: false,
      lastCompletedSession: null,

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

          // Check if session should be saved to history based on duration
          const {
            shouldSaveSessionToHistory,
            getActualSessionDuration,
          } = require("../utils/helpers");
          const shouldSave = shouldSaveSessionToHistory(stoppedSession);
          const actualDuration = getActualSessionDuration(stoppedSession);

          // Only add to history if session meets minimum duration requirement
          const newHistory = shouldSave
            ? [...history, stoppedSession]
            : history;

          set({
            currentSession: null,
            state: TimerState.IDLE,
            timeRemaining: 0,
            history: newHistory,
            stats: calculateStats(newHistory),
          });

          // Show notification if session was too short to be saved
          if (!shouldSave) {
            const { showToast, Toast } = require("@raycast/api");
            showToast({
              style: Toast.Style.Failure,
              title: "Session Too Short",
              message: `Session stopped after ${actualDuration}s and won't be saved to history (minimum: 40s)`,
            });
          }
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
        const {
          currentSession,
          history,
          sessionCount,
          currentFocusPeriodSessionCount,
        } = get();
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

          // Check if session should be saved to history based on duration
          const {
            shouldSaveSessionToHistory,
            getActualSessionDuration,
          } = require("../utils/helpers");
          const shouldSave = shouldSaveSessionToHistory(completedSession);
          const actualDuration = getActualSessionDuration(completedSession);

          // Only add to history if session meets minimum duration requirement
          const newHistory = shouldSave
            ? [...history, completedSession]
            : history;
          const newSessionCount =
            shouldSave && currentSession.type === SessionType.WORK
              ? sessionCount + 1
              : sessionCount;

          // Update focus period session count for work sessions (only if saved to history)
          const newFocusPeriodSessionCount =
            shouldSave && currentSession.type === SessionType.WORK
              ? currentFocusPeriodSessionCount + 1
              : currentFocusPeriodSessionCount;

          set({
            currentSession: null,
            state: TimerState.IDLE,
            timeRemaining: 0,
            history: newHistory,
            sessionCount: newSessionCount,
            currentFocusPeriodSessionCount: newFocusPeriodSessionCount,
            stats: calculateStats(newHistory),
          });

          // Show notification if session was too short to be saved
          if (!shouldSave) {
            const { showToast, Toast } = require("@raycast/api");
            showToast({
              style: Toast.Style.Failure,
              title: "Session Too Short",
              message: `Session skipped after ${actualDuration}s and won't be saved to history (minimum: 40s)`,
            });
          }
        }
      },

      completeSession: () => {
        const {
          currentSession,
          history,
          sessionCount,
          currentFocusPeriodSessionCount,
        } = get();
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

          // Check if session should be saved to history based on duration
          const {
            shouldSaveSessionToHistory,
            getActualSessionDuration,
          } = require("../utils/helpers");
          const shouldSave = shouldSaveSessionToHistory(completedSession);
          const actualDuration = getActualSessionDuration(completedSession);

          // Only add to history if session meets minimum duration requirement
          const newHistory = shouldSave
            ? [...history, completedSession]
            : history;
          const newSessionCount =
            shouldSave && currentSession.type === SessionType.WORK
              ? sessionCount + 1
              : sessionCount;

          // Update focus period session count for work sessions (only if saved to history)
          const newFocusPeriodSessionCount =
            shouldSave && currentSession.type === SessionType.WORK
              ? currentFocusPeriodSessionCount + 1
              : currentFocusPeriodSessionCount;

          set({
            currentSession: null,
            state: TimerState.COMPLETED,
            timeRemaining: 0,
            history: newHistory,
            sessionCount: newSessionCount,
            currentFocusPeriodSessionCount: newFocusPeriodSessionCount,
            stats: calculateStats(newHistory),
            // Remove mood prompt to fix timer stop bug
            isPostSessionMoodPromptVisible: false,
            lastCompletedSession: shouldSave ? completedSession : null,
          });

          // Show notification if session was too short to be saved
          if (!shouldSave) {
            const { showToast, Toast } = require("@raycast/api");
            showToast({
              style: Toast.Style.Failure,
              title: "Session Too Short",
              message: `Session completed in ${actualDuration}s but won't be saved to history (minimum: 40s)`,
            });
          }

          // Auto-transition to idle after a short delay
          setTimeout(() => {
            set({
              state: TimerState.IDLE,
            });
          }, 5000); // 5 seconds to show completion state
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

      // Historical session editing methods
      updateSessionIcon: (
        sessionId: string,
        taskIcon?: import("@raycast/api").Icon
      ) => {
        const { history } = get();
        const newHistory = history.map((session) =>
          session.id === sessionId ? { ...session, taskIcon } : session
        );

        set({
          history: newHistory,
          stats: calculateStats(newHistory),
        });
      },

      updateSessionNotes: (sessionId: string, notes?: string) => {
        const { history } = get();
        const newHistory = history.map((session) =>
          session.id === sessionId ? { ...session, notes } : session
        );

        set({
          history: newHistory,
          stats: calculateStats(newHistory),
        });
      },

      updateSessionName: (sessionId: string, taskName?: string) => {
        const { history } = get();
        const newHistory = history.map((session) =>
          session.id === sessionId ? { ...session, taskName } : session
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

      // ADHD-specific actions
      updateSessionEnergyLevel: (level: 1 | 2 | 3 | 4 | 5) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              energyLevel: level,
            },
          });
        }
      },

      updateSessionMoodState: (
        mood: "motivated" | "neutral" | "struggling" | "hyperfocus"
      ) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              moodState: mood,
            },
          });
        }
      },

      awardPoints: (points: number, reason: string) => {
        const { rewardSystem, history } = get();
        const newPoints = rewardSystem.points + points;
        const newLevel = adhdSupportService.calculateLevel(newPoints);

        // Check for new achievements
        const newAchievements = adhdSupportService.checkAchievements(history, {
          ...rewardSystem,
          points: newPoints,
        });

        set({
          rewardSystem: {
            ...rewardSystem,
            points: newPoints,
            level: newLevel,
            achievements: [...rewardSystem.achievements, ...newAchievements],
          },
        });
      },

      unlockAchievement: (achievementId: string) => {
        const { rewardSystem } = get();
        const defaultAchievements = adhdSupportService.getDefaultAchievements();
        const achievement = defaultAchievements.find(
          (a) => a.id === achievementId
        );

        if (
          achievement &&
          !rewardSystem.achievements.find((a) => a.id === achievementId)
        ) {
          set({
            rewardSystem: {
              ...rewardSystem,
              achievements: [
                ...rewardSystem.achievements,
                { ...achievement, unlockedAt: new Date() },
              ],
              points: rewardSystem.points + achievement.points,
            },
          });
        }
      },

      adaptSessionDuration: (newDuration: number, reason: string) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              adaptiveAdjustments: {
                originalDuration: currentSession.duration,
                adjustedDuration: newDuration,
                reason,
              },
              duration: newDuration,
            },
            timeRemaining: newDuration,
          });
        }
      },

      selectBreakActivity: (activityId: string) => {
        const { breakActivities } = get();
        const activity = breakActivities.find((a) => a.id === activityId);
        if (activity) {
          set({ currentBreakActivity: activity });
        }
      },

      completeBreakActivity: (rating?: 1 | 2 | 3 | 4 | 5) => {
        const { currentBreakActivity, rewardSystem } = get();
        if (currentBreakActivity) {
          // Award points for completing break activity
          const points = 15 + (rating ? rating * 2 : 0);
          set({
            currentBreakActivity: undefined,
            rewardSystem: {
              ...rewardSystem,
              points: rewardSystem.points + points,
            },
          });
        }
      },

      checkHyperfocus: () => {
        const { hyperfocusDetection, history, config } = get();
        const recentSessions = history.slice(-5); // Check last 5 sessions
        const completedSessions = recentSessions.filter((s) => s.completed);

        const detection = adhdSupportService.detectHyperfocus(
          completedSessions.length,
          completedSessions.reduce((sum, s) => sum + s.duration, 0),
          hyperfocusDetection.lastBreakTime,
          config.maxConsecutiveSessions,
          config.forcedBreakAfterHours
        );

        set({
          hyperfocusDetection: {
            ...hyperfocusDetection,
            isHyperfocusDetected: detection.detected,
            consecutiveSessions: completedSessions.length,
            totalFocusTime: completedSessions.reduce(
              (sum, s) => sum + s.duration,
              0
            ),
          },
        });
      },

      resetHyperfocusWarning: () => {
        const { hyperfocusDetection } = get();
        set({
          hyperfocusDetection: {
            ...hyperfocusDetection,
            warningShown: false,
            lastBreakTime: new Date(),
          },
        });
      },

      // Mood tracking actions
      addMoodEntry: (
        mood: MoodType,
        intensity: 1 | 2 | 3 | 4 | 5,
        context:
          | "pre-session"
          | "during-session"
          | "post-session"
          | "standalone",
        sessionId?: string,
        notes?: string
      ) => {
        const { moodEntries } = get();
        const newEntry: MoodEntry = {
          id: generateId(),
          mood,
          intensity,
          timestamp: new Date(),
          sessionId,
          notes,
          context,
        };

        set({
          moodEntries: [...moodEntries, newEntry],
        });
      },

      deleteMoodEntry: (entryId: string) => {
        const { moodEntries } = get();
        set({
          moodEntries: moodEntries.filter((entry) => entry.id !== entryId),
        });
      },

      updateMoodEntry: (
        entryId: string,
        updates: Partial<Omit<MoodEntry, "id" | "timestamp">>
      ) => {
        const { moodEntries } = get();
        const newMoodEntries = moodEntries.map((entry) =>
          entry.id === entryId ? { ...entry, ...updates } : entry
        );
        set({
          moodEntries: newMoodEntries,
        });
      },

      getMoodEntries: () => {
        const { moodEntries } = get();
        return moodEntries;
      },

      getMoodAnalytics: () => {
        const { moodEntries, history } = get();
        return moodTrackingService.calculateMoodAnalytics(moodEntries, history);
      },

      // Post-session mood logging actions
      showPostSessionMoodPrompt: (session: TimerSession) => {
        set({
          isPostSessionMoodPromptVisible: true,
          lastCompletedSession: session,
        });
      },

      hidePostSessionMoodPrompt: () => {
        set({
          isPostSessionMoodPromptVisible: false,
          lastCompletedSession: null,
          // Ensure timer transitions to idle when mood prompt is dismissed
          state: TimerState.IDLE,
          currentSession: null,
          timeRemaining: 0,
        });
      },

      // Focus period management
      startNewFocusPeriod: (targetRounds: number) => {
        set({
          currentFocusPeriodId: generateId(),
          currentFocusPeriodSessionCount: 0,
          targetRounds,
        });
      },

      resetFocusPeriod: () => {
        set({
          currentFocusPeriodId: null,
          currentFocusPeriodSessionCount: 0,
          targetRounds: 1,
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
