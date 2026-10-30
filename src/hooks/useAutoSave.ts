import { useEffect, useCallback } from 'react';

/**
 * Custom hook for auto-saving data to localStorage
 * @param key - The localStorage key to save to
 * @param data - The data to save
 * @param debounceMs - Milliseconds to wait before saving (default: 1000)
 */
export function useAutoSave<T>(
  key: string,
  data: T,
  debounceMs: number = 1000
): void {
  useEffect(() => {
    // Set up a timeout to save after debounce period
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        // Optional: console log for debugging
        // console.log(`[AutoSave] Saved ${key} to localStorage`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to save ${key} to localStorage:`, error);
      }
    }, debounceMs);

    // Cleanup timeout if data changes before it executes
    return () => clearTimeout(timeoutId);
  }, [data, key, debounceMs]);
}

/**
 * Helper function to load data from localStorage
 * @param key - The localStorage key to load from
 * @param defaultValue - The default value if key doesn't exist
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Helper function to clear specific key from localStorage
 * @param key - The localStorage key to clear
 */
export function clearFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to clear ${key} from localStorage:`, error);
  }
}
