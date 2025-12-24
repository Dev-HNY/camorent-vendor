/**
 * Verification Screen
 * Document upload and GST verification for Camorent
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
import type { VerificationScreenNavigationProp } from '../navigation/types';

export const VerificationScreen: React.FC = () => {
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const [gstNo, setGstNo] = useState('');
  const [frontIdImage, setFrontIdImage] = useState<string | null>(null);
  const [backIdImage, setBackIdImage] = useState<string | null>(null);

  const isFormValid = () => {
    return gstNo.trim() !== '' && frontIdImage !== null && backIdImage !== null;
  };

  const handleNext = () => {
    if (isFormValid()) {
      navigation.navigate('OTPVerification');
    }
  };

  const handleUploadFront = () => {
    // TODO: Implement image picker
    console.log('Upload front ID');
    // For now, set a placeholder
    setFrontIdImage('placeholder-front');
  };

  const handleUploadBack = () => {
    // TODO: Implement image picker
    console.log('Upload back ID');
    // For now, set a placeholder
    setBackIdImage('placeholder-back');
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
        <Text style={styles.title}>Verified with Camorent</Text>
        <Text style={styles.subtitle}>
          Upload your govt. Id pan/ Aadhar/driving{'\n'}licence and GST no.
        </Text>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* GST NO */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>GST NO*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter GST number"
              placeholderTextColor={theme.colors.text.tertiary}
              value={gstNo}
              onChangeText={setGstNo}
              autoCapitalize="characters"
              maxLength={15}
            />
          </View>

          {/* Upload Govt. ID */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Upload Govt. ID Back and Front side*</Text>

            {/* Front Side Upload */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handleUploadFront}
              activeOpacity={0.7}
            >
              {frontIdImage ? (
                <View style={styles.uploadedIndicator}>
                  <Text style={styles.uploadedText}>✓ Front Side Uploaded</Text>
                </View>
              ) : (
                <>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>☁</Text>
                    <Text style={styles.uploadArrow}>↑</Text>
                  </View>
                  <Text style={styles.uploadText}>Front Side</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Back Side Upload */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handleUploadBack}
              activeOpacity={0.7}
            >
              {backIdImage ? (
                <View style={styles.uploadedIndicator}>
                  <Text style={styles.uploadedText}>✓ Back Side Uploaded</Text>
                </View>
              ) : (
                <>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>☁</Text>
                    <Text style={styles.uploadArrow}>↑</Text>
                  </View>
                  <Text style={styles.uploadText}>Back Side</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Next"
            onPress={handleNext}
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
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
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
  uploadBox: {
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.xxl * 1.5,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    minHeight: 140,
  },
  uploadIcon: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  uploadIconText: {
    fontSize: 48,
    color: theme.colors.text.tertiary,
    opacity: 0.6,
  },
  uploadArrow: {
    position: 'absolute',
    fontSize: 24,
    color: theme.colors.text.tertiary,
    top: 12,
    left: '50%',
    transform: [{ translateX: -6 }],
  },
  uploadText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  uploadedIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.status.success,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
});
