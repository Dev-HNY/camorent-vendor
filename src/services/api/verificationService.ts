/**
 * Verification Service
 * GST verification API calls
 */

import { apiClient } from './client';

// ==================== Request/Response Types ====================

export interface GSTVerifyRequest {
  gstin: string;
}

export interface GSTVerifyResponse {
  gstin: string | null;
  legal_name: string;
  trade_name: string;
  registration_date: string;
  status: string;
  type: string;
  business_constitution: string;
  taxpayer_type: string;
  gstin_status: string;
  filing_status: string[];
  center_jurisdiction: string;
  state_jurisdiction: string;
  principal_place_of_business: {
    address: string;
    state: string;
    pincode: string;
  };
  cached: boolean;
  verified_at: string;
}


// ==================== API Functions ====================

/**
 * Verify GST number for vendors
 * Automatically validates GSTIN and returns business details
 */
export const verifyGST = async (gstin: string): Promise<GSTVerifyResponse> => {
  try {
    const response = await apiClient.post<GSTVerifyResponse>(
      '/verifications/vendor/gstin',
      { gstin: gstin.trim().toUpperCase() },
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
    throw new Error(error.message || 'Failed to verify GST number');
  }
};


/**
 * Check health of verification service
 */
export const checkVerificationHealth = async (): Promise<{
  status: string;
  provider_base_url: string;
  cache_enabled: boolean;
}> => {
  try {
    const response = await apiClient.get<{
      status: string;
      provider_base_url: string;
      cache_enabled: boolean;
    }>(
      '/verifications/health',
      undefined,
      false // requiresAuth
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data!;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to check verification service health');
  }
};
