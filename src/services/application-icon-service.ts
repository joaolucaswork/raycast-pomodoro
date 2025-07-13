import { Icon } from "@raycast/api";
import {
  APPLICATION_ICON_MAPPINGS,
  ApplicationIconMapping,
  iconSearch,
  iconFallbacks,
} from "./application-icons";

/**
 * Facade service for application icon functionality.
 *
 * This service provides a unified interface to application icon functionality by
 * coordinating between specialized modules:
 * - IconMappings: Static application icon mappings
 * - IconSearch: Search and matching algorithms
 * - IconFallbacks: Category-based fallbacks and detection
 */

/**
 * Application Icon Service
 */
export class ApplicationIconService {
  private static instance: ApplicationIconService;
  private iconMappings: Map<string, ApplicationIconMapping>;
  private nameMappings: Map<string, ApplicationIconMapping>;

  private constructor() {
    this.iconMappings = new Map();
    this.nameMappings = new Map();
    this.initializeMappings();
  }

  public static getInstance(): ApplicationIconService {
    if (!ApplicationIconService.instance) {
      ApplicationIconService.instance = new ApplicationIconService();
    }
    return ApplicationIconService.instance;
  }

  private initializeMappings(): void {
    APPLICATION_ICON_MAPPINGS.forEach((mapping) => {
      this.iconMappings.set(mapping.bundleId.toLowerCase(), mapping);
      this.nameMappings.set(mapping.name.toLowerCase(), mapping);
    });
  }

  /**
   * Get icon for application by bundle ID
   */
  public getIconByBundleId(bundleId: string): Icon {
    const mapping = iconSearch.findByBundleId(bundleId, this.iconMappings);
    return mapping?.icon || Icon.Desktop;
  }

  /**
   * Get icon for application by name with intelligent matching
   */
  public getIconByName(name: string): Icon {
    // Try exact match first
    const exactMapping = iconSearch.findByName(name, this.nameMappings);
    if (exactMapping) {
      return exactMapping.icon;
    }

    // Try partial match
    const partialMapping = iconSearch.findPartialMatch(name, this.nameMappings);
    if (partialMapping) {
      return partialMapping.icon;
    }

    // Category-based fallback
    return iconFallbacks.getCategoryIcon(name);
  }

  /**
   * Get category icon for unknown applications
   */
  public getCategoryIcon(name: string): Icon {
    return iconFallbacks.getCategoryIcon(name);
  }

  /**
   * Get application mapping information
   */
  public getApplicationMapping(
    bundleId: string,
    name: string
  ): ApplicationIconMapping | null {
    return (
      iconSearch.findByBundleId(bundleId, this.iconMappings) ||
      iconSearch.findByName(name, this.nameMappings) ||
      null
    );
  }

  /**
   * Check if application is recognized
   */
  public isRecognizedApplication(bundleId: string, name: string): boolean {
    return (
      this.iconMappings.has(bundleId.toLowerCase()) ||
      this.nameMappings.has(name.toLowerCase())
    );
  }

  /**
   * Search applications by category
   */
  public getApplicationsByCategory(category: string): ApplicationIconMapping[] {
    return iconSearch.searchByCategory(category, APPLICATION_ICON_MAPPINGS);
  }

  /**
   * Get all available categories
   */
  public getAllCategories(): string[] {
    return iconFallbacks.getAllCategories();
  }

  /**
   * Advanced search functionality
   */
  public searchApplications(criteria: {
    name?: string;
    bundleId?: string;
    category?: string;
    keywords?: string[];
  }): ApplicationIconMapping[] {
    return iconSearch.advancedSearch(criteria, this.iconMappings, APPLICATION_ICON_MAPPINGS);
  }

  /**
   * Get search suggestions
   */
  public getSuggestions(partialInput: string, maxSuggestions?: number): string[] {
    return iconSearch.getSuggestions(partialInput, this.nameMappings, maxSuggestions);
  }

  /**
   * Get service statistics
   */
  public getStatistics(): {
    totalMappings: number;
    categoryCounts: Record<string, number>;
  } {
    return iconSearch.getSearchStatistics(this.iconMappings);
  }
}

// Export singleton instance
export const applicationIconService = ApplicationIconService.getInstance();
