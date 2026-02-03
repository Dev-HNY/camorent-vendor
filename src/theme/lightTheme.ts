/**
 * Light Theme Configuration
 * Light mode color scheme for Camorent
 */

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    border: {
      light: string;
      medium: string;
      dark: string;
    };
    status: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
    accent: {
      red: string;
      pink: string;
      purple: string;
      purpleLight: string;
      amber: string;
      amberLight: string;
      green: string;
      greenLight: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    fontWeight: {
      regular: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
      extrabold: '800';
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#565caa', // Camorent Purple
    primaryDark: '#3e4482',
    primaryLight: '#6d74c2',

    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      elevated: 'rgba(31, 31, 31, 0.95)',
    },

    text: {
      primary: '#000000',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },

    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#9CA3AF',
    },

    status: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },

    accent: {
      red: '#EF4444',
      pink: '#FFB6C1',
      purple: '#8B5CF6',
      purpleLight: '#EDE9FE',
      amber: '#F59E0B',
      amberLight: '#FEF3C7',
      green: '#22C55E',
      greenLight: '#DCFCE7',
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
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
