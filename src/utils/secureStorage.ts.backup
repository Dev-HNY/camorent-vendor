/**
 * Secure Storage Utility
 * Uses expo-secure-store for sensitive data (tokens, credentials)
 * Falls back to AsyncStorage for non-sensitive data
 * Industry-grade security for production apps
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { logger } from './logger';

const TAG = 'SecureStorage';

// SecureStore options for maximum security
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Check if SecureStore is available (not available on web or some simulators)
 */
const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    await SecureStore.getItemAsync('__test__');
    return true;
  } catch {
    return false;
  }
};

/**
 * Secure Storage for sensitive data like tokens
 */
export const SecureStorage = {
  /**
   * Set a secure item
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const isAvailable = await isSecureStoreAvailable();
      if (isAvailable) {
        await SecureStore.setItemAsync(key, value, SECURE_OPTIONS);
      } else {
        // Fallback to AsyncStorage with warning
        logger.warn(TAG, `SecureStore not available, using AsyncStorage for: ${key}`);
        await AsyncStorage.setItem(`__secure_${key}`, value);
      }
    } catch (error) {
      logger.error(TAG, `Failed to set secure item: ${key}`, error);
      throw error;
    }
  },

  /**
   * Get a secure item
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const isAvailable = await isSecureStoreAvailable();
      if (isAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(`__secure_${key}`);
      }
    } catch (error) {
      logger.error(TAG, `Failed to get secure item: ${key}`, error);
      return null;
    }
  },

  /**
   * Delete a secure item
   */
  async deleteItem(key: string): Promise<void> {
    try {
      const isAvailable = await isSecureStoreAvailable();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(`__secure_${key}`);
      }
    } catch (error) {
      logger.error(TAG, `Failed to delete secure item: ${key}`, error);
      throw error;
    }
  },

  /**
   * Delete multiple secure items
   */
  async deleteItems(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.deleteItem(key)));
    } catch (error) {
      logger.error(TAG, 'Failed to delete multiple secure items', error);
      throw error;
    }
  },
};

/**
 * Regular Storage for non-sensitive data
 * Uses AsyncStorage directly
 */
export const Storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logger.error(TAG, `Failed to set item: ${key}`, error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      logger.error(TAG, `Failed to get item: ${key}`, error);
      return null;
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error(TAG, `Failed to delete item: ${key}`, error);
      throw error;
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error(TAG, `Failed to set object: ${key}`, error);
      throw error;
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(TAG, `Failed to get object: ${key}`, error);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error(TAG, 'Failed to clear storage', error);
      throw error;
    }
  },

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      logger.error(TAG, 'Failed to get all keys', error);
      return [];
    }
  },
};

export default { SecureStorage, Storage };
