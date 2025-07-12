import { LocalStorage, environment } from "@raycast/api";

/**
 * Storage adapter that handles development mode gracefully
 * Falls back to in-memory storage when Raycast storage is unavailable
 */
class StorageAdapter {
  private memoryStorage: Map<string, string> = new Map();
  private isStorageAvailable = true;

  constructor() {
    // Test storage availability on initialization
    this.testStorageAvailability();
  }

  private async testStorageAvailability(): Promise<void> {
    try {
      await LocalStorage.setItem("__storage_test__", "test");
      await LocalStorage.removeItem("__storage_test__");
      this.isStorageAvailable = true;
    } catch (error) {
      this.isStorageAvailable = false;
      if (environment.isDevelopment) {
        console.log(
          "Storage unavailable in development mode, using memory fallback",
        );
      }
    }
  }

  async getItem(key: string): Promise<string | undefined> {
    if (this.isStorageAvailable) {
      try {
        return await LocalStorage.getItem(key);
      } catch (error) {
        this.isStorageAvailable = false;
        return this.memoryStorage.get(key);
      }
    }
    return this.memoryStorage.get(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isStorageAvailable) {
      try {
        await LocalStorage.setItem(key, value);
        return;
      } catch (error) {
        this.isStorageAvailable = false;
      }
    }
    this.memoryStorage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (this.isStorageAvailable) {
      try {
        await LocalStorage.removeItem(key);
        return;
      } catch (error) {
        this.isStorageAvailable = false;
      }
    }
    this.memoryStorage.delete(key);
  }

  async clear(): Promise<void> {
    if (this.isStorageAvailable) {
      try {
        await LocalStorage.clear();
        return;
      } catch (error) {
        this.isStorageAvailable = false;
      }
    }
    this.memoryStorage.clear();
  }

  async allItems(): Promise<Record<string, string>> {
    if (this.isStorageAvailable) {
      try {
        return await LocalStorage.allItems();
      } catch (error) {
        this.isStorageAvailable = false;
      }
    }

    const items: Record<string, string> = {};
    for (const [key, value] of this.memoryStorage.entries()) {
      items[key] = value;
    }
    return items;
  }
}

export const storageAdapter = new StorageAdapter();
