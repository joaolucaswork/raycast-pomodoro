import { MenuBarExtra, Icon, open, updateCommandMetadata } from "@raycast/api";
import { useTimerStore } from "./store/timer-store";
import { TimerState, SessionType } from "./types/timer";
import {
  formatTime,
  getSessionTypeLabel,
  getSessionTypeIcon,
} from "./utils/helpers";
import { backgroundTimerService } from "./services/background-timer-service";
import { applicationTrackingService } from "./services/application-tracking-service";
import { useEffect, useState } from "react";

export default function MenuBarTimer() {
  const {
    currentSession,
    state,
    timeRemaining,
    sessionCount,
    stats,
    config,
    getNextSessionType,
    completeSession,
  } = useTimerStore();

  const [currentAppUsage, setCurrentAppUsage] = useState<string | null>(null);

  // Initialize and sync timer state on component mount
  useEffect(() => {
    backgroundTimerService.updateTimerState();
  }, []);

  // Update the menu bar title and metadata
  useEffect(() => {
    let subtitle = "Ready";

    if (currentSession && state !== TimerState.IDLE) {
      const sessionLabel = getSessionTypeLabel(currentSession.type);
      const timeDisplay = formatTime(timeRemaining);

      if (state === TimerState.RUNNING) {
        subtitle = `${sessionLabel}: ${timeDisplay}`;
      } else if (state === TimerState.PAUSED) {
        subtitle = `Paused: ${timeDisplay}`;
      } else if (state === TimerState.COMPLETED) {
        subtitle = "Session Complete!";
      }
    } else {
      subtitle = `${stats.todaysSessions} sessions today`;
    }

    // Update command metadata for root search display
    updateCommandMetadata({ subtitle });
  }, [currentSession, state, timeRemaining, stats.todaysSessions]);

  // Periodic sync to ensure menu bar stays updated
  useEffect(() => {
    if (state === TimerState.RUNNING) {
      const syncInterval = setInterval(async () => {
        try {
          await backgroundTimerService.updateTimerState();
        } catch (error) {
          console.error("Failed to sync timer state in menu bar:", error);
        }
      }, 5000); // Sync every 5 seconds for menu bar

      return () => clearInterval(syncInterval);
    }
  }, [state]);

  // Update application usage display during work sessions
  useEffect(() => {
    if (
      state === TimerState.RUNNING &&
      currentSession?.type === SessionType.WORK &&
      config.enableApplicationTracking &&
      applicationTrackingService.isCurrentlyTracking()
    ) {
      const interval = setInterval(() => {
        const usageData = applicationTrackingService.getCurrentUsageData();
        const mostUsedApp = usageData.length > 0 ? usageData[0] : null;

        if (mostUsedApp && mostUsedApp.timeSpent > 0) {
          setCurrentAppUsage(
            `${mostUsedApp.name} (${Math.floor(mostUsedApp.timeSpent / 60)}m)`
          );
        } else {
          setCurrentAppUsage(null);
        }
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    } else {
      setCurrentAppUsage(null);
    }
  }, [state, currentSession, config.enableApplicationTracking]);

  const handleSessionComplete = () => {
    completeSession();
  };

  const handleStartWork = async () => {
    await backgroundTimerService.startTimer(SessionType.WORK);
  };

  const handleStartShortBreak = async () => {
    await backgroundTimerService.startTimer(SessionType.SHORT_BREAK);
  };

  const handleStartLongBreak = async () => {
    await backgroundTimerService.startTimer(SessionType.LONG_BREAK);
  };

  const handlePause = async () => {
    if (state === TimerState.RUNNING) {
      await backgroundTimerService.pauseTimer();
    } else if (state === TimerState.PAUSED) {
      await backgroundTimerService.resumeTimer();
    }
  };

  const handleStop = async () => {
    await backgroundTimerService.stopTimer();
  };

  const handleSkip = async () => {
    await backgroundTimerService.stopTimer();
  };

  const handleOpenMainCommand = () => {
    open("raycast://extensions/joaolucaswork/raycast-pomodoro/main-command");
  };

  const handleOpenHistory = () => {
    open("raycast://extensions/joaolucaswork/raycast-pomodoro/timer-history");
  };

  // Get display values
  const getMenuBarTitle = () => {
    if (currentSession && state !== TimerState.IDLE) {
      const timeDisplay = formatTime(timeRemaining);
      return timeDisplay;
    }
    return "Timer";
  };

  const getTooltip = () => {
    if (currentSession && state !== TimerState.IDLE) {
      const sessionLabel = getSessionTypeLabel(currentSession.type);
      const timeDisplay = formatTime(timeRemaining);

      if (state === TimerState.RUNNING) {
        return `${sessionLabel} - ${timeDisplay} remaining`;
      } else if (state === TimerState.PAUSED) {
        return `${sessionLabel} - Paused (${timeDisplay})`;
      } else if (state === TimerState.COMPLETED) {
        return "Session Complete!";
      }
    }
    return `Pomodoro Timer - ${stats.todaysSessions} sessions today`;
  };

  return (
    <MenuBarExtra icon={getMenuBarTitle()} tooltip={getTooltip()}>
      {/* Current Session Section */}
      {currentSession && (
        <MenuBarExtra.Section title="Current Session">
          <MenuBarExtra.Item
            title={`${getSessionTypeLabel(currentSession.type)} - ${formatTime(timeRemaining)}`}
            icon={getSessionTypeIcon(currentSession.type)}
          />
          {currentSession.taskName && (
            <MenuBarExtra.Item
              title={`Task: ${currentSession.taskName}`}
              icon={Icon.Document}
            />
          )}
          {currentSession.projectName && (
            <MenuBarExtra.Item
              title={`Project: ${currentSession.projectName}`}
              icon={Icon.Folder}
            />
          )}
          {currentAppUsage && config.enableApplicationTracking && (
            <MenuBarExtra.Item
              title={`Most Used: ${currentAppUsage}`}
              icon={Icon.Desktop}
            />
          )}
        </MenuBarExtra.Section>
      )}

      {/* Timer Controls Section */}
      <MenuBarExtra.Section title="Controls">
        {state === TimerState.IDLE && (
          <>
            <MenuBarExtra.Item
              title="Start Work Session"
              icon={Icon.Play}
              onAction={handleStartWork}
            />
            <MenuBarExtra.Item
              title="Start Short Break"
              icon={Icon.Pause}
              onAction={handleStartShortBreak}
            />
            <MenuBarExtra.Item
              title="Start Long Break"
              icon={Icon.Pause}
              onAction={handleStartLongBreak}
            />
          </>
        )}

        {state === TimerState.RUNNING && (
          <>
            <MenuBarExtra.Item
              title="Pause Timer"
              icon={Icon.Pause}
              onAction={handlePause}
            />
            <MenuBarExtra.Item
              title="Stop Timer"
              icon={Icon.Stop}
              onAction={handleStop}
            />
            <MenuBarExtra.Item
              title="Skip Session"
              icon={Icon.Forward}
              onAction={handleSkip}
            />
          </>
        )}

        {state === TimerState.PAUSED && (
          <>
            <MenuBarExtra.Item
              title="Resume Timer"
              icon={Icon.Play}
              onAction={handlePause}
            />
            <MenuBarExtra.Item
              title="Stop Timer"
              icon={Icon.Stop}
              onAction={handleStop}
            />
          </>
        )}

        {state === TimerState.COMPLETED && (
          <>
            <MenuBarExtra.Item
              title="Start Next Session"
              icon={Icon.Play}
              onAction={async () => {
                const nextType =
                  currentSession?.type === SessionType.WORK
                    ? getNextSessionType()
                    : SessionType.WORK;
                await backgroundTimerService.startTimer(nextType);
              }}
            />
            <MenuBarExtra.Item
              title="Start Work Session"
              icon={Icon.Hammer}
              onAction={handleStartWork}
            />
          </>
        )}
      </MenuBarExtra.Section>

      {/* Quick Actions Section */}
      <MenuBarExtra.Section title="Quick Actions">
        <MenuBarExtra.Item
          title="Open Timer"
          icon={Icon.Window}
          onAction={handleOpenMainCommand}
        />
        <MenuBarExtra.Item
          title="View History"
          icon={Icon.BarChart}
          onAction={handleOpenHistory}
        />
      </MenuBarExtra.Section>

      {/* Stats Section */}
      <MenuBarExtra.Section title="Today's Progress">
        <MenuBarExtra.Item
          title={`${stats.todaysSessions} sessions completed`}
          icon={Icon.CheckCircle}
        />
        <MenuBarExtra.Item
          title={`${sessionCount} work sessions`}
          icon={Icon.Hammer}
        />
        <MenuBarExtra.Item
          title={`${stats.streakCount} day streak`}
          icon={Icon.Trophy}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
