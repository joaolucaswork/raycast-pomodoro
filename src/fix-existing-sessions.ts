/**
 * Fix for retroactively processing existing completed sessions
 * This will award points and check achievements for sessions that were completed
 * before the achievement system was properly integrated
 */

import { useTimerStore } from "./store/timer-store";
import { adhdSupportService } from "./services/adhd-support-service";
import { getSessionTypeLabel } from "./utils/helpers";

export function fixExistingCompletedSessions() {
  console.log("🔧 FIXING EXISTING COMPLETED SESSIONS");
  console.log("====================================");

  const state = useTimerStore.getState();
  
  console.log(`📊 Current State:`);
  console.log(`  - Total sessions: ${state.history.length}`);
  console.log(`  - Current points: ${state.rewardSystem.points}`);
  console.log(`  - Current achievements: ${state.rewardSystem.achievements.length}`);
  console.log(`  - Reward system enabled: ${state.config.enableRewardSystem}`);

  if (!state.config.enableRewardSystem) {
    console.log("❌ Reward system is disabled. Enabling it...");
    state.updateConfig({ enableRewardSystem: true });
  }

  // Get all completed sessions
  const completedSessions = state.history.filter(s => s.completed);
  console.log(`\n🎯 Found ${completedSessions.length} completed sessions to process`);

  if (completedSessions.length === 0) {
    console.log("ℹ️ No completed sessions found to process");
    return;
  }

  // Process each completed session
  let totalPointsAwarded = 0;
  let sessionsProcessed = 0;

  completedSessions.forEach((session, index) => {
    console.log(`\n📝 Processing Session ${index + 1}:`);
    console.log(`  - ID: ${session.id}`);
    console.log(`  - Type: ${session.type}`);
    console.log(`  - Duration: ${Math.round(session.duration / 60)} minutes`);
    console.log(`  - Completed: ${session.completed}`);
    console.log(`  - Start Time: ${new Date(session.startTime).toLocaleString()}`);

    // Calculate points for this session
    const points = adhdSupportService.calculateSessionPoints(
      session.duration,
      true, // completed
      session.energyLevel,
      session.moodState
    );

    console.log(`  - Points calculated: ${points}`);
    totalPointsAwarded += points;
    sessionsProcessed++;

    // Award points (this will also check for achievements)
    const currentState = useTimerStore.getState();
    currentState.awardPoints(
      points,
      `Retroactive: Completed ${getSessionTypeLabel(session.type)} session`
    );

    // Log achievement progress after each session
    const updatedState = useTimerStore.getState();
    console.log(`  - Total points after: ${updatedState.rewardSystem.points}`);
    console.log(`  - Achievements after: ${updatedState.rewardSystem.achievements.length}`);
    
    if (updatedState.rewardSystem.achievements.length > 0) {
      const latestAchievements = updatedState.rewardSystem.achievements.slice(-3); // Show last 3
      latestAchievements.forEach(achievement => {
        console.log(`    🏆 ${achievement.name}: ${achievement.description}`);
      });
    }
  });

  // Final summary
  const finalState = useTimerStore.getState();
  console.log(`\n✅ PROCESSING COMPLETE`);
  console.log(`====================================`);
  console.log(`📈 Results:`);
  console.log(`  - Sessions processed: ${sessionsProcessed}`);
  console.log(`  - Total points awarded: ${totalPointsAwarded}`);
  console.log(`  - Final points: ${finalState.rewardSystem.points}`);
  console.log(`  - Final level: ${finalState.rewardSystem.level}`);
  console.log(`  - Achievements unlocked: ${finalState.rewardSystem.achievements.length}`);
  
  console.log(`\n🏆 Unlocked Achievements:`);
  finalState.rewardSystem.achievements.forEach((achievement, index) => {
    console.log(`  ${index + 1}. ${achievement.name}: ${achievement.description} (${achievement.points} points)`);
    if (achievement.unlockedAt) {
      console.log(`     Unlocked: ${new Date(achievement.unlockedAt).toLocaleString()}`);
    }
  });

  // Test achievement detection one more time
  console.log(`\n🧪 Final Achievement Test:`);
  const testAchievements = adhdSupportService.checkAchievements(
    finalState.history, 
    finalState.rewardSystem
  );
  console.log(`  - Additional achievements available: ${testAchievements.length}`);
  
  if (testAchievements.length > 0) {
    console.log(`  - These should have been unlocked but weren't:`);
    testAchievements.forEach(achievement => {
      console.log(`    - ${achievement.name}: ${achievement.description}`);
    });
  }

  return {
    sessionsProcessed,
    totalPointsAwarded,
    finalPoints: finalState.rewardSystem.points,
    finalLevel: finalState.rewardSystem.level,
    achievementsUnlocked: finalState.rewardSystem.achievements.length,
    achievements: finalState.rewardSystem.achievements,
  };
}

// Export for use in debug command
export function runExistingSessionsFix() {
  return fixExistingCompletedSessions();
}
