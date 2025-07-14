/**
 * Simple test script to verify notification functionality
 * This can be run to test that the simplified notification service works correctly
 */

import { Toast } from "@raycast/api";
import { notificationService } from "./services/notification-service";
import { SessionType } from "./types/timer";

async function testNotifications() {
  console.log("Testing simplified notification service...");

  try {
    // Test basic toast notifications
    console.log("1. Testing basic toast notifications...");
    await notificationService.showSuccess(
      "Test Success",
      "This is a success notification"
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await notificationService.showError(
      "Test Error",
      "This is an error notification"
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test HUD notifications
    console.log("2. Testing HUD notifications...");
    await notificationService.showHUD("This is a HUD notification");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test session notifications
    console.log("3. Testing session notifications...");
    await notificationService.notifySessionStart(SessionType.WORK, "Test Task");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await notificationService.notifySessionCompletion(
      SessionType.WORK,
      "Work session completed",
      "Test Task"
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test ADHD notifications
    console.log("4. Testing ADHD notifications...");
    await notificationService.notifyPointsEarned(25, "Completed test session");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await notificationService.notifyAchievementUnlocked("Test Achievement", 50);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test animated toast
    console.log("5. Testing animated toast...");
    const animatedToast =
      await notificationService.showAnimatedToast("Processing...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    animatedToast.style = Toast.Style.Success;
    animatedToast.title = "Processing Complete";

    console.log("✅ All notification tests completed successfully!");
  } catch (error) {
    console.error("❌ Notification test failed:", error);
  }
}

// Export for potential use in other test files
export { testNotifications };

// Run tests if this file is executed directly
if (require.main === module) {
  testNotifications();
}
