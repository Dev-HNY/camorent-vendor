/**
 * Rental Process Flow Component
 * Animated visual representation of the rental journey
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { scaleWidth, scaleHeight, spacing, fontSize } from '../utils/responsive';

interface RentalProcessFlowProps {
  themeColors?: {
    primary: string;
    success: string;
    warning: string;
    background: {
      primary: string;
      secondary: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
}

// Icon Components
const RequestIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
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

const InventoryIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M7.5 11.5L9.5 13.5L12.5 10.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PickupIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 8H19M5 8C3.89543 8 3 8.89543 3 10V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V10C21 8.89543 20.1046 8 19 8M5 8L7 3H17L19 8M10 12H14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ScanIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7V4H7M4 17V20H7M20 7V4H17M20 17V20H17M3 12H21M8 12V16M12 8V16M16 12V16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UseIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReturnIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 14L4 9M4 9L9 4M4 9H14.5C17.5376 9 20 11.4624 20 14.5C20 17.5376 17.5376 20 14.5 20H12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RevenueIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path
      d="M12 6V8M12 16V18M9 10C9 8.89543 9.89543 8 11 8H13C14.1046 8 15 8.89543 15 10C15 11.1046 14.1046 12 13 12H11C9.89543 12 9 12.8954 9 14C9 15.1046 9.89543 16 11 16H13C14.1046 16 15 15.1046 15 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function RentalProcessFlow({ themeColors }: RentalProcessFlowProps) {
  const colors = themeColors || {
    primary: '#565caa',
    success: '#10B981',
    warning: '#F59E0B',
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000000', secondary: '#6B7280' },
  };

  // Animation values for each step
  const step1Progress = useSharedValue(0);
  const step2Progress = useSharedValue(0);
  const step3Progress = useSharedValue(0);
  const step4Progress = useSharedValue(0);
  const step5Progress = useSharedValue(0);
  const step6Progress = useSharedValue(0);
  const step7Progress = useSharedValue(0);

  // Flowing line animation
  const flowProgress = useSharedValue(0);

  useEffect(() => {
    // Stagger animation for each step
    const duration = 800;
    const stagger = 200;

    step1Progress.value = withDelay(0, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    step2Progress.value = withDelay(stagger, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    step3Progress.value = withDelay(stagger * 2, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    step4Progress.value = withDelay(stagger * 3, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    step5Progress.value = withDelay(stagger * 4, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    step6Progress.value = withDelay(stagger * 5, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    step7Progress.value = withDelay(stagger * 6, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));

    // Continuous flowing animation
    flowProgress.value = withDelay(
      1600,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const createAnimatedStyle = (progress: Animated.SharedValue<number>) => {
    return useAnimatedStyle(() => {
      const scale = interpolate(progress.value, [0, 0.5, 1], [0, 1.1, 1]);
      const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 0.5, 1]);

      return {
        transform: [{ scale }],
        opacity,
      };
    });
  };

  const steps = [
    { icon: RequestIcon, label: 'Make Request', progress: step1Progress, color: colors.primary },
    { icon: InventoryIcon, label: 'Check Inventory', progress: step2Progress, color: colors.warning },
    { icon: PickupIcon, label: 'Go for Pickup', progress: step3Progress, color: colors.primary },
    { icon: ScanIcon, label: 'Scan & Upload', progress: step4Progress, color: colors.success },
    { icon: UseIcon, label: 'Use Products', progress: step5Progress, color: colors.primary },
    { icon: ReturnIcon, label: 'Return Products', progress: step6Progress, color: colors.warning },
    { icon: RevenueIcon, label: 'Earn Revenue', progress: step7Progress, color: colors.success },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Your Rental Journey</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          From request to revenue - simplified
        </Text>
      </View>

      <View style={styles.flowContainer}>
        {/* Curved flowing path - visual decoration */}
        <Svg
          width="100%"
          height={scaleHeight(380)}
          viewBox="0 0 320 380"
          style={styles.pathSvg}
        >
          {/* Background path */}
          <Path
            d="M 40 30 Q 80 30, 100 50 T 160 70 Q 200 70, 220 90 T 280 110 Q 240 130, 220 150 T 160 170 Q 120 170, 100 190 T 40 210 Q 80 230, 100 250 T 160 270 Q 200 270, 220 290 T 280 310 Q 240 330, 220 350 T 160 370"
            stroke={colors.background.secondary}
            strokeWidth="3"
            fill="none"
            strokeDasharray="10 5"
          />
        </Svg>

        {/* Steps Grid */}
        <View style={styles.stepsGrid}>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isLeft = index % 2 === 0;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.stepContainer,
                  { alignItems: isLeft ? 'flex-start' : 'flex-end' },
                  createAnimatedStyle(step.progress),
                ]}
              >
                <View style={[styles.stepCard, { backgroundColor: colors.background.primary }]}>
                  <View style={[styles.iconContainer, { backgroundColor: `${step.color}15` }]}>
                    <IconComponent color={step.color} size={28} />
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepNumber}>
                      <Text style={[styles.stepNumberText, { color: colors.text.secondary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.stepLabel, { color: colors.text.primary }]}>
                      {step.label}
                    </Text>
                  </View>
                </View>

                {/* Connecting line to next step */}
                {index < steps.length - 1 && (
                  <View style={[styles.connector, { backgroundColor: `${step.color}40` }]} />
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl + 2,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  flowContainer: {
    position: 'relative',
    minHeight: scaleHeight(380),
    paddingVertical: spacing.sm,
  },
  pathSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.3,
  },
  stepsGrid: {
    position: 'relative',
    zIndex: 1,
  },
  stepContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: scaleWidth(16),
    borderWidth: 2,
    borderColor: 'rgba(86, 92, 170, 0.1)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: '85%',
  },
  iconContainer: {
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: scaleWidth(14),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  stepNumberText: {
    fontSize: fontSize.sm + 1,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: fontSize.md + 1,
    fontWeight: '600',
    flex: 1,
  },
  connector: {
    width: 3,
    height: spacing.md,
    marginLeft: spacing.xl,
    marginTop: spacing.xs,
    borderRadius: 2,
  },
});
