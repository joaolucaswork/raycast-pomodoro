import {
  TimerSession,
  SessionEndReason,
  SessionType,
  TimerState,
  TimerConfig,
} from "../../types/timer";
import { useTimerStore } from "../../store/timer-store";
import {
  getSessionTypeLabel,
  shouldSaveSessionToHistory,
  getActualSessionDuration,
} from "../../utils/helpers";
import { calculateStats } from "../../store/slices/stats-slice";
import { adhdSupportService } from "../features/adhd-support-service";
import { timerCoreService } from "./timer-core-service";
import { timerNotificationService } from "./timer-notification-service";

/**
 * Timer completion service for handling session completion logic.
 *
 * Handles:
 * - Session completion processing
 * - History management
 * - Auto-start logic
 * - ADHD-friendly features (points, achievements)
 * - Session validation and saving
 */
export class TimerCompletionService {
  private static instance: TimerCompletionService;

  private constructor() {}

  public static getInstance(): TimerCompletionService {
    if (!TimerCompletionService.instance) {
      TimerCompletionService.instance = new TimerCompletionService();
    }
    return TimerCompletionService.instance;
  }

  /**
   * Handles timer completion during state restoration (no auto-start)
   */
  public async handleCompletionDuringRestore(
    session: TimerSession
  ): Promise<void> {
    const completedSession = await this.processSessionCompletion(
      session,
      false
    );

    // Update store - go directly to IDLE state (no auto-start during restore)
    this.updateStoreAfterCompletion(completedSession, TimerState.IDLE, false);

    // Process ADHD features but no auto-start
    await this.processAdhdFeatures(completedSession, false);

    console.log(
      "[TimerCompletionService] Session completed during restore, going to idle state (no auto-start)"
    );
  }

  /**
   * Handles timer completion with auto-start logic for real-time completions
   */
  public async handleCompletion(
    session: TimerSession,
    isManualCompletion: boolean = false
  ): Promise<void> {
    const completedSession = await this.processSessionCompletion(session, true);

    // Update store to COMPLETED state initially
    this.updateStoreAfterCompletion(
      completedSession,
      TimerState.COMPLETED,
      true
    );

    // Process ADHD features
    await this.processAdhdFeatures(completedSession, true);

    // Handle auto-start logic
    await this.handleAutoStartLogic(session.type, isManualCompletion);
  }

  /**
   * Processes session completion and returns the completed session
   */
  private async processSessionCompletion(
    session: TimerSession,
    shouldNotify: boolean
  ): Promise<TimerSession> {
    // Stop application tracking and capture usage data if it was a work session
    const applicationUsage = timerCoreService.stopApplicationTracking(
      session.type
    );

    const completedSession: TimerSession = {
      ...session,
      endTime: new Date(),
      completed: true,
      endReason: SessionEndReason.COMPLETED,
      applicationUsage,
    };

    // Notify about completion if requested
    if (shouldNotify) {
      await timerNotificationService.notifySessionCompletion(completedSession);
    }

    return completedSession;
  }

  /**
   * Updates the store after session completion
   */
  private updateStoreAfterCompletion(
    completedSession: TimerSession,
    newState: TimerState,
    shouldSave: boolean
  ): void {
    const { history, sessionCount, currentFocusPeriodSessionCount } =
      useTimerStore.getState();

    // Check if session should be saved to history based on duration
    const shouldSaveToHistory =
      shouldSave && shouldSaveSessionToHistory(completedSession);
    const actualDuration = getActualSessionDuration(completedSession);

    // Show notification if session was too short to be saved
    if (shouldSave && !shouldSaveToHistory) {
      timerNotificationService.notifySessionTooShort(actualDuration);
    }

    // Only add to history if session meets minimum duration requirement
    const newHistory = shouldSaveToHistory
      ? [...history, completedSession]
      : history;
    const newSessionCount =
      shouldSaveToHistory && completedSession.type === SessionType.WORK
        ? sessionCount + 1
        : sessionCount;

    // Update focus period session count for work sessions
    const newFocusPeriodSessionCount =
      shouldSaveToHistory && completedSession.type === SessionType.WORK
        ? currentFocusPeriodSessionCount + 1
        : currentFocusPeriodSessionCount;

    useTimerStore.setState({
      currentSession: null,
      state: newState,
      timeRemaining: 0,
      history: newHistory,
      sessionCount: newSessionCount,
      currentFocusPeriodSessionCount: newFocusPeriodSessionCount,
      stats: calculateStats(newHistory),
      isPostSessionMoodPromptVisible: false,
      lastCompletedSession: shouldSaveToHistory ? completedSession : null,
    });
  }

