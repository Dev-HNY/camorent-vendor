/**
 * Owner Selection Screen
 * Allows vendor to select the equipment owner they want to rent from
 * For MVP, we'll use CAMORENT as the default owner
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { bookingService, CamorentAdminResponse } from '../src/services/api';
import {
  ScreenHeader,
  SearchIcon,
  CheckIcon,
  EmptyState,
  ErrorState,
  PrimaryButton,
  SuccessModal,
} from '../src/components';

export default function OwnerSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();

  const orderName = params.orderName as string || t.ownerSelection.new_order;
  const startDate = params.startDate as string;
  const endDate = params.endDate as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [selectedOwner, setSelectedOwner] = useState<CamorentAdminResponse | null>(null);
  const [owners, setOwners] = useState<CamorentAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  // Fetch available owners on component mount
  useEffect(() => {
    fetchAvailableOwners();
  }, []);

  const fetchAvailableOwners = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await bookingService.getAvailableOwners();
      setOwners(response.owners);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail?.message || err?.message || 'Unknown error';
      setError(t.errors.failed_load_owners.replace('{errorMessage}', errorMessage));
      setErrorModalMessage(t.errors.failed_load_owners_with_retry.replace('{errorMessage}', errorMessage));
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOwner = (owner: CamorentAdminResponse) => {
    setSelectedOwnerId(owner.vendor_id);
    setSelectedOwner(owner);
  };

  const handleProceed = () => {
    if (!selectedOwnerId || !selectedOwner) {
      setShowWarning(true);
      return;
    }

    // Navigate to booking summary/confirmation
    router.push({
      pathname: '/booking-summary',
      params: {
        orderName,
        startDate,
        endDate,
        ownerId: selectedOwnerId,
        ownerName: selectedOwner.full_name,
        ownerPhone: selectedOwner.phone_number,
      },
    });
  };

  // Filter owners by search query
  const filteredOwners = owners.filter(owner => {
    if (searchQuery === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      owner.full_name.toLowerCase().includes(query) ||
      owner.email?.toLowerCase().includes(query) ||
      owner.phone_number.toLowerCase().includes(query) ||
      owner.company_name?.toLowerCase().includes(query)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader
        title={orderName}
        subtitle={t.ownerSelection.subtitle}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView style={[styles.content, { backgroundColor: theme.colors.background.secondary }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>{t.ownerSelection.loading}</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState
            message={error}
            onRetry={fetchAvailableOwners}
          />
        )}

        {/* Empty State - No owners available */}
        {!isLoading && !error && owners.length === 0 && (
          <View style={styles.loadingContainer}>
            <EmptyState
              icon={<SearchIcon color={theme.colors.text.tertiary} size={64} />}
              title="No Vendors Available"
              description="There are no equipment owners available at the moment. Please check back later or contact support."
            />
            <PrimaryButton
              title={t.buttons.go_back}
              onPress={() => router.back()}
              size="medium"
              style={{ marginTop: 24, marginHorizontal: 32 }}
            />
          </View>
        )}

        {/* Content - only show when loaded */}
        {!isLoading && !error && owners.length > 0 && (
          <>
            {/* Instructions */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.instructionsCard, { backgroundColor: theme.colors.primary + '15', borderLeftColor: theme.colors.primary }]}>
              <Text style={[styles.instructionsTitle, { color: theme.colors.primary }]}>{t.ownerSelection.instructions_title}</Text>
              <Text style={[styles.instructionsText, { color: theme.colors.text.secondary }]}>
                {t.ownerSelection.instructions_text}
              </Text>
            </Animated.View>

            {/* Date Summary */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.dateSummaryCard, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
              <Text style={[styles.dateSummaryLabel, { color: theme.colors.text.secondary }]}>{t.ownerSelection.rental_period}</Text>
              <Text style={[styles.dateSummaryValue, { color: theme.colors.text.primary }]}>
                {startDate && new Date(startDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}
                {' → '}
                {endDate && new Date(endDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </Animated.View>

            {/* Search Bar - only show if there are multiple owners */}
            {owners.length > 1 && (
              <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.searchContainer, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
                <SearchIcon color={theme.colors.text.tertiary} size={20} />
                <TextInput
                  style={[styles.searchInput, { color: theme.colors.text.primary }]}
                  placeholder={t.ownerSelection.search_placeholder}
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </Animated.View>
            )}

            {/* Owner List */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={[styles.ownersList, { paddingBottom: 100 + insets.bottom }]}>
              <Text style={[styles.ownersListTitle, { color: theme.colors.text.primary }]}>
                {t.ownerSelection.available_owners} ({filteredOwners.length})
              </Text>
              {!selectedOwnerId && filteredOwners.length > 0 && (
                <Text style={[styles.selectHint, { color: theme.colors.text.secondary }]}>
                  {t.ownerSelection.select_hint}
                </Text>
              )}

              {filteredOwners.length === 0 ? (
                <EmptyState
                  icon={<SearchIcon color={theme.colors.text.tertiary} size={48} />}
                  title={t.ownerSelection.no_owners_found_title}
                  description={t.ownerSelection.no_owners_found_description}
                />
              ) : (
                filteredOwners.map((owner) => (
                  <TouchableOpacity
                    key={owner.vendor_id}
                    style={[
                      styles.ownerCard,
                      { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light },
                      selectedOwnerId === owner.vendor_id && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '08' },
                    ]}
                    onPress={() => handleSelectOwner(owner)}
                  >
                    <View style={[styles.ownerAvatar, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.ownerAvatarText}>
                        {owner.full_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.ownerInfo}>
                      <View style={styles.ownerNameRow}>
                        <Text style={[styles.ownerName, { color: theme.colors.text.primary }]} numberOfLines={1} ellipsizeMode="tail">
                          {owner.full_name}
                        </Text>
                        {owner.is_verified && (
                          <View style={styles.verifiedBadge}>
                            <CheckIcon color="#ffffff" size={12} />
                            <Text style={styles.verifiedText}>{t.badges.verified}</Text>
                          </View>
                        )}
                        {owner.is_admin && (
                          <View style={styles.adminBadge}>
                            <CheckIcon color="#ffffff" size={10} />
                            <Text style={styles.adminText}>{t.badges.admin}</Text>
                          </View>
                        )}
                      </View>

                      {owner.company_name && (
                        <Text style={[styles.ownerOrganization, { color: theme.colors.text.secondary }]} numberOfLines={1} ellipsizeMode="tail">
                          {owner.company_name}
                        </Text>
                      )}

                      {owner.email && (
                        <View style={styles.ownerContactRow}>
                          <Text style={[styles.ownerContact, { color: theme.colors.text.tertiary }]} numberOfLines={1} ellipsizeMode="tail">
                            {owner.email}
                          </Text>
                        </View>
                      )}

                      <View style={styles.ownerContactRow}>
                        <Text style={[styles.ownerContact, { color: theme.colors.text.tertiary }]} numberOfLines={1}>
                          {owner.phone_number}
                        </Text>
                      </View>
                    </View>

                    {selectedOwnerId === owner.vendor_id && (
                      <View style={styles.selectedIndicator}>
                        <CheckIcon color={theme.colors.primary} size={24} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}

              {/* Info Card - only show for single owner */}
              {owners.length === 1 && (
                <View style={[styles.infoCard, { backgroundColor: theme.colors.background.tertiary, borderColor: theme.colors.border.light }]}>
                  <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                    {t.ownerSelection.single_owner_info}
                  </Text>
                </View>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Bottom Button */}
      {selectedOwnerId && selectedOwner && (
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <View style={[styles.bottomBar, { backgroundColor: theme.colors.background.primary, borderTopColor: theme.colors.border.light, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.bottomInfo}>
            <Text style={[styles.bottomLabel, { color: theme.colors.text.secondary }]}>{t.ownerSelection.selected_owner_label}</Text>
            <Text style={[styles.bottomValue, { color: theme.colors.text.primary }]} numberOfLines={1} ellipsizeMode="tail">
              {selectedOwner.full_name}
            </Text>
          </View>
          <PrimaryButton
            title={t.buttons.continue_arrow}
            onPress={handleProceed}
            size="medium"
          />
          </View>
        </Animated.View>
      )}

      {/* Modals */}
      <SuccessModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={t.alerts.error_title}
        message={errorModalMessage}
        icon="error"
        primaryButtonText={t.buttons.retry}
        secondaryButtonText={t.buttons.go_back}
        onPrimaryPress={() => {
          setShowErrorModal(false);
          fetchAvailableOwners();
        }}
        onSecondaryPress={() => {
          setShowErrorModal(false);
          router.back();
        }}
      />

      <SuccessModal
        visible={showWarning}
        onClose={() => setShowWarning(false)}
        title={t.alerts.select_owner_title}
        message={t.alerts.select_owner_message}
        icon="warning"
        primaryButtonText="OK"
      />
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 16,
  },
  instructionsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
  },
  dateSummaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateSummaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  ownersList: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Extra padding for bottom bar
  },
  ownersListTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  ownerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ownerAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  adminText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  ownerOrganization: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  ownerContactRow: {
    marginBottom: 2,
  },
  ownerContact: {
    fontSize: 12,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    fontSize: 12,
    marginBottom: 2,
  },
  bottomValue: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },
});
