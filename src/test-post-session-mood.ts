/**
 * Test script for post-session mood logging functionality
 * This validates the integration and workflow of the new mood logging feature
 */

import { useTimerStore } from "./store/timer-store";
import { SessionType, TimerSession, SessionEndReason } from "./types/timer";

// Mock a completed session for testing
const createMockCompletedSession = (): TimerSession => ({
  id: "test-session-" + Date.now(),
  type: SessionType.WORK,
  duration: 1500, // 25 minutes
  startTime: new Date(Date.now() - 1500000), // Started 25 minutes ago
  endTime: new Date(),
  completed: true,
  endReason: SessionEndReason.COMPLETED,
  taskName: "Test Task for Mood Logging",
  projectName: "Mood Logging Project",
  tags: ["work", "testing"],
});

/**
 * Test the post-session mood prompt trigger
 */
export function testPostSessionMoodPromptTrigger() {
  console.log("🧪 Testing post-session mood prompt trigger...");

  const store = useTimerStore.getState();
  const mockSession = createMockCompletedSession();

  // Test showing the mood prompt
  store.showPostSessionMoodPrompt(mockSession);

  const state = useTimerStore.getState();

  // Validate state changes
  const isPromptVisible = state.isPostSessionMoodPromptVisible;
  const lastSession = state.lastCompletedSession;

  console.log("✅ Mood prompt visible:", isPromptVisible);
  console.log("✅ Last completed session:", lastSession?.taskName);

  if (isPromptVisible && lastSession?.id === mockSession.id) {
    console.log("✅ Post-session mood prompt trigger test PASSED");
    return true;
  } else {
    console.log("❌ Post-session mood prompt trigger test FAILED");
    return false;
  }
}

/**
 * Test hiding the mood prompt
 */
export function testHidePostSessionMoodPrompt() {
  console.log("🧪 Testing hide post-session mood prompt...");

  const store = useTimerStore.getState();

  // Hide the mood prompt
  store.hidePostSessionMoodPrompt();

  const state = useTimerStore.getState();

  // Validate state changes
  const isPromptVisible = state.isPostSessionMoodPromptVisible;
  const lastSession = state.lastCompletedSession;

  console.log("✅ Mood prompt visible:", isPromptVisible);
  console.log("✅ Last completed session:", lastSession);

  if (!isPromptVisible && lastSession === null) {
    console.log("✅ Hide post-session mood prompt test PASSED");
    return true;
  } else {
    console.log("❌ Hide post-session mood prompt test FAILED");
    return false;
  }
}

/**
 * Test mood entry creation from post-session logging
 */
export function testPostSessionMoodEntry() {
  console.log("🧪 Testing post-session mood entry creation...");

  const store = useTimerStore.getState();
  const mockSession = createMockCompletedSession();

  // Add a mood entry for the session
  store.addMoodEntry(
    "focused",
    4,
    "post-session",
    mockSession.id,
    "Great session! Felt very productive and maintained good focus throughout."
  );

  const state = useTimerStore.getState();
  const moodEntries = state.moodEntries;
  const latestEntry = moodEntries[moodEntries.length - 1];

  console.log("✅ Total mood entries:", moodEntries.length);
  console.log("✅ Latest entry mood:", latestEntry?.mood);
  console.log("✅ Latest entry context:", latestEntry?.context);
  console.log("✅ Latest entry session ID:", latestEntry?.sessionId);

  if (
    latestEntry &&
    latestEntry.mood === "focused" &&
    latestEntry.intensity === 4 &&
    latestEntry.context === "post-session" &&
    latestEntry.sessionId === mockSession.id
  ) {
    console.log("✅ Post-session mood entry test PASSED");
    return true;
  } else {
    console.log("❌ Post-session mood entry test FAILED");
    return false;
  }
}

/**
 * Test session completion workflow with mood prompt
 */
export function testSessionCompletionWorkflow() {
  console.log("🧪 Testing session completion workflow...");

  const store = useTimerStore.getState();

  // Start a work session
  store.startTimer(SessionType.WORK, "Test Workflow Task", "Test Project", [
    "workflow",
  ]);

  let state = useTimerStore.getState();
  console.log("✅ Session started:", state.currentSession?.taskName);

  // Complete the session
  store.completeSession();

  state = useTimerStore.getState();

  // Check if mood prompt was triggered for work session
  const isPromptVisible = state.isPostSessionMoodPromptVisible;
  const lastSession = state.lastCompletedSession;

  console.log("✅ Mood prompt triggered:", isPromptVisible);
  console.log("✅ Last completed session type:", lastSession?.type);
  console.log("✅ Session completed:", lastSession?.completed);
  console.log("✅ Session end reason:", lastSession?.endReason);

  if (
    isPromptVisible &&
    lastSession?.type === SessionType.WORK &&
    lastSession?.completed
  ) {
    console.log("✅ Session completion workflow test PASSED");
    return true;
  } else {
    console.log("❌ Session completion workflow test FAILED");
    console.log("   - Prompt visible:", isPromptVisible);
    console.log("   - Session type:", lastSession?.type);
    console.log("   - Session completed:", lastSession?.completed);
    return false;
  }
}

