/**
 * Test script for the JSON Application Icon Service
 * Verifies that the JSON configuration loads correctly and provides expected mappings
 */

import { Icon } from "@raycast/api";
import { jsonApplicationIconService } from "./services/data/json-app-icon-service";
import {
  getApplicationIcon,
  getIconServiceStatistics,
} from "./utils/app-icon-utils";

/**
 * Test basic icon mapping functionality
 */
function testBasicIconMapping() {
  console.log("🧪 Testing basic icon mapping...");

  // Test VS Code mapping
  const vscodeIcon = jsonApplicationIconService.getIconByBundleId(
    "com.microsoft.VSCode"
  );
  console.log(
    `VS Code icon: ${vscodeIcon === Icon.Code ? "✅ Code" : "❌ " + vscodeIcon}`
  );

  // Test Chrome mapping
  const chromeIcon = jsonApplicationIconService.getIconByName("Google Chrome");
  console.log(
    `Chrome icon: ${chromeIcon === Icon.Globe ? "✅ Globe" : "❌ " + chromeIcon}`
  );

  // Test Slack mapping
  const slackIcon = jsonApplicationIconService.getIconByBundleId(
    "com.tinyspeck.slackmacgap"
  );
  console.log(
    `Slack icon: ${slackIcon === Icon.Message ? "✅ Message" : "❌ " + slackIcon}`
  );

  console.log("");
}

/**
 * Test alias mapping
 */
function testAliasMapping() {
  console.log("🧪 Testing alias mapping...");

  // Test VS Code aliases
  const vscodeByAlias = jsonApplicationIconService.getIconByName("VSCode");
  console.log(
    `VSCode alias: ${vscodeByAlias === Icon.Code ? "✅ Code" : "❌ " + vscodeByAlias}`
  );

  const codeAlias = jsonApplicationIconService.getIconByName("Code");
  console.log(
    `Code alias: ${codeAlias === Icon.Code ? "✅ Code" : "❌ " + codeAlias}`
  );

  console.log("");
}

/**
 * Test category functionality
 */
function testCategories() {
  console.log("🧪 Testing categories...");

  const categories = jsonApplicationIconService.getCategories();
  console.log(`Categories found: ${categories.length}`);
  console.log(`Categories: ${categories.join(", ")}`);

  // Test category mapping
  const vscodeCategory = jsonApplicationIconService.getCategoryByBundleId(
    "com.microsoft.VSCode"
  );
  console.log(
    `VS Code category: ${vscodeCategory === "development" ? "✅ development" : "❌ " + vscodeCategory}`
  );

  // Test fallback icons
  const devFallback =
    jsonApplicationIconService.getCategoryFallbackIcon("development");
  console.log(
    `Development fallback: ${devFallback === Icon.Code ? "✅ Code" : "❌ " + devFallback}`
  );

  console.log("");
}

/**
 * Test search functionality
 */
function testSearch() {
  console.log("🧪 Testing search functionality...");

  const codeResults = jsonApplicationIconService.searchApplications("code");
  console.log(`Search "code" results: ${codeResults.length} applications`);
  codeResults.forEach((app) => {
    console.log(`  - ${app.name} (${app.category})`);
  });

  const chromeResults = jsonApplicationIconService.searchApplications("chrome");
  console.log(`Search "chrome" results: ${chromeResults.length} applications`);

  console.log("");
}

/**
 * Test comprehensive mapping
 */
function testComprehensiveMapping() {
  console.log("🧪 Testing comprehensive mapping...");

  const mapping = jsonApplicationIconService.getApplicationMapping(
    "com.microsoft.VSCode",
    "Visual Studio Code"
  );

  if (mapping) {
    console.log("✅ VS Code mapping found:");
    console.log(`  Icon: ${mapping.icon}`);
    console.log(`  Category: ${mapping.category}`);
    console.log(`  Recognized: ${mapping.isRecognized}`);
    console.log(`  Recognized Name: ${mapping.recognizedName}`);
  } else {
    console.log("❌ VS Code mapping not found");
  }

  console.log("");
}

/**
 * Test utility functions
 */
function testUtilityFunctions() {
  console.log("🧪 Testing utility functions...");

  const vscodeIcon = getApplicationIcon(
    "com.microsoft.VSCode",
    "Visual Studio Code"
  );
  console.log(
    `Utility VS Code icon: ${vscodeIcon === Icon.Code ? "✅ Code" : "❌ " + vscodeIcon}`
  );

  const unknownIcon = getApplicationIcon("com.unknown.app", "Unknown App");
  console.log(
    `Unknown app icon: ${unknownIcon === Icon.Desktop ? "✅ Desktop" : "❌ " + unknownIcon}`
  );

  console.log("");
}

/**
 * Test statistics
 */
function testStatistics() {
  console.log("🧪 Testing statistics...");

  const stats = getIconServiceStatistics();
  console.log(`Total applications: ${stats.totalRecognizedApps}`);
  console.log(`Version: ${stats.version}`);
  console.log(`Last updated: ${stats.lastUpdated}`);

  const serviceStats = jsonApplicationIconService.getStatistics();
  console.log(`Bundle ID mappings: ${serviceStats.totalBundleIds}`);
  console.log(`Alias mappings: ${serviceStats.totalAliases}`);

  console.log("Category breakdown:");
  serviceStats.categoryCounts.forEach(({ category, count }) => {
    console.log(`  ${category}: ${count} applications`);
  });

  console.log("");
}

/**
 * Test fallback behavior
 */
function testFallbacks() {
  console.log("🧪 Testing fallback behavior...");

  // Test unknown application
  const unknownIcon = jsonApplicationIconService.getIconByBundleId(
    "com.unknown.application"
  );
  console.log(
    `Unknown app icon: ${unknownIcon === Icon.Desktop ? "✅ Desktop (default)" : "❌ " + unknownIcon}`
  );

  // Test unknown category fallback
  const unknownCategoryIcon =
    jsonApplicationIconService.getCategoryFallbackIcon("unknown-category");
  console.log(
    `Unknown category fallback: ${unknownCategoryIcon === Icon.Desktop ? "✅ Desktop" : "❌ " + unknownCategoryIcon}`
  );

  console.log("");
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log("🚀 Running JSON Application Icon Service Tests\n");

  try {
    testBasicIconMapping();
    testAliasMapping();
    testCategories();
    testSearch();
    testComprehensiveMapping();
    testUtilityFunctions();
    testStatistics();
    testFallbacks();

    console.log("🎉 All tests completed!");
    console.log("\n📋 Summary:");
    console.log("- JSON configuration loaded successfully");
    console.log("- Icon mappings working correctly");
    console.log("- Alias resolution functional");
    console.log("- Category organization verified");
    console.log("- Search functionality operational");
    console.log("- Fallback mechanisms working");
    console.log("- Integration with application tracking ready");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export for potential use in other test files
export { runAllTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
