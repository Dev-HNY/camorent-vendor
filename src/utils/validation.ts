/**
 * Validation Utilities
 * Industry-grade input validation using Zod
 * Common validation functions for form inputs
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Phone number validation (Indian format)
 */
export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be 10 digits')
  .max(10, 'Phone number must be 10 digits')
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number');

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

/**
 * OTP validation (6 digits)
 */
export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

/**
 * Name validation
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

/**
 * GST number validation (Indian format)
 */
export const gstSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Please enter a valid GST number'
  );

/**
 * PAN number validation (Indian format)
 * Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
 */
export const panSchema = z
  .string()
  .length(10, 'PAN must be exactly 10 characters')
  .regex(
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    'Please enter a valid PAN number (e.g., ABCDE1234F)'
  );

/**
 * Date of Birth validation for PAN verification
 * Format: DD/MM/YYYY
 */
export const dobSchema = z
  .string()
  .regex(
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    'Please enter date in DD/MM/YYYY format'
  );

/**
 * Pincode validation (Indian format)
 */
export const pincodeSchema = z
  .string()
  .length(6, 'Pincode must be 6 digits')
  .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid pincode');

/**
 * Address validation
 */
export const addressSchema = z
  .string()
  .min(10, 'Address must be at least 10 characters')
  .max(200, 'Address must be less than 200 characters');

/**
 * Amount validation
 */
export const amountSchema = z
  .number()
  .positive('Amount must be greater than 0');

// ============================================================================
// Form Schemas
// ============================================================================

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
  phone: phoneSchema,
});

/**
 * OTP verification schema
 */
export const otpVerificationSchema = z.object({
  otp: otpSchema,
});

/**
 * Registration form schema
 */
export const registrationFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
  businessName: z.string().min(2, 'Business name is required'),
  gst: gstSchema.optional(),
  address: addressSchema.optional(),
  pincode: pincodeSchema.optional(),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  otp: otpSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Order name schema
 */
export const orderNameSchema = z.object({
  name: z
    .string()
    .min(3, 'Order name must be at least 3 characters')
    .max(50, 'Order name must be less than 50 characters'),
});

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate data against a schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}

/**
 * Validate a single field
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): string | null {
  const result = schema.safeParse(value);
  if (result.success) {
    return null;
  }
  return result.error.issues[0]?.message || 'Invalid value';
}

// ============================================================================
// Legacy Validation Functions (for backwards compatibility)
// ============================================================================

/**
 * Validates Indian phone number (10 digits)
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return phoneSchema.safeParse(phoneNumber).success;
};

/**
 * Validates Indian GSTIN number
 */
export const validateGSTIN = (gstin: string): boolean => {
  return gstSchema.safeParse(gstin.toUpperCase()).success;
};

/**
 * Get phone number validation error message
 */
export const getPhoneNumberError = (phoneNumber: string): string => {
  const result = phoneSchema.safeParse(phoneNumber);
  if (result.success) return '';
  return result.error.issues[0]?.message || 'Invalid phone number';
};

/**
 * Get GSTIN validation error message
 */
export const getGSTINError = (gstin: string): string => {
  if (!gstin) return 'GSTIN is required';
  const result = gstSchema.safeParse(gstin.toUpperCase());
  if (result.success) return '';
  return result.error.issues[0]?.message || 'Invalid GSTIN format';
};

/**
 * Validates if a string is not empty
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates name (only letters and spaces)
 */
export const validateName = (name: string): boolean => {
  return nameSchema.safeParse(name).success;
};

/**
 * Quick validation helpers
 */
export const isValidPhone = (phone: string): boolean =>
  phoneSchema.safeParse(phone).success;

export const isValidEmail = (email: string): boolean =>
  emailSchema.safeParse(email).success;

export const isValidOtp = (otp: string): boolean =>
  otpSchema.safeParse(otp).success;

export const isValidGst = (gst: string): boolean =>
  gstSchema.safeParse(gst).success;

export const isValidPan = (pan: string): boolean =>
  panSchema.safeParse(pan.toUpperCase()).success;

export const isValidDob = (dob: string): boolean =>
  dobSchema.safeParse(dob).success;

export const isValidPincode = (pincode: string): boolean =>
  pincodeSchema.safeParse(pincode).success;

/**
 * Validates Indian PAN number
 */
export const validatePAN = (pan: string): boolean => {
  return panSchema.safeParse(pan.toUpperCase()).success;
};

/**
 * Get PAN validation error message
 */
export const getPANError = (pan: string): string => {
  if (!pan) return 'PAN is required';
  const result = panSchema.safeParse(pan.toUpperCase());
  if (result.success) return '';
  return result.error.issues[0]?.message || 'Invalid PAN format';
};

/**
 * Get DOB validation error message
 */
export const getDOBError = (dob: string): string => {
  if (!dob) return 'Date of Birth is required';
  const result = dobSchema.safeParse(dob);
  if (result.success) return '';
  return result.error.issues[0]?.message || 'Invalid date format';
};
