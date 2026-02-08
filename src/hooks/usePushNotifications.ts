/**
 * Push Notifications Hook
 * Handles Expo push notification registration and token management
 * Works seamlessly in both Expo Go and development/production builds
 */

import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Notifications, isAvailable as isNotificationsAvailable } from '../utils/notificationLoader';

// Configure notification handler if module is available
if (isNotificationsAvailable && Notifications?.setNotificationHandler) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async (notification: any) => {
        // ⭐ DON'T SHOW IF ALREADY ON TARGET SCREEN - Prevents notification spam
        try {
          const notificationData = notification.request?.content?.data;
          const notificationType = notificationData?.type;
          const targetScreen = notificationData?.screen;

          // Get current route segments
          const segments = (router as any).state?.routes?.[0]?.state?.routes || [];
          const currentRoute = segments[segments.length - 1]?.name || '';

          // Check if we're already on the target screen
          let isOnTargetScreen = false;

          if (targetScreen) {
            isOnTargetScreen = currentRoute.includes(targetScreen);
          } else if (notificationType === 'settlement' || notificationType === 'payment_settlement' || notificationType === 'settlement_request') {
            isOnTargetScreen = currentRoute.includes('settle-payment');
          } else if (notificationType === 'request' || notificationType === 'new_booking_request' || notificationType === 'pickup_otp' || notificationType === 'return_otp') {
            isOnTargetScreen = currentRoute.includes('request-detail');
          } else if (notificationData?.bookingId || notificationData?.booking_id) {
            // Check if on order-detail or request-detail
            isOnTargetScreen = currentRoute.includes('detail');
          }

          // Don't show notification if already on target screen
          if (isOnTargetScreen) {
            return {
              shouldShowAlert: false,
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: false,
              shouldShowList: false,
            };
          }
        } catch (error) {
          // Route checking failed - show notification anyway
        }

        // Show notification normally
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
  } catch {
    // Handler setup failed - not critical
  }
}

export interface PushNotificationState {
  expoPushToken?: string;
  notification?: any;
}

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<any>();

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  async function registerForPushNotificationsAsync() {
    // If notifications module isn't available, skip registration
    if (!isNotificationsAvailable || !Notifications) {
      return undefined;
    }

    let token;

    try {
      // Try to set up Android notification channel
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        } catch {
          // Channel setup failed - not critical
        }
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return undefined;
      }

      // Try to get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      if (!projectId) {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
      }

      return token;
    } catch {
      return undefined;
    }
  }

  useEffect(() => {
    // Only attempt registration if module is available
    if (!isNotificationsAvailable || !Notifications) {
      return;
    }

    // Register for push notifications
    registerForPushNotificationsAsync()
      .then((token) => {
        setExpoPushToken(token);
      })
      .catch(() => {
        // Registration failed - not critical
      });

    // Set up notification listeners
    try {
      if (Notifications?.addNotificationReceivedListener) {
        notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
          setNotification(notification);
          // OTP notifications are handled by GlobalNotificationHandler via NotificationContext
          // which provides a better, translated modal experience
        });
      }

      if (Notifications?.addNotificationResponseReceivedListener) {
        responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response: any) => {
          // ⭐ DISMISS NOTIFICATION AFTER TAP - Prevents duplicate notifications
          const notificationId = response.notification?.request?.identifier;
          if (notificationId && Notifications?.dismissNotificationAsync) {
            try {
              await Notifications.dismissNotificationAsync(notificationId);
            } catch (error) {
              // Failed to dismiss notification - not critical
            }
          }

          // Extract notification data
          const notificationData = response.notification?.request?.content?.data;
          const notificationType = notificationData?.type;
          const bookingId = notificationData?.booking_id || notificationData?.bookingId;
          const recipientRole = notificationData?.recipient_role;

          // Navigate based on notification type
          // For settlement requests, navigate to settle payment approve page (settle-requests tab)
          if (notificationType === 'settlement' || notificationType === 'payment_settlement' || notificationType === 'settlement_request') {
            const settlementId = notificationData?.settlement_id || notificationData?.settlementId;
            if (settlementId) {
              router.push(`/(tabs)/settle-payment?settlementId=${encodeURIComponent(settlementId)}&fromNotification=true`);
            } else {
              router.push('/(tabs)/settle-payment?fromNotification=true');
            }
          }
          // For booking-related notifications with bookingId
          else if (bookingId) {
            // For OTP notifications (owner receives these), navigate to request-detail
            if (notificationType === 'pickup_otp' || notificationType === 'return_otp') {
              router.push(`/request-detail?bookingId=${encodeURIComponent(bookingId)}`);
            }
            // For new booking requests (owner receives these), navigate to request-detail
            else if (notificationType === 'new_booking' || notificationType === 'request' || notificationType === 'booking_request' || notificationType === 'new_booking_request') {
              router.push(`/request-detail?bookingId=${encodeURIComponent(bookingId)}`);
            }
            // For other booking notifications, route based on role
            // Owner → request-detail, Buyer/Vendor → order-detail
            else {
              const isOwner = recipientRole === 'owner';
              const path = isOwner ? '/request-detail' : '/order-detail';
              router.push(`${path}?bookingId=${encodeURIComponent(bookingId)}`);
            }
          }
        });
      }
    } catch {
      // Listener setup failed - not critical
    }

    return () => {
      try {
        if (notificationListener.current?.remove) {
          notificationListener.current.remove();
        }
        if (responseListener.current?.remove) {
          responseListener.current.remove();
        }
      } catch {
        // Cleanup failed - not critical
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
