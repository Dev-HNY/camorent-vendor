/**
 * Pressable Card Component
 * Interactive card with press animations
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { responsivePadding, borderRadius, scaleHeight } from '../../utils/responsive';
import { lightImpact } from '../../utils/haptics';

interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  elevation = 'medium',
  padding = 'medium',
}) => {
  const pressed = useSharedValue(false);
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      lightImpact();
      pressed.value = true;
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 400,
      });
    })
    .onFinalize(() => {
      pressed.value = false;
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });
    })
    .onEnd(() => {
      if (onPress) {
        onPress();
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      pressed.value ? 1 : 0,
      [0, 1],
      [getShadowOpacity(elevation), getShadowOpacity(elevation) * 0.6]
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
    };
  });

  const containerStyle = [
    styles.card,
    getElevationStyle(elevation),
    getPaddingStyle(padding),
    style,
  ];

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[containerStyle, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const getShadowOpacity = (elevation: string): number => {
  switch (elevation) {
    case 'none':
      return 0;
    case 'low':
      return 0.05;
    case 'medium':
      return 0.1;
    case 'high':
      return 0.15;
    default:
      return 0.1;
  }
};

const getElevationStyle = (elevation: string): ViewStyle => {
  switch (elevation) {
    case 'none':
      return { shadowOpacity: 0, elevation: 0 };
    case 'low':
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scaleHeight(2) },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      };
    case 'medium':
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scaleHeight(4) },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      };
    case 'high':
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scaleHeight(8) },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      };
    default:
      return {};
  }
};

const getPaddingStyle = (padding: string): ViewStyle => {
  switch (padding) {
    case 'none':
      return { padding: 0 };
    case 'small':
      return { padding: responsivePadding.card.all * 0.75 };
    case 'medium':
      return { padding: responsivePadding.card.all };
    case 'large':
      return { padding: responsivePadding.card.all * 1.5 };
    default:
      return {};
  }
};

const styles = {
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
  },
};
