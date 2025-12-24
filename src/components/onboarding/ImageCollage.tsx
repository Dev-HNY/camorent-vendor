/**
 * ImageCollage Component
 * Artistic overlapping image layout for onboarding screen
 */

import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Local image assets
const IMAGES = {
  side1: require('../../../assets/side-1.png'),
  side2: require('../../../assets/side-2.png'),
  center: require('../../../assets/center.png'),
  side3: require('../../../assets/side-3.png'),
  side4: require('../../../assets/side-4.png'),
};

export const ImageCollage: React.FC = () => {
  // Responsive sizing based on screen width
  const containerHeight = SCREEN_WIDTH * 0.9;
  const imageSize = {
    small: SCREEN_WIDTH * 0.35,
    medium: SCREEN_WIDTH * 0.42,
    large: SCREEN_WIDTH * 0.48,
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Top Left - Side 1 */}
      <View
        style={[
          styles.imageWrapper,
          {
            width: imageSize.small,
            height: imageSize.small,
            top: '5%',
            left: '8%',
            zIndex: 5,
          },
        ]}
      >
        <Image source={IMAGES.side1} style={styles.image} />
      </View>

      {/* Top Right - Side 2 */}
      <View
        style={[
          styles.imageWrapper,
          {
            width: imageSize.small,
            height: imageSize.small,
            top: '8%',
            right: '8%',
            zIndex: 4,
          },
        ]}
      >
        <Image source={IMAGES.side2} style={styles.image} />
      </View>

      {/* Center - Main image (center.png) */}
      <View
        style={[
          styles.imageWrapper,
          {
            width: imageSize.large,
            height: imageSize.large,
            top: '30%',
            left: '26%',
            zIndex: 6,
          },
        ]}
      >
        <Image source={IMAGES.center} style={styles.image} />
      </View>

      {/* Bottom Left - Side 3 */}
      <View
        style={[
          styles.imageWrapper,
          {
            width: imageSize.medium,
            height: imageSize.medium,
            bottom: '8%',
            left: '5%',
            zIndex: 3,
          },
        ]}
      >
        <Image source={IMAGES.side3} style={styles.image} />
      </View>

      {/* Bottom Right - Side 4 */}
      <View
        style={[
          styles.imageWrapper,
          {
            width: imageSize.medium,
            height: imageSize.medium,
            bottom: '5%',
            right: '5%',
            zIndex: 2,
          },
        ]}
      >
        <Image source={IMAGES.side4} style={styles.image} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginVertical: theme.spacing.xl,
  },
  imageWrapper: {
    position: 'absolute',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.tertiary,
    ...theme.shadows.lg,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
