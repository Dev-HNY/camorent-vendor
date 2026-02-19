/**
 * Profile Screen
 * Modern profile with settings, theme toggle, and language selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../src/store/userStore';
import { authService } from '../src/services/api/authService';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import type { Language } from '../src/context/LanguageContext';
import { useNotification } from '../src/context/NotificationContext';
import { ScreenHeader, Skeleton } from '../src/components';

// Modern SVG Icons
const ChevronRightIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SunIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 1V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 21V23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4.22 4.22L5.64 5.64" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.36 18.36L19.78 19.78" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1 12H3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4.22 19.78L5.64 18.36" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MoonIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88302 19.5345 5.67423 18.3258C4.46544 17.117 3.62593 15.589 3.25393 13.9205C2.88193 12.252 2.99274 10.5121 3.57348 8.9043C4.15423 7.29651 5.18083 5.88737 6.53324 4.84175C7.88565 3.79614 9.50779 3.15731 11.21 3C10.2134 4.34827 9.73387 6.00945 9.85856 7.68141C9.98324 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1414C17.9906 14.2661 19.6517 13.7866 21 12.79Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GlobeIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

const PhoneIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27099 2.12 4.18C2.09501 3.90347 2.12787 3.62476 2.2165 3.36162C2.30513 3.09849 2.44757 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.11 2H7.11C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.11 3.72C9.23662 4.68007 9.47144 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MapPinIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BuildingIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="2" width="16" height="20" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6H8.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 6H16.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 6H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BriefcaseIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FileTextIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 13H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 9H9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LogOutIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color = '#22C55E', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShieldCheckIcon = ({ color = '#22C55E', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Setting Item Component
const SettingItem = ({
  icon,
  iconColor,
  label,
  value,
  onPress,
  showSwitch,
  switchValue,
  onSwitchChange,
  theme,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  theme: any;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const content = (
    <View style={styles.settingItem}>
      <View style={[styles.settingIconContainer, { backgroundColor: iconColor + '15' }]}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>{label}</Text>
        {value && <Text style={[styles.settingValue, { color: theme.colors.text.tertiary }]}>{value}</Text>}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary + '50' }}
          thumbColor={switchValue ? theme.colors.primary : '#f4f3f4'}
        />
      ) : (
        onPress && <ChevronRightIcon color={theme.colors.text.tertiary} size={20} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9}>
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return content;
};

// Info Row Component
const InfoRow = ({
  icon,
  iconColor,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  theme: any;
}) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconContainer, { backgroundColor: iconColor + '15' }]}>{icon}</View>
    <View style={styles.infoContent}>
      <Text style={[styles.infoLabel, { color: theme.colors.text.tertiary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>{value}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUserStore((state) => state.user);
  const clearUserProfile = useUserStore((state) => state.clearUserProfile);
  const { theme, themeMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { triggerTestNotification } = useNotification();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logoutScale = useSharedValue(1);

  // Simulate loading state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const logoutAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoutScale.value }],
  }));

  const handleLogout = async () => {
    await authService.logout(); // clears tokens from SecureStore
    clearUserProfile();         // clears Zustand store
    router.replace('/login');
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };

  const getLanguageLabel = (lang: Language) => {
    return lang === 'en' ? t.profile.english : t.profile.hindi;
  };

  const handleLogoutPressIn = () => {
    logoutScale.value = withSpring(0.96, { damping: 15 });
  };

  const handleLogoutPressOut = () => {
    logoutScale.value = withSpring(1, { damping: 15 });
  };

  if (!user) {
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>{t.errors.somethingWentWrong}</Text>
        </View>
      </View>
    );
  }

  // Loading Skeleton
  if (isLoading) {
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top }]}>
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <ScreenHeader title={t.profile.profile} />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Skeleton */}
          <View style={styles.avatarContainer}>
            <Skeleton width={100} height={100} borderRadius={30} style={{ marginBottom: 16 }} />
            <Skeleton width={180} height={28} borderRadius={8} style={{ marginBottom: 8 }} />
            <Skeleton width={140} height={28} borderRadius={20} />
          </View>

          {/* Settings Section Skeleton */}
          <View style={styles.section}>
            <Skeleton width={80} height={16} borderRadius={4} style={{ marginBottom: 12, marginLeft: 4 }} />
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={styles.settingItem}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <View style={{ flex: 1 }}>
                  <Skeleton width={120} height={18} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width={80} height={14} borderRadius={4} />
                </View>
                <Skeleton width={51} height={31} borderRadius={16} />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
              <View style={styles.settingItem}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <View style={{ flex: 1 }}>
                  <Skeleton width={100} height={18} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width={70} height={14} borderRadius={4} />
                </View>
                <Skeleton width={20} height={20} borderRadius={4} />
              </View>
            </View>
          </View>

          {/* Personal Information Skeleton */}
          <View style={styles.section}>
            <Skeleton width={160} height={16} borderRadius={4} style={{ marginBottom: 12, marginLeft: 4 }} />
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.secondary }]}>
              {[1, 2, 3].map((i) => (
                <React.Fragment key={i}>
                  {i > 1 && <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />}
                  <View style={styles.infoRow}>
                    <Skeleton width={36} height={36} borderRadius={10} />
                    <View style={{ flex: 1 }}>
                      <Skeleton width={90} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                      <Skeleton width="80%" height={18} borderRadius={4} />
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Business Information Skeleton */}
          <View style={styles.section}>
            <Skeleton width={180} height={16} borderRadius={4} style={{ marginBottom: 12, marginLeft: 4 }} />
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.secondary }]}>
              {[1, 2, 3].map((i) => (
                <React.Fragment key={i}>
                  {i > 1 && <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />}
                  <View style={styles.infoRow}>
                    <Skeleton width={36} height={36} borderRadius={10} />
                    <View style={{ flex: 1 }}>
                      <Skeleton width={110} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                      <Skeleton width="70%" height={18} borderRadius={4} />
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Logout Button Skeleton */}
          <View style={styles.logoutContainer}>
            <Skeleton width="100%" height={56} borderRadius={16} />
          </View>

          {/* Dynamic bottom spacer for navigation bar */}
          <View style={{ height: 40 + insets.bottom }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {/* Header - Fixed at top */}
      <ScreenHeader title={t.profile.profile} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Avatar */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.avatarContainer}>
          <LinearGradient colors={[theme.colors.primary, '#4B4F8C']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>
              {user.firstName?.charAt(0).toUpperCase()}
              {user.lastName?.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={[styles.nameText, { color: theme.colors.text.primary }]}>
            {user.firstName} {user.lastName}
          </Text>
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <ShieldCheckIcon color="#22C55E" size={14} />
              <Text style={styles.verifiedText}>{t.profile.verifiedVendor}</Text>
            </View>
          )}
        </Animated.View>

        {/* Settings Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>{t.profile.settings}</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.secondary }]}>
            <SettingItem
              icon={themeMode === 'dark' ? <MoonIcon color="#8B5CF6" size={18} /> : <SunIcon color="#F59E0B" size={18} />}
              iconColor={themeMode === 'dark' ? '#8B5CF6' : '#F59E0B'}
              label={t.profile.theme}
              value={themeMode === 'light' ? t.profile.lightMode : t.profile.darkMode}
              showSwitch
              switchValue={themeMode === 'dark'}
              onSwitchChange={toggleTheme}
              theme={theme}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
            <SettingItem
              icon={<GlobeIcon color="#3B82F6" size={18} />}
              iconColor="#3B82F6"
              label={t.profile.language}
              value={getLanguageLabel(language)}
              onPress={() => setLanguageModalVisible(true)}
              theme={theme}
            />
          </View>
        </Animated.View>

        {/* Personal Information */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>{t.profile.personalInformation}</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.secondary }]}>
            <InfoRow
              icon={<UserIcon color={theme.colors.primary} size={16} />}
              iconColor={theme.colors.primary}
              label={t.profile.fullName}
              value={`${user.firstName} ${user.lastName}`}
              theme={theme}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
            <InfoRow
              icon={<PhoneIcon color="#22C55E" size={16} />}
              iconColor="#22C55E"
              label={t.profile.contactNumber}
              value={user.contactNo}
              theme={theme}
            />
            {user.hasAddress && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
                <InfoRow
                  icon={<MapPinIcon color="#EC4899" size={16} />}
                  iconColor="#EC4899"
                  label={t.profile.address}
                  value={t.profile.addressConfigured}
                  theme={theme}
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* Business Information */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>{t.profile.businessInformation}</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.secondary }]}>
            <InfoRow
              icon={<BuildingIcon color="#8B5CF6" size={16} />}
              iconColor="#8B5CF6"
              label={t.profile.organization}
              value={user.organization || t.profile.notSpecified}
              theme={theme}
            />
            {user.workExperience && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
                <InfoRow
                  icon={<BriefcaseIcon color="#06B6D4" size={16} />}
                  iconColor="#06B6D4"
                  label={t.profile.workExperience}
                  value={user.workExperience}
                  theme={theme}
                />
              </>
            )}
            {user.gstNo && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
                <InfoRow
                  icon={<FileTextIcon color="#F59E0B" size={16} />}
                  iconColor="#F59E0B"
                  label={t.profile.gstin}
                  value={user.gstNo}
                  theme={theme}
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* Developer Options - Only visible in development */}
        {__DEV__ && (
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>🔧 Developer Options</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={styles.devSection}>
                <View style={styles.devHeader}>
                  <View style={[styles.devIconContainer, { backgroundColor: '#3B82F6' + '15' }]}>
                    <Text style={styles.devIconText}>🔔</Text>
                  </View>
                  <View style={styles.devTextContainer}>
                    <Text style={[styles.devTitle, { color: theme.colors.text.primary }]}>Test Notifications</Text>
                    <Text style={[styles.devSubtitle, { color: theme.colors.text.secondary }]}>
                      Test notification modals in Expo Go
                    </Text>
                  </View>
                </View>

                <View style={styles.testButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => triggerTestNotification('request')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.testButtonText}>Request</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: '#10B981' }]}
                    onPress={() => triggerTestNotification('settlement')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.testButtonText}>Settlement</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Logout Button */}
        <Animated.View entering={FadeInUp.delay(__DEV__ ? 700 : 600).duration(400)} style={styles.logoutContainer}>
          <Animated.View style={logoutAnimatedStyle}>
            <Pressable onPress={handleLogout} onPressIn={handleLogoutPressIn} onPressOut={handleLogoutPressOut}>
              <View style={[styles.logoutButton, { backgroundColor: '#EF4444' + '15' }]}>
                <LogOutIcon color="#EF4444" size={20} />
                <Text style={styles.logoutText}>{t.profile.logout}</Text>
              </View>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Dynamic bottom spacer for navigation bar */}
        <View style={{ height: 40 + insets.bottom }} />
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLanguageModalVisible(false)}>
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>{t.profile.selectLanguage}</Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                { backgroundColor: language === 'en' ? theme.colors.primary + '15' : 'transparent' },
              ]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  { color: language === 'en' ? theme.colors.primary : theme.colors.text.primary },
                ]}
              >
                {t.profile.english}
              </Text>
              {language === 'en' && <CheckIcon color={theme.colors.primary} size={20} />}
            </TouchableOpacity>

            <View style={[styles.languageDivider, { backgroundColor: theme.colors.border.light }]} />

            <TouchableOpacity
              style={[
                styles.languageOption,
                { backgroundColor: language === 'hi' ? theme.colors.primary + '15' : 'transparent' },
              ]}
              onPress={() => handleLanguageSelect('hi')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  { color: language === 'hi' ? theme.colors.primary : theme.colors.text.primary },
                ]}
              >
                {t.profile.hindi}
              </Text>
              {language === 'hi' && <CheckIcon color={theme.colors.primary} size={20} />}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E' + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Developer Options Styles
  devSection: {
    padding: 14,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  devIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devIconText: {
    fontSize: 24,
  },
  devTextContainer: {
    flex: 1,
  },
  devTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  devSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  testButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageDivider: {
    height: 1,
    marginVertical: 4,
  },
});
