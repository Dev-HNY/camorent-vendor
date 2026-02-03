/**
 * New Password Screen
 * Allows vendors to create a new password after OTP verification
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { SuccessModal, ScreenHeader } from '../src/components';
import { authService } from '../src/services/api/authService';

// Icons
const LockIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EyeOffIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckCircleIcon = ({ color, size = 60 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function NewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const phoneNumber = params.phone_number as string;
  const verificationToken = params.verification_token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleResetPassword = async () => {
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    if (password.trim() === '') {
      setPasswordError('Password is required');
      hasError = true;
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setPasswordError('Must have: 8+ chars, uppercase, lowercase, number, symbol');
        hasError = true;
      }
    }

    if (confirmPassword.trim() === '') {
      setConfirmPasswordError('Confirm password is required');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t.auth.passwordsMustMatch);
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);

      // Reset password with backend API
      const response = await authService.resetPassword({
        phone_number: phoneNumber,
        verification_token: verificationToken,
        new_password: password
      });
      console.log('Reset password response:', response);

      // Show success modal
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setErrorMessage(error.message || 'Failed to reset password. Please try again.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    return (
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword &&
      passwordRegex.test(password)
    );
  };

  const renderInputField = ({
    icon,
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    showToggle,
    toggleValue,
    onToggle,
  }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: error ? '#EF4444' : theme.colors.border.light,
          },
        ]}
      >
        <View style={[styles.inputIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>{icon}</View>
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }, showToggle && styles.inputWithToggle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !toggleValue}
          editable={!isLoading}
        />
        {showToggle && (
          <TouchableOpacity style={styles.eyeButton} onPress={onToggle}>
            {toggleValue ? (
              <EyeIcon color={theme.colors.text.tertiary} size={20} />
            ) : (
              <EyeOffIcon color={theme.colors.text.tertiary} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <ScreenHeader title={t.auth.createNewPassword} />

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <CheckCircleIcon color={theme.colors.primary} size={50} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.auth.createNewPassword}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              {t.auth.enterNewPassword}
            </Text>

            {/* Password Input */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              {renderInputField({
                icon: <LockIcon color={theme.colors.primary} size={20} />,
                label: t.auth.newPassword,
                value: password,
                onChangeText: (text: string) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                  if (confirmPasswordError && confirmPassword !== '') setConfirmPasswordError('');
                },
                placeholder: t.auth.enterPassword,
                error: passwordError,
                secureTextEntry: true,
                showToggle: true,
                toggleValue: showPassword,
                onToggle: () => setShowPassword(!showPassword),
              })}
            </Animated.View>

            {/* Confirm Password Input */}
            <Animated.View entering={FadeInDown.delay(250).duration(500)}>
              {renderInputField({
                icon: <LockIcon color="#3B82F6" size={20} />,
                label: t.auth.confirmNewPassword,
                value: confirmPassword,
                onChangeText: (text: string) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                },
                placeholder: t.auth.enterConfirmPassword,
                error: confirmPasswordError,
                secureTextEntry: true,
                showToggle: true,
                toggleValue: showConfirmPassword,
                onToggle: () => setShowConfirmPassword(!showConfirmPassword),
              })}
            </Animated.View>

            {/* Reset Password Button */}
            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
                  (!isFormValid() || isLoading) && [styles.submitButtonDisabled, { backgroundColor: theme.colors.text.tertiary }],
                ]}
                onPress={handleResetPassword}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>{t.auth.resetPassword}</Text>
                )}
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

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.replace('/login');
        }}
        title={t.auth.passwordResetSuccess}
        message={t.auth.passwordResetSuccessMessage}
        icon="success"
        primaryButtonText={t.auth.backToLogin}
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
    paddingBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 20,
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
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputWithToggle: {
    paddingRight: 0,
  },
  eyeButton: {
    padding: 10,
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
    marginTop: 12,
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
});
