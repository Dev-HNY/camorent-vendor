/**
 * Address Setup Screen
 * Collects detailed address information after verification
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/common/Button';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { useUserStore } from '../src/store/userStore';
import { SuccessModal } from '../src/components';
import { createAddress } from '../src/services/api/addressService';
import { logger } from '../src/utils/logger';

const TAG = 'AddressSetupScreen';

// Indian states and union territories (alphabetically sorted)
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

export default function AddressSetupScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const updateUserProfile = useUserStore((state) => state.updateUserProfile);
  const insets = useSafeAreaInsets();

  // Form state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Dropdown state
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [dropdownAnimation] = useState(new RNAnimated.Value(0));

  // Validation state
  const [addressLine1Error, setAddressLine1Error] = useState('');
  const [cityError, setCityError] = useState('');
  const [stateError, setStateError] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  // Loading state
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Filtered states based on search query
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery.trim()) return INDIAN_STATES;
    const query = stateSearchQuery.toLowerCase().trim();
    return INDIAN_STATES.filter(s => s.toLowerCase().includes(query));
  }, [stateSearchQuery]);

  const handleStateSelect = (selectedState: string) => {
    setState(selectedState);
    setStateSearchQuery('');
    setStateError('');
    closeStateDropdown();
  };

  const openStateDropdown = () => {
    setIsStateDropdownOpen(true);
    RNAnimated.spring(dropdownAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const closeStateDropdown = () => {
    RNAnimated.timing(dropdownAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsStateDropdownOpen(false);
      setStateSearchQuery('');
    });
  };

  const toggleStateDropdown = () => {
    if (isStateDropdownOpen) {
      closeStateDropdown();
    } else {
      openStateDropdown();
    }
  };

  const isFormValid = () => {
    return (
      addressLine1.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      pincode.trim() !== '' &&
      /^\d{6}$/.test(pincode)
    );
  };

  const validatePincode = (value: string) => {
    if (!/^\d{6}$/.test(value)) {
      setPincodeError(t.addressSetup.pincodeInvalid);
    } else {
      setPincodeError('');
    }
  };

  const handleSubmit = async () => {
    // Reset errors
    setAddressLine1Error('');
    setCityError('');
    setStateError('');
    setPincodeError('');

    // Validate
    let hasError = false;
    if (addressLine1.trim() === '') {
      setAddressLine1Error(t.addressSetup.addressRequired);
      hasError = true;
    }
    if (city.trim() === '') {
      setCityError(t.addressSetup.cityRequired);
      hasError = true;
    }
    if (state.trim() === '') {
      setStateError(t.addressSetup.stateRequired);
      hasError = true;
    }
    if (!pincode.trim()) {
      setPincodeError(t.addressSetup.pincodeRequired);
      hasError = true;
    } else if (!/^\d{6}$/.test(pincode)) {
      setPincodeError(t.addressSetup.pincodeInvalid);
      hasError = true;
    }

    if (hasError) return;

    setSubmitting(true);

    try {
      // Call address API
      const data = await createAddress({
        address_line1: addressLine1,
        address_line2: addressLine2 || undefined,
        city: city,
        state: state,
        pincode: pincode,
        country: 'India',
        type: 'pickup',
        is_default: true,
      });

      // Update user store
      updateUserProfile({
        addressId: data.address_id,
        hasAddress: true,
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      logger.error(TAG, 'Address creation error:', error);
      setAddressLine1Error(error.message || t.addressSetup.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={theme.colors.background.primary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.addressSetup.title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {t.addressSetup.subtitle}
          </Text>
        </Animated.View>

        {/* Address Line 1 */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>{t.addressSetup.addressLine1}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder={t.addressSetup.addressLine1Placeholder}
                placeholderTextColor={theme.colors.text.secondary}
                value={addressLine1}
                onChangeText={(text) => {
                  setAddressLine1(text);
                  setAddressLine1Error('');
                }}
                editable={!submitting}
              />
            </View>
            {addressLine1Error ? (
              <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{addressLine1Error}</Text>
            ) : null}
          </View>
        </Animated.View>

        {/* Address Line 2 */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>{t.addressSetup.addressLine2}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder={t.addressSetup.addressLine2Placeholder}
                placeholderTextColor={theme.colors.text.secondary}
                value={addressLine2}
                onChangeText={setAddressLine2}
                editable={!submitting}
              />
            </View>
          </View>
        </Animated.View>

        {/* City and State Row */}
        <View style={styles.rowContainer}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.halfField}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>{t.addressSetup.city}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder={t.addressSetup.cityPlaceholder}
                placeholderTextColor={theme.colors.text.secondary}
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  setCityError('');
                }}
                editable={!submitting}
                autoCapitalize="words"
              />
            </View>
            {cityError ? <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{cityError}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.halfField}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>{t.addressSetup.state}</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                { backgroundColor: theme.colors.background.primary, borderColor: isStateDropdownOpen ? theme.colors.primary : theme.colors.border.light },
                styles.dropdownContainer,
              ]}
              onPress={toggleStateDropdown}
              activeOpacity={0.8}
              disabled={submitting}
            >
              <View style={styles.dropdownContent}>
                <Text
                  style={[
                    styles.dropdownText,
                    { color: state ? theme.colors.text.primary : theme.colors.text.secondary },
                  ]}
                  numberOfLines={1}
                >
                  {state || t.addressSetup.selectState}
                </Text>
              </View>
              <RNAnimated.View
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
                <Text style={[styles.dropdownArrow, { color: theme.colors.text.secondary }]}>▼</Text>
              </RNAnimated.View>
            </TouchableOpacity>
            {stateError ? <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{stateError}</Text> : null}
          </Animated.View>
        </View>

        {/* Pincode */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>{t.addressSetup.pincode}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder={t.addressSetup.pincodePlaceholder}
                placeholderTextColor={theme.colors.text.secondary}
                value={pincode}
                onChangeText={(text) => {
                  setPincode(text);
                  validatePincode(text);
                }}
                editable={!submitting}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            {pincodeError ? <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{pincodeError}</Text> : null}
          </View>
        </Animated.View>

        {/* State Dropdown Menu */}
        {isStateDropdownOpen && (
          <RNAnimated.View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: theme.colors.background.primary,
                borderColor: theme.colors.border.light,
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
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.secondary, borderBottomColor: theme.colors.border.light }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text.primary }]}
                placeholder={t.addressSetup.searchState}
                placeholderTextColor={theme.colors.text.secondary}
                value={stateSearchQuery}
                onChangeText={setStateSearchQuery}
                autoFocus
                autoCapitalize="words"
              />
              {stateSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setStateSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={[styles.clearButtonText, { color: theme.colors.text.secondary }]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Results Count */}
            {stateSearchQuery.trim() && (
              <View style={[styles.resultsCount, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.resultsCountText, { color: theme.colors.text.secondary }]}>
                  {filteredStates.length} {t.addressSetup.resultsFound}
                </Text>
              </View>
            )}

            {/* Dropdown List */}
            <ScrollView
              style={styles.dropdownList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {filteredStates.length > 0 ? (
                filteredStates.map((stateName, index) => (
                  <TouchableOpacity
                    key={stateName}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: theme.colors.border.light },
                      state === stateName && [styles.dropdownItemSelected, { backgroundColor: theme.colors.background.secondary }],
                      index === filteredStates.length - 1 && styles.dropdownItemLast,
                    ]}
                    onPress={() => handleStateSelect(stateName)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: theme.colors.text.primary },
                        state === stateName && [styles.dropdownItemTextSelected, { color: theme.colors.primary }],
                      ]}
                    >
                      {stateName}
                    </Text>
                    {state === stateName && (
                      <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResults}>
                  <Text style={[styles.noResultsText, { color: theme.colors.text.secondary }]}>{t.addressSetup.noStatesFound}</Text>
                  <Text style={[styles.noResultsSubtext, { color: theme.colors.text.secondary }]}>
                    {t.addressSetup.tryDifferentSearch}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeDropdownButton, { backgroundColor: theme.colors.background.secondary, borderTopColor: theme.colors.border.light }]}
              onPress={closeStateDropdown}
              activeOpacity={0.8}
            >
              <Text style={[styles.closeDropdownButtonText, { color: theme.colors.primary }]}>{t.addressSetup.close}</Text>
            </TouchableOpacity>
          </RNAnimated.View>
        )}

        {/* Backdrop */}
        {isStateDropdownOpen && (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeStateDropdown}
          />
        )}

        {/* Buttons */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.buttonContainer}>
          <Button
            title={submitting ? t.addressSetup.saving : t.addressSetup.saveAddress}
            onPress={handleSubmit}
            disabled={!isFormValid() || submitting}
            loading={submitting}
          />
        </Animated.View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={t.addressSetup.successTitle}
        message={t.addressSetup.successMessage}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(tabs)');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 15,
    minHeight: 52,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  dropdownContent: {
    flex: 1,
    paddingLeft: 16,
  },
  dropdownText: {
    fontSize: 15,
  },
  dropdownArrow: {
    fontSize: 12,
    paddingRight: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 260,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
    maxHeight: 500,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dropdownList: {
    maxHeight: 350,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownItemSelected: {
    backgroundColor: '#F3F4F6',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 15,
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
  },
  noResults: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 13,
  },
  closeDropdownButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  closeDropdownButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});
