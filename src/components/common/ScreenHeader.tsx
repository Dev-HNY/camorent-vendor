/**
 * Reusable Screen Header Component
 * Production-ready header with back button, title, subtitle, and optional actions
 * Supports theme, status bar, and accessibility
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Platform, StatusBar } from 'react-native';
import { BackButton } from './BackButton';
import { useTheme } from '../../context/ThemeContext';

interface ScreenHeaderProps {
  /**
   * Main header title
   */
  title: string;

  /**
   * Optional subtitle below the title
   */
  subtitle?: string;

  /**
   * Custom back button press handler
   */
  onBack?: () => void;

  /**
   * Show/hide back button
   */
  showBackButton?: boolean;

  /**
   * Optional element to show on the right (e.g., action buttons)
   */
  rightElement?: React.ReactNode;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom title text style
   */
  titleStyle?: TextStyle;

  /**
   * Custom subtitle text style
   */
  subtitleStyle?: TextStyle;

  /**
   * Show border at the bottom
   */
  showBorder?: boolean;

  /**
   * Use light color scheme (for dark backgrounds)
   */
  light?: boolean;

  /**
   * Optional icon to show before title
   */
  icon?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBackButton = true,
  rightElement,
  containerStyle,
  titleStyle,
  subtitleStyle,
  showBorder = true,
  light = false,
  icon,
}) => {
  const { theme } = useTheme();

  const backgroundColor = light ? 'transparent' : theme.colors.background.primary;
  const textColor = light ? '#FFFFFF' : theme.colors.text.primary;
  const subtitleColor = light ? 'rgba(255, 255, 255, 0.8)' : theme.colors.text.secondary;
  const borderColor = light ? 'rgba(255, 255, 255, 0.1)' : theme.colors.border.light;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        showBorder && { borderBottomWidth: 1, borderBottomColor: borderColor },
        containerStyle,
      ]}
    >
      {showBackButton ? (
        <BackButton
          size={24}
          onPress={onBack}
          light={light}
          withBackground={light}
        />
      ) : (
        <View style={styles.placeholder} />
      )}

      <View style={styles.centerContent}>
        <View style={styles.titleContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[styles.title, { color: textColor }, titleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
            accessibilityRole="header"
          >
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: subtitleColor }, subtitleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {rightElement || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
    minHeight: 60 + (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0),
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 44,
  },
});
