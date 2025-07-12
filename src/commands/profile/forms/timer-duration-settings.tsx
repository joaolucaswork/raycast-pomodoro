import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { useTimerStore } from "../../../store/timer-store";
import { ACTION_ICONS } from "../../../constants/design-tokens";

interface TimerDurationSettingsProps {
  type: "work" | "shortBreak" | "longBreak" | "longBreakInterval" | "trackingInterval";
}

export function TimerDurationSettings({ type }: TimerDurationSettingsProps) {
  const { config, updateConfig } = useTimerStore();
  
  const getCurrentValue = () => {
    switch (type) {
      case "work":
        return config.workDuration.toString();
      case "shortBreak":
        return config.shortBreakDuration.toString();
      case "longBreak":
        return config.longBreakDuration.toString();
      case "longBreakInterval":
        return config.longBreakInterval.toString();
      case "trackingInterval":
        return config.trackingInterval.toString();
      default:
        return "25";
    }
  };

  const [value, setValue] = useState(getCurrentValue());

  const getTitle = () => {
    switch (type) {
      case "work":
        return "Work Duration";
      case "shortBreak":
        return "Short Break Duration";
      case "longBreak":
        return "Long Break Duration";
      case "longBreakInterval":
        return "Long Break Interval";
      case "trackingInterval":
        return "Tracking Interval";
      default:
        return "Duration";
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case "work":
        return "25";
      case "shortBreak":
        return "5";
      case "longBreak":
        return "15";
      case "longBreakInterval":
        return "4";
      case "trackingInterval":
        return "5";
      default:
        return "25";
    }
  };

  const getUnit = () => {
    switch (type) {
      case "longBreakInterval":
        return "sessions";
      default:
        return "minutes";
    }
  };

  const handleSubmit = () => {
    const numValue = parseInt(value) || parseInt(getPlaceholder());
    
    const updates: any = {};
    switch (type) {
      case "work":
        updates.workDuration = numValue;
        break;
      case "shortBreak":
        updates.shortBreakDuration = numValue;
        break;
      case "longBreak":
        updates.longBreakDuration = numValue;
        break;
      case "longBreakInterval":
        updates.longBreakInterval = numValue;
        break;
      case "trackingInterval":
        updates.trackingInterval = numValue;
        break;
    }

    updateConfig(updates);
    showToast({
      style: Toast.Style.Success,
      title: `${getTitle()} Updated`,
      message: `Set to ${numValue} ${getUnit()}`,
    });
  };

  return (
    <Form
      navigationTitle={`Edit ${getTitle()}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Setting"
            icon={ACTION_ICONS.SAVE}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="value"
        title={getTitle()}
        placeholder={getPlaceholder()}
        value={value}
        onChange={setValue}
        info={`Enter the ${getTitle().toLowerCase()} in ${getUnit()}`}
      />
    </Form>
  );
}
