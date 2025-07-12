import { StateCreator } from "zustand";
import { PomodoroStore, TimerSession, SessionType } from "../../types/timer";

/**
 * Analytics event types
 */
export interface AnalyticsEvent {
  type: string;
  timestamp: Date;
  data?: Record<string, any>;
}

/**
 * Analytics middleware for tracking user behavior and performance
 */
export const analyticsMiddleware =
  <T extends PomodoroStore>(
    stateCreator: StateCreator<T, [], [], T>
  ): StateCreator<T, [], [], T> =>
  (set, get, api) => {
    const originalSet = set;

    // Wrap set function to track state changes
    const wrappedSet = (partial: any, replace?: boolean | undefined) => {
      const prevState = get();

      // Call original set function
      if (replace === true) {
        originalSet(partial, true);
      } else {
        originalSet(partial, replace as false | undefined);
      }

      const newState = get();

      // Track analytics events based on state changes
      trackStateChanges(prevState, newState);
    };

    return stateCreator(wrappedSet, get, api);
  };

/**
 * Track state changes and emit analytics events
 */
function trackStateChanges(prevState: PomodoroStore, newState: PomodoroStore) {
  // Track session start
  if (!prevState.currentSession && newState.currentSession) {
    trackEvent("session_started", {
      sessionType: newState.currentSession.type,
      duration: newState.currentSession.duration,
      hasTaskName: !!newState.currentSession.taskName,
      tagCount: newState.currentSession.tags?.length || 0,
    });
  }

  // Track session completion
  if (
    prevState.currentSession &&
    !newState.currentSession &&
    prevState.state === "running" &&
    newState.state === "completed"
  ) {
    trackEvent("session_completed", {
      sessionType: prevState.currentSession.type,
      duration: prevState.currentSession.duration,
      actualDuration:
        prevState.currentSession.duration - prevState.timeRemaining,
    });
  }

  // Track session stop
  if (
    prevState.currentSession &&
    !newState.currentSession &&
    prevState.state === "running" &&
    newState.state === "idle"
  ) {
    trackEvent("session_stopped", {
      sessionType: prevState.currentSession.type,
      timeRemaining: prevState.timeRemaining,
      percentageCompleted:
        ((prevState.currentSession.duration - prevState.timeRemaining) /
          prevState.currentSession.duration) *
        100,
    });
  }

  // Track pause/resume
  if (prevState.state === "running" && newState.state === "paused") {
    trackEvent("session_paused", {
      sessionType: newState.currentSession?.type,
      timeRemaining: newState.timeRemaining,
    });
  }

  if (prevState.state === "paused" && newState.state === "running") {
    trackEvent("session_resumed", {
      sessionType: newState.currentSession?.type,
      timeRemaining: newState.timeRemaining,
    });
  }

  // Track configuration changes
  if (JSON.stringify(prevState.config) !== JSON.stringify(newState.config)) {
    trackEvent("config_updated", {
      changes: getConfigChanges(prevState.config, newState.config),
    });
  }

  // Track tag creation
  if (prevState.customTags.length < newState.customTags.length) {
    const newTags = newState.customTags.filter(
      (tag) => !prevState.customTags.includes(tag)
    );
    trackEvent("tag_created", {
      tagCount: newTags.length,
      totalTags: newState.customTags.length,
    });
  }

  // Track achievement unlocks
  if (
    prevState.rewardSystem.achievements.length <
    newState.rewardSystem.achievements.length
  ) {
    const newAchievements = newState.rewardSystem.achievements.filter(
      (achievement) =>
        !prevState.rewardSystem.achievements.some(
          (prev) => prev.id === achievement.id
        )
    );

    newAchievements.forEach((achievement) => {
      trackEvent("achievement_unlocked", {
        achievementId: achievement.id,
        achievementName: achievement.name,
        points: achievement.points,
        rarity: achievement.rarity,
      });
    });
  }

  // Track mood entries
  if (prevState.moodEntries.length < newState.moodEntries.length) {
    const newEntries = newState.moodEntries.filter(
      (entry) => !prevState.moodEntries.some((prev) => prev.id === entry.id)
    );

    newEntries.forEach((entry) => {
      trackEvent("mood_logged", {
        mood: entry.mood,
        intensity: entry.intensity,
        context: entry.context,
        hasNotes: !!entry.notes,
      });
    });
  }
}

