/**
 * Premium Color System
 * Industry-standard color palette with semantic naming
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#F0F4FF',
    100: '#E0E8FF',
    200: '#C7D7FE',
    300: '#A4BCFD',
    400: '#8098F9',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Neutral Grays (Apple-inspired)
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#065F46',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#991B1B',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#92400E',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1E40AF',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    elevated: '#FFFFFF',
    inverse: '#1F2937',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    disabled: '#D1D5DB',
    inverse: '#FFFFFF',
    link: '#4F46E5',
  },

  // Border Colors
  border: {
    light: '#F3F4F6',
    medium: '#E5E7EB',
    strong: '#D1D5DB',
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    strong: 'rgba(0, 0, 0, 0.6)',
  },

  // Special Effects
  blur: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },

  // Gradients
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],
    secondary: ['#F59E0B', '#EF4444'],
    neutral: ['#F9FAFB', '#FFFFFF'],
  },
};

// Dark mode colors (for future implementation)
export const darkColors = {
  primary: {
    ...colors.primary,
  },
  neutral: {
    50: '#1A1A1A',
    100: '#2D2D2D',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#A3A3A3',
    600: '#D4D4D4',
    700: '#E5E5E5',
    800: '#F5F5F5',
    900: '#FAFAFA',
  },
  background: {
    primary: '#000000',
    secondary: '#1A1A1A',
    tertiary: '#2D2D2D',
    elevated: '#1A1A1A',
    inverse: '#FFFFFF',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A3A3A3',
    tertiary: '#737373',
    disabled: '#525252',
    inverse: '#000000',
    link: '#8B5CF6',
  },
  border: {
    light: '#2D2D2D',
    medium: '#404040',
    strong: '#525252',
  },
};
