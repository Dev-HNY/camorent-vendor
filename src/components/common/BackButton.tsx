/**
 * Reusable Back Button Component
 * Production-ready back navigation button with consistent styling
 * Supports theme, custom actions, and accessibility
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from './icons';
import { useTheme } from '../../context/ThemeContext';

interface BackButtonProps {
  /**
   * Custom onPress handler. If not provided, uses router.back()
   */
  onPress?: () => void;

  /**
   * Icon color. If not provided, uses theme text color
   */
  color?: string;

  /**
   * Icon size
   */
  size?: number;

  /**
   * Custom style for the button container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Show background with semi-transparent effect
   */
  withBackground?: boolean;

  /**
   * Use light color scheme (for dark backgrounds)
   */
  light?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color,
  size = 24,
  style,
  withBackground = false,
  light = false,
}) => {
  const router = useRouter();
  const { theme } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const iconColor = color || (light ? '#FFFFFF' : theme.colors.text.primary);

  const backgroundColor = withBackground
    ? light
      ? 'rgba(255, 255, 255, 0.2)'
      : theme.colors.background.secondary
    : 'transparent';

  const borderColor = withBackground && !light ? theme.colors.border.light : 'transparent';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.backButton,
        withBackground && [
          styles.withBackground,
          {
            backgroundColor,
            borderColor,
            borderWidth: withBackground && !light ? 1 : 0,
          }
        ],
        style,
      ]}
      activeOpacity={0.7}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      accessibilityHint="Navigate to previous screen"
    >
      <ChevronLeftIcon color={iconColor} size={size} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withBackground: {
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
