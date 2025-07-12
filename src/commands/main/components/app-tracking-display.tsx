import { Icon, List } from "@raycast/api";
import { SessionType } from "../../../types/timer";
import { getApplicationIcon } from "../../../utils/app-icon-utils";

interface AppTrackingDisplayProps {
  isAppTrackingActive: boolean;
  currentAppName: string | null;
  currentAppBundleId?: string | null;
  currentSessionType?: SessionType;
}

export function AppTrackingDisplay({
  isAppTrackingActive,
  currentAppName,
  currentAppBundleId,
  currentSessionType,
}: AppTrackingDisplayProps) {
  if (
    !isAppTrackingActive ||
    !currentAppName ||
    currentSessionType !== SessionType.WORK
  ) {
    return null;
  }

  // Get the appropriate icon for the current application
  const appIcon = getApplicationIcon(
    currentAppBundleId || currentAppName,
    currentAppName
  );

  return (
    <List.Section title="Activity">
      <List.Item
        icon={appIcon}
        title="Current Application"
        subtitle={currentAppName}
        accessories={[{ icon: Icon.Dot, tooltip: "Live tracking" }]}
      />
    </List.Section>
  );
}
