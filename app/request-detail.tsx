/**
 * Request Detail Screen
 * Shows detailed booking request with Approve/Reject actions for equipment owners
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { bookingService, BookingDetailResponse, OwnerBookingOTPResponse } from '../src/services/api/bookingService';
import BookingTimeline from '../src/components/BookingTimeline';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { SuccessModal } from '../src/components';
import { playSuccessNotification, playErrorNotification } from '../src/utils/notificationSound';
import { notificationService } from '../src/services/notificationService';

// Modern SVG Icons
const ChevronLeftIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FileCheckIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 15L11 17L15 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const XIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function RequestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;
  const { theme: appTheme, themeMode } = useTheme();
  const { t } = useTranslation();

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [otpData, setOtpData] = useState<OwnerBookingOTPResponse | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [returnOtpNotified, setReturnOtpNotified] = useState(false);

  // Animation values for buttons
  const approveScale = useSharedValue(1);
  const rejectScale = useSharedValue(1);
  const approveGlow = useSharedValue(0);
  const rejectGlow = useSharedValue(0);

  // Animated styles
  const approveAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(approveGlow.value, [0, 1], [0.3, 0.8]);
    return {
      transform: [{ scale: approveScale.value }],
      shadowOpacity: glowOpacity,
    };
  });

  const rejectAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(rejectGlow.value, [0, 1], [0.3, 0.8]);
    return {
      transform: [{ scale: rejectScale.value }],
      shadowOpacity: glowOpacity,
    };
  });

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
      // Fetch OTP data for owner - OTP exists only for approved bookings (pickup_due, pickup_confirmed, return_due)
      if (data.status !== 'pending_request' && data.status !== 'vendor_rejection' && data.status !== 'camorent_rejection' && data.status !== 'completed') {
        await fetchOwnerOTP(data.status, data.order_name);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerOTP = async (bookingStatus?: string, orderName?: string) => {
    try {
      const data = await bookingService.getOwnerBookingOTP(bookingId);
      // Handle case where API returns data wrapped in a 'data' field
      const otpInfo = (data as any)?.data || data;
      setOtpData(otpInfo);

      // Show return OTP notification when viewing return_due status for the first time
      // This notifies the owner when pickup is confirmed and they need to share return OTP
      if (bookingStatus === 'return_due' && otpInfo?.return_otp && orderName && !returnOtpNotified) {
        await notificationService.showReturnOTP(orderName, otpInfo.return_otp, bookingId);
        setReturnOtpNotified(true);
      }
    } catch {
      // Silently fail - This is expected if user is not the owner or OTP doesn't exist yet
      setOtpData(null);
    }
  };

  const formatDate = (date: Date | string | undefined | null): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDisplayStatus = (status: string, isDark: boolean) => {
    if (status === 'pending_request') return {
      text: t.status.pending_request,
      color: appTheme.colors.accent.amber,
      bgColor: isDark ? appTheme.colors.accent.amberLight : '#FEF3C7'
    };
    if (status === 'pickup_due') return {
      text: t.status.pickup_due,
      color: '#8B5CF6',
      bgColor: isDark ? '#4C1D95' : '#EDE9FE'
    };
    if (status === 'pickup_confirmed') return {
      text: t.status.pickup_confirmed,
      color: appTheme.colors.status.info,
      bgColor: isDark ? '#1E3A8A' : '#DBEAFE'
    };
    if (status === 'return_due') return {
      text: t.status.return_due,
      color: appTheme.colors.accent.red,
      bgColor: isDark ? '#7F1D1D' : '#FEE2E2'
    };
    if (status === 'completed') return {
      text: t.status.completed,
      color: appTheme.colors.accent.green,
      bgColor: isDark ? appTheme.colors.accent.greenLight : '#DCFCE7'
    };
    if (status === 'vendor_rejection') return {
      text: t.status.rejected_vendor,
      color: appTheme.colors.accent.red,
      bgColor: isDark ? '#7F1D1D' : '#FEE2E2'
    };
    if (status === 'camorent_rejection') return {
      text: t.status.rejected_camorent,
      color: appTheme.colors.accent.red,
      bgColor: isDark ? '#7F1D1D' : '#FEE2E2'
    };
    return {
      text: t.status.unknown,
      color: appTheme.colors.text.tertiary,
      bgColor: appTheme.colors.background.tertiary
    };
  };

  const handleApprovePress = () => {
    // Trigger press animation
    approveScale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    approveGlow.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );

    // Show approve confirmation modal
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    setShowApproveModal(false);
    try {
      setActionLoading(true);
      await bookingService.updateBookingStatus(bookingId, 'approved');

      // Refresh booking details to get updated status
      await fetchBookingDetails();

      // Fetch OTP directly and send notification (must be owner to get OTP)
      try {
        const freshOtpData = await bookingService.getOwnerBookingOTP(bookingId);
        if (freshOtpData?.pickup_otp && booking?.order_name) {
          await notificationService.showPickupOTP(
            booking.order_name,
            freshOtpData.pickup_otp,
            bookingId
          );
        }
      } catch {
        // Don't fail approval if OTP notification fails
      }

      // Play success notification sound with vibration
      await playSuccessNotification();
      setModalTitle(t.alerts.approve_success_title);
      setModalMessage(t.alerts.approve_success_message);
      setModalIcon('success');
      setShowSuccessModal(true);
    } catch (err: any) {
      // Play error notification sound with vibration
      await playErrorNotification();
      setModalTitle(t.alerts.error_title);
      setModalMessage(err?.response?.data?.detail?.message || 'Failed to approve booking request');
      setModalIcon('error');
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPress = () => {
    // Trigger press animation
    rejectScale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    rejectGlow.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );

    // Show reject confirmation modal
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    setShowRejectModal(false);
    try {
      setActionLoading(true);
      await bookingService.updateBookingStatus(bookingId, 'rejected');
      // Play success notification for rejection action
      await playSuccessNotification();
      setModalTitle(t.alerts.reject_success_title);
      setModalMessage(t.alerts.reject_success_message);
      setModalIcon('error');
      setShowSuccessModal(true);
    } catch (err: any) {
      // Play error notification sound with vibration
      await playErrorNotification();
      setModalTitle(t.alerts.error_title);
      setModalMessage(err?.response?.data?.detail?.message || 'Failed to reject booking request');
      setModalIcon('error');
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/(tabs)/track-order');
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const displayStatus = booking ? getDisplayStatus(booking.status, themeMode === 'dark') : null;
  const isPending = booking?.status === 'pending_request';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={appTheme.colors.primary}
      />

      {/* Header */}
      <LinearGradient
        colors={[appTheme.colors.primary, '#4B4F8C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeftIcon color={appTheme.colors.text.inverse} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FileCheckIcon color={appTheme.colors.text.inverse} size={24} />
          <Text style={[styles.headerTitle, { color: appTheme.colors.text.inverse }]}>{t.requestDetail.title}</Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: appTheme.colors.text.secondary }]}>{t.requestDetail.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: appTheme.colors.text.secondary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: appTheme.colors.primary }]} onPress={fetchBookingDetails}>
            <Text style={[styles.retryButtonText, { color: appTheme.colors.text.inverse }]}>{t.buttons.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : booking ? (
        <ScrollView style={[styles.scrollView, { backgroundColor: appTheme.colors.background.secondary }]} showsVerticalScrollIndicator={false}>
          {/* Payment Status Banner (if pending) */}
          {booking.payment_status === 'pending' && (
            <View style={[styles.paymentBanner, {
              backgroundColor: themeMode === 'dark' ? appTheme.colors.accent.amberLight : '#FEF3C7',
              borderColor: appTheme.colors.accent.amber
            }]}>
              <View style={styles.paymentBannerContent}>
                <View style={[styles.paymentBannerIcon, { backgroundColor: appTheme.colors.accent.amber }]}>
                  <Text style={styles.paymentBannerIconText}>⏳</Text>
                </View>
                <View style={styles.paymentBannerTextContainer}>
                  <Text style={[styles.paymentBannerTitle, { color: themeMode === 'dark' ? '#FDE68A' : '#92400E' }]}>{t.requestDetail.payment_pending_title}</Text>
                  <Text style={[styles.paymentBannerSubtitle, { color: themeMode === 'dark' ? '#FCD34D' : '#B45309' }]}>{t.requestDetail.payment_pending_subtitle}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Order Name Card */}
          <View style={[styles.orderCard, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
            <Text style={[styles.orderName, { color: appTheme.colors.text.primary }]}>{booking.order_name}</Text>
            <View style={styles.statusBadges}>
              <View style={[styles.statusBadge, { backgroundColor: displayStatus?.bgColor }]}>
                <View style={[styles.statusDot, { backgroundColor: displayStatus?.color }]} />
                <Text style={[styles.statusBadgeText, { color: displayStatus?.color }]}>
                  {displayStatus?.text}
                </Text>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View style={[styles.card, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
            <Text style={[styles.cardTitle, { color: appTheme.colors.text.primary }]}>{t.orders.bookingProgress}</Text>
            <BookingTimeline
              currentStatus={booking.status}
              rentalStartDate={booking.rental_start_date}
              rentalEndDate={booking.rental_end_date}
              createdAt={booking.created_at}
              themeColors={{
                primary: appTheme.colors.primary,
                success: appTheme.colors.accent.green,
                text: {
                  primary: appTheme.colors.text.primary,
                  secondary: appTheme.colors.text.secondary,
                  tertiary: appTheme.colors.text.tertiary,
                },
              }}
              translations={{
                requestSubmitted: t.orders.requestSubmitted,
                pickupDue: t.orders.pickupDue,
                pickupConfirmed: t.orders.pickupConfirmed,
                returnDue: t.orders.returnDue,
                completed: t.orders.completed,
                rejectedByOwner: t.orders.rejectedByOwner,
                rejectedByCamorent: t.orders.rejectedByCamorent,
              }}
            />
          </View>

          {/* OTP Display Card - Only visible to owner when OTP exists */}
          {otpData && (otpData.pickup_otp || otpData.return_otp) && (
            <View style={[styles.card, styles.otpCard, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.primary }]}>
              <View style={styles.otpHeader}>
                <Text style={[styles.otpIcon]}>🔐</Text>
                <Text style={[styles.cardTitle, { color: appTheme.colors.text.primary, marginBottom: 0 }]}>
                  Verification OTP
                </Text>
              </View>
              <Text style={[styles.otpSubtitle, { color: appTheme.colors.text.tertiary }]}>
                Share this OTP with the vendor to confirm pickup/return
              </Text>

              {/* Pickup OTP */}
              {otpData.pickup_otp && (
                <View style={[styles.otpRow, {
                  backgroundColor: otpData.pickup_otp_verified
                    ? (themeMode === 'dark' ? '#065F46' : '#D1FAE5')
                    : (themeMode === 'dark' ? '#1E3A8A' : '#DBEAFE')
                }]}>
                  <View style={styles.otpInfo}>
                    <Text style={[styles.otpLabel, { color: appTheme.colors.text.secondary }]}>
                      Pickup OTP
                    </Text>
                    {otpData.pickup_otp_verified ? (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Verified</Text>
                      </View>
                    ) : (
                      <Text style={[styles.otpValue, { color: appTheme.colors.primary }]}>
                        {otpData.pickup_otp}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Return OTP */}
              {otpData.return_otp && (
                <View style={[styles.otpRow, {
                  backgroundColor: otpData.return_otp_verified
                    ? (themeMode === 'dark' ? '#065F46' : '#D1FAE5')
                    : (themeMode === 'dark' ? '#7F1D1D' : '#FEE2E2'),
                  marginTop: 8
                }]}>
                  <View style={styles.otpInfo}>
                    <Text style={[styles.otpLabel, { color: appTheme.colors.text.secondary }]}>
                      Return OTP
                    </Text>
                    {otpData.return_otp_verified ? (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Verified</Text>
                      </View>
                    ) : (
                      <Text style={[styles.otpValue, { color: appTheme.colors.accent.red }]}>
                        {otpData.return_otp}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Requester Information */}
          {booking.buyer_name && (
            <View style={[styles.card, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
              <Text style={[styles.cardTitle, { color: appTheme.colors.text.primary }]}>{t.requestDetail.requester_info}</Text>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.name_label}</Text>
                <Text style={[styles.infoValueBold, { color: appTheme.colors.text.primary }]}>
                  {booking.buyer_company || booking.buyer_name}
                </Text>
              </View>
              {booking.buyer_phone && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.phone_label}</Text>
                  <Text style={[styles.infoValue, { color: appTheme.colors.text.secondary }]}>{booking.buyer_phone}</Text>
                </View>
              )}
            </View>
          )}

          {/* Rental Information */}
          <View style={[styles.card, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
            <Text style={[styles.cardTitle, { color: appTheme.colors.text.primary }]}>{t.requestDetail.rental_info}</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.start_date_label}</Text>
              <Text style={[styles.infoValue, { color: appTheme.colors.text.secondary }]}>{formatDate(booking.rental_start_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.end_date_label}</Text>
              <Text style={[styles.infoValue, { color: appTheme.colors.text.secondary }]}>{formatDate(booking.rental_end_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.duration_label}</Text>
              <Text style={[styles.infoValueBold, { color: appTheme.colors.text.primary }]}>{booking.total_rental_days} {t.units.days}</Text>
            </View>
          </View>

          {/* Equipment Details */}
          <View style={[styles.card, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
            <Text style={[styles.cardTitle, { color: appTheme.colors.text.primary }]}>{t.requestDetail.equipment} ({booking.sku_items.length} {t.units.items})</Text>
            {booking.sku_items.map((item, index) => (
              <View key={index} style={[styles.equipmentItem, { borderBottomColor: appTheme.colors.border.light }]}>
                <View style={styles.equipmentInfo}>
                  <Text style={[styles.equipmentName, { color: appTheme.colors.text.primary }]}>{item.name}</Text>
                  <Text style={[styles.equipmentMeta, { color: appTheme.colors.text.tertiary }]}>
                    {t.labels.qty} {item.quantity} × ₹{item.price_per_day}{t.units.per_day}
                  </Text>
                </View>
                <Text style={[styles.equipmentPrice, { color: appTheme.colors.text.primary }]}>
                  ₹{item.quantity * item.price_per_day * booking.total_rental_days}
                </Text>
              </View>
            ))}
          </View>

          {/* Crew Details (if any) */}
          {booking.crew_items && booking.crew_items.length > 0 && (
            <View style={[styles.card, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
              <Text style={[styles.cardTitle, { color: appTheme.colors.text.primary }]}>{t.requestDetail.crew} ({booking.crew_items.length} {t.units.members})</Text>
              {booking.crew_items.map((crew, index) => (
                <View key={index} style={[styles.equipmentItem, { borderBottomColor: appTheme.colors.border.light }]}>
                  <View style={styles.equipmentInfo}>
                    <Text style={[styles.equipmentName, { color: appTheme.colors.text.primary }]}>{crew.crew_type_name}</Text>
                    <Text style={[styles.equipmentMeta, { color: appTheme.colors.text.tertiary }]}>
                      {t.labels.qty} {crew.quantity} × ₹{crew.price_per_day}{t.units.per_day}
                    </Text>
                  </View>
                  <Text style={[styles.equipmentPrice, { color: appTheme.colors.text.primary }]}>
                    ₹{crew.quantity * crew.price_per_day * booking.total_rental_days}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Pricing Summary */}
          <View style={[styles.card, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
            <Text style={[styles.cardTitle, { color: appTheme.colors.text.primary }]}>{t.requestDetail.pricing_summary}</Text>
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.equipment_total}</Text>
              <Text style={[styles.pricingValue, { color: appTheme.colors.text.secondary }]}>₹{booking.sku_amount || 0}</Text>
            </View>
            {booking.crew_amount && booking.crew_amount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.crew_total}</Text>
                <Text style={[styles.pricingValue, { color: appTheme.colors.text.secondary }]}>₹{booking.crew_amount}</Text>
              </View>
            )}
            <View style={[styles.divider, { backgroundColor: appTheme.colors.border.light }]} />
            <View style={styles.pricingRow}>
              <Text style={[styles.totalLabel, { color: appTheme.colors.text.primary }]}>{t.requestDetail.grand_total}</Text>
              <Text style={[styles.totalValue, { color: appTheme.colors.primary }]}>₹{booking.total_amount}</Text>
            </View>

            {/* Payment Status */}
            {booking.payment_status && (
              <>
                <View style={[styles.divider, { backgroundColor: appTheme.colors.border.light }]} />
                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: appTheme.colors.text.tertiary }]}>{t.requestDetail.payment_status_label}</Text>
                  <View style={[
                    styles.paymentStatusBadge,
                    { backgroundColor: booking.payment_status === 'paid'
                      ? (themeMode === 'dark' ? appTheme.colors.accent.greenLight : '#DCFCE7')
                      : (themeMode === 'dark' ? appTheme.colors.accent.amberLight : '#FEF3C7')
                    }
                  ]}>
                    <Text style={[
                      styles.paymentStatusText,
                      { color: booking.payment_status === 'paid' ? appTheme.colors.accent.green : appTheme.colors.accent.amber }
                    ]}>
                      {booking.payment_status === 'paid' ? t.requestDetail.payment_paid : t.requestDetail.payment_pending}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons - Only show for pending requests */}
          {isPending && (
            <View style={styles.actionButtonsContainer}>
              <Animated.View style={[rejectAnimatedStyle, { flex: 1 }]}>
                <TouchableOpacity
                  onPress={handleRejectPress}
                  disabled={actionLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.rejectButton, actionLoading && styles.buttonDisabled]}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <XIcon color={appTheme.colors.text.inverse} size={20} />
                        <Text style={[styles.rejectButtonText, { color: appTheme.colors.text.inverse }]}>{t.buttons.reject}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[approveAnimatedStyle, { flex: 1 }]}>
                <TouchableOpacity
                  onPress={handleApprovePress}
                  disabled={actionLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#22C55E', '#16A34A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.approveButton, actionLoading && styles.buttonDisabled]}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={appTheme.colors.text.inverse} />
                    ) : (
                      <>
                        <CheckIcon color={appTheme.colors.text.inverse} size={20} />
                        <Text style={[styles.approveButtonText, { color: appTheme.colors.text.inverse }]}>{t.buttons.approve}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {/* Images Section - Show pickup/return images with challans */}
          {((booking.pickup_images && booking.pickup_images.length > 0) || (booking.return_images && booking.return_images.length > 0) || booking.challan_url || booking.return_challan_url) && (
            <View style={[styles.imagesCard, { backgroundColor: appTheme.colors.background.primary, borderColor: appTheme.colors.border.light }]}>
              <Text style={[styles.imageSectionTitle, { color: appTheme.colors.text.primary }]}>Uploaded Images</Text>

              {/* Pickup Section - Product Images + Challan */}
              {((booking.pickup_images && booking.pickup_images.length > 0) || booking.challan_url) && (
                <View style={styles.imageSection}>
                  <Text style={[styles.imageSectionTitle, { color: appTheme.colors.text.primary }]}>
                    Pickup Images ({(booking.pickup_images?.length || 0) + (booking.challan_url ? 1 : 0)})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                    {/* Pickup Product Images */}
                    {booking.pickup_images?.map((url, index) => (
                      <TouchableOpacity
                        key={`pickup-${index}`}
                        onPress={() => Linking.openURL(url)}
                        style={[styles.imageContainer, { backgroundColor: appTheme.colors.background.tertiary, borderColor: appTheme.colors.border.light }]}
                      >
                        <Image
                          source={{ uri: url }}
                          style={styles.uploadedImage}
                          resizeMode="cover"
                        />
                        <Text style={[styles.imageCaption, { color: appTheme.colors.text.secondary }]}>Product {index + 1}</Text>
                      </TouchableOpacity>
                    ))}

                    {/* Pickup Challan */}
                    {booking.challan_url && (
                      <TouchableOpacity
                        key="pickup-challan"
                        onPress={() => Linking.openURL(booking.challan_url!)}
                        style={[styles.imageContainer, { backgroundColor: appTheme.colors.background.tertiary, borderColor: '#10B981', borderWidth: 2 }]}
                      >
                        <Image
                          source={{ uri: booking.challan_url }}
                          style={styles.uploadedImage}
                          resizeMode="contain"
                        />
                        <Text style={[styles.imageCaption, { color: '#10B981', fontWeight: '600' }]}>Challan</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Return Section - Product Images + Challan */}
              {((booking.return_images && booking.return_images.length > 0) || booking.return_challan_url) && (
                <View style={styles.imageSection}>
                  <Text style={[styles.imageSectionTitle, { color: appTheme.colors.text.primary }]}>
                    Return Images ({(booking.return_images?.length || 0) + (booking.return_challan_url ? 1 : 0)})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                    {/* Return Product Images */}
                    {booking.return_images?.map((url, index) => (
                      <TouchableOpacity
                        key={`return-${index}`}
                        onPress={() => Linking.openURL(url)}
                        style={[styles.imageContainer, { backgroundColor: appTheme.colors.background.tertiary, borderColor: appTheme.colors.border.light }]}
                      >
                        <Image
                          source={{ uri: url }}
                          style={styles.uploadedImage}
                          resizeMode="cover"
                        />
                        <Text style={[styles.imageCaption, { color: appTheme.colors.text.secondary }]}>Product {index + 1}</Text>
                      </TouchableOpacity>
                    ))}

                    {/* Return Challan */}
                    {booking.return_challan_url && (
                      <TouchableOpacity
                        key="return-challan"
                        onPress={() => Linking.openURL(booking.return_challan_url!)}
                        style={[styles.imageContainer, { backgroundColor: appTheme.colors.background.tertiary, borderColor: '#3B82F6', borderWidth: 2 }]}
                      >
                        <Image
                          source={{ uri: booking.return_challan_url }}
                          style={styles.uploadedImage}
                          resizeMode="contain"
                        />
                        <Text style={[styles.imageCaption, { color: '#3B82F6', fontWeight: '600' }]}>Challan</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : null}

      {/* Approve Confirmation Modal */}
      <SuccessModal
        visible={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title={t.alerts.approve_title}
        message={t.alerts.approve_confirm}
        primaryButtonText={t.buttons.approve}
        secondaryButtonText={t.buttons.cancel}
        onPrimaryPress={handleApprove}
        onSecondaryPress={() => setShowApproveModal(false)}
        icon="warning"
      />

      {/* Reject Confirmation Modal */}
      <SuccessModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={t.alerts.reject_title}
        message={t.alerts.reject_confirm}
        primaryButtonText={t.buttons.reject}
        secondaryButtonText={t.buttons.cancel}
        onPrimaryPress={handleReject}
        onSecondaryPress={() => setShowRejectModal(false)}
        icon="warning"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={modalTitle}
        message={modalMessage}
        primaryButtonText={t.buttons.ok}
        onPrimaryPress={handleSuccessModalClose}
        icon={modalIcon}
      />

      {/* Error Modal */}
      <SuccessModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title={modalTitle}
        message={modalMessage}
        primaryButtonText={t.buttons.ok}
        onPrimaryPress={handleErrorModalClose}
        icon="error"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  paymentBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentBannerIconText: {
    fontSize: 20,
  },
  paymentBannerTextContainer: {
    flex: 1,
  },
  paymentBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  paymentBannerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValueBold: {
    fontSize: 14,
    fontWeight: '700',
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  equipmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  equipmentMeta: {
    fontSize: 12,
  },
  equipmentPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 14,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: Platform.OS === 'android' ? 40 : 16,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  approveButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  rejectButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  imagesCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  imageSection: {
    marginTop: 12,
  },
  imageSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageScrollView: {
    marginHorizontal: -4,
  },
  imageContainer: {
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    width: 120,
  },
  uploadedImage: {
    width: 120,
    height: 120,
  },
  imageCaption: {
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 6,
  },
  bottomSpacer: {
    height: 20,
  },
  // OTP Card Styles
  otpCard: {
    borderWidth: 2,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  otpIcon: {
    fontSize: 20,
  },
  otpSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  otpRow: {
    padding: 16,
    borderRadius: 12,
  },
  otpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  otpValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
