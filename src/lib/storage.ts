/**
 * Storage abstraction layer for localStorage
 * Provides type-safe access to browser storage with consistent key naming
 */

export const StorageKeys = {
  SESSION_ID: 'session_id',
  PREMIUM_UNLOCKED: 'premium_unlocked',
  GDPR_ACCEPTANCE: 'gdpr_acceptance',
  APP_AUTHENTICATED: 'app_authenticated',
  COOKIE_CONSENT: 'cookie_consent',
  THEME: 'theme',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

/**
 * Get item from localStorage
 */
export const getStorageItem = (key: StorageKey): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get item from storage: ${key}`, error);
    return null;
  }
};

/**
 * Set item in localStorage
 */
export const setStorageItem = (key: StorageKey, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to set item in storage: ${key}`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: StorageKey): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove item from storage: ${key}`, error);
  }
};

/**
 * Get boolean value from localStorage
 */
export const getStorageBoolean = (key: StorageKey): boolean => {
  return getStorageItem(key) === 'true';
};

/**
 * Set boolean value in localStorage
 */
export const setStorageBoolean = (key: StorageKey, value: boolean): void => {
  setStorageItem(key, value ? 'true' : 'false');
};

/**
 * Clear all app-related items from localStorage
 * Note: This does not clear chat-storage (Zustand persist)
 */
export const clearAppStorage = (): void => {
  Object.values(StorageKeys).forEach(key => {
    removeStorageItem(key);
  });
};

/**
 * Clear ALL localStorage data (use with caution)
 */
export const clearAllStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear all storage', error);
  }
};
