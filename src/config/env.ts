/**
 * Environment Configuration
 * Production-only configuration for Camorent Vendor App
 */

import Constants from 'expo-constants';

// Production API Configuration
const PRODUCTION_CONFIG = {
  API_BASE_URL: 'https://api.camorent.co.in',
  API_TIMEOUT: 30000,
  ENABLE_LOGGING: __DEV__, // Enable logging only in development mode
  ENABLE_CRASHLYTICS: true,
  ENABLE_ANALYTICS: true,
};

// Export environment configuration
export const ENV = {
  // Environment name - always production
  ENV_NAME: 'production',
  IS_DEV: __DEV__,
  IS_PROD: true,

  // API Configuration
  API_BASE_URL: PRODUCTION_CONFIG.API_BASE_URL,
  API_TIMEOUT: PRODUCTION_CONFIG.API_TIMEOUT,

  // Feature flags
  ENABLE_LOGGING: PRODUCTION_CONFIG.ENABLE_LOGGING,
  ENABLE_CRASHLYTICS: PRODUCTION_CONFIG.ENABLE_CRASHLYTICS,
  ENABLE_ANALYTICS: PRODUCTION_CONFIG.ENABLE_ANALYTICS,

  // App Information
  APP_NAME: Constants.expoConfig?.name || 'Camorent Vendor',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  APP_SLUG: Constants.expoConfig?.slug || 'camorent-vendor',

  // Build Information
  BUILD_NUMBER: Constants.expoConfig?.ios?.buildNumber ||
                Constants.expoConfig?.android?.versionCode?.toString() ||
                '1',

  // Platform Information
  IS_EXPO_GO: Constants.appOwnership === 'expo',
  DEVICE_ID: Constants.sessionId,
};

// Helper to check if we should log
export const shouldLog = (): boolean => ENV.ENABLE_LOGGING || __DEV__;

// Helper to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${ENV.API_BASE_URL}${endpoint}`;
};

// Debug info for development
export const logEnvInfo = (): void => {
  if (__DEV__) {
    console.log('🔧 Environment Configuration:');
    console.log(`   Environment: ${ENV.ENV_NAME}`);
    console.log(`   API URL: ${ENV.API_BASE_URL}`);
    console.log(`   App Version: ${ENV.APP_VERSION}`);
    console.log(`   Logging: ${ENV.ENABLE_LOGGING ? 'Enabled' : 'Disabled'}`);
  }
};

export default ENV;
