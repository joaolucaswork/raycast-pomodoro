import { TimerSession, SessionEndReason } from "../../types/timer";
import { getActualSessionDuration } from "../../utils/helpers";

/**
 * Points system service implementing specific rules for focus session completion
 */
export class PointsSystemService {
  private static instance: PointsSystemService;

  // Track the last completion type to implement point restriction logic
  private lastCompletionWasManual: boolean = false;

  private constructor() {}

  public static getInstance(): PointsSystemService {
    if (!PointsSystemService.instance) {
      PointsSystemService.instance = new PointsSystemService();
    }
    return PointsSystemService.instance;
  }

  /**
   * Calculate points for a completed session based on specific rules:
   * - Natural completion (timer expires): 70 points
   * - Manual completion before 40 seconds: 1 point
   * - Manual completion after 40 seconds: 10 points
   * - Point timing restriction: After manual completion, points only awarded when next timer completes naturally
   */
  public calculateSessionPoints(
    session: TimerSession,
    isManualCompletion: boolean
  ): { points: number; reason: string; shouldAward: boolean } {
    const actualDuration = getActualSessionDuration(session);
    const isNaturalCompletion = !isManualCompletion;

    // Check if we should award points based on timing restriction
    const shouldAward = this.shouldAwardPoints(isNaturalCompletion);

    let points = 0;
    let reason = "";

    if (isNaturalCompletion) {
      // Natural completion (timer expired) - always award 70 points
      points = 70;
      reason = "Natural completion (timer expired)";

      // Reset the manual completion flag since this is a natural completion
      this.lastCompletionWasManual = false;
    } else {
      // Manual completion
      if (actualDuration < 40) {
        // Manual completion before 40 seconds - 1 point
        points = 1;
        reason = `Manual completion (${actualDuration}s < 40s minimum)`;
      } else {
        // Manual completion after 40 seconds - 10 points
        points = 10;
        reason = `Manual completion (${actualDuration}s ≥ 40s)`;
      }

      // Set flag to restrict points until next natural completion
      this.lastCompletionWasManual = true;
    }

    return {
      points: shouldAward ? points : 0,
      reason: shouldAward
        ? reason
        : `${reason} - Points restricted after manual completion`,
      shouldAward,
    };
  }

  /**
   * Determines if points should be awarded based on timing restriction rules
   */
  private shouldAwardPoints(isNaturalCompletion: boolean): boolean {
    // Always award points for natural completions
    if (isNaturalCompletion) {
      return true;
    }

    // For manual completions, only award if the last completion was also manual
    // This means points are restricted until the next natural completion
    return !this.lastCompletionWasManual;
  }

  /**
   * Reset the points system state (useful for testing or system reset)
   */
  public resetState(): void {
    this.lastCompletionWasManual = false;
  }

  /**
   * Get the current state for debugging
   */
  public getState(): { lastCompletionWasManual: boolean } {
    return {
      lastCompletionWasManual: this.lastCompletionWasManual,
    };
  }

  /**
   * Determine if a session completion was natural (timer expired) or manual
   */
  public isNaturalCompletion(session: TimerSession): boolean {
    // Check if the session has an endReason indicating natural completion
    // COMPLETED = natural completion (timer expired)
    // STOPPED = manual completion (user stopped early)
    // SKIPPED = manual completion (user skipped)
    return session.endReason === SessionEndReason.COMPLETED;
  }

  /**
   * Calculate points for legacy sessions that don't have endReason
   */
  public calculateLegacySessionPoints(session: TimerSession): number {
    const actualDuration = getActualSessionDuration(session);

    // For legacy sessions, assume they were natural completions if they're long enough
    // and were marked as completed
    if (session.completed && actualDuration >= session.duration * 0.9) {
      return 70; // Likely natural completion
    } else if (session.completed && actualDuration >= 40) {
      return 10; // Likely manual completion after 40s
    } else if (session.completed) {
      return 1; // Likely manual completion before 40s
    }

    return 0; // Not completed
  }
}

export const pointsSystemService = PointsSystemService.getInstance();
