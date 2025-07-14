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
    updateCurrentSessionIcon,
    updateCurrentSessionName,

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
    moodEntries,
    addMoodEntry,
  } = useSessionManagement();

  const { currentAppName, currentAppBundleId, isAppTrackingActive } =
    useAppTracking(isRunning, currentSession?.type);

  // Get current task info from search text (without storing tags)
  const { taskName: currentTaskName, tags: currentTags } =
    parseSearchTextOnly(searchText);

  // Show loading state only if we're not initialized AND there's no current session
  if (!isInitialized && !currentSession) {
    return (
      <List navigationTitle="Another Round" isLoading={true}>
        <List.EmptyView
          icon={Icon.Clock}
          title="Preparing for Another Round"
          description="Setting up your boxing training workspace..."
        />
      </List>
    );
  }

  return (
    <List
      navigationTitle="Another Round"
      searchBarPlaceholder="What are you training for today?"
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
          updateCurrentSessionName={updateCurrentSessionName}
          updateCurrentSessionIcon={updateCurrentSessionIcon}
          addMoodEntry={addMoodEntry}
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
            addCustomTag={addCustomTag}
            clearAllTags={clearAllTags}
            setSearchText={setSearchText}
          />
        </>
      ) : null}

      {/* Empty View when idle/completed and no search text (fallback) */}
      {(isIdle || isCompleted) && !searchText && (
        <List.EmptyView
          icon={Icon.Clock}
          title="Ready for Another Round"
          description="Enter what you're training for in the search bar above, or press Cmd+Return to start your boxing round"
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
