import { PersistStorage } from "zustand/middleware";
import { storageAdapter } from "./storage-adapter";

/**
 * Custom Zustand storage implementation that works in both development and production
 */
export const zustandStorage: PersistStorage<any> = {
  getItem: async (name: string) => {
    try {
      const value = await storageAdapter.getItem(name);
      return value ? JSON.parse(value) : null;
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
