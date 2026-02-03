/**
 * Responsive utility functions for adaptive layouts
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale size based on screen width
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale size based on screen height
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale font size
 */
export const scaleFont = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scale - less aggressive scaling
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Get responsive spacing
 */
export const spacing = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(16),
  lg: scaleWidth(24),
  xl: scaleWidth(32),
  xxl: scaleWidth(48),
};

/**
 * Get responsive font sizes
 */
export const fontSize = {
  xs: scaleFont(10),
  sm: scaleFont(12),
  md: scaleFont(14),
  lg: scaleFont(16),
  xl: scaleFont(18),
  xxl: scaleFont(24),
  xxxl: scaleFont(32),
};

/**
 * Check if device is small (width < 375)
 */
export const isSmallDevice = SCREEN_WIDTH < 375;

/**
 * Check if device is large (width > 414)
 */
export const isLargeDevice = SCREEN_WIDTH > 414;

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
});

/**
 * Calculate percentage of screen width
 */
export const wp = (percentage: number): number => {
  return (percentage / 100) * SCREEN_WIDTH;
};

/**
 * Calculate percentage of screen height
 */
export const hp = (percentage: number): number => {
  return (percentage / 100) * SCREEN_HEIGHT;
};

/**
 * Responsive padding values - adapts to screen size
 */
export const responsivePadding = {
  container: {
    horizontal: isSmallDevice ? spacing.md : isLargeDevice ? spacing.xl : spacing.lg,
    vertical: isSmallDevice ? spacing.sm : isLargeDevice ? spacing.lg : spacing.md,
  },
  card: {
    all: isSmallDevice ? spacing.sm : spacing.md,
  },
  screen: {
    horizontal: spacing.md,
    vertical: spacing.sm,
    bottom: spacing.xxl * 2, // Extra padding for floating buttons
  },
};

/**
 * Responsive border radius
 */
export const borderRadius = {
  sm: scaleWidth(4),
  md: scaleWidth(8),
  lg: scaleWidth(12),
  xl: scaleWidth(16),
  xxl: scaleWidth(24),
  round: scaleWidth(100),
};

/**
 * Get safe area padding (for notched devices)
 */
export const getSafeAreaPadding = () => ({
  top: SCREEN_HEIGHT > 800 ? spacing.xl : spacing.lg,
  bottom: SCREEN_HEIGHT > 800 ? spacing.lg : spacing.md,
});
