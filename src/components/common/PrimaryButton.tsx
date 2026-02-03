/**
 * Primary Button Component
 * Enhanced button with loading states, animations, and consistent styling
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../theme';
import { scaleWidth, scaleHeight, fontSize } from '../../utils/responsive';
import { lightImpact } from '../../utils/haptics';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    lightImpact(); // Haptic feedback
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.02, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.button,
    styles[`${size}Button`],
    styles[`${variant}Button`],
    isDisabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.9}
      style={[animatedStyle, buttonStyles]}
      accessible={true}
      accessibilityLabel={loading ? `${title}, loading` : title}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      accessibilityHint={disabled ? 'Button is disabled' : `Tap to ${title.toLowerCase()}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon && <Animated.View style={styles.iconContainer}>{icon}</Animated.View>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleWidth(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Size variants
  smallButton: {
    paddingVertical: scaleHeight(8),
    paddingHorizontal: scaleWidth(16),
  },
  mediumButton: {
    paddingVertical: scaleHeight(14),
    paddingHorizontal: scaleWidth(24),
  },
  largeButton: {
    paddingVertical: scaleHeight(16),
    paddingHorizontal: scaleWidth(32),
  },

  // Style variants
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.primaryDark,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Disabled state
  disabledButton: {
    backgroundColor: theme.colors.border.medium,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Text styles
  text: {
    fontWeight: '700',
  },
  smallText: {
    fontSize: fontSize.sm,
  },
  mediumText: {
    fontSize: fontSize.md,
  },
  largeText: {
    fontSize: fontSize.lg,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.text.tertiary,
  },

  iconContainer: {
    marginRight: 8,
  },
});
