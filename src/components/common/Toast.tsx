/**
 * Toast Notification System
 * Modern toast notifications with animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { theme } from '../../theme';
import { spacing, fontSize, borderRadius, scaleHeight } from '../../utils/responsive';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  position?: 'top' | 'bottom';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Toast Icons
const SuccessIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#22C55E" opacity="0.2" />
    <Path
      d="M9 12L11 14L15 10"
      stroke="#22C55E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#EF4444" opacity="0.2" />
    <Path
      d="M15 9L9 15M9 9L15 15"
      stroke="#EF4444"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#3B82F6" opacity="0.2" />
    <Path
      d="M12 16V12M12 8H12.01"
      stroke="#3B82F6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WarningIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#F59E0B" opacity="0.2" />
    <Path
      d="M12 8V12M12 16H12.01"
      stroke="#F59E0B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'info':
      return <InfoIcon />;
    case 'warning':
      return <WarningIcon />;
  }
};

const getColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '#22C55E';
    case 'error':
      return '#EF4444';
    case 'info':
      return '#3B82F6';
    case 'warning':
      return '#F59E0B';
  }
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  position = 'top',
}) => {
  const translateY = useSharedValue(position === 'top' ? -100 : SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show toast
      translateY.value = withSpring(position === 'top' ? 60 : SCREEN_HEIGHT - 120, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto hide
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
    return undefined;
  }, [visible]);

  const hideToast = () => {
    translateY.value = withTiming(
      position === 'top' ? -100 : SCREEN_HEIGHT,
      { duration: 250, easing: Easing.in(Easing.cubic) },
      () => {
        if (onHide) {
          runOnJS(onHide)();
        }
      }
    );
    opacity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const containerStyle = [
    styles.container,
    { borderLeftColor: getColor(type) },
    position === 'bottom' && styles.bottomPosition,
  ];

  return (
    <Animated.View style={[styles.toastWrapper, animatedStyle]}>
      <View style={containerStyle}>
        <View style={styles.iconContainer}>{getIcon(type)}</View>
        <Text style={styles.message} numberOfLines={3}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomPosition: {
    // Additional styles for bottom position if needed
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: '500',
    lineHeight: fontSize.md * 1.5,
  },
});
