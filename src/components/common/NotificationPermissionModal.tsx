/**
 * Notification Permission Modal
 * Airbnb/Apple-style notification permission request modal
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
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Modern Bell Icon with Glow
const BellIconLarge = ({ size = 80, color = '#565CAA' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <RadialGradient id="bellGlow" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <Stop offset="100%" stopColor={color} stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Circle cx="12" cy="12" r="10" fill="url(#bellGlow)" />
    <Path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Feature Icon Component
const FeatureIcon = ({ icon, color }: { icon: string; color: string }) => {
  const renderIcon = () => {
    switch (icon) {
      case 'bell':
        return (
          <Path
            d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'truck':
        return (
          <Path
            d="M16 3H1V16H16V3Z M16 8H20L23 11V16H16V8Z M5.5 18C6.88071 18 8 16.8807 8 15.5C8 14.1193 6.88071 13 5.5 13C4.11929 13 3 14.1193 3 15.5C3 16.8807 4.11929 18 5.5 18Z M18.5 18C19.8807 18 21 16.8807 21 15.5C21 14.1193 19.8807 13 18.5 13C17.1193 13 16 14.1193 16 15.5C16 16.8807 17.1193 18 18.5 18Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'money':
        return (
          <Path
            d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {renderIcon()}
    </Svg>
  );
};

interface NotificationPermissionModalProps {
  visible: boolean;
  onAllow: () => void;
  onDecline: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  visible,
  onAllow,
  onDecline,
}) => {
  const { theme } = useTheme();

  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(-10);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropOpacity.value = 0;
      modalScale.value = 0.9;
      modalOpacity.value = 0;
      iconScale.value = 0;
      iconRotation.value = -10;
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
        100,
        withSequence(
          withSpring(1.15, {
            damping: 8,
            stiffness: 250,
          }),
          withSpring(1, {
            damping: 12,
            stiffness: 300,
          })
        )
      );

      iconRotation.value = withDelay(
        100,
        withSequence(
          withSpring(5, {
            damping: 8,
            stiffness: 200,
          }),
          withSpring(0, {
            damping: 10,
            stiffness: 250,
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
    } else {
      // Exit animation
      backdropOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });

      modalScale.value = withTiming(0.9, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });

      modalOpacity.value = withTiming(0, {
        duration: 200,
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
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const features = [
    {
      icon: 'bell',
      title: 'New Pickup Requests',
      description: 'Get notified when customers request equipment',
      color: '#3B82F6',
    },
    {
      icon: 'truck',
      title: 'Return Reminders',
      description: 'Know when equipment returns are due',
      color: '#8B5CF6',
    },
    {
      icon: 'money',
      title: 'Payment Updates',
      description: 'Stay updated on settlement requests',
      color: '#10B981',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDecline}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDecline}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} style={StyleSheet.absoluteFill}>
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
            {/* Bell Icon with Glow */}
            <Animated.View style={[styles.iconContainer, iconStyle]}>
              <View style={styles.iconGlow}>
                <LinearGradient
                  colors={[`${theme.colors.primary}40`, `${theme.colors.primary}10`, 'transparent']}
                  style={styles.glowGradient}
                />
              </View>
              <BellIconLarge size={80} color={theme.colors.primary} />
            </Animated.View>

            {/* Content */}
            <Animated.View style={[styles.content, contentStyle]}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                Stay Updated with Notifications
              </Text>

              <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                Enable notifications to receive real-time alerts about your rentals
              </Text>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
                      <FeatureIcon icon={feature.icon} color={feature.color} />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
                        {feature.title}
                      </Text>
                      <Text style={[styles.featureDescription, { color: theme.colors.text.tertiary }]}>
                        {feature.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                  ]}
                  onPress={onAllow}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, '#4B4F8C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Enable Notifications</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onDecline}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.text.secondary }]}>
                    Maybe Later
                  </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButton: {
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
