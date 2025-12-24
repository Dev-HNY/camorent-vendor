/**
 * Sign In Screen
 * User registration form for Camorent
 */

import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/common/Button';
import { theme } from '../theme';
import type { SignInScreenNavigationProp } from '../navigation/types';

// Work experience options
const WORK_EXPERIENCE_OPTIONS = [
  '0-1 Years',
  '1-2 Years',
  '2-5 Years',
  '5-10 Years',
  '10+ Years',
];

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [address, setAddress] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [organization, setOrganization] = useState('');
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] = useState(false);

  const isFormValid = () => {
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      contactNo.trim() !== '' &&
      address.trim() !== '' &&
      workExperience !== '' &&
      organization.trim() !== ''
    );
  };

  const handleSignIn = () => {
    if (isFormValid()) {
      navigation.navigate('Verification');
    }
  };

  const handleExperienceSelect = (experience: string) => {
    setWorkExperience(experience);
    setIsExperienceDropdownOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Sign In with Camorent</Text>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>First Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Rahul"
              placeholderTextColor={theme.colors.text.tertiary}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          {/* Last Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Last Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Sharma"
              placeholderTextColor={theme.colors.text.tertiary}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          {/* Contact No */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Contact No*</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.countryCode}>
                <Image
                  source={{ uri: 'https://flagcdn.com/w40/in.png' }}
                  style={styles.flag}
                />
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210"
                placeholderTextColor={theme.colors.text.tertiary}
                value={contactNo}
                onChangeText={setContactNo}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Address*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your address"
              placeholderTextColor={theme.colors.text.tertiary}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Work Experience and Organization Row */}
          <View style={styles.rowContainer}>
            {/* Work Experience */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>Work Experience</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsExperienceDropdownOpen(!isExperienceDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !workExperience && styles.dropdownPlaceholder,
                  ]}
                >
                  {workExperience || 'Choose Year'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Organization */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>Organization</Text>
              <TextInput
                style={styles.input}
                placeholder="Company name"
                placeholderTextColor={theme.colors.text.tertiary}
                value={organization}
                onChangeText={setOrganization}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Dropdown Menu - Positioned outside to prevent overflow */}
          {isExperienceDropdownOpen && (
            <View style={styles.experienceDropdownContainer}>
              <ScrollView
                style={styles.dropdownMenu}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {WORK_EXPERIENCE_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      index === WORK_EXPERIENCE_OPTIONS.length - 1 &&
                        styles.dropdownItemLast,
                    ]}
                    onPress={() => handleExperienceSelect(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="primary"
            fullWidth
            disabled={!isFormValid()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 16,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 16,
    gap: theme.spacing.sm,
    minWidth: 100,
  },
  flag: {
    width: 24,
    height: 16,
  },
  countryCodeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 16,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 16,
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
  experienceDropdownContainer: {
    marginTop: -theme.spacing.lg,
    zIndex: 1000,
    elevation: 10,
  },
  dropdownMenu: {
    maxHeight: 200,
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
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
});
