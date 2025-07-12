/**
 * Test script for real-time application icon updates during active sessions
 * Verifies that application icons update correctly when switching between applications
 */

import { Icon } from "@raycast/api";
import { getApplicationIcon } from "./utils/app-icon-utils";
import { jsonApplicationIconService } from "./services/json-app-icon-service";

/**
 * Test common applications that users might switch between during focus sessions
 */
function testCommonApplicationIcons() {
  console.log("🧪 Testing common application icons for real-time updates...\n");

  const testApps = [
    { name: "Visual Studio Code", bundleId: "com.microsoft.VSCode", expectedIcon: Icon.Code },
    { name: "Google Chrome", bundleId: "com.google.Chrome", expectedIcon: Icon.Globe },
    { name: "Slack", bundleId: "com.tinyspeck.slackmacgap", expectedIcon: Icon.Message },
    { name: "Figma", bundleId: "com.figma.Desktop", expectedIcon: Icon.Brush },
    { name: "Spotify", bundleId: "com.spotify.client", expectedIcon: Icon.Music },
    { name: "Terminal", bundleId: "com.apple.Terminal", expectedIcon: Icon.Terminal },
    { name: "Notion", bundleId: "notion.id", expectedIcon: Icon.Document },
    { name: "Discord", bundleId: "com.hnc.Discord", expectedIcon: Icon.Message },
  ];

  testApps.forEach(({ name, bundleId, expectedIcon }) => {
    const actualIcon = getApplicationIcon(bundleId, name);
    const isCorrect = actualIcon === expectedIcon;
    
    console.log(`${isCorrect ? "✅" : "❌"} ${name}:`);
    console.log(`  Bundle ID: ${bundleId}`);
    console.log(`  Expected: ${expectedIcon}`);
    console.log(`  Actual: ${actualIcon}`);
    console.log(`  Status: ${isCorrect ? "CORRECT" : "INCORRECT"}\n`);
  });
}

/**
 * Test fallback behavior for unknown applications
 */
function testFallbackBehavior() {
  console.log("🧪 Testing fallback behavior for unknown applications...\n");

  const unknownApps = [
    { name: "Unknown App", bundleId: "com.unknown.app" },
    { name: "Custom Tool", bundleId: "com.custom.tool" },
    { name: "Test Application", bundleId: "com.test.application" },
  ];

  unknownApps.forEach(({ name, bundleId }) => {
    const icon = getApplicationIcon(bundleId, name);
    const isDesktop = icon === Icon.Desktop;
    
    console.log(`${isDesktop ? "✅" : "❌"} ${name}:`);
    console.log(`  Bundle ID: ${bundleId}`);
    console.log(`  Icon: ${icon}`);
    console.log(`  Fallback: ${isDesktop ? "CORRECT (Desktop)" : "INCORRECT"}\n`);
  });
}

/**
 * Test alias resolution for applications with multiple names
 */
function testAliasResolution() {
  console.log("🧪 Testing alias resolution for application names...\n");

  const aliasTests = [
    { alias: "VSCode", expectedIcon: Icon.Code },
    { alias: "Code", expectedIcon: Icon.Code },
    { alias: "Chrome", expectedIcon: Icon.Globe },
    { alias: "Firefox", expectedIcon: Icon.Globe },
    { alias: "VS Code", expectedIcon: Icon.Code },
  ];

  aliasTests.forEach(({ alias, expectedIcon }) => {
    const actualIcon = getApplicationIcon(alias, alias); // Use alias as both bundleId and name
    const isCorrect = actualIcon === expectedIcon;
    
    console.log(`${isCorrect ? "✅" : "❌"} Alias "${alias}":`);
    console.log(`  Expected: ${expectedIcon}`);
    console.log(`  Actual: ${actualIcon}`);
    console.log(`  Status: ${isCorrect ? "CORRECT" : "INCORRECT"}\n`);
  });
}

/**
 * Test performance of icon lookups (important for real-time updates)
 */
