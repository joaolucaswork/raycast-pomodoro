import { List, Icon, Color } from "@raycast/api";
import { ApplicationUsage } from "../types/timer";
import { formatTime } from "../utils/helpers";
import {
  applicationTrackingService,
  ApplicationTrackingStats,
} from "../services/application-tracking";

interface ApplicationUsageStatsProps {
  applicationUsage: ApplicationUsage[];
  totalSessionTime: number;
}

export function ApplicationUsageStats({
  applicationUsage,
  totalSessionTime,
}: ApplicationUsageStatsProps) {
  if (!applicationUsage || applicationUsage.length === 0) {
    return (
      <List.Item
        title="No application usage data"
        subtitle="Application tracking was not enabled for this session"
        icon={{ source: Icon.Desktop, tintColor: Color.SecondaryText }}
      />
    );
  }

  return (
    <>
      <List.Section
        title="📱 Application Usage"
        subtitle={`${applicationUsage.length} applications tracked`}
      >
        {applicationUsage.map((app, index) => {
          const isTopApp = index === 0;
          const isTopThree = index < 3;
          const usagePercentage = Math.round(
            (app.timeSpent / totalSessionTime) * 100
          );

          // Determine icon color based on ranking
          let iconColor = Color.SecondaryText;
          if (isTopApp) iconColor = Color.Green;
          else if (index === 1) iconColor = Color.Blue;
          else if (index === 2) iconColor = Color.Orange;

          return (
            <List.Item
              key={app.bundleId}
              title={app.name}
              subtitle={`${formatTime(app.timeSpent)} • ${app.percentage}% of session`}
              icon={{
                source: Icon.Desktop,
                tintColor: iconColor,
              }}
              accessories={[
                {
                  text: `${usagePercentage}%`,
                  tooltip: `${usagePercentage}% of total session time`,
                },
                ...(isTopApp
                  ? [
                      {
                        icon: Icon.Trophy,
                        tooltip: "Most used application",
                      },
                    ]
                  : []),
                ...(isTopThree && !isTopApp
                  ? [
                      {
                        icon: Icon.Star,
                        tooltip: `#${index + 1} most used`,
                      },
                    ]
                  : []),
              ]}
            />
          );
        })}
      </List.Section>
    </>
  );
}

interface ApplicationUsageSummaryProps {
  applicationUsage: ApplicationUsage[];
}

export function ApplicationUsageSummary({
  applicationUsage,
}: ApplicationUsageSummaryProps) {
  if (!applicationUsage || applicationUsage.length === 0) {
    return (
      <List.Item
        title="📊 Application Usage Summary"
        subtitle="No application data available for this session"
        icon={{ source: Icon.BarChart, tintColor: Color.SecondaryText }}
        accessories={[
          {
            text: "Enable tracking",
            icon: Icon.Gear,
            tooltip: "Enable application tracking in preferences",
          },
        ]}
      />
    );
  }

  const mostUsedApp = applicationUsage[0];
  const totalApps = applicationUsage.length;
  const totalTime = applicationUsage.reduce(
    (sum, app) => sum + app.timeSpent,
    0
  );
  const focusScore = mostUsedApp.percentage;

  // Determine focus quality based on top app usage
  let focusQuality = "Good";
  let focusColor = Color.Green;
  if (focusScore < 40) {
    focusQuality = "Scattered";
    focusColor = Color.Red;
  } else if (focusScore < 60) {
    focusQuality = "Moderate";
    focusColor = Color.Orange;
  }

  return (
    <List.Item
      title="📊 Application Usage Summary"
      subtitle={`${totalApps} apps tracked • Focus: ${focusQuality} • Top: ${mostUsedApp.name}`}
      icon={{ source: Icon.BarChart, tintColor: Color.Blue }}
      accessories={[
        {
          text: `${formatTime(totalTime)}`,
          icon: Icon.Clock,
          tooltip: "Total tracked time",
        },
        {
          text: `${focusScore}%`,
          icon: Icon.BullsEye,
          tooltip: `${focusScore}% time in top app`,
        },
        {
          text: `${totalApps}`,
          icon: Icon.Desktop,
          tooltip: `${totalApps} applications used`,
        },
      ]}
    />
  );
}

/**
 * Enhanced Application Analytics Component
 */
interface ApplicationAnalyticsProps {
  stats: ApplicationTrackingStats;
  showInsights?: boolean;
}

