/**
 * Logo Component
 * Camorent brand logo with customizable size
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { LogoProps } from '../../types';

export const Logo: React.FC<LogoProps> = ({ size = 80 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Inner design - representing camera lens/shutter */}
        <View style={[styles.innerCircle, { 
          width: size * 0.7, 
          height: size * 0.7, 
          borderRadius: (size * 0.7) / 2 
        }]}>
          <View style={[styles.arc, { 
            width: size * 0.5, 
            height: size * 0.5,
            borderRadius: (size * 0.5) / 2,
            borderWidth: size * 0.08,
          }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  innerCircle: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arc: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.text.inverse,
    borderTopWidth: 0,
    borderRightWidth: 0,
    transform: [{ rotate: '135deg' }],
  },
});
