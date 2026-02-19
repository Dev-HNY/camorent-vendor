/**
 * Verify OTP Screen
 * Allows vendors to verify pickup with OTP from Camorent
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const LockIcon = ({ color = '#565CAA', size = 32 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bookingId = params.bookingId as string;
  const orderName = params.orderName as string;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
      setErrorMessage(t.verifyOtp.enterCompleteOtp);
      setShowError(true);
      return;
    }

    try {
      setVerifying(true);

      // Step 1: Retrieve and upload pickup images
      try {
        const pickupImagesJson = await AsyncStorage.getItem(`pickup_images_${bookingId}`);
        if (pickupImagesJson) {
          const pickupImages: string[] = JSON.parse(pickupImagesJson);
          await bookingService.uploadPickupImages(bookingId, pickupImages);

          // Clean up stored images
          await AsyncStorage.removeItem(`pickup_images_${bookingId}`);
        }
      } catch (imageError) {
        // Continue anyway - images are optional
      }

      // Step 2: Retrieve and upload challan if available
      try {
        const challanImage = await AsyncStorage.getItem(`challan_image_${bookingId}`);
        if (challanImage) {
          await bookingService.uploadChallan(bookingId, challanImage);

          // Clean up stored challan
          await AsyncStorage.removeItem(`challan_image_${bookingId}`);
        }
      } catch (challanError) {
        // Continue anyway - challan is optional
      }

      // Step 3: Confirm pickup - updates status to return_due
      await bookingService.confirmPickup(bookingId);

      // Show success and navigate back to home with refresh trigger
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail?.message || 'Failed to confirm pickup. Please try again.');
      setShowError(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = () => {
    setShowSuccess(true);
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader title={t.verifyOtp.title} />

      {/* Content with ScrollView */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, { backgroundColor: theme.colors.background.secondary }]}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.background.primary }]}>
          <View style={styles.infoIconContainer}>
            <LockIcon color="#565CAA" size={32} />
          </View>
          <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>Verify Pickup</Text>
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            Enter the 6-digit OTP provided by the customer to confirm equipment pickup
          </Text>
          <Text style={[styles.orderName, { color: theme.colors.primary }]}>{orderName}</Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.primary, color: theme.colors.text.primary }]}
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
          <Text style={[styles.resendText, { color: theme.colors.primary }]}>{t.verifyOtp.resend}</Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
            !isOtpComplete && [styles.verifyButtonDisabled, { backgroundColor: theme.colors.border.medium }],
          ]}
          onPress={handleVerify}
          disabled={!isOtpComplete || verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>{t.verifyOtp.verifyConfirm}</Text>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <View style={[styles.helpCard, { backgroundColor: theme.colors.primary + '15', borderLeftColor: theme.colors.primary }]}>
          <View style={styles.helpTitleContainer}>
            <InfoIcon size={20} color={theme.colors.primary} />
            <Text style={[styles.helpTitle, { color: theme.colors.primary }]}>{t.verifyOtp.whatNext}</Text>
          </View>
          <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
            • Pickup will be confirmed{'\n'}
            • Equipment status will be updated to "Return Due"{'\n'}
            • Rental period starts now{'\n'}
            • Customer can use the equipment until return date{'\n'}
            • You'll need to confirm return when equipment is returned
          </Text>
        </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
        icon="error"
        primaryButtonText="OK"
      />

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.replace('/(tabs)/home');
        }}
        title="Pickup Confirmed!"
        message="Equipment is now in use. Return is due on the rental end date."
        icon="success"
        primaryButtonText="Done"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scaleWidth(10),
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: scaleWidth(48),
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