export function ApplicationAnalytics({
  stats,
  showInsights = true,
}: ApplicationAnalyticsProps) {
  const insights = showInsights
    ? applicationTrackingService.getProductivityInsights()
    : null;
  const health = applicationTrackingService.getTrackingHealth();

  return (
    <>
      {/* Session Overview */}
      <List.Section title="Session Overview">
        <List.Item
          title="Total Applications"
          subtitle={`${stats.totalApplications} applications tracked`}
          icon={{ source: Icon.Desktop, tintColor: Color.Blue }}
          accessories={[
            {
              text: stats.totalApplications.toString(),
              tooltip: "Number of applications used",
            },
          ]}
        />
        <List.Item
          title="Session Duration"
          subtitle={formatTime(stats.sessionDuration)}
          icon={{ source: Icon.Clock, tintColor: Color.Blue }}
          accessories={[
            {
              text: formatTime(stats.sessionDuration),
              tooltip: "Total session time",
            },
          ]}
        />
        <List.Item
          title="Tracking Accuracy"
          subtitle={`${stats.trackingAccuracy}% accuracy`}
          icon={{ source: Icon.BarChart, tintColor: Color.Green }}
          accessories={[
            {
              text: `${stats.trackingAccuracy}%`,
              tooltip: "Application tracking accuracy",
            },
          ]}
        />
        <List.Item
          title="Average Time per App"
          subtitle={formatTime(stats.averageTimePerApp)}
          icon={{ source: Icon.Clock, tintColor: Color.Orange }}
          accessories={[
            {
              text: formatTime(stats.averageTimePerApp),
              tooltip: "Average time spent per application",
            },
          ]}
        />
      </List.Section>

      {/* Most Active Application */}
      {stats.mostUsedApplication && (
        <List.Section title="Most Active Application">
          <List.Item
            title={stats.mostUsedApplication.name}
            subtitle={`${stats.mostUsedApplication.percentage}% of session time`}
            icon={{ source: Icon.Desktop, tintColor: Color.Green }}
            accessories={[
              {
                text: formatTime(stats.mostUsedApplication.timeSpent),
                tooltip: "Time spent in this application",
              },
              {
                icon: { source: Icon.Trophy, tintColor: Color.Yellow },
                tooltip: "Most used application",
              },
            ]}
          />
        </List.Section>
      )}

      {/* Productivity Insights */}
      {insights && (
        <>
          <List.Section title="Productivity Insights">
            <List.Item
              title="Focus Score"
              subtitle={`${insights.focusScore}% productivity rating`}
              icon={{ source: Icon.BullsEye, tintColor: Color.Green }}
              accessories={[
                {
                  text: `${insights.focusScore}%`,
                  tooltip: "Overall focus quality score",
                },
              ]}
            />
            <List.Item
              title="Productive Applications"
              subtitle={`${insights.productiveApps.length} apps identified as productive`}
              icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
              accessories={[
                {
                  text: insights.productiveApps.length.toString(),
                  tooltip: "Number of productive applications",
                },
              ]}
            />
            <List.Item
              title="Potential Distractions"
              subtitle={`${insights.distractionApps.length} apps may impact focus`}
              icon={{ source: Icon.ExclamationMark, tintColor: Color.Orange }}
              accessories={[
                {
                  text: insights.distractionApps.length.toString(),
                  tooltip: "Number of potentially distracting applications",
                },
              ]}
            />
          </List.Section>

          {/* Top Productive Applications */}
          {insights.productiveApps.length > 0 && (
            <List.Section title="Top Productive Applications">
              {insights.productiveApps.slice(0, 5).map((app, index) => (
                <List.Item
                  key={app.name}
                  title={app.name}
                  subtitle={`${app.percentage}% of session time`}
                  icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
                  accessories={[
                    {
                      text: formatTime(app.timeSpent),
                      tooltip: `Used for ${formatTime(app.timeSpent)}`,
                    },
                    {
                      icon: { source: Icon.Circle, tintColor: Color.Green },
                      tooltip: "Identified as productive",
                    },
                  ]}
                />
              ))}
            </List.Section>
          )}

          {/* Potential Distractions */}
          {insights.distractionApps.length > 0 && (
            <List.Section title="Potential Distractions">
              {insights.distractionApps.slice(0, 5).map((app, index) => (
                <List.Item
                  key={app.name}
                  title={app.name}
                  subtitle={`${app.percentage}% of session time`}
                  icon={{
                    source: Icon.ExclamationMark,
                    tintColor: Color.Orange,
                  }}
                  accessories={[
                    {
                      text: formatTime(app.timeSpent),
                      tooltip: `Used for ${formatTime(app.timeSpent)}`,
                    },
                    {
                      icon: { source: Icon.Circle, tintColor: Color.Orange },
                      tooltip: "May impact focus",
                    },
                  ]}
                />
              ))}
            </List.Section>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <List.Section title="Improvement Recommendations">
              {insights.recommendations.map((recommendation, index) => (
                <List.Item
                  key={index}
                  title={recommendation}
                  icon={{ source: Icon.LightBulb, tintColor: Color.Purple }}
                  accessories={[
                    {
                      icon: { source: Icon.Circle, tintColor: Color.Purple },
                      tooltip: "AI-powered suggestion",
                    },
                  ]}
                />
              ))}
            </List.Section>
          )}
        </>
      )}

      {/* Tracking Health */}
      <List.Section title="Tracking Health">
        <List.Item
          title="Status"
          subtitle={health.isHealthy ? "Healthy" : "Issues detected"}
          icon={{
            source: health.isHealthy ? Icon.CheckCircle : Icon.ExclamationMark,
            tintColor: health.isHealthy ? Color.Green : Color.Red,
          }}
          accessories={[
            {
              icon: {
                source: Icon.Circle,
                tintColor: health.isHealthy ? Color.Green : Color.Red,
              },
              tooltip: health.isHealthy
                ? "Tracking is working properly"
                : "Some issues detected",
            },
          ]}
        />
        <List.Item
          title="Success Rate"
          subtitle={`${health.successRate}%`}
          icon={{ source: Icon.Clock, tintColor: Color.Blue }}
          accessories={[
            {
              text: `${health.successRate}%`,
              tooltip: "Percentage of successful tracking attempts",
            },
          ]}
        />
        <List.Item
          title="Error Count"
          subtitle={`${health.errorCount} errors encountered`}
          icon={{
            source: Icon.ExclamationMark,
            tintColor: health.errorCount > 0 ? Color.Red : Color.Green,
          }}
          accessories={[
            {
              text: health.errorCount.toString(),
              tooltip: "Number of tracking errors",
            },
          ]}
        />
        {health.lastError && (
          <List.Item
            title="Last Error"
            subtitle={health.lastError}
            icon={{ source: Icon.XMarkCircle, tintColor: Color.Red }}
          />
        )}
      </List.Section>
    </>
  );
}

