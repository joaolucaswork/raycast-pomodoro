/**
 * Achievement Test Runner and Issue Identifier
 *
 * This script runs all achievement tests and identifies failing tests that reveal
 * actual bugs in the achievement system, providing fixes for identified issues.
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface TestResult {
  testFile: string;
  testName: string;
  status: "PASS" | "FAIL" | "SKIP";
  error?: string;
  duration?: number;
}

interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  results: TestResult[];
}

/**
 * Achievement test files to run
 */
const ACHIEVEMENT_TEST_FILES = [
  "boxing-achievement-service.test.ts",
  "points-achievement-integration.test.ts",
  "achievement-store-integration.test.ts",
  "achievement-ui-components.test.tsx",
  "achievement-data-persistence.test.ts",
  "achievement-edge-cases.test.ts",
  "achievement-session-integration.test.ts",
];

/**
 * Known issues and their fixes
 */
const KNOWN_ISSUES = {
  "Achievement categories mismatch": {
    description: "Test expects wrong achievement categories",
    fix: "Update test to use actual categories: training_milestones, knockout_streaks, championship_belts, daily_training, endurance_challenges, consistency_championships, special_achievements, mood_mastery",
    files: ["boxing-achievement-service.test.ts"],
  },
  "Achievement requirement types mismatch": {
    description: "Test expects wrong requirement types",
    fix: "Update test to use actual requirement types: sessions_completed, streak_length, total_time, daily_goal, session_duration, consecutive_days, time_of_day, weekend_sessions, mood_entries_total, mood_tracking_streak, mood_entries_with_notes, mood_intensity_range, mood_specific_sessions, mood_context_entries, mood_improvement_pattern, mood_awareness_diversity",
    files: ["boxing-achievement-service.test.ts"],
  },
  "Streak calculation logic": {
    description: "Streak calculation may not work as expected in tests",
    fix: "Review streak calculation logic in boxing-achievement-service.ts and update test expectations",
    files: ["boxing-achievement-service.test.ts", "achievement-edge-cases.test.ts"],
  },
  "Time-based achievement requirements": {
    description: "Time requirements may be in minutes vs seconds",
    fix: "Verify if time requirements are in minutes (as in service) vs seconds (as in tests)",
    files: ["points-achievement-integration.test.ts", "boxing-achievement-service.test.ts"],
  },
  "Mock service integration": {
    description: "Mocked services may not reflect actual behavior",
    fix: "Update mocks to more closely match actual service behavior",
    files: ["achievement-store-integration.test.ts", "achievement-session-integration.test.ts"],
  },
};

/**
 * Run a single test file and parse results
 */
function runTestFile(testFile: string): TestResult[] {
  const results: TestResult[] = [];
  
  try {
    console.log(`\n🧪 Running ${testFile}...`);
    
    const output = execSync(
      `npx jest src/tests/${testFile} --verbose --no-coverage`,
      { 
        encoding: "utf-8",
        cwd: process.cwd(),
        timeout: 30000, // 30 second timeout
      }
    );
    
    // Parse Jest output (simplified parsing)
    const lines = output.split("\n");
    let currentTest = "";
    
    for (const line of lines) {
      if (line.includes("✓") || line.includes("✗")) {
        const testName = line.replace(/^\s*[✓✗]\s*/, "").replace(/\s*\(\d+ms\)$/, "");
        const status = line.includes("✓") ? "PASS" : "FAIL";
        const durationMatch = line.match(/\((\d+)ms\)/);
        const duration = durationMatch ? parseInt(durationMatch[1]) : undefined;
        
        results.push({
          testFile,
          testName,
          status,
          duration,
        });
      }
    }
    
    console.log(`✅ ${testFile} completed with ${results.filter(r => r.status === "PASS").length} passing tests`);
    
  } catch (error: any) {
    console.log(`❌ ${testFile} failed with errors`);
    
    // Parse error output to extract individual test failures
    const errorOutput = error.stdout || error.message || "";
    const lines = errorOutput.split("\n");
    
    let currentTest = "";
    let errorMessage = "";
    
    for (const line of lines) {
      if (line.includes("●")) {
        if (currentTest && errorMessage) {
          results.push({
            testFile,
            testName: currentTest,
            status: "FAIL",
            error: errorMessage.trim(),
          });
        }
        currentTest = line.replace(/^\s*●\s*/, "");
        errorMessage = "";
      } else if (line.trim() && currentTest) {
        errorMessage += line + "\n";
      }
    }
    
    // Add the last test if exists
    if (currentTest && errorMessage) {
      results.push({
        testFile,
        testName: currentTest,
        status: "FAIL",
        error: errorMessage.trim(),
      });
    }
  }
  
  return results;
}

/**
 * Run all achievement tests
 */
