/**
 * Notification Context
 * Manages notification badge counts and push notifications across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { userService } from '../services/api/userService';
import { notificationService } from '../services/notificationService';

export interface NotificationData {
  id?: string;
  title: string;
  body: string;
  type:
    | 'request'
    | 'settlement'
    | 'payment_settlement'
    | 'settlement_request'
    | 'general'
    | 'order_update'
    | 'status_change'
    | 'booking_approved'
    | 'booking_rejected'
    | 'booking_in_progress'
    | 'booking_completed'
    | 'booking_cancelled'
    | 'pickup_started'
    | 'return_started'
    | 'pickup_confirmed'
    | 'return_confirmed'
    | 'pickup_otp'
    | 'return_otp';
  data?: {
    bookingId?: string;
    booking_id?: string;
    settlementId?: string;
    settlement_id?: string;
    orderId?: string;
    status?: string;
    order_name?: string;
    otp?: string;
    recipient_role?: 'owner' | 'buyer' | 'vendor';  // Role of the notification recipient
    [key: string]: any;
  };
}

interface NotificationContextType {
  pendingRequestsCount: number;
  setPendingRequestsCount: (count: number) => void;
  pendingSettlementsCount: number;
  setPendingSettlementsCount: (count: number) => void;
  expoPushToken?: string;
  registerPushToken: () => Promise<void>;
  currentNotification: NotificationData | null;
  setCurrentNotification: (notification: NotificationData | null) => void;
  showNotificationModal: boolean;
  setShowNotificationModal: (show: boolean) => void;
  foregroundNotification: NotificationData | null;
  setForegroundNotification: (notification: NotificationData | null) => void;
  triggerTestNotification: (type: 'request' | 'settlement') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingSettlementsCount, setPendingSettlementsCount] = useState(0);
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [foregroundNotification, setForegroundNotification] = useState<NotificationData | null>(null);
  const { expoPushToken, notification } = usePushNotifications();

  // Initialize notification service channels on mount
  useEffect(() => {
    notificationService.initializeChannels().catch((error) => {
      console.error('Failed to initialize notification channels:', error);
    });
  }, []);

  // Function to register/update push token with backend
  const registerPushToken = async () => {
    if (expoPushToken) {
      try {
        console.log('Registering push token with backend:', expoPushToken);
        await userService.updateDeviceToken(expoPushToken);
        console.log('Push token registered successfully');
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    }
  };

  // Don't auto-register token - wait for explicit call after user is logged in
  // This prevents 404 errors when the user doesn't exist in DynamoDB yet
  useEffect(() => {
    if (expoPushToken) {
      console.log('Push token available:', expoPushToken);
      console.log('💡 Token will be registered after login/signup');
    } else {
      console.log('💡 Push notifications will be enabled when running in a development/production build');
    }
  }, [expoPushToken]);

  // Handle incoming notifications
  useEffect(() => {
    if (notification) {
      console.log('Received notification:', notification);

      // Parse notification data
      const notificationData = notification.request?.content;
      const data = notificationData?.data || {};

      // Determine notification type based on data
      let notificationType: NotificationData['type'] = 'general';

      // Check for specific notification types from backend
      if (data.type === 'booking_request' || data.type === 'new_booking_request') {
        notificationType = 'request';
        // Increment pending requests count for owners
        setPendingRequestsCount(prev => prev + 1);
      } else if (data.type === 'booking_approved') {
        notificationType = 'booking_approved';
      } else if (data.type === 'booking_rejected') {
        notificationType = 'booking_rejected';
      } else if (data.type === 'booking_in_progress') {
        notificationType = 'booking_in_progress';
      } else if (data.type === 'booking_completed' || data.type === 'return_completed') {
        notificationType = 'booking_completed';
      } else if (data.type === 'booking_cancelled') {
        notificationType = 'booking_cancelled';
      } else if (data.type === 'pickup_started') {
        notificationType = 'pickup_started';
      } else if (data.type === 'return_started') {
        notificationType = 'return_started';
      } else if (data.type === 'pickup_otp') {
        notificationType = 'pickup_otp';
      } else if (data.type === 'return_otp') {
        notificationType = 'return_otp';
      } else if (data.type === 'settlement' || data.type === 'payment_settlement' || data.type === 'settlement_request' || data.settlementId || data.settlement_id) {
        notificationType = 'settlement';
        // Increment pending settlements count
        setPendingSettlementsCount(prev => prev + 1);
      } else if (data.type === 'order_update') {
        notificationType = 'order_update';
      } else if (data.type === 'status_change') {
        notificationType = 'status_change';
      } else if (data.bookingId || data.booking_id) {
        // Default to order_update if bookingId present but no specific type
        notificationType = 'order_update';
      }

      // Set current notification and show modal
      const parsedNotification: NotificationData = {
        title: notificationData?.title || 'New Notification',
        body: notificationData?.body || '',
        type: notificationType,
        data: data,
      };

      setCurrentNotification(parsedNotification);
      setShowNotificationModal(true);
    }
  }, [notification]);

  // Manual test notification trigger (for development/testing in Expo Go)
  const triggerTestNotification = (type: 'request' | 'settlement') => {
    const testNotifications = {
      request: {
        title: 'New Pickup Request',
        body: 'John Doe wants to rent 3 cameras for 5 days',
        type: 'request' as const,
        data: {
          bookingId: 'test-booking-123',
          type: 'booking_request',
          customerName: 'John Doe',
          orderName: 'Film Shoot Project',
          totalAmount: 15000,
          rentalDays: 5,
        }
      },
      settlement: {
        title: 'Settlement Due',
        body: 'Payment of ₹25,000 pending for Order #789',
        type: 'settlement' as const,
        data: {
          settlementId: 'test-settlement-456',
          type: 'settlement',
          orderId: 'ORD-789',
          amount: 25000,
        }
      }
    };

    const notification = testNotifications[type];
    setCurrentNotification(notification);
    setShowNotificationModal(true);

    // Increment counts for testing
    if (type === 'request') {
      setPendingRequestsCount(prev => prev + 1);
    } else {
      setPendingSettlementsCount(prev => prev + 1);
    }

    console.log(`📱 Test ${type} notification triggered`);
  };

  return (
    <NotificationContext.Provider value={{
      pendingRequestsCount,
      setPendingRequestsCount,
      pendingSettlementsCount,
      setPendingSettlementsCount,
      expoPushToken,
      registerPushToken,
      currentNotification,
      setCurrentNotification,
      showNotificationModal,
      setShowNotificationModal,
      foregroundNotification,
      setForegroundNotification,
      triggerTestNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
