/**
 * Rental Process Carousel Component
 * Horizontal auto-sliding carousel showing rental process steps
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 16;

const PickupIcon = ({ size = 32, color = '#3B82F6' }: { size?: number; color?: string }) => (
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

const ScanIcon = ({ size = 32, color = '#22C55E' }: { size?: number; color?: string }) => (
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

const UseIcon = ({ size = 32, color = '#3B82F6' }: { size?: number; color?: string }) => (
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

const ReturnIcon = ({ size = 32, color = '#F59E0B' }: { size?: number; color?: string }) => (
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

const RevenueIcon = ({ size = 32, color = '#22C55E' }: { size?: number; color?: string }) => (
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
  id: number;
  icon?: React.FC<{ size?: number; color?: string }>;
  image?: any;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const getSteps = (t: any): Step[] => [
  {
    id: 1,
    image: require('../../assets/rental-journey/vendor-1.jpeg'),
    label: t.rentalJourney.step1,
    description: t.rentalJourney.step1Desc,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 2,
    image: require('../../assets/rental-journey/vendor-2.jpeg'),
    label: t.rentalJourney.step2,
    description: t.rentalJourney.step2Desc,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: 3,
    icon: PickupIcon,
    label: t.rentalJourney.step3,
    description: t.rentalJourney.step3Desc,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 4,
    icon: ScanIcon,
    label: t.rentalJourney.step4,
    description: t.rentalJourney.step4Desc,
    color: '#22C55E',
    bgColor: '#DCFCE7',
  },
  {
    id: 5,
    icon: UseIcon,
    label: t.rentalJourney.step5,
    description: t.rentalJourney.step5Desc,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 6,
    icon: ReturnIcon,
    label: t.rentalJourney.step6,
    description: t.rentalJourney.step6Desc,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: 7,
    icon: RevenueIcon,
    label: t.rentalJourney.step7,
    description: t.rentalJourney.step7Desc,
    color: '#22C55E',
    bgColor: '#DCFCE7',
  },
];

export default function RentalProcessCarousel() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const steps = getSteps(t);
  const scrollX = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);

  useEffect(() => {
    // Auto-scroll every 3 seconds
    const autoScrollInterval = setInterval(() => {
      const nextIndex = (Math.round(currentIndex.value) + 1) % steps.length;
      currentIndex.value = nextIndex;

      // Scroll to next card
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }, 3000);

    return () => clearInterval(autoScrollInterval);
  }, [steps.length]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
      currentIndex.value = index;
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.rentalJourney.carouselTitle}</Text>
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.badgeText, { color: theme.colors.text.inverse }]}>{steps.length} {t.rentalJourney.steps}</Text>
        </View>
      </View>

      {/* Carousel */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {steps.map((step, index) => (
          <StepCardWrapper
            key={step.id}
            step={step}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {steps.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </View>
    </View>
  );
}

// Individual Step Card Component
const StepCard = ({
  step,
  index,
  scrollX,
  theme,
}: {
  step: Step;
  index: number;
  scrollX: Animated.SharedValue<number>;
  theme: any;
}) => {
  const StepIcon = step.icon;

  const cardStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = interpolate(scrollX.value, inputRange, [0.90, 1, 0.90]);
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.colors.background.tertiary }, cardStyle]}>
      {step.image ? (
        <Image
          source={step.image}
          style={styles.stepImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.iconPlaceholder, { backgroundColor: theme.colors.background.tertiary }]}>
          {StepIcon && <StepIcon size={48} color={step.color} />}
        </View>
      )}
    </Animated.View>
  );
};

// Pagination Dot Component
const PaginationDot = ({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) => {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const width = interpolate(scrollX.value, inputRange, [6, 18, 6]);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4]);

    return {
      width,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
};

// Pass theme through context
const StepCardWrapper = (props: any) => {
  const { theme } = useTheme();
  return <StepCard {...props} theme={theme} />;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#565caa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    gap: CARD_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.65,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  stepImage: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingBottom: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#565caa',
  },
});
