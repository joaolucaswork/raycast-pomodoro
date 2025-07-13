import { Icon } from "@raycast/api";
import appIconsData from "../data/app-icons.json";

/**
 * Interface for application icon mapping from JSON configuration
 */
export interface JsonApplicationMapping {
  bundleIds: string[];
  icon: string; // Icon name as string (will be converted to Icon enum)
  aliases: string[];
}

/**
 * Interface for the JSON configuration structure
 */
interface AppIconsConfig {
  metadata: {
    version: string;
    description: string;
    lastUpdated: string;
    totalMappings: number;
  };
  defaultIcon: string;
  categoryFallbacks: Record<string, string>;
  applications: Record<string, Record<string, JsonApplicationMapping>>;
}

/**
 * Service for mapping applications to Raycast icons using JSON configuration
 * This provides an alternative to the hardcoded application-icon-service.ts
 */
export class JsonApplicationIconService {
  private static instance: JsonApplicationIconService;
  private config: AppIconsConfig;
  private bundleIdMap: Map<string, { icon: Icon; category: string; name: string }>;
  private nameMap: Map<string, { icon: Icon; category: string; name: string }>;
  private aliasMap: Map<string, { icon: Icon; category: string; name: string }>;

  private constructor() {
    this.config = appIconsData as AppIconsConfig;
    this.bundleIdMap = new Map();
    this.nameMap = new Map();
    this.aliasMap = new Map();
    this.initializeMappings();
  }

  public static getInstance(): JsonApplicationIconService {
    if (!JsonApplicationIconService.instance) {
      JsonApplicationIconService.instance = new JsonApplicationIconService();
    }
    return JsonApplicationIconService.instance;
  }

  /**
   * Initialize all mappings from the JSON configuration
   */
  private initializeMappings(): void {
    Object.entries(this.config.applications).forEach(([category, apps]) => {
      Object.entries(apps).forEach(([appName, mapping]) => {
        const icon = this.stringToIcon(mapping.icon);
        const mappingData = { icon, category, name: appName };

        // Map bundle IDs
        mapping.bundleIds.forEach((bundleId) => {
          this.bundleIdMap.set(bundleId.toLowerCase(), mappingData);
        });

        // Map application name
        this.nameMap.set(appName.toLowerCase(), mappingData);

        // Map aliases
        mapping.aliases.forEach((alias) => {
          this.aliasMap.set(alias.toLowerCase(), mappingData);
        });
      });
    });

    console.log(`[JsonApplicationIconService] Initialized ${this.bundleIdMap.size} bundle ID mappings`);
    console.log(`[JsonApplicationIconService] Initialized ${this.nameMap.size} name mappings`);
    console.log(`[JsonApplicationIconService] Initialized ${this.aliasMap.size} alias mappings`);
  }

  /**
   * Convert string icon name to Raycast Icon enum
   */
  private stringToIcon(iconName: string): Icon {
    // Use type assertion since we know these are valid Icon values
    return (Icon as any)[iconName] || Icon.Desktop;
  }

  /**
   * Get icon for application by bundle ID
   */
  public getIconByBundleId(bundleId: string): Icon {
    const mapping = this.bundleIdMap.get(bundleId.toLowerCase());
    return mapping?.icon || this.stringToIcon(this.config.defaultIcon);
  }

  /**
   * Get icon for application by name
   */
  public getIconByName(name: string): Icon {
    const mapping = this.nameMap.get(name.toLowerCase()) || this.aliasMap.get(name.toLowerCase());
    return mapping?.icon || this.stringToIcon(this.config.defaultIcon);
  }

  /**
   * Get category for application by bundle ID
   */
  public getCategoryByBundleId(bundleId: string): string {
    const mapping = this.bundleIdMap.get(bundleId.toLowerCase());
    return mapping?.category || "other";
  }

  /**
   * Get category for application by name
   */
  public getCategoryByName(name: string): string {
    const mapping = this.nameMap.get(name.toLowerCase()) || this.aliasMap.get(name.toLowerCase());
    return mapping?.category || "other";
  }

  /**
   * Get complete mapping for application (icon + category + recognized name)
   */
  public getApplicationMapping(
    bundleId: string,
    name: string
  ): { icon: Icon; category: string; isRecognized: boolean; recognizedName?: string } | null {
    // Try bundle ID first
    let mapping = this.bundleIdMap.get(bundleId.toLowerCase());
    
    if (!mapping) {
      // Try by name
      mapping = this.nameMap.get(name.toLowerCase());
    }
    
    if (!mapping) {
      // Try by alias
      mapping = this.aliasMap.get(name.toLowerCase());
    }

    if (mapping) {
      return {
        icon: mapping.icon,
        category: mapping.category,
        isRecognized: true,
        recognizedName: mapping.name,
      };
    }

    return null;
  }

  /**
   * Get fallback icon for a category
   */
  public getCategoryFallbackIcon(category: string): Icon {
    const fallbackIconName = this.config.categoryFallbacks[category];
    return fallbackIconName ? this.stringToIcon(fallbackIconName) : this.stringToIcon(this.config.defaultIcon);
  }

  /**
   * Get all applications in a category
   */
  public getApplicationsByCategory(category: string): Array<{ name: string; icon: Icon; bundleIds: string[] }> {
    const categoryApps = this.config.applications[category];
    if (!categoryApps) return [];

    return Object.entries(categoryApps).map(([name, mapping]) => ({
      name,
      icon: this.stringToIcon(mapping.icon),
      bundleIds: mapping.bundleIds,
    }));
  }

  /**
   * Get all available categories
   */
  public getCategories(): string[] {
    return Object.keys(this.config.applications);
  }

  /**
   * Get configuration metadata
   */
  public getMetadata() {
    return this.config.metadata;
  }

  /**
   * Search for applications by name or alias
   */
  public searchApplications(query: string): Array<{ name: string; icon: Icon; category: string; bundleIds: string[] }> {
    const results: Array<{ name: string; icon: Icon; category: string; bundleIds: string[] }> = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(this.config.applications).forEach(([category, apps]) => {
      Object.entries(apps).forEach(([appName, mapping]) => {
        const matchesName = appName.toLowerCase().includes(lowerQuery);
        const matchesAlias = mapping.aliases.some(alias => alias.toLowerCase().includes(lowerQuery));
        
        if (matchesName || matchesAlias) {
          results.push({
            name: appName,
            icon: this.stringToIcon(mapping.icon),
            category,
            bundleIds: mapping.bundleIds,
          });
        }
      });
    });

    return results;
  }

  /**
   * Check if an application is recognized (has a mapping)
   */
  public isApplicationRecognized(bundleId: string, name: string): boolean {
    return this.getApplicationMapping(bundleId, name) !== null;
  }

  /**
   * Get statistics about the mappings
   */
  public getStatistics() {
    const totalApps = Object.values(this.config.applications).reduce(
      (sum, category) => sum + Object.keys(category).length,
      0
    );

    const categoryCounts = Object.entries(this.config.applications).map(([category, apps]) => ({
      category,
      count: Object.keys(apps).length,
    }));

    return {
      totalApplications: totalApps,
      totalBundleIds: this.bundleIdMap.size,
      totalAliases: this.aliasMap.size,
      categoryCounts,
      version: this.config.metadata.version,
      lastUpdated: this.config.metadata.lastUpdated,
    };
  }
}

// Export singleton instance
export const jsonApplicationIconService = JsonApplicationIconService.getInstance();
