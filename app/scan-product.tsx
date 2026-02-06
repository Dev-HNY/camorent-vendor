/**
 * Scan Product Screen
 * Allows vendors to upload photos of products to verify condition
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
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { bookingService, BookingDetailResponse } from '../src/services/api/bookingService';
import { scaleWidth, scaleHeight, spacing, fontSize } from '../src/utils/responsive';
import { CloudUploadIcon, CameraIcon, GalleryIcon, CheckIcon, SuccessModal, ScreenHeader } from '../src/components';

export default function ScanProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bookingId = params.bookingId as string;
  const orderName = params.orderName as string;

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [requiredImageCount, setRequiredImageCount] = useState(0);
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
      console.error('Error fetching booking details:', error);
      setErrorMessage(t.scanProduct.failedToLoadBooking);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };


  const handleChooseFiles = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage(t.scanProduct.grantPhotoAccess);
        setShowPermissionError(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: requiredImageCount,
      });

      if (!result.canceled && result.assets) {
        const fileUris = result.assets.map(asset => asset.uri);
        setSelectedFiles(prev => {
          const combined = [...prev, ...fileUris];
          // Limit to required count
          return combined.slice(0, requiredImageCount);
        });
      }
    } catch (error) {
      console.error('Gallery error:', error);
      setErrorMessage(t.scanProduct.failedToOpenGallery);
      setShowError(true);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage(t.scanProduct.grantCameraAccess);
        setShowPermissionError(true);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const fileUris = result.assets.map(asset => asset.uri);
        setSelectedFiles(prev => {
          const combined = [...prev, ...fileUris];
          // Limit to required count
          return combined.slice(0, requiredImageCount);
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      setErrorMessage(t.scanProduct.failedToOpenCamera);
      setShowError(true);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (selectedFiles.length < requiredImageCount) {
      setErrorMessage(t.scanProduct.uploadRequiredImages.replace('{required}', requiredImageCount.toString()).replace('{current}', selectedFiles.length.toString()));
      setShowError(true);
      return;
    }

    // Store product images for later upload
    try {
      await AsyncStorage.setItem(`pickup_images_${bookingId}`, JSON.stringify(selectedFiles));
      router.push(`/scan-challan?bookingId=${encodeURIComponent(bookingId)}&orderName=${encodeURIComponent(orderName)}`);
    } catch (error) {
      console.error('Error saving images:', error);
      setErrorMessage(t.scanProduct.failedToSaveImages);
      setShowError(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>{t.scanProduct.loadingBookingDetails}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader title={t.scanProduct.title} />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background.secondary }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
      >
        {/* Lottie Animation - Step 2 */}
        <View style={styles.lottieHeaderContainer}>
          <LottieView
            ref={lottieRef}
            source={require('../assets/rental-journey/step-2.json')}
            autoPlay
            loop
            style={styles.lottieHeaderAnimation}
          />
        </View>

        {/* Instructions */}
        <View style={[styles.instructionCard, { backgroundColor: theme.colors.primary + '15', borderLeftColor: theme.colors.primary }]}>
          <Text style={[styles.instructionTitle, { color: theme.colors.primary }]}>📸 {t.scanProduct.photoRequirements}</Text>
          <Text style={[styles.instructionText, { color: theme.colors.text.secondary }]}>
            {t.scanProduct.uploadPhotoCount.replace('{count}', requiredImageCount.toString())}
          </Text>
          <Text style={[styles.instructionSubtext, { color: theme.colors.text.tertiary }]}>
            {booking?.sku_items.map((item) => (
              `${item.quantity}x ${item.name}`
            )).join(', ')}
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={[styles.progressCard, { backgroundColor: theme.colors.background.primary }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: theme.colors.text.primary }]}>
              {t.scanProduct.photosUploaded.replace('{current}', selectedFiles.length.toString()).replace('{total}', requiredImageCount.toString())}
            </Text>
            {selectedFiles.length === requiredImageCount && (
              <CheckIcon size={24} color="#22C55E" />
            )}
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border.light }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${(selectedFiles.length / requiredImageCount) * 100}%` }
              ]}
            />
          </View>
        </View>

        {/* Upload Area */}
        {selectedFiles.length < requiredImageCount && (
          <View style={[styles.uploadArea, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
            <CloudUploadIcon size={60} color={theme.colors.text.tertiary} />
            <Text style={[styles.uploadTitle, { color: theme.colors.text.primary }]}>{t.scanProduct.uploadEquipmentPhotos}</Text>
            <Text style={[styles.uploadSubtitle, { color: theme.colors.text.secondary }]}>
              {t.scanProduct.morePhotosNeeded.replace('{count}', (requiredImageCount - selectedFiles.length).toString())}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleOpenCamera}
              >
                <CameraIcon size={20} color="#FFFFFF" />
                <Text style={styles.cameraButtonText}>{t.scanProduct.camera}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.galleryButton, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border.medium }]}
                onPress={handleChooseFiles}
              >
                <GalleryIcon size={20} color={theme.colors.text.primary} />
                <Text style={[styles.galleryButtonText, { color: theme.colors.text.primary }]}>{t.scanProduct.gallery}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Selected Images Grid */}
        {selectedFiles.length > 0 && (
          <View style={styles.imagesGrid}>
            {selectedFiles.map((uri, index) => (
              <View key={index} style={styles.imageCard}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.imageLabel}>{t.scanProduct.photo.replace('{number}', (index + 1).toString())}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: theme.colors.primary },
            selectedFiles.length < requiredImageCount && [styles.nextButtonDisabled, { backgroundColor: theme.colors.border.medium }],
          ]}
          onPress={handleNext}
          disabled={selectedFiles.length < requiredImageCount}
        >
          <Text style={styles.nextButtonText}>
            {selectedFiles.length < requiredImageCount
              ? t.scanProduct.uploadMore.replace('{count}', (requiredImageCount - selectedFiles.length).toString())
              : t.scanProduct.nextUploadChallan
            }
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Error Modal */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title={t.scanProduct.errorTitle}
        message={errorMessage}
        icon="error"
        primaryButtonText="OK"
      />

      {/* Permission Error Modal */}
      <SuccessModal
        visible={showPermissionError}
        onClose={() => setShowPermissionError(false)}
        title={t.scanProduct.permissionRequired}
        message={errorMessage}
        icon="warning"
        primaryButtonText="OK"
      />
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2;

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
    fontSize: fontSize.md,
    marginTop: spacing.sm + 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  lottieHeaderContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lottieHeaderAnimation: {
    width: 160,
    height: 160,
  },
  instructionCard: {
    padding: spacing.md + 4,
    borderRadius: scaleWidth(16),
    marginBottom: spacing.md,
    borderLeftWidth: 3,
  },
  instructionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
    lineHeight: scaleHeight(20),
  },
  instructionSubtext: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  progressCard: {
    padding: spacing.md + 4,
    borderRadius: scaleWidth(16),
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  progressText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  progressBar: {
    height: scaleHeight(10),
    borderRadius: scaleWidth(5),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: scaleWidth(5),
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: spacing.xxl + spacing.md,
    borderRadius: scaleWidth(20),
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  uploadTitle: {
    fontSize: fontSize.lg + 2,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  uploadSubtitle: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: scaleWidth(12),
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: scaleWidth(12),
    borderWidth: 1.5,
  },
  galleryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 4,
    marginBottom: spacing.lg,
  },
  imageCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: scaleWidth(16),
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(16),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  imageLabel: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(6),
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: spacing.md + 2,
    borderRadius: scaleWidth(14),
    alignItems: 'center',
    marginTop: spacing.lg,
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
