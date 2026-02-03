/**
 * Animated List Component
 * Renders lists with staggered fade-in animations
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface AnimatedListProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemDelay?: number;
  containerStyle?: any;
  stagger?: boolean;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  data,
  renderItem,
  itemDelay = 50,
  containerStyle,
  stagger = true,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {data.map((item, index) => {
        const delay = stagger ? index * itemDelay : 0;

        return (
          <Animated.View
            key={item.id || index}
            entering={FadeInDown.delay(delay).springify().damping(15).stiffness(200)}
            layout={Layout.springify().damping(15).stiffness(200)}
          >
            {renderItem(item, index)}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
