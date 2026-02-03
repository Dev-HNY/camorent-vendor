/**
 * Premium Typography System
 * Apple & Airbnb-inspired typography scale
 */

import { TextStyle } from 'react-native';
import { scaleFont } from '../utils/responsive';

export const typography = {
  // Display - For hero sections
  displayLarge: {
    fontSize: scaleFont(48),
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: scaleFont(56),
    letterSpacing: -1.5,
  },
  displayMedium: {
    fontSize: scaleFont(40),
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: scaleFont(48),
    letterSpacing: -1,
  },
  displaySmall: {
    fontSize: scaleFont(32),
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: scaleFont(40),
    letterSpacing: -0.5,
  },

  // Headline - For page titles
  headlineLarge: {
    fontSize: scaleFont(28),
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: scaleFont(36),
    letterSpacing: -0.3,
  },
  headlineMedium: {
    fontSize: scaleFont(24),
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: scaleFont(32),
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: scaleFont(20),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(28),
    letterSpacing: 0,
  },

  // Title - For section headers
  titleLarge: {
    fontSize: scaleFont(18),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(26),
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: scaleFont(16),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(24),
    letterSpacing: 0.1,
  },
  titleSmall: {
    fontSize: scaleFont(14),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(20),
    letterSpacing: 0.1,
  },

  // Body - For content
  bodyLarge: {
    fontSize: scaleFont(16),
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: scaleFont(24),
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontSize: scaleFont(14),
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: scaleFont(20),
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: scaleFont(12),
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: scaleFont(16),
    letterSpacing: 0.4,
  },

  // Label - For buttons & labels
  labelLarge: {
    fontSize: scaleFont(14),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(20),
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: scaleFont(12),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(16),
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: scaleFont(11),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(16),
    letterSpacing: 0.5,
  },

  // Caption - For metadata
  caption: {
    fontSize: scaleFont(10),
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: scaleFont(14),
    letterSpacing: 0.4,
  },

  // Overline - For labels
  overline: {
    fontSize: scaleFont(10),
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: scaleFont(16),
    letterSpacing: 1.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
};

// Font families (customize based on your fonts)
export const fontFamilies = {
  regular: 'Geist-Regular',
  medium: 'Geist-Medium',
  semiBold: 'Geist-SemiBold',
  bold: 'Geist-Bold',
};