/**
 * Test manual complete action specifically
 */
export function testManualCompleteAction() {
  console.log("🧪 Testing manual complete action...");

  const store = useTimerStore.getState();

  // Clear any existing state
  store.hidePostSessionMoodPrompt();

  // Start a work session
  store.startTimer(SessionType.WORK, "Manual Complete Test", "Test Project", [
    "manual",
  ]);

  let state = useTimerStore.getState();
  console.log("✅ Session started:", state.currentSession?.taskName);
  console.log("✅ Session ID:", state.currentSession?.id);

  // Manually complete the session (simulating "Complete Round" button)
  store.completeSession();

  state = useTimerStore.getState();

  // Check results
  const isPromptVisible = state.isPostSessionMoodPromptVisible;
  const lastSession = state.lastCompletedSession;
  const sessionInHistory = state.history[state.history.length - 1];

  console.log("✅ Mood prompt triggered:", isPromptVisible);
  console.log("✅ Last completed session:", lastSession?.taskName);
  console.log("✅ Session in history:", sessionInHistory?.taskName);
  console.log("✅ History session completed:", sessionInHistory?.completed);
  console.log("✅ History session end reason:", sessionInHistory?.endReason);

  if (
    isPromptVisible &&
    lastSession?.taskName === "Manual Complete Test" &&
    sessionInHistory?.completed === true &&
    sessionInHistory?.endReason === "completed"
  ) {
    console.log("✅ Manual complete action test PASSED");
    return true;
  } else {
    console.log("❌ Manual complete action test FAILED");
    return false;
  }
}

/**
 * Run all post-session mood logging tests
 */
export function runAllPostSessionMoodTests() {
  console.log("🚀 Running all post-session mood logging tests...\n");

  const results = [
    testPostSessionMoodPromptTrigger(),
    testHidePostSessionMoodPrompt(),
    testPostSessionMoodEntry(),
    testSessionCompletionWorkflow(),
    testManualCompleteAction(),
    testRoundCountDisplay(),
  ];

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All post-session mood logging tests PASSED!");
  } else {
    console.log("⚠️ Some tests failed. Please review the implementation.");
  }

  return passed === total;
}

/**
 * Test round count display logic - corrected version
 */
export function testRoundCountDisplay() {
  console.log(
    "🧪 Testing round count display logic (completed/target format)..."
  );

  const store = useTimerStore.getState();

  // Clear history to start fresh
  store.clearAllHistory();

  let state = useTimerStore.getState();
  console.log("✅ Initial sessionCount:", state.sessionCount);

  // Test 1: Start first work session (should show 0/target)
  store.startTimer(SessionType.WORK, "First Session", "Test Project", ["test"]);

  state = useTimerStore.getState();
  console.log("✅ After starting first session:");
  console.log("   - sessionCount:", state.sessionCount);
  console.log("   - Expected display: 0/target (completed/target)");
  console.log("   - Current session active:", !!state.currentSession);

  // Complete first session
  store.completeSession();

  state = useTimerStore.getState();
  console.log("✅ After completing first session:");
  console.log("   - sessionCount:", state.sessionCount);
  console.log("   - History length:", state.history.length);

  // Test 2: Start second work session (should show 1/target)
  store.startTimer(SessionType.WORK, "Second Session", "Test Project", [
    "test",
  ]);

  state = useTimerStore.getState();
  console.log("✅ After starting second session:");
  console.log("   - sessionCount:", state.sessionCount);
  console.log("   - Expected display: 1/target (completed/target)");
  console.log("   - Current session active:", !!state.currentSession);

  // Complete second session
  store.completeSession();

  state = useTimerStore.getState();
  console.log("✅ After completing second session:");
  console.log("   - sessionCount:", state.sessionCount);
  console.log("   - History length:", state.history.length);

  // Test 3: Start third work session (should show 2/target)
  store.startTimer(SessionType.WORK, "Third Session", "Test Project", ["test"]);

  state = useTimerStore.getState();
  console.log("✅ After starting third session:");
  console.log("   - sessionCount:", state.sessionCount);
  console.log("   - Expected display: 2/target (completed/target)");
  console.log("   - Current session active:", !!state.currentSession);

  // Test expectations for completed/target format
  const completedSessions = state.sessionCount; // Should be 2 (completed sessions)
  const expectedDisplay = `${completedSessions}/target`; // Should be "2/target"

  if (completedSessions === 2) {
    console.log("✅ Round count display logic test PASSED");
    console.log(`   - Correct format: ${expectedDisplay}`);
    return true;
  } else {
    console.log("❌ Round count display logic test FAILED");
    console.log("   - Expected completed sessions: 2, got:", completedSessions);
    return false;
  }
}

// Export for manual testing
if (typeof (globalThis as any).window === "undefined") {
  console.log("Post-Session Mood Logging Test Suite Ready");
  console.log("Run runAllPostSessionMoodTests() to execute all tests");
}