/**
 * Get configuration changes between two config objects
 */
function getConfigChanges(
  prevConfig: any,
  newConfig: any
): Record<string, { from: any; to: any }> {
  const changes: Record<string, { from: any; to: any }> = {};

  Object.keys(newConfig).forEach((key) => {
    if (prevConfig[key] !== newConfig[key]) {
      changes[key] = {
        from: prevConfig[key],
        to: newConfig[key],
      };
    }
  });

  return changes;
}

/**
 * Track an analytics event
 */
function trackEvent(type: string, data?: Record<string, any>) {
  const event: AnalyticsEvent = {
    type,
    timestamp: new Date(),
    data,
  };

  // In a real implementation, you would send this to your analytics service
  // For now, we'll just log it for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("Analytics Event:", event);
  }

  // Store events locally for potential export/analysis
  storeEventLocally(event);
}

/**
 * Store analytics events locally
 */
function storeEventLocally(event: AnalyticsEvent) {
  try {
    // Use Raycast's LocalStorage API instead of browser localStorage
    const { LocalStorage } = require("@raycast/api");

    LocalStorage.getItem("pomodoro-analytics").then(
      (existingData: string | undefined) => {
        const existingEvents = existingData ? JSON.parse(existingData) : [];
        const updatedEvents = [...existingEvents, event];

        // Keep only last 1000 events to prevent storage bloat
        const trimmedEvents = updatedEvents.slice(-1000);

        LocalStorage.setItem(
          "pomodoro-analytics",
          JSON.stringify(trimmedEvents)
        );
      }
    );
  } catch (error) {
    console.error("Failed to store analytics event:", error);
  }
}

/**
 * Analytics utilities
 */
export const analyticsUtils = {
  /**
   * Get stored analytics events
   */
  getStoredEvents: async (): Promise<AnalyticsEvent[]> => {
    try {
      const { LocalStorage } = require("@raycast/api");
      const data = await LocalStorage.getItem("pomodoro-analytics");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get stored analytics events:", error);
      return [];
    }
  },

  /**
   * Clear stored analytics events
   */
  clearStoredEvents: async () => {
    try {
      const { LocalStorage } = require("@raycast/api");
      await LocalStorage.removeItem("pomodoro-analytics");
    } catch (error) {
      console.error("Failed to clear stored analytics events:", error);
    }
  },

  /**
   * Export analytics events as JSON
   */
  exportEvents: (): string => {
    const events = analyticsUtils.getStoredEvents();
    return JSON.stringify(events, null, 2);
  },

  /**
   * Get analytics summary
   */
  getAnalyticsSummary: async () => {
    const events = await analyticsUtils.getStoredEvents();
    const summary = {
      totalEvents: events.length,
      eventTypes: {} as Record<string, number>,
      dateRange: {
        earliest: null as Date | null,
        latest: null as Date | null,
      },
    };

    events.forEach((event) => {
      // Count event types
      summary.eventTypes[event.type] =
        (summary.eventTypes[event.type] || 0) + 1;

      // Track date range
      const eventDate = new Date(event.timestamp);
      if (
        !summary.dateRange.earliest ||
        eventDate < summary.dateRange.earliest
      ) {
        summary.dateRange.earliest = eventDate;
      }
      if (!summary.dateRange.latest || eventDate > summary.dateRange.latest) {
        summary.dateRange.latest = eventDate;
      }
    });

    return summary;
  },
};
