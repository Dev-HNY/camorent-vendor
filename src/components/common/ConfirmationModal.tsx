/**
 * Confirmation Modal Component
 * Industry-grade confirmation dialog for critical actions (Airbnb/Apple style)
 * Used for approve, reject, delete, and other confirmations
 */

import React, { useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Path, Circle } from 'react-native-svg';

Dimensions.get('window');

// Alert Triangle Icon
const AlertTriangleIcon = ({ size = 64, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M12 9V13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1.5" />
  </Svg>
);

// Question Icon
const QuestionIcon = ({ size = 64, color = '#3B82F6' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1.5" />
  </Svg>
);

// Trash Icon
const TrashIcon = ({ size = 64, color = '#EF4444' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Check Circle Icon (for approve)
const CheckCircleIcon = ({ size = 64, color = '#22C55E' }: { size?: number; color?: string }) => (
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

// X Circle Icon (for reject)
const XCircleIcon = ({ size = 64, color = '#EF4444' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M15 9L9 15M9 9L15 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export type ConfirmationType = 'warning' | 'question' | 'danger' | 'approve' | 'reject';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  type?: ConfirmationType;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  type = 'question',
  loading = false,
}) => {
  const { theme, themeMode } = useTheme();

  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.85);
  const modalOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropOpacity.value = 0;
      modalScale.value = 0.85;
      modalOpacity.value = 0;
      iconScale.value = 0;
      contentOpacity.value = 0;

      // Entrance animation sequence
      backdropOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });

      modalOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      modalScale.value = withSpring(1, {
        damping: 18,
        stiffness: 250,
        mass: 0.7,
      });

      iconScale.value = withDelay(
        100,
        withSequence(
          withSpring(1.15, {
            damping: 8,
            stiffness: 300,
          }),
          withSpring(1, {
            damping: 12,
            stiffness: 300,
          })
        )
      );

      contentOpacity.value = withDelay(
        200,
        withTiming(1, {
          duration: 350,
          easing: Easing.out(Easing.ease),
        })
      );
    } else {
      // Exit animation
      backdropOpacity.value = withTiming(0, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });

      modalScale.value = withTiming(0.85, {
        duration: 180,
        easing: Easing.in(Easing.ease),
      });

      modalOpacity.value = withTiming(0, {
        duration: 180,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [visible]);

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

  const getIconComponent = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangleIcon size={64} color={getIconColor()} />;
      case 'danger':
        return <TrashIcon size={64} color={getIconColor()} />;
      case 'approve':
        return <CheckCircleIcon size={64} color={getIconColor()} />;
      case 'reject':
        return <XCircleIcon size={64} color={getIconColor()} />;
      case 'question':
      default:
        return <QuestionIcon size={64} color={getIconColor()} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#F59E0B';
      case 'danger':
        return '#EF4444';
      case 'approve':
        return '#22C55E';
      case 'reject':
        return '#EF4444';
      case 'question':
      default:
        return theme.colors.primary;
    }
  };

  const getIconBackgroundColor = () => {
    const isDark = themeMode === 'dark';
    switch (type) {
      case 'warning':
        return isDark ? '#78350F' : '#FEF3C7';
      case 'danger':
      case 'reject':
        return isDark ? '#7F1D1D' : '#FEE2E2';
      case 'approve':
        return isDark ? '#14532D' : '#DCFCE7';
      case 'question':
      default:
        return isDark ? '#1E3A8A' : '#DBEAFE';
    }
  };

  const getConfirmButtonColors = (): [string, string, ...string[]] => {
    switch (type) {
      case 'danger':
      case 'reject':
        return ['#EF4444', '#DC2626'];
      case 'approve':
        return ['#22C55E', '#16A34A'];
      case 'warning':
        return ['#F59E0B', '#D97706'];
      case 'question':
      default:
        return [theme.colors.primary, '#4B4F8C'];
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
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={loading ? undefined : onClose}
          disabled={loading}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={25} style={StyleSheet.absoluteFill}>
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
            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconBackgroundColor() },
                iconStyle,
              ]}
            >
              {getIconComponent()}
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
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    {
                      borderColor: theme.colors.border.medium,
                      backgroundColor: theme.colors.background.secondary,
                    },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.text.primary }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={getConfirmButtonColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>
                      {loading ? 'Processing...' : confirmText}
                    </Text>
                  </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 28,
    maxWidth: 380,
    width: '100%',
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 18,
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
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
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
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
