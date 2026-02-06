/**
 * Animated Tab Bar Component
 * Custom tab bar with liquid/fluid animation effect and modern badges
 */

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, LayoutChangeEvent, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

// Map route names to translation keys
const routeTranslations: Record<string, string> = {
  'home': 'tabs.home',
  'active-jobs': 'tabs.activeJobs',
  'track-order': 'tabs.requests',
  'settle-payment': 'tabs.settlePayment',
};

export function AnimatedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { pendingRequestsCount, pendingSettlementsCount } = useNotification();
  const insets = useSafeAreaInsets();
  const [tabBarWidth, setTabBarWidth] = useState(Dimensions.get('window').width - 32);
  const liquidX = useSharedValue(0);

  // Animation values for badges
  const requestBadgeScale = useSharedValue(1);
  const settleBadgeScale = useSharedValue(1);
  const requestIconPop = useSharedValue(0);
  const settleIconPop = useSharedValue(0);
  const requestBadgePulse = useSharedValue(0);
  const settleBadgePulse = useSharedValue(0);

  // Trigger animations when counts change
  useEffect(() => {
    if (pendingRequestsCount > 0) {
      // Badge pop animation
      requestBadgeScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      // Icon bounce animation
      requestIconPop.value = withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) })
      );

      // Continuous pulse for badge
      requestBadgePulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [pendingRequestsCount]);

  useEffect(() => {
    if (pendingSettlementsCount > 0) {
      // Badge pop animation
      settleBadgeScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      // Icon bounce animation
      settleIconPop.value = withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) })
      );

      // Continuous pulse for badge
      settleBadgePulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [pendingSettlementsCount]);

  // Sync liquid indicator when tab changes programmatically (e.g., router.push to tab)
  useEffect(() => {
    if (tabBarWidth > 0) {
      const tabWidth = tabBarWidth / state.routes.length;
      liquidX.value = withSpring(tabWidth * state.index + 4, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [state.index, tabBarWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabBarWidth(width);

    // Initialize position based on current tab
    const tabWidth = width / state.routes.length;
    liquidX.value = tabWidth * state.index + 4; // Add 4px offset for left margin
  };

  const onTabPress = (route: any, index: number) => {
    const isFocused = state.index === index;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }

    // Animate liquid effect with pixel values
    const tabWidth = tabBarWidth / state.routes.length;
    liquidX.value = withSpring(tabWidth * index + 4, { // Add 4px offset for left margin
      damping: 15,
      stiffness: 100,
    });
  };

  const getTranslatedTitle = (routeName: string) => {
    const translationKey = routeTranslations[routeName];
    if (!translationKey) return routeName;

    // Navigate nested translation keys (e.g., 'tabs.home')
    const keys = translationKey.split('.');
    let value: any = t;
    for (const key of keys) {
      value = value[key];
      if (!value) return routeName;
    }
    return value;
  };

  const tabWidth = tabBarWidth / state.routes.length;

  const liquidStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: liquidX.value }],
    width: tabWidth - 8, // Account for horizontal margins (4px on each side)
  }));

  // Animated badge styles
  const requestBadgeStyle = useAnimatedStyle(() => {
    const scale = requestBadgeScale.value;
    const pulseScale = interpolate(requestBadgePulse.value, [0, 1], [1, 1.15]);

    return {
      transform: [{ scale: scale * pulseScale }],
    };
  });

  const settleBadgeStyle = useAnimatedStyle(() => {
    const scale = settleBadgeScale.value;
    const pulseScale = interpolate(settleBadgePulse.value, [0, 1], [1, 1.15]);

    return {
      transform: [{ scale: scale * pulseScale }],
    };
  });

  // Animated icon pop styles
  const requestIconStyle = useAnimatedStyle(() => {
    const translateY = interpolate(requestIconPop.value, [0, 1], [0, -8]);
    const scale = interpolate(requestIconPop.value, [0, 0.5, 1], [1, 1.15, 1]);

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const settleIconStyle = useAnimatedStyle(() => {
    const translateY = interpolate(settleIconPop.value, [0, 1], [0, -8]);
    const scale = interpolate(settleIconPop.value, [0, 0.5, 1], [1, 1.15, 1]);

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Badge pulse glow styles
  const requestBadgeGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(requestBadgePulse.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    const scale = interpolate(requestBadgePulse.value, [0, 1], [1, 1.4]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const settleBadgeGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(settleBadgePulse.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    const scale = interpolate(settleBadgePulse.value, [0, 1], [1, 1.4]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const styles = createStyles(theme);

  // Check if current screen wants to hide tab bar (after all hooks)
  const currentRoute = state.routes[state.index];
  const { tabBarVisible } = descriptors[currentRoute.key].options;

  // Hide tab bar if explicitly set to false
  if (tabBarVisible === false) {
    return null;
  }

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar} onLayout={handleLayout}>
        <Animated.View style={[styles.liquidIndicator, liquidStyle]} />
        {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const showBadge = route.name === 'track-order' && pendingRequestsCount > 0;
        const showSettleBadge = route.name === 'settle-payment' && pendingSettlementsCount > 0;
        const badgeCount = route.name === 'track-order' ? pendingRequestsCount : pendingSettlementsCount;

        // Determine which animation to use
        const iconAnimStyle = route.name === 'track-order' ? requestIconStyle : route.name === 'settle-payment' ? settleIconStyle : {};
        const badgeAnimStyle = route.name === 'track-order' ? requestBadgeStyle : settleBadgeStyle;
        const badgeGlowStyle = route.name === 'track-order' ? requestBadgeGlowStyle : settleBadgeGlowStyle;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => onTabPress(route, index)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.tabIconContainer, iconAnimStyle]}>
              {options.tabBarIcon &&
                options.tabBarIcon({
                  color: isFocused ? theme.colors.primary : theme.colors.text.tertiary,
                  focused: isFocused,
                })}
              {(showBadge || showSettleBadge) && (
                <>
                  {/* Glowing pulse ring */}
                  <Animated.View style={[styles.badgeGlow, badgeGlowStyle]} />

                  {/* Main badge */}
                  <Animated.View style={[styles.badge, badgeAnimStyle]}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </Animated.View>
                </>
              )}
            </Animated.View>
            <Text
              style={[
                styles.label,
                { color: isFocused ? theme.colors.primary : theme.colors.text.tertiary },
              ]}
            >
              {getTranslatedTitle(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
    borderRadius: 30,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  liquidIndicator: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    backgroundColor: theme.colors.primary + '20', // 20% opacity
    borderRadius: 24,
    marginHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabIconContainer: {
    position: 'relative',
  },
  badgeGlow: {
    position: 'absolute',
    top: -6,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent.red,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: theme.colors.accent.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2.5,
    borderColor: theme.colors.background.primary,
    shadowColor: theme.colors.accent.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.semibold,
    marginTop: 4,
  },
});
