import { TimerState, SessionType, TimerSession } from "../../types/timer";
import { useTimerStore } from "../../store/timer-store";
import { timerCoreService } from "./timer-core-service";
import { timerPersistenceService } from "./timer-persistence-service";
import { timerNotificationService } from "./timer-notification-service";
import { timerCompletionService } from "./timer-completion-service";

/**
 * Facade service for background timer functionality.
 *
 * This service provides a unified interface to timer functionality by
 * coordinating between specialized services:
 * - TimerCoreService: Core timer operations
 * - TimerPersistenceService: State persistence
 * - TimerNotificationService: Notifications
 * - TimerCompletionService: Session completion logic
 */
export class BackgroundTimerService {
  private static instance: BackgroundTimerService;
  private isInitializing = false;

  private constructor() {}

  public static getInstance(): BackgroundTimerService {
    if (!BackgroundTimerService.instance) {
      BackgroundTimerService.instance = new BackgroundTimerService();
    }
    return BackgroundTimerService.instance;
  }

  /**
   * Check if the service is currently initializing
   * Useful for debugging and preventing unwanted auto-starts
   */
  public isCurrentlyInitializing(): boolean {
    return this.isInitializing;
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
    // Prevent starting sessions during initialization to avoid unexpected auto-starts
    if (this.isInitializing) {
      console.warn(
        "[BackgroundTimerService] Attempted to start timer during initialization - ignoring"
      );
      return;
    }

    const config = timerCoreService.getTimerConfig();

    // Create session using core service
    const { session, duration, endTime } = timerCoreService.createSession(
      type,
      taskName,
      projectName,
      tags,
      taskIcon
    );

    // Create and save background state
    const backgroundState = timerCoreService.createBackgroundState(
      session,
      session.startTime.getTime(),
      endTime.getTime(),
      TimerState.RUNNING
    );

    await timerPersistenceService.saveBackgroundState(backgroundState);

    // Start application tracking
    timerCoreService.startApplicationTracking(type, config);

    // Update store
    timerCoreService.updateStoreState(session, TimerState.RUNNING, duration);

    // Notify about session start
    await timerNotificationService.notifySessionStart(type, taskName);
  }

  /**
   * Pauses the current timer
   */
  public async pauseTimer(): Promise<void> {
    const backgroundState = await timerPersistenceService.loadBackgroundState();
    if (!backgroundState || backgroundState.state !== TimerState.RUNNING) {
      return;
    }

    const now = Date.now();
    const timeRemaining = timerCoreService.calculateTimeRemaining(
      backgroundState.endTimestamp
    );

    // Create paused state
    const updatedState = timerCoreService.createPausedBackgroundState(
      backgroundState,
      now,
      timeRemaining
    );

    await timerPersistenceService.saveBackgroundState(updatedState);

    // Update store
    timerCoreService.updateStoreState(
      backgroundState.session,
      TimerState.PAUSED,
      timeRemaining
    );

    // Notify about pause
    await timerNotificationService.notifySessionPause(backgroundState.session);
  }

  /**
   * Resumes a paused timer
   */
  public async resumeTimer(): Promise<void> {
    const backgroundState = await timerPersistenceService.loadBackgroundState();
    if (!backgroundState || backgroundState.state !== TimerState.PAUSED) {
      return;
    }

    const now = Date.now();
    const timeRemaining = backgroundState.timeRemainingWhenPaused || 0;
    const newEndTimestamp = now + timeRemaining * 1000;

    // Create resumed state
    const updatedState = timerCoreService.createResumedBackgroundState(
      backgroundState,
      newEndTimestamp
    );

    await timerPersistenceService.saveBackgroundState(updatedState);

    // Update store
    timerCoreService.updateStoreState(
      backgroundState.session,
      TimerState.RUNNING,
      timeRemaining
    );

    // Notify about resume
    await timerNotificationService.notifySessionResume(backgroundState.session);
  }

  /**
   * Stops the current timer
   */
  public async stopTimer(): Promise<void> {
    const backgroundState = await timerPersistenceService.loadBackgroundState();

    // Call the store's stopTimer method to properly save session to history
    useTimerStore.getState().stopTimer();

    // Clear background state
    await timerPersistenceService.clearBackgroundState();

    // Notify about stop if there was an active session
    if (backgroundState?.session) {
      await timerNotificationService.notifySessionStop(backgroundState.session);
    }
  }

  /**
   * Manually completes the current timer session
   */
  public async completeTimer(): Promise<void> {
    const backgroundState = await timerPersistenceService.loadBackgroundState();
    if (!backgroundState || backgroundState.state !== TimerState.RUNNING) {
      return;
    }

    // Complete the session using the completion service
    await timerCompletionService.handleManualCompletion(
      backgroundState.session
    );

    // Clear background state
    await timerPersistenceService.clearBackgroundState();
  }

  /**
   * Updates the timer state based on current time
   * This should be called periodically to sync the timer
   */
  public async updateTimerState(): Promise<void> {
    // Mark as initializing to prevent auto-starts during state restoration
    this.isInitializing = true;

    try {
      const backgroundState =
        await timerPersistenceService.loadBackgroundState();

      if (!backgroundState) {
        // No active timer
        timerCoreService.updateStoreState(null, TimerState.IDLE, 0);
        return;
      }

      if (backgroundState.state === TimerState.PAUSED) {
        // Timer is paused, use stored remaining time
        const timeRemaining = backgroundState.timeRemainingWhenPaused || 0;
        timerCoreService.updateStoreState(
          backgroundState.session,
          TimerState.PAUSED,
          timeRemaining
        );
        return;
      }

      if (backgroundState.state === TimerState.RUNNING) {
        const timeRemaining = timerCoreService.calculateTimeRemaining(
          backgroundState.endTimestamp
        );

        if (timeRemaining <= 0) {
          // Timer completed during background - handle completion WITHOUT auto-start
          await timerCompletionService.handleCompletionDuringRestore(
            backgroundState.session
          );
          await timerPersistenceService.clearBackgroundState();
        } else {
          // Timer still running
          timerCoreService.updateStoreState(
            backgroundState.session,
            TimerState.RUNNING,
            timeRemaining
          );
        }
      }
    } finally {
      // Clear initialization flag after state restoration is complete
      this.isInitializing = false;
    }
  }
}

export const backgroundTimerService = BackgroundTimerService.getInstance();
