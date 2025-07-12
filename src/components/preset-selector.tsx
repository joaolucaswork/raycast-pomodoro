import {
  Action,
  ActionPanel,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import React from "react";
import { useTimerStore } from "../store/timer-store";
import {
  preferencesService,
  TimerPreset,
} from "../services/preferences-service";
import { formatDuration } from "../utils/helpers";

interface PresetSelectorProps {
  onPresetSelected?: (preset: TimerPreset) => void;
  onBack?: () => void;
}

export function PresetSelector({
  onPresetSelected,
  onBack,
}: PresetSelectorProps) {
  const { updateConfig, stats } = useTimerStore();
  const presets = preferencesService.getPresets();

  const handlePresetSelect = async (preset: TimerPreset) => {
    try {
      updateConfig(preset.config);

      await showToast({
        style: Toast.Style.Success,
        title: "Preset Applied",
        message: `Switched to ${preset.name} configuration`,
      });

      if (onPresetSelected) {
        onPresetSelected(preset);
      }
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Apply Preset",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const getRecommendedPreset = () => {
    const avgSessionLength =
      stats.completedSessions > 0
        ? stats.totalWorkTime / stats.completedSessions / 60
        : 25;

    return preferencesService.getRecommendedPresetForUser(
      stats.completedSessions,
      avgSessionLength,
    );
  };

  const recommendedPreset = getRecommendedPreset();

  return (
    <List
      searchBarPlaceholder="Search timer presets..."
      actions={
        onBack ? (
          <ActionPanel>
            <Action title="Back" icon={Icon.ArrowLeft} onAction={onBack} />
          </ActionPanel>
        ) : undefined
      }
    >
      <List.Section title="Recommended">
        <List.Item
          title={recommendedPreset.name}
          subtitle={recommendedPreset.description}
          icon={Icon.Star}
          accessories={[
            {
              text: preferencesService.getConfigSummary(
                recommendedPreset.config,
              ),
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Apply Preset"
                icon={Icon.Checkmark}
                onAction={() => handlePresetSelect(recommendedPreset)}
              />
              <Action
                title="View Details"
                icon={Icon.Eye}
                onAction={() => {
                  showToast({
                    style: Toast.Style.Success,
                    title: recommendedPreset.name,
                    message: preferencesService.getConfigSummary(
                      recommendedPreset.config,
                    ),
                  });
                }}
              />
              {onBack && (
                <Action title="Back" icon={Icon.ArrowLeft} onAction={onBack} />
              )}
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="All Presets">
        {presets.map((preset) => (
          <List.Item
            key={preset.id}
            title={preset.name}
            subtitle={preset.description}
            icon={getPresetIcon(preset.id)}
            accessories={[
              { text: preferencesService.getConfigSummary(preset.config) },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Apply Preset"
                  icon={Icon.Checkmark}
                  onAction={() => handlePresetSelect(preset)}
                />
                <Action
                  title="View Details"
                  icon={Icon.Eye}
                  onAction={() => showPresetDetails(preset)}
                />
                {onBack && (
                  <Action
                    title="Back"
                    icon={Icon.ArrowLeft}
                    onAction={onBack}
                  />
                )}
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

function getPresetIcon(presetId: string): Icon {
  const icons: Record<string, Icon> = {
    classic: Icon.Clock,
    extended: Icon.BullsEye,
    "short-burst": Icon.Bolt,
    "study-session": Icon.Book,
    "creative-flow": Icon.Brush,
  };
  return icons[presetId] || Icon.Clock;
}

async function showPresetDetails(preset: TimerPreset) {
  const tips = preferencesService.getProductivityTips(preset.config);
  const tipsText = tips.length > 0 ? `\n\nTips:\n${tips.join("\n")}` : "";

  await showToast({
    style: Toast.Style.Success,
    title: preset.name,
    message: `${preset.description}\n\nConfiguration:\n${preferencesService.getConfigSummary(preset.config)}${tipsText}`,
  });
}
