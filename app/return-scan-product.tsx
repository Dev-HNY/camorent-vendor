/**
 * Return Scan Product Screen
 * Allows vendors to upload photos of returned products to verify condition
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { bookingService, BookingDetailResponse } from '../src/services/api/bookingService';
import { CloudUploadIcon, CameraIcon, GalleryIcon, SuccessModal, ScreenHeader } from '../src/components';

export default function ReturnScanProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bookingId = params.bookingId as string;
  const orderName = params.orderName as string;

  const [, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiredImageCount, setRequiredImageCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const lottieRef = useRef<LottieView>(null);

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPermissionError, setShowPermissionError] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingDetails(bookingId);
      setBooking(response);

      // Calculate total number of equipment items
      const totalItems = response.sku_items.reduce((sum, item) => sum + item.quantity, 0);
      setRequiredImageCount(totalItems);
    } catch (error) {
      setErrorMessage(t.returnScanProduct.failedToLoadBooking);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };


  const handleChooseFiles = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage(t.returnScanProduct.grantPhotoAccess);
        setShowPermissionError(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        const fileUris = result.assets.map(asset => asset.uri);
        setSelectedFiles(prev => [...prev, ...fileUris]);
      }
    } catch (error) {
      setErrorMessage(t.returnScanProduct.failedToOpenGallery);
      setShowError(true);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage(t.returnScanProduct.grantCameraAccess);
        setShowPermissionError(true);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const fileUris = result.assets.map(asset => asset.uri);
        setSelectedFiles(prev => [...prev, ...fileUris]);
      }
    } catch (error) {
      setErrorMessage(t.returnScanProduct.failedToOpenCamera);
      setShowError(true);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (selectedFiles.length < requiredImageCount) {
      setErrorMessage(t.returnScanProduct.uploadRequiredImages.replace('{required}', requiredImageCount.toString()).replace('{current}', selectedFiles.length.toString()));
      setShowError(true);
      return;
    }

    // Store return images for later upload
    try {
      await AsyncStorage.setItem(`return_images_${bookingId}`, JSON.stringify(selectedFiles));
      router.push(`/return-scan-challan?bookingId=${encodeURIComponent(bookingId)}&orderName=${encodeURIComponent(orderName)}`);
    } catch (error) {
      setErrorMessage(t.returnScanProduct.failedToSaveImages);
      setShowError(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>{t.returnScanProduct.loadingBookingDetails}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader title={t.returnScanProduct.title} />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background.secondary }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
      >
        {/* Lottie Animation - Step 6 */}
        <View style={styles.lottieHeaderContainer}>
          <LottieView
            ref={lottieRef}
            source={require('../assets/rental-journey/step-6.json')}
            autoPlay
            loop
            style={styles.lottieHeaderAnimation}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.returnScanProduct.scanTitle}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          {t.returnScanProduct.scanSubtitle.replace('{count}', requiredImageCount.toString())}
        </Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: theme.colors.text.primary }]}>
            {t.returnScanProduct.photosUploaded.replace('{current}', selectedFiles.length.toString()).replace('{total}', requiredImageCount.toString())}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.background.primary }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${(selectedFiles.length / requiredImageCount) * 100}%`, backgroundColor: theme.colors.primary }
              ]}
            />
          </View>
        </View>

        {/* Upload Area */}
        <View style={styles.uploadContainer}>
          <View style={[styles.uploadArea, { borderColor: theme.colors.border.light, backgroundColor: themeMode === 'dark' ? theme.colors.background.primary : '#FAFAFA' }]}>
            <CloudUploadIcon size={60} color={theme.colors.text.tertiary} />
            <Text style={[styles.uploadText, { color: theme.colors.text.secondary }]}>{t.returnScanProduct.chooseFilesOrTakePhotos}</Text>
            <Text style={[styles.uploadSubtext, { color: theme.colors.text.tertiary }]}>
              {t.returnScanProduct.fileFormat}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.primary }]} onPress={handleOpenCamera}>
                <CameraIcon size={20} color={theme.colors.primary} />
                <Text style={[styles.cameraButtonText, { color: theme.colors.primary }]}>{t.returnScanProduct.camera}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.chooseFilesButton, { backgroundColor: theme.colors.primary }]} onPress={handleChooseFiles}>
                <GalleryIcon size={20} color="#FFFFFF" />
                <Text style={[styles.chooseFilesText, { color: '#FFFFFF' }]}>{t.returnScanProduct.gallery}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Image Preview Grid */}
        {selectedFiles.length > 0 && (
          <View style={styles.imageGrid}>
            {selectedFiles.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={[styles.removeButtonText, { color: '#FFFFFF' }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Next Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background.primary, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: theme.colors.primary },
            selectedFiles.length < requiredImageCount && [styles.nextButtonDisabled, { backgroundColor: theme.colors.text.tertiary }],
          ]}
          onPress={handleNext}
          disabled={selectedFiles.length < requiredImageCount}
        >
          <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>{t.returnScanProduct.next}</Text>
          <Text style={[styles.nextArrow, { color: '#FFFFFF' }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Error Modal */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title={t.returnScanProduct.errorTitle}
        message={errorMessage}
        icon="error"
        primaryButtonText="OK"
      />

      {/* Permission Error Modal */}
      <SuccessModal
        visible={showPermissionError}
        onClose={() => setShowPermissionError(false)}
        title={t.returnScanProduct.permissionRequired}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cameraButton: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  chooseFilesButton: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chooseFilesText: {
    fontSize: 15,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: '30%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  nextArrow: {
    fontSize: 24,
    fontWeight: '700',
  },
});
