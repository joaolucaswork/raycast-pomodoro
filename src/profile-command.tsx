import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useState, useMemo } from "react";
import { useTimerStore } from "./store/timer-store";
import { dataService } from "./services/data-service";
import {
  ProfileOverview,
  ProfileStatistics,
  ProfileAchievements,
  ProfileMood,
} from "./commands/profile/components";
import { calculateProfileMetrics } from "./commands/profile/utils";
import { STATUS_COLORS } from "./constants/design-tokens";

type ViewMode = "overview" | "statistics" | "achievements" | "mood";

export default function ProfileCommand() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const {
    stats,
    history,
    rewardSystem,
    moodEntries,
    addMoodEntry,
    deleteMoodEntry,
    getMoodAnalytics,
  } = useTimerStore();

  // Calculate detailed statistics
  const detailedStats = useMemo(() => {
    return dataService.calculateDetailedStats(history);
  }, [history]);

  // Calculate profile metrics
  const profileMetrics = useMemo(() => {
    return calculateProfileMetrics(rewardSystem);
  }, [rewardSystem]);

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case "overview":
        return Icon.Person;
      case "statistics":
        return Icon.BarChart;
      case "achievements":
        return Icon.Trophy;
      case "mood":
        return Icon.Heart;
      default:
        return Icon.Person;
    }
  };

  const getViewModeColor = (mode: ViewMode) => {
    return viewMode === mode ? STATUS_COLORS.PRIMARY : STATUS_COLORS.NEUTRAL;
  };

  return (
    <List
      navigationTitle="Focus Profile"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select View"
          value={viewMode}
          onChange={(newValue) => setViewMode(newValue as ViewMode)}
        >
          <List.Dropdown.Item
            title="Profile"
            value="overview"
            icon={Icon.Person}
          />
          <List.Dropdown.Item
            title="Statistics"
            value="statistics"
            icon={Icon.BarChart}
          />
          <List.Dropdown.Item
            title="Achievements"
            value="achievements"
            icon={Icon.Trophy}
          />
          <List.Dropdown.Item
            title="Mood Tracking"
            value="mood"
            icon={Icon.Heart}
          />
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <ActionPanel.Section title="View Mode">
            <Action
              title="Overview"
              icon={{
                source: getViewModeIcon("overview"),
                tintColor: getViewModeColor("overview"),
              }}
              onAction={() => setViewMode("overview")}
            />

            <Action
              title="Statistics"
              icon={{
                source: getViewModeIcon("statistics"),
                tintColor: getViewModeColor("statistics"),
              }}
              onAction={() => setViewMode("statistics")}
            />
            <Action
              title="Achievements"
              icon={{
                source: getViewModeIcon("achievements"),
                tintColor: getViewModeColor("achievements"),
              }}
              onAction={() => setViewMode("achievements")}
            />
            <Action
              title="Mood Tracking"
              icon={{
                source: getViewModeIcon("mood"),
                tintColor: getViewModeColor("mood"),
              }}
              onAction={() => setViewMode("mood")}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      {/* Render appropriate view based on mode */}
      <ProfileOverview
        rewardSystem={rewardSystem}
        moodEntries={moodEntries}
        history={history}
        profileMetrics={profileMetrics}
        viewMode={viewMode}
      />

      <ProfileStatistics
        stats={stats}
        history={history}
        moodEntries={moodEntries}
        getMoodAnalytics={getMoodAnalytics}
        detailedStats={detailedStats}
        viewMode={viewMode}
      />

      <ProfileAchievements rewardSystem={rewardSystem} viewMode={viewMode} />

      <ProfileMood
        moodEntries={moodEntries}
        getMoodAnalytics={getMoodAnalytics}
        addMoodEntry={addMoodEntry}
        deleteMoodEntry={deleteMoodEntry}
        viewMode={viewMode}
      />

      {/* Empty state for statistics when no data */}
      {history.length === 0 && viewMode === "statistics" && (
        <List.EmptyView
          title="No statistics available"
          description="Start a focus round to see your statistics"
          icon={Icon.BarChart}
        />
      )}
    </List>
  );
}
