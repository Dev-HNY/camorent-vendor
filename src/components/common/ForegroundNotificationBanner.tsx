import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface NotificationData {
  id?: string;
  title: string;
  body: string;
  type?: string;
  data?: any;
}

interface ForegroundNotificationBannerProps {
  notification: NotificationData | null;
  onDismiss: () => void;
  onTap: () => void;
  autoDismissDelay?: number;
}

const BANNER_HEIGHT = 90;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 1,
};

export default function ForegroundNotificationBanner({
  notification,
  onDismiss,
  onTap,
  autoDismissDelay = 5000,
}: ForegroundNotificationBannerProps) {
  const { theme } = useTheme();
  const translateY = useSharedValue(-BANNER_HEIGHT);
  const opacity = useSharedValue(0);

  const getIconName = (type?: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'new_booking_request':
        return 'calendar';
      case 'payment_settlement':
      case 'payment_received':
        return 'cash';
      case 'pickup_reminder':
        return 'arrow-up-circle';
      case 'return_reminder':
        return 'arrow-down-circle';
      case 'order_cancelled':
        return 'close-circle';
      default:
        return 'notifications';
    }
  };

  const getBackgroundColor = (type?: string): string => {
    switch (type) {
      case 'new_booking_request':
        return theme.colors.primary;
      case 'payment_settlement':
      case 'payment_received':
        return '#10B981'; // Green
      case 'pickup_reminder':
        return '#F59E0B'; // Amber
      case 'return_reminder':
        return '#3B82F6'; // Blue
      case 'order_cancelled':
        return '#EF4444'; // Red
      default:
        return theme.colors.primary;
    }
  };

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-BANNER_HEIGHT, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  }, [onDismiss, translateY, opacity]);

  useEffect(() => {
    if (notification) {
      // Trigger haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Slide in
      translateY.value = withSpring(0, SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: 300 });

      // Auto dismiss after delay
      const timer = setTimeout(() => {
        dismiss();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notification, autoDismissDelay, dismiss, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismiss();
    onTap();
  }, [dismiss, onTap]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismiss();
  }, [dismiss]);

  if (!notification) return null;

  const iconName = getIconName(notification.type);
  const backgroundColor = getBackgroundColor(notification.type);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={styles.pressableContainer}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="default" style={styles.blurContainer}>
            <View style={[styles.content, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
              <View style={[styles.iconContainer, { backgroundColor }]}>
                <Ionicons name={iconName} size={24} color="#FFFFFF" />
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={[styles.body, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                  {notification.body}
                </Text>
              </View>

              <Pressable onPress={handleDismiss} style={styles.closeButton} hitSlop={8}>
                <Ionicons name="close" size={20} color={theme.colors.text.secondary} />
              </Pressable>
            </View>
          </BlurView>
        ) : (
          <View style={[styles.content, styles.androidContent, {
            backgroundColor: '#FFFFFF',
            borderBottomColor: theme.colors.border.light,
          }]}>
            <View style={[styles.iconContainer, { backgroundColor }]}>
              <Ionicons name={iconName} size={24} color="#FFFFFF" />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={[styles.body, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                {notification.body}
              </Text>
            </View>

            <Pressable onPress={handleDismiss} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={20} color={theme.colors.text.secondary} />
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  pressableContainer: {
    width: '100%',
  },
  blurContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
    gap: 12,
  },
  androidContent: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  body: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});
