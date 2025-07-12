import { Action, ActionPanel, Icon, List, useNavigation } from "@raycast/api";
import {
  STATUS_COLORS,
  ACTION_ICONS,
  getMoodIcon,
  getMoodColor,
} from "../../../constants/design-tokens";
import {
  MoodLoggingForm,
  MoodHistoryList,
} from "../../../components/mood-tracking";
import { MoodEntry, MoodAnalytics, MoodType } from "../../../types/timer";
import { moodTrackingService } from "../../../services/mood-tracking-service";

interface ProfileMoodProps {
  moodEntries: MoodEntry[];
  getMoodAnalytics: () => MoodAnalytics | null;
  addMoodEntry: (
    mood: MoodType,
    intensity: 1 | 2 | 3 | 4 | 5,
    context: "pre-session" | "during-session" | "post-session" | "standalone",
    sessionId?: string,
    notes?: string
  ) => void;
  deleteMoodEntry: (id: string) => void;
  viewMode: string;
}

export function ProfileMood({
  moodEntries,
  getMoodAnalytics,
  addMoodEntry,
  deleteMoodEntry,
  viewMode,
}: ProfileMoodProps) {
  // Only render when in mood mode
  if (viewMode !== "mood") return null;
  const { push } = useNavigation();
  const moodAnalytics = getMoodAnalytics();
  const recentMoodEntries = moodEntries.slice(-10); // Last 10 entries
  const todaysMoods = moodTrackingService.getTodaysMoodEntries(moodEntries);

  return (
    <>
      {/* Quick Mood Logging Section */}
      <List.Section title="Quick Mood Log">
        <List.Item
          title="Log New Mood"
          subtitle="Track your current emotional state"
          icon={{ source: Icon.Heart, tintColor: STATUS_COLORS.PRIMARY }}
          actions={
            <ActionPanel>
              <Action
                title="Log New Mood"
                icon={ACTION_ICONS.SAVE}
                onAction={() => push(<MoodLoggingForm />)}
              />
              <ActionPanel.Submenu title="Quick Mood Log" icon={Icon.Heart}>
                <Action
                  title="😌 Calm (3/5)"
                  icon={{ source: Icon.Heart, tintColor: STATUS_COLORS.INFO }}
                  onAction={() => addMoodEntry("calm", 3, "standalone")}
                />
                <Action
                  title="😐 Neutral (3/5)"
                  icon={{
                    source: Icon.Heart,
                    tintColor: STATUS_COLORS.NEUTRAL,
                  }}
                  onAction={() => addMoodEntry("neutral", 3, "standalone")}
                />
                <Action
                  title="😰 Stressed (2/5)"
                  icon={{
                    source: Icon.Heart,
                    tintColor: STATUS_COLORS.ERROR,
                  }}
                  onAction={() => addMoodEntry("stressed", 2, "standalone")}
                />
                <Action
                  title="💪 Energized (4/5)"
                  icon={{
                    source: Icon.Heart,
                    tintColor: STATUS_COLORS.SUCCESS,
                  }}
                  onAction={() => addMoodEntry("energized", 4, "standalone")}
                />
                <Action
                  title="🎯 Focused (4/5)"
                  icon={{
                    source: Icon.Heart,
                    tintColor: STATUS_COLORS.SUCCESS,
                  }}
                  onAction={() => addMoodEntry("focused", 4, "standalone")}
                />
                <Action
                  title="🚀 Motivated (4/5)"
                  icon={{
                    source: Icon.Heart,
                    tintColor: STATUS_COLORS.SUCCESS,
                  }}
                  onAction={() => addMoodEntry("motivated", 4, "standalone")}
                />
                <Action
                  title="😴 Tired (2/5)"
                  icon={{
                    source: Icon.Heart,
                    tintColor: STATUS_COLORS.WARNING,
                  }}
                  onAction={() => addMoodEntry("tired", 2, "standalone")}
                />
              </ActionPanel.Submenu>
            </ActionPanel>
          }
        />
      </List.Section>

      {/* Today's Mood Overview */}
      {todaysMoods.length > 0 && (
        <List.Section title={`Today's Mood (${todaysMoods.length} entries)`}>
          {todaysMoods.slice(0, 3).map((entry) => (
            <List.Item
              key={entry.id}
              title={`${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}`}
              subtitle={entry.notes || `Intensity: ${entry.intensity}/5`}
              icon={{
                source: getMoodIcon(entry.mood),
                tintColor: getMoodColor(entry.mood),
              }}
              accessories={[
                { text: `${entry.intensity}/5` },
                {
                  icon: {
                    source: Icon.Circle,
                    tintColor: getMoodColor(entry.mood),
                  },
                  tooltip: `${entry.context} mood entry`,
                },
              ]}
            />
          ))}
        </List.Section>
      )}

      {/* Mood Analytics Section */}
      {moodAnalytics && (
        <List.Section title="Mood Analytics">
          {moodAnalytics.totalEntries > 0 && (
            <>
              <List.Item
                title="Most Common Mood"
                subtitle={`${moodAnalytics.mostCommonMood.charAt(0).toUpperCase() + moodAnalytics.mostCommonMood.slice(1)}`}
                icon={{
                  source: getMoodIcon(moodAnalytics.mostCommonMood),
                  tintColor: getMoodColor(moodAnalytics.mostCommonMood),
                }}
                accessories={[
                  {
                    text: `${moodAnalytics.moodDistribution[moodAnalytics.mostCommonMood] || 0} times`,
                  },
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: getMoodColor(moodAnalytics.mostCommonMood),
                    },
                    tooltip: "Your most frequently logged mood",
                  },
                ]}
              />

              <List.Item
                title="Average Intensity"
                subtitle={`${moodAnalytics.averageIntensity.toFixed(1)}/5 across all entries`}
                icon={{ source: Icon.BarChart, tintColor: STATUS_COLORS.INFO }}
                accessories={[
                  {
                    text: `${moodAnalytics.averageIntensity.toFixed(1)}/5`,
                    tooltip: "Average mood intensity",
                  },
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: STATUS_COLORS.INFO,
                    },
                    tooltip: "Overall mood intensity average",
                  },
                ]}
              />

              <List.Item
                title="Total Entries"
                subtitle={`${moodAnalytics.totalEntries} mood entries logged`}
                icon={{ source: Icon.List, tintColor: STATUS_COLORS.ACCENT }}
                accessories={[
                  {
                    text: moodAnalytics.totalEntries.toString(),
                    tooltip: "Total mood entries",
                  },
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: STATUS_COLORS.ACCENT,
                    },
                    tooltip: "Mood tracking consistency",
                  },
                ]}
              />
            </>
          )}
        </List.Section>
      )}

      {/* Recommendations Section */}
      {moodAnalytics && moodAnalytics.improvementSuggestions.length > 0 && (
        <List.Section title="Recommendations">
          {moodAnalytics.improvementSuggestions
            .slice(0, 3)
            .map((suggestion, index) => (
              <List.Item
                key={index}
                title={suggestion}
                icon={{
                  source: Icon.LightBulb,
                  tintColor: STATUS_COLORS.WARNING,
                }}
                accessories={[
                  {
                    icon: {
                      source: Icon.Circle,
                      tintColor: STATUS_COLORS.WARNING,
                    },
                    tooltip: "Personalized recommendation",
                  },
                ]}
              />
            ))}
        </List.Section>
      )}

      {/* Recent Mood Entries Section */}
      <List.Section title="Recent Mood Entries">
        <MoodHistoryList
          moodEntries={recentMoodEntries}
          onDeleteEntry={deleteMoodEntry}
          showSessionLink={true}
        />
      </List.Section>
    </>
  );
}
