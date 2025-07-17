import { useTimerStore } from "./store/timer-store";
import { backgroundTimerService } from "./services/timer/background-timer-service";
import { SessionType } from "./types/timer";
import { storeInitialization } from "./store/store-initialization";
import { timerCoreService } from "./services/timer/timer-core-service";

/**
 * Test script to verify auto-start breaks functionality
 */
async function testAutoStartBreaks() {
  console.log("🧪 Testing Auto-Start Breaks Configuration");
  console.log("=".repeat(50));

  // Initialize store
  storeInitialization.initializeStore();

  // Get current config
  const { config } = useTimerStore.getState();
  console.log("📋 Current configuration:");
  console.log(`  - autoStartBreaks: ${config.autoStartBreaks}`);
  console.log(`  - autoStartWork: ${config.autoStartWork}`);
  console.log(`  - workDuration: ${config.workDuration}m`);
  console.log(`  - shortBreakDuration: ${config.shortBreakDuration}m`);
  console.log(`  - longBreakDuration: ${config.longBreakDuration}m`);
  console.log();

  // Test 1: Check if auto-start breaks is enabled
  if (config.autoStartBreaks) {
    console.log("✅ Auto-start breaks is ENABLED");
  } else {
    console.log("❌ Auto-start breaks is DISABLED");
    console.log("   This is why breaks are not starting automatically!");
  }

  // Test 2: Simulate a work session completion
  console.log("\n🔄 Simulating work session completion...");

  try {
    // Start a work session
    await backgroundTimerService.startTimer(SessionType.WORK, "Test Task");

    // Check if timer is running
    const stateAfterStart = useTimerStore.getState();
    console.log(`   Timer state after start: ${stateAfterStart.state}`);
    console.log(`   Current session: ${stateAfterStart.currentSession?.type}`);

    // Stop the timer to simulate completion
    await backgroundTimerService.stopTimer();

    console.log("✅ Work session simulation completed");
  } catch (error) {
    console.error("❌ Error during simulation:", error);
  }

  // Test 3: Test auto-start logic directly
  console.log("\n🧪 Testing auto-start logic directly...");

  const shouldAutoStart = timerCoreService.shouldAutoStartNext(
    SessionType.WORK,
    config
  );

  console.log(`   Should auto-start after work session: ${shouldAutoStart}`);

  if (shouldAutoStart) {
    const nextSessionType = timerCoreService.getNextSessionType(
      SessionType.WORK,
      1,
      config
    );
    console.log(`   Next session type would be: ${nextSessionType}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎯 Test completed!");

  if (config.autoStartBreaks) {
    console.log("✅ Configuration looks correct. Auto-start should work!");
  } else {
    console.log("❌ Auto-start breaks is disabled. Enable it in preferences.");
  }
}

// Run the test
testAutoStartBreaks().catch(console.error);
