import {
  Action,
  ActionPanel,
  Icon,
  List,
  Color,
  confirmAlert,
  Alert,
} from "@raycast/api";
import React, { useState, useEffect, useCallback } from "react";
import { useTimer } from "./hooks/useTimer";
import { useTimerStore } from "./store/timer-store";
import { backgroundTimerService } from "./services/background-timer-service";
import { applicationTrackingService } from "./services/application-tracking-service";
import {
  formatTime,
  getSessionTypeLabel,
  getProgressPercentage,
} from "./utils/helpers";
import { SessionType, TimerConfig, MoodType } from "./types/timer";
import { ACTION_ICONS, SHORTCUTS } from "./constants/design-tokens";

import { formatDistanceToNow } from "date-fns";
import { getMoodIcon, getMoodColor } from "./constants/design-tokens";
import {
  createTagIconSelectionActions,
  createTaskIconSelectionActions,
} from "./components/inline-icon-selection";

export default function FocusTimer() {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedTaskIcon, setSelectedTaskIcon] = useState<Icon | undefined>(
    undefined
  );
  const [targetRounds, setTargetRounds] = useState("1");
  const [preSessionMood, setPreSessionMood] = useState<MoodType | null>(null);
  const [currentAppName, setCurrentAppName] = useState<string | null>(null);
  const [isAppTrackingActive, setIsAppTrackingActive] = useState(false);
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

  // Sync timer state on component mount only
  React.useEffect(() => {
    const initializeTimer = async () => {
      try {
        await backgroundTimerService.updateTimerState();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize timer state:", error);
        setIsInitialized(true); // Still mark as initialized to show the UI
      }
    };

    initializeTimer();
  }, []);

  // Update current application display when tracking is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateCurrentApp = () => {
      const isTracking = applicationTrackingService.isCurrentlyTracking();
      const currentApp = applicationTrackingService.getCurrentApplication();

      setIsAppTrackingActive(isTracking);
      setCurrentAppName(currentApp?.name || null);
    };

    // Update immediately
    updateCurrentApp();

    // Update every 2 seconds when tracking is active
    if (isRunning && currentSession?.type === SessionType.WORK) {
      interval = setInterval(updateCurrentApp, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, currentSession?.type]);

  // Extract tags from search text (words starting with #)
  const extractTags = (text: string): string[] => {
    // Don't extract tags if text is just "#" (incomplete tag)
    if (text.trim() === "#") {
      return [];
    }
    const tagMatches = text.match(/#\w+/g);
    return tagMatches ? tagMatches.map((tag) => tag.substring(1)) : [];
  };

  // Pre-defined custom tags with icons
  const predefinedTags = ["work", "study", "personal"];

  // Initialize predefined tags with their icons and colors on first load
  useEffect(() => {
    const predefinedTagConfigs = [
      { name: "work", icon: Icon.Hammer, color: Color.Blue },
      { name: "study", icon: Icon.Book, color: Color.Yellow },
      { name: "personal", icon: Icon.Heart, color: Color.Green },
    ];

    predefinedTagConfigs.forEach(({ name, icon, color }) => {
      // Only add if not already in custom tags
      if (!customTags.includes(name)) {
        addCustomTag(name);
      }
      // Always ensure the icon and color are configured
      updateTagConfig(name, { icon, color });
    });
  }, []); // Run only once on mount

  // Parse task name and tags from search text (without storing tags)
  const parseSearchTextOnly = useCallback((text: string) => {
    const taskParts = text.split("#");
    const taskName = taskParts[0].trim();
    const tags = extractTags(text);
    return { taskName, tags };
  }, []);

  // Parse task name and tags from search text AND store new tags
  const parseSearchTextAndStore = useCallback(
    (text: string) => {
      const { taskName, tags } = parseSearchTextOnly(text);

      // Automatically add new tags to custom tags store
      tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase().trim();
        if (
          !customTags.includes(normalizedTag) &&
          !predefinedTags.includes(normalizedTag)
        ) {
          addCustomTag(normalizedTag);
        }
      });

      return { taskName, tags };
    },
    [customTags, addCustomTag, parseSearchTextOnly]
  );

  const handleStartWork = useCallback(async () => {
    // Start new focus period if not already started or if starting fresh
    const targetRoundsNum = parseInt(targetRounds);
    if (currentFocusPeriodSessionCount === 0 || !currentSession) {
      startNewFocusPeriod(targetRoundsNum);
    }

    // Parse task name and tags from search text AND store new tags
    const { taskName, tags } = parseSearchTextAndStore(searchText);

    // Task name is now optional - use default if empty
    const finalTaskName = taskName || "Focus Session";

    // Basic validation - limit task name length
    const limitedTaskName =
      finalTaskName.length > 100
        ? finalTaskName.substring(0, 100)
        : finalTaskName;

    // Determine the icon to use: selectedTaskIcon takes priority, then tag icons
    let iconToUse = selectedTaskIcon;
    if (!iconToUse && tags.length > 0) {
      // Check if any tag has a configured icon (prioritize first tag with icon)
      for (const tag of tags) {
        const tagConfig = getTagConfig(tag);
        if (tagConfig && tagConfig.icon) {
          iconToUse = tagConfig.icon;
          break;
        }
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
    parseSearchTextAndStore,
    selectedTaskIcon,
    getTagConfig,
    preSessionMood,
    addMoodEntry,
  ]);

  // Get tag color based on tag name (with custom config support)
  const getTagColor = (tag: string): Color => {
    // Check if there's a custom configuration for this tag
    const customConfig = getTagConfig(tag);
    if (customConfig) {
      return customConfig.color;
    }

    // Fall back to default color mapping for predefined tags
    const colorMap: Record<string, Color> = {
      work: Color.Blue,
      study: Color.Yellow,
      personal: Color.Green,
    };
    return colorMap[tag.toLowerCase()] || Color.Blue;
  };

  // Get tag icon based on tag name (with custom config support)
  const getTagIcon = (tag: string): Icon => {
    // Check if there's a custom configuration for this tag
    const customConfig = getTagConfig(tag);
    if (customConfig && customConfig.icon) {
      return customConfig.icon;
    }

    // Fall back to generic tag icon
    return Icon.Tag;
  };

  // Get the most recent mood entry
  const getMostRecentMoodEntry = () => {
    if (moodEntries.length === 0) return null;

    const sortedEntries = [...moodEntries].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return sortedEntries[0];
  };

  const getTimerDisplay = () => {
    if (!currentSession) {
      return {
        title: "Focus Timer",
        subtitle: "Ready to start",
        progress: 0,
        timeDisplay: "00:00",
        nextBreakTime: null,
      };
    }

    const progress = getProgressPercentage(
      timeRemaining,
      currentSession.duration
    );
    const sessionLabel = getSessionTypeLabel(currentSession.type);
    const timeDisplay = formatTime(timeRemaining);

    // Calculate next break time (actual clock time)
    const nextBreakTime =
      currentSession.type === SessionType.WORK
        ? new Date(Date.now() + timeRemaining * 1000)
        : null;

    return {
      title: sessionLabel, // Remove icon to prevent "hammer-16" text
      subtitle: `${timeDisplay} remaining`,
      progress,
      timeDisplay,
      nextBreakTime,
    };
  };

  const timerDisplay = getTimerDisplay();

  // Memoize action handlers to prevent unnecessary re-renders
  // IMPORTANT: All hooks must be called before any conditional returns

  // Show loading state only if we're not initialized AND there's no current session
  // This prevents the loading screen from showing when there's already a timer running
  // IMPORTANT: This conditional return comes AFTER all hooks have been called
  if (!isInitialized && !currentSession) {
    return (
      <List navigationTitle="Focus Timer" isLoading={true}>
        <List.EmptyView
          icon={Icon.Clock}
          title="Initializing Focus Timer"
          description="Setting up your productivity workspace..."
        />
      </List>
    );
  }

  // Get current task info from search text (without storing tags)
  const { taskName: currentTaskName, tags: currentTags } =
    parseSearchTextOnly(searchText);

  // Mood options for pre-session selection
  const moodOptions: { value: MoodType; title: string }[] = [
    { value: "energized", title: "Energized" },
    { value: "focused", title: "Focused" },
    { value: "calm", title: "Calm" },
    { value: "motivated", title: "Motivated" },
    { value: "neutral", title: "Neutral" },
    { value: "tired", title: "Tired" },
    { value: "stressed", title: "Stressed" },
  ];

  // Helper function to create color selection actions for a tag
  const createTagColorActions = (tagName: string) => [
    <Action
      key={`${tagName}-blue`}
      title="Blue"
      icon={{
        source: Icon.Circle,
        tintColor: Color.Blue,
      }}
      onAction={() => {
        // Auto-add tag if it doesn't exist
        if (
          !customTags.includes(tagName.toLowerCase()) &&
          !predefinedTags.includes(tagName.toLowerCase())
        ) {
          addCustomTag(tagName.toLowerCase());
        }
        updateTagConfig(tagName.toLowerCase(), { color: Color.Blue });
      }}
    />,
    <Action
      key={`${tagName}-green`}
      title="Green"
      icon={{
        source: Icon.Circle,
        tintColor: Color.Green,
      }}
      onAction={() => {
        // Auto-add tag if it doesn't exist
        if (
          !customTags.includes(tagName.toLowerCase()) &&
          !predefinedTags.includes(tagName.toLowerCase())
        ) {
          addCustomTag(tagName.toLowerCase());
        }
        updateTagConfig(tagName.toLowerCase(), { color: Color.Green });
      }}
    />,
    <Action
      key={`${tagName}-red`}
      title="Red"
      icon={{
        source: Icon.Circle,
        tintColor: Color.Red,
      }}
      onAction={() => {
        // Auto-add tag if it doesn't exist
        if (
          !customTags.includes(tagName.toLowerCase()) &&
          !predefinedTags.includes(tagName.toLowerCase())
        ) {
          addCustomTag(tagName.toLowerCase());
        }
        updateTagConfig(tagName.toLowerCase(), { color: Color.Red });
      }}
    />,
    <Action
      key={`${tagName}-purple`}
      title="Purple"
      icon={{
        source: Icon.Circle,
        tintColor: Color.Purple,
      }}
      onAction={() => {
        // Auto-add tag if it doesn't exist
        if (
          !customTags.includes(tagName.toLowerCase()) &&
          !predefinedTags.includes(tagName.toLowerCase())
        ) {
          addCustomTag(tagName.toLowerCase());
        }
        updateTagConfig(tagName.toLowerCase(), { color: Color.Purple });
      }}
    />,
    <Action
      key={`${tagName}-orange`}
      title="Orange"
      icon={{
        source: Icon.Circle,
        tintColor: Color.Orange,
      }}
      onAction={() => {
        // Auto-add tag if it doesn't exist
        if (
          !customTags.includes(tagName.toLowerCase()) &&
          !predefinedTags.includes(tagName.toLowerCase())
        ) {
          addCustomTag(tagName.toLowerCase());
        }
        updateTagConfig(tagName.toLowerCase(), { color: Color.Orange });
      }}
    />,
    <Action
      key={`${tagName}-yellow`}
      title="Yellow"
      icon={{
        source: Icon.Circle,
        tintColor: Color.Yellow,
      }}
      onAction={() => {
        // Auto-add tag if it doesn't exist
        if (
          !customTags.includes(tagName.toLowerCase()) &&
          !predefinedTags.includes(tagName.toLowerCase())
        ) {
          addCustomTag(tagName.toLowerCase());
        }
        updateTagConfig(tagName.toLowerCase(), { color: Color.Yellow });
      }}
    />,
  ];

  // Post-session mood logging removed to fix timer stop bug

  return (
    <List
      navigationTitle="Focus Timer"
      searchBarPlaceholder="Task name or # for assign/create a tag"
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Target Rounds"
          value={targetRounds}
          onChange={setTargetRounds}
        >
          <List.Dropdown.Item value="1" title="1 Round" />
          <List.Dropdown.Item value="2" title="2 Rounds" />
          <List.Dropdown.Item value="3" title="3 Rounds" />
          <List.Dropdown.Item value="4" title="4 Rounds" />
          <List.Dropdown.Item value="5" title="5 Rounds" />
          <List.Dropdown.Item value="6" title="6 Rounds" />
          <List.Dropdown.Item value="8" title="8 Rounds" />
          <List.Dropdown.Item value="10" title="10 Rounds" />
        </List.Dropdown>
      }
    >
      {currentSession ? (
        // Active Timer Display
        <>
          <List.Item
            icon={
              currentSession.type === SessionType.WORK
                ? currentSession.taskIcon || Icon.Hammer
                : Icon.Pause
            }
            title={timerDisplay.timeDisplay}
            subtitle={
              currentSession.type === SessionType.WORK
                ? `${currentSession.taskName ? `${currentSession.taskName} - ` : ""}${currentFocusPeriodSessionCount + 1}/${targetRounds}`
                : `${timerDisplay.title}${currentSession.taskName ? ` • ${currentSession.taskName}` : ""}`
            }
            accessories={[
              ...(currentSession.tags && currentSession.tags.length > 0
                ? currentSession.tags.map((tag) => ({
                    tag: { value: tag, color: getTagColor(tag) },
                  }))
                : []),
              {
                text: `${Math.round(timerDisplay.progress)}%`,
                icon: Icon.BarChart,
              },
            ]}
            actions={
              <ActionPanel>
                <ActionPanel.Section title="Timer Controls">
                  {isRunning && (
                    <>
                      <Action
                        title="Pause Timer"
                        icon={ACTION_ICONS.PAUSE}
                        onAction={pause}
                        shortcut={SHORTCUTS.PAUSE_RESUME}
                      />
                      <Action
                        title="Complete Round"
                        icon={ACTION_ICONS.COMPLETE}
                        onAction={complete}
                        shortcut={SHORTCUTS.PRIMARY_ACTION}
                      />
                    </>
                  )}

                  {isPaused && (
                    <Action
                      title="Resume Timer"
                      icon={Icon.Play}
                      onAction={resume}
                      shortcut={SHORTCUTS.PAUSE_RESUME}
                    />
                  )}
                </ActionPanel.Section>

                {/* Start New Session - Only show when user has typed something */}
                {searchText.trim().length > 0 && (
                  <ActionPanel.Section title="Quick Actions">
                    <Action
                      title="Start New Session"
                      icon={Icon.ArrowRight}
                      onAction={async () => {
                        if (currentSession) {
                          // Stop current session first if one is running
                          stop();
                          // Small delay to ensure state is updated
                          await new Promise((resolve) =>
                            setTimeout(resolve, 100)
                          );
                        }
                        // Start new session with current search content
                        handleStartWork();
                      }}
                      shortcut={{ modifiers: ["cmd"], key: "n" }}
                    />
                  </ActionPanel.Section>
                )}
              </ActionPanel>
            }
          />

          {/* Session Details */}
          <List.Section title="Session Info">
            {/* Recent Mood Entry Display */}
            {(() => {
              const recentMood = getMostRecentMoodEntry();
              return recentMood ? (
                <List.Item
                  icon={{
                    source: getMoodIcon(recentMood.mood),
                    tintColor: getMoodColor(recentMood.mood),
                  }}
                  title="Recent Mood"
                  subtitle={`${recentMood.mood.charAt(0).toUpperCase() + recentMood.mood.slice(1)} • ${formatDistanceToNow(new Date(recentMood.timestamp), { addSuffix: true })}`}
                  accessories={[
                    {
                      text: `${recentMood.intensity}/5`,
                      tooltip: `Intensity: ${recentMood.intensity}/5`,
                    },
                  ]}
                />
              ) : null;
            })()}

            {timerDisplay.nextBreakTime && (
              <List.Item
                icon={Icon.Clock}
                title="Next Break"
                subtitle={timerDisplay.nextBreakTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                accessories={[{ text: "Scheduled" }]}
              />
            )}

            {currentSession.taskName && (
              <List.Item
                icon={Icon.Document}
                title="Current Task"
                subtitle={currentSession.taskName}
                accessories={[
                  ...(currentSession.projectName
                    ? [{ text: currentSession.projectName }]
                    : []),
                ]}
                actions={
                  <ActionPanel>
                    <ActionPanel.Section title="Modify Current Task">
                      {/* Add Pre-created Tags */}
                      {customTags.length > 0 && (
                        <ActionPanel.Submenu
                          title="Add Tag to Current Task"
                          icon={Icon.Tag}
                        >
                          {customTags
                            .filter((tag) => {
                              // Only show tags that aren't already added to current session
                              const currentTags = currentSession?.tags || [];
                              return !currentTags.includes(tag.toLowerCase());
                            })
                            .map((tag) => (
                              <Action
                                key={`add-tag-${tag}`}
                                title={`#${tag}`}
                                icon={{
                                  source: getTagIcon(tag),
                                  tintColor: getTagColor(tag),
                                }}
                                onAction={() => {
                                  addTagToCurrentSession(tag);
                                }}
                              />
                            ))}
                          {customTags.filter((tag) => {
                            const currentTags = currentSession?.tags || [];
                            return !currentTags.includes(tag.toLowerCase());
                          }).length === 0 && (
                            <Action
                              title="All Tags Already Added"
                              icon={Icon.CheckCircle}
                              onAction={() => {}}
                            />
                          )}
                        </ActionPanel.Submenu>
                      )}

                      {/* Change Task Icon */}
                      {createTaskIconSelectionActions(
                        updateCurrentSessionIcon,
                        currentSession?.taskIcon
                      )}
                    </ActionPanel.Section>
                  </ActionPanel>
                }
              />
            )}
          </List.Section>
        </>
      ) : isIdle || isCompleted ? (
        // Setup Interface - Show when timer is idle or completed
        <>
          <List.Item
            icon={selectedTaskIcon || Icon.Play}
            title={currentTaskName || "Focus Session"}
            subtitle={`${config.workDuration} min`}
            accessories={[
              ...(currentTags.length > 0
                ? currentTags.map((tag) => ({
                    tag: { value: tag, color: getTagColor(tag) },
                  }))
                : []),
              ...(preSessionMood
                ? [
                    {
                      icon: {
                        source: getMoodIcon(preSessionMood),
                        tintColor: getMoodColor(preSessionMood),
                      },
                      tooltip: `Pre-session mood: ${preSessionMood}`,
                    },
                  ]
                : []),
              {
                text: `${targetRounds} round${targetRounds !== "1" ? "s" : ""}`,
                icon: Icon.BullsEye,
              },
            ]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action
                    title="Start Focus Round"
                    icon={selectedTaskIcon || ACTION_ICONS.PLAY}
                    onAction={handleStartWork}
                    shortcut={SHORTCUTS.PRIMARY_ACTION}
                  />
                </ActionPanel.Section>

                <ActionPanel.Section title="Customize">
                  {/* Dynamic Tag Color Selection - Only show if there are current tags */}
                  {currentTags.length > 0 && (
                    <>
                      {currentTags.map((tag) => (
                        <ActionPanel.Submenu
                          key={`color-${tag}`}
                          title={`Change #${tag} Color`}
                          icon={Icon.Brush}
                        >
                          {createTagColorActions(tag)}
                        </ActionPanel.Submenu>
                      ))}
                    </>
                  )}

                  <ActionPanel.Submenu
                    title="Set Pre-session Mood"
                    icon={Icon.Heart}
                  >
                    {moodOptions.map((mood) => (
                      <Action
                        key={mood.value}
                        title={mood.title}
                        icon={{
                          source: getMoodIcon(mood.value),
                          tintColor: getMoodColor(mood.value),
                        }}
                        onAction={() => setPreSessionMood(mood.value)}
                      />
                    ))}
                    {preSessionMood && (
                      <Action
                        title="Clear Mood Selection"
                        icon={Icon.XMarkCircle}
                        onAction={() => setPreSessionMood(null)}
                      />
                    )}
                  </ActionPanel.Submenu>

                  {createTaskIconSelectionActions(
                    setSelectedTaskIcon,
                    selectedTaskIcon
                  )}
                  <Action
                    title="Clear Task Icon"
                    icon={Icon.XMarkCircle}
                    onAction={() => setSelectedTaskIcon(undefined)}
                  />
                </ActionPanel.Section>

                <ActionPanel.Section title="Management">
                  <Action
                    title="Clear All Custom Tags"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={async () => {
                      const confirmed = await confirmAlert({
                        title: "Clear All Custom Tags",
                        message:
                          "Are you sure you want to delete all custom tags? This action cannot be undone.",
                        primaryAction: {
                          title: "Delete All Tags",
                          style: Alert.ActionStyle.Destructive,
                        },
                      });
                      if (confirmed) {
                        clearAllTags();
                      }
                    }}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "delete" }}
                  />
                  <Action
                    title="Clear All History"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={async () => {
                      const confirmed = await confirmAlert({
                        title: "Clear All History",
                        message:
                          "Are you sure you want to delete all session history? This action cannot be undone.",
                        primaryAction: {
                          title: "Delete All History",
                          style: Alert.ActionStyle.Destructive,
                        },
                      });
                      if (confirmed) {
                        clearAllHistory();
                      }
                    }}
                    shortcut={{ modifiers: ["cmd"], key: "delete" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />

          {/* Tag Suggestions - Separate built-in and custom tags */}
          {(currentTags.length === 0 || searchText.trim() === "#") && (
            <>
              {/* Custom Tags Section - Higher Priority */}
              {customTags.filter((tag) => !predefinedTags.includes(tag))
                .length > 0 && (
                <List.Section title="Custom Tags">
                  {customTags
                    .filter((tag) => !predefinedTags.includes(tag))
                    .map((tag) => (
                      <List.Item
                        key={`custom-${tag}`}
                        icon={getTagIcon(tag)}
                        title={`#${tag}`}
                        subtitle="Custom tag"
                        accessories={[
                          { tag: { value: tag, color: getTagColor(tag) } },
                        ]}
                        actions={
                          <ActionPanel>
                            <ActionPanel.Section title="Tag Actions">
                              <Action
                                title={`#${tag} Tag`}
                                icon={Icon.Plus}
                                onAction={() => {
                                  setSearchText((prevText) => {
                                    const currentText = prevText.trim();
                                    return currentText
                                      ? `${currentText} #${tag}`
                                      : `#${tag}`;
                                  });
                                }}
                              />
                            </ActionPanel.Section>

                            <ActionPanel.Section title="Change Color">
                              <Action
                                title="Blue"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Blue,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Blue })
                                }
                              />
                              <Action
                                title="Green"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Green,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Green })
                                }
                              />
                              <Action
                                title="Red"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Red,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Red })
                                }
                              />
                              <Action
                                title="Purple"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Purple,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Purple })
                                }
                              />
                              <Action
                                title="Orange"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Orange,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Orange })
                                }
                              />
                              <Action
                                title="Yellow"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Yellow,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Yellow })
                                }
                              />
                            </ActionPanel.Section>

                            <ActionPanel.Section title="Change Icon">
                              {createTagIconSelectionActions(
                                tag,
                                updateTagConfig,
                                getTagIcon(tag)
                              )}
                              <Action
                                title="Clear Custom Icon"
                                icon={Icon.XMarkCircle}
                                onAction={() =>
                                  updateTagConfig(tag, { icon: undefined })
                                }
                              />
                            </ActionPanel.Section>

                            <ActionPanel.Section title="Manage Tag">
                              <Action
                                title="Delete Tag"
                                icon={Icon.Trash}
                                style={Action.Style.Destructive}
                                onAction={() => deleteCustomTag(tag)}
                              />
                            </ActionPanel.Section>
                          </ActionPanel>
                        }
                      />
                    ))}
                </List.Section>
              )}

              {/* Built-in Tags Section - Subtle/Muted */}
              {customTags.filter((tag) => predefinedTags.includes(tag)).length >
                0 && (
                <List.Section title="Built-in Tags">
                  {customTags
                    .filter((tag) => predefinedTags.includes(tag))
                    .map((tag) => (
                      <List.Item
                        key={`builtin-${tag}`}
                        icon={{
                          source: getTagIcon(tag),
                          tintColor: Color.SecondaryText,
                        }}
                        title={`#${tag}`}
                        subtitle=""
                        accessories={[
                          { tag: { value: tag, color: Color.SecondaryText } },
                        ]}
                        actions={
                          <ActionPanel>
                            <ActionPanel.Section title="Tag Actions">
                              <Action
                                title={`#${tag} Tag`}
                                icon={Icon.Plus}
                                onAction={() => {
                                  setSearchText((prevText) => {
                                    const currentText = prevText.trim();
                                    return currentText
                                      ? `${currentText} #${tag}`
                                      : `#${tag}`;
                                  });
                                }}
                              />
                            </ActionPanel.Section>

                            <ActionPanel.Section title="Change Color">
                              <Action
                                title="Blue"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Blue,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Blue })
                                }
                              />
                              <Action
                                title="Green"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Green,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Green })
                                }
                              />
                              <Action
                                title="Red"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Red,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Red })
                                }
                              />
                              <Action
                                title="Purple"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Purple,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Purple })
                                }
                              />
                              <Action
                                title="Orange"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Orange,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Orange })
                                }
                              />
                              <Action
                                title="Yellow"
                                icon={{
                                  source: Icon.Circle,
                                  tintColor: Color.Yellow,
                                }}
                                onAction={() =>
                                  updateTagConfig(tag, { color: Color.Yellow })
                                }
                              />
                            </ActionPanel.Section>

                            {/* Built-in tags cannot be deleted */}
                          </ActionPanel>
                        }
                      />
                    ))}
                </List.Section>
              )}
            </>
          )}
        </>
      ) : null}

      {/* Empty View when idle/completed and no search text (fallback) */}
      {(isIdle || isCompleted) && !searchText && (
        <List.EmptyView
          icon={Icon.Clock}
          title="Focus Timer"
          description="Enter a task name in the search bar above to get started, or press Cmd+Return to start a focus session"
        />
      )}

      {/* Application Tracking */}
      {isAppTrackingActive &&
        currentAppName &&
        currentSession?.type === SessionType.WORK && (
          <List.Section title="Activity">
            <List.Item
              icon={Icon.Desktop}
              title="Current Application"
              subtitle={currentAppName}
              accessories={[{ icon: Icon.Dot, tooltip: "Live tracking" }]}
            />
          </List.Section>
        )}
    </List>
  );
}
