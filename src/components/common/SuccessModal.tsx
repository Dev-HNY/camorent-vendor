/**
 * Success Modal Component
 * Industry-grade success modal with Lottie animations
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Path, Circle } from 'react-native-svg';

Dimensions.get('window');

// Modern Check Icon
const CheckIcon = ({ size = 64, color = '#22C55E' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M8 12.5L10.5 15L16 9.5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Close Icon
const CloseIcon = ({ size = 24, color = '#6B7280' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  icon?: 'success' | 'error' | 'warning' | 'info';
  autoClose?: number; // Auto close after X milliseconds
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title,
  message,
  primaryButtonText = 'OK',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  icon = 'success',
  autoClose,
}) => {
  const { theme, themeMode } = useTheme();
  const lottieRef = useRef<LottieView>(null);

  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropOpacity.value = 0;
      modalScale.value = 0.8;
      modalOpacity.value = 0;
      iconScale.value = 0;
      contentOpacity.value = 0;

      // Entrance animation sequence
      backdropOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      modalOpacity.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.ease),
      });

      modalScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
        mass: 0.8,
      });

      iconScale.value = withDelay(
        150,
        withSequence(
          withSpring(1.2, {
            damping: 10,
            stiffness: 300,
          }),
          withSpring(1, {
            damping: 15,
            stiffness: 300,
          })
        )
      );

      contentOpacity.value = withDelay(
        250,
        withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.ease),
        })
      );

      // Play Lottie animation
      if (lottieRef.current) {
        lottieRef.current.play();
      }

      // Auto close
      if (autoClose) {
        setTimeout(() => {
          handleClose();
        }, autoClose);
      }
    } else {
      // Exit animation
      backdropOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });

      modalScale.value = withTiming(0.8, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });

      modalOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [visible, autoClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleClose = () => {
    onClose();
  };

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else {
      handleClose();
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else {
      handleClose();
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case 'success':
        return theme.colors.accent.green;
      case 'error':
        return theme.colors.accent.red;
      case 'warning':
        return theme.colors.accent.amber;
      case 'info':
        return theme.colors.status.info;
      default:
        return theme.colors.accent.green;
    }
  };

  const getIconBackgroundColor = () => {
    const isDark = themeMode === 'dark';
    switch (icon) {
      case 'success':
        return isDark ? theme.colors.accent.greenLight : '#DCFCE7';
      case 'error':
        return isDark ? '#7F1D1D' : '#FEE2E2';
      case 'warning':
        return isDark ? theme.colors.accent.amberLight : '#FEF3C7';
      case 'info':
        return isDark ? '#1E3A8A' : '#DBEAFE';
      default:
        return isDark ? theme.colors.accent.greenLight : '#DCFCE7';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} style={StyleSheet.absoluteFill}>
              <Animated.View style={[styles.backdrop, backdropStyle]} />
            </BlurView>
          ) : (
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          )}
        </TouchableOpacity>

        {/* Modal Content */}
        <View style={styles.contentContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background.primary },
              modalStyle,
            ]}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <CloseIcon color={theme.colors.text.tertiary} size={20} />
            </TouchableOpacity>

            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconBackgroundColor() },
                iconStyle,
              ]}
            >
              <CheckIcon size={64} color={getIconColor()} />
            </Animated.View>

            {/* Content */}
            <Animated.View style={[styles.content, contentStyle]}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                {title}
              </Text>

              {message && (
                <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
                  {message}
                </Text>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {secondaryButtonText && (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.secondaryButton,
                      {
                        borderColor: theme.colors.border.light,
                        backgroundColor: theme.colors.background.secondary,
                      },
                    ]}
                    onPress={handleSecondaryPress}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.secondaryButtonText, { color: theme.colors.text.primary }]}>
                      {secondaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: theme.colors.primary },
                    !secondaryButtonText && styles.singleButton,
                  ]}
                  onPress={handlePrimaryPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    maxWidth: 400,
    width: '100%',
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 15,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleButton: {
    minWidth: 160,
  },
  primaryButton: {
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
