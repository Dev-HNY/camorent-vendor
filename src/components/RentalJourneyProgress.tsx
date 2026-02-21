/**
 * Rental Journey Carousel
 * Auto-scrolling carousel with Lottie animations for each step
 * Glassmorphism effect with brand colors
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_MARGIN = 20;
const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds per card

interface Step {
  id: number;
  titleKey: string;
  animation: any;
}

const stepData: Step[] = [
  { id: 1, titleKey: 'step1', animation: require('../../assets/rental-journey/step-1.json') },
  { id: 2, titleKey: 'step2', animation: require('../../assets/rental-journey/step-2.json') },
  { id: 3, titleKey: 'step3', animation: require('../../assets/rental-journey/step-3.json') },
  { id: 4, titleKey: 'step4', animation: require('../../assets/rental-journey/step-4.json') },
  { id: 5, titleKey: 'step5', animation: require('../../assets/rental-journey/step-5.json') },
  { id: 6, titleKey: 'step6', animation: require('../../assets/rental-journey/step-6.json') },
  { id: 7, titleKey: 'step7', animation: require('../../assets/rental-journey/step-7.json') },
];

// Individual Card Component with Glassmorphism
const RentalCard = React.memo(({
  step,
  index,
  isActive
}: {
  step: Step & { title: string };
  index: number;
  isActive: boolean;
}) => {
  const lottieRef = useRef<LottieView>(null);
  const { themeMode } = useTheme();

  useEffect(() => {
    if (lottieRef.current && isActive) {
      lottieRef.current.play();
    }
  }, [isActive]);

  // Brand color gradients with darker background
  const gradientColors: [string, string, ...string[]] = themeMode === 'dark'
    ? ['rgba(40, 45, 80, 0.95)', 'rgba(35, 40, 70, 0.98)', 'rgba(30, 35, 60, 1)']
    : ['rgba(50, 55, 90, 0.92)', 'rgba(45, 50, 80, 0.95)', 'rgba(40, 45, 70, 0.98)'];

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 50).duration(400)}
      style={styles.card}
    >
      {/* Glassmorphism Background */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Simplified card content */}
        <View style={styles.glassOverlay}>
          {/* Title Section - Minimal */}
          <View style={styles.titleSection}>
            <Text style={styles.cardTitle}>{step.title}</Text>
          </View>

          {/* Lottie Animation Container - Larger and centered */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={lottieRef}
              source={step.animation}
              style={styles.lottie}
              loop
              autoPlay={isActive}
              speed={0.8}
            />
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Step {step.id}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

export default function RentalJourneyProgress() {
  const { t } = useTranslation();
  const { theme, themeMode } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const isUserScrolling = useRef(false);

  // Get translated steps
  const steps = stepData.map(step => ({
    ...step,
    title: t.rentalJourney[step.titleKey as keyof typeof t.rentalJourney] as string,
  }));

  // Auto-scroll function
  const scrollToIndex = useCallback((index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  }, []);

  // Start auto-scroll
  const startAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }

    autoScrollTimer.current = setInterval(() => {
      if (!isUserScrolling.current) {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % steps.length;
          scrollToIndex(nextIndex);
          return nextIndex;
        });
      }
    }, AUTO_SCROLL_INTERVAL);
  }, [steps.length, scrollToIndex]);

  // Stop auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  // Handle scroll events
  const handleScrollBeginDrag = () => {
    isUserScrolling.current = true;
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    isUserScrolling.current = false;
    setTimeout(() => {
      startAutoScroll();
    }, 2000);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / CARD_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(index, steps.length - 1)));
  };

  // Render individual card
  const renderCard = ({ item, index }: { item: Step & { title: string }; index: number }) => (
    <RentalCard
      step={item}
      index={index}
      isActive={index === currentIndex}
    />
  );

  // Pagination dots
  const renderPagination = () => (
    <View style={styles.pagination}>
      {steps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex
              ? [styles.dotActive, { backgroundColor: theme.colors.primary }]
              : [styles.dotInactive, { backgroundColor: themeMode === 'dark' ? '#4B5563' : '#D1D5DB' }],
          ]}
        />
      ))}
    </View>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(150).duration(500)}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
      />
      {renderPagination()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  flatListContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH - CARD_MARGIN,
    marginHorizontal: CARD_MARGIN / 2,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassOverlay: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    minHeight: 260,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  borderGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  titleUnderline: {
    width: 100,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
  },
  animationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lottie: {
    width: 300,
    height: 200,
  },
  stepIndicator: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
  },
  dotInactive: {
    width: 6,
  },
});
