/**
 * Logo Component
 * Camorent brand logo with industry-grade popping animation (Airbnb/Apple style)
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LogoProps } from '../../types';

export const Logo: React.FC<LogoProps> = ({ size = 80 }) => {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.15);

  useEffect(() => {
    // Popping scale animation with spring physics (like Airbnb/Apple)
    scale.value = withRepeat(
      withSequence(
        withSpring(1.15, {
          damping: 8,
          stiffness: 200,
          mass: 0.5,
        }),
        withSpring(1, {
          damping: 12,
          stiffness: 250,
          mass: 0.5,
        })
      ),
      -1, // Infinite repeat
      false
    );

    // Subtle shadow pulse synchronized with scale
    shadowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, {
          duration: 600,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0.15, {
          duration: 600,
          easing: Easing.in(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.shadowContainer,
          {
            width: size,
            height: size,
            shadowColor: '#565CAA',
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 16,
            elevation: 12,
          },
          shadowStyle,
        ]}
      >
        <Animated.Image
          source={require('../../../assets/icon-blue.png')}
          style={[
            styles.logo,
            { width: size, height: size },
            animatedStyle,
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowContainer: {
    borderRadius: 1000, // Large radius for circular shadow
    ...Platform.select({
      ios: {
        shadowColor: '#565CAA',
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logo: {
    alignSelf: 'center',
  },
});
