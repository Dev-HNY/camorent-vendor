/**
 * Enhanced Touchable Component
 * Better touch feedback with animations and haptics
 */

import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { lightImpact, mediumImpact } from '../../utils/haptics';

interface TouchableProps {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  haptic?: 'light' | 'medium' | 'none';
  scaleEffect?: number;
  opacityEffect?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Touchable: React.FC<TouchableProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  disabled = false,
  haptic = 'light',
  scaleEffect = 0.95,
  opacityEffect = 0.7,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;

    // Haptic feedback
    if (haptic === 'light') {
      lightImpact();
    } else if (haptic === 'medium') {
      mediumImpact();
    }

    // Animation
    scale.value = withSpring(scaleEffect, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(opacityEffect, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;

    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedTouchable>
  );
};
