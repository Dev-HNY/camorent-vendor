/**
 * Vendor Home Dashboard - Modern Design
 * Clean, elegant dashboard with smooth animations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useUserStore } from '../../src/store/userStore';
import { useOrderStore } from '../../src/store/orderStore';
import { CreateOrderNameModal, Skeleton } from '../../src/components';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { useNotification } from '../../src/context/NotificationContext';
import { bookingService } from '../../src/services/api/bookingService';
import { paymentSettlementService } from '../../src/services/api/paymentSettlementService';
import { getAddress, getDefaultAddress } from '../../src/services/api/addressService';
import { logger } from '../../src/utils/logger';

const TAG = 'VendorHomeDashboard';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Modern Icon Components
const MapPinIcon = ({ size = 14, color = '#565CAA' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const PlusIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const ClockIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ReturnIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 3v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WalletIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" stroke={color} strokeWidth="2" />
    <Path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill={color} />
  </Svg>
);

const SupportIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453L2 22l5.547-1.043A9.96 9.96 0 0 0 12 22z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const OrdersIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={color} strokeWidth="2" />
    <Path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v0z" stroke={color} strokeWidth="2" />
    <Path d="M9 12h6M9 16h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const HistoryIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 7v5l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color = '#9CA3AF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BellIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path d="M20 21a8 8 0 1 0-16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FileCheckIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M9 15l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PackageIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16.5 9.4L7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RefreshIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckCircleIcon = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M8 12l3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Countdown utility (t will be passed as parameter)
const getTimeRemaining = (targetDate: string, t: any): string => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const distance = target - now;
  if (distance < 0) return t.settlement.overdue;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Animated Action Card Component with optional Glassmorphism
const ActionCard = ({
  title,
  subtitle,
  icon: Icon,
  colors,
  onPress,
  badge,
  delay = 0,
  glassy = false,
}: {
  title: string;
  subtitle?: string;
  icon: React.FC<{ size?: number; color?: string }>;
  colors: [string, string];
  onPress: () => void;
  badge?: number | string;
  delay?: number;
  glassy?: boolean;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <View style={styles.actionCardWrapper}>
      <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.actionCardTouchable}
          >
          <LinearGradient
            colors={glassy ? [colors[0] + 'E6', colors[1] + 'F2'] : colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.actionCard, glassy && styles.actionCardGlassy]}
          >
            {/* Glass overlay for glassy cards */}
            {glassy && (
              <View style={styles.glassOverlay}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.glassInnerGlow}
                />
              </View>
            )}
            <View style={styles.actionCardContent}>
              <View style={[styles.actionIconContainer, glassy && styles.actionIconContainerGlassy]}>
                <Icon size={28} color="#FFF" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionCardTitle}>{title}</Text>
                {subtitle && <Text style={styles.actionCardSubtitle}>{subtitle}</Text>}
              </View>
            </View>
            {badge !== undefined && (
              <View style={[styles.actionBadge, glassy && styles.actionBadgeGlassy]}>
                <Text style={styles.actionBadgeText}>{badge}</Text>
              </View>
            )}
            {/* Shine effect for all cards */}
            <View style={styles.actionCardShine} />
            {/* Border glow for glassy effect */}
            {glassy && <View style={styles.glassBorderGlow} />}
          </LinearGradient>
        </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// Quick Action Button Component
