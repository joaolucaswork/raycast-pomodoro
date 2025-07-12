/**
 * Test script to verify that preference synchronization is working correctly
 * This script tests the refreshConfigFromPreferences functionality
 */

import { preferencesService } from "./services/preferences-service";
import { useTimerStore } from "./store/timer-store";

/**
 * Test the preference synchronization functionality
 */
export function testPreferenceSync() {
  console.log("=== Testing Preference Synchronization ===");

  // Get initial config from store
  const initialConfig = useTimerStore.getState().config;
  console.log("Initial config from store:", {
    workDuration: initialConfig.workDuration,
    shortBreakDuration: initialConfig.shortBreakDuration,
    longBreakDuration: initialConfig.longBreakDuration,
  });

  // Get current config directly from preferences service
  const currentPreferences = preferencesService.getCurrentConfig();
  console.log("Current preferences from service:", {
    workDuration: currentPreferences.workDuration,
    shortBreakDuration: currentPreferences.shortBreakDuration,
    longBreakDuration: currentPreferences.longBreakDuration,
  });

  // Test refreshing config from preferences
  console.log("\n--- Testing refreshConfigFromPreferences ---");
  const { refreshConfigFromPreferences } = useTimerStore.getState();
  refreshConfigFromPreferences();

  // Get updated config from store
  const updatedConfig = useTimerStore.getState().config;
  console.log("Updated config after refresh:", {
    workDuration: updatedConfig.workDuration,
    shortBreakDuration: updatedConfig.shortBreakDuration,
    longBreakDuration: updatedConfig.longBreakDuration,
  });

  // Verify that the store config matches the preferences
  const configMatches = 
    updatedConfig.workDuration === currentPreferences.workDuration &&
    updatedConfig.shortBreakDuration === currentPreferences.shortBreakDuration &&
    updatedConfig.longBreakDuration === currentPreferences.longBreakDuration;

  console.log("\n--- Test Results ---");
  console.log("Config synchronization successful:", configMatches);
  
  if (!configMatches) {
    console.error("❌ Config mismatch detected!");
    console.error("Store config:", updatedConfig);
    console.error("Preferences config:", currentPreferences);
  } else {
    console.log("✅ Config synchronization working correctly!");
  }

  return configMatches;
}

/**
 * Test that session duration uses the current config
 */
export function testSessionDurationSync() {
  console.log("\n=== Testing Session Duration Synchronization ===");

  // Refresh config to ensure we have latest preferences
  const { refreshConfigFromPreferences, startTimer } = useTimerStore.getState();
  refreshConfigFromPreferences();

  const config = useTimerStore.getState().config;
  console.log("Current work duration from config:", config.workDuration, "minutes");

  // Start a work session and check if it uses the correct duration
  startTimer("work", "Test Session");
  
  const currentSession = useTimerStore.getState().currentSession;
  if (currentSession) {
    const expectedDurationSeconds = config.workDuration * 60;
    const actualDurationSeconds = currentSession.duration;
    
    console.log("Expected session duration:", expectedDurationSeconds, "seconds");
    console.log("Actual session duration:", actualDurationSeconds, "seconds");
    
    const durationMatches = expectedDurationSeconds === actualDurationSeconds;
    console.log("Session duration matches config:", durationMatches);
    
    if (durationMatches) {
      console.log("✅ Session duration synchronization working correctly!");
    } else {
      console.error("❌ Session duration mismatch!");
    }

    // Clean up - stop the test session
    const { stopTimer } = useTimerStore.getState();
    stopTimer();
    
    return durationMatches;
  } else {
    console.error("❌ Failed to start test session");
    return false;
  }
}

/**
 * Run all preference synchronization tests
 */
export function runAllPreferenceSyncTests() {
  console.log("🧪 Running Preference Synchronization Tests...\n");
  
  const test1 = testPreferenceSync();
  const test2 = testSessionDurationSync();
  
  console.log("\n=== Final Test Results ===");
  console.log("Preference sync test:", test1 ? "✅ PASS" : "❌ FAIL");
  console.log("Session duration sync test:", test2 ? "✅ PASS" : "❌ FAIL");
  
  const allTestsPassed = test1 && test2;
  console.log("Overall result:", allTestsPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED");
  
  return allTestsPassed;
}

// Export for use in other test files
export default {
  testPreferenceSync,
  testSessionDurationSync,
  runAllPreferenceSyncTests,
};
