/**
 * Empty State Component
 * Displays when there's no data to show with customizable message and action
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme';
import { scaleWidth, scaleHeight, fontSize } from '../../utils/responsive';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      {icon && (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
          {icon}
        </Animated.View>
      )}

      <Animated.Text
        entering={FadeInDown.delay(200)}
        style={styles.title}
      >
        {title}
      </Animated.Text>

      {description && (
        <Animated.Text
          entering={FadeInDown.delay(300)}
          style={styles.description}
        >
          {description}
        </Animated.Text>
      )}

      {actionLabel && onAction && (
        <Animated.View entering={FadeInDown.delay(400)}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAction}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(40),
    minHeight: scaleHeight(300),
  },
  iconContainer: {
    marginBottom: scaleHeight(24),
    opacity: 0.6,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: scaleHeight(12),
  },
  description: {
    fontSize: fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
    marginBottom: scaleHeight(24),
    maxWidth: scaleWidth(280),
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: scaleHeight(12),
    paddingHorizontal: scaleWidth(24),
    borderRadius: scaleWidth(12),
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
