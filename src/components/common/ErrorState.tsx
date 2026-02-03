/**
 * Error State Component
 * Displays error messages with retry functionality
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../../theme';
import { scaleWidth, scaleHeight, fontSize } from '../../utils/responsive';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const AlertIcon = ({ size = 64 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      fill="#EF4444"
      opacity="0.1"
    />
    <Path
      d="M12 8V12M12 16H12.01"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      stroke="#EF4444"
      strokeWidth="2"
    />
  </Svg>
);

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Oops! Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <Animated.View
        entering={SlideInDown.delay(100).springify()}
        style={styles.iconContainer}
      >
        <AlertIcon size={scaleWidth(80)} />
      </Animated.View>

      <Animated.Text
        entering={SlideInDown.delay(200).springify()}
        style={styles.title}
      >
        {title}
      </Animated.Text>

      <Animated.Text
        entering={SlideInDown.delay(300).springify()}
        style={styles.message}
      >
        {message}
      </Animated.Text>

      {onRetry && (
        <Animated.View entering={SlideInDown.delay(400).springify()}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>{retryLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.Text
        entering={FadeIn.delay(500)}
        style={styles.supportText}
      >
        If the problem persists, please contact support
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(32),
    minHeight: scaleHeight(300),
  },
  iconContainer: {
    marginBottom: scaleHeight(24),
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: scaleHeight(12),
  },
  message: {
    fontSize: fontSize.md,
    color: '#EF4444',
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
    marginBottom: scaleHeight(24),
    maxWidth: scaleWidth(300),
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: scaleHeight(14),
    paddingHorizontal: scaleWidth(32),
    borderRadius: scaleWidth(12),
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: scaleHeight(16),
  },
  retryText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  supportText: {
    fontSize: fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
