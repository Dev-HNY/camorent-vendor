/**
 * Notification Modal Component
 * Industry-grade modal for displaying push notifications with actions
 * Airbnb/Apple inspired design with haptic feedback
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Premium Request Icon with Gradient
const RequestIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <RadialGradient id="requestGrad" cx="50%" cy="30%">
        <Stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
        <Stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="28" fill="url(#requestGrad)" opacity="0.15" />
    <Path
      d="M24 14H18C16.3431 14 15 15.3431 15 17V47C15 48.6569 16.3431 50 18 50H46C47.6569 50 49 48.6569 49 47V17C49 15.3431 47.6569 14 46 14H40M24 14C24 16.2091 25.7909 18 28 18H36C38.2091 18 40 16.2091 40 14M24 14C24 11.7909 25.7909 10 28 10H36C38.2091 10 40 11.7909 40 14M32 30H42M32 40H42M24 30H24.03M24 40H24.03"
      stroke="#3B82F6"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Premium Settlement Icon with Gradient
const SettlementIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <RadialGradient id="settlementGrad" cx="50%" cy="30%">
        <Stop offset="0%" stopColor="#34D399" stopOpacity="1" />
        <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="28" fill="url(#settlementGrad)" opacity="0.15" />
    <Path
      d="M32 8V56M44 16H26C24.4087 16 22.8826 16.6321 21.7574 17.7574C20.6321 18.8826 20 20.4087 20 22C20 23.5913 20.6321 25.1174 21.7574 26.2426C22.8826 27.3679 24.4087 28 26 28H38C39.5913 28 41.1174 28.6321 42.2426 29.7574C43.3679 30.8826 44 32.4087 44 34C44 35.5913 43.3679 37.1174 42.2426 38.2426C41.1174 39.3679 39.5913 40 38 40H20"
      stroke="#10B981"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Success/Check Icon (for approvals, completions)
const SuccessIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <RadialGradient id="successGrad" cx="50%" cy="30%">
        <Stop offset="0%" stopColor="#34D399" stopOpacity="1" />
        <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="28" fill="url(#successGrad)" opacity="0.15" />
    <Path
      d="M18 32L26 40L46 20"
      stroke="#10B981"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Error/X Icon (for rejections, cancellations)
const ErrorIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <RadialGradient id="errorGrad" cx="50%" cy="30%">
        <Stop offset="0%" stopColor="#F87171" stopOpacity="1" />
        <Stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="28" fill="url(#errorGrad)" opacity="0.15" />
    <Path
      d="M22 22L42 42M42 22L22 42"
      stroke="#EF4444"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Package/Box Icon (for pickups, returns)
const PackageIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <RadialGradient id="packageGrad" cx="50%" cy="30%">
        <Stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
        <Stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="28" fill="url(#packageGrad)" opacity="0.15" />
    <Path
      d="M42 20L22 20C20.3431 20 19 21.3431 19 23V41C19 42.6569 20.3431 44 22 44H42C43.6569 44 45 42.6569 45 41V23C45 21.3431 43.6569 20 42 20Z"
      stroke="#3B82F6"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 28H45M32 28V44"
      stroke="#3B82F6"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Lock/Security Icon (for OTP notifications)
const LockIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <RadialGradient id="lockGrad" cx="50%" cy="30%">
        <Stop offset="0%" stopColor="#A78BFA" stopOpacity="1" />
        <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="28" fill="url(#lockGrad)" opacity="0.15" />
    <Path
      d="M46 28H18C16.3431 28 15 29.3431 15 31V46C15 47.6569 16.3431 49 18 49H46C47.6569 49 49 47.6569 49 46V31C49 29.3431 47.6569 28 46 28Z"
      stroke="#8B5CF6"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 28V20C22 17.3478 23.0536 14.8043 24.9289 12.9289C26.8043 11.0536 29.3478 10 32 10C34.6522 10 37.1957 11.0536 39.0711 12.9289C40.9464 14.8043 42 17.3478 42 20V28"
      stroke="#8B5CF6"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Rocket/Start Icon (for rental started)
const RocketIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <RadialGradient id="rocketGrad" cx="50%" cy="30%">
        <Stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
        <Stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    <Circle cx="32" cy="32" r="28" fill="url(#rocketGrad)" opacity="0.15" />
    <Path
      d="M32 15C32 15 42 20 42 32C42 32 42 42 32 49C32 49 22 42 22 32C22 20 32 15 32 15Z"
      stroke="#3B82F6"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="32" cy="28" r="3" fill="#3B82F6" />
    <Path
      d="M20 38L16 42L22 48L26 44"
      stroke="#3B82F6"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Premium Close Icon
const CloseIcon = ({ size = 24, color = '#6B7280' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface NotificationData {
  id?: string | undefined;
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

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notification: NotificationData | null;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionText?: string;
  secondaryActionText?: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notification,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionText = 'View',
  secondaryActionText = 'Dismiss',
}) => {
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scale = useSharedValue(0.9);
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Trigger haptics and vibration
  const triggerFeedback = () => {
    try {
      // Haptic feedback for iOS
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Vibration pattern for Android - Airbnb style
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 100, 50, 100]); // Pattern: wait, vibrate, wait, vibrate
      }
    } catch (error) {
      // Haptics not available - not critical
    }
  };

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropOpacity.value = 0;
      translateY.value = SCREEN_HEIGHT;
      scale.value = 0.9;
      iconScale.value = 0;
      iconRotation.value = -180;
      glowOpacity.value = 0;
      pulseScale.value = 1;

      // Trigger haptic feedback
      runOnJS(triggerFeedback)();

      // Entrance animations with spring physics (Apple/Airbnb style)
      backdropOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 180,
        mass: 1,
      });

      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 200,
        mass: 0.8,
      });

      // Icon entrance animation - pop and rotate
      iconScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 300 }),
          withSpring(1, { damping: 12, stiffness: 300 })
        )
      );

      iconRotation.value = withDelay(
        200,
        withSpring(0, {
          damping: 15,
          stiffness: 150,
        })
      );

      // Glow effect
      glowOpacity.value = withDelay(
        300,
        withSequence(
          withTiming(0.6, { duration: 400 }),
          withTiming(0.3, { duration: 600 })
        )
      );

      // Continuous subtle pulse on icon
      pulseScale.value = withDelay(
        600,
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        )
      );

    } else {
      // Exit animations
      backdropOpacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });

      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 25,
        stiffness: 200,
      });

      scale.value = withTiming(0.9, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value * pulseScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onClose();
  };

  const handlePrimaryAction = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    if (onPrimaryAction) {
      onPrimaryAction();
    }
    handleClose();
  };

  const handleSecondaryAction = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      handleClose();
    }
  };

  const getNotificationIcon = () => {
    switch (notification?.type) {
      case 'request':
        return <RequestIcon size={64} />;
      case 'pickup_otp':
      case 'return_otp':
        return <LockIcon size={64} />;
      case 'settlement':
      case 'payment_settlement':
      case 'settlement_request':
        return <SettlementIcon size={64} />;
      case 'booking_approved':
      case 'booking_completed':
      case 'pickup_confirmed':
      case 'return_confirmed':
        return <SuccessIcon size={64} />;
      case 'booking_in_progress':
        return <RocketIcon size={64} />;
      case 'pickup_started':
      case 'return_started':
        return <PackageIcon size={64} />;
      case 'booking_rejected':
      case 'booking_cancelled':
        return <ErrorIcon size={64} />;
      case 'order_update':
      case 'status_change':
        return <RequestIcon size={64} />;
      default:
        return <RequestIcon size={64} />;
    }
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    const isDark = themeMode === 'dark';
    switch (notification?.type) {
      case 'request':
      case 'pickup_otp':
      case 'return_otp':
        return isDark
          ? ['#1E3A8A', '#3B82F6', '#60A5FA'] as const
          : ['#3B82F6', '#60A5FA', '#93C5FD'] as const;
      case 'settlement':
        return isDark
          ? ['#065F46', '#10B981', '#34D399'] as const
          : ['#10B981', '#34D399', '#6EE7B7'] as const;
      case 'booking_approved':
      case 'booking_in_progress':
      case 'booking_completed':
      case 'pickup_started':
      case 'return_started':
      case 'pickup_confirmed':
      case 'return_confirmed':
        return isDark
          ? ['#065F46', '#10B981', '#34D399'] as const
          : ['#10B981', '#34D399', '#6EE7B7'] as const;
      case 'booking_rejected':
      case 'booking_cancelled':
        return isDark
          ? ['#7F1D1D', '#EF4444', '#F87171'] as const
          : ['#EF4444', '#F87171', '#FCA5A5'] as const;
      default:
        return [theme.colors.primary, theme.colors.primary] as const;
    }
  };

  const getPrimaryButtonColor = (): readonly [string, string] => {
    switch (notification?.type) {
      case 'request':
      case 'pickup_otp':
      case 'return_otp':
        return ['#3B82F6', '#2563EB'] as const;
      case 'settlement':
        return ['#10B981', '#059669'] as const;
      case 'booking_approved':
      case 'booking_in_progress':
      case 'booking_completed':
      case 'pickup_started':
      case 'return_started':
      case 'pickup_confirmed':
      case 'return_confirmed':
        return ['#10B981', '#059669'] as const;
      case 'booking_rejected':
      case 'booking_cancelled':
        return ['#EF4444', '#DC2626'] as const;
      default:
        return [theme.colors.primary, theme.colors.primaryDark] as const;
    }
  };

  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Backdrop with Blur */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} style={StyleSheet.absoluteFill}>
              <Animated.View style={[styles.backdrop, backdropStyle]} />
            </BlurView>
          ) : (
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          )}
        </TouchableOpacity>

        {/* Notification Card */}
        <View style={styles.cardContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: theme.colors.background.primary },
              { marginBottom: Math.max(20, insets.bottom + 12) },
              cardStyle,
            ]}
          >
            {/* Animated Gradient Glow Background */}
            <Animated.View style={[styles.glowContainer, glowStyle]}>
              <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glow}
              />
            </Animated.View>

            {/* Top Accent Bar */}
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topAccent}
            />

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.background.secondary }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <CloseIcon color={theme.colors.text.tertiary} size={20} />
            </TouchableOpacity>

            {/* Icon Container with Animation */}
            <View style={styles.iconWrapper}>
              <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                {getNotificationIcon()}
              </Animated.View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                {notification.title}
              </Text>

              <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
                {notification.body}
              </Text>

              {/* Premium Pill Info (if available) */}
              {notification.data && (notification.data.totalAmount || notification.data.amount) && (
                <View style={[styles.infoPill, { backgroundColor: theme.colors.background.tertiary }]}>
                  <Text style={[styles.infoPillLabel, { color: theme.colors.text.tertiary }]}>
                    {notification.type === 'settlement' ? t.notifications.amount_due : t.notifications.total_amount}
                  </Text>
                  <Text style={[styles.infoPillValue, { color: theme.colors.text.primary }]}>
                    ₹{(notification.data.totalAmount || notification.data.amount)?.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* Secondary Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    {
                      borderColor: theme.colors.border.medium,
                      backgroundColor: theme.colors.background.secondary,
                    },
                  ]}
                  onPress={handleSecondaryAction}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.text.primary }]}>
                    {secondaryActionText}
                  </Text>
                </TouchableOpacity>

                {/* Primary Button with Gradient */}
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handlePrimaryAction}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={getPrimaryButtonColor()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={styles.primaryButtonText}>{primaryActionText}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Safe Area (for devices with notch) */}
            <View style={styles.bottomSafeArea} />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
  },
  glowContainer: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 300,
  },
  glow: {
    flex: 1,
    opacity: 0.15,
  },
  topAccent: {
    height: 5,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '400',
  },
  infoPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoPillLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoPillValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  bottomSafeArea: {
    height: Platform.OS === 'ios' ? 8 : 0,
  },
});
