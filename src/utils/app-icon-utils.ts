import { Icon } from "@raycast/api";
import { jsonApplicationIconService } from "../services/json-app-icon-service";
import { applicationIconService } from "../services/application-icon-service";

/**
 * Utility functions for application icon management
 * Provides a unified interface for getting application icons from multiple sources
 */

/**
 * Get the best available icon for an application
 * Uses JSON service first, then falls back to legacy service
 */
export function getApplicationIcon(bundleId: string, name: string): Icon {
  // Try JSON service first (more comprehensive)
  const jsonMapping = jsonApplicationIconService.getApplicationMapping(bundleId, name);
  if (jsonMapping) {
    return jsonMapping.icon;
  }

  // Fallback to legacy service
  const legacyMapping = applicationIconService.getApplicationMapping(bundleId, name);
  if (legacyMapping) {
    return legacyMapping.icon;
  }

  // Final fallback
  return Icon.Desktop;
}

/**
 * Get application category
 */
export function getApplicationCategory(bundleId: string, name: string): string {
  // Try JSON service first
  const jsonMapping = jsonApplicationIconService.getApplicationMapping(bundleId, name);
  if (jsonMapping) {
    return jsonMapping.category;
  }

  // Fallback to legacy service
  const legacyMapping = applicationIconService.getApplicationMapping(bundleId, name);
  if (legacyMapping) {
    return legacyMapping.category;
  }

  return "other";
}

/**
 * Check if an application is recognized by any service
 */
export function isApplicationRecognized(bundleId: string, name: string): boolean {
  return jsonApplicationIconService.isApplicationRecognized(bundleId, name) ||
         applicationIconService.getApplicationMapping(bundleId, name) !== null;
}

/**
 * Get fallback icon for a category
 */
export function getCategoryFallbackIcon(category: string): Icon {
  return jsonApplicationIconService.getCategoryFallbackIcon(category);
}

/**
 * Search for applications across all services
 */
export function searchApplications(query: string) {
  const jsonResults = jsonApplicationIconService.searchApplications(query);
  
  // Could extend this to include legacy service results if needed
  return jsonResults;
}

/**
 * Get comprehensive application mapping with all available data
 */
export function getComprehensiveApplicationMapping(bundleId: string, name: string) {
  const jsonMapping = jsonApplicationIconService.getApplicationMapping(bundleId, name);
  const legacyMapping = applicationIconService.getApplicationMapping(bundleId, name);

  return {
    icon: jsonMapping?.icon || legacyMapping?.icon || Icon.Desktop,
    category: jsonMapping?.category || legacyMapping?.category || "other",
    isRecognized: jsonMapping?.isRecognized || legacyMapping !== null,
    recognizedName: jsonMapping?.recognizedName || name,
    source: jsonMapping ? "json" : legacyMapping ? "legacy" : "fallback",
  };
}

/**
 * Get icon statistics and information
 */
export function getIconServiceStatistics() {
  const jsonStats = jsonApplicationIconService.getStatistics();
  
  return {
    jsonService: jsonStats,
    totalRecognizedApps: jsonStats.totalApplications,
    version: jsonStats.version,
    lastUpdated: jsonStats.lastUpdated,
  };
}

/**
 * Validate that an icon name exists in the Raycast Icon enum
 */
export function isValidRaycastIcon(iconName: string): boolean {
  return iconName in Icon;
}

/**
 * Get all available application categories
 */
export function getAllCategories(): string[] {
  return jsonApplicationIconService.getCategories();
}

/**
 * Get applications by category
 */
export function getApplicationsByCategory(category: string) {
  return jsonApplicationIconService.getApplicationsByCategory(category);
}
