/**
 * Forgot Password Screen
 * Allows vendors to request password reset via SMS OTP
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
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { SuccessModal, ScreenHeader } from '../src/components';
import { authService } from '../src/services/api/authService';

// Icons
const PhoneIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const KeyIcon = ({ color, size = 80 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="15" r="5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 11L22 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 6L22 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 4L22 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validatePhone = (phone: string): boolean => {
    // Indian phone number: 10 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    setPhoneError('');

    if (phoneNumber.trim() === '') {
      setPhoneError('Phone number is required');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setIsLoading(true);

      // Add +91 prefix for Indian numbers
      const formattedPhone = `+91${phoneNumber}`;

      // Send OTP to phone via SMS
      await authService.forgotPassword({ phone_number: formattedPhone });

      // Navigate to OTP verification screen
      router.push(`/reset-password-otp?phone_number=${encodeURIComponent(formattedPhone)}`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send OTP. Please try again.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = phoneNumber.trim() !== '' && validatePhone(phoneNumber);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <ScreenHeader title={t.auth.forgotPasswordTitle} />

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <KeyIcon color={theme.colors.primary} size={60} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.auth.resetYourPassword}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              {t.auth.enterPhoneForOtp}
            </Text>

            {/* Phone Number Input */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Phone Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.background.secondary,
                    borderColor: phoneError ? '#EF4444' : theme.colors.border.light,
                  },
                ]}
              >
                <View style={[styles.inputIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                  <PhoneIcon color={theme.colors.primary} size={20} />
                </View>
                <View style={styles.phoneInputContainer}>
                  <Text style={[styles.countryCode, { color: theme.colors.text.secondary }]}>+91</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text.primary }]}
                    placeholder="Enter 10-digit phone number"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      // Only allow digits
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setPhoneNumber(cleaned);
                      if (phoneError) setPhoneError('');
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!isLoading}
                  />
                </View>
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </Animated.View>

            {/* Send OTP Button */}
            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
                  (!isFormValid || isLoading) && [styles.submitButtonDisabled, { backgroundColor: theme.colors.text.tertiary }],
                ]}
                onPress={handleSendOTP}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>{t.auth.sendOTP}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Back to Login */}
            <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.colors.text.secondary }]}>{t.auth.rememberPassword} </Text>
              <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
                <Text style={[styles.loginLink, { color: theme.colors.primary }]}>{t.auth.backToLogin}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
        primaryButtonText="OK"
        icon="error"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  inputIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
