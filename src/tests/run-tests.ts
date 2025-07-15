#!/usr/bin/env node

/**
 * Test runner for the Raycast Pomodoro Extension
 * 
 * This script runs all tests for the points system, multi-round sessions,
 * and auto-start functionality to ensure the implementation works correctly.
 */

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  passed: boolean;
  output: string;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log("🧪 Running Raycast Pomodoro Extension Tests\n");

    const testFiles = [
      "points-system-service.test.ts",
      "multi-round-sessions.test.ts", 
      "timer-completion-integration.test.ts",
      "auto-start-flows.test.ts"
    ];

    for (const testFile of testFiles) {
      await this.runTest(testFile);
    }

    this.printSummary();
  }

  private async runTest(testFile: string): Promise<void> {
    const testName = testFile.replace(".test.ts", "");
    console.log(`📋 Running ${testName}...`);

    try {
      // Note: This assumes Jest is available. In a real Raycast extension,
      // you might need to use a different test runner or mock framework.
      const { stdout, stderr } = await execAsync(`npx jest ${testFile}`, {
        cwd: path.join(__dirname, ".."),
        timeout: 30000
      });

      this.results.push({
        name: testName,
        passed: true,
        output: stdout
      });

      console.log(`✅ ${testName} passed\n`);
    } catch (error: any) {
      this.results.push({
        name: testName,
        passed: false,
        output: error.stdout || "",
        error: error.stderr || error.message
      });

      console.log(`❌ ${testName} failed`);
      console.log(`Error: ${error.message}\n`);
    }
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log("📊 Test Summary");
    console.log("================");
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    
    if (passed === total) {
      console.log("\n🎉 All tests passed! The points system and multi-round functionality are working correctly.");
    } else {
      console.log("\n⚠️  Some tests failed. Please review the errors above.");
      
      // Print failed test details
      const failed = this.results.filter(r => !r.passed);
      failed.forEach(test => {
        console.log(`\n❌ ${test.name}:`);
        if (test.error) {
          console.log(test.error);
        }
      });
    }
  }
}

// Manual test scenarios for manual verification
class ManualTestScenarios {
  static printScenarios(): void {
    console.log("\n🔧 Manual Test Scenarios");
    console.log("=========================");
    console.log("Please test these scenarios manually in the Raycast extension:\n");

    console.log("1. 🎯 Natural Completion (70 points):");
    console.log("   - Start a 25-minute focus session");
    console.log("   - Let it complete naturally (timer expires)");
    console.log("   - Verify: 70 points awarded");
    console.log("   - Verify: Break session auto-starts\n");

    console.log("2. ⏹️  Manual Completion After 40s (10 points):");
    console.log("   - Start a focus session");
    console.log("   - Stop it manually after 1+ minutes");
    console.log("   - Verify: 10 points awarded");
    console.log("   - Verify: No auto-start (returns to idle)\n");

    console.log("3. ⚡ Manual Completion Before 40s (1 point):");
    console.log("   - Start a focus session");
    console.log("   - Stop it manually before 40 seconds");
    console.log("   - Verify: 1 point awarded");
    console.log("   - Verify: Session not saved to history\n");

    console.log("4. 🚫 Point Restriction:");
    console.log("   - Complete a session manually (get points)");
    console.log("   - Complete another session manually");
    console.log("   - Verify: No points for second manual completion");
    console.log("   - Complete a session naturally");
    console.log("   - Verify: Points awarded and restriction reset\n");

    console.log("5. 🔄 Multi-Round Sessions:");
    console.log("   - Set target rounds to 3");
    console.log("   - Start a focus session");
    console.log("   - Let it complete naturally");
    console.log("   - Verify: Break auto-starts even if autoStartBreaks is disabled");
    console.log("   - Let break complete");
    console.log("   - Verify: Next work session auto-starts");
    console.log("   - Repeat until all 3 rounds complete");
    console.log("   - Verify: Returns to idle after final round\n");

    console.log("6. 🛑 Break Session Auto-Start:");
    console.log("   - Ensure autoStartBreaks is enabled in preferences");
    console.log("   - Complete a work session naturally");
    console.log("   - Verify: Short break starts automatically");
    console.log("   - Complete 4 work sessions");
    console.log("   - Verify: Long break starts after 4th session\n");

    console.log("7. 📊 Points Integration:");
    console.log("   - Check achievements page");
    console.log("   - Verify: Points are properly integrated with boxing progress");
    console.log("   - Verify: Level calculations work correctly");
    console.log("   - Verify: Achievement unlocks trigger appropriately\n");
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  
  runner.runAllTests().then(() => {
    ManualTestScenarios.printScenarios();
  }).catch(error => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
}

export { TestRunner, ManualTestScenarios };
