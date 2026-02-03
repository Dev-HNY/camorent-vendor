/**
 * Animated Badge Component
 * Reusable badge with pop, pulse, and glow animations
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedBadgeProps {
  count: number;
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showGlow?: boolean;
  triggerAnimation?: boolean; // Set to true when count changes
}

const sizeConfig = {
  small: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    fontSize: 10,
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  medium: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    fontSize: 11,
    paddingHorizontal: 5,
    borderWidth: 2.5,
  },
  large: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    fontSize: 12,
    paddingHorizontal: 6,
    borderWidth: 3,
  },
};

export function AnimatedBadge({
  count,
  backgroundColor = '#EF4444',
  textColor = '#FFFFFF',
  size = 'medium',
  style,
  showGlow = true,
  triggerAnimation = false,
}: AnimatedBadgeProps) {
  const badgeScale = useSharedValue(1);
  const badgePulse = useSharedValue(0);

  const config = sizeConfig[size];

  // Trigger animations when count changes
  useEffect(() => {
    if (count > 0 && triggerAnimation) {
      // Badge pop animation
      badgeScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      // Continuous pulse for badge
      badgePulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [count, triggerAnimation]);

  // Animated badge style
  const badgeStyle = useAnimatedStyle(() => {
    const scale = badgeScale.value;
    const pulseScale = interpolate(badgePulse.value, [0, 1], [1, 1.15]);

    return {
      transform: [{ scale: scale * pulseScale }],
    };
  });

  // Badge glow style
  const badgeGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(badgePulse.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    const scale = interpolate(badgePulse.value, [0, 1], [1, 1.4]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  if (count === 0) return null;

  return (
    <>
      {/* Glowing pulse ring */}
      {showGlow && (
        <Animated.View
          style={[
            styles.badgeGlow,
            {
              backgroundColor,
              width: config.minWidth + 4,
              height: config.height + 4,
              borderRadius: config.borderRadius + 2,
            },
            badgeGlowStyle,
            style,
          ]}
        />
      )}

      {/* Main badge */}
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor,
            minWidth: config.minWidth,
            height: config.height,
            borderRadius: config.borderRadius,
            paddingHorizontal: config.paddingHorizontal,
            borderWidth: config.borderWidth,
          },
          badgeStyle,
          style,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: textColor,
              fontSize: config.fontSize,
            },
          ]}
        >
          {count > 99 ? '99+' : count}
        </Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  badgeGlow: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