/**
 * Real-time Application Display Component
 */
interface CurrentApplicationDisplayProps {
  showInMenuBar?: boolean;
}

export function CurrentApplicationDisplay({
  showInMenuBar = false,
}: CurrentApplicationDisplayProps) {
  const currentApp = applicationTrackingService.getCurrentApplication();
  const isTracking = applicationTrackingService.isCurrentlyTracking();
  const health = applicationTrackingService.getTrackingHealth();

  if (!isTracking || !currentApp) {
    return showInMenuBar ? null : (
      <List.Item
        title="Application Tracking Inactive"
        subtitle={
          isTracking
            ? "No application detected"
            : "Start a work session to begin tracking"
        }
        icon={{ source: Icon.Desktop, tintColor: Color.SecondaryText }}
        accessories={[
          {
            text: "Inactive",
            icon: Icon.Circle,
          },
        ]}
      />
    );
  }

  const displayText = `Currently in: ${currentApp.name}`;

  if (showInMenuBar) {
    return displayText;
  }

  return (
    <List.Item
      title="Currently Active Application"
      subtitle={`${currentApp.name} • Tracking ${health.isHealthy ? "healthy" : "issues detected"}`}
      icon={{ source: Icon.Desktop, tintColor: Color.Green }}
      accessories={[
        {
          text: "Live",
          icon: Icon.Dot,
          tooltip: "Real-time tracking active",
        },
        ...(health.errorCount > 0
          ? [
              {
                text: `${health.errorCount} errors`,
                icon: Icon.ExclamationMark,
                tooltip: "Some tracking errors occurred",
              },
            ]
          : []),
      ]}
    />
  );
}
