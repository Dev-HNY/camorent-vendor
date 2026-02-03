/**
 * Authentication Service
 * Handles all vendor authentication related API calls
 */

import { apiClient, TokenManager } from './client';
import { API_ENDPOINTS } from '../../config/api';

// Request Types
export interface SignUpRequest {
  phone_number: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  GSTIN_no?: string;
  address?: string;
  work_experience?: string;
}

export interface ConfirmSignUpRequest {
  phone_number: string;
  confirmation_code: string;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface ResendCodeRequest {
  phone_number: string;
}

// Response Types
export interface VendorUserResponse {
  vendor_id: string;
  first_name?: string;
  last_name?: string;
  phone_number: string;
  email?: string;
  account_status: string;
  vendor_role: string;
  company_name?: string;
  GSTIN_no?: string;
  PAN_no?: string;
  address_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  confirmation_required: boolean;
  vendor_id?: string;
}

export interface ConfirmSignUpResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  vendor_user: VendorUserResponse;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Sign up new vendor user
   */
  async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    try {
      const response = await apiClient.post<SignUpResponse>(
        API_ENDPOINTS.VENDOR_AUTH.SIGNUP,
        data
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    }
  },

  /**
   * Confirm sign up with OTP/verification code
   */
  async confirmSignUp(data: ConfirmSignUpRequest): Promise<ConfirmSignUpResponse> {
    try {
      const response = await apiClient.post<ConfirmSignUpResponse>(
        API_ENDPOINTS.VENDOR_AUTH.CONFIRM_SIGNUP,
        data
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'OTP verification failed');
    }
  },

  /**
   * Login vendor user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.VENDOR_AUTH.LOGIN,
        data
      );

      if (response.error) {
        throw new Error(response.error);
      }

      const loginData = response.data!;

      // Store tokens
      if (loginData.id_token) {
        await TokenManager.setToken(loginData.id_token);
      }
      if (loginData.refresh_token) {
        await TokenManager.setRefreshToken(loginData.refresh_token);
      }

      return loginData;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  /**
   * Resend confirmation code
   */
  async resendCode(data: ResendCodeRequest): Promise<SignUpResponse> {
    try {
      const response = await apiClient.post<SignUpResponse>(
        API_ENDPOINTS.VENDOR_AUTH.RESEND_CODE,
        data
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Resend code failed');
    }
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<VendorUserResponse> {
    try {
      const response = await apiClient.get<VendorUserResponse>(
        API_ENDPOINTS.VENDOR_AUTH.ME,
        undefined,
        true // Requires authentication
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user profile');
    }
  },

  /**
   * Logout user (clear tokens)
   */
  async logout(): Promise<void> {
    await TokenManager.clearTokens();
  },

  /**
   * Send OTP to phone number for password reset (SMS)
   */
  async forgotPassword(data: { phone_number: string }): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.VENDOR_AUTH.FORGOT_PASSWORD,
        data,
        false // No auth required
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  /**
   * Verify OTP for password reset
   */
  async verifyResetOTP(data: { phone_number: string; otp: string }): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.VENDOR_AUTH.VERIFY_RESET_OTP,
        data,
        false // No auth required
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Invalid or expired OTP');
    }
  },

  /**
   * Request OTP for SMS-based signup (MessageCentral)
   */
  async signUpWithSMS(data: SignUpRequest): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.VENDOR_AUTH.SIGNUP_SMS_OTP,
        data,
        false // No auth required
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send signup OTP');
    }
  },

  /**
   * Verify OTP and complete SMS-based signup
   */
  async verifySignupOTP(data: SignUpRequest & { otp: string }): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.VENDOR_AUTH.VERIFY_SIGNUP_OTP,
        data,
        false // No auth required
      );

      if (response.error) {
        throw new Error(response.error);
      }

      const loginData = response.data!;

      // Store tokens (auto-login after signup)
      if (loginData.id_token) {
        await TokenManager.setToken(loginData.id_token);
      }
      if (loginData.refresh_token) {
        await TokenManager.setRefreshToken(loginData.refresh_token);
      }

      return loginData;
    } catch (error: any) {
      throw new Error(error.message || 'Signup verification failed');
    }
  },

  /**
   * Reset password with verified OTP token
   */
  async resetPassword(data: { phone_number: string; verification_token: string; new_password: string }): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.VENDOR_AUTH.RESET_PASSWORD,
        data,
        false // No auth required
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  },
};
