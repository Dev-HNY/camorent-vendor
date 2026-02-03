/**
 * Settle Payment Screen
 * Two tabs: "Settle Your Order" and "Settle Requests"
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import SettleYourOrder from '../../src/components/settlement/SettleYourOrder';
import SettleRequests from '../../src/components/settlement/SettleRequests';
import { useNotification } from '../../src/context/NotificationContext';

type TabType = 'settle-order' | 'settle-requests';

export default function SettlePaymentScreen() {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('settle-order');
  const insets = useSafeAreaInsets();
  const { pendingSettlementsCount } = useNotification();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();

  // If opened from settlement notification, switch to settle-requests tab
  useEffect(() => {
    if (params?.settlementId || params?.fromNotification === 'true') {
      setActiveTab('settle-requests');
    }
  }, [params]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.light }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>{t.settlement.settlePayment}</Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border.light }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settle-order' && styles.activeTab]}
          onPress={() => setActiveTab('settle-order')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, { color: theme.colors.text.secondary }, activeTab === 'settle-order' && { color: theme.colors.primary }]}>
            {t.settlement.settleYourOrder}
          </Text>
          {activeTab === 'settle-order' && <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settle-requests' && styles.activeTab]}
          onPress={() => setActiveTab('settle-requests')}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.tabText, { color: theme.colors.text.secondary }, activeTab === 'settle-requests' && { color: theme.colors.primary }]}>
              {t.settlement.settleRequests}
            </Text>
            {pendingSettlementsCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>{pendingSettlementsCount}</Text>
              </View>
            )}
          </View>
          {activeTab === 'settle-requests' && <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.primary }]} />}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'settle-order' ? <SettleYourOrder /> : <SettleRequests />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // No background change needed
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF', // Always white on primary badge
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