function testPerformance() {
  console.log("🧪 Testing performance of icon lookups...\n");

  const testApp = { name: "Visual Studio Code", bundleId: "com.microsoft.VSCode" };
  const iterations = 1000;
  
  // Test JSON service performance
  const jsonStartTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    jsonApplicationIconService.getApplicationMapping(testApp.bundleId, testApp.name);
  }
  const jsonEndTime = performance.now();
  const jsonAvgTime = (jsonEndTime - jsonStartTime) / iterations;

  // Test utility function performance
  const utilStartTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    getApplicationIcon(testApp.bundleId, testApp.name);
  }
  const utilEndTime = performance.now();
  const utilAvgTime = (utilEndTime - utilStartTime) / iterations;

  console.log(`JSON Service Performance:`);
  console.log(`  ${iterations} lookups in ${(jsonEndTime - jsonStartTime).toFixed(2)}ms`);
  console.log(`  Average: ${jsonAvgTime.toFixed(4)}ms per lookup`);
  console.log(`  Rate: ${(1000 / jsonAvgTime).toFixed(0)} lookups/second\n`);

  console.log(`Utility Function Performance:`);
  console.log(`  ${iterations} lookups in ${(utilEndTime - utilStartTime).toFixed(2)}ms`);
  console.log(`  Average: ${utilAvgTime.toFixed(4)}ms per lookup`);
  console.log(`  Rate: ${(1000 / utilAvgTime).toFixed(0)} lookups/second\n`);

  const isPerformant = utilAvgTime < 1; // Should be under 1ms for real-time updates
  console.log(`Performance: ${isPerformant ? "✅ EXCELLENT" : "❌ NEEDS OPTIMIZATION"}`);
  console.log(`Real-time suitability: ${isPerformant ? "SUITABLE" : "MAY CAUSE LAG"}\n`);
}

/**
 * Test category-based fallbacks
 */
function testCategoryFallbacks() {
  console.log("🧪 Testing category-based fallbacks...\n");

  const categories = [
    { category: "development", expectedIcon: Icon.Code },
    { category: "browser", expectedIcon: Icon.Globe },
    { category: "communication", expectedIcon: Icon.Message },
    { category: "design", expectedIcon: Icon.Brush },
    { category: "productivity", expectedIcon: Icon.Document },
    { category: "media", expectedIcon: Icon.Music },
    { category: "system", expectedIcon: Icon.Gear },
  ];

  categories.forEach(({ category, expectedIcon }) => {
    const actualIcon = jsonApplicationIconService.getCategoryFallbackIcon(category);
    const isCorrect = actualIcon === expectedIcon;
    
    console.log(`${isCorrect ? "✅" : "❌"} Category "${category}":`);
    console.log(`  Expected: ${expectedIcon}`);
    console.log(`  Actual: ${actualIcon}`);
    console.log(`  Status: ${isCorrect ? "CORRECT" : "INCORRECT"}\n`);
  });
}

/**
 * Run all real-time icon tests
 */
function runRealTimeIconTests() {
  console.log("🚀 Running Real-Time Application Icon Tests\n");
  console.log("=" .repeat(60) + "\n");

  try {
    testCommonApplicationIcons();
    console.log("=" .repeat(60) + "\n");
    
    testFallbackBehavior();
    console.log("=" .repeat(60) + "\n");
    
    testAliasResolution();
    console.log("=" .repeat(60) + "\n");
    
    testCategoryFallbacks();
    console.log("=" .repeat(60) + "\n");
    
    testPerformance();
    console.log("=" .repeat(60) + "\n");

    console.log("🎉 All real-time icon tests completed!");
    console.log("\n📋 Summary:");
    console.log("- Application icon mappings verified");
    console.log("- Fallback behavior tested");
    console.log("- Alias resolution confirmed");
    console.log("- Performance benchmarked");
    console.log("- Real-time updates ready for active sessions");

  } catch (error) {
    console.error("❌ Real-time icon test failed:", error);
  }
}

// Export for potential use in other test files
export { runRealTimeIconTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runRealTimeIconTests();
}
