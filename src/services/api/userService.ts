/**
 * User Service
 * Handles vendor user profile and device token management
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '../../config/api';

export interface VendorUserProfile {
  vendor_id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  GSTIN_no?: string;
  PAN_no?: string;
  device_token?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateDeviceTokenRequest {
  device_token: string;
}

export interface UpdateVendorProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  company_name?: string;
  GSTIN_no?: string;
  PAN_no?: string;
}

class UserService {
  /**
   * Get current vendor user profile
   */
  async getProfile(): Promise<VendorUserProfile> {
    const response = await apiClient.get<VendorUserProfile>(
      API_ENDPOINTS.VENDOR_USER.PROFILE,
      undefined,
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to get profile');
    }

    return response.data;
  }

  /**
   * Update device token for push notifications
   */
  async updateDeviceToken(deviceToken: string): Promise<any> {
    const response = await apiClient.put(
      API_ENDPOINTS.VENDOR_USER.UPDATE_DEVICE_TOKEN,
      { device_token: deviceToken },
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to update device token');
    }

    return response.data;
  }

  /**
   * Update vendor profile (including GST/PAN)
   */
  async updateProfile(updates: UpdateVendorProfileRequest): Promise<VendorUserProfile> {
    const response = await apiClient.patch<VendorUserProfile>(
      '/vendors/me',
      updates,
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to update profile');
    }

    return response.data;
  }
}

export const userService = new UserService();
