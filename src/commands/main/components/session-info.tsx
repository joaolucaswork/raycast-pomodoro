import { Icon, List } from "@raycast/api";
import { TimerSession } from "../../../types/timer";

interface SessionInfoProps {
  currentSession: TimerSession;
  additionalInfo?: {
    label: string;
    value: string;
    icon?: Icon;
  }[];
}

export function SessionInfo({ currentSession, additionalInfo }: SessionInfoProps) {
  if (!additionalInfo || additionalInfo.length === 0) {
    return null;
  }

  return (
    <List.Section title="Additional Info">
      {additionalInfo.map((info, index) => (
        <List.Item
          key={index}
          icon={info.icon || Icon.Info}
          title={info.label}
          subtitle={info.value}
        />
      ))}
    </List.Section>
  );
}
