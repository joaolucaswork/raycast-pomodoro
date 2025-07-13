import { Icon } from "@raycast/api";
import { ApplicationIconMapping } from "./icon-mappings";

/**
 * Search and matching algorithms for application icons.
 * 
 * Handles:
 * - Exact name matching
 * - Partial name matching
 * - Fuzzy search algorithms
 * - Bundle ID matching
 * - Alias matching
 */
export class IconSearch {
  private static instance: IconSearch;

  private constructor() {}

  public static getInstance(): IconSearch {
    if (!IconSearch.instance) {
      IconSearch.instance = new IconSearch();
    }
    return IconSearch.instance;
  }

  /**
   * Find exact match by bundle ID
   */
  public findByBundleId(
    bundleId: string,
    mappings: Map<string, ApplicationIconMapping>
  ): ApplicationIconMapping | null {
    return mappings.get(bundleId.toLowerCase()) || null;
  }

  /**
   * Find exact match by name
   */
  public findByName(
    name: string,
    mappings: Map<string, ApplicationIconMapping>
  ): ApplicationIconMapping | null {
    return mappings.get(name.toLowerCase()) || null;
  }

  /**
   * Find partial match by name with intelligent matching
   */
  public findPartialMatch(
    name: string,
    mappings: Map<string, ApplicationIconMapping>
  ): ApplicationIconMapping | null {
    const normalizedName = name.toLowerCase();

    // Try partial matching
    for (const [mappedName, mapping] of mappings.entries()) {
      if (
        normalizedName.includes(mappedName) ||
        mappedName.includes(normalizedName)
      ) {
        return mapping;
      }
    }

    return null;
  }

  /**
   * Fuzzy search with scoring
   */
  public fuzzySearch(
    query: string,
    mappings: Map<string, ApplicationIconMapping>,
    threshold: number = 0.6
  ): ApplicationIconMapping[] {
    const results: Array<{ mapping: ApplicationIconMapping; score: number }> = [];
    const normalizedQuery = query.toLowerCase();

    for (const [name, mapping] of mappings.entries()) {
      const score = this.calculateSimilarity(normalizedQuery, name);
      if (score >= threshold) {
        results.push({ mapping, score });
      }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    return results.map((result) => result.mapping);
  }

  /**
   * Calculate similarity score between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Search by keywords in application name
   */
  public searchByKeywords(
    keywords: string[],
    mappings: Map<string, ApplicationIconMapping>
  ): ApplicationIconMapping[] {
    const results: ApplicationIconMapping[] = [];
    const normalizedKeywords = keywords.map((k) => k.toLowerCase());

    for (const [name, mapping] of mappings.entries()) {
      const hasAllKeywords = normalizedKeywords.every((keyword) =>
        name.includes(keyword)
      );

      if (hasAllKeywords) {
        results.push(mapping);
      }
    }

    return results;
  }

  /**
   * Search by category
   */
  public searchByCategory(
    category: string,
    mappings: ApplicationIconMapping[]
  ): ApplicationIconMapping[] {
    return mappings.filter((mapping) => mapping.category === category);
  }

  /**
   * Advanced search with multiple criteria
   */
  public advancedSearch(
    criteria: {
      name?: string;
      bundleId?: string;
      category?: string;
      keywords?: string[];
      fuzzyThreshold?: number;
    },
    mappings: Map<string, ApplicationIconMapping>,
    allMappings: ApplicationIconMapping[]
  ): ApplicationIconMapping[] {
    let results: ApplicationIconMapping[] = [];

    // Exact matches first
    if (criteria.bundleId) {
      const bundleMatch = this.findByBundleId(criteria.bundleId, mappings);
      if (bundleMatch) {
        results.push(bundleMatch);
      }
    }

    if (criteria.name) {
      const nameMatch = this.findByName(criteria.name, mappings);
      if (nameMatch && !results.includes(nameMatch)) {
        results.push(nameMatch);
      }

      // Add partial matches
      const partialMatch = this.findPartialMatch(criteria.name, mappings);
      if (partialMatch && !results.includes(partialMatch)) {
        results.push(partialMatch);
      }

      // Add fuzzy matches
      const fuzzyMatches = this.fuzzySearch(
        criteria.name,
        mappings,
        criteria.fuzzyThreshold || 0.6
      );
      fuzzyMatches.forEach((match) => {
        if (!results.includes(match)) {
          results.push(match);
        }
      });
    }

    // Filter by category
    if (criteria.category) {
      results = results.filter((mapping) => mapping.category === criteria.category);
    }

    // Filter by keywords
    if (criteria.keywords && criteria.keywords.length > 0) {
      const keywordMatches = this.searchByKeywords(criteria.keywords, mappings);
      results = results.filter((mapping) => keywordMatches.includes(mapping));
    }

    return results;
  }

  /**
   * Get search suggestions based on partial input
   */
  public getSuggestions(
    partialInput: string,
    mappings: Map<string, ApplicationIconMapping>,
    maxSuggestions: number = 5
  ): string[] {
    const normalizedInput = partialInput.toLowerCase();
    const suggestions: string[] = [];

    for (const [name] of mappings.entries()) {
      if (name.startsWith(normalizedInput) && suggestions.length < maxSuggestions) {
        suggestions.push(name);
      }
    }

    // If we don't have enough suggestions, try partial matches
    if (suggestions.length < maxSuggestions) {
      for (const [name] of mappings.entries()) {
        if (
          name.includes(normalizedInput) &&
          !suggestions.includes(name) &&
          suggestions.length < maxSuggestions
        ) {
          suggestions.push(name);
        }
      }
    }

    return suggestions;
  }

  /**
   * Validate search query
   */
  public validateQuery(query: string): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (!query || query.trim().length === 0) {
      errors.push("Search query cannot be empty");
      suggestions.push("Enter an application name or bundle ID");
    }

    if (query.length < 2) {
      errors.push("Search query must be at least 2 characters long");
      suggestions.push("Try entering more characters for better results");
    }

    if (query.length > 100) {
      errors.push("Search query is too long");
      suggestions.push("Try a shorter, more specific search term");
    }

    // Check for special characters that might cause issues
    const hasSpecialChars = /[<>:"/\\|?*]/.test(query);
    if (hasSpecialChars) {
      errors.push("Search query contains invalid characters");
      suggestions.push("Remove special characters like < > : \" / \\ | ? *");
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * Get search statistics
   */
  public getSearchStatistics(mappings: Map<string, ApplicationIconMapping>): {
    totalMappings: number;
    categoryCounts: Record<string, number>;
    averageNameLength: number;
    longestName: string;
    shortestName: string;
  } {
    const categoryCounts: Record<string, number> = {};
    let totalNameLength = 0;
    let longestName = "";
    let shortestName = "";

    for (const [name, mapping] of mappings.entries()) {
      // Count categories
      categoryCounts[mapping.category] = (categoryCounts[mapping.category] || 0) + 1;

      // Track name lengths
      totalNameLength += name.length;
      if (!longestName || name.length > longestName.length) {
        longestName = name;
      }
      if (!shortestName || name.length < shortestName.length) {
        shortestName = name;
      }
    }

    return {
      totalMappings: mappings.size,
      categoryCounts,
      averageNameLength: mappings.size > 0 ? totalNameLength / mappings.size : 0,
      longestName,
      shortestName,
    };
  }
}

export const iconSearch = IconSearch.getInstance();
