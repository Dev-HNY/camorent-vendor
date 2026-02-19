/**
 * Token Refresh Logic
 * Handles automatic token refresh when access token expires
 */

import { API_CONFIG } from '../../config/api';
import { TokenManager } from './tokenManager';
import { logger } from '../../utils/logger';

const TAG = 'TokenRefresh';

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token
 */
export async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) {
        logger.warn(TAG, 'No refresh token available');
        await TokenManager.clearTokens();
        return false;
      }

      const phoneNumber = await TokenManager.getPhoneNumber();
      if (!phoneNumber) {
        logger.warn(TAG, 'No phone number stored, cannot refresh token');
        await TokenManager.clearTokens();
        return false;
      }

      logger.debug(TAG, 'Attempting to refresh access token');

      // Call refresh token endpoint — phone_number is required by the backend for SECRET_HASH
      const response = await fetch(`${API_CONFIG.BASE_URL}/vendors/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken, phone_number: phoneNumber }),
      });

      if (!response.ok) {
        logger.warn(TAG, 'Token refresh failed', { status: response.status });
        // If refresh fails with 401, clear tokens (refresh token expired)
        if (response.status === 401) {
          await TokenManager.clearTokens();
        }
        return false;
      }

      const data = await response.json();

      if (data.id_token && data.access_token) {
        await TokenManager.setToken(data.id_token);
        if (data.refresh_token) {
          await TokenManager.setRefreshToken(data.refresh_token);
        }
        logger.debug(TAG, 'Access token refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      logger.error(TAG, 'Token refresh error', error);
      await TokenManager.clearTokens();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
