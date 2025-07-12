import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { useTimerStore } from "./store/timer-store";
import { runExistingSessionsFix } from "./fix-existing-sessions";

export default function FixSessionsCommand() {
  const [isFixed, setIsFixed] = useState(false);
  const [fixResults, setFixResults] = useState<any>(null);
  const { history, rewardSystem, config } = useTimerStore();

  const completedSessions = history.filter((s) => s.completed);
  const needsFix = completedSessions.length > 0 && rewardSystem.points === 0;

  const handleFix = async () => {
    try {
      console.log("🔧 Starting fix for existing sessions...");
      const results = runExistingSessionsFix();
      setFixResults(results);
      setIsFixed(true);

      await showToast({
        style: Toast.Style.Success,
        title: "Sessions Fixed!",
        message: `Processed ${results?.sessionsProcessed || 0} sessions, awarded ${results?.totalPointsAwarded || 0} points, unlocked ${results?.achievementsUnlocked || 0} achievements`,
      });
    } catch (error) {
      console.error("Error fixing sessions:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Fix Failed",
        message: "Check console for details",
      });
    }
  };

  const analysisMarkdown = `# Fix Existing Completed Sessions

## Current Situation
- **Total Sessions**: ${history.length}
- **Completed Sessions**: ${completedSessions.length}
- **Current Points**: ${rewardSystem.points}
- **Current Level**: ${rewardSystem.level}
- **Achievements Unlocked**: ${rewardSystem.achievements.length}
- **Reward System Enabled**: ${config.enableRewardSystem ? "Yes" : "No"}

## Problem Detected
${
  needsFix
    ? `❌ **Issue Found**: You have ${completedSessions.length} completed sessions but 0 points and 0 achievements. This means your existing sessions were never processed through the reward system.`
    : `✅ **No Issues**: Your sessions appear to be properly processed.`
}

## What This Fix Does
This tool will retroactively process all your existing completed sessions:

1. **Calculate Points**: Award points for each completed session based on duration and completion
2. **Check Achievements**: Evaluate all achievements against your session history
3. **Update Level**: Recalculate your level based on total points
4. **Unlock Achievements**: Unlock any achievements you've earned

## Expected Results
Based on your ${completedSessions.length} completed sessions:
- **Estimated Points**: ~${completedSessions.length * 70} points (varies by session length)
- **Expected Level**: ${Math.floor(Math.sqrt((completedSessions.length * 70) / 50)) + 1}
- **Likely Achievements**:
  - 🏆 First Timer (Complete your first focus session)
  - 🏆 Consistency King (if you have sessions on consecutive days)
  - 🏆 Marathon Runner (if you completed 4+ hours in one day)

${
  isFixed && fixResults
    ? `
## Fix Results ✅
- **Sessions Processed**: ${fixResults.sessionsProcessed}
- **Points Awarded**: ${fixResults.totalPointsAwarded}
- **Final Points**: ${fixResults.finalPoints}
- **Final Level**: ${fixResults.finalLevel}
- **Achievements Unlocked**: ${fixResults.achievementsUnlocked}

### Unlocked Achievements:
${fixResults.achievements.map((a: any, i: number) => `${i + 1}. **${a.name}**: ${a.description} (${a.points} points)`).join("\n")}
`
    : ""
}

## Safety
This fix is safe and only adds missing data. It won't:
- Delete or modify existing sessions
- Remove any current progress
- Break any functionality

${needsFix ? '**Click "Fix My Sessions" to process your existing completed sessions.**' : "**Your sessions are already properly processed!**"}
`;

  return (
    <Detail
      markdown={analysisMarkdown}
      actions={
        <ActionPanel>
          {needsFix && !isFixed && (
            <Action
              title="🔧 Fix My Sessions"
              icon={Icon.Gear}
              onAction={handleFix}
            />
          )}
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={() => {
              setIsFixed(false);
              setFixResults(null);
              useTimerStore.setState({});
            }}
          />
          <Action.CopyToClipboard
            title="Copy Analysis"
            content={analysisMarkdown}
            icon={Icon.Clipboard}
          />
        </ActionPanel>
      }
    />
  );
}
