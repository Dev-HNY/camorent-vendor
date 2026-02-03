/**
 * Screen Wrapper Component
 * Consistent screen layout with automatic transitions
 */

import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { theme } from '../../theme';
import { responsivePadding } from '../../utils/responsive';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  safeArea?: boolean;
  padding?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'light' | 'dark';
  transition?: 'fade' | 'slide' | 'none';
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  safeArea = true,
  padding = true,
  backgroundColor = theme.colors.background.primary,
  statusBarStyle = 'dark',
  transition = 'fade',
  style,
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    padding && styles.padding,
    style,
  ];

  const getTransition = () => {
    switch (transition) {
      case 'fade':
        return FadeIn.duration(300);
      case 'slide':
        return SlideInRight.duration(300).springify().damping(20).stiffness(300);
      case 'none':
        return undefined;
      default:
        return FadeIn.duration(300);
    }
  };

  const renderContent = () => {
    if (scroll) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            padding && styles.scrollPadding,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
        >
          {children}
        </ScrollView>
      );
    }

    return <View style={containerStyle}>{children}</View>;
  };

  const AnimatedView = Animated.createAnimatedComponent(View);

  const content = renderContent();

  if (safeArea) {
    return (
      <>
        <StatusBar
          barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundColor}
        />
        <SafeAreaView
          style={[styles.container, { backgroundColor }]}
          edges={['top', 'left', 'right']}
        >
          {transition !== 'none' ? (
            <AnimatedView entering={getTransition()} style={styles.container}>
              {content}
            </AnimatedView>
          ) : (
            content
          )}
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      {transition !== 'none' ? (
        <AnimatedView
          entering={getTransition()}
          style={[styles.container, { backgroundColor }]}
        >
          {content}
        </AnimatedView>
      ) : (
        <View style={[styles.container, { backgroundColor }]}>
          {content}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: responsivePadding.screen.horizontal,
  },
  scrollView: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: responsivePadding.screen.horizontal,
    paddingBottom: responsivePadding.screen.bottom,
  },
});
