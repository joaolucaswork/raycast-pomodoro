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
import { pointsSystemService } from "../features/points-system-service";
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
      false,
      false
    );

    // Update store - go directly to IDLE state (no auto-start during restore)
    this.updateStoreAfterCompletion(completedSession, TimerState.IDLE, false);

    // Process ADHD features but no auto-start (assume natural completion during restore)
    await this.processAdhdFeatures(completedSession, false, false);

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
    const completedSession = await this.processSessionCompletion(
      session,
      true,
      isManualCompletion
    );

    // Update store to COMPLETED state initially
    this.updateStoreAfterCompletion(
      completedSession,
      TimerState.COMPLETED,
      true
    );

    // Process ADHD features
    await this.processAdhdFeatures(completedSession, true, isManualCompletion);

    // Handle auto-start logic
    await this.handleAutoStartLogic(session.type, isManualCompletion);
  }

  /**
   * Processes session completion and returns the completed session
   */
  private async processSessionCompletion(
    session: TimerSession,
    shouldNotify: boolean,
    isManualCompletion: boolean = false
  ): Promise<TimerSession> {
    // Stop application tracking and capture usage data if it was a work session
    const applicationUsage = timerCoreService.stopApplicationTracking(
      session.type
    );

    const completedSession: TimerSession = {
      ...session,
      endTime: new Date(),
      completed: true,
      endReason: isManualCompletion
        ? SessionEndReason.STOPPED
        : SessionEndReason.COMPLETED,
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
    console.log("[DEBUG] updateStoreAfterCompletion called with:", {
      sessionId: completedSession.id,
      newState,
      shouldSave,
      sessionStartTime: completedSession.startTime,
      sessionEndTime: completedSession.endTime,
    });

    const { history, sessionCount, currentFocusPeriodSessionCount } =
      useTimerStore.getState();

    console.log("[DEBUG] Current store state:", {
      currentHistoryLength: history.length,
      sessionCount,
      currentFocusPeriodSessionCount,
    });

    // Check if session should be saved to history based on duration
    const shouldSaveToHistory =
      shouldSave && shouldSaveSessionToHistory(completedSession);
    const actualDuration = getActualSessionDuration(completedSession);

    console.log("[DEBUG] Session completion details:", {
      sessionId: completedSession.id,
      type: completedSession.type,
      taskName: completedSession.taskName,
      actualDuration,
      shouldSave,
      shouldSaveToHistory,
      currentHistoryLength: history.length,
    });

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

    console.log("[DEBUG] About to update store with:", {
      shouldSaveToHistory,
      oldHistoryLength: history.length,
      newHistoryLength: newHistory.length,
      sessionBeingAdded: shouldSaveToHistory
        ? {
            id: completedSession.id,
            type: completedSession.type,
            taskName: completedSession.taskName,
            startTime: completedSession.startTime,
            endTime: completedSession.endTime,
            completed: completedSession.completed,
          }
        : null,
    });

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

    console.log("[DEBUG] Store updated after completion:", {
      newHistoryLength: newHistory.length,
      savedToHistory: shouldSaveToHistory,
      newState,
      lastCompletedSessionId: shouldSaveToHistory ? completedSession.id : null,
    });

    // Verify the store was actually updated
    const updatedState = useTimerStore.getState();
    console.log("[DEBUG] Store state after update:", {
      actualHistoryLength: updatedState.history.length,
      lastHistoryItem:
        updatedState.history[updatedState.history.length - 1]?.id,
    });
  }

  /**
   * Processes ADHD-friendly features (points, achievements, hyperfocus)
   */
  private async processAdhdFeatures(
    completedSession: TimerSession,
    enableNotifications: boolean,
    isManualCompletion: boolean = false
  ): Promise<void> {
    const updatedState = useTimerStore.getState();

    // Award points if reward system is enabled using new points system
    if (updatedState.config.enableRewardSystem) {
      const pointsResult = pointsSystemService.calculateSessionPoints(
        completedSession,
        isManualCompletion
      );

      // Only award points if the system determines they should be awarded
      if (pointsResult.shouldAward && pointsResult.points > 0) {
        updatedState.awardPoints(pointsResult.points, pointsResult.reason);

        if (enableNotifications) {
          await timerNotificationService.notifyPointsAwarded(
            pointsResult.points,
            pointsResult.reason
          );
        }
      } else if (enableNotifications && !pointsResult.shouldAward) {
        // Notify user why points weren't awarded
        await timerNotificationService.notifyPointsRestricted(
          pointsResult.reason
        );
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
    const {
      config,
      currentFocusPeriodSessionCount,
      targetRounds,
      currentFocusPeriodId,
    } = useTimerStore.getState();

    // Check if we're in a multi-round focus period and have remaining rounds
    const hasRemainingRounds =
      currentFocusPeriodId && currentFocusPeriodSessionCount < targetRounds;

    // For multi-round sessions, we should continue even if auto-start is disabled
    // This ensures the pomodoro flow continues within a focus period
    const shouldAutoStartForMultiRound =
      !isManualCompletion && hasRemainingRounds;

    // Regular auto-start logic (respects user preferences)
    // Always evaluate shouldAutoStartNext for testing purposes, then apply manual completion restriction
    const shouldAutoStartBasedOnConfig = timerCoreService.shouldAutoStartNext(
      completedSessionType,
      config
    );
    const shouldAutoStartRegular =
      !isManualCompletion && shouldAutoStartBasedOnConfig;

    const shouldAutoStart =
      shouldAutoStartForMultiRound || shouldAutoStartRegular;

    if (shouldAutoStart) {
      const nextSessionType = timerCoreService.getNextSessionType(
        completedSessionType,
        currentFocusPeriodSessionCount,
        config
      );

      // For multi-round sessions after breaks, check if we should end the focus period
      if (completedSessionType !== SessionType.WORK && hasRemainingRounds) {
        // After a break in a multi-round session, continue with work if we have remaining rounds
        console.log(
          `[TimerCompletionService] Continuing multi-round session: ${currentFocusPeriodSessionCount}/${targetRounds} rounds completed`
        );
      } else if (
        completedSessionType === SessionType.WORK &&
        !hasRemainingRounds
      ) {
        // Work session completed and no more rounds - only auto-start break if configured
        if (!shouldAutoStartRegular) {
          // End the focus period and go to idle
          setTimeout(() => {
            useTimerStore.setState({
              state: TimerState.IDLE,
            });
          }, 5000);
          return;
        }
      }

      console.log(
        `[TimerCompletionService] Auto-starting ${nextSessionType} session after completion (multi-round: ${shouldAutoStartForMultiRound}, regular: ${shouldAutoStartRegular})`
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
   * Calculates points for a completed session using the new points system
   */
  public calculateSessionPoints(
    session: TimerSession,
    isManualCompletion: boolean
  ): { points: number; reason: string; shouldAward: boolean } {
    return pointsSystemService.calculateSessionPoints(
      session,
      isManualCompletion
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
  public getCompletionStats(
    session: TimerSession,
    isManualCompletion: boolean = false
  ): {
    duration: number;
    shouldSave: boolean;
    pointsResult: { points: number; reason: string; shouldAward: boolean };
  } {
    const duration = this.getSessionDuration(session);
    const shouldSave = this.shouldSaveSession(session);
    const pointsResult = this.calculateSessionPoints(
      session,
      isManualCompletion
    );

    return { duration, shouldSave, pointsResult };
  }
}

export const timerCompletionService = TimerCompletionService.getInstance();
