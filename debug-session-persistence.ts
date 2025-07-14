/**
 * Debug script to test session persistence and identify why sessions aren't being saved to history
 */

import { useTimerStore } from "./src/store/timer-store";
import { SessionType, TimerState, SessionEndReason } from "./src/types/timer";
import { shouldSaveSessionToHistory, getActualSessionDuration } from "./src/utils/helpers";

// Test session creation and completion
function debugSessionPersistence() {
  console.log("🔍 Starting session persistence debug...\n");

  const store = useTimerStore.getState();
  
  // Check initial state
  console.log("📊 Initial Store State:");
  console.log(`  History length: ${store.history.length}`);
  console.log(`  Current session: ${store.currentSession ? 'exists' : 'null'}`);
  console.log(`  Timer state: ${store.state}`);
  console.log(`  Time remaining: ${store.timeRemaining}`);
  
  // Create a test session
  console.log("\n🚀 Creating test session...");
  
  const testSession = {
    id: `test-session-${Date.now()}`,
    type: SessionType.WORK,
    duration: 1500, // 25 minutes
    startTime: new Date(Date.now() - 60000), // Started 1 minute ago
    endTime: new Date(), // Ending now
    completed: true,
    endReason: SessionEndReason.COMPLETED,
    taskName: "Test Task",
    projectName: undefined,
    tags: [],
    energyLevel: undefined,
    moodState: undefined,
    applicationUsage: undefined,
  };
  
  console.log("📝 Test Session Details:");
  console.log(`  ID: ${testSession.id}`);
  console.log(`  Type: ${testSession.type}`);
  console.log(`  Duration: ${testSession.duration}s`);
  console.log(`  Start Time: ${testSession.startTime.toISOString()}`);
  console.log(`  End Time: ${testSession.endTime.toISOString()}`);
  console.log(`  Completed: ${testSession.completed}`);
  
  // Test duration calculation
  const actualDuration = getActualSessionDuration(testSession);
  console.log(`  Actual Duration: ${actualDuration}s`);
  
  // Test if session should be saved
  const shouldSave = shouldSaveSessionToHistory(testSession);
  console.log(`  Should Save: ${shouldSave}`);
  
  if (!shouldSave) {
    console.log("❌ Session would NOT be saved to history!");
    console.log(`  Minimum duration required: 40s`);
    console.log(`  Actual duration: ${actualDuration}s`);
    return;
  }
  
  // Test manual history addition
  console.log("\n💾 Testing manual history addition...");
  const currentHistory = store.history;
  const newHistory = [...currentHistory, testSession];
  
  // Update store with test session
  useTimerStore.setState({
    history: newHistory,
  });
  
  // Verify the session was added
  const updatedStore = useTimerStore.getState();
  console.log(`  History length after addition: ${updatedStore.history.length}`);
  
  const addedSession = updatedStore.history.find(s => s.id === testSession.id);
  if (addedSession) {
    console.log("✅ Test session successfully added to history!");
    console.log(`  Found session: ${addedSession.taskName}`);
  } else {
    console.log("❌ Test session NOT found in history!");
  }
  
  // Test the completeSession method
  console.log("\n🎯 Testing completeSession method...");
  
  // First, set up a current session
  const currentTestSession = {
    ...testSession,
    id: `current-test-${Date.now()}`,
    endTime: undefined, // Not ended yet
    completed: false,
    startTime: new Date(Date.now() - 45000), // Started 45 seconds ago (should be saved)
  };
  
  useTimerStore.setState({
    currentSession: currentTestSession,
    state: TimerState.RUNNING,
    timeRemaining: 10,
  });
  
  console.log("📝 Current Session Set:");
  console.log(`  ID: ${currentTestSession.id}`);
  console.log(`  Duration so far: ${Math.floor((Date.now() - currentTestSession.startTime.getTime()) / 1000)}s`);
  
  // Call completeSession
  const historyLengthBefore = useTimerStore.getState().history.length;
  console.log(`  History length before completion: ${historyLengthBefore}`);
  
  store.completeSession();
  
  const finalStore = useTimerStore.getState();
  console.log(`  History length after completion: ${finalStore.history.length}`);
  console.log(`  Current session after completion: ${finalStore.currentSession ? 'exists' : 'null'}`);
  console.log(`  Timer state after completion: ${finalStore.state}`);
  
  if (finalStore.history.length > historyLengthBefore) {
    const completedSession = finalStore.history[finalStore.history.length - 1];
    console.log("✅ Session successfully completed and saved!");
    console.log(`  Completed session ID: ${completedSession.id}`);
    console.log(`  Completed session duration: ${getActualSessionDuration(completedSession)}s`);
  } else {
    console.log("❌ Session was NOT saved to history after completion!");
  }
  
  console.log("\n🔍 Debug complete. Check the results above.");
}

// Export for use in other files
export { debugSessionPersistence };

// Run if called directly
if (require.main === module) {
  debugSessionPersistence();
}
