import {
  Action,
  ActionPanel,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { STATUS_COLORS } from "../../../constants/design-tokens";
import { TimerConfig } from "../../../types/timer";
import { TimerDurationSettings } from "../forms/timer-duration-settings";

interface ProfileSettingsProps {
  config: TimerConfig;
  updateConfig: (updates: Partial<TimerConfig>) => void;
  viewMode?: string;
}

export function ProfileSettings({
  config,
  updateConfig,
  viewMode,
}: ProfileSettingsProps) {
  const { push } = useNavigation();

  // Only render when in settings mode
  if (viewMode !== "settings") return null;

  return (
    <>
      <List.Section title="Timer Settings">
        <List.Item
          title="Work Duration"
          subtitle={`${config.workDuration} minutes`}
          icon={{ source: Icon.Clock, tintColor: STATUS_COLORS.PRIMARY }}
          accessories={[
            {
              text: `${config.workDuration}m`,
              tooltip: "Duration of work sessions",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Work Duration"
                icon={Icon.Pencil}
                onAction={() => push(<TimerDurationSettings type="work" />)}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Short Break Duration"
          subtitle={`${config.shortBreakDuration} minutes`}
          icon={{ source: Icon.Pause, tintColor: STATUS_COLORS.INFO }}
          accessories={[
            {
              text: `${config.shortBreakDuration}m`,
              tooltip: "Duration of short breaks",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Short Break Duration"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<TimerDurationSettings type="shortBreak" />)
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Long Break Duration"
          subtitle={`${config.longBreakDuration} minutes`}
          icon={{ source: Icon.Pause, tintColor: STATUS_COLORS.WARNING }}
          accessories={[
            {
              text: `${config.longBreakDuration}m`,
              tooltip: "Duration of long breaks",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Long Break Duration"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<TimerDurationSettings type="longBreak" />)
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Long Break Interval"
          subtitle={`Every ${config.longBreakInterval} work sessions`}
          icon={{ source: Icon.Repeat, tintColor: STATUS_COLORS.ACCENT }}
          accessories={[
            {
              text: `${config.longBreakInterval}x`,
              tooltip: "Work sessions before long break",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Edit Long Break Interval"
                icon={Icon.Pencil}
                onAction={() =>
                  push(<TimerDurationSettings type="longBreakInterval" />)
                }
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Automation">
        <List.Item
          title="Auto-start Breaks"
          subtitle={config.autoStartBreaks ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Play,
            tintColor: config.autoStartBreaks
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.autoStartBreaks ? Icon.CheckCircle : Icon.Circle,
                tintColor: config.autoStartBreaks
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.autoStartBreaks
                ? "Breaks start automatically"
                : "Manual break start",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={config.autoStartBreaks ? "Disable" : "Enable"}
                icon={
                  config.autoStartBreaks ? Icon.XMarkCircle : Icon.CheckCircle
                }
                onAction={() =>
                  updateConfig({ autoStartBreaks: !config.autoStartBreaks })
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Auto-start Work"
          subtitle={config.autoStartWork ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.Play,
            tintColor: config.autoStartWork
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.autoStartWork ? Icon.CheckCircle : Icon.Circle,
                tintColor: config.autoStartWork
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.autoStartWork
                ? "Work sessions start automatically"
                : "Manual work start",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={config.autoStartWork ? "Disable" : "Enable"}
                icon={
                  config.autoStartWork ? Icon.XMarkCircle : Icon.CheckCircle
                }
                onAction={() =>
                  updateConfig({ autoStartWork: !config.autoStartWork })
                }
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Audio Notifications"
          subtitle={config.enableNotifications ? "Enabled" : "Disabled"}
          icon={{
            source: Icon.SpeakerOn,
            tintColor: config.enableNotifications
              ? STATUS_COLORS.SUCCESS
              : STATUS_COLORS.NEUTRAL,
          }}
          accessories={[
            {
              icon: {
                source: config.enableNotifications
                  ? Icon.CheckCircle
                  : Icon.Circle,
                tintColor: config.enableNotifications
                  ? STATUS_COLORS.SUCCESS
                  : STATUS_COLORS.NEUTRAL,
              },
              tooltip: config.enableNotifications
                ? "Audio notifications enabled"
                : "Audio notifications disabled",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={config.enableNotifications ? "Disable" : "Enable"}
                icon={
                  config.enableNotifications
                    ? Icon.XMarkCircle
                    : Icon.CheckCircle
                }
                onAction={() =>
                  updateConfig({
                    enableNotifications: !config.enableNotifications,
                  })
                }
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <ApplicationTrackingSettings
        config={config}
        updateConfig={updateConfig}
      />
      <ADHDFeaturesSettings config={config} updateConfig={updateConfig} />
      <GeneralSettings config={config} updateConfig={updateConfig} />
    </>
  );
}

// Separate components for different settings sections
function ApplicationTrackingSettings({
  config,
  updateConfig,
}: ProfileSettingsProps) {
  const { push } = useNavigation();

  return (
    <List.Section title="Application Tracking">
      <List.Item
        title="Enable Tracking"
        subtitle={config.enableApplicationTracking ? "Enabled" : "Disabled"}
        icon={{
          source: Icon.Desktop,
          tintColor: config.enableApplicationTracking
            ? STATUS_COLORS.SUCCESS
            : STATUS_COLORS.NEUTRAL,
        }}
        accessories={[
          {
            icon: {
              source: config.enableApplicationTracking
                ? Icon.CheckCircle
                : Icon.Circle,
              tintColor: config.enableApplicationTracking
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.NEUTRAL,
            },
            tooltip: config.enableApplicationTracking
              ? "Application usage tracking enabled"
              : "Application usage tracking disabled",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title={config.enableApplicationTracking ? "Disable" : "Enable"}
              icon={
                config.enableApplicationTracking
                  ? Icon.XMarkCircle
                  : Icon.CheckCircle
              }
              onAction={() =>
                updateConfig({
                  enableApplicationTracking: !config.enableApplicationTracking,
                })
              }
            />
          </ActionPanel>
        }
      />
      <List.Item
        title="Tracking Interval"
        subtitle={`Every ${config.trackingInterval} seconds`}
        icon={{ source: Icon.Stopwatch, tintColor: STATUS_COLORS.INFO }}
        accessories={[
          {
            text: `${config.trackingInterval}s`,
            tooltip: "How often to check active application",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Edit Tracking Interval"
              icon={Icon.Pencil}
              onAction={() =>
                push(<TimerDurationSettings type="trackingInterval" />)
              }
            />
          </ActionPanel>
        }
      />
    </List.Section>
  );
}

function ADHDFeaturesSettings({ config, updateConfig }: ProfileSettingsProps) {
  return (
    <List.Section title="ADHD Features">
      <List.Item
        title="Adaptive Timers"
        subtitle={config.enableAdaptiveTimers ? "Enabled" : "Disabled"}
        icon={{
          source: Icon.Clock,
          tintColor: config.enableAdaptiveTimers
            ? STATUS_COLORS.SUCCESS
            : STATUS_COLORS.NEUTRAL,
        }}
        accessories={[
          {
            icon: {
              source: config.enableAdaptiveTimers
                ? Icon.CheckCircle
                : Icon.Circle,
              tintColor: config.enableAdaptiveTimers
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.NEUTRAL,
            },
            tooltip: config.enableAdaptiveTimers
              ? "Adaptive timers enabled"
              : "Adaptive timers disabled",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title={
                config.enableAdaptiveTimers
                  ? "Disable Adaptive Timers"
                  : "Enable Adaptive Timers"
              }
              icon={
                config.enableAdaptiveTimers
                  ? Icon.XMarkCircle
                  : Icon.CheckCircle
              }
              onAction={() => {
                updateConfig({
                  enableAdaptiveTimers: !config.enableAdaptiveTimers,
                });
                showToast({
                  style: Toast.Style.Success,
                  title: config.enableAdaptiveTimers
                    ? "Adaptive Timers Disabled"
                    : "Adaptive Timers Enabled",
                });
              }}
            />
          </ActionPanel>
        }
      />

      <List.Item
        title="Reward System"
        subtitle={config.enableRewardSystem ? "Enabled" : "Disabled"}
        icon={{
          source: Icon.Trophy,
          tintColor: config.enableRewardSystem
            ? STATUS_COLORS.SUCCESS
            : STATUS_COLORS.NEUTRAL,
        }}
        accessories={[
          {
            icon: {
              source: config.enableRewardSystem
                ? Icon.CheckCircle
                : Icon.Circle,
              tintColor: config.enableRewardSystem
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.NEUTRAL,
            },
            tooltip: config.enableRewardSystem
              ? "Reward system enabled"
              : "Reward system disabled",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title={
                config.enableRewardSystem ? "Disable Rewards" : "Enable Rewards"
              }
              icon={
                config.enableRewardSystem ? Icon.XMarkCircle : Icon.CheckCircle
              }
              onAction={() => {
                updateConfig({
                  enableRewardSystem: !config.enableRewardSystem,
                });
                showToast({
                  style: Toast.Style.Success,
                  title: config.enableRewardSystem
                    ? "Reward System Disabled"
                    : "Reward System Enabled",
                });
              }}
            />
          </ActionPanel>
        }
      />

      <List.Item
        title="Hyperfocus Detection"
        subtitle={config.enableHyperfocusDetection ? "Enabled" : "Disabled"}
        icon={{
          source: Icon.BullsEye,
          tintColor: config.enableHyperfocusDetection
            ? STATUS_COLORS.SUCCESS
            : STATUS_COLORS.NEUTRAL,
        }}
        accessories={[
          {
            icon: {
              source: config.enableHyperfocusDetection
                ? Icon.CheckCircle
                : Icon.Circle,
              tintColor: config.enableHyperfocusDetection
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.NEUTRAL,
            },
            tooltip: config.enableHyperfocusDetection
              ? "Hyperfocus detection enabled"
              : "Hyperfocus detection disabled",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title={
                config.enableHyperfocusDetection
                  ? "Disable Detection"
                  : "Enable Detection"
              }
              icon={
                config.enableHyperfocusDetection
                  ? Icon.XMarkCircle
                  : Icon.CheckCircle
              }
              onAction={() => {
                updateConfig({
                  enableHyperfocusDetection: !config.enableHyperfocusDetection,
                });
                showToast({
                  style: Toast.Style.Success,
                  title: config.enableHyperfocusDetection
                    ? "Hyperfocus Detection Disabled"
                    : "Hyperfocus Detection Enabled",
                });
              }}
            />
          </ActionPanel>
        }
      />
    </List.Section>
  );
}

function GeneralSettings({ config, updateConfig }: ProfileSettingsProps) {
  return (
    <List.Section title="General Settings">
      <List.Item
        title="Transition Warnings"
        subtitle={config.enableTransitionWarnings ? "Enabled" : "Disabled"}
        icon={{
          source: Icon.Bell,
          tintColor: config.enableTransitionWarnings
            ? STATUS_COLORS.SUCCESS
            : STATUS_COLORS.NEUTRAL,
        }}
        accessories={[
          {
            icon: {
              source: config.enableTransitionWarnings
                ? Icon.CheckCircle
                : Icon.Circle,
              tintColor: config.enableTransitionWarnings
                ? STATUS_COLORS.SUCCESS
                : STATUS_COLORS.NEUTRAL,
            },
            tooltip: config.enableTransitionWarnings
              ? "Transition warnings enabled"
              : "Transition warnings disabled",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title={
                config.enableTransitionWarnings
                  ? "Disable Warnings"
                  : "Enable Warnings"
              }
              icon={
                config.enableTransitionWarnings
                  ? Icon.XMarkCircle
                  : Icon.CheckCircle
              }
              onAction={() => {
                updateConfig({
                  enableTransitionWarnings: !config.enableTransitionWarnings,
                });
                showToast({
                  style: Toast.Style.Success,
                  title: config.enableTransitionWarnings
                    ? "Transition Warnings Disabled"
                    : "Transition Warnings Enabled",
                });
              }}
            />
          </ActionPanel>
        }
      />
    </List.Section>
  );
}
