/**
 * Animated Modal Component
 * Modern modal with smooth transitions and backdrop blur
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';
import { spacing, borderRadius } from '../../utils/responsive';

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'center' | 'bottom';
  closeOnBackdropPress?: boolean;
  showBackdrop?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  children,
  position = 'center',
  closeOnBackdropPress = true,
  showBackdrop = true,
}) => {
  const insets = useSafeAreaInsets();
  const backdropOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(position === 'bottom' ? SCREEN_HEIGHT : 0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Entrance animation
      backdropOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      if (position === 'bottom') {
        modalTranslateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
          mass: 0.8,
        });
      } else {
        modalScale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
        modalOpacity.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.ease),
        });
      }
    } else {
      // Exit animation
      backdropOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });

      if (position === 'bottom') {
        modalTranslateY.value = withTiming(SCREEN_HEIGHT, {
          duration: 250,
          easing: Easing.in(Easing.cubic),
        });
      } else {
        modalScale.value = withTiming(0.9, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        });
        modalOpacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        });
      }
    }
  }, [visible, position]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => {
    if (position === 'bottom') {
      return {
        transform: [{ translateY: modalTranslateY.value }],
      };
    }
    return {
      transform: [{ scale: modalScale.value }],
      opacity: modalOpacity.value,
    };
  });

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        {showBackdrop && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleBackdropPress}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} style={StyleSheet.absoluteFill}>
                <Animated.View style={[styles.backdrop, backdropStyle]} />
              </BlurView>
            ) : (
              <Animated.View style={[styles.backdrop, backdropStyle]} />
            )}
          </TouchableOpacity>
        )}

        {/* Modal Content */}
        <View
          style={[
            styles.contentContainer,
            position === 'bottom' ? styles.bottomPosition : styles.centerPosition,
          ]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.modalContent,
              position === 'bottom' ? styles.bottomModal : styles.centerModal,
              position === 'bottom' && { paddingBottom: spacing.xxl + insets.bottom },
              modalStyle,
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentContainer: {
    flex: 1,
  },
  centerPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  bottomPosition: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  centerModal: {
    borderRadius: borderRadius.xl,
    maxWidth: 400,
    width: '100%',
    padding: spacing.lg,
  },
  bottomModal: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
});
