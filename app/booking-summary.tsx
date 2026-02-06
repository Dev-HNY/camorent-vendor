/**
 * Booking Summary Screen
 * Shows booking summary and creates booking via check-availability API
 * Creates booking in draft status (pending_request)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { useOrderStore } from '../src/store/orderStore';
import { bookingService, CartItemData } from '../src/services/api';
import { scaleWidth, scaleHeight, spacing, fontSize } from '../src/utils/responsive';
import { SuccessModal, ScreenHeader } from '../src/components';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const orderName = params.orderName as string || t.bookingSummary.new_order;
  const startDate = params.startDate as string;
  const endDate = params.endDate as string;
  const ownerId = params.ownerId as string;
  const ownerName = params.ownerName as string;
  const ownerPhone = params.ownerPhone as string;

  const currentOrder = useOrderStore((state) => state.currentOrder);
  const clearCurrentOrder = useOrderStore((state) => state.clearCurrentOrder);

  const products = currentOrder?.products || [];

  const [isLoading, setIsLoading] = useState(false);
  const [, setBookingCreated] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculateRentalDays = (): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Add 1 to include both start and end dates (rental includes both days)
    return diffDays;
  };

  const calculateTotalAmount = (): number => {
    const rentalDays = calculateRentalDays();
    return products.reduce((total, product) => {
      return total + (product.pricePerDay * product.quantity * rentalDays);
    }, 0);
  };

  const handleCreateBooking = async () => {
    try {
      setIsLoading(true);

      // Prepare cart items
      const items: CartItemData[] = products.map(product => ({
        sku_id: product.id,
        quantity: product.quantity,
        addons: [], // No addons for now
      }));

      // Call check-availability API
      const response = await bookingService.checkAvailability(ownerId, {
        order_name: orderName,
        items,
        crews: [], // No crew for now
        rental_start_date: startDate,
        rental_end_date: endDate,
        coupon_codes: [],
      });

      setBookingId(response.vendor_booking_id);
      setBookingCreated(true);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setErrorMessage(
        error.response?.data?.detail?.message || t.errors.failed_create_booking
      );
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleViewBookings = () => {
    setShowSuccessModal(false);
    clearCurrentOrder();
    router.replace('/(tabs)/active-jobs');
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    clearCurrentOrder();
    router.replace('/(tabs)/home');
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader
        title={t.bookingSummary.title}
        subtitle={orderName}
      />

      <ScrollView style={[styles.content, { backgroundColor: theme.colors.background.secondary }]} showsVerticalScrollIndicator={false}>
        {/* Booking Details Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.primary }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{t.bookingSummary.booking_details}</Text>

          <View style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.order_name_label}</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{orderName}</Text>
          </View>

          <View style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.start_date_label}</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {new Date(startDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.end_date_label}</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {new Date(endDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.rental_days_label}</Text>
            <Text style={[styles.detailValueHighlight, { color: theme.colors.primary }]}>{calculateRentalDays()} {t.units.days}</Text>
          </View>
        </View>

        {/* Vendor Details Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.primary }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{t.bookingSummary.pickup_from}</Text>

          {ownerName ? (
            <>
              <View style={[styles.vendorHeader, { borderBottomColor: theme.colors.border.light }]}>
                <View style={[styles.vendorAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.vendorAvatarText}>
                    {ownerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.vendorInfo}>
                  <Text style={[styles.vendorName, { color: theme.colors.text.primary }]}>{ownerName}</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>{t.bookingSummary.verified_vendor}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.vendorContactRow}>
                <Text style={[styles.vendorContactLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.phone_label}</Text>
                <Text style={[styles.vendorContactValue, { color: theme.colors.text.primary }]}>{ownerPhone}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Products List */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.primary }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{t.bookingSummary.equipment} ({products.length} {t.units.items})</Text>

          {products.map((product) => (
            <View key={product.id} style={[styles.productRow, { borderBottomColor: theme.colors.border.light }]}>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.colors.text.primary }]}>{product.name}</Text>
                <Text style={[styles.productMeta, { color: theme.colors.text.secondary }]}>
                  {product.brand} • {product.category}
                </Text>
                <Text style={[styles.productPrice, { color: theme.colors.text.tertiary }]}>
                  ₹{product.pricePerDay} x {product.quantity} x {calculateRentalDays()} {t.units.days}
                </Text>
              </View>
              <Text style={[styles.productTotal, { color: theme.colors.text.primary }]}>
                ₹{product.pricePerDay * product.quantity * calculateRentalDays()}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing Summary */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.primary }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{t.bookingSummary.pricing_summary}</Text>

          <View style={styles.pricingRow}>
            <Text style={[styles.pricingLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.equipment_total_label}</Text>
            <Text style={[styles.pricingValue, { color: theme.colors.text.primary }]}>₹{calculateTotalAmount()}</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={[styles.pricingLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.crew_total_label}</Text>
            <Text style={[styles.pricingValue, { color: theme.colors.text.primary }]}>₹0</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />

          <View style={styles.pricingRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>{t.bookingSummary.total_amount_label}</Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>₹{calculateTotalAmount()}</Text>
          </View>
        </View>

        {/* Important Notice */}
        <View style={[styles.noticeCard, { backgroundColor: theme.colors.background.primary, borderLeftColor: theme.colors.primary }]}>
          <Text style={[styles.noticeTitle, { color: theme.colors.text.primary }]}>{t.bookingSummary.pickup_info_title}</Text>
          <Text style={[styles.noticeText, { color: theme.colors.text.secondary }]}>
            {t.bookingSummary.pickup_info_text}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.background.primary, borderTopColor: theme.colors.border.light, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.bottomInfo}>
          <Text style={[styles.bottomLabel, { color: theme.colors.text.secondary }]}>{t.bookingSummary.total_amount_label}</Text>
          <Text style={[styles.bottomValue, { color: theme.colors.text.primary }]}>₹{calculateTotalAmount()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }, isLoading && styles.createButtonDisabled]}
          onPress={handleCreateBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.createButtonText}>{t.buttons.request_pickup}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title={t.alerts.pickup_request_created_title}
        message={t.alerts.pickup_request_created_message
          .replace('{ownerName}', ownerName)
          .replace('{bookingId}', bookingId)}
        primaryButtonText={t.buttons.view_my_bookings}
        secondaryButtonText={t.buttons.create_another}
        onPrimaryPress={handleViewBookings}
        onSecondaryPress={handleCreateAnother}
        icon="success"
      />

      {/* Error Modal */}
      <SuccessModal
        visible={showErrorModal}
        onClose={handleCloseErrorModal}
        title={t.alerts.booking_failed_title}
        message={errorMessage}
        primaryButtonText={t.buttons.ok}
        onPrimaryPress={handleCloseErrorModal}
        icon="error"
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
  },
  card: {
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    borderRadius: scaleWidth(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 4,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  detailValueHighlight: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: fontSize.sm,
  },
  productTotal: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 4,
  },
  pricingLabel: {
    fontSize: fontSize.sm,
  },
  pricingValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm + 4,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  noticeCard: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: scaleWidth(14),
    borderLeftWidth: 3,
  },
  noticeTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs + 4,
  },
  noticeText: {
    fontSize: fontSize.sm + 1,
    lineHeight: scaleHeight(20),
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomInfo: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  bottomValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  createButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: scaleWidth(12),
    minWidth: scaleWidth(160),
    alignItems: 'center',
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingVendor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg - 4,
  },
  loadingVendorText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm + 4,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  vendorAvatar: {
    width: scaleWidth(60),
    height: scaleWidth(60),
    borderRadius: scaleWidth(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    shadowOffset: { width: 0, height: scaleHeight(3) },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  vendorAvatarText: {
    fontSize: fontSize.xxl + 4,
    fontWeight: '700',
    color: '#ffffff',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  verifiedBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 4,
    borderRadius: scaleWidth(12),
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: fontSize.xs + 1,
    fontWeight: '600',
    color: '#ffffff',
  },
  vendorContactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
  },
  vendorContactLabel: {
    fontSize: fontSize.sm + 1,
  },
  vendorContactValue: {
    fontSize: fontSize.sm + 1,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