  /**
   * Processes ADHD-friendly features (points, achievements, hyperfocus)
   */
  private async processAdhdFeatures(
    completedSession: TimerSession,
    enableNotifications: boolean
  ): Promise<void> {
    const updatedState = useTimerStore.getState();

    // Award points if reward system is enabled
    if (updatedState.config.enableRewardSystem) {
      const points = adhdSupportService.calculateSessionPoints(
        completedSession.duration,
        true,
        completedSession.energyLevel,
        completedSession.moodState
      );

      const reason = `Completed ${getSessionTypeLabel(completedSession.type)} session`;
      updatedState.awardPoints(points, reason);

      if (enableNotifications) {
        await timerNotificationService.notifyPointsAwarded(points, reason);
      }
    }

    // Check for hyperfocus if enabled
    if (updatedState.config.enableHyperfocusDetection) {
      updatedState.checkHyperfocus();

      // Check if hyperfocus was detected after the check
      const { hyperfocusDetection } = updatedState;
      if (hyperfocusDetection.isHyperfocusDetected && enableNotifications) {
        await timerNotificationService.notifyHyperfocusDetected(
          completedSession.duration,
          15 // Recommended break duration
        );
      }
    }
  }

  /**
   * Handles auto-start logic for the next session
   */
  private async handleAutoStartLogic(
    completedSessionType: SessionType,
    isManualCompletion: boolean
  ): Promise<void> {
    const { config, currentFocusPeriodSessionCount } = useTimerStore.getState();

    // Determine if auto-start should happen
    const shouldAutoStart =
      !isManualCompletion &&
      timerCoreService.shouldAutoStartNext(completedSessionType, config);

    if (shouldAutoStart) {
      const nextSessionType = timerCoreService.getNextSessionType(
        completedSessionType,
        currentFocusPeriodSessionCount,
        config
      );

      console.log(
        `[TimerCompletionService] Auto-starting ${nextSessionType} session after completion`
      );

      // Schedule auto-start with delay
      setTimeout(async () => {
        // Import the background timer service to start the next session
        const {
          backgroundTimerService,
        } = require("./background-timer-service");
        await backgroundTimerService.startTimer(nextSessionType);

        // Notify about auto-start
        await timerNotificationService.notifyAutoStart(nextSessionType);
      }, 2000); // 2 second delay before auto-start
    } else {
      // Auto-transition to idle after a short delay if not auto-starting
      setTimeout(() => {
        useTimerStore.setState({
          state: TimerState.IDLE,
        });
      }, 5000); // 5 seconds to show completion state
    }
  }

  /**
   * Validates if a session should be saved to history
   */
  public shouldSaveSession(session: TimerSession): boolean {
    return shouldSaveSessionToHistory(session);
  }

  /**
   * Gets the actual duration of a session
   */
  public getSessionDuration(session: TimerSession): number {
    return getActualSessionDuration(session);
  }

  /**
   * Calculates points for a completed session
   */
  public calculateSessionPoints(
    duration: number,
    completed: boolean,
    energyLevel?: number,
    moodState?: string
  ): number {
    return adhdSupportService.calculateSessionPoints(
      duration,
      completed,
      energyLevel,
      moodState
    );
  }

  /**
   * Processes session completion for manual completion
   */
  public async handleManualCompletion(session: TimerSession): Promise<void> {
    await timerNotificationService.notifyManualCompletion(session);
    await this.handleCompletion(session, true);
  }

  /**
   * Processes session completion for automatic completion
   */
  public async handleAutomaticCompletion(session: TimerSession): Promise<void> {
    await this.handleCompletion(session, false);
  }

  /**
   * Gets completion statistics for a session
   */
  public getCompletionStats(session: TimerSession): {
    duration: number;
    shouldSave: boolean;
    points: number;
  } {
    const duration = this.getSessionDuration(session);
    const shouldSave = this.shouldSaveSession(session);
    const points = this.calculateSessionPoints(
      session.duration,
      session.completed,
      session.energyLevel,
      session.moodState
    );

    return { duration, shouldSave, points };
  }
}

export const timerCompletionService = TimerCompletionService.getInstance();
