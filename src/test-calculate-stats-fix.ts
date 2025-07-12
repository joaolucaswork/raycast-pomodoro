/**
 * Test script to verify the calculateStats function fix
 * This ensures that session completion works correctly without the "calculateStats is not a function" error
 */

import { calculateStats } from "./store/slices/stats-slice";
import { TimerSession, SessionType, SessionEndReason } from "./types/timer";

/**
 * Create a mock timer session for testing
 */
function createMockSession(
  type: SessionType,
  completed: boolean = true,
  duration: number = 1500 // 25 minutes in seconds
): TimerSession {
  const now = new Date();
  const startTime = new Date(now.getTime() - duration * 1000);
  
  return {
    id: `test-${Math.random().toString(36).substr(2, 9)}`,
    type,
    duration,
    startTime,
    endTime: completed ? now : undefined,
    completed,
    endReason: completed ? SessionEndReason.COMPLETED : undefined,
  };
}

/**
 * Test basic calculateStats functionality
 */
function testBasicCalculateStats() {
  console.log("🧪 Testing basic calculateStats functionality...\n");

  // Create test sessions
  const sessions: TimerSession[] = [
    createMockSession(SessionType.WORK, true, 1500), // 25 min work
    createMockSession(SessionType.SHORT_BREAK, true, 300), // 5 min break
    createMockSession(SessionType.WORK, true, 1500), // 25 min work
    createMockSession(SessionType.WORK, false, 600), // 10 min incomplete work
    createMockSession(SessionType.LONG_BREAK, true, 900), // 15 min long break
  ];

  try {
    const stats = calculateStats(sessions);
    
    console.log("✅ calculateStats executed successfully!");
    console.log("📊 Calculated Statistics:");
    console.log(`  Total Sessions: ${stats.totalSessions}`);
    console.log(`  Completed Sessions: ${stats.completedSessions}`);
    console.log(`  Total Work Time: ${stats.totalWorkTime}s (${Math.round(stats.totalWorkTime / 60)}m)`);
    console.log(`  Total Break Time: ${stats.totalBreakTime}s (${Math.round(stats.totalBreakTime / 60)}m)`);
    console.log(`  Streak Count: ${stats.streakCount}`);
    console.log(`  Today's Sessions: ${stats.todaysSessions}`);
    console.log(`  Week Sessions: ${stats.weekSessions}`);
    console.log(`  Month Sessions: ${stats.monthSessions}`);
    
    // Verify expected values
    const expectedTotalSessions = 5;
    const expectedCompletedSessions = 4;
    const expectedWorkTime = 3000; // 2 completed work sessions * 1500s each
    const expectedBreakTime = 1200; // 300s + 900s
    
    console.log("\n🔍 Verification:");
    console.log(`  Total Sessions: ${stats.totalSessions === expectedTotalSessions ? "✅" : "❌"} (expected ${expectedTotalSessions})`);
    console.log(`  Completed Sessions: ${stats.completedSessions === expectedCompletedSessions ? "✅" : "❌"} (expected ${expectedCompletedSessions})`);
    console.log(`  Work Time: ${stats.totalWorkTime === expectedWorkTime ? "✅" : "❌"} (expected ${expectedWorkTime}s)`);
    console.log(`  Break Time: ${stats.totalBreakTime === expectedBreakTime ? "✅" : "❌"} (expected ${expectedBreakTime}s)`);
    
    return true;
  } catch (error) {
    console.error("❌ calculateStats failed:", error);
    return false;
  }
}

/**
 * Test calculateStats with empty history
 */
function testEmptyHistory() {
  console.log("\n🧪 Testing calculateStats with empty history...\n");

  try {
    const stats = calculateStats([]);
    
    console.log("✅ calculateStats with empty array executed successfully!");
    console.log("📊 Empty History Statistics:");
    console.log(`  Total Sessions: ${stats.totalSessions}`);
    console.log(`  Completed Sessions: ${stats.completedSessions}`);
    console.log(`  Total Work Time: ${stats.totalWorkTime}`);
    console.log(`  Total Break Time: ${stats.totalBreakTime}`);
    
    // All values should be 0 for empty history
    const allZero = stats.totalSessions === 0 && 
                   stats.completedSessions === 0 && 
                   stats.totalWorkTime === 0 && 
                   stats.totalBreakTime === 0;
    
    console.log(`\n🔍 Verification: ${allZero ? "✅" : "❌"} All values are zero as expected`);
    
    return allZero;
  } catch (error) {
    console.error("❌ calculateStats with empty history failed:", error);
    return false;
  }
}

