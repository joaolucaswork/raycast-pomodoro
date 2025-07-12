import {
  TimerState,
  SessionType,
  TimerSession,
  SessionEndReason,
} from "../types/timer";
import { useTimerStore } from "../store/timer-store";
import { storageAdapter } from "../utils/storage-adapter";
import { getSessionTypeLabel } from "../utils/helpers";
import { adhdSupportService } from "./adhd-support-service";
import { applicationTrackingService } from "./application-tracking-service";

/**
 * Background timer service that manages timer state persistence
 * and calculates remaining time based on timestamps
 */
export class BackgroundTimerService {
  private static instance: BackgroundTimerService;
  private readonly STORAGE_KEY = "background-timer-state";

  private constructor() {}

  public static getInstance(): BackgroundTimerService {
    if (!BackgroundTimerService.instance) {
      BackgroundTimerService.instance = new BackgroundTimerService();
    }
    return BackgroundTimerService.instance;
  }

  /**
   * Starts a timer session with timestamp-based tracking
   */
  public async startTimer(
    type: SessionType,
    taskName?: string,
    projectName?: string,
    tags?: string[],
    taskIcon?: import("@raycast/api").Icon
  ): Promise<void> {
    const { config } = useTimerStore.getState();

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

    // Store background timer state
    const backgroundState = {
      session,
      startTimestamp: now.getTime(),
      endTimestamp: endTime.getTime(),
      state: TimerState.RUNNING,
    };

    await this.saveBackgroundState(backgroundState);

    // Start application tracking for work sessions if enabled
    if (type === SessionType.WORK && config.enableApplicationTracking) {
      applicationTrackingService.startTracking(config.trackingInterval);
    }

    // Update Zustand store
    useTimerStore.setState({
      currentSession: session,
      state: TimerState.RUNNING,
      timeRemaining: duration,
    });
  }

  /**
   * Pauses the current timer
   */
  public async pauseTimer(): Promise<void> {
    const backgroundState = await this.loadBackgroundState();
    if (!backgroundState || backgroundState.state !== TimerState.RUNNING) {
      return;
    }

    const now = Date.now();
    const timeRemaining = Math.max(
      0,
      Math.floor((backgroundState.endTimestamp - now) / 1000)
    );

    // Update background state
    const updatedState = {
      ...backgroundState,
      state: TimerState.PAUSED,
      pausedAt: now,
      timeRemainingWhenPaused: timeRemaining,
    };

    await this.saveBackgroundState(updatedState);

    // Update Zustand store
    useTimerStore.setState({
      state: TimerState.PAUSED,
      timeRemaining,
    });
  }

  /**
   * Resumes a paused timer
   */
  public async resumeTimer(): Promise<void> {
    const backgroundState = await this.loadBackgroundState();
    if (!backgroundState || backgroundState.state !== TimerState.PAUSED) {
      return;
    }

    const now = Date.now();
    const timeRemaining = backgroundState.timeRemainingWhenPaused || 0;
    const newEndTimestamp = now + timeRemaining * 1000;

    // Update background state
    const updatedState = {
      ...backgroundState,
      state: TimerState.RUNNING,
      endTimestamp: newEndTimestamp,
      pausedAt: undefined,
      timeRemainingWhenPaused: undefined,
    };

    await this.saveBackgroundState(updatedState);

    // Update Zustand store
    useTimerStore.setState({
      state: TimerState.RUNNING,
      timeRemaining,
    });
  }

  /**
   * Stops the current timer
   */
  public async stopTimer(): Promise<void> {
    // Call the store's stopTimer method to properly save session to history
    useTimerStore.getState().stopTimer();

    // Clear background state
    await this.clearBackgroundState();
  }

  /**
   * Manually completes the current timer session
   */
  public async completeTimer(): Promise<void> {
    const backgroundState = await this.loadBackgroundState();
    if (!backgroundState || backgroundState.state !== TimerState.RUNNING) {
      return;
    }

    // Complete the session using the background timer completion handler
    await this.handleTimerCompletion(backgroundState.session);

    // Clear background state
    await this.clearBackgroundState();
  }

