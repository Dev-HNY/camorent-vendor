/**
 * OTP Verification Screen - WITH API INTEGRATION
 * Phone number verification with 4-digit SMS OTP for Camorent
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '../src/components/common/Button';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { useUserStore } from '../src/store/userStore';
import { authService } from '../src/services/api';
import { SuccessModal } from '../src/components';
import { useNotification } from '../src/context/NotificationContext';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme: appTheme, themeMode } = useTheme();
  const { t } = useTranslation();
  const userProfile = useUserStore((state) => state.user);
  const updateUserProfile = useUserStore((state) => state.updateUserProfile);
  const { registerPushToken } = useNotification();

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Modal states
  const [showVerificationFailed, setShowVerificationFailed] = useState(false);
  const [verificationErrorMessage, setVerificationErrorMessage] = useState('');
  const [showOtpSent, setShowOtpSent] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [showResendFailed, setShowResendFailed] = useState(false);
  const [resendErrorMessage, setResendErrorMessage] = useState('');

  // Start resend timer
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = () => {
    return otp.every((digit) => digit !== '');
  };

  const handleVerify = async () => {
    if (!isOtpComplete()) return;

    try {
      setIsLoading(true);
      const otpValue = otp.join('');

      // Verify SMS OTP and complete signup (auto-login)
      await authService.verifySignupOTP({
        phone_number: userProfile?.contactNo || '',
        password: (userProfile as any)?.password || '',
        otp: otpValue,
        email: (userProfile as any)?.email,
        first_name: userProfile?.firstName,
        last_name: userProfile?.lastName,
        company_name: userProfile?.organization,
      });

      // Mark user as verified
      updateUserProfile({
        isVerified: true,
        gstVerified: false,
        panVerified: false,
        hasAddress: false,
      });

      // Register push notification token now that user exists in DynamoDB
      try {
        await registerPushToken();
      } catch (error) {
        console.log('Push token registration skipped:', error);
      }

      // Navigate to GST/PAN verification (user is now logged in)
      router.replace('/verification');
    } catch (error: any) {
      console.error('OTP verification error:', error);

      // Clear OTP on error
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();

      setVerificationErrorMessage(error.message || 'Invalid OTP. Please try again.');
      setShowVerificationFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);

      // Resend SMS OTP for signup
      const response = await authService.signUpWithSMS({
        phone_number: userProfile?.contactNo || '',
        password: (userProfile as any)?.password || '',
        email: (userProfile as any)?.email,
        first_name: userProfile?.firstName,
        last_name: userProfile?.lastName,
        company_name: userProfile?.organization,
      });

      // Start 60 second countdown
      setResendTimer(60);

      setOtpSentMessage(response.message || 'A new verification code has been sent to your phone via SMS.');
      setShowOtpSent(true);
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setResendErrorMessage(error.message || 'Failed to resend OTP. Please try again.');
      setShowResendFailed(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: appTheme.colors.background.primary, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.logoContainer}>
          <Image
            source={require('../assets/icon-blue.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={[styles.title, { color: appTheme.colors.text.primary }]}>{t.auth.verifyPhoneNumber}</Text>
          <Text style={[styles.subtitle, { color: appTheme.colors.text.secondary }]}>
            {t.auth.enterFourDigitCode} {'\n'}
            <Text style={[styles.emailText, { color: appTheme.colors.primary }]}>{userProfile?.contactNo || ''}</Text>
          </Text>
        </Animated.View>

        {/* OTP Input Boxes */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpBox,
                {
                  backgroundColor: appTheme.colors.background.primary,
                  borderColor: digit !== '' ? appTheme.colors.primary : appTheme.colors.border.light,
                  borderWidth: digit !== '' ? 2 : 1,
                  color: appTheme.colors.text.primary,
                },
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isLoading}
            />
          ))}
        </Animated.View>

        {/* Resend OTP */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: appTheme.colors.text.secondary }]}>{t.auth.didntReceive} </Text>
          {resendTimer > 0 ? (
            <Text style={[styles.timerText, { color: appTheme.colors.text.tertiary }]}>{t.auth.resendOTP} in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={isResending || isLoading}
            >
              <Text style={[styles.resendButton, { color: appTheme.colors.primary }]}>
                {isResending ? t.auth.sending : t.auth.resendOTP}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Loading Indicator */}
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={appTheme.colors.primary}
            style={styles.loader}
          />
        )}

        {/* Verify Button */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.buttonContainer}>
          <Button
            title={isLoading ? t.auth.verifying : t.auth.verifyContinue}
            onPress={handleVerify}
            variant="primary"
            fullWidth
            disabled={!isOtpComplete() || isLoading}
          />
        </Animated.View>
      </View>

      {/* Verification Failed Modal */}
      <SuccessModal
        visible={showVerificationFailed}
        onClose={() => setShowVerificationFailed(false)}
        title="Verification Failed"
        message={verificationErrorMessage}
        primaryButtonText="Try Again"
        icon="error"
      />

      {/* OTP Sent Modal */}
      <SuccessModal
        visible={showOtpSent}
        onClose={() => setShowOtpSent(false)}
        title="OTP Sent"
        message={otpSentMessage}
        primaryButtonText="OK"
        icon="success"
      />

      {/* Resend Failed Modal */}
      <SuccessModal
        visible={showResendFailed}
        onClose={() => setShowResendFailed(false)}
        title="Resend Failed"
        message={resendErrorMessage}
        primaryButtonText="Try Again"
        icon="error"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 32 : 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
  },
  loader: {
    marginVertical: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 32 : 24,
    left: 24,
    right: 24,
  },
});
