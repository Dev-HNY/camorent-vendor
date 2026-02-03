/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for user interactions
 */

import * as Haptics from 'expo-haptics';

/**
 * Light impact - For subtle interactions like button taps
 */
export const lightImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Medium impact - For standard interactions like selections
 */
export const mediumImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Heavy impact - For important actions like confirmations
 */
export const heavyImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Success notification - For successful operations
 */
export const successNotification = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Warning notification - For warnings
 */
export const warningNotification = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Error notification - For errors
 */
export const errorNotification = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Selection changed - For picker/slider interactions
 */
export const selectionChanged = () => {
  Haptics.selectionAsync();
};

/**
 * Custom pattern - For unique interactions
 */
export const customPattern = async (pattern: number[]) => {
  for (const duration of pattern) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((resolve) => setTimeout(resolve, duration));
  }
};

/**
 * Double tap feedback
 */
export const doubleTap = async () => {
  await lightImpact();
  await new Promise((resolve) => setTimeout(resolve, 100));
  await lightImpact();
};

/**
 * Long press feedback
 */
export const longPress = () => {
  heavyImpact();
};
