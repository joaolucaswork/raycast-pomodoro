import { useEffect, useRef } from "react";
import { useTimerStore } from "../store/timer-store";
import { TimerState, SessionType } from "../types/timer";
import { notificationService } from "../services/notification-service";
import { backgroundTimerService } from "../services/timer/background-timer-service";

export function useTimer() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    state,
    timeRemaining,
    currentSession,
    config,
    sessionCount,
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
            // Timer completed - trigger background service to handle completion
            console.log(
              "[useTimer] Timer reached zero, triggering background service completion"
            );

            // Trigger background service to check and handle completion
            backgroundTimerService.updateTimerState();

            return {
              ...prevState,
              timeRemaining: 0,
              // Don't change state here - let background service handle it
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

  // Timer completion is now handled by the background timer service
  // This ensures consistent completion logic and prevents race conditions

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

  const handleComplete = async () => {
    await backgroundTimerService.completeTimer();
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
    complete: handleComplete,
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
