/**
 * Location Selection Screen
 * First step in account creation - Select user location
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Logo } from '../components/common/Logo';
import { theme } from '../theme';
import type { LocationSelectionScreenNavigationProp } from '../navigation/types';

// Indian states and union territories
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const LocationSelectionScreen: React.FC = () => {
  const navigation = useNavigation<LocationSelectionScreenNavigationProp>();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
  };

  const handleNext = () => {
    navigation.navigate('SignIn');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
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
          <Text style={styles.title}>Where are you based?</Text>

          {/* Location Dropdown */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedLocation && styles.dropdownPlaceholder,
              ]}
            >
              {selectedLocation || '-Choose Location-'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Dropdown Options - With ScrollView to prevent overlap */}
          {isDropdownOpen && (
            <View style={styles.dropdownMenuContainer}>
              <ScrollView
                style={styles.dropdownMenu}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {INDIAN_STATES.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      index === INDIAN_STATES.length - 1 && styles.dropdownItemLast,
                    ]}
                    onPress={() => handleLocationSelect(location)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownItemText}>{location}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
              Next
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'flex-start', // Align to left
    marginBottom: theme.spacing.md,
    marginLeft: -theme.spacing.sm, // Adjust to align with screen edge
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
    width: '22%', // First step of multiple steps
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
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.fontSize.xxxl * theme.typography.lineHeight.tight,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 20,
    backgroundColor: theme.colors.background.primary,
  },
  dropdownText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: theme.colors.text.tertiary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  dropdownMenuContainer: {
    position: 'absolute',
    top: 120, // Position below title and dropdown
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  dropdownMenu: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.primary,
    ...theme.shadows.lg,
  },
  dropdownItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
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