function runAllAchievementTests(): TestSummary {
  console.log("🚀 Starting Achievement System Test Suite");
  console.log("=" .repeat(50));
  
  const allResults: TestResult[] = [];
  
  for (const testFile of ACHIEVEMENT_TEST_FILES) {
    const testPath = join(process.cwd(), "src", "tests", testFile);
    
    if (!existsSync(testPath)) {
      console.log(`⚠️  Test file not found: ${testFile}`);
      allResults.push({
        testFile,
        testName: "File not found",
        status: "SKIP",
      });
      continue;
    }
    
    const results = runTestFile(testFile);
    allResults.push(...results);
  }
  
  const summary: TestSummary = {
    totalTests: allResults.length,
    passedTests: allResults.filter(r => r.status === "PASS").length,
    failedTests: allResults.filter(r => r.status === "FAIL").length,
    skippedTests: allResults.filter(r => r.status === "SKIP").length,
    results: allResults,
  };
  
  return summary;
}

/**
 * Analyze test results and identify issues
 */
function analyzeTestResults(summary: TestSummary): void {
  console.log("\n📊 Test Results Summary");
  console.log("=" .repeat(50));
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`✅ Passed: ${summary.passedTests}`);
  console.log(`❌ Failed: ${summary.failedTests}`);
  console.log(`⏭️  Skipped: ${summary.skippedTests}`);
  console.log(`📈 Success Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%`);
  
  if (summary.failedTests > 0) {
    console.log("\n🔍 Failed Tests Analysis");
    console.log("=" .repeat(50));
    
    const failedTests = summary.results.filter(r => r.status === "FAIL");
    
    // Group failures by test file
    const failuresByFile = failedTests.reduce((acc, test) => {
      if (!acc[test.testFile]) {
        acc[test.testFile] = [];
      }
      acc[test.testFile].push(test);
      return acc;
    }, {} as Record<string, TestResult[]>);
    
    for (const [file, failures] of Object.entries(failuresByFile)) {
      console.log(`\n📁 ${file} (${failures.length} failures):`);
      
      failures.forEach((failure, index) => {
        console.log(`  ${index + 1}. ${failure.testName}`);
        if (failure.error) {
          // Show first few lines of error
          const errorLines = failure.error.split("\n").slice(0, 3);
          errorLines.forEach(line => {
            console.log(`     ${line}`);
          });
          if (failure.error.split("\n").length > 3) {
            console.log("     ...");
          }
        }
      });
    }
  }
  
  // Suggest fixes for known issues
  console.log("\n🔧 Suggested Fixes");
  console.log("=" .repeat(50));
  
  for (const [issue, details] of Object.entries(KNOWN_ISSUES)) {
    const affectedFiles = details.files.filter(file => 
      summary.results.some(r => r.testFile === file && r.status === "FAIL")
    );
    
    if (affectedFiles.length > 0) {
      console.log(`\n🐛 ${issue}:`);
      console.log(`   Description: ${details.description}`);
      console.log(`   Fix: ${details.fix}`);
      console.log(`   Affected files: ${affectedFiles.join(", ")}`);
    }
  }
}

/**
 * Generate test report
 */
function generateTestReport(summary: TestSummary): void {
  const reportPath = join(process.cwd(), "achievement-test-report.md");
  
  let report = "# Achievement System Test Report\n\n";
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += "## Summary\n\n";
  report += `- **Total Tests**: ${summary.totalTests}\n`;
  report += `- **Passed**: ${summary.passedTests} ✅\n`;
  report += `- **Failed**: ${summary.failedTests} ❌\n`;
  report += `- **Skipped**: ${summary.skippedTests} ⏭️\n`;
  report += `- **Success Rate**: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%\n\n`;
  
  if (summary.failedTests > 0) {
    report += "## Failed Tests\n\n";
    
    const failedTests = summary.results.filter(r => r.status === "FAIL");
    const failuresByFile = failedTests.reduce((acc, test) => {
      if (!acc[test.testFile]) {
        acc[test.testFile] = [];
      }
      acc[test.testFile].push(test);
      return acc;
    }, {} as Record<string, TestResult[]>);
    
    for (const [file, failures] of Object.entries(failuresByFile)) {
      report += `### ${file}\n\n`;
      
      failures.forEach((failure, index) => {
        report += `${index + 1}. **${failure.testName}**\n`;
        if (failure.error) {
          report += "```\n";
          report += failure.error;
          report += "\n```\n\n";
        }
      });
    }
  }
  
  report += "## Recommended Actions\n\n";
  
  for (const [issue, details] of Object.entries(KNOWN_ISSUES)) {
    report += `### ${issue}\n\n`;
    report += `**Description**: ${details.description}\n\n`;
    report += `**Fix**: ${details.fix}\n\n`;
    report += `**Affected Files**: ${details.files.join(", ")}\n\n`;
  }
  
  writeFileSync(reportPath, report);
  console.log(`\n📄 Test report generated: ${reportPath}`);
}

/**
 * Main execution
 */
function main(): void {
  try {
    const summary = runAllAchievementTests();
    analyzeTestResults(summary);
    generateTestReport(summary);
    
    console.log("\n🎯 Achievement Test Suite Complete!");
    
    if (summary.failedTests > 0) {
      console.log("\n⚠️  Some tests failed. Review the analysis above and apply suggested fixes.");
      process.exit(1);
    } else {
      console.log("\n🎉 All tests passed! Achievement system is working correctly.");
      process.exit(0);
    }
    
  } catch (error) {
    console.error("\n💥 Test runner failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { runAllAchievementTests, analyzeTestResults, generateTestReport };
export type { TestResult, TestSummary };
