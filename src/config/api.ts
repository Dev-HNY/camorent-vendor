/**
 * API Configuration
 * Centralized API endpoint and configuration management
 */

import { ENV } from './env';

// API Configuration - Uses environment-based settings
export const API_CONFIG = {
  // Base URL from environment configuration
  BASE_URL: ENV.API_BASE_URL,

  // Timeout from environment configuration
  TIMEOUT: ENV.API_TIMEOUT,

  // API Version
  VERSION: 'v1',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Vendor Authentication
  VENDOR_AUTH: {
    SIGNUP: '/vendors/auth/signup',
    CONFIRM_SIGNUP: '/vendors/auth/confirm-signup',
    SIGNUP_SMS_OTP: '/vendors/auth/signup-sms-otp',
    VERIFY_SIGNUP_OTP: '/vendors/auth/verify-signup-otp',
    LOGIN: '/vendors/auth/login',
    REFRESH_TOKEN: '/vendors/auth/refresh-token',
    RESEND_CODE: '/vendors/auth/resend-code',
    ME: '/vendors/auth/me',
    FORGOT_PASSWORD: '/vendors/auth/forgot-password',
    VERIFY_RESET_OTP: '/vendors/auth/verify-reset-otp',
    RESET_PASSWORD: '/vendors/auth/reset-password',
  },

  // Vendor User
  VENDOR_USER: {
    PROFILE: '/vendors/me',
    UPDATE_PROFILE: '/vendors/me',
    UPDATE_DEVICE_TOKEN: '/vendors/me/device-token',
  },

  // Vendor Address
  VENDOR_ADDRESS: {
    CREATE: '/vendors/address',
    LIST: '/vendors/address',
    DETAIL: (addressId: string) => `/vendors/address/${addressId}`,
    UPDATE: (addressId: string) => `/vendors/address/${addressId}`,
    SET_DEFAULT: (addressId: string) => `/vendors/address/${addressId}/set-default`,
    DEFAULT: '/vendors/address/default/current',
  },

  // Vendor Bookings
  VENDOR_BOOKINGS: {
    CAMORENT_ADMIN: '/vendor/bookings/camorent-admin',
    AVAILABLE_OWNERS: '/vendor/bookings/available-owners',
    CHECK_ORDER_NAME: '/vendor/bookings/check-order-name',
    CHECK_AVAILABILITY: (ownerId: string) => `/vendor/bookings/${ownerId}/check-availability`,
    LIST: '/vendor/bookings',
    DETAIL: (bookingId: string) => `/vendor/bookings/${bookingId}`,
    UPDATE_DELIVERY: (bookingId: string) => `/vendor/bookings/${bookingId}/delivery`,
    APPROVE: (bookingId: string) => `/vendor/bookings/${bookingId}/approve`,
    REJECT: (bookingId: string) => `/vendor/bookings/${bookingId}/reject`,
    UPLOAD_PICKUP_IMAGES: (bookingId: string) => `/vendor/bookings/${bookingId}/upload-pickup-images`,
    UPLOAD_RETURN_IMAGES: (bookingId: string) => `/vendor/bookings/${bookingId}/upload-return-images`,
    UPLOAD_CHALLAN: (bookingId: string) => `/vendor/bookings/${bookingId}/upload-challan`,
    UPLOAD_RETURN_CHALLAN: (bookingId: string) => `/vendor/bookings/${bookingId}/upload-return-challan`,
    CONFIRM_PICKUP: (bookingId: string) => `/vendor/bookings/${bookingId}/confirm-pickup`,
    CONFIRM_RETURN: (bookingId: string) => `/vendor/bookings/${bookingId}/confirm-return`,
    FINANCIAL_STATS: '/vendor/bookings/financial-stats',
  },

  // Products/SKUs
  SKUS: {
    LIST: '/skus',
    DETAIL: (skuId: string) => `/skus/${skuId}`,
    CATEGORIES: '/skus/categories',
    CATEGORY_DETAIL: (categoryId: string) => `/skus/categories/${categoryId}`,
    SUBCATEGORIES: '/skus/subcategories',
    BRANDS: '/skus/brands',
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};
