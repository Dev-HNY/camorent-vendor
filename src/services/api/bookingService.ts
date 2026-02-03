/**
 * Booking Service
 * Handles all vendor booking related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '../../config/api';

// Request Types
export interface CartItemData {
  sku_id: string;
  quantity: number; // 1-20
  addons?: string[]; // e.g., ['camocare']
}

export interface CrewItemData {
  crew_type_id: string;
  quantity: number; // 1-10
}

export interface CheckAvailabilityRequest {
  order_name: string;
  items: CartItemData[];
  crews?: CrewItemData[];
  rental_start_date: string; // YYYY-MM-DD
  rental_end_date: string; // YYYY-MM-DD
  coupon_codes?: string[];
}

export interface UpdateDeliveryRequest {
  delivery_option: 'delivery' | 'self_pickup';
  address_id: string;
}

// Response Types
export interface BookingItemResponse {
  sku_id: string;
  quantity: number;
  addons: string[];
  total_price: number;
}

export interface BookingCrewResponse {
  crew_type_id: string;
  crew_name: string;
  quantity: number;
  total_price: number;
}

export interface CheckAvailabilityResponse {
  vendor_booking_id: string;
  status: string;
  owner_vendor_id: string;
  owner_name: string;
  order_name: string;
  rental_start_date: string;
  rental_end_date: string;
  total_rental_days: number;
  sku_items: BookingItemResponse[];
  crew_items: BookingCrewResponse[];
  created_at: string;
  sku_amount: number;
  crew_amount: number;
  total_amount: number;
  advanced_amount: number;
  coupon_discount_amount: number;
  final_amount: number;
  applied_coupons: any[];
}

export interface VendorBookingListItem {
  vendor_booking_id: string;
  owner_vendor_id: string;
  owner_name: string;
  owner_company?: string;
  buyer_vendor_id?: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_company?: string;
  status: string;
  order_name: string;
  rating?: number;
  review?: string;
  rental_start_date: string;
  rental_end_date: string;
  total_rental_days?: number;
  total_amount: number;
  sku_list: string[];
  created_at: string;
  payment_status?: 'paid' | 'pending';
}

export interface BookingListResponse {
  data: VendorBookingListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface BookingDetailResponse {
  vendor_booking_id: string;
  status: string;
  order_name: string;
  owner_vendor_id: string;
  owner_name: string;
  owner_phone?: string;
  owner_company?: string;
  buyer_vendor_id?: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_company?: string;
  rating?: number;
  review?: string;
  rental_start_date: string;
  rental_end_date: string;
  total_rental_days: number;
  sku_items: any[];
  crew_items: any[];
  sku_amount: number;
  crew_amount: number;
  total_equipment_amount?: number;
  total_crew_amount?: number;
  coupon_discount_amount: number;
  advanced_amount: number;
  total_amount: number;
  final_amount: number;
  delivery_type?: string;
  address_id?: string;
  start_otp?: string;
  return_otp?: string;
  start_otp_verified_at?: string;
  return_otp_verified_at?: string;
  pickup_images?: string[];
  return_images?: string[];
  challan_url?: string;
  return_challan_url?: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialStatsResponse {
  success: boolean;
  total_revenue: number;
  amount_due: number;
  due_sign: number;
  completed_bookings_count: number;
}

export interface CheckOrderNameResponse {
  is_available: boolean;
  message: string;
}

export interface CamorentAdminResponse {
  vendor_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  company_name: string;
  GSTIN_no: string | null;
  vendor_role: string;
  is_verified: boolean;
  is_admin: boolean;
}

export interface AvailableOwnersResponse {
  owners: CamorentAdminResponse[];
  total: number;
}

/**
 * Response for owner's OTP endpoint
 * ONLY accessible by the equipment owner, not the vendor (buyer)
 */
export interface OwnerBookingOTPResponse {
  success: boolean;
  booking_id: string;
  status: string;
  pickup_otp: string | null;
  pickup_otp_verified: boolean;
  return_otp: string | null;
  return_otp_verified: boolean;
}

class BookingService {
  /**
   * Get CAMORENT admin vendor details
   * This endpoint doesn't require authentication
   */
  async getCamorentAdmin(): Promise<CamorentAdminResponse> {
    const response = await apiClient.get<CamorentAdminResponse>(
      API_ENDPOINTS.VENDOR_BOOKINGS.CAMORENT_ADMIN,
      undefined,
      false // No auth required
    );
    return response.data!;
  }

