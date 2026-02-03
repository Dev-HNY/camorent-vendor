/**
 * Address Service
 * Handles vendor address CRUD operations
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '../../config/api';

// ==================== Request/Response Types ====================

export interface CreateAddressRequest {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  type?: 'pickup' | 'delivery' | 'billing';
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  type?: 'pickup' | 'delivery' | 'billing';
  is_default?: boolean;
}

export interface AddressResponse {
  address_id: string;
  vendor_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== API Functions ====================

/**
 * Create a new address for the vendor
 */
export const createAddress = async (
  data: CreateAddressRequest
): Promise<AddressResponse> => {
  try {
    const response = await apiClient.post<AddressResponse>(
      API_ENDPOINTS.VENDOR_ADDRESS.CREATE,
      data,
      true // requiresAuth
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create address');
  }
};

/**
 * Get all addresses for the current vendor
 */
export const getAddresses = async (): Promise<AddressResponse[]> => {
  try {
    const response = await apiClient.get<AddressResponse[]>(
      API_ENDPOINTS.VENDOR_ADDRESS.LIST,
      undefined,
      true // requiresAuth
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch addresses');
  }
};

/**
 * Get a specific address by ID
 */
export const getAddress = async (addressId: string): Promise<AddressResponse> => {
  try {
    const response = await apiClient.get<AddressResponse>(
      API_ENDPOINTS.VENDOR_ADDRESS.DETAIL(addressId),
      undefined,
      true // requiresAuth
    );

    if (response.error) {
      if (response.error.includes('404') || response.error.includes('not found')) {
        throw new Error('Address not found');
      }
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch address');
  }
};

/**
 * Update an existing address
 */
export const updateAddress = async (
  addressId: string,
  data: UpdateAddressRequest
): Promise<AddressResponse> => {
  try {
    const response = await apiClient.put<AddressResponse>(
      API_ENDPOINTS.VENDOR_ADDRESS.UPDATE(addressId),
      data,
      true // requiresAuth
    );

    if (response.error) {
      if (response.error.includes('404') || response.error.includes('not found')) {
        throw new Error('Address not found');
      }
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update address');
  }
};

/**
 * Set an address as the default address
 */
export const setDefaultAddress = async (addressId: string): Promise<AddressResponse> => {
  try {
    const response = await apiClient.put<AddressResponse>(
      API_ENDPOINTS.VENDOR_ADDRESS.SET_DEFAULT(addressId),
      undefined,
      true // requiresAuth
    );

    if (response.error) {
      if (response.error.includes('404') || response.error.includes('not found')) {
        throw new Error('Address not found');
      }
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to set default address');
  }
};

/**
 * Get the current default address
 */
export const getDefaultAddress = async (): Promise<AddressResponse> => {
  try {
    const response = await apiClient.get<AddressResponse>(
      API_ENDPOINTS.VENDOR_ADDRESS.DEFAULT,
      undefined,
      true // requiresAuth
    );

    if (response.error) {
      if (response.error.includes('404') || response.error.includes('not found')) {
        throw new Error('No default address found. Please create an address first.');
      }
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch default address');
  }
};
