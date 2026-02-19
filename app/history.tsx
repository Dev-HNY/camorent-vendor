/**
 * History Screen
 * Shows order history with filters and search
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { bookingService, VendorBookingListItem } from '../src/services/api/bookingService';
import { scaleWidth, scaleHeight, spacing, fontSize } from '../src/utils/responsive';
import { ScreenHeader } from '../src/components/common/ScreenHeader';

const FilterIcon = ({ color = '#8E0FFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * 1.125} viewBox="0 0 24 27" fill="none">
    <Path
      d="M7.29167 2.92024C6.90489 2.92024 6.53396 3.07389 6.26047 3.34738C5.98698 3.62087 5.83333 3.9918 5.83333 4.37857C5.83333 4.76535 5.98698 5.13628 6.26047 5.40977C6.53396 5.68326 6.90489 5.83691 7.29167 5.83691C7.67844 5.83691 8.04937 5.68326 8.32286 5.40977C8.59635 5.13628 8.75 4.76535 8.75 4.37857C8.75 3.9918 8.59635 3.62087 8.32286 3.34738C8.04937 3.07389 7.67844 2.92024 7.29167 2.92024ZM3.16458 2.92024C3.46588 2.06634 4.02462 1.32691 4.76379 0.803892C5.50296 0.280869 6.38617 0 7.29167 0C8.19717 0 9.08037 0.280869 9.81954 0.803892C10.5587 1.32691 11.1175 2.06634 11.4187 2.92024H21.875C22.2618 2.92024 22.6327 3.07389 22.9062 3.34738C23.1797 3.62087 23.3333 3.9918 23.3333 4.37857C23.3333 4.76535 23.1797 5.13628 22.9062 5.40977C22.6327 5.68326 22.2618 5.83691 21.875 5.83691H11.4187C11.1175 6.69081 10.5587 7.43023 9.81954 7.95326C9.08037 8.47628 8.19717 8.75715 7.29167 8.75715C6.38617 8.75715 5.50296 8.47628 4.76379 7.95326C4.02462 7.43023 3.46588 6.69081 3.16458 5.83691H1.45833C1.07156 5.83691 0.700627 5.68326 0.427136 5.40977C0.153646 5.13628 0 4.76535 0 4.37857C0 3.9918 0.153646 3.62087 0.427136 3.34738C0.700627 3.07389 1.07156 2.92024 1.45833 2.92024H3.16458ZM16.0417 11.6702C15.6549 11.6702 15.284 11.8239 15.0105 12.0974C14.737 12.3709 14.5833 12.7418 14.5833 13.1286C14.5833 13.5153 14.737 13.8863 15.0105 14.1598C15.284 14.4333 15.6549 14.5869 16.0417 14.5869C16.4284 14.5869 16.7994 14.4333 17.0729 14.1598C17.3464 13.8863 17.5 13.5153 17.5 13.1286C17.5 12.7418 17.3464 12.3709 17.0729 12.0974C16.7994 11.8239 16.4284 11.6702 16.0417 11.6702ZM11.9146 11.6702C12.2159 10.8163 12.7746 10.0769 13.5138 9.55389C14.253 9.03087 15.1362 8.75 16.0417 8.75C16.9472 8.75 17.8304 9.03087 18.5695 9.55389C19.3087 10.0769 19.8675 10.8163 20.1688 11.6702H21.875C22.2618 11.6702 22.6327 11.8239 22.9062 12.0974C23.1797 12.3709 23.3333 12.7418 23.3333 13.1286C23.3333 13.5153 23.1797 13.8863 22.9062 14.1598C22.6327 14.4333 22.2618 14.5869 21.875 14.5869H20.1688C19.8675 15.4408 19.3087 16.1802 18.5695 16.7033C17.8304 17.2263 16.9472 17.5071 16.0417 17.5071C15.1362 17.5071 14.253 17.2263 13.5138 16.7033C12.7746 16.1802 12.2159 15.4408 11.9146 14.5869H1.45833C1.07156 14.5869 0.700627 14.4333 0.427136 14.1598C0.153646 13.8863 0 13.5153 0 13.1286C0 12.7418 0.153646 12.3709 0.427136 12.0974C0.700627 11.8239 1.07156 11.6702 1.45833 11.6702H11.9146ZM7.29167 20.4202C6.90489 20.4202 6.53396 20.5739 6.26047 20.8474C5.98698 21.1209 5.83333 21.4918 5.83333 21.8786C5.83333 22.2653 5.98698 22.6363 6.26047 22.9098C6.53396 23.1833 6.90489 23.3369 7.29167 23.3369C7.67844 23.3369 8.04937 23.1833 8.32286 22.9098C8.59635 22.6363 8.75 22.2653 8.75 21.8786C8.75 21.4918 8.59635 21.1209 8.32286 20.8474C8.04937 20.5739 7.67844 20.4202 7.29167 20.4202ZM3.16458 20.4202C3.46588 19.5663 4.02462 18.8269 4.76379 18.3039C5.50296 17.7809 6.38617 17.5 7.29167 17.5C8.19717 17.5 9.08037 17.7809 9.81954 18.3039C10.5587 18.8269 11.1175 19.5663 11.4187 20.4202H21.875C22.2618 20.4202 22.6327 20.5739 22.9062 20.8474C23.1797 21.1209 23.3333 21.4918 23.3333 21.8786C23.3333 22.2653 23.1797 22.6363 22.9062 22.9098C22.6327 23.1833 22.2618 23.3369 21.875 23.3369H11.4187C11.1175 24.1908 10.5587 24.9302 9.81954 25.4533C9.08037 25.9763 8.19717 26.2571 7.29167 26.2571C6.38617 26.2571 5.50296 25.9763 4.76379 25.4533C4.02462 24.9302 3.46588 24.1908 3.16458 23.3369H1.45833C1.07156 23.3369 0.700627 23.1833 0.427136 22.9098C0.153646 22.6363 0 22.2653 0 21.8786C0 21.4918 0.153646 21.1209 0.427136 20.8474C0.700627 20.5739 1.07156 20.4202 1.45833 20.4202H3.16458Z"
      fill={color}
    />
  </Svg>
);

const ChevronRightIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
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

// Animated History Card Component
const AnimatedHistoryCard = ({
  booking, index, onPress, status, equipment, duration,
  theme, t, formatDate, getStatusColor, getStatusBgColor, styles
}: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.orderCard,
            pressed && styles.orderCardPressed,
          ]}
        >
          {/* Header with Order Name and Badges */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text style={styles.orderId} numberOfLines={1}>
                {booking.order_name || 'Untitled'}
              </Text>
              <View style={styles.badgesRow}>
                {/* Role Badge */}
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: booking.userRole === 'owner' ? '#DBEAFE' : '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      { color: booking.userRole === 'owner' ? '#3B82F6' : '#F59E0B' },
                    ]}
                  >
                    {booking.userRole === 'owner' ? t.orders.owner : t.orders.requester}
                  </Text>
                </View>
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBgColor(status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(status) },
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Order Details Section */}
          <View style={styles.detailsSection}>
            {/* Owner/Requester Info based on role */}
            {booking.userRole === 'requester' && booking.owner_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.orders.owner}:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {booking.owner_company ? `${booking.owner_company} (${booking.owner_name})` : booking.owner_name}
                </Text>
              </View>
            )}
            {booking.userRole === 'owner' && booking.buyer_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.orders.requester}:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {booking.buyer_company ? `${booking.buyer_company} (${booking.buyer_name})` : booking.buyer_name}
                </Text>
              </View>
            )}

            {/* Equipment Summary */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.settlement.equipment}:</Text>
              <Text style={styles.detailValue}>{equipment}</Text>
            </View>

            {/* Date Information */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.settlement.rentalPeriod}:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {booking.rental_start_date && booking.rental_end_date
                  ? `${formatDate(booking.rental_start_date)} → ${formatDate(booking.rental_end_date)} (${duration}d)`
                  : t.orders.noDatesSet}
              </Text>
            </View>

            {/* Payment Status */}
            {booking.payment_status && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.settlement.paymentStatus}:</Text>
                <View style={[
                  styles.paymentBadge,
                  { backgroundColor: booking.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7' }
                ]}>
                  <Text style={[
                    styles.paymentBadgeText,
                    { color: booking.payment_status === 'paid' ? '#22C55E' : '#F59E0B' }
                  ]}>
                    {booking.payment_status === 'paid' ? t.settlement.paid : t.settlement.pending}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Modern Glassmorphism Footer with Amount */}
          <View style={styles.orderFooter}>
            <View style={[styles.footerGlass, { backgroundColor: theme.colors.primary + '10' }]}>
              <View style={styles.footerContent}>
                <View>
                  <Text style={styles.amountLabel}>{t.settlement.totalAmount}</Text>
                  <Text style={styles.amountText}>
                    ₹{booking.total_amount.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.chevronCircle, { backgroundColor: theme.colors.primary }]}>
                  <ChevronRightIcon
                    color="#FFFFFF"
                    size={scaleWidth(18)}
                  />
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

