import { StateCreator } from "zustand";
import { Icon, showToast, Toast } from "@raycast/api";
import {
  TimerState,
  SessionType,
  TimerSession,
  SessionEndReason,
  PomodoroStore,
} from "../../types/timer";
import {
  generateId,
  shouldSaveSessionToHistory,
  getActualSessionDuration,
} from "../../utils/helpers";
import { applicationTrackingService } from "../../services/tracking/application-tracking-service";
import { calculateStats } from "./stats-slice";

/**
 * Session slice interface - defines session-related state and actions
 */
export interface SessionSlice {
  // Session state
  currentSession: TimerSession | null;
  state: TimerState;
  timeRemaining: number;
  sessionCount: number;
  history: TimerSession[];

  // Focus period state
  currentFocusPeriodId: string | null;
  currentFocusPeriodSessionCount: number;
  targetRounds: number;

  // Pause tracking state
  pauseStartTime: Date | null;
  totalPausedTime: number;

  // Session actions
  startTimer: (
    type: SessionType,
    taskName?: string,
    projectName?: string,
    tags?: string[]
  ) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  completeSession: () => void;

  // Session management
  addTaskToSession: (
    taskName: string,
    projectName?: string,
    tags?: string[]
  ) => void;
  updateCurrentSessionName: (taskName: string) => void;
  updateCurrentSessionIcon: (taskIcon: Icon) => void;
  addTagToCurrentSession: (tag: string) => void;
  removeTagFromCurrentSession: (tag: string) => void;

  // Session utilities
  getNextSessionType: () => SessionType;
  deleteSession: (sessionId: string) => void;
  updateSessionIcon: (sessionId: string, taskIcon?: Icon) => void;
  updateSessionNotes: (sessionId: string, notes?: string) => void;
  updateSessionName: (sessionId: string, taskName?: string) => void;
  updateSessionTags: (sessionId: string, tags: string[]) => void;
  skipSession: () => void;
  clearAllHistory: () => void;

  // Focus period management
  startNewFocusPeriod: (targetRounds: number) => void;
  resetFocusPeriod: () => void;
  setTargetRounds: (targetRounds: number) => void;
}

/**
 * Create session slice with all session-related functionality
 */
