/**
 * Notification Sound and Vibration Utility
 * Handles playing notification sounds and haptic feedback for important events
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Sound instance
let notificationSound: Audio.Sound | null = null;
let isSoundLoaded = false;

/**
 * Initialize and load the notification sound
 */
export const initializeNotificationSound = async (): Promise<void> => {
  try {
    // Check if sound is already loaded
    if (isSoundLoaded && notificationSound) {
      return;
    }

    // Set audio mode to allow sound to play even when device is on silent
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Load the sound with proper error handling
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/notification_sound.wav'),
        {
          shouldPlay: false,
          isLooping: false,
          volume: 1.0,
        },
        null, // No status callback
        false // Don't download from network
      );

      notificationSound = sound;
      isSoundLoaded = true;
    } catch (loadError) {
      // Set flag to false so we don't keep trying to load
      isSoundLoaded = false;
      notificationSound = null;
    }
  } catch (error) {
    isSoundLoaded = false;
    notificationSound = null;
  }
};

/**
 * Unload the notification sound to free up memory
 */
export const unloadNotificationSound = async (): Promise<void> => {
  try {
    if (notificationSound) {
      await notificationSound.unloadAsync();
      notificationSound = null;
      isSoundLoaded = false;
    }
  } catch (error) {
    // Failed to unload notification sound - not critical
  }
};

/**
 * Play notification sound with haptic feedback
 * @param vibrationPattern - Optional custom vibration pattern
 */
export const playNotificationWithVibration = async (
  vibrationPattern: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium'
): Promise<void> => {
  try {
    // Play haptic feedback first for immediate response (always works)
    try {
      switch (vibrationPattern) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (hapticError) {
      // Haptic feedback failed - not critical
    }

    // Initialize sound if not already loaded (try once)
    if (!isSoundLoaded && notificationSound === null) {
      await initializeNotificationSound();
    }

    // Play the sound if available
    if (isSoundLoaded && notificationSound) {
      try {
        // Stop any currently playing sound
        const status = await notificationSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await notificationSound.stopAsync();
        }

        // Reset position and play
        await notificationSound.setPositionAsync(0);
        await notificationSound.playAsync();
      } catch (playError) {
        // Sound playback failed, but haptic already played so user still gets feedback
      }
    }
  } catch (error) {
    // Even if everything fails, don't crash - just skip the feedback
  }
};

/**
 * Play notification sound only (no vibration)
 */
export const playNotificationSound = async (): Promise<void> => {
  try {
    if (!isSoundLoaded && notificationSound === null) {
      await initializeNotificationSound();
    }

    if (isSoundLoaded && notificationSound) {
      const status = await notificationSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await notificationSound.stopAsync();
      }
      await notificationSound.setPositionAsync(0);
      await notificationSound.playAsync();
    }
  } catch (error) {
    // Failed to play notification sound - not critical
  }
};

/**
 * Stop the notification sound if playing
 */
export const stopNotificationSound = async (): Promise<void> => {
  try {
    if (notificationSound) {
      const status = await notificationSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await notificationSound.stopAsync();
      }
    }
  } catch (error) {
    // Failed to stop notification sound - not critical
  }
};

/**
 * Specific notification types for different events
 */

// New booking request received
export const playNewBookingNotification = async (): Promise<void> => {
  await playNotificationWithVibration('heavy');
};

// Booking status updated
export const playBookingUpdateNotification = async (): Promise<void> => {
  await playNotificationWithVibration('medium');
};

// Settlement request notification
export const playSettlementNotification = async (): Promise<void> => {
  await playNotificationWithVibration('success');
};

// Payment received notification
export const playPaymentReceivedNotification = async (): Promise<void> => {
  await playNotificationWithVibration('success');
};

// Order status change notification
export const playOrderStatusChangeNotification = async (): Promise<void> => {
  await playNotificationWithVibration('medium');
};

// Important alert/warning notification
export const playWarningNotification = async (): Promise<void> => {
  await playNotificationWithVibration('warning');
};

// Error notification
export const playErrorNotification = async (): Promise<void> => {
  await playNotificationWithVibration('error');
};

// Success notification (for confirmations, etc.)
export const playSuccessNotification = async (): Promise<void> => {
  await playNotificationWithVibration('success');
};
