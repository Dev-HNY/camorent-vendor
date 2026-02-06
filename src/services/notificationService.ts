/**
 * Enhanced Notification Service
 * Industry-grade notifications like Airbnb, Apple, Uber
 * Features: Sound, Vibration, Priority, Channels, Critical Alerts
 */

import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

// Optional: expo-av for sound (can be added later)
// import { Audio } from 'expo-av';

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  DEFAULT = 'default',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Notification types
export enum NotificationType {
  NEW_BOOKING_REQUEST = 'new_booking_request',
  BOOKING_APPROVED = 'booking_approved',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_IN_PROGRESS = 'booking_in_progress',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_CANCELLED = 'booking_cancelled',
  PICKUP_STARTED = 'pickup_started',
  RETURN_STARTED = 'return_started',
  PICKUP_CONFIRMED = 'pickup_confirmed',
  RETURN_CONFIRMED = 'return_confirmed',
  PICKUP_OTP = 'pickup_otp',
  RETURN_OTP = 'return_otp',
  PAYMENT_SETTLEMENT = 'payment_settlement',
  PICKUP_REMINDER = 'pickup_reminder',
  RETURN_REMINDER = 'return_reminder',
  PAYMENT_RECEIVED = 'payment_received',
  ORDER_CANCELLED = 'order_cancelled',
  GENERAL = 'general',
}

// Vibration patterns (milliseconds: [wait, vibrate, wait, vibrate, ...])
const VIBRATION_PATTERNS = {
  [NotificationType.NEW_BOOKING_REQUEST]: [0, 100, 50, 100, 50, 200], // Double tap + long
  [NotificationType.BOOKING_APPROVED]: [0, 50, 50, 50, 50, 50, 50, 50], // Triple short (celebration)
  [NotificationType.BOOKING_REJECTED]: [0, 300], // Single long
  [NotificationType.BOOKING_IN_PROGRESS]: [0, 100, 50, 100], // Double tap
  [NotificationType.BOOKING_COMPLETED]: [0, 50, 50, 50, 50, 50, 50, 50], // Triple short (celebration)
  [NotificationType.BOOKING_CANCELLED]: [0, 300], // Single long
  [NotificationType.PICKUP_STARTED]: [0, 100, 50, 100], // Double tap
  [NotificationType.RETURN_STARTED]: [0, 100, 50, 100], // Double tap
  [NotificationType.PICKUP_CONFIRMED]: [0, 50, 50, 50, 50, 50, 50, 50], // Triple short (celebration) - successful pickup
  [NotificationType.RETURN_CONFIRMED]: [0, 50, 50, 50, 50, 50, 50, 50], // Triple short (celebration) - successful return
  [NotificationType.PICKUP_OTP]: [0, 100, 50, 100, 50, 200], // Urgent - same as new booking
  [NotificationType.RETURN_OTP]: [0, 100, 50, 100, 50, 200], // Urgent - same as new booking
  [NotificationType.PAYMENT_SETTLEMENT]: [0, 200, 100, 200], // Double long
  [NotificationType.PICKUP_REMINDER]: [0, 150], // Single medium
  [NotificationType.RETURN_REMINDER]: [0, 150], // Single medium
  [NotificationType.PAYMENT_RECEIVED]: [0, 50, 50, 50, 50, 50, 50, 50], // Triple short (celebration)
  [NotificationType.ORDER_CANCELLED]: [0, 300], // Single long
  [NotificationType.GENERAL]: [0, 100], // Single short
};

// Haptic patterns for iOS
const HAPTIC_PATTERNS = {
  [NotificationType.NEW_BOOKING_REQUEST]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.BOOKING_APPROVED]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.BOOKING_REJECTED]: Haptics.NotificationFeedbackType.Error,
  [NotificationType.BOOKING_IN_PROGRESS]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.BOOKING_COMPLETED]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.BOOKING_CANCELLED]: Haptics.NotificationFeedbackType.Error,
  [NotificationType.PICKUP_STARTED]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.RETURN_STARTED]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.PICKUP_CONFIRMED]: Haptics.NotificationFeedbackType.Success, // Successful pickup confirmation
  [NotificationType.RETURN_CONFIRMED]: Haptics.NotificationFeedbackType.Success, // Successful return confirmation
  [NotificationType.PICKUP_OTP]: Haptics.NotificationFeedbackType.Warning, // Urgent attention needed
  [NotificationType.RETURN_OTP]: Haptics.NotificationFeedbackType.Warning, // Urgent attention needed
  [NotificationType.PAYMENT_SETTLEMENT]: Haptics.NotificationFeedbackType.Warning,
  [NotificationType.PICKUP_REMINDER]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.RETURN_REMINDER]: Haptics.NotificationFeedbackType.Warning,
  [NotificationType.PAYMENT_RECEIVED]: Haptics.NotificationFeedbackType.Success,
  [NotificationType.ORDER_CANCELLED]: Haptics.NotificationFeedbackType.Error,
  [NotificationType.GENERAL]: Haptics.NotificationFeedbackType.Success,
};

