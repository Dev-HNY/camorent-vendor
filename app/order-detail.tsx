/**
 * Order Detail / Job Detail Screen
 * Shows complete order summary with all selected products, dates, and rental information
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../src/theme';
import { useOrderStore } from '../src/store/orderStore';
import { bookingService, BookingDetailResponse } from '../src/services/api/bookingService';
import BookingTimeline from '../src/components/BookingTimeline';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { SuccessModal } from '../src/components/common/SuccessModal';

// Modern SVG Icons
const ChevronLeftIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClipboardListIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 12H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 16H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MapPinIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 6V12L16 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27099 2.12 4.17999C2.09501 3.90347 2.12788 3.62476 2.21649 3.36162C2.30511 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55778 2.05833 3.83234 2.00026 4.11 1.99999H7.11C7.59531 1.9952 8.06579 2.16705 8.43376 2.48351C8.80173 2.79997 9.04207 3.23945 9.11 3.71999C9.23662 4.68007 9.47144 5.62273 9.81 6.52999C9.94455 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.63999L8.09 9.90999C9.51356 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon = ({ color, strokeColor, size = 24 }: { color: string; strokeColor: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      fill={color}
    />
    <Path
      d="M12 16V12M12 8H12.01"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PackageIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 9.4L7.5 4.21M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.27002 6.96L12 12.01L20.73 6.96M12 22.08V12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const confirmOrder = useOrderStore((state) => state.confirmOrder);
  const { theme: appTheme, themeMode } = useTheme();
  const { t } = useTranslation();

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isHistory = params.isHistory === 'true';
  const bookingId = params.bookingId as string;
  const orderName = (params.orderName as string) || currentOrder?.orderName || 'Order Name';
  const orderId = params.orderId as string;
  const ownerName = params.ownerName as string;
  const ownerPhone = params.ownerPhone as string;

  // Check if this is a new order (not saved yet) or an existing order being viewed
  const isNewOrder = !isHistory && !orderId && currentOrder !== null;
  const isExistingBooking = !!bookingId;

  const fromDate = params.fromDate ? new Date(params.fromDate as string) : null;
  const tillDate = params.tillDate ? new Date(params.tillDate as string) : null;

  // Fetch booking details - memoized with useCallback
  const fetchBookingDetails = useCallback(async (showLoadingState = false) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);
      const response = await bookingService.getBookingDetails(bookingId);
      setBooking(response);
    } catch (err: any) {
      console.error('Error fetching booking details:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [bookingId]);

  // Fetch booking details if bookingId is provided and set up auto-refresh
  useEffect(() => {
    if (!bookingId) return;

    // Initial fetch with loading state
    fetchBookingDetails(true);

    // Set up auto-refresh every 10 seconds to detect status changes (without loading state)
    const interval = setInterval(() => {
      fetchBookingDetails(false);
    }, 10000); // 10 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [bookingId, fetchBookingDetails]);

  // Get the order from orders list if it's an active job
  const orders = useOrderStore((state) => state.orders);
  const activeOrder = orders.find(order => order.orderName === orderId);

  const displayProducts = isExistingBooking && booking
    ? booking.sku_items
    : (activeOrder?.products || currentOrder?.products || []);

  const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getDisplayStatus = (status: string, isDark: boolean): { text: string; color: string; bgColor: string } => {
    switch (status) {
      case 'pending_request':
        return {
          text: t.status.pending_request,
          color: appTheme.colors.accent.amber,
          bgColor: isDark ? appTheme.colors.accent.amberLight : '#FEF3C7'
        };
      case 'pickup_due':
        return {
          text: t.status.pickup_due,
          color: '#8B5CF6',
          bgColor: isDark ? '#4C1D95' : '#EDE9FE'
        };
      case 'pickup_confirmed':
        return {
          text: t.status.pickup_confirmed,
          color: appTheme.colors.status.info,
          bgColor: isDark ? '#1E3A8A' : '#DBEAFE'
        };
      case 'return_due':
        return {
          text: t.status.return_due,
          color: appTheme.colors.accent.red,
          bgColor: isDark ? '#7F1D1D' : '#FEE2E2'
        };
      case 'completed':
        return {
          text: t.status.completed,
          color: appTheme.colors.accent.green,
          bgColor: isDark ? appTheme.colors.accent.greenLight : '#DCFCE7'
        };
      case 'vendor_rejection':
      case 'camorent_rejection':
        return {
          text: t.status.rejected_vendor,
          color: appTheme.colors.accent.red,
          bgColor: isDark ? '#7F1D1D' : '#FEE2E2'
        };
      default:
        return {
          text: t.orders.pending,
          color: appTheme.colors.accent.amber,
          bgColor: isDark ? appTheme.colors.accent.amberLight : '#FEF3C7'
        };
    }
  };

  const calculateDuration = (): number => {
    if (isExistingBooking && booking) {
      return booking.total_rental_days || 0;
    }
    if (!fromDate || !tillDate) return 0;
    const diffTime = Math.abs(tillDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Add 1 to include both start and end dates (rental includes both days)
    return diffDays;
  };

  const calculateExpectedReturn = (): string => {
    if (isExistingBooking && booking) {
      return formatDate(booking.rental_end_date);
    }
    if (!tillDate) return t.orders.notAvailable;
    return formatDate(tillDate);
  };

  const duration = calculateDuration();
  const expectedReturn = calculateExpectedReturn();

  // Get display data based on whether it's an existing booking or new order
  const displayOrderName = isExistingBooking && booking ? booking.order_name : orderName;
  const displayStatus = isExistingBooking && booking
    ? getDisplayStatus(booking.status, themeMode === 'dark')
    : {
        text: t.orders.pending,
        color: appTheme.colors.accent.amber,
        bgColor: themeMode === 'dark' ? appTheme.colors.accent.amberLight : '#FEF3C7'
      };
  const displayOwnerName = isExistingBooking && booking
    ? (booking.owner_company ? `${booking.owner_company} (${booking.owner_name})` : booking.owner_name)
    : (ownerName || 'Camorent India Pvt. Ltd.');
  const displayStartDate = isExistingBooking && booking ? formatDate(booking.rental_start_date) : (fromDate ? formatDate(fromDate) : t.calendar.selectDate);

  const handleRequestPickup = () => {
    if (isHistory) {
      // For history orders, just show alert or do nothing
      console.log('Viewing history order');
      return;
    }

    // For new orders, confirm and save to orders list
    if (currentOrder) {
      confirmOrder();
      // Navigate to active jobs tab
      router.replace('/(tabs)/active-jobs');
    }
  };

  const handleCallOwner = async () => {
    // Get phone number from booking or params
    const phoneNumber = (isExistingBooking && booking?.owner_phone) || ownerPhone;

    if (phoneNumber) {
      const phoneUrl = `tel:${phoneNumber}`;

      try {
        const supported = await Linking.canOpenURL(phoneUrl);
        if (supported) {
          await Linking.openURL(phoneUrl);
        } else {
          setErrorMessage('Phone dialer is not available on this device');
          setShowError(true);
        }
      } catch (error) {
        console.error('Error opening phone dialer:', error);
        setErrorMessage('Failed to open phone dialer');
        setShowError(true);
      }
    } else {
      setErrorMessage(t.orders.ownerPhoneNotAvailable);
      setShowError(true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={appTheme.colors.primary}
      />

      {/* Header */}
      <LinearGradient
        colors={[appTheme.colors.primary, appTheme.colors.primaryDark]}
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
          <ClipboardListIcon color={appTheme.colors.text.inverse} size={24} />
          <Text style={[styles.headerTitle, { color: appTheme.colors.text.inverse }]}>{t.orders.orderDetails}</Text>
        </View>
        <View style={styles.headerRight} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchBookingDetails(true)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t.buttons.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView style={[styles.scrollView, { backgroundColor: appTheme.colors.background.secondary }]} showsVerticalScrollIndicator={false}>
        {/* Order Name Card */}
        <View style={[styles.orderCard, { backgroundColor: appTheme.colors.background.primary }]}>
          <View style={styles.orderHeaderRow}>
            <Text style={styles.orderName}>{displayOrderName}</Text>
            <TouchableOpacity
              style={[
                styles.phoneButton,
                (!(isExistingBooking && booking?.owner_phone) && !ownerPhone) && styles.phoneButtonDisabled
              ]}
              onPress={handleCallOwner}
              disabled={!(isExistingBooking && booking?.owner_phone) && !ownerPhone}
            >
              <PhoneIcon color={appTheme.colors.primary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusBadges}>
            <View style={[styles.vendorAcceptedBadge, { backgroundColor: displayStatus.bgColor }]}>
              <View style={[styles.statusDot, { backgroundColor: displayStatus.color }]} />
              <Text style={[styles.vendorAcceptedBadgeText, { color: displayStatus.color }]}>
                {displayStatus.text}
              </Text>
            </View>
          </View>

          {/* Vendor/Owner Information */}
          {isExistingBooking && (
            <View style={styles.infoRowVertical}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.text.secondary }]}>{t.orders.equipmentOwner}:</Text>
              <Text style={[styles.infoValueBold, { color: appTheme.colors.text.primary }]} numberOfLines={3}>
                {displayOwnerName}
              </Text>
            </View>
          )}

          {/* Requester Information */}
          {isExistingBooking && booking?.buyer_name && (
            <View style={styles.infoRowVertical}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.text.secondary }]}>{t.orders.requester}:</Text>
              <Text style={[styles.infoValueBold, { color: appTheme.colors.text.primary }]} numberOfLines={3}>
                {booking.buyer_company ? `${booking.buyer_company} (${booking.buyer_name})` : booking.buyer_name}
              </Text>
            </View>
          )}

          {/* Address - Show if available */}
          {isExistingBooking && booking?.address_id && (
            <View style={styles.infoRow}>
              <MapPinIcon color={appTheme.colors.text.secondary} size={18} />
              <Text style={[styles.infoText, { color: appTheme.colors.text.secondary }]}>
                {booking.delivery_type === 'delivery' ? t.orders.deliveryAddress : t.orders.pickupLocation}
              </Text>
            </View>
          )}

          {/* Date and Time */}
          <View style={styles.infoRow}>
            <ClockIcon color={appTheme.colors.text.secondary} size={18} />
            <Text style={[styles.infoText, { color: appTheme.colors.text.secondary }]}>
              {displayStartDate}, 08:00 AM
            </Text>
          </View>
        </View>

        {/* Rental Information */}
        <View style={[styles.rentalInfoCard, { backgroundColor: appTheme.colors.background.primary }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text.primary }]}>{t.orders.rentalInformation}</Text>
            <InfoIcon color={appTheme.colors.accent.amber} strokeColor={appTheme.colors.text.inverse} size={24} />
          </View>

          <View style={styles.rentalGrid}>
            <View style={styles.rentalItem}>
              <Text style={[styles.rentalLabel, { color: appTheme.colors.text.secondary }]}>{t.orders.duration}</Text>
              <Text style={[styles.rentalValue, { color: appTheme.colors.text.primary }]}>{duration} {t.orders.days}</Text>
            </View>
            <View style={styles.rentalItem}>
              <Text style={[styles.rentalLabel, { color: appTheme.colors.text.secondary }]}>{t.orders.expectedReturn}</Text>
              <Text style={[styles.rentalValue, { color: appTheme.colors.text.primary }]}>
                {expectedReturn}, 08:00 AM
              </Text>
            </View>
          </View>

          <View style={[styles.rentalCycleInfo, { backgroundColor: appTheme.colors.background.tertiary }]}>
            <Text style={[styles.rentalCycleText, { color: appTheme.colors.text.secondary }]}>
              {t.orders.rentalCycle}: 08:00 AM → {t.orders.nextDay} 08:00 AM
            </Text>
          </View>
        </View>

        {/* Timeline - Only show for existing bookings */}
        {isExistingBooking && booking && (
          <View style={[styles.timelineCard, { backgroundColor: appTheme.colors.background.primary }]}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text.primary }]}>{t.orders.bookingProgress}</Text>
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
        )}

        {/* Items Section */}
        <View style={[styles.itemsCard, { backgroundColor: appTheme.colors.background.primary }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text.primary }]}>
              {t.orders.itemsCount}({displayProducts.length})
            </Text>
            <PackageIcon color={appTheme.colors.primary} size={24} />
          </View>

          {displayProducts && displayProducts.length > 0 ? (
            displayProducts.map((product, index) => {
              // Use product.name for both existing bookings and new orders
              const itemName = product.name || `SKU: ${product.sku_id || product.id}`;
              const itemQuantity = product.quantity || 1;
              const itemPrice = isExistingBooking
                ? (product.total_price ? `₹${product.total_price} total` : t.orders.notAvailable)
                : (product.pricePerDay ? `₹${product.pricePerDay}/day` : t.orders.notAvailable);

              return (
                <TouchableOpacity key={index} style={[styles.itemRow, { borderBottomColor: appTheme.colors.border.light }]}>
                  <View style={styles.itemLeft}>
                    <Text style={[styles.itemName, { color: appTheme.colors.text.primary }]}>{itemName}</Text>
                    <Text style={[styles.itemQuantity, { color: appTheme.colors.text.secondary }]}>
                      {t.labels.qty} {itemQuantity} • {itemPrice}
                    </Text>
                  </View>
                  <ChevronRightIcon color={appTheme.colors.text.tertiary} size={20} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyItems}>
              <Text style={[styles.emptyItemsText, { color: appTheme.colors.text.tertiary }]}>{t.orders.noItems}</Text>
            </View>
          )}
        </View>

        {/* Pricing Summary - Only show for existing bookings */}
        {isExistingBooking && booking && (
          <View style={[styles.pricingCard, { backgroundColor: appTheme.colors.background.primary }]}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text.primary }]}>{t.requestDetail.pricing_summary}</Text>

            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, { color: appTheme.colors.text.secondary }]}>{t.settlement.equipment}</Text>
              <Text style={[styles.pricingValue, { color: appTheme.colors.text.primary }]}>
                ₹{((booking.total_equipment_amount || booking.sku_amount || 0)).toLocaleString('en-IN')}
              </Text>
            </View>

            {booking.crew_amount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: appTheme.colors.text.secondary }]}>{t.settlement.crew}</Text>
                <Text style={[styles.pricingValue, { color: appTheme.colors.text.primary }]}>
                  ₹{(booking.total_crew_amount || booking.crew_amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {booking.coupon_discount_amount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: appTheme.colors.accent.green }]}>{t.orders.discount}</Text>
                <Text style={[styles.pricingValue, { color: appTheme.colors.accent.green }]}>
                  -₹{booking.coupon_discount_amount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            <View style={[styles.pricingDivider, { backgroundColor: appTheme.colors.border.light }]} />

            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabelBold, { color: appTheme.colors.text.primary }]}>{t.settlement.totalAmount}</Text>
              <Text style={[styles.pricingValueBold, { color: appTheme.colors.text.primary }]}>
                ₹{(booking.total_amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            {booking.advanced_amount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: appTheme.colors.text.secondary }]}>{t.orders.advancedPaid}</Text>
                <Text style={[styles.pricingValue, { color: appTheme.colors.accent.green }]}>
                  ₹{booking.advanced_amount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {booking.final_amount !== booking.total_amount && (
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabelBold, { color: appTheme.colors.text.primary }]}>{t.orders.finalAmount}</Text>
                <Text style={[styles.pricingValueBold, { color: appTheme.colors.primary }]}>
                  ₹{(booking.final_amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {/* Payment Status */}
            {booking.payment_status && (
              <>
                <View style={[styles.pricingDivider, { backgroundColor: appTheme.colors.border.light }]} />
                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: appTheme.colors.text.secondary }]}>{t.settlement.paymentStatus}</Text>
                  <View style={[
                    styles.paymentStatusBadge,
                    { backgroundColor: booking.payment_status === 'paid' ? appTheme.colors.accent.greenLight : appTheme.colors.accent.amberLight }
                  ]}>
                    <Text style={[
                      styles.paymentStatusText,
                      { color: booking.payment_status === 'paid' ? appTheme.colors.accent.green : appTheme.colors.accent.amber }
                    ]}>
                      {booking.payment_status === 'paid' ? t.settlement.paid : t.settlement.pending}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Images Section - Only show for existing bookings with images */}
        {isExistingBooking && booking && ((booking.pickup_images && booking.pickup_images.length > 0) || (booking.return_images && booking.return_images.length > 0) || booking.challan_url || booking.return_challan_url) && (
          <View style={[styles.imagesCard, { backgroundColor: appTheme.colors.background.primary }]}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text.primary }]}>Uploaded Images</Text>

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
                      style={[styles.imageContainer, { backgroundColor: appTheme.colors.background.tertiary, borderColor: '#10B981' }]}
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
                      style={[styles.imageContainer, { backgroundColor: appTheme.colors.background.tertiary, borderColor: '#3B82F6' }]}
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
      )}

      {/* Bottom Request Pickup Button - Only show for new orders (not existing bookings) */}
      {isNewOrder && !isExistingBooking && (
        <View style={[styles.bottomButtonContainer, { backgroundColor: appTheme.colors.background.primary, borderTopColor: appTheme.colors.border.light }]}>
          <TouchableOpacity onPress={handleRequestPickup} activeOpacity={0.9}>
            <LinearGradient
              colors={[appTheme.colors.primary, appTheme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.requestPickupButton}
            >
              <Text style={[styles.requestPickupButtonText, { color: appTheme.colors.text.inverse }]}>{t.buttons.request_pickup}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm Pickup Button - Show when status is pickup_due */}
      {isExistingBooking && booking && booking.status === 'pickup_due' && (
        <View style={[styles.bottomButtonContainer, { backgroundColor: appTheme.colors.background.primary, borderTopColor: appTheme.colors.border.light }]}>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/confirm-pickup',
              params: {
                bookingId: booking.vendor_booking_id,
                orderName: booking.order_name,
              }
            })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.requestPickupButton}
            >
              <Text style={[styles.requestPickupButtonText, { color: appTheme.colors.text.inverse }]}>Confirm Pickup</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm Return Button - Show when status is return_due */}
      {isExistingBooking && booking && booking.status === 'return_due' && (
        <View style={[styles.bottomButtonContainer, { backgroundColor: appTheme.colors.background.primary, borderTopColor: appTheme.colors.border.light }]}>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/confirm-return',
              params: {
                bookingId: booking.vendor_booking_id,
                orderName: booking.order_name,
              }
            })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.requestPickupButton}
            >
              <Text style={[styles.requestPickupButtonText, { color: appTheme.colors.text.inverse }]}>Confirm Return</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title={t.orders.info}
        message={errorMessage}
        icon="error"
        primaryButtonText="OK"
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  phoneButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneButtonDisabled: {
    opacity: 0.5,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  requestPickupBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  requestPickupBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  vendorAcceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  vendorAcceptedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  infoRowVertical: {
    flexDirection: 'column',
    marginBottom: 12,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  rentalInfoCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  timelineCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  rentalGrid: {
    gap: 16,
  },
  rentalItem: {
    gap: 4,
  },
  rentalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rentalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  rentalCycleInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  rentalCycleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemsCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
  },
  emptyItems: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: 14,
  },
  pricingCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  pricingLabelBold: {
    fontSize: 15,
    fontWeight: '700',
  },
  pricingValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  pricingDivider: {
    height: 1,
    marginVertical: 8,
    marginBottom: 16,
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
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  requestPickupButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  requestPickupButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 0,
  },
  infoValueBold: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  imagesCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  imageSection: {
    marginTop: 16,
  },
  imageSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageScrollView: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  uploadedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  imageCaption: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  imageText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});
