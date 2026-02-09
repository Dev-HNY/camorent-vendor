/**
 * Token Manager
 * Handles secure storage and retrieval of authentication tokens
 * Extracted to avoid circular dependency between client.ts and tokenRefresh.ts
 */

import { SecureStorage } from '../../utils/secureStorage';
import { logger } from '../../utils/logger';

const TAG = 'TokenManager';

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Token management with secure storage
 */
export const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStorage.getItem(TOKEN_KEY);
    } catch (error) {
      logger.error(TAG, 'Error getting token', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      logger.error(TAG, 'Error setting token', error);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      logger.error(TAG, 'Error getting refresh token', error);
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      logger.error(TAG, 'Error setting refresh token', error);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await SecureStorage.deleteItems([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      logger.error(TAG, 'Error clearing tokens', error);
    }
  },
};
