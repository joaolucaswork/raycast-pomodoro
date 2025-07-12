import { PersistStorage } from "zustand/middleware";
import { storageAdapter } from "./storage-adapter";

/**
 * Recursively converts date strings back to Date objects
 */
function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Check if string looks like an ISO date
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      const date = new Date(obj);
      // Verify it's a valid date
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = reviveDates(obj[key]);
      }
    }
    return result;
  }

  return obj;
}

/**
 * Custom Zustand storage implementation that works in both development and production
 */
export const zustandStorage: PersistStorage<any> = {
  getItem: async (name: string) => {
    try {
      const value = await storageAdapter.getItem(name);
      if (!value) return null;

      const parsed = JSON.parse(value);
      // Convert date strings back to Date objects
      return reviveDates(parsed);
    } catch (error) {
      console.warn(`Failed to get item "${name}" from storage:`, error);
      return null;
    }
  },

  setItem: async (name: string, value: any): Promise<void> => {
    try {
      await storageAdapter.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set item "${name}" in storage:`, error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await storageAdapter.removeItem(name);
    } catch (error) {
      console.warn(`Failed to remove item "${name}" from storage:`, error);
    }
  },
};
