/**
 * Enhanced Verification Screen
 * Auto-validates GST with backend API
 * Shows tick/cross indicators for validation status
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
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { Button } from '../src/components/common/Button';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { useUserStore } from '../src/store/userStore';
import { validateGSTIN, getGSTINError } from '../src/utils/validation';
import { verifyGST } from '../src/services/api/verificationService';
import { SuccessModal } from '../src/components';

// ==================== Icons ====================

const CheckCircleIcon = ({ size = 20, color = '#22C55E' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path d="M8 12l3 3 5-5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CrossCircleIcon = ({ size = 20, color = '#EF4444' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path d="M8 8l8 8M16 8l-8 8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InfoIcon = ({ size = 16, color = '#3B82F6' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// ==================== Main Component ====================

export default function VerificationScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const { updateUserProfile } = useUserStore();

  // Form state
  const [gstNo, setGstNo] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  // Validation state
  const [gstNoError, setGstNoError] = useState('');
  const [gstVerified, setGstVerified] = useState(false);

  // Loading state
  const [gstVerifying, setGstVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [showVerificationComplete, setShowVerificationComplete] = useState(false);

  // ==================== Validation Functions ====================

  const isFormValid = () => {
    return (
      gstNo.trim() !== '' &&
      gstVerified
    );
  };

  // Validate GST format on blur
  const handleGSTBlur = () => {
    const trimmedGst = gstNo.trim().toUpperCase();

    if (!trimmedGst) {
      setGstNoError(t.verification.gstRequired);
      return;
    }

    if (!validateGSTIN(trimmedGst)) {
      const error = getGSTINError(trimmedGst);
      setGstNoError(error);
      setGstVerified(false);
      return;
    }

    // Format is valid, clear error
    setGstNoError('');
    setGstNo(trimmedGst);
  };

  // Verify GST with backend on button click
  const handleVerifyGST = async () => {
    const trimmedGst = gstNo.trim().toUpperCase();

    // Reset state
    setGstNoError('');
    setGstVerified(false);

    // Check format first
    if (!trimmedGst) {
      setGstNoError(t.verification.gstRequired);
      return;
    }

    if (!validateGSTIN(trimmedGst)) {
      const error = getGSTINError(trimmedGst);
      setGstNoError(error);
      return;
    }

    // Verify with backend
    setGstVerifying(true);
    try {
      const result = await verifyGST(trimmedGst);

      if (result.gstin) {
        setGstVerified(true);
        setGstNoError('');
        setGstNo(trimmedGst);
        // Store organization name from GST verification
        setOrganizationName(result.legal_name);
        console.log('GST verified:', result);
      } else {
        setGstVerified(false);
        setGstNoError(t.verification.verificationFailed);
      }
    } catch (error: any) {
      setGstVerified(false);
      const errorMsg = error.message || t.verification.verifyError;
      setGstNoError(errorMsg);
      console.error('GST verification error:', error);

      // Log authentication issues for debugging
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('authentication')) {
        console.error('Authentication issue - user may need to log in again');
      }
    } finally {
      setGstVerifying(false);
    }
  };

  // ==================== Submit ====================

  const handleNext = async () => {
    if (!isFormValid()) {
      if (!gstVerified) setGstNoError(t.verification.verifyFirst);
      return;
    }

    setSubmitting(true);

    try {
      // GST verification endpoint already updated GSTIN_no and company_name on backend
      // Just update local store
      updateUserProfile({
        gstNo: gstNo.toUpperCase(),
        gstVerified: true,
        organization: organizationName,
      });

      // Show success modal
      setShowVerificationComplete(true);
    } catch (error: any) {
      console.error('Profile update error:', error);
      setGstNoError(error.message || t.verification.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== Render ====================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={theme.colors.background.primary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.verification.title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {t.verification.subtitle}
          </Text>
        </Animated.View>

        {/* GST Number Input */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>{t.verification.gstNumber}</Text>
              {gstVerifying && <ActivityIndicator size="small" color={theme.colors.primary} />}
              {!gstVerifying && gstVerified && <CheckCircleIcon size={20} color={theme.colors.status.success} />}
              {!gstVerifying && gstNoError && !gstVerified && <CrossCircleIcon size={20} color={theme.colors.status.error} />}
            </View>
            <View style={styles.inputWithButton}>
              <View style={[styles.inputContainer, styles.inputFlexGrow, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.text.primary }]}
                  placeholder={t.verification.gstPlaceholder}
                  placeholderTextColor={theme.colors.text.secondary}
                  value={gstNo}
                  onChangeText={(text) => {
                    setGstNo(text.toUpperCase());
                    setGstNoError('');
                    setGstVerified(false);
                    setOrganizationName('');
                  }}
                  onBlur={handleGSTBlur}
                  maxLength={15}
                  autoCapitalize="characters"
                  editable={!gstVerifying}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  { backgroundColor: theme.colors.primary },
                  (gstVerifying || !gstNo.trim() || gstVerified) && [styles.verifyButtonDisabled, { backgroundColor: theme.colors.border.light }],
                ]}
                onPress={handleVerifyGST}
                disabled={gstVerifying || !gstNo.trim() || gstVerified}
              >
                {gstVerifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>{t.verification.verify}</Text>
                )}
              </TouchableOpacity>
            </View>
            {gstNoError ? (
              <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{gstNoError}</Text>
            ) : gstVerified ? (
              <Text style={[styles.successText, { color: theme.colors.status.success }]}>{t.verification.verifiedSuccess}</Text>
            ) : null}
            <View style={styles.infoBox}>
              <InfoIcon size={14} color={theme.colors.status.info} />
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                {t.verification.clickVerify}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Organization Name (Auto-filled from GST, non-editable) */}
        {gstVerified && organizationName && (
          <Animated.View entering={FadeInDown.delay(150).duration(600)}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>{t.verification.organizationName}</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border.light }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.text.primary }]}
                  value={organizationName}
                  editable={false}
                  selectTextOnFocus={false}
                />
              </View>
              <View style={styles.infoBox}>
                <InfoIcon size={14} color={theme.colors.status.success} />
                <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                  {t.verification.autoFilled}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.buttonContainer}>
          <Button
            title={submitting ? t.verification.saving : t.verification.completeVerification}
            onPress={handleNext}
            disabled={!isFormValid() || submitting}
            loading={submitting}
          />
        </Animated.View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showVerificationComplete}
        title={t.verification.successTitle}
        message={t.verification.successMessage}
        onClose={() => {
          setShowVerificationComplete(false);
          router.replace('/address-setup');
        }}
      />
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inputFlexGrow: {
    flex: 1,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 15,
  },
  verifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
  },
  successText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
