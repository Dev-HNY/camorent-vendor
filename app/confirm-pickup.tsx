/**
 * Confirm Pick-up Screen
 * Allows vendors to select which approved order to pick up
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookingService, VendorBookingListItem } from '../src/services/api/bookingService';
import { Logo, ScreenHeader } from '../src/components';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';

export default function ConfirmPickupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const preSelectedBookingId = params.bookingId as string | undefined;

  const [bookings, setBookings] = useState<VendorBookingListItem[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch pickup due bookings
  useEffect(() => {
    fetchPickupDueBookings();
  }, []);

  // Auto-select booking if bookingId is provided
  useEffect(() => {
    if (preSelectedBookingId && bookings.length > 0) {
      const booking = bookings.find(b => b.vendor_booking_id === preSelectedBookingId);
      if (booking) {
        setSelectedBookingId(booking.vendor_booking_id);
      }
    }
  }, [preSelectedBookingId, bookings]);

  const fetchPickupDueBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookings({
        role: 'buyer',
        page: 1,
        limit: 100,
      });

      // Filter for pickup_due status only
      const pickupDueBookings = response.data.filter(
        (booking) => booking.status === 'pickup_due'
      );

      setBookings(pickupDueBookings);
    } catch (error) {
      console.error('Error fetching pickup due bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${month} ${day}`;
  };

  const getEquipmentSummary = (skuList: string[]): string => {
    if (skuList.length === 0) return t.confirmPickup.noItems;
    if (skuList.length === 1) return t.confirmPickup.oneItem;
    return t.confirmPickup.multipleItems.replace('{count}', skuList.length.toString());
  };


  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDropdownOpen(false);
  };

  const handleProceed = () => {
    if (!selectedBookingId) {
      // Show alert or error message
      return;
    }
    const selectedBooking = bookings.find(b => b.vendor_booking_id === selectedBookingId);
    if (selectedBooking) {
      router.push(`/scan-product?bookingId=${encodeURIComponent(selectedBookingId)}&orderName=${encodeURIComponent(selectedBooking.order_name)}`);
    }
  };

  const selectedBooking = bookings.find(b => b.vendor_booking_id === selectedBookingId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader title={t.confirmPickup.title} />

      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background.secondary }]} contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size={100} />
        </View>

        {/* Title */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t.confirmPickup.chooseOrder}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>{t.confirmPickup.loadingOrders}</Text>
          </View>
        ) : (
          <>
            {/* Dropdown */}
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={[styles.dropdownText, { color: theme.colors.text.primary }, !selectedBookingId && { color: theme.colors.text.tertiary }]}>
                {selectedBooking ? selectedBooking.order_name : t.confirmPickup.select}
              </Text>
              <Text style={[styles.dropdownArrow, { color: theme.colors.text.tertiary }]}>▼</Text>
            </TouchableOpacity>

            {/* Dropdown Options */}
            {dropdownOpen && (
              <View style={[styles.dropdownOptions, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => {
                    const equipment = getEquipmentSummary(booking.sku_list);

                    return (
                      <TouchableOpacity
                        key={`${booking.vendor_booking_id}-${index}`}
                        style={[styles.dropdownOption, { borderBottomColor: theme.colors.border.light }]}
                        onPress={() => handleSelectBooking(booking.vendor_booking_id)}
                      >
                        <View style={styles.optionHeader}>
                          <Text style={[styles.optionOrderName, { color: theme.colors.text.primary }]}>{booking.order_name}</Text>
                          <Text style={[styles.optionItemCount, { color: theme.colors.text.tertiary }]}>{equipment}</Text>
                        </View>
                        <Text style={[styles.optionEquipment, { color: theme.colors.text.secondary }]}>
                          {t.confirmPickup.owner}: {booking.owner_company ? `${booking.owner_company} (${booking.owner_name})` : booking.owner_name}
                        </Text>
                        {booking.owner_company && (
                          <Text style={[styles.optionDetail, { color: theme.colors.text.secondary }]}>
                            Organization: {booking.owner_company}
                          </Text>
                        )}
                        <Text style={[styles.optionDate, { color: theme.colors.text.secondary }]}>
                          {formatDate(booking.rental_start_date)}→{formatDate(booking.rental_end_date)} ({booking.total_rental_days}d)
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.dropdownOption}>
                    <Text style={[styles.dropdownOptionText, { color: theme.colors.text.secondary }]}>{t.confirmPickup.noOrders}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            { backgroundColor: theme.colors.primary },
            !selectedBookingId && [styles.proceedButtonDisabled, { backgroundColor: theme.colors.text.tertiary }],
          ]}
          onPress={handleProceed}
          disabled={!selectedBookingId}
        >
          <Text style={styles.proceedButtonText}>{t.confirmPickup.proceed}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 300,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionOrderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionItemCount: {
    fontSize: 13,
  },
  optionEquipment: {
    fontSize: 14,
    marginBottom: 4,
  },
  optionDetail: {
    fontSize: 13,
    marginBottom: 4,
  },
  optionDate: {
    fontSize: 13,
  },
  dropdownOptionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  proceedButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
