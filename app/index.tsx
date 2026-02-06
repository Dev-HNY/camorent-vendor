/**
 * Welcome/Onboarding Screen - Industry Grade
 * Landing screen with theme and language selection
 * Provides first-time user experience with preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../src/components/common/Logo';
import { ImageCollage } from '../src/components/onboarding/ImageCollage';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import type { Language } from '../src/context/LanguageContext';
import { authService } from '../src/services/api/authService';
import { TokenManager } from '../src/services/api/client';
import { useUserStore } from '../src/store/userStore';

// Modern SVG Icons
const LanguageIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={color} strokeWidth="2" />
  </Svg>
);

const ThemeIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SettingsIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path
      d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.07 7.07l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.07-7.07l4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme, themeMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, setUserProfile } = useUserStore();
  const insets = useSafeAreaInsets();
  const [showPreferences, setShowPreferences] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user has a valid token
      const token = await TokenManager.getToken();

      if (!token) {
        // No token, user needs to login/signup
        setIsCheckingAuth(false);
        return;
      }

      // Token exists, fetch user profile to check completion status
      const vendorUser = await authService.getMe();

      // Update user store with fetched data
      setUserProfile({
        firstName: vendorUser.first_name || '',
        lastName: vendorUser.last_name || '',
        contactNo: vendorUser.phone_number,
        email: vendorUser.email,
        organization: vendorUser.company_name || '',
        gstNo: vendorUser.GSTIN_no || '',
        isVerified: true,
        gstVerified: !!vendorUser.GSTIN_no,
        addressId: vendorUser.address_id,
        hasAddress: !!vendorUser.address_id,
        workExperience: user?.workExperience || '',
        frontIdImage: user?.frontIdImage || null,
        backIdImage: user?.backIdImage || null,
      });

      // Route based on completion status
      if (!vendorUser.GSTIN_no) {
        // User hasn't completed GST verification
        router.replace('/verification');
      } else if (!vendorUser.address_id) {
        // User hasn't completed address setup
        router.replace('/address-setup');
      } else {
        // User has completed everything
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      // Token invalid or expired, clear it and show welcome screen
      await TokenManager.clearTokens();
      setIsCheckingAuth(false);
    }
  };

  const handleGetStarted = () => {
    router.push('/auth-choice');
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleThemeToggle = (mode: 'light' | 'dark') => {
    if (themeMode !== mode) {
      toggleTheme();
    }
    setShowThemeModal(false);
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background.primary}
        />
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
          <Logo size={80} />
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 24 }}
          />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
        {/* Header Section with Logo */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <Logo size={80} />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t.welcome.title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {t.welcome.subtitle}
          </Text>
        </Animated.View>

        {/* Image Collage Section */}
        <Animated.View entering={FadeIn.delay(300).duration(800)} style={styles.collageSection}>
          <ImageCollage />
        </Animated.View>

        {/* Preferences Button */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.preferencesContainer}>
          <TouchableOpacity
            style={[styles.preferencesButton, {
              backgroundColor: theme.colors.background.secondary,
              borderColor: theme.colors.border.light
            }]}
            onPress={() => setShowPreferences(!showPreferences)}
            activeOpacity={0.7}
          >
            <SettingsIcon color={theme.colors.text.secondary} size={20} />
            <Text style={[styles.preferencesButtonText, { color: theme.colors.text.secondary }]}>
              {t.welcome.preferences}
            </Text>
          </TouchableOpacity>

          {/* Quick Settings (Expanded State) */}
          {showPreferences && (
            <Animated.View
              entering={SlideInRight.duration(300)}
              style={[styles.quickSettings, {
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.border.light
              }]}
            >
              {/* Language Selector */}
              <TouchableOpacity
                style={[styles.settingRow, { borderBottomColor: theme.colors.border.light }]}
                onPress={() => setShowLanguageModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <LanguageIcon color={theme.colors.primary} size={22} />
                  <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                    {t.welcome.chooseLanguage}
                  </Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={[styles.settingValue, { color: theme.colors.text.secondary }]}>
                    {language === 'en' ? t.profile.english : t.profile.hindi}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Theme Selector */}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowThemeModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <ThemeIcon color={theme.colors.primary} size={22} />
                  <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                    {t.welcome.chooseTheme}
                  </Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={[styles.settingValue, { color: theme.colors.text.secondary }]}>
                    {themeMode === 'light' ? t.profile.lightMode : t.profile.darkMode}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        {/* Footer Section with CTA */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.9}
            style={styles.getStartedButton}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text.inverse }]}>
                {t.welcome.getStarted}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {t.welcome.chooseLanguage}
            </Text>

            <TouchableOpacity
              style={[styles.modalOption, {
                backgroundColor: language === 'en' ? theme.colors.primary + '15' : 'transparent',
                borderColor: language === 'en' ? theme.colors.primary : theme.colors.border.light
              }]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalOptionText, {
                color: language === 'en' ? theme.colors.primary : theme.colors.text.primary
              }]}>
                {t.profile.english}
              </Text>
              {language === 'en' && <CheckIcon color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, {
                backgroundColor: language === 'hi' ? theme.colors.primary + '15' : 'transparent',
                borderColor: language === 'hi' ? theme.colors.primary : theme.colors.border.light
              }]}
              onPress={() => handleLanguageSelect('hi')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalOptionText, {
                color: language === 'hi' ? theme.colors.primary : theme.colors.text.primary
              }]}>
                {t.profile.hindi}
              </Text>
              {language === 'hi' && <CheckIcon color={theme.colors.primary} />}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowThemeModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {t.welcome.chooseTheme}
            </Text>

            <TouchableOpacity
              style={[styles.modalOption, {
                backgroundColor: themeMode === 'light' ? theme.colors.primary + '15' : 'transparent',
                borderColor: themeMode === 'light' ? theme.colors.primary : theme.colors.border.light
              }]}
              onPress={() => handleThemeToggle('light')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalOptionText, {
                color: themeMode === 'light' ? theme.colors.primary : theme.colors.text.primary
              }]}>
                {t.profile.lightMode}
              </Text>
              {themeMode === 'light' && <CheckIcon color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, {
                backgroundColor: themeMode === 'dark' ? theme.colors.primary + '15' : 'transparent',
                borderColor: themeMode === 'dark' ? theme.colors.primary : theme.colors.border.light
              }]}
              onPress={() => handleThemeToggle('dark')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalOptionText, {
                color: themeMode === 'dark' ? theme.colors.primary : theme.colors.text.primary
              }]}>
                {t.profile.darkMode}
              </Text>
              {themeMode === 'dark' && <CheckIcon color={theme.colors.primary} />}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  collageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferencesContainer: {
    marginBottom: 12,
  },
  preferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  preferencesButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickSettings: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 12,
  },
  getStartedButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#565caa',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