export const createSessionSlice: StateCreator<
  PomodoroStore,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  // Initial state
  currentSession: null,
  state: TimerState.IDLE,
  timeRemaining: 0,
  sessionCount: 0,
  history: [],
  currentFocusPeriodId: null,
  currentFocusPeriodSessionCount: 0,
  targetRounds: 1,
  // Pause tracking
  pauseStartTime: null,
  totalPausedTime: 0,

  // Session actions
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
      // Reset pause tracking for new session
      pauseStartTime: null,
      totalPausedTime: 0,
    });
  },

  pauseTimer: () => {
    const { state } = get();
    if (state === TimerState.RUNNING) {
      set({
        state: TimerState.PAUSED,
        pauseStartTime: new Date(),
      });
    }
  },

  resumeTimer: () => {
    const { state, pauseStartTime, totalPausedTime } = get();
    if (state === TimerState.PAUSED && pauseStartTime) {
      const pauseDuration = Math.floor(
        (new Date().getTime() - pauseStartTime.getTime()) / 1000
      );
      set({
        state: TimerState.RUNNING,
        pauseStartTime: null,
        totalPausedTime: totalPausedTime + pauseDuration,
      });
    }
  },

  stopTimer: () => {
    const {
      currentSession,
      history,
      totalPausedTime,
      pauseStartTime,
      state,
      timeRemaining,
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

      // Calculate final paused time if currently paused
      let finalPausedTime = totalPausedTime;
      if (state === TimerState.PAUSED && pauseStartTime) {
        const currentPauseDuration = Math.floor(
          (new Date().getTime() - pauseStartTime.getTime()) / 1000
        );
        finalPausedTime += currentPauseDuration;
      }

      // Calculate active duration (configured duration minus remaining time)
      const activeDuration = currentSession.duration - timeRemaining;

      // Save the stopped session to history
      const stoppedSession: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false, // marked as stopped/incomplete
        endReason: SessionEndReason.STOPPED,
        applicationUsage,
        pausedTime: finalPausedTime,
        activeDuration: activeDuration,
      };

      // Check if session should be saved to history based on duration
      const shouldSave = shouldSaveSessionToHistory(stoppedSession);
      const actualDuration = getActualSessionDuration(stoppedSession);

      // Only add to history if session meets minimum duration requirement
      const newHistory = shouldSave ? [...history, stoppedSession] : history;

      set({
        currentSession: null,
        state: TimerState.IDLE,
        timeRemaining: 0,
        history: newHistory,
        stats: calculateStats(newHistory),
        // Reset pause tracking
        pauseStartTime: null,
        totalPausedTime: 0,
      });

      // Show notification if session was too short to be saved
      if (!shouldSave) {
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

  completeSession: () => {
    const {
      currentSession,
      history,
      sessionCount,
      currentFocusPeriodSessionCount,
      totalPausedTime,
      pauseStartTime,
      state,
    } = get();

    if (currentSession) {
      console.log("[SessionSlice] Completing session:", {
        sessionId: currentSession.id,
        type: currentSession.type,
        taskName: currentSession.taskName,
        startTime: currentSession.startTime,
      });

      // Stop application tracking and capture usage data if it was a work session
      let applicationUsage = undefined;
      if (
        currentSession.type === SessionType.WORK &&
        applicationTrackingService.isCurrentlyTracking()
      ) {
        applicationUsage = applicationTrackingService.stopTracking();
      }

      // Calculate final paused time if currently paused
      let finalPausedTime = totalPausedTime;
      if (state === TimerState.PAUSED && pauseStartTime) {
        const currentPauseDuration = Math.floor(
          (new Date().getTime() - pauseStartTime.getTime()) / 1000
        );
        finalPausedTime += currentPauseDuration;
      }

      // For completed sessions, active duration equals configured duration
      const activeDuration = currentSession.duration;

      const completedSession: TimerSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
        endReason: SessionEndReason.COMPLETED,
        applicationUsage,
        pausedTime: finalPausedTime,
        activeDuration: activeDuration,
      };

      // Check if session should be saved to history based on duration
      const shouldSave = shouldSaveSessionToHistory(completedSession);
      const actualDuration = getActualSessionDuration(completedSession);

      console.log("[SessionSlice] Session completion details:", {
        actualDuration,
        shouldSave,
        minimumRequired: 40,
        currentHistoryLength: history.length,
      });

      // Only add to history if session meets minimum duration requirement
      const newHistory = shouldSave ? [...history, completedSession] : history;

      // Update session count only for completed work sessions that are saved
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
        // Reset pause tracking
        pauseStartTime: null,
        totalPausedTime: 0,
        // Remove mood prompt to fix timer stop bug
        isPostSessionMoodPromptVisible: false,
        lastCompletedSession: shouldSave ? completedSession : null,
      });

      console.log("[SessionSlice] Session completion result:", {
        savedToHistory: shouldSave,
        newHistoryLength: newHistory.length,
        lastCompletedSessionId: shouldSave ? completedSession.id : null,
      });

      // Boxing progress will be updated via store subscription when history changes

      // Show notification if session was too short to be saved
      if (!shouldSave) {
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

  // Session management methods
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

  updateCurrentSessionIcon: (taskIcon: Icon) => {
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
      if (!currentTags.includes(tag)) {
        set({
          currentSession: {
            ...currentSession,
            tags: [...currentTags, tag],
          },
        });
      }
    }
  },

  removeTagFromCurrentSession: (tag: string) => {
    const { currentSession } = get();
    if (currentSession) {
      const currentTags = currentSession.tags || [];
      set({
        currentSession: {
          ...currentSession,
          tags: currentTags.filter((t) => t !== tag),
        },
      });
    }
  },

  // Session utilities
  getNextSessionType: (): SessionType => {
    const { sessionCount, config } = get();

    if (sessionCount > 0 && sessionCount % config.longBreakInterval === 0) {
      return SessionType.LONG_BREAK;
    }

    return SessionType.SHORT_BREAK;
  },

  deleteSession: (sessionId: string) => {
    const { history } = get();
    const newHistory = history.filter((session) => session.id !== sessionId);

    set({
      history: newHistory,
      stats: calculateStats(newHistory),
    });
  },

  updateSessionIcon: (sessionId: string, taskIcon?: Icon) => {
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

  updateSessionTags: (sessionId: string, tags: string[]) => {
    const { history } = get();
    const newHistory = history.map((session) =>
      session.id === sessionId ? { ...session, tags } : session
    );

    set({
      history: newHistory,
      stats: calculateStats(newHistory),
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

  setTargetRounds: (targetRounds: number) => {
    set({ targetRounds });
  },

  // Additional session utilities
  skipSession: () => {
    const { currentSession } = get();
    if (currentSession) {
      // Mark session as skipped and move to next session type
      set({
        currentSession: null,
        state: TimerState.IDLE,
        timeRemaining: 0,
      });
    }
  },

  clearAllHistory: () => {
    set({
      history: [],
      sessionCount: 0,
    });

    // Recalculate stats after clearing history
    set({
      stats: calculateStats([]),
    });
  },
});
