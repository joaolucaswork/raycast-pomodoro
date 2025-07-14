import { useState, useEffect, useCallback } from "react";
import { Icon } from "@raycast/api";
import { useTimer } from "../../../hooks/useTimer";
import { useTimerStore } from "../../../store/timer-store";
import { backgroundTimerService } from "../../../services/timer/background-timer-service";
import { MoodType, TimerState, SessionType } from "../../../types/timer";
import {
  parseSearchTextAndStore,
  validateTaskName,
  PREDEFINED_TAGS,
} from "../utils";

/**
 * Custom hook for managing timer sessions in the main command
 */
export function useSessionManagement() {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedTaskIcon, setSelectedTaskIcon] = useState<Icon | undefined>(
    undefined
  );
  const [preRoundMood, setpreRoundMood] = useState<MoodType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    timeRemaining,
    currentSession,
    startWorkSession,
    pause,
    resume,
    stop,
    complete,
    isRunning,
    isPaused,
    isIdle,
    isCompleted,
    updateCurrentSessionIcon,
    addTagToCurrentSession,
  } = useTimer();

  const {
    currentFocusPeriodSessionCount,
    startNewFocusPeriod,
    config,
    addCustomTag,
    customTags,
    updateTagConfig,
    deleteCustomTag,
    getTagConfig,
    clearAllTags,
    clearAllHistory,
    moodEntries,
    addMoodEntry,
    targetRounds: storeTargetRounds,
    setTargetRounds: setStoreTargetRounds,
    updateCurrentSessionName,
  } = useTimerStore();

  // Convert store's number targetRounds to string for UI compatibility
  const targetRounds = storeTargetRounds.toString();

  // Track if this is the initial render to prevent dropdown from overriding persisted values
  const [hasInitialized, setHasInitialized] = useState(false);

  // Wrapper function to convert string to number and update store
  const setTargetRounds = useCallback(
    (value: string) => {
      // Prevent dropdown from overriding persisted values during initial load
      if (!hasInitialized) {
        return;
      }

      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setStoreTargetRounds(numValue);
      }
    },
    [setStoreTargetRounds, hasInitialized]
  );

  // Initialize timer state on component mount
  useEffect(() => {
    const initializeTimer = async () => {
      try {
        // Refresh config from preferences first to ensure we have the latest settings
        const { refreshConfigFromPreferences } = useTimerStore.getState();
        refreshConfigFromPreferences();
        console.log("[useSessionManagement] Refreshed config from preferences");

        await backgroundTimerService.updateTimerState();

        // After updating timer state, check if we need to restart application tracking
        // This handles the case where the extension was reloaded during an active work session
        const currentState = useTimerStore.getState();
        if (
          currentState.state === TimerState.RUNNING &&
          currentState.currentSession?.type === SessionType.WORK &&
          currentState.config.enableApplicationTracking
        ) {
          console.log(
            "[useSessionManagement] Detected running work session, ensuring app tracking is active"
          );
          const { applicationTrackingService } = await import(
            "../../../services/tracking/application-tracking"
          );
          applicationTrackingService.ensureTrackingActive(
            currentState.config.trackingInterval
          );
        }

        setIsInitialized(true);

        // Allow dropdown interactions after initialization is complete
        setTimeout(() => {
          setHasInitialized(true);
        }, 100); // Small delay to ensure persistence has loaded
      } catch (error) {
        console.error("Failed to initialize timer state:", error);
        setIsInitialized(true); // Still mark as initialized to show the UI
        setHasInitialized(true); // Allow interactions even on error
      }
    };

    initializeTimer();
  }, []);

  // Additional preference refresh when component mounts
  // This ensures preference changes are picked up when the user returns to the extension
  useEffect(() => {
    const { refreshConfigFromPreferences } = useTimerStore.getState();
    refreshConfigFromPreferences();
    console.log("[useSessionManagement] Additional config refresh on mount");
  }, []);

  // No predefined tags initialization - removed

  // Handle starting a work session
  const handleStartWork = useCallback(async () => {
    // Refresh config from preferences before starting to ensure we have the latest duration settings
    const { refreshConfigFromPreferences } = useTimerStore.getState();
    refreshConfigFromPreferences();
    console.log(
      "[useSessionManagement] Refreshed config before starting session"
    );

    // Start new focus period if not already started or if starting fresh
    if (currentFocusPeriodSessionCount === 0 || !currentSession) {
      startNewFocusPeriod(storeTargetRounds);
    }

    // Parse task name and tags from search text AND store new tags
    const { taskName, tags } = parseSearchTextAndStore(
      searchText,
      customTags,
      PREDEFINED_TAGS,
      addCustomTag
    );

    // Validate and limit task name
    const limitedTaskName = validateTaskName(taskName);

    // Determine icon to use
    let iconToUse = selectedTaskIcon;
    if (!iconToUse && tags.length > 0) {
      // Use the first tag's icon if available
      const firstTagConfig = getTagConfig(tags[0]);
      if (firstTagConfig?.icon) {
        iconToUse = firstTagConfig.icon;
      }
    }

    // Start the work session
    startWorkSession(limitedTaskName, undefined, tags, iconToUse);

    // Log pre-session mood if selected
    if (preRoundMood) {
      // Get the session ID after starting (we'll need to wait a moment for it to be created)
      setTimeout(() => {
        const currentState = useTimerStore.getState();
        const sessionId = currentState.currentSession?.id;
        if (sessionId) {
          addMoodEntry(preRoundMood, 3, "pre-session", sessionId);
        }
      }, 100);
    }

    // Note: We don't reset form state to maintain user's setup for next round
  }, [
    storeTargetRounds,
    currentFocusPeriodSessionCount,
    currentSession,
    startNewFocusPeriod,
    searchText,
    startWorkSession,
    customTags,
    addCustomTag,
    selectedTaskIcon,
    getTagConfig,
    preRoundMood,
    addMoodEntry,
  ]);

  // Handle starting a new session (stopping current one first)
  const handleStartNewSession = useCallback(async () => {
    if (currentSession) {
      // Stop current session first if one is running
      stop();
      // Small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    // Start new session with current search content
    handleStartWork();
  }, [currentSession, stop, handleStartWork]);

  return {
    // State
    searchText,
    setSearchText,
    selectedTaskIcon,
    setSelectedTaskIcon,
    targetRounds,
    setTargetRounds,
    preRoundMood,
    setpreRoundMood,
    isInitialized,

    // Timer state
    timeRemaining,
    currentSession,
    isRunning,
    isPaused,
    isIdle,
    isCompleted,

    // Timer actions
    pause,
    resume,
    stop,
    complete,
    updateCurrentSessionIcon,
    updateCurrentSessionName,
    addTagToCurrentSession,

    // Session management
    handleStartWork,
    handleStartNewSession,

    // Store state
    currentFocusPeriodSessionCount,
    config,
    customTags,
    getTagConfig,
    updateTagConfig,
    deleteCustomTag,
    addCustomTag,
    clearAllTags,
    clearAllHistory,
    moodEntries,
    addMoodEntry,
  };
}
