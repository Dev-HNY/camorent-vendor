/**
 * Responsive Card Component
 * Modern card with consistent padding and shadows
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../../theme';
import { responsivePadding, borderRadius, scaleHeight } from '../../utils/responsive';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animated?: boolean;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  animated = false,
  elevation = 'medium',
  padding = 'medium',
}) => {
  const containerStyle = [
    styles.card,
    styles[`elevation_${elevation}`],
    styles[`padding_${padding}`],
    style,
  ];

  if (animated) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={containerStyle}>
        {children}
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  // Elevation variants
  elevation_none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  elevation_low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  elevation_medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  elevation_high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(8) },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  // Padding variants
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: responsivePadding.card.all * 0.75,
  },
  padding_medium: {
    padding: responsivePadding.card.all,
  },
  padding_large: {
    padding: responsivePadding.card.all * 1.5,
  },
});
