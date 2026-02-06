/**
 * Scan Challan Screen
 * Allows vendors to scan or upload delivery challan document
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { CameraIcon, GalleryIcon, SuccessModal, ScreenHeader } from '../src/components';

export default function ScanChallanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  useTranslation();
  const insets = useSafeAreaInsets();
  const bookingId = params.bookingId as string;
  const orderName = params.orderName as string;
  const lottieRef = useRef<LottieView>(null);

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPermissionError, setShowPermissionError] = useState(false);


  const handleOpenCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage('Please grant camera access to scan the challan document.');
        setShowPermissionError(true);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Challan scanned:', imageUri);
        // Save challan image to AsyncStorage
        try {
          await AsyncStorage.setItem(`challan_image_${bookingId}`, imageUri);
          console.log('Challan saved to AsyncStorage');
        } catch (error) {
          console.error('Error saving challan image:', error);
        }
        navigateToOTP();
      }
    } catch (error) {
      console.error('Camera error:', error);
      setErrorMessage('Failed to open camera. Please try again or use gallery instead.');
      setShowError(true);
    }
  };

  const handleUploadGallery = async () => {
    try {
      // Request gallery permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage('Please grant access to your photo library to upload the challan.');
        setShowPermissionError(true);
        return;
      }

      // Launch gallery picker
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Challan uploaded:', imageUri);
        // Save challan image to AsyncStorage
        try {
          await AsyncStorage.setItem(`challan_image_${bookingId}`, imageUri);
          console.log('Challan saved to AsyncStorage');
        } catch (error) {
          console.error('Error saving challan image:', error);
        }
        navigateToOTP();
      }
    } catch (error) {
      console.error('Gallery error:', error);
      setErrorMessage('Failed to open gallery. Please try again.');
      setShowError(true);
    }
  };

  const navigateToOTP = () => {
    // Navigate to pickup OTP verification screen (customer OTP)
    router.push(`/verify-pickup-otp?bookingId=${encodeURIComponent(bookingId)}&orderName=${encodeURIComponent(orderName)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader title="Scan Challan" />

      {/* Content */}
      <View style={[styles.content, { backgroundColor: theme.colors.background.secondary, paddingBottom: 100 + insets.bottom }]}>
        {/* Lottie Animation - Step 4 */}
        <View style={styles.lottieHeaderContainer}>
          <LottieView
            ref={lottieRef}
            source={require('../assets/rental-journey/step-4.json')}
            autoPlay
            loop
            style={styles.lottieHeaderAnimation}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Scan delivery challan</Text>

        {/* Upload Area */}
        <View style={styles.uploadArea}>
          {/* Purple Progress Bar */}
          <View style={[styles.progressBar, { backgroundColor: theme.colors.primary }]} />

          {/* Dashed Border Container */}
          <View style={[styles.dashedContainer, { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.primary }]}>
            <Text style={[styles.placeholderText, { color: theme.colors.text.secondary }]}>Kept challan in middle</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Open Camera Button */}
          <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.primary }]} onPress={handleOpenCamera}>
            <CameraIcon size={28} color={theme.colors.primary} />
            <Text style={[styles.cameraButtonText, { color: theme.colors.primary }]}>Open camera</Text>
          </TouchableOpacity>

          {/* Upload with Gallery Button */}
          <TouchableOpacity style={[styles.galleryButton, { backgroundColor: theme.colors.primary }]} onPress={handleUploadGallery}>
            <GalleryIcon size={28} color={theme.colors.text.inverse} />
            <Text style={[styles.galleryButtonText, { color: theme.colors.text.inverse }]}>Upload with gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Modal */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
        icon="error"
        primaryButtonText="OK"
      />

      {/* Permission Error Modal */}
      <SuccessModal
        visible={showPermissionError}
        onClose={() => setShowPermissionError(false)}
        title="Permission Required"
        message={errorMessage}
        icon="warning"
        primaryButtonText="OK"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  lottieHeaderContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lottieHeaderAnimation: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadArea: {
    flex: 1,
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
  },
  dashedContainer: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 16,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  cameraButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
  },
  galleryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