// Configure notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const priority = notification.request.content.data?.priority as NotificationPriority || NotificationPriority.DEFAULT;

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      // iOS specific
      shouldShowBanner: true,
      shouldShowList: true,
      // Android specific
      priority: priority === NotificationPriority.CRITICAL
        ? Notifications.AndroidNotificationPriority.MAX
        : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

class NotificationService {
  // private soundObject: Audio.Sound | null = null; // Commented out until expo-av is installed

  /**
   * Initialize Android notification channels (categories for notifications)
   * Similar to how Uber/Airbnb categorize notifications
   */
  async initializeChannels() {
    if (Platform.OS === 'android') {
      // Critical Alerts Channel - For urgent bookings
      await Notifications.setNotificationChannelAsync('critical', {
        name: 'Critical Alerts',
        description: 'Urgent booking requests and time-sensitive alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'notification.wav', // Custom sound
        enableVibrate: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Bypass Do Not Disturb for critical alerts
      });

      // Booking Requests Channel
      await Notifications.setNotificationChannelAsync('booking_requests', {
        name: 'Booking Requests',
        description: 'New pickup and rental requests',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 50, 100, 50, 200],
        lightColor: '#3B82F6',
        sound: 'notification.wav',
        enableVibrate: true,
        enableLights: true,
      });

      // Payment Settlements Channel
      await Notifications.setNotificationChannelAsync('payments', {
        name: 'Payments & Settlements',
        description: 'Payment settlements and transaction notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#10B981',
        sound: 'notification.wav',
        enableVibrate: true,
        enableLights: true,
      });

      // Reminders Channel
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        description: 'Pickup and return reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150],
        lightColor: '#F59E0B',
        sound: 'notification.wav',
        enableVibrate: true,
      });

      // General Channel
      await Notifications.setNotificationChannelAsync('general', {
        name: 'General Notifications',
        description: 'App updates and general information',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 100],
        sound: 'notification.wav',
        enableVibrate: true,
      });

    }
  }

  /**
   * Get the appropriate channel for notification type
   */
  private getChannel(type: NotificationType, priority: NotificationPriority): string {
    if (priority === NotificationPriority.CRITICAL) {
      return 'critical';
    }

    switch (type) {
      case NotificationType.NEW_BOOKING_REQUEST:
      case NotificationType.BOOKING_APPROVED:
      case NotificationType.BOOKING_REJECTED:
      case NotificationType.BOOKING_IN_PROGRESS:
      case NotificationType.BOOKING_COMPLETED:
      case NotificationType.PICKUP_STARTED:
      case NotificationType.RETURN_STARTED:
        return 'booking_requests';
      case NotificationType.PICKUP_OTP:
      case NotificationType.RETURN_OTP:
        return 'critical'; // OTP notifications are critical
      case NotificationType.PAYMENT_SETTLEMENT:
      case NotificationType.PAYMENT_RECEIVED:
        return 'payments';
      case NotificationType.PICKUP_REMINDER:
      case NotificationType.RETURN_REMINDER:
        return 'reminders';
      case NotificationType.BOOKING_CANCELLED:
      case NotificationType.ORDER_CANCELLED:
        return 'booking_requests'; // Use booking channel for cancellations
      default:
        return 'general';
    }
  }

  /**
   * Trigger haptic feedback based on notification type
   */
  private async triggerHaptics(type: NotificationType) {
    try {
      if (Platform.OS === 'ios') {
        const hapticType = HAPTIC_PATTERNS[type] || Haptics.NotificationFeedbackType.Success;
        await Haptics.notificationAsync(hapticType);
      } else if (Platform.OS === 'android') {
        const pattern = VIBRATION_PATTERNS[type] || [0, 100];
        Vibration.vibrate(pattern);
      }
    } catch {
      // Haptics not available - not critical
    }
  }

  /**
   * Show local notification with industry-grade features
   * @param title - Notification title
   * @param body - Notification body
   * @param type - Type of notification
   * @param data - Additional data payload
   * @param priority - Priority level
   */
  async showNotification(
    title: string,
    body: string,
    type: NotificationType = NotificationType.GENERAL,
    data: any = {},
    priority: NotificationPriority = NotificationPriority.DEFAULT
  ) {
    try {
      // Trigger haptic feedback
      await this.triggerHaptics(type);

      // Play sound (optional - notifications already play sound)
      // await this.playSound();

      const channelId = this.getChannel(type, priority);

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            type,
            priority,
          },
          sound: 'notification.wav',
          badge: 1,
          // iOS specific
          ...(Platform.OS === 'ios' && {
            interruptionLevel: priority === NotificationPriority.CRITICAL
              ? 'critical' as any  // Critical alerts bypass Focus modes
              : 'timeSensitive' as any, // Time sensitive - shows on lock screen
          }),
          // Android specific
          ...(Platform.OS === 'android' && {
            priority: priority === NotificationPriority.CRITICAL
              ? Notifications.AndroidNotificationPriority.MAX
              : Notifications.AndroidNotificationPriority.HIGH,
            vibrate: VIBRATION_PATTERNS[type],
            color: this.getNotificationColor(type),
            channelId,
          }),
        },
        trigger: null, // Show immediately
      });

    } catch {
      // Failed to show notification - not critical
    }
  }

  /**
   * Get notification color based on type (Android LED indicator)
   */
  private getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_BOOKING_REQUEST:
        return '#3B82F6'; // Blue
      case NotificationType.BOOKING_APPROVED:
      case NotificationType.BOOKING_COMPLETED:
        return '#10B981'; // Green (success)
      case NotificationType.BOOKING_REJECTED:
      case NotificationType.BOOKING_CANCELLED:
      case NotificationType.ORDER_CANCELLED:
        return '#EF4444'; // Red (error)
      case NotificationType.BOOKING_IN_PROGRESS:
      case NotificationType.PICKUP_STARTED:
      case NotificationType.RETURN_STARTED:
        return '#3B82F6'; // Blue (info)
      case NotificationType.PICKUP_OTP:
      case NotificationType.RETURN_OTP:
        return '#8B5CF6'; // Purple (security/verification)
      case NotificationType.PAYMENT_SETTLEMENT:
      case NotificationType.PAYMENT_RECEIVED:
        return '#10B981'; // Green
      case NotificationType.PICKUP_REMINDER:
      case NotificationType.RETURN_REMINDER:
        return '#F59E0B'; // Amber
      default:
        return '#565CAA'; // Brand color
    }
  }

  /**
   * Shorthand methods for specific notification types
   */

  async showNewBookingRequest(customerName: string, orderDetails: string, bookingId: string) {
    await this.showNotification(
      'New Pickup Request',
      `${customerName} wants to ${orderDetails}`,
      NotificationType.NEW_BOOKING_REQUEST,
      { bookingId, customerName },
      NotificationPriority.HIGH
    );
  }

  async showPaymentSettlement(amount: number, orderId: string, settlementId: string) {
    await this.showNotification(
      'Settlement Due',
      `Payment of ₹${amount.toLocaleString('en-IN')} pending for Order #${orderId}`,
      NotificationType.PAYMENT_SETTLEMENT,
      { amount, orderId, settlementId },
      NotificationPriority.HIGH
    );
  }

  async showSettlementRequest(vendorName: string, amount: number, orderName: string, settlementId: string) {
    await this.showNotification(
      'New Settlement Request',
      `${vendorName} submitted a settlement request for ₹${amount.toLocaleString('en-IN')} - ${orderName}`,
      NotificationType.PAYMENT_SETTLEMENT,
      { vendorName, amount, orderName, settlementId, settlement_id: settlementId, type: 'settlement_request' },
      NotificationPriority.HIGH
    );
  }

  async showPaymentReceived(amount: number, orderId: string) {
    await this.showNotification(
      'Payment Received',
      `₹${amount.toLocaleString('en-IN')} received for Order #${orderId}`,
      NotificationType.PAYMENT_RECEIVED,
      { amount, orderId },
      NotificationPriority.DEFAULT
    );
  }

  async showPickupReminder(orderName: string, timeRemaining: string, bookingId: string) {
    await this.showNotification(
      'Pickup Reminder',
      `${orderName} pickup due ${timeRemaining}`,
      NotificationType.PICKUP_REMINDER,
      { orderName, bookingId },
      NotificationPriority.DEFAULT
    );
  }

  async showReturnReminder(orderName: string, timeRemaining: string, bookingId: string) {
    await this.showNotification(
      'Return Reminder',
      `${orderName} return due ${timeRemaining}`,
      NotificationType.RETURN_REMINDER,
      { orderName, bookingId },
      NotificationPriority.DEFAULT
    );
  }

  async showOrderCancelled(orderName: string, reason: string) {
    await this.showNotification(
      'Order Cancelled',
      `${orderName} - ${reason}`,
      NotificationType.ORDER_CANCELLED,
      { orderName, reason },
      NotificationPriority.DEFAULT
    );
  }

  /**
   * Show booking approved notification
   */
  async showBookingApproved(orderName: string, bookingId: string) {
    await this.showNotification(
      'Booking Approved',
      `Your booking "${orderName}" has been approved!`,
      NotificationType.BOOKING_APPROVED,
      { orderName, bookingId, booking_id: bookingId },
      NotificationPriority.HIGH
    );
  }

  /**
   * Show booking rejected notification
   */
  async showBookingRejected(orderName: string, bookingId: string, reason?: string) {
    await this.showNotification(
      'Booking Rejected',
      reason ? `"${orderName}" - ${reason}` : `Your booking "${orderName}" was not approved`,
      NotificationType.BOOKING_REJECTED,
      { orderName, bookingId, booking_id: bookingId, reason },
      NotificationPriority.HIGH
    );
  }

  /**
   * Show booking in progress notification (pickup completed)
   */
  async showBookingInProgress(orderName: string, bookingId: string) {
    await this.showNotification(
      'Rental Started',
      `"${orderName}" pickup completed. Rental is now in progress`,
      NotificationType.BOOKING_IN_PROGRESS,
      { orderName, bookingId, booking_id: bookingId },
      NotificationPriority.DEFAULT
    );
  }

  /**
   * Show booking completed notification (return completed)
   */
  async showBookingCompleted(orderName: string, bookingId: string) {
    await this.showNotification(
      'Rental Completed',
      `"${orderName}" has been returned successfully`,
      NotificationType.BOOKING_COMPLETED,
      { orderName, bookingId, booking_id: bookingId },
      NotificationPriority.DEFAULT
    );
  }

  /**
   * Show booking cancelled notification
   */
  async showBookingCancelled(orderName: string, bookingId: string, reason?: string) {
    await this.showNotification(
      'Booking Cancelled',
      reason ? `"${orderName}" - ${reason}` : `Booking "${orderName}" has been cancelled`,
      NotificationType.BOOKING_CANCELLED,
      { orderName, bookingId, booking_id: bookingId, reason },
      NotificationPriority.DEFAULT
    );
  }

  /**
   * Show pickup started notification
   */
  async showPickupStarted(orderName: string, bookingId: string) {
    await this.showNotification(
      'Pickup Started',
      `Pickup process started for "${orderName}"`,
      NotificationType.PICKUP_STARTED,
      { orderName, bookingId, booking_id: bookingId },
      NotificationPriority.DEFAULT
    );
  }

  /**
   * Show return started notification
   */
  async showReturnStarted(orderName: string, bookingId: string) {
    await this.showNotification(
      'Return Started',
      `Return process started for "${orderName}"`,
      NotificationType.RETURN_STARTED,
      { orderName, bookingId, booking_id: bookingId },
      NotificationPriority.DEFAULT
    );
  }

  /**
   * Show pickup OTP notification - sent to owner when booking is approved
   */
  async showPickupOTP(orderName: string, otp: string, bookingId: string) {
    await this.showNotification(
      'Pickup OTP Generated',
      `Your OTP for "${orderName}" is: ${otp}. Share this with the vendor for pickup verification.`,
      NotificationType.PICKUP_OTP,
      { orderName, bookingId, booking_id: bookingId, otp, otp_type: 'pickup' },
      NotificationPriority.HIGH
    );
  }

  /**
   * Show return OTP notification - sent to owner when pickup is confirmed
   */
  async showReturnOTP(orderName: string, otp: string, bookingId: string) {
    await this.showNotification(
      'Return OTP Generated',
      `Your OTP for "${orderName}" is: ${otp}. Share this with the vendor for return verification.`,
      NotificationType.RETURN_OTP,
      { orderName, bookingId, booking_id: bookingId, otp, otp_type: 'return' },
      NotificationPriority.HIGH
    );
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
            allowCriticalAlerts: true, // iOS critical alerts
            allowProvisional: false,
          },
        });
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch {
      // Permission request failed - not critical
      return false;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Clear notification badge
   */
  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Set badge count
   */
  async setBadge(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }
}

export const notificationService = new NotificationService();
