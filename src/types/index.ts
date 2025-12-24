/**
 * Type Definitions
 * Centralized TypeScript types for type safety
 */

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface LogoProps {
  size?: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'vendor' | 'customer';
  createdAt: string;
}

// Equipment Types
export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerDay: number;
  images: string[];
  available: boolean;
  vendorId: string;
}

// Booking Types
export interface Booking {
  id: string;
  equipmentId: string;
  customerId: string;
  vendorId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface SignUpFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'vendor' | 'customer';
}

export interface SignInFormData {
  email: string;
  password: string;
}