  /**
   * Updates the timer state based on current time
   * This should be called periodically to sync the timer
   */
  public async updateTimerState(): Promise<void> {
    const backgroundState = await this.loadBackgroundState();

    if (!backgroundState) {
      // No active timer
      useTimerStore.setState({
        currentSession: null,
        state: TimerState.IDLE,
        timeRemaining: 0,
      });
      return;
    }

    const now = Date.now();

    if (backgroundState.state === TimerState.PAUSED) {
      // Timer is paused, use stored remaining time
      const timeRemaining = backgroundState.timeRemainingWhenPaused || 0;
      useTimerStore.setState({
        currentSession: backgroundState.session,
        state: TimerState.PAUSED,
        timeRemaining,
      });
      return;
    }

    if (backgroundState.state === TimerState.RUNNING) {
      const timeRemaining = Math.max(
        0,
        Math.floor((backgroundState.endTimestamp - now) / 1000)
      );

      if (timeRemaining <= 0) {
        // Timer completed
        await this.handleTimerCompletion(backgroundState.session);
      } else {
        // Timer still running
        useTimerStore.setState({
          currentSession: backgroundState.session,
          state: TimerState.RUNNING,
          timeRemaining,
        });
      }
    }
  }

  /**
   * Handles timer completion
   */
  private async handleTimerCompletion(session: TimerSession): Promise<void> {
    const { history, sessionCount, currentFocusPeriodSessionCount } =
      useTimerStore.getState();

    // Stop application tracking and capture usage data if it was a work session
    let applicationUsage = undefined;
    if (
      session.type === SessionType.WORK &&
      applicationTrackingService.isCurrentlyTracking()
    ) {
      applicationUsage = applicationTrackingService.stopTracking();
    }

    const completedSession: TimerSession = {
      ...session,
      endTime: new Date(),
      completed: true,
      endReason: SessionEndReason.COMPLETED,
      applicationUsage,
    };

    const newHistory = [...history, completedSession];
    const newSessionCount =
      session.type === SessionType.WORK ? sessionCount + 1 : sessionCount;

    // Update focus period session count for work sessions
    const newFocusPeriodSessionCount =
      session.type === SessionType.WORK
        ? currentFocusPeriodSessionCount + 1
        : currentFocusPeriodSessionCount;

    // Clear background state
    await this.clearBackgroundState();

    // Calculate updated stats
    const calculateStats = (history: TimerSession[]) => {
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

      const todaysSessions = completedSessions.filter((s) => {
        const sessionDate = new Date(s.startTime);
        const today = new Date();
        return sessionDate.toDateString() === today.toDateString();
      }).length;

      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
      const weekSessions = completedSessions.filter((s) => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= thisWeek;
      }).length;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthSessions = completedSessions.filter((s) => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= thisMonth;
      }).length;

      return {
        totalSessions: history.length,
        completedSessions: completedSessions.length,
        totalWorkTime,
        totalBreakTime,
        streakCount: 0, // Simplified for now
        todaysSessions,
        weekSessions,
        monthSessions,
      };
    };

    // Update store
    useTimerStore.setState({
      currentSession: null,
      state: TimerState.COMPLETED,
      timeRemaining: 0,
      history: newHistory,
      sessionCount: newSessionCount,
      currentFocusPeriodSessionCount: newFocusPeriodSessionCount,
      stats: calculateStats(newHistory),
      // Remove mood prompt to fix timer stop bug
      isPostSessionMoodPromptVisible: false,
      lastCompletedSession: null,
    });

    // ADHD-specific features - Award points and check achievements
    const updatedState = useTimerStore.getState();
    if (updatedState.config.enableRewardSystem) {
      // Calculate and award points
      const points = adhdSupportService.calculateSessionPoints(
        completedSession.duration,
        true,
        completedSession.energyLevel,
        completedSession.moodState
      );

      updatedState.awardPoints(
        points,
        `Completed ${getSessionTypeLabel(completedSession.type)} session`
      );
    }

    // Check for hyperfocus if enabled
    if (updatedState.config.enableHyperfocusDetection) {
      updatedState.checkHyperfocus();
    }

    // Auto-transition to idle after a short delay
    setTimeout(() => {
      useTimerStore.setState({
        state: TimerState.IDLE,
      });
    }, 5000); // 5 seconds to show completion state
  }

  /**
   * Saves background timer state to storage
   */
  private async saveBackgroundState(state: any): Promise<void> {
    try {
      await storageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save background timer state:", error);
    }
  }

  /**
   * Loads background timer state from storage
   */
  private async loadBackgroundState(): Promise<any> {
    try {
      const stored = await storageAdapter.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to load background timer state:", error);
      return null;
    }
  }

  /**
   * Clears background timer state from storage
   */
  private async clearBackgroundState(): Promise<void> {
    try {
      await storageAdapter.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear background timer state:", error);
    }
  }

  /**
   * Generates a unique ID for sessions
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const backgroundTimerService = BackgroundTimerService.getInstance();
