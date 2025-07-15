import {
  TimerState,
  SessionType,
  TimerSession,
  TimerConfig,
  ApplicationUsage,
} from "../../types/timer";
import { useTimerStore } from "../../store/timer-store";
import { applicationTrackingService } from "../tracking/application-tracking-service";
import { adhdSupportService } from "../features/adhd-support-service";

/**
 * Core timer service for basic timer operations.
 *
 * Handles:
 * - Timer start, pause, resume, stop operations
 * - Session creation and configuration
 * - Basic timer state management
 * - Application tracking integration
 */
export class TimerCoreService {
  private static instance: TimerCoreService;

  private constructor() {}

  public static getInstance(): TimerCoreService {
    if (!TimerCoreService.instance) {
      TimerCoreService.instance = new TimerCoreService();
    }
    return TimerCoreService.instance;
  }

  /**
   * Creates a new timer session with the specified parameters
   */
  public createSession(
    type: SessionType,
    taskName?: string,
    projectName?: string,
    tags?: string[],
    taskIcon?: import("@raycast/api").Icon
  ): { session: TimerSession; duration: number; endTime: Date } {
    const { config } = useTimerStore.getState();

    // Calculate duration based on session type
    let duration: number;
    switch (type) {
      case SessionType.WORK:
        duration = config.workDuration * 60;

        // Apply adaptive timer logic for work sessions if enabled
        if (config.enableAdaptiveTimers) {
          const currentSession = useTimerStore.getState().currentSession;
          const energyLevel = currentSession?.energyLevel || 3;
          const moodState = currentSession?.moodState || "neutral";

          const adaptiveResult = adhdSupportService.calculateAdaptiveDuration(
            config.workDuration,
            energyLevel,
            moodState,
            config.adaptiveMode,
            config.minWorkDuration,
            config.maxWorkDuration
          );

          duration = adaptiveResult.duration * 60; // Convert to seconds
        }
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

    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 1000);

    const session: TimerSession = {
      id: this.generateId(),
      type,
      duration,
      startTime: now,
      completed: false,
      taskName,
      projectName,
      tags: tags || [],
      taskIcon,
    };

    return { session, duration, endTime };
  }

  /**
   * Starts application tracking for work sessions if enabled
   */
  public startApplicationTracking(
    sessionType: SessionType,
    config: TimerConfig
  ): void {
    if (sessionType === SessionType.WORK && config.enableApplicationTracking) {
      applicationTrackingService.startTracking(config.trackingInterval);
    }
  }

  /**
   * Stops application tracking and returns usage data
   */
  public stopApplicationTracking(
    sessionType: SessionType
  ): ApplicationUsage[] | undefined {
    if (
      sessionType === SessionType.WORK &&
      applicationTrackingService.isCurrentlyTracking()
    ) {
      return applicationTrackingService.stopTracking();
    }
    return undefined;
  }

  /**
   * Updates the Zustand store with timer state
   */
  public updateStoreState(
    session: TimerSession | null,
    state: TimerState,
    timeRemaining: number
  ): void {
    useTimerStore.setState({
      currentSession: session,
      state,
      timeRemaining,
    });
  }

  /**
   * Calculates remaining time based on end timestamp
   */
  public calculateTimeRemaining(endTimestamp: number): number {
    const now = Date.now();
    return Math.max(0, Math.floor((endTimestamp - now) / 1000));
  }

  /**
   * Determines if the next session should auto-start
   */
  public shouldAutoStartNext(
    completedType: SessionType,
    config: TimerConfig
  ): boolean {
    if (completedType === SessionType.WORK) {
      return config.autoStartBreaks;
    } else {
      return config.autoStartWork;
    }
  }

  /**
   * Determines the next session type based on current state
   */
  public getNextSessionType(
    completedType: SessionType,
    currentFocusPeriodSessionCount: number,
    config: TimerConfig
  ): SessionType {
    if (completedType === SessionType.WORK) {
      // After work session, determine break type
      const isLongBreakTime =
        currentFocusPeriodSessionCount > 0 &&
        currentFocusPeriodSessionCount % config.longBreakInterval === 0;
      return isLongBreakTime ? SessionType.LONG_BREAK : SessionType.SHORT_BREAK;
    } else {
      // After any break, start work session
      return SessionType.WORK;
    }
  }

  /**
   * Determines if a focus period should continue based on remaining rounds
   */
  public shouldContinueFocusPeriod(
    currentFocusPeriodSessionCount: number,
    targetRounds: number,
    currentFocusPeriodId: string | null
  ): boolean {
    return (
      currentFocusPeriodId !== null &&
      currentFocusPeriodSessionCount < targetRounds
    );
  }

  /**
   * Validates if a timer operation can be performed
   */
  public canPerformOperation(
    operation: "start" | "pause" | "resume" | "stop",
    currentState: TimerState
  ): boolean {
    switch (operation) {
      case "start":
        return currentState === TimerState.IDLE;
      case "pause":
        return currentState === TimerState.RUNNING;
      case "resume":
        return currentState === TimerState.PAUSED;
      case "stop":
        return (
          currentState === TimerState.RUNNING ||
          currentState === TimerState.PAUSED
        );
      default:
        return false;
    }
  }

  /**
   * Creates a background timer state object
   */
  public createBackgroundState(
    session: TimerSession,
    startTimestamp: number,
    endTimestamp: number,
    state: TimerState
  ): any {
    return {
      session,
      startTimestamp,
      endTimestamp,
      state,
    };
  }

  /**
   * Creates a paused background state object
   */
  public createPausedBackgroundState(
    backgroundState: any,
    pausedAt: number,
    timeRemainingWhenPaused: number
  ): any {
    return {
      ...backgroundState,
      state: TimerState.PAUSED,
      pausedAt,
      timeRemainingWhenPaused,
    };
  }

  /**
   * Creates a resumed background state object
   */
  public createResumedBackgroundState(
    backgroundState: any,
    newEndTimestamp: number
  ): any {
    return {
      ...backgroundState,
      state: TimerState.RUNNING,
      endTimestamp: newEndTimestamp,
      pausedAt: undefined,
      timeRemainingWhenPaused: undefined,
    };
  }

  /**
   * Generates a unique ID for sessions
   */
  public generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Gets the current timer configuration
   */
  public getTimerConfig(): TimerConfig {
    return useTimerStore.getState().config;
  }

  /**
   * Gets the current timer state
   */
  public getCurrentTimerState(): {
    currentSession: TimerSession | null;
    state: TimerState;
    timeRemaining: number;
  } {
    const { currentSession, state, timeRemaining } = useTimerStore.getState();
    return { currentSession, state, timeRemaining };
  }
}

export const timerCoreService = TimerCoreService.getInstance();
