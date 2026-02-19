/**
 * API Client
 * Fetch-based HTTP client with authentication and error handling
 * Uses SecureStorage for token management (industry-grade security)
 */

import { API_CONFIG, API_ERROR_MESSAGES } from '../../config/api';
import { logger } from '../../utils/logger';
import { TokenManager } from './tokenManager';
import { refreshAccessToken } from './tokenRefresh';
import { useUserStore } from '../../store/userStore';

const TAG = 'APIClient';

// API Response type
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Request configuration
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  isRetry?: boolean;
}

/**
 * Generic API request handler
 */
export async function apiRequest<T = any>(
  config: RequestConfig
): Promise<ApiResponse<T>> {
  const { method, url, data, params, headers = {}, requiresAuth = false } = config;

  try {
    // Build full URL
    const fullUrl = `${API_CONFIG.BASE_URL}${url}`;

    // Build query string
    let queryString = '';
    if (params) {
      queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    }

    const finalUrl = queryString ? `${fullUrl}?${queryString}` : fullUrl;

    // Debug logging (only in development)
    logger.api(method, finalUrl, params);

    // Check if data is FormData
    const isFormData = data instanceof FormData;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = await TokenManager.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
        logger.debug(TAG, 'Auth token added to request', { hasToken: true, tokenLength: token.length });
      } else {
        logger.warn(TAG, 'Auth required but no token found');
      }
    }

    // Prepare fetch options
    const options: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      if (isFormData) {
        options.body = data; // FormData is already in the right format
      } else {
        options.body = JSON.stringify(data);
      }
    }

    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(finalUrl, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response - handle both JSON and text responses
    let responseData: any;
    const contentType = response.headers.get('content-type');

    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // If not JSON, try to parse as text
        const textData = await response.text();
        logger.warn(TAG, 'Non-JSON response received', { contentType, preview: textData.substring(0, 100) });

        // Try to parse as JSON anyway (some servers don't set content-type correctly)
        try {
          responseData = JSON.parse(textData);
        } catch {
          // If still can't parse, return as error
          return {
            error: `Server returned invalid response: ${textData.substring(0, 100)}`,
            success: false,
          };
        }
      }
    } catch (parseError: any) {
      logger.error(TAG, 'Response parsing error', parseError);
      return {
        error: 'Failed to parse server response',
        success: false,
      };
    }

    // Handle HTTP errors
    if (!response.ok) {
      // If 401 Unauthorized and we have auth, try to refresh token and retry once
      if (response.status === 401 && requiresAuth && !config.isRetry) {
        logger.debug(TAG, 'Got 401, attempting token refresh');
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          logger.debug(TAG, 'Token refreshed, retrying request');
          // Retry the request with the new token
          return apiRequest<T>({ ...config, isRetry: true });
        } else {
          logger.warn(TAG, 'Token refresh failed, forcing logout');
          await TokenManager.clearTokens();
          // Signal the app to redirect to login — works from outside React components
          useUserStore.getState().forceLogout();
        }
      }

      return {
        error: responseData.detail?.message || responseData.message || API_ERROR_MESSAGES.SERVER_ERROR,
        data: responseData,
        success: false,
      };
    }

    // Return successful response
    return {
      data: responseData,
      success: true,
    };
  } catch (error: any) {
    logger.error(TAG, 'API Request Error', error);

    // Handle timeout
    if (error.name === 'AbortError') {
      return {
        error: API_ERROR_MESSAGES.TIMEOUT_ERROR,
        success: false,
      };
    }

    // Handle network error
    if (error.message === 'Network request failed') {
      return {
        error: API_ERROR_MESSAGES.NETWORK_ERROR,
        success: false,
      };
    }

    // Generic error
    return {
      error: error.message || API_ERROR_MESSAGES.UNKNOWN_ERROR,
      success: false,
    };
  }
}

/**
 * Convenience methods
 */
export const apiClient = {
  get: <T = any>(url: string, params?: any, requiresAuth = false) =>
    apiRequest<T>({ method: 'GET', url, params, requiresAuth }),

  post: <T = any>(url: string, data?: any, requiresAuth = false) =>
    apiRequest<T>({ method: 'POST', url, data, requiresAuth }),

  put: <T = any>(url: string, data?: any, requiresAuth = false) =>
    apiRequest<T>({ method: 'PUT', url, data, requiresAuth }),

  patch: <T = any>(url: string, data?: any, requiresAuth = false) =>
    apiRequest<T>({ method: 'PATCH', url, data, requiresAuth }),

  delete: <T = any>(url: string, requiresAuth = false) =>
    apiRequest<T>({ method: 'DELETE', url, requiresAuth }),
};
