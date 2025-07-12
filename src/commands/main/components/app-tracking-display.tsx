import { Icon, List } from "@raycast/api";
import { SessionType } from "../../../types/timer";

interface AppTrackingDisplayProps {
  isAppTrackingActive: boolean;
  currentAppName: string | null;
  currentSessionType?: SessionType;
}

export function AppTrackingDisplay({
  isAppTrackingActive,
  currentAppName,
  currentSessionType,
}: AppTrackingDisplayProps) {
  if (!isAppTrackingActive || !currentAppName || currentSessionType !== SessionType.WORK) {
    return null;
  }

  return (
    <List.Section title="Activity">
      <List.Item
        icon={Icon.Desktop}
        title="Current Application"
        subtitle={currentAppName}
        accessories={[{ icon: Icon.Dot, tooltip: "Live tracking" }]}
      />
    </List.Section>
  );
}
