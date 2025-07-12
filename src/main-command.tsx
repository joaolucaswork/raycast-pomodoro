import { Icon, List } from "@raycast/api";
import {
  TimerDisplay,
  SessionSetup,
  TagManagement,
  AppTrackingDisplay,
} from "./commands/main/components";
import { useSessionManagement, useAppTracking } from "./commands/main/hooks";
import { parseSearchTextOnly } from "./commands/main/utils";
import { ROUND_OPTIONS } from "./commands/main/utils/timer-display-helpers";

export default function FocusTimer() {
  const {
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
    clearAllTags,
    moodEntries,
  } = useSessionManagement();

  const { currentAppName, currentAppBundleId, isAppTrackingActive } =
    useAppTracking(isRunning, currentSession?.type);

  // Get current task info from search text (without storing tags)
  const { taskName: currentTaskName, tags: currentTags } =
    parseSearchTextOnly(searchText);

  // Show loading state only if we're not initialized AND there's no current session
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
          {ROUND_OPTIONS.map((option) => (
            <List.Dropdown.Item
              key={option.value}
              value={option.value}
              title={option.title}
            />
          ))}
        </List.Dropdown>
      }
    >
      {currentSession ? (
        // Active Timer Display
        <TimerDisplay
          currentSession={currentSession}
          timeRemaining={timeRemaining}
          isRunning={isRunning}
          isPaused={isPaused}
          currentFocusPeriodSessionCount={currentFocusPeriodSessionCount}
          targetRounds={targetRounds}
          searchText={searchText}
          moodEntries={moodEntries}
          getTagConfig={getTagConfig}
          onPause={pause}
          onResume={resume}
          onComplete={complete}
          onStop={stop}
          onStartNewSession={handleStartNewSession}
        />
      ) : isIdle || isCompleted ? (
        // Setup Interface - Show when timer is idle or completed
        <>
          <SessionSetup
            currentTaskName={currentTaskName}
            currentTags={currentTags}
            selectedTaskIcon={selectedTaskIcon}
            setSelectedTaskIcon={setSelectedTaskIcon}
            targetRounds={targetRounds}
            preSessionMood={preSessionMood}
            config={config}
            getTagConfig={getTagConfig}
            updateTagConfig={updateTagConfig}
            onStartWork={handleStartWork}
            onSetPreSessionMood={setPreSessionMood}
          />

          {/* Tag Suggestions */}
          <TagManagement
            searchText={searchText}
            currentTags={currentTags}
            customTags={customTags}
            getTagConfig={getTagConfig}
            updateTagConfig={updateTagConfig}
            deleteCustomTag={deleteCustomTag}
            clearAllTags={clearAllTags}
            setSearchText={setSearchText}
          />
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
      <AppTrackingDisplay
        isAppTrackingActive={isAppTrackingActive}
        currentAppName={currentAppName}
        currentAppBundleId={currentAppBundleId}
        currentSessionType={currentSession?.type}
      />
    </List>
  );
}
