/**
 * Global Notification Handler
 * Displays push notification modals app-wide with haptic feedback
 */

import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AppState } from 'react-native';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from '../context/LanguageContext';
import { NotificationModal } from './common/NotificationModal';
import ForegroundNotificationBanner from './common/ForegroundNotificationBanner';
import {
  initializeNotificationSound,
  unloadNotificationSound,
  playNewBookingNotification,
  playBookingUpdateNotification,
  playSettlementNotification,
  playOrderStatusChangeNotification,
} from '../utils/notificationSound';

export const GlobalNotificationHandler: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentNotification,
    showNotificationModal,
    setShowNotificationModal,
    setCurrentNotification,
    foregroundNotification,
    setForegroundNotification,
  } = useNotification();

  // Initialize notification sound on mount
  useEffect(() => {
    initializeNotificationSound();

    return () => {
      // Cleanup on unmount
      unloadNotificationSound();
    };
  }, []);

  // Trigger sound and haptic feedback when notification appears
  useEffect(() => {
    if (currentNotification) {
      // Play appropriate notification sound based on type
      const playNotificationSound = async () => {
        switch (currentNotification.type) {
          case 'request':
            // New booking request - urgent sound
            await playNewBookingNotification();
            break;
          case 'settlement':
          case 'payment_settlement':
          case 'settlement_request':
            // Settlement notification
            await playSettlementNotification();
            break;
          case 'booking_approved':
          case 'booking_in_progress':
          case 'booking_completed':
            // Positive status changes
            await playBookingUpdateNotification();
            break;
          case 'booking_rejected':
          case 'booking_cancelled':
            // Negative status changes
            await playOrderStatusChangeNotification();
            break;
          case 'pickup_started':
          case 'return_started':
            // Pickup/return started
            await playBookingUpdateNotification();
            break;
          case 'pickup_otp':
          case 'return_otp':
            // OTP notification for owner - urgent sound
            await playNewBookingNotification();
            break;
          case 'order_update':
          case 'status_change':
            // Generic order updates
            await playOrderStatusChangeNotification();
            break;
          default:
            await playBookingUpdateNotification();
            break;
        }
      };

      playNotificationSound();
    }
  }, [currentNotification]);

  const handleClose = () => {
    setShowNotificationModal(false);
    // Clear notification after a delay
    setTimeout(() => {
      setCurrentNotification(null);
    }, 300);
  };

  const handlePrimaryAction = () => {
    if (!currentNotification) return;

    // Get bookingId and recipient role from notification data
    const bookingId = currentNotification.data?.bookingId || currentNotification.data?.booking_id;
    const recipientRole = currentNotification.data?.recipient_role;

    // Navigate based on notification type
    if (currentNotification.type === 'request' && bookingId) {
      // New booking request - always goes to request detail (owner receives these)
      router.push({
        pathname: '/request-detail',
        params: { bookingId: bookingId },
      });
    } else if ((currentNotification.type === 'pickup_otp' || currentNotification.type === 'return_otp') && bookingId) {
      // OTP notifications - owners go to request-detail to manage the booking
      router.push({
        pathname: '/request-detail',
        params: { bookingId: bookingId },
      });
    } else if (currentNotification.type === 'settlement' || currentNotification.type === 'payment_settlement' || currentNotification.type === 'settlement_request') {
      // Settlement notification - go to settle-payment (settle-requests tab)
      const settlementId = currentNotification.data?.settlementId || currentNotification.data?.settlement_id;
      if (settlementId) {
        router.push({
          pathname: '/(tabs)/settle-payment',
          params: { settlementId: settlementId, fromNotification: 'true' },
        });
      } else {
        router.push({
          pathname: '/(tabs)/settle-payment',
          params: { fromNotification: 'true' },
        });
      }
    } else if (bookingId) {
      // For OTHER booking notifications - route based on recipient role
      // Owner → request-detail (to see requests/approvals)
      // Buyer/Vendor (requestor) → order-detail (to see their orders)
      const isOwner = recipientRole === 'owner';

      router.push({
        pathname: isOwner ? '/request-detail' : '/order-detail',
        params: { bookingId: bookingId },
      });
    }

    handleClose();
  };

  const handleSecondaryAction = () => {
    // Just dismiss the notification
    handleClose();
  };

  const getPrimaryActionText = () => {
    if (!currentNotification) return t.notifications.view_details;

    const recipientRole = currentNotification.data?.recipient_role;
    const isOwner = recipientRole === 'owner';

    switch (currentNotification.type) {
      case 'request':
        return t.notifications.view_request || 'View Request';
      case 'pickup_otp':
      case 'return_otp':
        // OTP notifications are for owners to manage requests
        return t.notifications.view_request || 'View Request';
      case 'settlement':
      case 'payment_settlement':
      case 'settlement_request':
        return t.notifications.view_settlement || 'View Settlement';
      case 'booking_approved':
      case 'booking_rejected':
      case 'booking_in_progress':
      case 'booking_completed':
      case 'booking_cancelled':
      case 'pickup_started':
      case 'return_started':
        // Owners see "View Request", Buyers see "View Order"
        return isOwner
          ? (t.notifications.view_request || 'View Request')
          : (t.notifications.view_order || 'View Order');
      default:
        return t.notifications.view_details || 'View Details';
    }
  };

  const handleBannerTap = () => {
    // When banner is tapped, show full modal
    if (foregroundNotification) {
      setCurrentNotification(foregroundNotification);
      setShowNotificationModal(true);
      setForegroundNotification(null);
    }
  };

  const handleBannerDismiss = () => {
    setForegroundNotification(null);
  };

  // Show foreground banner when app is active (not the modal)
  useEffect(() => {
    if (currentNotification && AppState.currentState === 'active') {
      // If app is in foreground, show banner instead of modal initially
      setForegroundNotification({
        ...currentNotification,
        id: currentNotification.id || `notif-${Date.now()}`,
      });
    }
  }, [currentNotification]);

  return (
    <>
      <ForegroundNotificationBanner
        notification={foregroundNotification}
        onDismiss={handleBannerDismiss}
        onTap={handleBannerTap}
        autoDismissDelay={5000}
      />
      <NotificationModal
        visible={showNotificationModal}
        onClose={handleClose}
        notification={currentNotification}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
        primaryActionText={getPrimaryActionText()}
        secondaryActionText={t.notifications.dismiss}
      />
    </>
  );
};
