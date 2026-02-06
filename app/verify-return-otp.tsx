/**
 * Verify Return OTP Screen
 * Vendor requests OTP (sent to customer's phone)
 * Customer tells OTP to vendor
 * Vendor enters and verifies the OTP
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
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { bookingService } from '../src/services/api/bookingService';
import { scaleWidth, scaleHeight, spacing, fontSize } from '../src/utils/responsive';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { SuccessModal, ScreenHeader } from '../src/components';

// Professional Info Icon
const InfoIcon = ({ size = 20, color = '#565CAA' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 16v-4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1" fill={color} />
  </Svg>
);

const PhoneIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
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

const PackageIcon = ({ color = '#565CAA', size = 32 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 9.4L7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function VerifyReturnOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const bookingId = params.bookingId as string;
  const orderName = params.orderName as string;

  const [otp, setOtp] = useState(['', '', '', '']); // 4-digit OTP
  const [verifying, setVerifying] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const handleRequestOTP = async () => {
    try {
      setRequesting(true);
      const response = await bookingService.requestReturnOTP(bookingId);

      setMaskedPhone(response.customer_phone || 'customer');
      setOtpRequested(true);

      // Show success info message
      setInfoMessage(response.message || 'OTP sent to customer\'s phone successfully!');
      setShowInfo(true);
    } catch (error: any) {
      console.error('Error requesting return OTP:', error);
      setErrorMessage(error.message || 'Failed to send OTP. Please try again.');
      setShowError(true);
    } finally {
      setRequesting(false);
    }
  };

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

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 4) {
      setErrorMessage('Please enter complete 4-digit OTP');
      setShowError(true);
      return;
    }

    try {
      setVerifying(true);

      console.log('Verifying return OTP:', otpCode, 'for booking:', bookingId);

      // Verify return OTP - backend handles status change to 'completed'
      const response = await bookingService.verifyReturnOTP(bookingId, otpCode);

      console.log('Return verified:', response);

      // Show success and navigate back to home
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error verifying return OTP:', error);
      setErrorMessage(error.message || 'Invalid OTP. Please check and try again.');
      setShowError(true);
    } finally {
      setVerifying(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader title={t.verifyOtp.confirmReturnTitle} />

      {/* Content with ScrollView */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, { backgroundColor: theme.colors.background.secondary }]}>
            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.background.primary }]}>
              <View style={styles.infoIconContainer}>
                <PackageIcon color="#565CAA" size={32} />
              </View>
              <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>{t.verifyOtp.customerOtpVerification}</Text>
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                {t.verifyOtp.requestOtpReturnDescription}
              </Text>
              <Text style={[styles.orderName, { color: theme.colors.primary }]}>{orderName}</Text>
            </View>

            {!otpRequested ? (
              /* Request OTP Button */
              <TouchableOpacity
                style={[
                  styles.requestButton,
                  { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
                ]}
                onPress={handleRequestOTP}
                disabled={requesting}
              >
                {requesting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <PhoneIcon color="#FFFFFF" size={20} />
                    <Text style={styles.requestButtonText}>{t.verifyOtp.requestOtpFromCustomer}</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <>
                {/* Customer Phone Display */}
                <View style={[styles.phoneCard, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }]}>
                  <PhoneIcon color={theme.colors.primary} size={18} />
                  <Text style={[styles.phoneText, { color: theme.colors.text.secondary }]}>
                    {t.verifyOtp.otpSentToCustomerLabel} <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{maskedPhone}</Text>
                  </Text>
                </View>

                {/* OTP Input */}
                <Text style={[styles.otpLabel, { color: theme.colors.text.primary }]}>{t.verifyOtp.enterOtpFromCustomer}</Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        {
                          borderColor: theme.colors.border.light,
                          backgroundColor: theme.colors.background.primary,
                          color: theme.colors.text.primary,
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
                <TouchableOpacity onPress={handleRequestOTP} style={styles.resendButton} disabled={requesting}>
                  <Text style={[styles.resendText, { color: theme.colors.primary }]}>
                    {requesting ? t.verifyOtp.sending : t.verifyOtp.resendOtp}
                  </Text>
                </TouchableOpacity>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
                    (!isOtpComplete || verifying) && [styles.verifyButtonDisabled, { backgroundColor: theme.colors.border.medium }],
                  ]}
                  onPress={handleVerify}
                  disabled={!isOtpComplete || verifying}
                >
                  {verifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.verifyButtonText}>{t.verifyOtp.verifyAndConfirmReturn}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Help Text */}
            <View style={[styles.helpCard, { backgroundColor: theme.colors.primary + '15', borderLeftColor: theme.colors.primary }]}>
              <View style={styles.helpTitleContainer}>
                <InfoIcon size={20} color={theme.colors.primary} />
                <Text style={[styles.helpTitle, { color: theme.colors.primary }]}>{t.verifyOtp.howThisWorks}</Text>
              </View>
              <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
                {t.verifyOtp.returnHelpText}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title={t.verifyOtp.errorTitle}
        message={errorMessage}
        icon="error"
        primaryButtonText="OK"
      />

      <SuccessModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title={t.verifyOtp.otpSent}
        message={infoMessage}
        icon="success"
        primaryButtonText="OK"
      />

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.replace('/(tabs)/home');
        }}
        title={t.verifyOtp.returnConfirmedTitle}
        message={t.verifyOtp.returnConfirmedMessage}
        icon="success"
        primaryButtonText="Done"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    padding: spacing.lg,
  },
  infoCard: {
    padding: spacing.xl,
    borderRadius: scaleWidth(20),
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoIconContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  infoText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: scaleHeight(20),
  },
  orderName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  requestButton: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: spacing.md + 2,
    borderRadius: scaleWidth(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  requestButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: scaleWidth(12),
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  phoneText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  otpLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scaleWidth(10),
    marginBottom: spacing.lg,
  },
  otpInput: {
    width: scaleWidth(60),
    height: scaleHeight(64),
    borderWidth: 2,
    borderRadius: scaleWidth(14),
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  verifyButton: {
    paddingVertical: spacing.md + 2,
    borderRadius: scaleWidth(14),
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helpCard: {
    padding: spacing.md + 4,
    borderRadius: scaleWidth(16),
    borderLeftWidth: 3,
  },
  helpTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  helpTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  helpText: {
    fontSize: fontSize.sm,
    lineHeight: scaleHeight(20),
  },
});
