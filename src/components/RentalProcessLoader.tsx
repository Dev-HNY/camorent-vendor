/**
 * Rental Process Loader Component
 * Shows animated rental process flow during initial loading
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  SlideInDown,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';

// Step Icons
const RequestIcon = ({ size = 40, color = '#3B82F6' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InventoryIcon = ({ size = 40, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M12 12V12.01M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PickupIcon = ({ size = 40, color = '#3B82F6' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 16V6C13 4.89543 13.8954 4 15 4H19C20.1046 4 21 4.89543 21 6V16M13 16H3M13 16H21M3 16V6C3 4.89543 3.89543 4 5 4H9C10.1046 4 11 4.89543 11 6V16M3 16H1M21 16H23M7 20C8.10457 20 9 19.1046 9 18C9 16.8954 8.10457 16 7 16C5.89543 16 5 16.8954 5 18C5 19.1046 5.89543 20 7 20ZM17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ScanIcon = ({ size = 40, color = '#22C55E' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L3 5C3 3.89543 3.89543 3 5 3L9 3M21 9V5C21 3.89543 20.1046 3 19 3H15M3 15L3 19C3 20.1046 3.89543 21 5 21H9M21 15V19C21 20.1046 20.1046 21 19 21H15M7 12H17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UseIcon = ({ size = 40, color = '#3B82F6' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.7 6.3C15.0314 5.96863 15.0314 5.43137 14.7 5.1L12.9 3.3C12.5686 2.96863 12.0314 2.96863 11.7 3.3L3.3 11.7C2.96863 12.0314 2.96863 12.5686 3.3 12.9L5.1 14.7C5.43137 15.0314 5.96863 15.0314 6.3 14.7L14.7 6.3Z M14.7 6.3L19 10.6M10 18H21M3 21H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReturnIcon = ({ size = 40, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10H13C17.4183 10 21 13.5817 21 18V20M3 10L7 6M3 10L7 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RevenueIcon = ({ size = 40, color = '#22C55E' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8V16M15 11V13M9 11V13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface Step {
  icon: React.FC<{ size?: number; color?: string }>;
  label: string;
  color: string;
}

// Steps will be dynamically created with translations inside the component

interface RentalProcessLoaderProps {
  isDataLoaded?: boolean;
  onProceed?: () => void;
}

export default function RentalProcessLoader({ isDataLoaded = false, onProceed }: RentalProcessLoaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();

  // Create steps array with translations
  const steps: Step[] = useMemo(() => [
    { icon: RequestIcon, label: t.rentalJourney.step1, color: '#3B82F6' },
    { icon: InventoryIcon, label: t.rentalJourney.step2, color: '#F59E0B' },
    { icon: PickupIcon, label: t.rentalJourney.step3, color: '#3B82F6' },
    { icon: ScanIcon, label: t.rentalJourney.step4, color: '#22C55E' },
    { icon: UseIcon, label: t.rentalJourney.step5, color: '#3B82F6' },
    { icon: ReturnIcon, label: t.rentalJourney.step6, color: '#F59E0B' },
    { icon: RevenueIcon, label: t.rentalJourney.step7, color: '#22C55E' },
  ], [t]);

  // Create styles dynamically based on theme
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      paddingBottom: 120,
      paddingTop: 40,
    },
    logoContainer: {
      marginBottom: 30,
      marginTop: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoShadowContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      shadowColor: '#565CAA',
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 100,
      height: 100,
    },
    messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 40,
    },
    messageText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    readyText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.accent.green,
    },
    dotsContainer: {
      flexDirection: 'row',
      marginLeft: 4,
    },
    dot: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      lineHeight: 24,
    },
    stepsContainer: {
      width: '100%',
      maxWidth: 400,
    },
    stepsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    stepWrapper: {
      marginBottom: 8,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepNumberContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    stepIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    stepLabelContainer: {
      flex: 1,
    },
    stepLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginLeft: 16,
    },
    connectingLine: {
      width: 2,
      height: 20,
      marginLeft: 14,
      marginVertical: 2,
    },
    bottomSpacer: {
      height: 120,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: Math.max(insets.bottom, 20) + 20,
      backgroundColor: theme.colors.background.primary,
    },
    proceedButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    proceedButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    proceedButtonSubtext: {
      fontSize: 12,
      fontWeight: '500',
      color: themeMode === 'dark' ? '#D1D5DB' : '#E0E7FF',
    },
  }), [theme, themeMode]);

  // Animation values for each step
  const stepProgresses = steps.map(() => useSharedValue(0));
  const logoScale = useSharedValue(1);
  const logoShadowOpacity = useSharedValue(0.15);
  const dotsAnimation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Industry-grade popping animation for logo (Airbnb/Apple style)
    logoScale.value = withRepeat(
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
      -1,
      false
    );

    // Synchronized shadow pulse
    logoShadowOpacity.value = withRepeat(
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

    // Loading dots animation
    dotsAnimation.value = withRepeat(
      withTiming(3, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );

    // Sequential step animations - loop continuously
    stepProgresses.forEach((progress, index) => {
      progress.value = withDelay(
        index * 500,
        withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }), // Start invisible
            withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }), // Fade in
            withDelay(200, withTiming(1, { duration: 0 })), // Stay visible
            withDelay(2000, withTiming(1, { duration: 0 })) // Hold before restart
          ),
          -1, // Loop infinitely
          false
        )
      );
    });
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const logoShadowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: logoShadowOpacity.value,
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleProceedPress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    if (onProceed) {
      setTimeout(onProceed, 200);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Camorent Logo with popping animation */}
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.logoShadowContainer, logoShadowStyle]}>
            <Animated.Image
              source={require('../../assets/icon-blue.png')}
              style={[styles.logo, logoStyle]}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Connecting message or Ready message */}
        <View style={styles.messageContainer}>
          {isDataLoaded ? (
            <Text style={styles.readyText}>{t.common.loading}</Text>
          ) : (
            <>
              <Text style={styles.messageText}>{t.common.loading}</Text>
              <AnimatedDots dotsAnimation={dotsAnimation} styles={styles} />
            </>
          )}
        </View>

        {/* Rental Process Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>{t.rentalJourney.title}</Text>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const progress = stepProgresses[index];

            const stepStyle = useAnimatedStyle(() => {
              const opacity = interpolate(progress.value, [0, 1], [0.4, 1]);
              const scale = interpolate(progress.value, [0, 1], [0.9, 1]);
              return {
                opacity,
                transform: [{ scale }],
              };
            });

            const lineStyle = useAnimatedStyle(() => {
              const opacity = interpolate(progress.value, [0, 1], [0.2, 0.6]);
              return { opacity };
            });

            return (
              <View key={index} style={styles.stepWrapper}>
                <View style={styles.stepRow}>
                  {/* Step Number */}
                  <Animated.View style={[styles.stepNumberContainer, stepStyle, { backgroundColor: step.color }]}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </Animated.View>

                  {/* Icon Circle */}
                  <Animated.View style={[styles.stepIconContainer, stepStyle, { borderColor: step.color }]}>
                    <StepIcon size={24} color={step.color} />
                  </Animated.View>

                  {/* Step Label */}
                  <Animated.View style={[stepStyle, styles.stepLabelContainer]}>
                    <Text style={styles.stepLabel}>{step.label}</Text>
                  </Animated.View>
                </View>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <Animated.View style={[styles.connectingLine, lineStyle, { backgroundColor: step.color }]} />
                )}
              </View>
            );
          })}
        </View>

        {/* Spacer for proceed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Proceed Button - Show when data is loaded - Fixed at bottom */}
      {isDataLoaded && onProceed && (
        <Animated.View entering={SlideInDown.delay(300).springify()} style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleProceedPress}
            activeOpacity={0.9}
          >
            <Animated.View style={[styles.proceedButton, buttonStyle]}>
              <Text style={styles.proceedButtonText}>{t.welcome.getStarted}</Text>
              <Text style={styles.proceedButtonSubtext}>{t.welcome.continueToApp}</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

// Animated dots component for loading text
const AnimatedDots = ({ dotsAnimation, styles }: { dotsAnimation: Animated.SharedValue<number>; styles: any }) => {
  const dot1Style = useAnimatedStyle(() => {
    const opacity = dotsAnimation.value >= 1 ? 1 : 0.3;
    return { opacity };
  });

  const dot2Style = useAnimatedStyle(() => {
    const opacity = dotsAnimation.value >= 2 ? 1 : 0.3;
    return { opacity };
  });

  const dot3Style = useAnimatedStyle(() => {
    const opacity = dotsAnimation.value >= 3 ? 1 : 0.3;
    return { opacity };
  });

  return (
    <View style={styles.dotsContainer}>
      <Animated.Text style={[styles.dot, dot1Style]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, dot2Style]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, dot3Style]}>.</Animated.Text>
    </View>
  );
};
