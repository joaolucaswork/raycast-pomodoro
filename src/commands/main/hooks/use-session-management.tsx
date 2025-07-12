import { useState, useEffect, useCallback } from "react";
import { Icon } from "@raycast/api";
import { useTimer } from "../../../hooks/useTimer";
import { useTimerStore } from "../../../store/timer-store";
import { backgroundTimerService } from "../../../services/background-timer-service";
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
  const [targetRounds, setTargetRounds] = useState("1");
  const [preSessionMood, setPreSessionMood] = useState<MoodType | null>(null);
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
  } = useTimerStore();

  // Initialize timer state on component mount
  useEffect(() => {
    const initializeTimer = async () => {
      try {
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
            "../../../services/application-tracking"
          );
          applicationTrackingService.ensureTrackingActive(
            currentState.config.trackingInterval
          );
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize timer state:", error);
        setIsInitialized(true); // Still mark as initialized to show the UI
      }
    };

    initializeTimer();
  }, []);

  // Initialize predefined tags with their icons and colors on first load
  useEffect(() => {
    const predefinedTagConfigs = [
      { name: "work", icon: Icon.Hammer, color: "#007AFF" },
      { name: "study", icon: Icon.Book, color: "#FFD60A" },
      { name: "personal", icon: Icon.Heart, color: "#30D158" },
    ];

    predefinedTagConfigs.forEach(({ name, icon, color }) => {
      // Only add if not already in custom tags
      if (!customTags.includes(name)) {
        addCustomTag(name);
      }
      // Always ensure the icon and color are configured
      updateTagConfig(name, { icon, color: color as any });
    });
  }, []); // Run only once on mount

  // Handle starting a work session
  const handleStartWork = useCallback(async () => {
    // Start new focus period if not already started or if starting fresh
    const targetRoundsNum = parseInt(targetRounds);
    if (currentFocusPeriodSessionCount === 0 || !currentSession) {
      startNewFocusPeriod(targetRoundsNum);
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
    if (preSessionMood) {
      // Get the session ID after starting (we'll need to wait a moment for it to be created)
      setTimeout(() => {
        const currentState = useTimerStore.getState();
        const sessionId = currentState.currentSession?.id;
        if (sessionId) {
          addMoodEntry(preSessionMood, 3, "pre-session", sessionId);
        }
      }, 100);
    }

    // Note: We don't reset form state to maintain user's setup for next round
  }, [
    targetRounds,
    currentFocusPeriodSessionCount,
    currentSession,
    startNewFocusPeriod,
    searchText,
    startWorkSession,
    customTags,
    addCustomTag,
    selectedTaskIcon,
    getTagConfig,
    preSessionMood,
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
    preSessionMood,
    setPreSessionMood,
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
