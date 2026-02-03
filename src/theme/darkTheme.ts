/**
 * Dark Theme Configuration
 * Dark mode color scheme for Camorent
 */

import type { Theme } from './lightTheme';

export const darkTheme: Theme = {
  colors: {
    primary: '#7d84d4', // Lighter Camorent Purple for dark mode
    primaryDark: '#565caa',
    primaryLight: '#9fa4e6',

    background: {
      primary: '#1F1F1F', // Dark background
      secondary: '#2A2A2A', // Slightly lighter dark
      tertiary: '#363636', // Even lighter for cards
      elevated: '#2A2A2A',
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      tertiary: '#808080',
      inverse: '#000000',
    },

    border: {
      light: '#363636',
      medium: '#4A4A4A',
      dark: '#606060',
    },

    status: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },

    accent: {
      red: '#EF4444',
      pink: '#EC4899',
      purple: '#A78BFA',
      purpleLight: '#6D28D9',
      amber: '#F59E0B',
      amberLight: '#78350F',
      green: '#22C55E',
      greenLight: '#14532D',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  typography: {
    fontFamily: {
      regular: 'Geist-Regular',
      medium: 'Geist-Medium',
      semibold: 'Geist-SemiBold',
      bold: 'Geist-Bold',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
