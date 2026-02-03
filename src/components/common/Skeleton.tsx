/**
 * Skeleton Loader Component
 * Animated placeholder for loading states with shimmer effect
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'pulse' | 'shimmer';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  variant = 'shimmer',
}) => {
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [-1, 1], [-300, 300]);
    return {
      transform: [{ translateX }],
    };
  });

  if (variant === 'shimmer') {
    return (
      <View
        style={[
          styles.skeleton,
          {
            width,
            height,
            borderRadius,
          },
          style,
        ]}
      >
        <Animated.View style={[styles.shimmerWrapper, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmer}
          />
        </Animated.View>
      </View>
    );
  }

  // Pulse variant (original)
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        pulseStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  shimmerWrapper: {
    width: '100%',
    height: '100%',
  },
  shimmer: {
    width: 300,
    height: '100%',
  },
});