export default function HistoryScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const pageTitle = (params.title as string) || t.orders.history;

  type FilterType = 'All' | 'Completed' | 'Vendor Rejected' | 'Camorent Rejected';
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<VendorBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  // Map backend status to display status
  const getDisplayStatus = (status: string): string => {
    switch (status) {
      case 'completed':
        return t.orders.completed;
      case 'vendor_rejection':
        return t.orders.vendorRejected;
      case 'camorent_rejection':
        return t.orders.camorentRejected;
      default:
        return t.orders.completed;
    }
  };

  // Fetch history bookings (only completed/rejected) - both as buyer and as owner
  const fetchHistoryBookings = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Fetch bookings where current vendor is the buyer (requester)
      const buyerResponse = await bookingService.getBookings({
        role: 'buyer',
        page: pageNum,
        limit: PAGE_SIZE,
      });

      // Fetch bookings where current vendor is the owner
      const ownerResponse = await bookingService.getBookings({
        role: 'owner',
        page: pageNum,
        limit: PAGE_SIZE,
      });

      // Filter buyer bookings to only show completed/rejected and add role
      const buyerHistoryBookings = buyerResponse.data
        .filter(booking =>
          booking.status === 'completed' ||
          booking.status === 'vendor_rejection' ||
          booking.status === 'camorent_rejection'
        )
        .map(booking => ({ ...booking, userRole: 'requester' as const }));

      // Filter owner bookings to only show completed/rejected and add role
      const ownerHistoryBookings = ownerResponse.data
        .filter(booking =>
          booking.status === 'completed' ||
          booking.status === 'vendor_rejection' ||
          booking.status === 'camorent_rejection'
        )
        .map(booking => ({ ...booking, userRole: 'owner' as const }));

      // Combine and sort by created_at (most recent first)
      const allHistoryBookings = [...buyerHistoryBookings, ...ownerHistoryBookings]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (append) {
        setBookings(prev => [...prev, ...allHistoryBookings]);
      } else {
        setBookings(allHistoryBookings);
      }

      // Check if there are more items to load
      setHasMore(buyerResponse.data.length === PAGE_SIZE || ownerResponse.data.length === PAGE_SIZE);
    } catch (error) {
      // Error fetching history bookings - will show empty state
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load bookings on mount
  useEffect(() => {
    fetchHistoryBookings();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchHistoryBookings(1, false);
    setRefreshing(false);
  }, []);

  // Load more items when user scrolls to bottom
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistoryBookings(nextPage, true);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === t.orders.completed) return '#22C55E'; // Green for completed
    if (status === t.orders.vendorRejected || status === t.orders.camorentRejected) {
      return '#DC2626'; // Dark red for rejected
    }
    return theme.colors.text.secondary;
  };

  const getStatusBgColor = (status: string) => {
    if (status === t.orders.completed) return '#DCFCE7'; // Light green
    if (status === t.orders.vendorRejected || status === t.orders.camorentRejected) {
      return '#FEE2E2'; // Light red
    }
    return theme.colors.background.secondary;
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${month} ${day}`;
  };

  const getEquipmentSummary = (skuList: string[]): string => {
    if (skuList.length === 0) return t.orders.noItems;
    if (skuList.length === 1) return t.orders.oneItem;
    return `${skuList.length} ${t.orders.items}`;
  };

  const filteredBookings = bookings.filter((booking) => {
    const displayStatus = getDisplayStatus(booking.status);

    // Filter by status
    const matchesFilter =
      selectedFilter === 'All' ||
      displayStatus === selectedFilter;

    // Filter by search query
    const matchesSearch =
      searchQuery === '' ||
      booking.order_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vendor_booking_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleViewOrder = (booking: VendorBookingListItem) => {
    router.push({
      pathname: '/order-detail',
      params: {
        bookingId: booking.vendor_booking_id,
        orderName: booking.order_name || 'Untitled Order',
        fromDate: booking.rental_start_date || new Date().toISOString(),
        tillDate: booking.rental_end_date || new Date().toISOString(),
        isHistory: 'true',
      },
    });
  };

  const filterLabels: Record<FilterType, string> = {
    'All': t.orders.all,
    'Completed': t.orders.completed,
    'Vendor Rejected': t.orders.vendorRejected,
    'Camorent Rejected': t.orders.camorentRejected,
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader
        title={pageTitle}
        showBackButton={true}
        rightElement={
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpIcon}>?</Text>
          </TouchableOpacity>
        }
      />

      {/* Search Bar and Filter Button */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t.orders.searchHistory}
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <FilterIcon color={theme.colors.primary} size={20} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        >
          {(['All', 'Completed', 'Vendor Rejected', 'Camorent Rejected'] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filterLabels[filter]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{t.orders.loadingHistory}</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking, index) => {
            const status = getDisplayStatus(booking.status);
            const equipment = getEquipmentSummary(booking.sku_list);
            // Use total_rental_days from backend (already includes both start and end dates)
            const duration = booking.total_rental_days || 0;

            return (
              <AnimatedHistoryCard
                key={`${booking.vendor_booking_id}-${index}`}
                booking={booking}
                index={index}
                onPress={() => handleViewOrder(booking)}
                status={status}
                equipment={equipment}
                duration={duration}
                theme={theme}
                t={t}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusBgColor={getStatusBgColor}
                styles={styles}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>{t.orders.noHistory}</Text>
            <Text style={styles.emptyStateText}>
              {t.orders.completedBookingsAppearHere}
            </Text>
          </View>
        )}

        {/* Load More Indicator */}
        {loadingMore && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadMoreText}>{t.products.loadingMore}</Text>
          </View>
        )}

        {/* Dynamic bottom spacer for navigation bar */}
        <View style={{ height: 40 + insets.bottom }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  helpButton: {
    width: scaleWidth(30),
    height: scaleWidth(30),
    borderRadius: scaleWidth(18),
    borderWidth: 2,
    borderColor: theme.colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1.5,
    borderColor: theme.colors.border.light,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
  },
  searchIcon: {
    fontSize: fontSize.xl,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: theme.colors.text.primary,
    padding: 0,
  },
  filterButton: {
    width: scaleWidth(52),
    height: scaleWidth(52),
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1.5,
    borderColor: theme.colors.border.light,
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabsContainer: {
    marginBottom: spacing.md,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: scaleWidth(18),
    paddingVertical: scaleHeight(6),
    borderRadius: scaleWidth(8),
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: scaleHeight(100),
  },
  orderCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: scaleWidth(20),
    padding: spacing.md + 4,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  orderCardPressed: {
    backgroundColor: theme.colors.background.secondary,
  },
  orderHeader: {
    flexDirection: 'column',
    marginBottom: spacing.md,
  },
  orderHeaderLeft: {
    flexDirection: 'column',
    gap: spacing.xs,
    flex: 1,
  },
  orderId: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: scaleWidth(12),
  },
  roleBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: scaleWidth(12),
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  detailsSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    width: scaleWidth(85),
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: theme.colors.text.primary,
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  orderFooter: {
    marginTop: spacing.sm,
  },
  footerGlass: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md + 2,
    borderRadius: scaleWidth(14),
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  amountText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  chevronCircle: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleHeight(60),
  },
  loadingText: {
    fontSize: fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: spacing.sm + 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleHeight(60),
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg - 4,
    gap: spacing.sm,
  },
  loadMoreText: {
    fontSize: fontSize.md,
    color: theme.colors.text.secondary,
  },
  bottomSpacer: {
    height: spacing.lg - 4,
  },
});
