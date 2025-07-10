import { useEffect, useRef } from "react";
import { useTimerStore } from "../store/timer-store";
import { TimerState, SessionType } from "../types/timer";
import { getMotivationalMessage } from "../utils/helpers";
import { notificationService } from "../services/notification-service";
import { backgroundTimerService } from "../services/background-timer-service";

export function useTimer() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    state,
    timeRemaining,
    currentSession,
    config,
    sessionCount,
    history,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipSession,
    getNextSessionType,
    updateCurrentSessionName,
    updateCurrentSessionIcon,
    addTagToCurrentSession,
    removeTagFromCurrentSession,
  } = useTimerStore();

  // Timer countdown logic
  useEffect(() => {
    if (state === TimerState.RUNNING) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Start new interval
      intervalRef.current = setInterval(() => {
        useTimerStore.setState((prevState: any) => {
          // Only decrement if still running and has time remaining
          if (
            prevState.state !== TimerState.RUNNING ||
            prevState.timeRemaining <= 0
          ) {
            return prevState;
          }

          const newTimeRemaining = prevState.timeRemaining - 1;

          if (newTimeRemaining <= 0) {
            // Timer completed
            handleTimerComplete();
            return {
              ...prevState,
              timeRemaining: 0,
              state: TimerState.COMPLETED,
            };
          }

          return {
            ...prevState,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);
    } else {
      // Clear interval when not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state]); // Only depend on state, not timeRemaining

  const handleTimerComplete = async () => {
    if (!currentSession) return;

    // Complete the current session
    const completedSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
    };

    // Update history and stats
    const newHistory = [...history, completedSession];
    const newSessionCount =
      currentSession.type === SessionType.WORK
        ? sessionCount + 1
        : sessionCount;

    // Calculate new stats
    const completedSessions = newHistory.filter((s) => s.completed);
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

    const newStats = {
      totalSessions: newHistory.length,
      completedSessions: completedSessions.length,
      totalWorkTime,
      totalBreakTime,
      streakCount: 0, // Will be calculated properly in the store
      todaysSessions: completedSessions.filter(
        (s) =>
          new Date(s.startTime).toDateString() === new Date().toDateString()
      ).length,
      weekSessions: 0, // Will be calculated properly in the store
      monthSessions: 0, // Will be calculated properly in the store
    };

    // Update store
    useTimerStore.setState({
      currentSession: null,
      state: TimerState.IDLE,
      timeRemaining: 0,
      history: newHistory,
      sessionCount: newSessionCount,
      stats: newStats,
    });

    // Show completion notification using notification service
    await notificationService.notifySessionComplete(
      currentSession.type,
      config.enableNotifications
    );

    // Auto-start next session if enabled
    if (shouldAutoStartNext(currentSession.type)) {
      const nextSessionType =
        currentSession.type === SessionType.WORK
          ? getNextSessionType()
          : SessionType.WORK;

      setTimeout(() => {
        startTimer(nextSessionType);
        // Toast disabled for Windows compatibility
        // showToast({
        //   style: Toast.Style.Success,
        //   title: "Auto-starting next session",
        //   message: getMotivationalMessage(nextSessionType, newSessionCount),
        // });
      }, 2000); // 2 second delay before auto-start
    }
  };

  const shouldAutoStartNext = (completedType: SessionType): boolean => {
    if (completedType === SessionType.WORK) {
      return config.autoStartBreaks;
    } else {
      return config.autoStartWork;
    }
  };

  const startWorkSession = async (
    taskName?: string,
    projectName?: string,
    tags?: string[],
    taskIcon?: import("@raycast/api").Icon
  ) => {
    await backgroundTimerService.startTimer(
      SessionType.WORK,
      taskName,
      projectName,
      tags,
      taskIcon
    );
    await notificationService.notifySessionStart(SessionType.WORK);
  };

  const startBreakSession = async (isLong: boolean = false) => {
    const breakType = isLong ? SessionType.LONG_BREAK : SessionType.SHORT_BREAK;
    await backgroundTimerService.startTimer(breakType);
    await notificationService.notifySessionStart(breakType);
  };

  const handlePause = async () => {
    await backgroundTimerService.pauseTimer();
    // Remove toast to prevent focus loss
  };

  const handleResume = async () => {
    await backgroundTimerService.resumeTimer();
    // Remove toast to prevent focus loss
  };

  const handleStop = async () => {
    await backgroundTimerService.stopTimer();
    // Remove toast to prevent focus loss
  };

  const handleReset = async () => {
    await backgroundTimerService.stopTimer();
    // Remove toast to prevent focus loss
  };

  const handleSkip = async () => {
    // Use skipSession to properly mark as skipped in history
    skipSession();
    // Remove toast to prevent focus loss
  };

  return {
    // State
    state,
    timeRemaining,
    currentSession,
    config,
    sessionCount,

    // Actions
    startWorkSession,
    startBreakSession,
    pause: handlePause,
    resume: handleResume,
    stop: handleStop,
    reset: handleReset,
    skip: handleSkip,

    // Real-time session updates
    updateCurrentSessionName,
    updateCurrentSessionIcon,
    addTagToCurrentSession,
    removeTagFromCurrentSession,

    // Utilities
    getNextSessionType,
    isRunning: state === TimerState.RUNNING,
    isPaused: state === TimerState.PAUSED,
    isIdle: state === TimerState.IDLE,
    isCompleted: state === TimerState.COMPLETED,
  };
}
