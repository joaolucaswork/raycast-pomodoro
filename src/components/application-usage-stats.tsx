import { List, Icon, Color, Detail } from "@raycast/api";
import { ApplicationUsage } from "../types/timer";
import { formatTime } from "../utils/helpers";
import {
  applicationTrackingService,
  ApplicationTrackingStats,
} from "../services/application-tracking-service";

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

  const markdown = `
# 📱 Application Analytics

## Session Overview
- **Total Applications**: ${stats.totalApplications}
- **Session Duration**: ${formatTime(stats.sessionDuration)}
- **Tracking Accuracy**: ${stats.trackingAccuracy}%
- **Average Time per App**: ${formatTime(stats.averageTimePerApp)}

${
  stats.mostUsedApplication
    ? `
## Most Active Application
**${stats.mostUsedApplication.name}**
- Time spent: ${formatTime(stats.mostUsedApplication.timeSpent)}
- Usage: ${stats.mostUsedApplication.percentage}% of session
`
    : ""
}

${
  insights
    ? `
## 🎯 Productivity Insights
- **Focus Score**: ${insights.focusScore}%
- **Productive Apps**: ${insights.productiveApps.length}
- **Distraction Apps**: ${insights.distractionApps.length}

${
  insights.productiveApps.length > 0
    ? `
### Top Productive Applications
${insights.productiveApps
  .map(
    (app, index) =>
      `${index + 1}. **${app.name}** - ${formatTime(app.timeSpent)} (${app.percentage}%)`
  )
  .join("\n")}
`
    : ""
}

${
  insights.distractionApps.length > 0
    ? `
### Potential Distractions
${insights.distractionApps
  .map(
    (app, index) =>
      `${index + 1}. **${app.name}** - ${formatTime(app.timeSpent)} (${app.percentage}%)`
  )
  .join("\n")}
`
    : ""
}

${
  insights.recommendations.length > 0
    ? `
## 💡 Recommendations
${insights.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n")}
`
    : ""
}
`
    : ""
}

## 🔧 Tracking Health
- **Status**: ${health.isHealthy ? "✅ Healthy" : "⚠️ Issues detected"}
- **Uptime**: ${formatTime(Math.floor(health.uptime / 1000))}
- **Error Count**: ${health.errorCount}
${health.lastError ? `- **Last Error**: ${health.lastError}` : ""}
  `;

  return <Detail markdown={markdown} navigationTitle="Application Analytics" />;
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
