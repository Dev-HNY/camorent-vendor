/**
 * Requests Screen
 * Shows incoming booking requests where current vendor is the equipment owner
 * Modern UI with enhanced animations and design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
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

const TAG = 'RequestsScreen';

// Modern SVG Icons
const SearchIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 21L16.65 16.65"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PackageIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 9.4L7.5 4.21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 16V8C20.9996 7.6493 20.9071 7.30483 20.7315 7.00017C20.556 6.69552 20.3037 6.44167 20 6.264L13 2.264C12.696 2.08619 12.3511 1.99268 12 1.99268C11.6489 1.99268 11.304 2.08619 11 2.264L4 6.264C3.69626 6.44167 3.44398 6.69552 3.26846 7.00017C3.09294 7.30483 3.00036 7.6493 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9998C3.44398 17.3045 3.69626 17.5583 4 17.736L11 21.736C11.304 21.9138 11.6489 22.0073 12 22.0073C12.3511 22.0073 12.696 21.9138 13 21.736L20 17.736C20.3037 17.5583 20.556 17.3045 20.7315 16.9998C20.9071 16.6952 20.9996 16.3507 21 16Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M3.27002 6.96L12 12.01L20.73 6.96" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color = '#000', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RefreshIcon = ({ color = '#000', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InboxIcon = ({ color = '#000', size = 56 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 12H16L14 15H10L8 12H2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type FilterType = 'Pending Request' | 'Pickup Due' | 'Return Pending' | 'Rejected' | 'Payment Pending';

// Status configuration for consistent styling
const statusConfig: Record<string, { color: string; bgColor: string; gradientColors: [string, string] }> = {
  'Pending Request': {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    gradientColors: ['#F59E0B', '#D97706'],
  },
  'Pickup Due': {
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    gradientColors: ['#8B5CF6', '#7C3AED'],
  },
  'Pickup Confirmed': {
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    gradientColors: ['#3B82F6', '#2563EB'],
  },
  'Return Due': {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    gradientColors: ['#EF4444', '#DC2626'],
  },
  'Completed': {
    color: '#22C55E',
    bgColor: '#DCFCE7',
    gradientColors: ['#22C55E', '#16A34A'],
  },
  'Rejected': {
    color: '#DC2626',
    bgColor: '#FEE2E2',
    gradientColors: ['#DC2626', '#B91C1C'],
  },
  'Payment Pending': {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    gradientColors: ['#F59E0B', '#D97706'],
  },
};

// Modern Filter Chip Component
const FilterChip = ({
  label,
  count,
  isSelected,
  onPress,
  theme,
  filterKey,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
  filterKey?: string;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const statusInfo = statusConfig[filterKey || label] || { color: theme.colors.primary, bgColor: theme.colors.background.secondary };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {isSelected ? (
          <LinearGradient
            colors={statusInfo.gradientColors || [theme.colors.primary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.filterChipSelected}
          >
            <Text style={styles.filterChipTextSelected}>{label}</Text>
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{count}</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.filterChip, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={[styles.filterDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.filterChipText, { color: theme.colors.text.secondary }]}>{label}</Text>
            <Text style={[styles.filterChipCount, { color: theme.colors.text.tertiary }]}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modern Request Card Component
const RequestCard = ({
  request,
  index,
  onPress,
  displayStatus,
  formatDate,
  theme,
  t,
  router,
}: {
  request: VendorBookingListItem;
  index: number;
  onPress: () => void;
  displayStatus: string;
  formatDate: (date: string | undefined | null) => string;
  theme: any;
  t: any;
  router: any;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const statusInfo = statusConfig[displayStatus] || {
    color: theme.colors.text.secondary,
    bgColor: theme.colors.background.secondary,
    gradientColors: [theme.colors.primary, theme.colors.primary] as [string, string],
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(400)}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.requestCard, { backgroundColor: theme.colors.background.primary }]}
        >
          {/* Status Accent Bar */}
          <View style={[styles.cardAccent, { backgroundColor: statusInfo.color }]} />

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={[styles.orderName, { color: theme.colors.text.primary }]} numberOfLines={1}>
                  {request.order_name}
                </Text>
                <Text style={[styles.orderId, { color: theme.colors.text.tertiary }]}>
                  ID: {request.vendor_booking_id.substring(0, 8)}...
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{displayStatus}</Text>
              </View>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              {/* Requester */}
              {request.buyer_name && (
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <UserIcon color={theme.colors.primary} size={14} />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.tertiary }]}>{t.orders.requester}</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]} numberOfLines={1}>
                      {request.buyer_company || request.buyer_name}
                    </Text>
                  </View>
                </View>
              )}

              {/* Rental Period */}
              <View style={styles.detailItem}>
                <View style={[styles.detailIconContainer, { backgroundColor: '#8B5CF6' + '15' }]}>
                  <CalendarIcon color="#8B5CF6" size={14} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.tertiary }]}>{t.settlement.rentalPeriod}</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text.primary }]} numberOfLines={1}>
                    {formatDate(request.rental_start_date)} - {formatDate(request.rental_end_date)}
                  </Text>
                </View>
              </View>

              {/* Duration */}
              <View style={styles.detailItem}>
                <View style={[styles.detailIconContainer, { backgroundColor: '#F59E0B' + '15' }]}>
                  <ClockIcon color="#F59E0B" size={14} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.tertiary }]}>{t.orders.duration}</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                    {request.total_rental_days} {request.total_rental_days !== 1 ? t.orders.days : t.orders.day}
                  </Text>
                </View>
              </View>

              {/* Equipment */}
              {request.sku_list && request.sku_list.length > 0 && (
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconContainer, { backgroundColor: '#22C55E' + '15' }]}>
                    <PackageIcon color="#22C55E" size={14} />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.tertiary }]}>{t.settlement.equipment}</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                      {request.sku_list.length} {request.sku_list.length !== 1 ? t.orders.items : t.orders.oneItem}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={[styles.amountLabel, { color: theme.colors.text.tertiary }]}>{t.status.total_amount}</Text>
                <Text style={[styles.amountValue, { color: theme.colors.text.primary }]}>
                  ₹{request.total_amount ? request.total_amount.toLocaleString('en-IN') : '0'}
                </Text>
              </View>

              {request.status === 'vendor_rejection' ? (
                <TouchableOpacity
                  onPress={() => {
                    // Navigate to owner selection to recreate the order
                    router.push('/owner-selection');
                  }}
                  style={[styles.recreateButton, { backgroundColor: theme.colors.primary }]}
                >
                  <RefreshIcon color="#FFFFFF" size={16} />
                  <Text style={styles.recreateButtonText}>{t.orders.recreateOrder}</Text>
                </TouchableOpacity>
              ) : (
                <LinearGradient
                  colors={statusInfo.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>
                    {request.status === 'pending_request' ? t.status.respond : t.orders.view}
                  </Text>
                  <ChevronRightIcon color="#FFFFFF" size={16} />
                </LinearGradient>
              )}
            </View>

            {/* Payment Status Badge */}
            {request.payment_status && (
              <View style={styles.paymentBadgeContainer}>
                <View
                  style={[
                    styles.paymentBadge,
                    {
                      backgroundColor: request.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7',
                    },
                  ]}
                >
                  <View style={styles.paymentBadgeContent}>
                    {request.payment_status === 'paid' ? (
                      <CheckIcon color="#22C55E" size={14} />
                    ) : (
                      <ClockIcon color="#F59E0B" size={14} />
                    )}
                    <Text
                      style={[
                        styles.paymentBadgeText,
                        { color: request.payment_status === 'paid' ? '#22C55E' : '#F59E0B' },
                      ]}
                    >
                      {request.payment_status === 'paid' ? t.settlement.paid : t.settlement.pending}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

// Empty State Component
const EmptyState = ({ searchQuery, theme, t }: { searchQuery: string; theme: any; t: any }) => (
  <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.emptyState}>
    <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
      <InboxIcon color={theme.colors.primary} size={56} />
    </View>
    <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>{t.requestsPage.noRequestsFound}</Text>
    <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
      {searchQuery ? t.requestsPage.tryDifferentSearch : t.requestsPage.noIncomingRequests}
    </Text>
  </Animated.View>
);

export default function RequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<VendorBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Pending Request');

  const PAGE_SIZE = 10;

  // Fetch incoming requests (where current vendor is the owner)
  const fetchIncomingRequests = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await bookingService.getBookings({
        role: 'owner',
        page: pageNum,
        limit: PAGE_SIZE,
        exclude_completed: false,
      });

      // Filter out completed orders with paid status (show only non-completed + completed with pending payment)
      const filteredRequests = response.data.filter((request: any) => {
        // If order is completed AND payment is NOT pending, exclude it (goes to history)
        if (request.status === 'completed' && request.payment_status !== 'pending') {
          return false;
        }
        // Include all other orders (non-completed + completed with pending payment)
        return true;
      });

      if (append) {
        setRequests((prev) => [...prev, ...filteredRequests]);
      } else {
        setRequests(filteredRequests);
      }

      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      logger.error(TAG, 'Error fetching incoming requests:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load requests on mount
  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  // Auto-select first filter with count > 0
  useEffect(() => {
    if (requests.length > 0) {
      const filters: FilterType[] = ['Pending Request', 'Pickup Due', 'Return Pending', 'Rejected', 'Payment Pending'];
      const counts: Record<FilterType, number> = {
        'Pending Request': requests.filter((r) => r.status === 'pending_request').length,
        'Pickup Due': requests.filter((r) => r.status === 'pickup_due').length,
        'Return Pending': requests.filter((r) => r.status === 'return_due').length,
        Rejected: requests.filter((r) => r.status === 'vendor_rejection').length,
        'Payment Pending': requests.filter((r) => r.status === 'completed' && r.payment_status === 'pending').length,
      };

      const firstNonZeroFilter = filters.find((filter) => counts[filter] > 0);
      if (firstNonZeroFilter) {
        setSelectedFilter(firstNonZeroFilter);
      }
    }
  }, [requests]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchIncomingRequests();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchIncomingRequests(1, false);
    setRefreshing(false);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchIncomingRequests(nextPage, true);
    }
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDisplayStatus = (status: string): string => {
    if (status === 'pending_request') return t.status.pending_request;
    if (status === 'pickup_due') return t.status.pickup_due;
    if (status === 'pickup_confirmed') return t.status.pickup_confirmed;
    if (status === 'return_due') return t.status.return_due;
    if (status === 'completed') return t.status.completed;
    if (status === 'vendor_rejection') return t.status.rejected;
    if (status === 'camorent_rejection') return t.status.rejected;
    return status;
  };

  const getFilterLabel = (filter: FilterType): string => {
    if (filter === 'Pending Request') return t.status.pending_request;
    if (filter === 'Pickup Due') return t.status.pickup_due;
    if (filter === 'Return Pending') return t.status.return_pending;
    if (filter === 'Rejected') return t.status.rejected;
    if (filter === 'Payment Pending') return t.status.payment_pending;
    return filter;
  };

  const getFilterCounts = () => ({
    'Pending Request': requests.filter((r) => r.status === 'pending_request').length,
    'Pickup Due': requests.filter((r) => r.status === 'pickup_due').length,
    'Return Pending': requests.filter((r) => r.status === 'return_due').length,
    Rejected: requests.filter((r) => r.status === 'vendor_rejection').length,
    'Payment Pending': requests.filter((r) => r.status === 'completed' && r.payment_status === 'pending').length,
  });

  const filterCounts = getFilterCounts();

  const filteredRequests = requests.filter((request) => {
    if (searchQuery !== '') {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        request.order_name.toLowerCase().includes(query) ||
        request.vendor_booking_id.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (selectedFilter === 'Pending Request') return request.status === 'pending_request';
    if (selectedFilter === 'Pickup Due') return request.status === 'pickup_due';
    if (selectedFilter === 'Return Pending') return request.status === 'return_due';
    if (selectedFilter === 'Rejected') return request.status === 'vendor_rejection';
    if (selectedFilter === 'Payment Pending') return request.status === 'completed' && request.payment_status === 'pending';

    return true;
  });

  const handleViewRequest = (bookingId: string, status: string) => {
    router.push({
      pathname: '/request-detail',
      params: {
        bookingId,
        isHistory: status === 'completed' ? 'true' : 'false',
      },
    });
  };

  const availableFilters = (['Pending Request', 'Pickup Due', 'Return Pending', 'Payment Pending', 'Rejected'] as FilterType[]).filter(
    (filter) => filterCounts[filter] > 0
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>{t.requestsPage.title}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
            {t.requestsPage.subtitle}
          </Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.headerBadgeText, { color: theme.colors.primary }]}>{requests.length}</Text>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <SearchIcon color={theme.colors.text.tertiary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder={t.requestsPage.searchPlaceholder}
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      {/* Filter Chips */}
      {availableFilters.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {availableFilters.map((filter) => (
              <FilterChip
                key={filter}
                label={getFilterLabel(filter)}
                filterKey={filter}
                count={filterCounts[filter]}
                isSelected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
                theme={theme}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Loading State */}
      {loading && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.resultsCount, { color: theme.colors.text.tertiary }]}>Loading...</Text>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.requestCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={styles.cardContent}>
                {/* Header Skeleton */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Skeleton width="75%" height={20} borderRadius={6} style={{ marginBottom: 6 }} />
                    <Skeleton width={110} height={16} borderRadius={4} />
                  </View>
                  <Skeleton width={100} height={28} borderRadius={14} />
                </View>

                {/* Details Grid Skeleton */}
                <View style={styles.detailsGrid}>
                  {[1, 2].map((j) => (
                    <View key={j} style={styles.detailItem}>
                      <Skeleton width={32} height={32} borderRadius={10} />
                      <View style={styles.detailTextContainer}>
                        <Skeleton width="50%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                        <Skeleton width="75%" height={16} borderRadius={4} />
                      </View>
                    </View>
                  ))}
                </View>

                {/* Footer Skeleton */}
                <View style={styles.cardFooter}>
                  <View>
                    <Skeleton width={80} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                    <Skeleton width={100} height={24} borderRadius={6} />
                  </View>
                  <Skeleton width={100} height={36} borderRadius={12} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Requests List */}
      {!loading && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
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
          {/* Results Count */}
          <Text style={[styles.resultsCount, { color: theme.colors.text.tertiary }]}>
            {filteredRequests.length} {filteredRequests.length !== 1 ? t.requestsPage.requestsPlural : t.requestsPage.request}
          </Text>

          {filteredRequests.length === 0 ? (
            <EmptyState searchQuery={searchQuery} theme={theme} t={t} />
          ) : (
            filteredRequests.map((request, index) => (
              <RequestCard
                key={request.vendor_booking_id}
                request={request}
                index={index}
                onPress={() => handleViewRequest(request.vendor_booking_id, request.status)}
                displayStatus={getDisplayStatus(request.status)}
                formatDate={formatDate}
                theme={theme}
                t={t}
                router={router}
              />
            ))
          )}

          {/* Load More Indicator */}
          {loadingMore && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadMoreText, { color: theme.colors.text.secondary }]}>{t.requestsPage.loadingMore}</Text>
            </View>
          )}

          {/* Bottom Padding for Tab Bar */}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  headerBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  filterChipSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterChipCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardAccent: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsGrid: {
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  recreateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentBadgeContainer: {
    marginTop: 12,
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadMoreText: {
    fontSize: 14,
  },
});
