/**
 * Environment Configuration
 * Centralized environment management for the app
 * Supports development, staging, and production environments
 */

import Constants from 'expo-constants';

// Environment types
type Environment = 'development' | 'staging' | 'production';

// Determine current environment
const getEnvironment = (): Environment => {
  // Check for environment variable from EAS build
  // @ts-ignore - process.env is available during build
  const appEnv = process.env.APP_ENV;

  if (appEnv === 'development') {
    return 'development';
  }

  // Check if running in development mode
  if (__DEV__) {
    return 'development';
  }

  // Check release channel or build configuration
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

  if (releaseChannel === 'staging') {
    return 'staging';
  }

  return 'production';
};

// Environment-specific configurations
const ENV_CONFIG = {
  development: {
    // IMPORTANT: Update this with your local backend IP address
    //
    // For Android Emulator: Use 'http://10.0.2.2:8000'
    // For Physical Device on same WiFi: Use your computer's IP 'http://192.168.1.31:8000'
    // Using ngrok tunnel (works for all devices): 'https://your-ngrok-url.ngrok-free.dev'
    // To find your IP:
    // - Windows: ipconfig (look for IPv4 Address)
    // - Mac/Linux: ifconfig (look for inet)
    API_BASE_URL: 'https://resplendent-chronometric-bridgett.ngrok-free.dev',
    API_TIMEOUT: 60000,
    ENABLE_LOGGING: true,
    ENABLE_CRASHLYTICS: false,
    ENABLE_ANALYTICS: false,
  },
  staging: {
    // Staging environment for testing before production
    API_BASE_URL:  'https://resplendent-chronometric-bridgett.ngrok-free.dev',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: true,
    ENABLE_CRASHLYTICS: true,
    ENABLE_ANALYTICS: true,
  },
  production: {
    // Production environment - MUST be updated before Play Store release
    // TODO: Replace with your actual production API URL
    API_BASE_URL:  'https://resplendent-chronometric-bridgett.ngrok-free.dev',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: false,
    ENABLE_CRASHLYTICS: true,
    ENABLE_ANALYTICS: true,
  },
};

// Current environment
export const CURRENT_ENV = getEnvironment();

// Get configuration for current environment
const getConfig = () => ENV_CONFIG[CURRENT_ENV];

// Export environment configuration
export const ENV = {
  // Current environment name
  ENV_NAME: CURRENT_ENV,
  IS_DEV: CURRENT_ENV === 'development',
  IS_STAGING: CURRENT_ENV === 'staging',
  IS_PROD: CURRENT_ENV === 'production',

  // API Configuration
  API_BASE_URL: getConfig().API_BASE_URL,
  API_TIMEOUT: getConfig().API_TIMEOUT,

  // Feature flags
  ENABLE_LOGGING: getConfig().ENABLE_LOGGING,
  ENABLE_CRASHLYTICS: getConfig().ENABLE_CRASHLYTICS,
  ENABLE_ANALYTICS: getConfig().ENABLE_ANALYTICS,

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