  /**
   * Get available equipment owners
   * - If current user is admin: returns all vendors
   * - If current user is regular vendor: returns only CAMORENT admin
   */
  async getAvailableOwners(): Promise<AvailableOwnersResponse> {
    const response = await apiClient.get<AvailableOwnersResponse>(
      API_ENDPOINTS.VENDOR_BOOKINGS.AVAILABLE_OWNERS,
      undefined,
      true // requiresAuth
    );
    return response.data!;
  }

  /**
   * Check if order name is unique
   */
  async checkOrderName(orderName: string): Promise<CheckOrderNameResponse> {
    const response = await apiClient.get<CheckOrderNameResponse>(
      `${API_ENDPOINTS.VENDOR_BOOKINGS.CHECK_ORDER_NAME}?order_name=${encodeURIComponent(orderName)}`,
      undefined,
      true // requiresAuth
    );
    return response.data!;
  }

  /**
   * Check availability and create booking in draft status
   */
  async checkAvailability(
    ownerVendorId: string,
    request: CheckAvailabilityRequest
  ): Promise<CheckAvailabilityResponse> {
    const response = await apiClient.post<CheckAvailabilityResponse>(
      API_ENDPOINTS.VENDOR_BOOKINGS.CHECK_AVAILABILITY(ownerVendorId),
      request,
      true // requiresAuth
    );
    return response.data!;
  }

