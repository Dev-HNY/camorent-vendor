/**
 * Reset Password OTP Screen
 * Allows vendors to verify OTP sent to their phone via SMS
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { SuccessModal, ScreenHeader } from '../src/components';
import { authService } from '../src/services/api/authService';

// Icon
const ShieldCheckIcon = ({ color, size = 60 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ResetPasswordOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const phoneNumber = params.phone_number as string;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setErrorMessage('Please enter complete 6-digit OTP');
      setShowError(true);
      return;
    }

    try {
      setVerifying(true);

      // Verify OTP with backend
      const response = await authService.verifyResetOTP({ phone_number: phoneNumber, otp: otpCode });
      console.log('OTP verification response:', response);

      // Store verification token and navigate to new password screen
      const verificationToken = response.verification_token;
      router.push(`/new-password?phone_number=${encodeURIComponent(phoneNumber)}&verification_token=${encodeURIComponent(verificationToken)}`);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setErrorMessage(error.message || t.auth.invalidOTP);
      setShowError(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // Resend OTP by calling forgot password again
      await authService.forgotPassword({ phone_number: phoneNumber });
      console.log('OTP resent to:', phoneNumber);

      setErrorMessage('OTP resent successfully to your phone!');
      setShowError(true);
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setErrorMessage('Failed to resend OTP. Please try again.');
      setShowError(true);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

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
          <ScreenHeader title={t.auth.verifyOTPTitle} />

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <ShieldCheckIcon color={theme.colors.primary} size={50} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.auth.verifyOTPTitle}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Enter the OTP sent via SMS to
            </Text>
            <Text style={[styles.email, { color: theme.colors.primary }]}>{phoneNumber}</Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    {
                      borderColor: theme.colors.border.light,
                      color: theme.colors.text.primary,
                      backgroundColor: theme.colors.background.secondary,
                    },
                    digit ? { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '08' } : null,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  placeholderTextColor={theme.colors.text.tertiary}
                />
              ))}
            </View>

            {/* Resend OTP */}
            <TouchableOpacity onPress={handleResendOTP} style={styles.resendButton}>
              <Text style={[styles.resendText, { color: theme.colors.text.secondary }]}>{t.auth.didntReceive} </Text>
              <Text style={[styles.resendLink, { color: theme.colors.primary }]}>{t.auth.resendOTP}</Text>
            </TouchableOpacity>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
                (!isOtpComplete || verifying) && [styles.verifyButtonDisabled, { backgroundColor: theme.colors.text.tertiary }],
              ]}
              onPress={handleVerify}
              disabled={!isOtpComplete || verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>{t.auth.verifyAndContinue}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Info"
        message={errorMessage}
        icon={errorMessage.includes('resent') ? 'success' : 'error'}
        primaryButtonText="OK"
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
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  resendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 15,
  },
  resendLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  verifyButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  verifyButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
