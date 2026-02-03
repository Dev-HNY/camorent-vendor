/**
 * Active Jobs Screen - Modern Design
 * Shows active pickup requests and jobs with modern UI
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { bookingService, VendorBookingListItem } from '../../src/services/api/bookingService';
import { Skeleton } from '../../src/components';
import { logger } from '../../src/utils/logger';

const TAG = 'ActiveJobsScreen';

// Modern Icons
const SearchIcon = ({ size = 20, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ size = 16, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PackageIcon = ({ size = 16, color }: { size?: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.79 0l-8-4a2 2 0 01-1.1-1.8V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z" stroke={color} strokeWidth="2" />
    <Path d="M2.32 6.16L12 11l9.68-4.84M12 22.76V11" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Countdown utility
const getTimeRemaining = (targetDate: string, t: any): string => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const distance = target - now;

  if (distance < 0) return t.orders.overdue;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Status configurations - NOTE: Labels are now handled via translations in component
const getStatusConfig = (isDark: boolean) => ({
  pending_request: {
    colors: ['#F59E0B', '#D97706'] as [string, string],
    textColor: isDark ? '#FBBF24' : '#92400E',
    bgColor: isDark ? '#78350F' : '#FEF3C7',
  },
  pickup_due: {
    colors: ['#8B5CF6', '#7C3AED'] as [string, string],
    textColor: isDark ? '#A78BFA' : '#5B21B6',
    bgColor: isDark ? '#4C1D95' : '#EDE9FE',
  },
  pickup_confirmed: {
    colors: ['#3B82F6', '#2563EB'] as [string, string],
    textColor: isDark ? '#60A5FA' : '#1E40AF',
    bgColor: isDark ? '#1E3A8A' : '#DBEAFE',
  },
  return_due: {
    colors: ['#EF4444', '#DC2626'] as [string, string],
    textColor: isDark ? '#F87171' : '#991B1B',
    bgColor: isDark ? '#7F1D1D' : '#FEE2E2',
  },
  vendor_rejection: {
    colors: ['#EF4444', '#DC2626'] as [string, string],
    textColor: isDark ? '#F87171' : '#991B1B',
    bgColor: isDark ? '#7F1D1D' : '#FEE2E2',
  },
});

// Animated Job Card Component - Memoized for performance
const JobCard = memo(({
  booking,
  index,
  onPress,
  theme,
  themeMode,
  t,
}: {
  booking: VendorBookingListItem;
  index: number;
  onPress: () => void;
  theme: any;
  themeMode: 'light' | 'dark';
  t: any;
}) => {
  const scale = useSharedValue(1);
  const statusConfig = getStatusConfig(themeMode === 'dark');
  const config = statusConfig[booking.status as keyof ReturnType<typeof getStatusConfig>] || statusConfig.pending_request;

  // Get status label from translations
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_request': return t.orders.pendingApproval;
      case 'pickup_due': return t.orders.readyForPickup;
      case 'pickup_confirmed': return t.orders.inProgress;
      case 'return_due': return t.orders.returnPending;
      case 'vendor_rejection': return t.status.rejected;
      default: return status;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return t.orders.notAvailable;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t.orders.notAvailable;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <View>
      <Animated.View entering={FadeInUp.delay(index * 60).duration(400)}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            onPress={onPress}
            onPressIn={() => { scale.value = withSpring(0.98); }}
            onPressOut={() => { scale.value = withSpring(1); }}
            activeOpacity={1}
            style={[styles.jobCard, { backgroundColor: theme.colors.background.primary }]}
          >
          {/* Header */}
          <View style={styles.jobHeader}>
            <View style={styles.jobTitleContainer}>
              <Text style={[styles.jobTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                {booking.order_name || t.orders.untitledOrder}
              </Text>
              <View style={[styles.jobIdBadge, { backgroundColor: theme.colors.background.tertiary }]}>
                <Text style={[styles.jobIdText, { color: theme.colors.text.tertiary }]}>
                  ID: {booking.vendor_booking_id.substring(0, 8)}...
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
              <Text style={[styles.statusText, { color: config.textColor }]}>
                {getStatusLabel(booking.status)}
              </Text>
            </View>
          </View>

          {/* Return Countdown Badge - Show only for return_due status */}
          {booking.status === 'return_due' && booking.rental_end_date && (
            <View style={[styles.countdownBanner, { backgroundColor: themeMode === 'dark' ? '#7F1D1D' : '#FEE2E2' }]}>
              <ClockIcon size={16} color={themeMode === 'dark' ? '#F87171' : '#DC2626'} />
              <Text style={[styles.countdownText, { color: themeMode === 'dark' ? '#FCA5A5' : '#991B1B' }]}>
                {t.home.dueIn}: <Text style={[styles.countdownTime, { color: themeMode === 'dark' ? '#F87171' : '#DC2626' }]}>{getTimeRemaining(booking.rental_end_date, t)}</Text>
              </Text>
            </View>
          )}

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <PackageIcon size={14} color={theme.colors.text.tertiary} />
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                {booking.sku_list.length === 0 ? t.orders.noItems :
                 booking.sku_list.length === 1 ? t.orders.oneItem :
                 `${booking.sku_list.length} ${t.orders.items}`}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <ClockIcon size={14} color={theme.colors.text.tertiary} />
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                {booking.rental_start_date && booking.rental_end_date
                  ? `${formatDate(booking.rental_start_date)} - ${formatDate(booking.rental_end_date)}`
                  : t.orders.noDatesSet}
              </Text>
            </View>
          </View>

          {/* Owner Info */}
          <View style={[styles.ownerRow, { borderTopColor: theme.colors.border.light }]}>
            <View style={[styles.ownerAvatar, { backgroundColor: theme.colors.background.tertiary }]}>
              <Text style={[styles.ownerInitial, { color: theme.colors.primary }]}>
                {(booking.owner_name || 'O')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.ownerInfo}>
              <Text style={[styles.ownerLabel, { color: theme.colors.text.tertiary }]}>{t.orders.owner}</Text>
              <Text style={[styles.ownerName, { color: theme.colors.text.primary }]} numberOfLines={1}>
                {booking.owner_company || booking.owner_name}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={[styles.jobFooter, { borderTopColor: theme.colors.border.light }]}>
            <View>
              <Text style={[styles.priceLabel, { color: theme.colors.text.tertiary }]}>{t.orders.totalAmount}</Text>
              <Text style={[styles.priceValue, { color: theme.colors.text.primary }]}>
                ₹{(booking.total_amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <LinearGradient
              colors={config.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.viewButton}
            >
              <Text style={styles.viewButtonText}>{t.settlement.viewDetails}</Text>
              <ChevronRightIcon size={16} color={theme.colors.text.inverse} />
            </LinearGradient>
          </View>
        </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
});

// Status Filter Chip - Memoized for performance
const FilterChip = memo(({
  label,
  count,
  color,
  isActive,
  onPress,
  theme,
}: {
  label: string;
  count: number;
  color: string;
  isActive: boolean;
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.filterChip,
      { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light },
      isActive && { backgroundColor: color + '20', borderColor: color },
    ]}
    accessible={true}
    accessibilityLabel={`${label} filter, ${count} items`}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
  >
    <View style={[styles.filterDot, { backgroundColor: color }]} />
    <Text style={[styles.filterLabel, { color: theme.colors.text.secondary }, isActive && { color }]}>{label}</Text>
    <View style={[styles.filterCount, { backgroundColor: isActive ? color : theme.colors.background.tertiary }]}>
      <Text style={[styles.filterCountText, { color: isActive ? theme.colors.text.inverse : theme.colors.text.tertiary }]}>
        {count}
      </Text>
    </View>
  </TouchableOpacity>
));

export default function ActiveJobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<VendorBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const fetchActiveBookings = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await bookingService.getBookings({
        exclude_completed: true,
        role: 'buyer',
        page: pageNum,
        limit: PAGE_SIZE,
      });

      const newBookings = response.data;

      if (append) {
        setBookings(prev => [...prev, ...newBookings]);
      } else {
        setBookings(newBookings);
      }

      setHasMore(newBookings.length === PAGE_SIZE);
    } catch (error) {
      logger.error(TAG, 'Error fetching active bookings:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActiveBookings();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchActiveBookings(1, false);
    setRefreshing(false);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActiveBookings(nextPage, true);
    }
  };

  const handleViewJob = (booking: VendorBookingListItem) => {
    router.push({
      pathname: '/order-detail',
      params: {
        bookingId: booking.vendor_booking_id,
        orderName: booking.order_name || t.orders.untitledOrder,
        fromDate: booking.rental_start_date || new Date().toISOString(),
        tillDate: booking.rental_end_date || new Date().toISOString(),
        isHistory: 'false',
      },
    });
  };

  // Count by status
  const statusCounts = {
    pickup_due: bookings.filter(b => b.status === 'pickup_due').length,
    return_due: bookings.filter(b => b.status === 'return_due').length,
    pending_request: bookings.filter(b => b.status === 'pending_request').length,
    pickup_confirmed: bookings.filter(b => b.status === 'pickup_confirmed').length,
    vendor_rejection: bookings.filter(b => b.status === 'vendor_rejection').length,
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchQuery === '' ||
      booking.order_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vendor_booking_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = !activeFilter || booking.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>{t.orders.activeJobs}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
          {bookings.length} {t.orders.active} {bookings.length === 1 ? t.orders.order : t.orders.orders}
        </Text>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.searchContainer, { backgroundColor: theme.colors.background.secondary }]}>
        <SearchIcon size={20} color={theme.colors.text.tertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder={t.orders.searchActiveJobs}
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>

      {/* Status Filters */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {statusCounts.pickup_due > 0 && (
            <FilterChip
              label={t.home.pickupDue}
              count={statusCounts.pickup_due}
              color="#8B5CF6"
              isActive={activeFilter === 'pickup_due'}
              onPress={() => setActiveFilter(activeFilter === 'pickup_due' ? null : 'pickup_due')}
              theme={theme}
            />
          )}
          {statusCounts.return_due > 0 && (
            <FilterChip
              label={t.home.returnDue}
              count={statusCounts.return_due}
              color="#EF4444"
              isActive={activeFilter === 'return_due'}
              onPress={() => setActiveFilter(activeFilter === 'return_due' ? null : 'return_due')}
              theme={theme}
            />
          )}
          {statusCounts.pending_request > 0 && (
            <FilterChip
              label={t.orders.pending}
              count={statusCounts.pending_request}
              color="#F59E0B"
              isActive={activeFilter === 'pending_request'}
              onPress={() => setActiveFilter(activeFilter === 'pending_request' ? null : 'pending_request')}
              theme={theme}
            />
          )}
          {statusCounts.pickup_confirmed > 0 && (
            <FilterChip
              label={t.orders.inProgress}
              count={statusCounts.pickup_confirmed}
              color="#3B82F6"
              isActive={activeFilter === 'pickup_confirmed'}
              onPress={() => setActiveFilter(activeFilter === 'pickup_confirmed' ? null : 'pickup_confirmed')}
              theme={theme}
            />
          )}
          {statusCounts.vendor_rejection > 0 && (
            <FilterChip
              label={t.status.rejected}
              count={statusCounts.vendor_rejection}
              color="#EF4444"
              isActive={activeFilter === 'vendor_rejection'}
              onPress={() => setActiveFilter(activeFilter === 'vendor_rejection' ? null : 'vendor_rejection')}
              theme={theme}
            />
          )}
        </ScrollView>
      </Animated.View>

      {/* Jobs List - Using FlatList for better performance */}
      {loading && !refreshing ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Job Card Skeleton */}
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.jobCard, { backgroundColor: theme.colors.background.primary }]}>
              {/* Header Skeleton */}
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleContainer}>
                  <Skeleton width="70%" height={20} borderRadius={6} style={{ marginBottom: 6 }} />
                  <Skeleton width={100} height={18} borderRadius={6} />
                </View>
                <Skeleton width={90} height={28} borderRadius={12} />
              </View>

              {/* Info Grid Skeleton */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Skeleton width={14} height={14} borderRadius={4} />
                  <Skeleton width={60} height={16} borderRadius={4} />
                </View>
                <View style={styles.infoItem}>
                  <Skeleton width={14} height={14} borderRadius={4} />
                  <Skeleton width={110} height={16} borderRadius={4} />
                </View>
              </View>

              {/* Owner Row Skeleton */}
              <View style={[styles.ownerRow, { borderTopColor: theme.colors.border.light }]}>
                <Skeleton width={36} height={36} borderRadius={12} style={{ marginRight: 12 }} />
                <View style={styles.ownerInfo}>
                  <Skeleton width={50} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width={120} height={16} borderRadius={4} />
                </View>
              </View>

              {/* Footer Skeleton */}
              <View style={[styles.jobFooter, { borderTopColor: theme.colors.border.light }]}>
                <View>
                  <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width={90} height={24} borderRadius={6} />
                </View>
                <Skeleton width={120} height={40} borderRadius={12} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item, index) => `${item.vendor_booking_id}-${index}`}
          renderItem={({ item, index }) => (
            <JobCard
              booking={item}
              index={index}
              onPress={() => handleViewJob(item)}
              theme={theme}
              themeMode={themeMode}
              t={t}
            />
          )}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            filteredBookings.length === 0 && styles.emptyContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.background.tertiary }]}>
                <PackageIcon size={48} color={theme.colors.text.tertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>{t.orders.noActiveJobs}</Text>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                {t.orders.createPickupRequest}
              </Text>
            </View>
          }
          ListFooterComponent={
            <>
              {loadingMore && (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              )}
              <View style={styles.bottomSpacer} />
            </>
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          getItemLayout={(_, index) => ({
            length: 220,
            offset: 220 * index,
            index,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
    padding: 0,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  jobCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  jobIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  jobIdText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '500',
  },
  countdownTime: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    marginBottom: 14,
  },
  ownerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerInitial: {
    fontSize: 15,
    fontWeight: '700',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bottomSpacer: {
    height: 120, // Extra space for floating tab bar + Android navigation bar
  },
});