const QuickActionButton = ({
  icon: Icon,
  label,
  onPress,
  delay = 0,
}: {
  icon: React.FC<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
  delay?: number;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => { scale.value = withSpring(0.92); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          activeOpacity={1}
          style={styles.quickActionButton}
        >
          <View style={styles.quickActionIconBg}>
            <Icon size={22} color="#565CAA" />
          </View>
          <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Alert Card Component with Shining Badge and optional Glassmorphism
const AlertCard = ({
  icon: IconComponent,
  title,
  subtitle,
  color,
  onPress,
  badge,
  delay = 0,
  theme,
  glassy = false,
}: {
  icon: React.FC<{ size?: number; color?: string }>;
  title: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
  badge?: number;
  delay?: number;
  theme: any;
  glassy?: boolean;
}) => {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (badge !== undefined && badge > 0) {
      // Shimmer animation for badge
      shimmer.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ),
        -1,
        false
      );

      // Pulse animation for badge
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.ease }),
          withTiming(1, { duration: 800, easing: Easing.ease })
        ),
        -1,
        false
      );
    }
  }, [badge]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(shimmer.value, [0, 1], [0.6, 1]),
  }));

  // Glassmorphism gradient colors
  const glassyGradientColors: [string, string, ...string[]] = glassy
    ? [color + '30', color + '18', color + '10']
    : [color + '10', color + '05', color + '05'];

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
      <Animated.View style={cardAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.alertCard,
            { borderLeftColor: color, borderLeftWidth: 4, backgroundColor: theme.colors.background.secondary },
            glassy && styles.alertCardGlassy,
          ]}
          onPress={onPress}
          onPressIn={() => { if (onPress) scale.value = withSpring(0.97); }}
          onPressOut={() => { if (onPress) scale.value = withSpring(1); }}
          activeOpacity={onPress ? 1 : 1}
        >
        <LinearGradient
          colors={glassyGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.alertCardGradient, { backgroundColor: glassy ? 'transparent' : theme.colors.background.secondary }]}
        >
          {/* Glass inner glow for glassy cards */}
          {glassy && (
            <View style={styles.alertGlassOverlay}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.alertGlassInnerGlow}
              />
            </View>
          )}
          <View style={[styles.alertIconContainer, { backgroundColor: color }, glassy && styles.alertIconContainerGlassy]}>
            <IconComponent size={22} color="#FFF" />
          </View>
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: theme.colors.text.primary }]}>{title}</Text>
            <Text style={[styles.alertSubtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text>
          </View>
          {badge !== undefined && badge > 0 && (
            <Animated.View style={[styles.alertBadge, { backgroundColor: color }, glassy && styles.alertBadgeGlassy, badgeAnimatedStyle]}>
              <Text style={styles.alertBadgeText}>{badge}</Text>
            </Animated.View>
          )}
          {onPress && (
            <View style={[styles.alertChevron, { backgroundColor: color + '15' }, glassy && { backgroundColor: color + '25' }]}>
              <ChevronRightIcon size={18} color={color} />
            </View>
          )}
        </LinearGradient>
        {/* Border glow for glassy effect */}
        {glassy && <View style={[styles.alertGlassBorder, { borderColor: color + '30' }]} />}
      </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Business Stats Card with Vendor Details
const VendorBusinessCard = ({ vendorData, theme, t }: { vendorData: any; theme: any; t: any }) => {
  const [activeView, setActiveView] = useState<'toPay' | 'toReceive'>(
    vendorData.toPay.orders.length > 0 ? 'toPay' : 'toReceive'
  );

  const currentData = activeView === 'toPay' ? vendorData.toPay : vendorData.toReceive;
  const hasToPayOrders = vendorData.toPay.orders.length > 0;
  const hasToReceiveOrders = vendorData.toReceive.orders.length > 0;

  if (!hasToPayOrders && !hasToReceiveOrders) return null;

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(300)} style={[styles.vendorCard, { backgroundColor: theme.colors.background.secondary }]}>
      <View style={styles.vendorHeader}>
        <Text style={[styles.vendorName, { color: theme.colors.text.primary }]}>
          {vendorData.vendorCompany || vendorData.vendorName}
        </Text>
        {hasToPayOrders && hasToReceiveOrders && (
          <View style={[styles.vendorToggle, { backgroundColor: theme.colors.background.tertiary }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeView === 'toPay' && [styles.toggleBtnActive, { backgroundColor: theme.colors.primary }]]}
              onPress={() => setActiveView('toPay')}
            >
              <Text style={[styles.toggleBtnText, { color: theme.colors.text.secondary }, activeView === 'toPay' && styles.toggleBtnTextActive]}>
                {t.settlement.pay}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, activeView === 'toReceive' && [styles.toggleBtnActive, { backgroundColor: theme.colors.primary }]]}
              onPress={() => setActiveView('toReceive')}
            >
              <Text style={[styles.toggleBtnText, { color: theme.colors.text.secondary }, activeView === 'toReceive' && styles.toggleBtnTextActive]}>
                {t.settlement.receive}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.vendorStats, { borderBottomColor: theme.colors.border.light }]}>
        <View style={styles.vendorStat}>
          <Text style={[styles.vendorStatLabel, { color: theme.colors.text.secondary }]}>{t.settlement.totalAmount}</Text>
          <Text style={[styles.vendorStatValue, { color: theme.colors.text.primary }]}>₹{currentData.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.vendorStat}>
          <Text style={[styles.vendorStatLabel, { color: '#22C55E' }]}>{t.settlement.paid}</Text>
          <Text style={[styles.vendorStatValue, { color: '#22C55E' }]}>₹{currentData.paidAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.vendorStat}>
          <Text style={[styles.vendorStatLabel, { color: '#F59E0B' }]}>{t.settlement.pending}</Text>
          <Text style={[styles.vendorStatValue, { color: '#F59E0B' }]}>₹{currentData.pendingAmount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {currentData.orders.map((order: any, idx: number) => (
        <TouchableOpacity key={idx} style={[styles.orderRow, { borderBottomColor: theme.colors.border.light }]}>
          <View>
            <Text style={[styles.orderName, { color: theme.colors.text.primary }]}>{order.order_name}</Text>
            <Text style={[styles.orderDate, { color: theme.colors.text.tertiary }]}>
              {order.rental_start_date ? new Date(order.rental_start_date).toLocaleDateString('en-IN') : 'N/A'}
            </Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={[styles.orderAmount, { color: theme.colors.text.primary }]}>₹{order.total_amount.toLocaleString('en-IN')}</Text>
            <View style={[
              styles.orderStatus,
              { backgroundColor: order.payment_status === 'paid' ? theme.colors.accent.greenLight : theme.colors.accent.amberLight }
            ]}>
              <Text style={[
                styles.orderStatusText,
                { color: order.payment_status === 'paid' ? '#059669' : '#D97706' }
              ]}>
                {order.payment_status === 'paid' ? t.settlement.paid : t.settlement.pending}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

export default function VendorHomeDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { pendingRequestsCount, setPendingRequestsCount, setPendingSettlementsCount } = useNotification();
  const user = useUserStore((state) => state.user);
  const createOrder = useOrderStore((state) => state.createOrder);

  // State
  const [isCreateOrderModalVisible, setIsCreateOrderModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [pickupDueCount, setPickupDueCount] = useState(0);
  const [returnPendingCount, setReturnPendingCount] = useState(0);
  const [pickupDueDate, setPickupDueDate] = useState<string | null>(null);
  const [returnDueDate, setReturnDueDate] = useState<string | null>(null);
  const [pickupCountdown, setPickupCountdown] = useState<string>('');
  const [returnCountdown, setReturnCountdown] = useState<string>('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [dueSign, setAmountDueSign] = useState(0);
  const [isBusinessExpanded, setIsBusinessExpanded] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<any[]>([]);
  const [isLoadingBusinessDetails, setIsLoadingBusinessDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('Loading...');

  // Animations
  const headerOpacity = useSharedValue(1);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  // Data fetching
  const fetchBookingCounts = async () => {
    try {
      setIsDataLoading(true);
      const [buyerResponse, ownerResponse, financialStats, settlementsResponse] = await Promise.all([
        bookingService.getBookings({ role: 'buyer', page: 1, limit: 100, exclude_completed: true }),
        bookingService.getBookings({ role: 'owner', page: 1, limit: 100, exclude_completed: true }),
        bookingService.getFinancialStats(),
        paymentSettlementService.getSettlementsToApprove().catch(() => ({ success: false, data: { settlements: [] } })),
      ]);

      // Only vendors (not owners) should see pickup/return cards
      // If user is acting as vendor (has buyer role bookings), show pickup/return options
      // If user is only owner, don't show these options
      const pickupDueBookings = buyerResponse.data.filter((b: any) => b.status === 'pickup_due');
      const returnDueBookings = buyerResponse.data.filter((b: any) => b.status === 'return_due');

      // Only set counts if user has vendor role (buyer) bookings
      setPickupDueCount(pickupDueBookings.length);
      setReturnPendingCount(returnDueBookings.length);

      if (pickupDueBookings.length > 0) {
        const earliest = pickupDueBookings.reduce((e: any, c: any) =>
          new Date(c.rental_start_date) < new Date(e.rental_start_date) ? c : e
        );
        setPickupDueDate(earliest.rental_start_date);
      }

      if (returnDueBookings.length > 0) {
        const earliest = returnDueBookings.reduce((e: any, c: any) =>
          new Date(c.rental_end_date) < new Date(e.rental_end_date) ? c : e
        );
        setReturnDueDate(earliest.rental_end_date);
      }

      const pendingRequests = ownerResponse.data.filter((b: any) => b.status === 'pending_request').length;
      setPendingRequestsCount(pendingRequests);

      if (settlementsResponse.success && settlementsResponse.data) {
        const pending = settlementsResponse.data.settlements.filter((s: any) => s.status === 'pending').length;
        setPendingSettlementsCount(pending);
      }

      setTotalRevenue(financialStats.total_revenue);
      setAmountDue(financialStats.amount_due);
      setAmountDueSign(financialStats.due_sign);
    } catch (error) {
      logger.error(TAG, 'Error fetching data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchUserLocation = async () => {
    try {
      if (user?.addressId) {
        const addressData = await getAddress(user.addressId);
        setUserLocation(addressData.state || 'India');
      } else {
        // Try to get default address
        try {
          const defaultAddress = await getDefaultAddress();
          setUserLocation(defaultAddress.state || 'India');
        } catch {
          setUserLocation('India');
        }
      }
    } catch (error) {
      logger.error(TAG, 'Error fetching user location:', error);
      setUserLocation('India');
    }
  };

  const fetchBusinessDetails = async () => {
    try {
      setIsLoadingBusinessDetails(true);
      const [buyerResponse, ownerResponse] = await Promise.all([
        bookingService.getBookings({ role: 'buyer', page: 1, limit: 100 }), // Include all bookings
        bookingService.getBookings({ role: 'owner', page: 1, limit: 100 }), // Include all bookings
      ]);

      const grouped: any = {};

      buyerResponse.data
        .filter((b: any) => b.status === 'completed' && b.payment_status === 'pending')
        .forEach((booking: any) => {
          const id = booking.owner_vendor_id;
          if (!grouped[id]) {
            grouped[id] = {
              vendorId: id,
              vendorName: booking.owner_name || 'Unknown',
              vendorCompany: booking.owner_company,
              toPay: { orders: [], totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
              toReceive: { orders: [], totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
            };
          }
          const amount = Number(booking.total_amount) || 0;
          grouped[id].toPay.orders.push({
            order_name: booking.order_name || `Order #${booking.vendor_booking_id.slice(-8)}`,
            vendor_booking_id: booking.vendor_booking_id,
            total_amount: amount,
            payment_status: booking.payment_status,
            rental_start_date: booking.rental_start_date,
          });
          grouped[id].toPay.totalAmount += amount;
          if (booking.payment_status === 'paid') grouped[id].toPay.paidAmount += amount;
          else grouped[id].toPay.pendingAmount += amount;
        });

      ownerResponse.data
        .filter((b: any) => b.status === 'completed' && b.payment_status === 'pending')
        .forEach((booking: any) => {
          const id = booking.buyer_vendor_id;
          if (!grouped[id]) {
            grouped[id] = {
              vendorId: id,
              vendorName: booking.buyer_name || 'Unknown',
              vendorCompany: booking.buyer_company,
              toPay: { orders: [], totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
              toReceive: { orders: [], totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
            };
          }
          const amount = Number(booking.total_amount) || 0;
          grouped[id].toReceive.orders.push({
            order_name: booking.order_name || `Order #${booking.vendor_booking_id.slice(-8)}`,
            vendor_booking_id: booking.vendor_booking_id,
            total_amount: amount,
            payment_status: booking.payment_status,
            rental_start_date: booking.rental_start_date,
          });
          grouped[id].toReceive.totalAmount += amount;
          if (booking.payment_status === 'paid') grouped[id].toReceive.paidAmount += amount;
          else grouped[id].toReceive.pendingAmount += amount;
        });

      const details = Object.values(grouped);
      setBusinessDetails(details);

      let due = 0;
      details.forEach((v: any) => {
        due -= v.toPay.pendingAmount;
        due += v.toReceive.pendingAmount;
      });
      setAmountDue(Math.abs(due));
      setAmountDueSign(due >= 0 ? 1 : 0);
    } catch (error) {
      logger.error(TAG, 'Error fetching business details:', error);
    } finally {
      setIsLoadingBusinessDetails(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookingCounts();
    setRefreshing(false);
  }, []);

  // Removed loader logic - always show home directly with skeleton loading

  useEffect(() => {
    const updateCountdowns = () => {
      if (pickupDueDate) setPickupCountdown(getTimeRemaining(pickupDueDate, t));
      if (returnDueDate) setReturnCountdown(getTimeRemaining(returnDueDate, t));
    };
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [pickupDueDate, returnDueDate, t]);

  useFocusEffect(
    useCallback(() => {
      fetchBookingCounts();
      fetchBusinessDetails();
      fetchUserLocation();
    }, [])
  );

  const getUserName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    return t.home.welcome;
  };

  // Handlers
  const handleProfilePress = () => router.push('/profile');
  const handleOrdersPress = () => router.push('/history?title=Orders');
  const handleSupportPress = () => router.push('/support');
  const handleRequestPickupPress = () => setIsCreateOrderModalVisible(true);
  const handlePickupDuePress = () => router.push('/confirm-pickup');
  const handleReturnPress = () => router.push('/confirm-return');

  const handleCreateOrder = (orderName: string) => {
    createOrder(orderName);
    setIsCreateOrderModalVisible(false);
    router.push({ pathname: '/product-selection', params: { orderName } });
  };

  const totalAlerts = pendingRequestsCount + pickupDueCount + returnPendingCount;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top }]}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.locationBadge, { backgroundColor: theme.colors.background.secondary }]}>
            <MapPinIcon size={14} color={theme.colors.primary} />
            <Text style={[styles.locationText, { color: theme.colors.text.primary }]} numberOfLines={1}>{userLocation}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.colors.background.secondary }]} onPress={handleProfilePress}>
            <UserIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="height"
        keyboardVerticalOffset={20}
      >
        <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#565CAA']} tintColor="#565CAA" />
        }
      >
        {/* Greeting */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: theme.colors.text.primary }]}>{t.home.hi}, {getUserName()}</Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.text.secondary }]}>{t.home.welcomeBack}</Text>
        </Animated.View>

        {/* Primary Actions */}
        <View style={styles.actionsSection}>
          <ActionCard
            title={t.home.newPickup}
            subtitle={t.home.requestEquipment}
            icon={PlusIcon}
            colors={['#22C55E', '#16A34A']}
            onPress={handleRequestPickupPress}
            delay={200}
          />

          {pickupDueCount > 0 && (
            <ActionCard
              title={t.home.pickupDue}
              subtitle={pickupCountdown ? `${t.home.dueIn} ${pickupCountdown}` : t.orders.pendingApproval}
              icon={ClockIcon}
              colors={['#8B5CF6', '#7C3AED']}
              onPress={handlePickupDuePress}
              badge={pickupDueCount}
              delay={250}
                glassy
            />
          )}

          {returnPendingCount > 0 && (
            <ActionCard
              title={t.home.returnDue}
              subtitle={returnCountdown ? `${t.home.dueIn} ${returnCountdown}` : t.home.returnPending}
              icon={ReturnIcon}
              colors={['#F97316', '#EA580C']}
              onPress={handleReturnPress}
              badge={returnPendingCount}
              delay={300}
                glassy
            />
          )}
        </View>

        {/* Business Stats Card */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.statsSection}>
          <TouchableOpacity
            style={styles.businessCard}
            activeOpacity={0.9}
            onPress={() => {
              if (!isBusinessExpanded && businessDetails.length === 0) fetchBusinessDetails();
              setIsBusinessExpanded(!isBusinessExpanded);
            }}
          >
            <LinearGradient
              colors={['rgba(86, 92, 170, 0.85)', 'rgba(67, 56, 202, 0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.businessCardGradient}
            >
              {/* Glass overlay effect */}
              <View style={styles.businessGlassOverlay}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.businessGlassInnerGlow}
                />
              </View>
              <View style={styles.businessCardHeader}>
                <View style={styles.businessIconContainer}>
                  <WalletIcon size={24} color="#FFF" />
                </View>
                <Text style={styles.businessCardTitle}>{t.home.businessOverview}</Text>
              </View>

              <View style={styles.businessStatsRow}>
                <View style={styles.businessStat}>
                  <Text style={styles.businessStatLabel}>{t.home.totalRevenue}</Text>
                  {isDataLoading ? (
                    <ActivityIndicator size="small" color="#FFF" style={{ marginTop: 8 }} />
                  ) : (
                    <Text style={styles.businessStatValue}>₹{(totalRevenue || 0).toLocaleString('en-IN')}</Text>
                  )}
                </View>
                <View style={styles.businessStatDivider} />
                <View style={styles.businessStat}>
                  <Text style={styles.businessStatLabel}>
                    {dueSign > 0 ? t.home.toReceive : t.home.toPay}
                  </Text>
                  {isDataLoading ? (
                    <ActivityIndicator size="small" color="#FFF" style={{ marginTop: 8 }} />
                  ) : (
                    <Text style={[styles.businessStatValue, { color: dueSign > 0 ? '#86EFAC' : '#FCA5A5' }]}>
                      ₹{(amountDue || 0).toLocaleString('en-IN')}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.businessExpandHint}>
                <Text style={styles.businessExpandText}>
                  {isBusinessExpanded ? t.home.tapToCollapse : t.home.tapToSeeDetail}
                </Text>
                <ChevronRightIcon size={16} color="rgba(255,255,255,0.6)" />
              </View>
              {/* Border glow for glass effect */}
              <View style={styles.businessGlassBorder} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Expanded Details */}
          {isBusinessExpanded && (
            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} style={styles.businessDetailsContainer}>
              {isLoadingBusinessDetails ? (
                <Animated.View entering={FadeInDown.duration(300)} style={styles.businessLoadingContainer}>
                  {[1, 2].map((item) => (
                    <View key={item} style={[styles.skeletonCard, { backgroundColor: theme.colors.background.secondary }]}>
                      <View style={styles.skeletonHeader}>
                        <Skeleton width={120} height={20} borderRadius={8} />
                        <Skeleton width={80} height={20} borderRadius={8} />
                      </View>
                      <View style={styles.skeletonRow}>
                        <Skeleton width={60} height={16} borderRadius={6} />
                        <Skeleton width={100} height={16} borderRadius={6} />
                      </View>
                      <View style={styles.skeletonRow}>
                        <Skeleton width={80} height={16} borderRadius={6} />
                        <Skeleton width={90} height={16} borderRadius={6} />
                      </View>
                      <View style={styles.skeletonDivider} />
                      <View style={styles.skeletonFooter}>
                        <Skeleton width="45%" height={14} borderRadius={6} />
                        <Skeleton width="45%" height={14} borderRadius={6} />
                      </View>
                    </View>
                  ))}
                </Animated.View>
              ) : businessDetails.length > 0 ? (
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                  {businessDetails.map((vendor: any, idx: number) => (
                    <VendorBusinessCard key={idx} vendorData={vendor} theme={theme} t={t} />
                  ))}
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown.duration(300)} style={[styles.emptyBusinessState, { backgroundColor: theme.colors.background.secondary }]}>
                  <Text style={[styles.emptyBusinessText, { color: theme.colors.text.secondary }]}>
                    {t.home.noCompletedOrders}
                  </Text>
                  <Text style={[styles.emptyBusinessSubtext, { color: theme.colors.text.tertiary }]}>
                    {t.home.completeFirstOrder}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t.home.quickActions}</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton icon={SupportIcon} label={t.home.support} onPress={handleSupportPress} delay={450} />
            <QuickActionButton icon={OrdersIcon} label={t.home.orders} onPress={handleOrdersPress} delay={480} />
            <QuickActionButton icon={HistoryIcon} label={t.home.history} onPress={() => router.push('/history')} delay={510} />
            <QuickActionButton icon={ReturnIcon} label={t.home.returns} onPress={handleReturnPress} delay={540} />
          </View>
        </Animated.View>

        {/* Alerts Section */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.alertsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <BellIcon size={20} color={theme.colors.text.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t.home.alerts}</Text>
              {totalAlerts > 0 && (
                <View style={styles.alertsCountBadge}>
                  <Text style={styles.alertsCountText}>{totalAlerts}</Text>
                </View>
              )}
            </View>
          </View>

          {pendingRequestsCount > 0 && (
            <AlertCard
              icon={FileCheckIcon}
              title={t.home.pendingRequests}
              subtitle={`${pendingRequestsCount} ${pendingRequestsCount === 1 ? t.home.requestNeedApproval : t.home.requestsNeedApproval}`}
              color="#F59E0B"
              onPress={() => router.push('/(tabs)/track-order')}
              badge={pendingRequestsCount}
              delay={580}
              theme={theme}
            />
          )}

          {pickupDueCount > 0 && (
            <AlertCard
              icon={PackageIcon}
              title={t.home.pickupDue}
              subtitle={`${pickupDueCount} ${pickupDueCount === 1 ? t.home.pickupWaitingConfirmation : t.home.pickupsWaitingConfirmation}`}
              color="#8B5CF6"
              onPress={handlePickupDuePress}
              badge={pickupDueCount}
              delay={610}
              theme={theme}
              glassy
            />
          )}

          {returnPendingCount > 0 && (
            <AlertCard
              icon={RefreshIcon}
              title={t.home.returnsDue}
              subtitle={returnCountdown ? `${t.home.dueIn} ${returnCountdown}` : `${returnPendingCount} ${returnPendingCount === 1 ? t.home.returnNeedProcessing : t.home.returnsNeedProcessing}`}
              color="#F97316"
              onPress={handleReturnPress}
              badge={returnPendingCount}
              delay={640}
              theme={theme}
              glassy
            />
          )}

          {totalAlerts === 0 && !isDataLoading && (
            <AlertCard
              icon={CheckCircleIcon}
              title={t.home.allClear}
              subtitle={t.home.noPendingActions}
              color="#22C55E"
              delay={580}
              theme={theme}
            />
          )}
        </Animated.View>

        {/* Dynamic bottom spacer for tab bar + navigation bar */}
        <View style={{ height: 90 + insets.bottom }} />
      </ScrollView>
      </KeyboardAvoidingView>

      <CreateOrderNameModal
        visible={isCreateOrderModalVisible}
        onClose={() => setIsCreateOrderModalVisible(false)}
        onCreateOrder={handleCreateOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding for tab bar + safe area
  },

  // Greeting
  greetingSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  greetingSubtext: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },

  // Action Cards
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionCardTouchable: {
    borderRadius: 20,
  },
  actionCard: {
    padding: 20,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  actionBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  actionCardShine: {
    position: 'absolute',
    top: 0,
    right: -50,
    width: 100,
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '25deg' }],
  },
  // Glassmorphism styles for ActionCard
  actionCardGlassy: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  glassBorderGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: -1,
  },
  actionIconContainerGlassy: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionBadgeGlassy: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  businessCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  businessCardGradient: {
    padding: 24,
    position: 'relative',
  },
  businessGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  businessGlassInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  businessGlassBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: -1,
  },
  businessCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  businessIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  businessCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  businessStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessStat: {
    flex: 1,
  },
  businessStatLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  businessStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  businessStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  businessExpandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  businessExpandText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 4,
  },
  businessDetailsContainer: {
    marginTop: 16,
    gap: 12,
  },
  businessLoadingContainer: {
    gap: 12,
    marginTop: 12,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyBusinessState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyBusinessText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBusinessSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Vendor Card
  vendorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  vendorToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#565CAA',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleBtnTextActive: {
    color: '#FFF',
  },
  vendorStats: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  vendorStat: {
    flex: 1,
  },
  vendorStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  vendorStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  orderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    lineHeight: 24,
  },
  quickActionsGrid: {
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40 - 36) / 4,
  },
  quickActionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  // Alerts
  alertsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertsCountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 24,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  alertCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  alertCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 16,
    backgroundColor: '#FFFFFF',
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  alertSubtitle: {
    fontSize: 13,
  },
  alertBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
  },
  alertBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  alertChevron: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Glassmorphism styles for AlertCard
  alertCardGlassy: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  alertGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  alertGlassInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  alertGlassBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 17,
    borderWidth: 1,
    zIndex: -1,
  },
  alertIconContainerGlassy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  alertBadgeGlassy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  bottomSpacer: {
    height: 120, // Extra space for floating tab bar + Android navigation bar
  },
});
