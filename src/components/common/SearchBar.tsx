/**
 * Premium Search Bar
 * iOS & Airbnb-inspired search with smooth animations
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { SearchIcon, CloseIcon } from './icons';
import { Touchable } from './Touchable';
import { borderRadius, spacing, scaleWidth, scaleHeight } from '../../utils/responsive';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  blurBackground?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFocus,
  onBlur,
  autoFocus = false,
  blurBackground = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);
  const clearButtonScale = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
    });
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    if (onBlur) onBlur();
  };

  const handleClear = () => {
    onChangeText('');
  };

  React.useEffect(() => {
    clearButtonScale.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value]);

  const containerStyle = useAnimatedStyle(() => ({
    borderWidth: 2,
    borderColor: focusAnimation.value
      ? colors.primary[500]
      : colors.border.medium,
    shadowOpacity: focusAnimation.value ? 0.1 : 0.05,
  }));

  const clearButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: clearButtonScale.value }],
    opacity: clearButtonScale.value,
  }));

  const searchContent = (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.searchIconContainer}>
        <SearchIcon color={isFocused ? colors.primary[500] : colors.neutral[400]} size={20} />
      </View>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {value.length > 0 && (
        <Animated.View style={clearButtonStyle}>
          <Touchable
            onPress={handleClear}
            haptic="light"
            style={styles.clearButton}
          >
            <CloseIcon color={colors.neutral[500]} size={16} />
          </Touchable>
        </Animated.View>
      )}
    </Animated.View>
  );

  if (blurBackground && Platform.OS === 'ios') {
    return (
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        {searchContent}
      </BlurView>
    );
  }

  return searchContent;
};

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.primary,
    padding: 0,
  },
  clearButton: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: scaleWidth(14),
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
