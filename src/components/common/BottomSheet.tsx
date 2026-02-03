/**
 * Bottom Sheet Component
 * iOS-inspired draggable bottom sheet
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { mediumImpact } from '../../utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  snapPoints?: number[];
  initialSnap?: number;
  enablePanDownToClose?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  visible,
  onClose,
  snapPoints = [SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.9],
  initialSnap = 0,
  enablePanDownToClose = true,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(SCREEN_HEIGHT - snapPoints[initialSnap], {
        damping: 30,
        stiffness: 400,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible]);

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      // Only allow dragging down
      if (newY > SCREEN_HEIGHT - snapPoints[snapPoints.length - 1]) {
        translateY.value = newY;
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityY;

      // Fast swipe down closes
      if (velocity > 500 && enablePanDownToClose) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        runOnJS(onClose)();
        runOnJS(mediumImpact)();
        return;
      }

      // Find closest snap point
      let closestSnap = snapPoints[0];
      let minDistance = Math.abs(translateY.value - (SCREEN_HEIGHT - snapPoints[0]));

      snapPoints.forEach((snap) => {
        const distance = Math.abs(translateY.value - (SCREEN_HEIGHT - snap));
        if (distance < minDistance) {
          minDistance = distance;
          closestSnap = snap;
        }
      });

      // If below threshold, close
      if (enablePanDownToClose && translateY.value > SCREEN_HEIGHT - snapPoints[0] * 0.5) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        runOnJS(onClose)();
        runOnJS(mediumImpact)();
      } else {
        translateY.value = withSpring(SCREEN_HEIGHT - closestSnap, {
          damping: 30,
          stiffness: 400,
        });
        runOnJS(mediumImpact)();
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleBackdropPress = () => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
            <Animated.View
              style={[styles.backdropOverlay, backdropStyle]}
              onTouchEnd={handleBackdropPress}
            />
          </BlurView>
        ) : (
          <Animated.View
            style={[styles.backdropOverlay, backdropStyle]}
            onTouchEnd={handleBackdropPress}
          />
        )}
      </Animated.View>

      {/* Bottom Sheet */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
