/**
 * Location Selection Screen
 * First step in account creation - Select user location
 * Features:
 * - Dark mode support
 * - Searchable dropdown with fuzzy search
 * - Smooth animations
 * - Industry-grade UX
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../src/components/common/Logo';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';

// Indian states and union territories (alphabetically sorted for better UX)
const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'New Delhi',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function LocationSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownAnimation] = useState(new Animated.Value(0));

  // Filtered states based on search query (fuzzy search)
  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return INDIAN_STATES;

    const query = searchQuery.toLowerCase().trim();
    return INDIAN_STATES.filter(state =>
      state.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setSearchQuery('');
    closeDropdown();
  };

  const openDropdown = () => {
    setIsDropdownOpen(true);
    Animated.spring(dropdownAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(dropdownAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsDropdownOpen(false);
      setSearchQuery('');
    });
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleNext = () => {
    router.push('/sign-in');
  };

  const handleBack = () => {
    router.back();
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Back Button - Positioned in top left corner */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size={64} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.title}>{t.locationSelection.title}</Text>
          <Text style={styles.subtitle}>
            {t.locationSelection.subtitle}
          </Text>

          {/* Location Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdown,
              isDropdownOpen && styles.dropdownActive,
            ]}
            onPress={toggleDropdown}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownLabel}>{t.locationSelection.stateLabel}</Text>
              <Text
                style={[
                  styles.dropdownText,
                  !selectedLocation && styles.dropdownPlaceholder,
                ]}
              >
                {selectedLocation || t.locationSelection.chooseLocation}
              </Text>
            </View>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              }}
            >
              <Text style={styles.dropdownArrow}>▼</Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Dropdown Menu with Search */}
          {isDropdownOpen && (
            <Animated.View
              style={[
                styles.dropdownMenuContainer,
                {
                  opacity: dropdownAnimation,
                  transform: [
                    {
                      translateY: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                    {
                      scale: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search state or UT..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  autoCapitalize="words"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Results Count */}
              {searchQuery.trim() && (
                <View style={styles.resultsCount}>
                  <Text style={styles.resultsCountText}>
                    {filteredStates.length} result{filteredStates.length !== 1 ? 's' : ''} found
                  </Text>
                </View>
              )}

              {/* Dropdown List */}
              <ScrollView
                style={styles.dropdownMenu}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {filteredStates.length > 0 ? (
                  filteredStates.map((location, index) => (
                    <TouchableOpacity
                      key={location}
                      style={[
                        styles.dropdownItem,
                        selectedLocation === location && styles.dropdownItemSelected,
                        index === filteredStates.length - 1 && styles.dropdownItemLast,
                      ]}
                      onPress={() => handleLocationSelect(location)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedLocation === location && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {location}
                      </Text>
                      {selectedLocation === location && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No locations found</Text>
                    <Text style={styles.noResultsSubtext}>
                      Try a different search term
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeDropdownButton}
                onPress={closeDropdown}
                activeOpacity={0.8}
              >
                <Text style={styles.closeDropdownButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Backdrop - Close dropdown when tapping outside */}
          {isDropdownOpen && (
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={closeDropdown}
            />
          )}
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedLocation && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={!selectedLocation}
          >
            <Text
              style={[
                styles.nextButtonText,
                !selectedLocation && styles.nextButtonTextDisabled,
              ]}
            >
              {t.locationSelection.next}
            </Text>
            <Text
              style={[
                styles.nextButtonArrow,
                !selectedLocation && styles.nextButtonTextDisabled,
              ]}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    header: {
      paddingTop: Platform.OS === 'android' ? theme.spacing.lg : theme.spacing.md,
    },
    backButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
      marginLeft: -theme.spacing.sm,
    },
    backArrow: {
      fontSize: 28,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.regular,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    progressContainer: {
      width: '100%',
      height: 4,
      backgroundColor: theme.colors.background.tertiary,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      width: '22%',
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    content: {
      flex: 1,
      paddingTop: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize.xxxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      lineHeight: theme.typography.fontSize.xxxl * theme.typography.lineHeight.tight,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xl,
    },
    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border.light,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.background.secondary,
      ...theme.shadows.sm,
    },
    dropdownActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background.primary,
    },
    dropdownContent: {
      flex: 1,
    },
    dropdownLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      marginBottom: 4,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dropdownText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    dropdownPlaceholder: {
      color: theme.colors.text.tertiary,
      fontWeight: theme.typography.fontWeight.regular,
    },
    dropdownArrow: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
    },
    dropdownMenuContainer: {
      position: 'absolute',
      top: 180,
      left: 0,
      right: 0,
      zIndex: 1000,
      elevation: 10,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      ...theme.shadows.lg,
      overflow: 'hidden',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.secondary,
    },
    searchIcon: {
      fontSize: 18,
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      paddingVertical: theme.spacing.xs,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    clearButtonText: {
      fontSize: 18,
      color: theme.colors.text.tertiary,
    },
    resultsCount: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.tertiary,
    },
    resultsCountText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    dropdownMenu: {
      maxHeight: 300,
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md + 2,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    dropdownItemSelected: {
      backgroundColor: theme.colors.background.tertiary,
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    dropdownItemText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      flex: 1,
    },
    dropdownItemTextSelected: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary,
    },
    checkmark: {
      fontSize: 18,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.bold,
    },
    noResults: {
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.semibold,
      marginBottom: theme.spacing.xs,
    },
    noResultsSubtext: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.tertiary,
    },
    closeDropdownButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.secondary,
    },
    closeDropdownButtonText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: -theme.spacing.lg,
      right: -theme.spacing.lg,
      bottom: -1000,
      backgroundColor: 'transparent',
      zIndex: 999,
    },
    footer: {
      paddingBottom: Platform.OS === 'android' ? theme.spacing.lg : theme.spacing.md,
      paddingTop: theme.spacing.md,
      alignItems: 'flex-end',
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    nextButtonDisabled: {
      opacity: 0.4,
    },
    nextButtonText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary,
      marginRight: theme.spacing.sm,
    },
    nextButtonTextDisabled: {
      color: theme.colors.text.tertiary,
    },
    nextButtonArrow: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
