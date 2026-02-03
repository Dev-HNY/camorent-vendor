/**
 * Payment Settlement Service
 * Handles payment settlement operations for vendor bookings
 */

import { apiClient, TokenManager } from './client';
import { API_CONFIG } from '../../config/api';
import { logger } from '../../utils/logger';

const TAG = 'PaymentSettlementService';

// Types
export interface BookingOrderOption {
  vendor_booking_id: string;
  order_name: string | null;
  owner_name: string;
  owner_company?: string | null;
  total_amount: number;
  rental_start_date: string | null;
  rental_end_date: string | null;
  total_rental_days?: number | null;
  sku_items_count?: number | null;
  crew_items_count?: number | null;
  delivery_type?: string | null;
  payment_status: string;
}

export interface Settlement {
  settlement_id: string;
  vendor_booking_id: string;
  buyer_vendor_id: string;
  owner_vendor_id: string;
  amount: number;
  challan_image_url: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  order_name?: string | null;
  owner_name?: string | null;
  owner_company?: string | null;
  buyer_name?: string | null;
  buyer_company?: string | null;
  rental_start_date?: string | null;
  rental_end_date?: string | null;
  total_rental_days?: number | null;
  sku_items_count?: number | null;
  crew_items_count?: number | null;
  delivery_type?: string | null;
}

export interface CreateSettlementRequest {
  vendor_booking_id: string;
  notes?: string;
}

export interface ReviewSettlementRequest {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export const paymentSettlementService = {
  /**
   * Get available orders for settlement (completed bookings with pending payment)
   */
  async getAvailableOrders() {
    return apiClient.get<{ orders: BookingOrderOption[] }>(
      '/vendor/payment-settlements/available-orders',
      undefined,
      true
    );
  },

  /**
   * Create a new payment settlement request
   */
  async createSettlement(data: CreateSettlementRequest) {
    return apiClient.post<{
      settlement_id: string;
      vendor_booking_id: string;
      amount: number;
      status: string;
      created_at: string;
      message: string;
    }>('/vendor/payment-settlements', data, true);
  },

  /**
   * Upload challan image for a settlement
   */
  async uploadChallan(settlementId: string, file: {
    uri: string;
    type: string;
    name: string;
  }) {
    try {
      const token = await TokenManager.getToken();

      const formData = new FormData();
      formData.append('challan_image', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/vendor/payment-settlements/${settlementId}/upload-challan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        logger.error(TAG, 'Upload challan error', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        return {
          success: false,
          error: data.detail?.message || data.detail || data.message || 'Failed to upload challan',
        };
      }

      logger.debug(TAG, 'Upload challan success', data);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      logger.error(TAG, 'Upload challan exception', error);
      return {
        success: false,
        error: error.message || 'Failed to upload challan',
      };
    }
  },

  /**
   * Get settlement requests created by current vendor (buyer)
   */
  async getMySettlementRequests(statusFilter?: 'pending' | 'approved' | 'rejected') {
    return apiClient.get<{ settlements: Settlement[]; total_count: number }>(
      '/vendor/payment-settlements/my-requests',
      statusFilter ? { status_filter: statusFilter } : undefined,
      true
    );
  },

  /**
   * Get settlements that need approval (owner's view)
   */
  async getSettlementsToApprove(statusFilter?: 'pending' | 'approved' | 'rejected') {
    return apiClient.get<{ settlements: Settlement[]; total_count: number }>(
      '/vendor/payment-settlements/to-approve',
      statusFilter ? { status_filter: statusFilter } : undefined,
      true
    );
  },

  /**
   * Approve or reject a settlement request
   */
  async reviewSettlement(settlementId: string, data: ReviewSettlementRequest) {
    return apiClient.put<{
      settlement_id: string;
      status: string;
      reviewed_at: string;
      message: string;
    }>(`/vendor/payment-settlements/${settlementId}/review`, data, true);
  },
};