  /**
   * Get all bookings for current vendor
   * @param role - 'buyer' (bookings created by vendor) or 'owner' (bookings for equipment owned by vendor)
   * @param exclude_completed - If true, excludes completed, cancelled, and rejected bookings (for active jobs view)
   */
  async getBookings(params: {
    page?: number;
    limit?: number;
    role?: 'buyer' | 'owner';
    exclude_completed?: boolean;
  }): Promise<BookingListResponse> {
    const response = await apiClient.get<BookingListResponse>(
      API_ENDPOINTS.VENDOR_BOOKINGS.LIST,
      params, // Pass params directly, not wrapped in another object
      true // requiresAuth
    );
    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch bookings');
    }
    return response.data;
  }

  /**
   * Get booking details by ID
   */
  async getBookingDetails(bookingId: string): Promise<BookingDetailResponse> {
    const response = await apiClient.get<BookingDetailResponse>(
      API_ENDPOINTS.VENDOR_BOOKINGS.DETAIL(bookingId),
      undefined,
      true // requiresAuth
    );
    return response.data!;
  }

  /**
   * Update delivery details for a booking
   */
  async updateDeliveryDetails(
    bookingId: string,
    request: UpdateDeliveryRequest
  ): Promise<any> {
    const response = await apiClient.put(
      API_ENDPOINTS.VENDOR_BOOKINGS.UPDATE_DELIVERY(bookingId),
      request,
      true // requiresAuth
    );
    return response.data;
  }

  /**
   * Approve a booking (owner only)
   */
  async approveBooking(bookingId: string): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.VENDOR_BOOKINGS.APPROVE(bookingId),
      undefined,
      true // requiresAuth
    );
    return response.data;
  }

  /**
   * Reject a booking (owner only)
   */
  async rejectBooking(bookingId: string): Promise<any> {
    const response = await apiClient.get(
      API_ENDPOINTS.VENDOR_BOOKINGS.REJECT(bookingId),
      undefined,
      true // requiresAuth
    );
    return response.data;
  }

  /**
   * Alias for getBookingDetails
   */
  async getBookingById(bookingId: string): Promise<BookingDetailResponse> {
    return this.getBookingDetails(bookingId);
  }

  /**
   * Update booking status (convenience method)
   * @param bookingId - The booking ID
   * @param status - New status: 'approved' or 'rejected'
   */
  async updateBookingStatus(
    bookingId: string,
    status: 'approved' | 'rejected'
  ): Promise<any> {
    if (status === 'approved') {
      return this.approveBooking(bookingId);
    } else if (status === 'rejected') {
      return this.rejectBooking(bookingId);
    }
    throw new Error(`Invalid status: ${status}`);
  }

  /**
   * Upload pickup images for a booking
   */
  async uploadPickupImages(bookingId: string, imageUris: string[]): Promise<any> {
    const formData = new FormData();

    // Add each image to form data
    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      const filename = uri.split('/').pop() || `image-${i}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('files', {
        uri,
        name: filename,
        type,
      } as any);
    }

    const response = await apiClient.post(
      API_ENDPOINTS.VENDOR_BOOKINGS.UPLOAD_PICKUP_IMAGES(bookingId),
      formData,
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to upload pickup images');
    }

    return response.data;
  }

  /**
   * Upload challan for a booking
   */
  async uploadChallan(bookingId: string, imageUri: string): Promise<any> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'challan.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post(
      API_ENDPOINTS.VENDOR_BOOKINGS.UPLOAD_CHALLAN(bookingId),
      formData,
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to upload challan');
    }

    return response.data;
  }

  /**
   * Confirm pickup for a booking
   */
  async confirmPickup(bookingId: string): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.VENDOR_BOOKINGS.CONFIRM_PICKUP(bookingId),
      {},
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to confirm pickup');
    }

    return response.data;
  }

  /**
   * Upload return challan for a booking
   */
  async uploadReturnChallan(bookingId: string, imageUri: string): Promise<any> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'return-challan.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post(
      API_ENDPOINTS.VENDOR_BOOKINGS.UPLOAD_RETURN_CHALLAN(bookingId),
      formData,
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to upload return challan');
    }

    return response.data;
  }

  /**
   * Upload return images for a booking
   */
  async uploadReturnImages(bookingId: string, imageUris: string[]): Promise<any> {
    const formData = new FormData();

    // Add each image to form data
    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      const filename = uri.split('/').pop() || `image-${i}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('files', {
        uri,
        name: filename,
        type,
      } as any);
    }

    const response = await apiClient.post(
      API_ENDPOINTS.VENDOR_BOOKINGS.UPLOAD_RETURN_IMAGES(bookingId),
      formData,
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to upload return images');
    }

    return response.data;
  }

  /**
   * Confirm return for a booking
   */
  async confirmReturn(bookingId: string): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.VENDOR_BOOKINGS.CONFIRM_RETURN(bookingId),
      {},
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to confirm return');
    }

    return response.data;
  }

  /**
   * Get financial statistics
   * Returns total revenue, amount due, and completed bookings count
   */
  async getFinancialStats(): Promise<FinancialStatsResponse> {
    const response = await apiClient.get<FinancialStatsResponse>(
      API_ENDPOINTS.VENDOR_BOOKINGS.FINANCIAL_STATS,
      undefined,
      true
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch financial stats');
    }

    return response.data;
  }

  /**
   * Request Pickup OTP - Sends OTP to customer's phone via SMS
   * Customer will tell the OTP to vendor for verification
   */
  async requestPickupOTP(bookingId: string): Promise<any> {
    const response = await apiClient.post(
      `/vendor/bookings/request-pickup-otp-new`,
      { booking_id: bookingId },
      true
    );

    if (response.error || !response.success) {
      throw new Error(response.error || 'Failed to request pickup OTP');
    }

    return response.data;
  }

  /**
   * Verify Pickup OTP - Verifies OTP and marks equipment as picked up
   * Status changes to 'in_progress'
   */
  async verifyPickupOTP(bookingId: string, otp: string): Promise<any> {
    const response = await apiClient.post(
      `/vendor/bookings/verify-pickup-otp-new`,
      { booking_id: bookingId, otp },
      true
    );

    if (response.error || !response.success) {
      throw new Error(response.error || 'Failed to verify pickup OTP');
    }

    return response.data;
  }

  /**
   * Request Return OTP - Sends OTP to customer's phone via SMS
   * Customer will tell the OTP to vendor for verification
   */
  async requestReturnOTP(bookingId: string): Promise<any> {
    const response = await apiClient.post(
      `/vendor/bookings/request-return-otp-new`,
      { booking_id: bookingId },
      true
    );

    if (response.error || !response.success) {
      throw new Error(response.error || 'Failed to request return OTP');
    }

    return response.data;
  }

  /**
   * Verify Return OTP - Verifies OTP and marks equipment as returned
   * Status changes to 'completed'
   */
  async verifyReturnOTP(bookingId: string, otp: string): Promise<any> {
    const response = await apiClient.post(
      `/vendor/bookings/verify-return-otp-new`,
      { booking_id: bookingId, otp },
      true
    );

    if (response.error || !response.success) {
      throw new Error(response.error || 'Failed to verify return OTP');
    }

    return response.data;
  }

  /**
   * Get OTP for a booking - ONLY accessible by OWNER
   * Owner sees this OTP on their request details screen and tells it to
   * the vendor (buyer) for pickup/return confirmation.
   */
  async getOwnerBookingOTP(bookingId: string): Promise<OwnerBookingOTPResponse> {
    const response = await apiClient.get<OwnerBookingOTPResponse>(
      `/vendor/bookings/owner/booking/${bookingId}/otp`,
      undefined, // no query params
      true // requiresAuth
    );

    if (response.error) {
      throw new Error(response.error || 'Failed to get OTP');
    }

    return response.data!;
  }
}

export const bookingService = new BookingService();