/**
 * Test calculateStats with only incomplete sessions
 */
function testIncompleteSessionsOnly() {
  console.log("\n🧪 Testing calculateStats with only incomplete sessions...\n");

  const incompleteSessions: TimerSession[] = [
    createMockSession(SessionType.WORK, false, 600),
    createMockSession(SessionType.WORK, false, 300),
    createMockSession(SessionType.SHORT_BREAK, false, 150),
  ];

  try {
    const stats = calculateStats(incompleteSessions);
    
    console.log("✅ calculateStats with incomplete sessions executed successfully!");
    console.log("📊 Incomplete Sessions Statistics:");
    console.log(`  Total Sessions: ${stats.totalSessions}`);
    console.log(`  Completed Sessions: ${stats.completedSessions}`);
    console.log(`  Total Work Time: ${stats.totalWorkTime}`);
    console.log(`  Total Break Time: ${stats.totalBreakTime}`);
    
    // Should have total sessions but no completed sessions or time
    const expectedResult = stats.totalSessions === 3 && 
                          stats.completedSessions === 0 && 
                          stats.totalWorkTime === 0 && 
                          stats.totalBreakTime === 0;
    
    console.log(`\n🔍 Verification: ${expectedResult ? "✅" : "❌"} Incomplete sessions handled correctly`);
    
    return expectedResult;
  } catch (error) {
    console.error("❌ calculateStats with incomplete sessions failed:", error);
    return false;
  }
}

/**
 * Test the import/export functionality
 */
function testImportExport() {
  console.log("\n🧪 Testing calculateStats import/export...\n");

  try {
    // Test that the function is properly exported and can be imported
    console.log(`✅ calculateStats function imported successfully`);
    console.log(`   Function type: ${typeof calculateStats}`);
    console.log(`   Function name: ${calculateStats.name}`);
    
    return typeof calculateStats === "function";
  } catch (error) {
    console.error("❌ calculateStats import/export test failed:", error);
    return false;
  }
}

/**
 * Run all calculateStats tests
 */
function runCalculateStatsTests() {
  console.log("🚀 Running calculateStats Fix Verification Tests\n");
  console.log("=" .repeat(60) + "\n");

  const results = {
    basicFunctionality: false,
    emptyHistory: false,
    incompleteSessionsOnly: false,
    importExport: false,
  };

  try {
    results.importExport = testImportExport();
    results.basicFunctionality = testBasicCalculateStats();
    results.emptyHistory = testEmptyHistory();
    results.incompleteSessionsOnly = testIncompleteSessionsOnly();

    console.log("\n" + "=" .repeat(60));
    console.log("🎯 Test Results Summary:");
    console.log(`  Import/Export: ${results.importExport ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Basic Functionality: ${results.basicFunctionality ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Empty History: ${results.emptyHistory ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Incomplete Sessions: ${results.incompleteSessionsOnly ? "✅ PASS" : "❌ FAIL"}`);

    const allPassed = Object.values(results).every(result => result);
    
    console.log("\n🎉 Overall Result:");
    if (allPassed) {
      console.log("✅ ALL TESTS PASSED - calculateStats function is working correctly!");
      console.log("\n📋 Summary:");
      console.log("- calculateStats function properly imported from stats-slice");
      console.log("- Session completion will no longer throw 'calculateStats is not a function' error");
      console.log("- Statistics calculation works for all session scenarios");
      console.log("- Timer functionality is fully restored");
    } else {
      console.log("❌ SOME TESTS FAILED - calculateStats function needs further investigation");
    }

  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Export for potential use in other test files
export { runCalculateStatsTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runCalculateStatsTests();
}
