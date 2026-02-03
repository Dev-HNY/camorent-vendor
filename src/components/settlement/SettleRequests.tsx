/**
 * Settle Requests Component
 * View settlement requests (both created by user and to be approved)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { paymentSettlementService, Settlement } from '../../services/api/paymentSettlementService';
import { useNotification } from '../../context/NotificationContext';

type ApprovalFilterType = 'pending' | 'all';

// Animated Button Component for approve/reject actions
const AnimatedActionButton = ({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  isApprove?: boolean;
  children: React.ReactNode;
  style?: any;
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(glow.value, [0, 1], [0.3, 0.8]);
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: glowOpacity,
    };
  });

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    glow.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
    onPress();
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity style={style} onPress={handlePress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SettleRequests() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilterType>('pending');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { setPendingSettlementsCount } = useNotification();

  useEffect(() => {
    loadData();
    loadPendingCount(); // Always load pending count for badge
  }, []);

  const loadPendingCount = async () => {
    try {
      const response = await paymentSettlementService.getSettlementsToApprove();
      if (response.success && response.data) {
        const pendingCount = response.data.settlements.filter((s: Settlement) => s.status === 'pending').length;
        setPendingSettlementsCount(pendingCount);
      }
    } catch {
      // Failed to load pending count - not critical
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await paymentSettlementService.getSettlementsToApprove();
      if (response.success && response.data) {
        setSettlements(response.data.settlements);
      }
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.settlement.failedToLoadSettlements);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    await loadPendingCount();
    setRefreshing(false);
  }, []);

  const handleSettlementPress = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setShowDetailModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSettlement) return;

    Alert.alert(
      t.settlement.confirmApproval,
      t.settlement.confirmApprovalMessage.replace('{amount}', selectedSettlement.amount.toLocaleString()),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.buttons.approve,
          style: 'default',
          onPress: async () => {
            try {
              const response = await paymentSettlementService.reviewSettlement(
                selectedSettlement.settlement_id,
                { action: 'approve' }
              );

              if (response.success) {
                Alert.alert(t.common.success, t.settlement.approvalSuccess);
                setShowDetailModal(false);
                await loadData();
                await loadPendingCount(); // Update badge count
              } else {
                Alert.alert(t.common.error, response.error || t.settlement.approvalError);
              }
            } catch (error: any) {
              Alert.alert(t.common.error, error.message || t.settlement.approvalError);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!selectedSettlement || !rejectionReason.trim()) {
      Alert.alert(t.common.error, t.settlement.provideRejectionReason);
      return;
    }

    try {
      const response = await paymentSettlementService.reviewSettlement(
        selectedSettlement.settlement_id,
        { action: 'reject', rejection_reason: rejectionReason }
      );

      if (response.success) {
        Alert.alert(t.common.success, t.settlement.rejectSuccess);
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectionReason('');
        await loadData();
        await loadPendingCount(); // Update badge count
      } else {
        Alert.alert(t.common.error, response.error || t.settlement.failedToRejectSettlement);
      }
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.settlement.failedToRejectSettlement);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.status.warning;
      case 'approved':
        return theme.colors.status.success;
      case 'rejected':
        return theme.colors.status.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  // Filter settlements based on approvalFilter
  const filteredSettlements = approvalFilter === 'pending'
    ? settlements.filter((s: Settlement) => s.status === 'pending')
    : settlements.filter((s: Settlement) => s.status === 'approved' || s.status === 'rejected');

  const pendingCount = settlements.filter((s: Settlement) => s.status === 'pending').length;

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.secondary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: approvalFilter === 'pending' ? theme.colors.primary + '15' : theme.colors.background.primary,
              borderColor: approvalFilter === 'pending' ? theme.colors.primary : theme.colors.border.light,
            },
          ]}
          onPress={() => setApprovalFilter('pending')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: approvalFilter === 'pending' ? theme.colors.primary : theme.colors.text.secondary,
              },
              approvalFilter === 'pending' && styles.activeFilterText,
            ]}
          >
            {t.settlement.toApprove} ({pendingCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: approvalFilter === 'all' ? theme.colors.primary + '15' : theme.colors.background.primary,
              borderColor: approvalFilter === 'all' ? theme.colors.primary : theme.colors.border.light,
            },
          ]}
          onPress={() => setApprovalFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: approvalFilter === 'all' ? theme.colors.primary : theme.colors.text.secondary,
              },
              approvalFilter === 'all' && styles.activeFilterText,
            ]}
          >
            {t.settlement.history}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settlements List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredSettlements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={theme.colors.text.tertiary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
              {approvalFilter === 'pending'
                ? t.settlement.noPendingSettlements
                : t.settlement.noSettlementHistory}
            </Text>
          </View>
        ) : (
          filteredSettlements.map((settlement: Settlement) => (
            <TouchableOpacity
              key={settlement.settlement_id}
              style={[
                styles.settlementCard,
                {
                  backgroundColor: theme.colors.background.primary,
                  borderColor: theme.colors.border.light,
                },
              ]}
              onPress={() => handleSettlementPress(settlement)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={[styles.orderName, { color: theme.colors.text.primary }]}>
                    {settlement.order_name || 'Order'}
                  </Text>
                  <Text style={[styles.partnerName, { color: theme.colors.text.secondary }]}>
                    {settlement.buyer_company
                      ? `${settlement.buyer_company} (${settlement.buyer_name})`
                      : `Buyer: ${settlement.buyer_name}`}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(settlement.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(settlement.status) as any} size={16} color={getStatusColor(settlement.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(settlement.status) }]}>
                    {settlement.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>Amount:</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                    ₹{settlement.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>Created:</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                    {new Date(settlement.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {settlement.reviewed_at && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>Reviewed:</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                      {new Date(settlement.reviewed_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              {settlement.challan_image_url && (
                <View style={[styles.challanPreview, { borderTopColor: theme.colors.border.light }]}>
                  <Ionicons name="document-attach-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.challanText, { color: theme.colors.primary }]}>{t.settlement.challanAttached}</Text>
                </View>
              )}

              {settlement.rejection_reason && (
                <View
                  style={[
                    styles.rejectionBox,
                    { backgroundColor: theme.colors.status.error + '10' },
                  ]}
                >
                  <Text style={[styles.rejectionLabel, { color: theme.colors.status.error }]}>
                    {t.settlement.rejectReasonPrompt}
                  </Text>
                  <Text style={[styles.rejectionText, { color: theme.colors.text.primary }]}>
                    {settlement.rejection_reason}
                  </Text>
                </View>
              )}

              {/* Approve/Reject buttons for pending settlements in to-approve view */}
              {settlement.status === 'pending' && (
                <View style={[styles.cardActions, { borderTopColor: theme.colors.border.light }]}>
                  <AnimatedActionButton
                    isApprove={true}
                    style={[
                      styles.approveCardButton,
                      {
                        backgroundColor: theme.colors.status.success,
                        shadowColor: theme.colors.status.success,
                      },
                    ]}
                    onPress={() => {
                      setSelectedSettlement(settlement);
                      handleApprove();
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={theme.colors.text.inverse} />
                    <Text style={[styles.approveCardButtonText, { color: theme.colors.text.inverse }]}>
                      {t.buttons.approve}
                    </Text>
                  </AnimatedActionButton>

                  <AnimatedActionButton
                    isApprove={false}
                    style={[
                      styles.rejectCardButton,
                      {
                        backgroundColor: theme.colors.status.error,
                        shadowColor: theme.colors.status.error,
                      },
                    ]}
                    onPress={() => {
                      setSelectedSettlement(settlement);
                      setShowRejectModal(true);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={theme.colors.text.inverse} />
                    <Text style={[styles.rejectCardButtonText, { color: theme.colors.text.inverse }]}>
                      {t.buttons.reject}
                    </Text>
                  </AnimatedActionButton>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border.light }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                {t.settlement.settlementDetails}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {selectedSettlement && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Order:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                    {selectedSettlement.order_name || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Amount:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      styles.amountText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    ₹{selectedSettlement.amount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                    Status:
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedSettlement.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedSettlement.status) }]}>
                      {selectedSettlement.status}
                    </Text>
                  </View>
                </View>

                {selectedSettlement.rental_start_date && selectedSettlement.rental_end_date && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                      Rental Period:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                      {new Date(selectedSettlement.rental_start_date).toLocaleDateString()} -{' '}
                      {new Date(selectedSettlement.rental_end_date).toLocaleDateString()}
                      {selectedSettlement.total_rental_days && ` (${selectedSettlement.total_rental_days} days)`}
                    </Text>
                  </View>
                )}

                {(selectedSettlement.sku_items_count || selectedSettlement.crew_items_count) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Items:</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                      {selectedSettlement.sku_items_count ? `${selectedSettlement.sku_items_count} Equipment` : ''}
                      {selectedSettlement.sku_items_count && selectedSettlement.crew_items_count && ', '}
                      {selectedSettlement.crew_items_count ? `${selectedSettlement.crew_items_count} Crew` : ''}
                    </Text>
                  </View>
                )}

                {selectedSettlement.delivery_type && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                      Delivery Type:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                      {selectedSettlement.delivery_type.charAt(0).toUpperCase() + selectedSettlement.delivery_type.slice(1).replace('_', ' ')}
                    </Text>
                  </View>
                )}

                {selectedSettlement.notes && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Notes:</Text>
                    <Text style={[styles.notesText, { color: theme.colors.text.primary }]}>
                      {selectedSettlement.notes}
                    </Text>
                  </View>
                )}

                {selectedSettlement.challan_image_url && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                      {t.settlement.paymentChallan}
                    </Text>
                    <Image
                      source={{ uri: selectedSettlement.challan_image_url }}
                      style={[styles.challanImage, { backgroundColor: theme.colors.background.secondary }]}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {selectedSettlement.rejection_reason && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                      {t.settlement.rejectReasonPrompt}
                    </Text>
                    <Text
                      style={[
                        styles.rejectionDetailText,
                        { color: theme.colors.status.error },
                      ]}
                    >
                      {selectedSettlement.rejection_reason}
                    </Text>
                  </View>
                )}

                {selectedSettlement.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <AnimatedActionButton
                      isApprove={true}
                      style={[
                        styles.approveButton,
                        {
                          backgroundColor: theme.colors.status.success,
                          shadowColor: theme.colors.status.success,
                        },
                      ]}
                      onPress={handleApprove}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.text.inverse} />
                      <Text style={[styles.approveButtonText, { color: theme.colors.text.inverse }]}>
                        {t.buttons.approve}
                      </Text>
                    </AnimatedActionButton>

                    <AnimatedActionButton
                      isApprove={false}
                      style={[
                        styles.rejectButton,
                        {
                          backgroundColor: theme.colors.status.error,
                          shadowColor: theme.colors.status.error,
                        },
                      ]}
                      onPress={() => setShowRejectModal(true)}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.colors.text.inverse} />
                      <Text style={[styles.rejectButtonText, { color: theme.colors.text.inverse }]}>
                        {t.buttons.reject}
                      </Text>
                    </AnimatedActionButton>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        visible={showRejectModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.rejectModalContent, { backgroundColor: theme.colors.background.primary }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {t.settlement.rejectSettlement}
            </Text>
            <Text style={[styles.rejectModalSubtext, { color: theme.colors.text.secondary }]}>
              {t.settlement.rejectReasonPrompt}
            </Text>

            <View style={styles.rejectInputContainer}>
              <Text style={[styles.rejectInputLabel, { color: theme.colors.text.primary }]}>
                Reason:
              </Text>
              <TextInput
                style={[
                  styles.rejectInput,
                  {
                    borderColor: theme.colors.border.light,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.secondary,
                  },
                ]}
                placeholder={t.settlement.enterRejectionReason}
                placeholderTextColor={theme.colors.text.tertiary}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.rejectModalButtons}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    borderColor: theme.colors.border.medium,
                    backgroundColor: theme.colors.background.secondary,
                  },
                ]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text.primary }]}>
                  {t.common.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmRejectButton,
                  { backgroundColor: theme.colors.status.error },
                  !rejectionReason.trim() && styles.disabledButton,
                ]}
                onPress={handleReject}
                disabled={!rejectionReason.trim()}
              >
                <Text style={[styles.confirmRejectButtonText, { color: theme.colors.text.inverse }]}>
                  {t.settlement.confirmReject}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  activeFilterText: {
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120, // Extra space for floating tab bar + Android navigation bar
  },
  settlementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  partnerName: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardBody: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  challanPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  challanText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rejectionBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  rejectionText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  approveCardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  approveCardButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rejectCardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  rejectCardButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 18,
  },
  detailSection: {
    marginTop: 16,
  },
  notesText: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  challanImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionDetailText: {
    fontSize: 14,
    marginTop: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rejectModalContent: {
    margin: 24,
    padding: 24,
    borderRadius: 12,
  },
  rejectModalSubtext: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  rejectInputContainer: {
    marginBottom: 16,
  },
  rejectInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
  },
  rejectModalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmRejectButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmRejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
