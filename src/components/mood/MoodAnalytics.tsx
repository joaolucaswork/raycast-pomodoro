import { List, Icon } from "@raycast/api";
import {
  MoodEntry,
  MoodAnalytics as MoodAnalyticsType,
  TimerSession,
} from "../../types/timer";
import {
  getMoodIcon,
  getMoodColor,
  getMoodIntensityColor,
} from "../../constants/design-tokens";
import { moodTrackingService } from "../../services/mood/mood-tracking-service";

interface MoodAnalyticsProps {
  moodEntries: MoodEntry[];
  sessions: TimerSession[];
  analytics?: MoodAnalyticsType | null;
}

export function MoodAnalytics({
  moodEntries,
  sessions,
  analytics,
}: MoodAnalyticsProps) {
  // Calculate analytics if not provided
  const moodAnalytics =
    analytics ||
    moodTrackingService.calculateMoodAnalytics(moodEntries, sessions);

  if (moodEntries.length === 0) {
    return (
      <List.EmptyView
        icon={Icon.BarChart}
        title="No Mood Data"
        description="Start tracking your mood to see analytics here"
      />
    );
  }

  const todaysMoods = moodTrackingService.getTodaysMoodEntries(moodEntries);
  const weeklyMoods = moodTrackingService.getWeeklyMoodEntries(moodEntries);

  return (
    <List navigationTitle="Mood Analytics">
      {/* Overview Section */}
      <List.Section title="Overview">
        <List.Item
          title="Total Entries"
          subtitle={`${moodAnalytics.totalEntries} mood entries logged`}
          icon={Icon.Number00}
          accessories={[{ text: moodAnalytics.totalEntries.toString() }]}
        />
        <List.Item
          title="Average Intensity"
          subtitle={`${moodAnalytics.averageIntensity}/5 average mood intensity`}
          icon={Icon.BarChart}
          accessories={[
            {
              text: `${moodAnalytics.averageIntensity}/5`,
              icon: {
                source: Icon.Circle,
                tintColor: getMoodIntensityColor(
                  Math.max(
                    1,
                    Math.min(5, Math.round(moodAnalytics.averageIntensity))
                  ) as 1 | 2 | 3 | 4 | 5
                ),
              },
            },
          ]}
        />
        <List.Item
          title="Most Common Mood"
          subtitle={`You feel ${moodAnalytics.mostCommonMood} most often`}
          icon={{
            source: getMoodIcon(moodAnalytics.mostCommonMood),
            tintColor: getMoodColor(moodAnalytics.mostCommonMood),
          }}
          accessories={[{ text: moodAnalytics.mostCommonMood }]}
        />
      </List.Section>

      {/* Today's Summary */}
      {todaysMoods.length > 0 && (
        <List.Section title="Today's Summary">
          <List.Item
            title="Today's Entries"
            subtitle={`${todaysMoods.length} mood entries logged today`}
            icon={Icon.Calendar}
            accessories={[{ text: todaysMoods.length.toString() }]}
          />
          {todaysMoods.length > 0 && (
            <List.Item
              title="Today's Average"
              subtitle={`${moodTrackingService.calculateMoodAnalytics(todaysMoods).averageIntensity}/5 intensity`}
              icon={Icon.ArrowUp}
              accessories={[
                {
                  text: `${moodTrackingService.calculateMoodAnalytics(todaysMoods).averageIntensity}/5`,
                },
              ]}
            />
          )}
        </List.Section>
      )}

      {/* Weekly Summary */}
      {weeklyMoods.length > 0 && (
        <List.Section title="This Week">
          <List.Item
            title="Weekly Entries"
            subtitle={`${weeklyMoods.length} mood entries this week`}
            icon={Icon.Calendar}
            accessories={[{ text: weeklyMoods.length.toString() }]}
          />
          {weeklyMoods.length > 0 && (
            <List.Item
              title="Weekly Average"
              subtitle={`${moodTrackingService.calculateMoodAnalytics(weeklyMoods).averageIntensity}/5 intensity`}
              icon={Icon.ArrowUp}
              accessories={[
                {
                  text: `${moodTrackingService.calculateMoodAnalytics(weeklyMoods).averageIntensity}/5`,
                },
              ]}
            />
          )}
        </List.Section>
      )}

      {/* Mood Distribution */}
      {Object.keys(moodAnalytics.moodDistribution).length > 0 && (
        <List.Section title="Mood Distribution">
          {Object.entries(moodAnalytics.moodDistribution)
            .sort(([, a], [, b]) => b - a)
            .map(([mood, percentage]) => (
              <List.Item
                key={mood}
                title={mood.charAt(0).toUpperCase() + mood.slice(1)}
                subtitle={`${percentage}% of your mood entries`}
                icon={{
                  source: getMoodIcon(mood as any),
                  tintColor: getMoodColor(mood as any),
                }}
                accessories={[{ text: `${percentage}%` }]}
              />
            ))}
        </List.Section>
      )}

      {/* Best Performance Moods */}
      {moodAnalytics.bestPerformanceMoods.length > 0 && (
        <List.Section title="Best Performance Moods">
          {moodAnalytics.bestPerformanceMoods.map((mood, index) => (
            <List.Item
              key={mood}
              title={mood.charAt(0).toUpperCase() + mood.slice(1)}
              subtitle="Associated with high productivity"
              icon={{
                source: getMoodIcon(mood),
                tintColor: getMoodColor(mood),
              }}
              accessories={[{ text: `#${index + 1}` }]}
            />
          ))}
        </List.Section>
      )}

      {/* Productivity Correlation */}
      {moodAnalytics.correlationWithProductivity.length > 0 && (
        <List.Section title="Productivity Correlation">
          {moodAnalytics.correlationWithProductivity
            .sort(
              (a, b) => b.averageSessionCompletion - a.averageSessionCompletion
            )
            .slice(0, 5)
            .map((correlation) => (
              <List.Item
                key={correlation.mood}
                title={
                  correlation.mood.charAt(0).toUpperCase() +
                  correlation.mood.slice(1)
                }
                subtitle={`${correlation.averageSessionCompletion}% completion rate`}
                icon={{
                  source: getMoodIcon(correlation.mood),
                  tintColor: getMoodColor(correlation.mood),
                }}
                accessories={[
                  { text: `${correlation.averageSessionCompletion}%` },
                  { text: `${correlation.averageFocusQuality}/5 focus` },
                ]}
              />
            ))}
        </List.Section>
      )}

      {/* Improvement Suggestions */}
      {moodAnalytics.improvementSuggestions.length > 0 && (
        <List.Section title="Suggestions">
          {moodAnalytics.improvementSuggestions
            .slice(0, 3)
            .map((suggestion, index) => (
              <List.Item
                key={index}
                title={`Tip ${index + 1}`}
                subtitle={suggestion}
                icon={Icon.LightBulb}
              />
            ))}
        </List.Section>
      )}
    </List>
  );
}
