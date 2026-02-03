/**
 * Settle Your Order Component - Redesigned (Airbnb/Apple Style)
 * Create new settlement request with modern, professional UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { paymentSettlementService, BookingOrderOption, Settlement } from '../../services/api/paymentSettlementService';

// Modern Step Indicator Component
const StepIndicator = ({ currentStep, theme, t }: { currentStep: number; theme: any; t: any }) => {
  const steps = [
    { number: 1, title: t.settlement.selectOrder, icon: 'list' },
    { number: 2, title: t.settlement.uploadChallan, icon: 'cloud-upload' },
    { number: 3, title: t.settlement.waitApproval, icon: 'time' },
    { number: 4, title: t.settlement.complete, icon: 'checkmark-circle' },
  ];

  return (
    <View style={styles.stepIndicatorContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: currentStep >= step.number
                    ? theme.colors.primary
                    : theme.colors.background.tertiary,
                },
              ]}
            >
              <Ionicons
                name={step.icon as any}
                size={20}
                color={currentStep >= step.number ? '#FFF' : theme.colors.text.tertiary}
              />
            </View>
            <Text
              style={[
                styles.stepTitle,
                {
                  color: currentStep >= step.number
                    ? theme.colors.text.primary
                    : theme.colors.text.tertiary,
                },
              ]}
            >
              {step.title}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepConnector,
                {
                  backgroundColor: currentStep > step.number
                    ? theme.colors.primary
                    : theme.colors.border.light,
                },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

// Modern Order Card Component (Fixed Reanimated warning)
const OrderCard = ({ order, isSelected, onPress, theme, t }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const ownerDisplay = order.owner_company
    ? `${order.owner_company}`
    : order.owner_name;

  return (
    <View>
      <Animated.View entering={FadeInDown.duration(300)}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={[
              styles.orderCard,
              {
                backgroundColor: theme.colors.background.primary,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border.light,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              </View>
            )}

            <View style={styles.orderCardHeader}>
              <View style={styles.orderCardLeft}>
                <Text style={[styles.orderCardTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                  {order.order_name || t.settlement.order}
                </Text>
                <Text style={[styles.orderCardSubtitle, { color: theme.colors.text.secondary }]}>
                  {ownerDisplay}
                </Text>
              </View>
              <View style={[styles.orderCardAmountBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={[styles.orderCardAmount, { color: theme.colors.primary }]}>
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View style={styles.orderCardDetails}>
              {order.rental_start_date && order.rental_end_date && (
                <View style={styles.orderDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.text.tertiary} />
                  <Text style={[styles.orderDetailText, { color: theme.colors.text.secondary }]}>
                    {new Date(order.rental_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(order.rental_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              )}
              {(order.sku_items_count || order.crew_items_count) && (
                <View style={styles.orderDetailItem}>
                  <Ionicons name="cube-outline" size={14} color={theme.colors.text.tertiary} />
                  <Text style={[styles.orderDetailText, { color: theme.colors.text.secondary }]}>
                    {order.sku_items_count ? `${order.sku_items_count} ${t.settlement.equipment}` : ''}
                    {order.crew_items_count ? `${order.crew_items_count} ${t.settlement.crew}` : ''}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// Settlement Request Card Component (Fixed Reanimated warning)
const SettlementRequestCard = ({ settlement, onPress, theme, t }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.colors.status.success;
      case 'rejected': return theme.colors.status.error;
      case 'pending': return theme.colors.status.warning;
      default: return theme.colors.text.tertiary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View>
      <Animated.View entering={FadeInDown.duration(300)}>
        <TouchableOpacity
          style={[styles.settlementRequestCard, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.settlementRequestHeader}>
            <View style={styles.settlementRequestLeft}>
              <Text style={[styles.settlementRequestTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                {settlement.order_name || t.settlement.settlementRequest}
              </Text>
              <Text style={[styles.settlementRequestOwner, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                {settlement.owner_company
                  ? `${settlement.owner_company} (${settlement.owner_name})`
                  : settlement.owner_name}
              </Text>
            </View>
            <View style={[styles.settlementRequestStatus, { backgroundColor: getStatusColor(settlement.status) + '20' }]}>
              <Text style={[styles.settlementRequestStatusText, { color: getStatusColor(settlement.status) }]}>
                {getStatusLabel(settlement.status)}
              </Text>
            </View>
          </View>

          <View style={styles.settlementRequestBody}>
            <View style={styles.settlementRequestRow}>
              <Text style={[styles.settlementRequestLabel, { color: theme.colors.text.secondary }]}>Amount</Text>
              <Text style={[styles.settlementRequestValue, { color: theme.colors.text.primary }]}>₹{Number(settlement.amount).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.settlementRequestRow}>
              <Text style={[styles.settlementRequestLabel, { color: theme.colors.text.secondary }]}>Created</Text>
              <Text style={[styles.settlementRequestValue, { color: theme.colors.text.primary }]}>
                {new Date(settlement.created_at).toLocaleDateString('en-IN')}
              </Text>
            </View>
            {settlement.challan_image_url && (
              <View style={styles.settlementRequestRow}>
                <Ionicons name="document-attach" size={16} color={theme.colors.status.success} />
                <Text style={[styles.settlementRequestChallan, { color: theme.colors.status.success }]}>Challan Uploaded</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function SettleYourOrder() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<BookingOrderOption[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [challanFile, setChallanFile] = useState<any>(null);
  const [settlementId, setSettlementId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // My Requests state
  const [myRequests, setMyRequests] = useState<Settlement[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadAvailableOrders();
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      const response = await paymentSettlementService.getMySettlementRequests();
      if (response.success && response.data) {
        // Show all settlements (pending, approved, rejected) so vendors can see rejection status
        setMyRequests(response.data.settlements);
      }
    } catch {
      // Failed to load requests - not critical
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadAvailableOrders(), loadMyRequests()]);
    setRefreshing(false);
  }, []);

  const loadAvailableOrders = async () => {
    setLoading(true);
    try {
      const response = await paymentSettlementService.getAvailableOrders();
      if (response.success && response.data) {
        setOrders(response.data.orders);
      } else {
        Alert.alert(t.common.error, response.error || t.settlement.failedToLoadOrders);
      }
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.settlement.failedToLoadOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async () => {
    if (!selectedOrderId) {
      Alert.alert(t.common.error, t.settlement.pleaseSelectOrder);
      return;
    }

    setLoading(true);
    try {
      const response = await paymentSettlementService.createSettlement({
        vendor_booking_id: selectedOrderId,
        notes: notes.trim() || undefined,
      });

      if (response.success && response.data) {
        setSettlementId(response.data.settlement_id);
        setStep(2);
        Alert.alert(t.common.success, t.settlement.settlementCreatedSuccess);
      } else {
        const errorMsg = response.error || t.settlement.failedToCreateSettlement;
        if (errorMsg.includes('pending settlement') || errorMsg.includes('already exists')) {
          Alert.alert(
            t.settlement.settlementAlreadyExists,
            t.settlement.settlementAlreadyExistsMessage,
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          Alert.alert(t.common.error, errorMsg);
        }
      }
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.settlement.failedToCreateSettlement);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.settlement.permissionDenied, t.settlement.cameraRollPermissionNeeded);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setChallanFile({
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `challan_${Date.now()}.jpg`,
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (result.assets && result.assets[0]) {
      setChallanFile({
        uri: result.assets[0].uri,
        type: result.assets[0].mimeType || 'application/pdf',
        name: result.assets[0].name,
      });
    }
  };

  const handleUploadChallan = async () => {
    if (!settlementId || !challanFile) {
      Alert.alert(t.common.error, t.settlement.pleaseSelectChallanFile);
      return;
    }

    setLoading(true);
    try {
      const response = await paymentSettlementService.uploadChallan(settlementId, challanFile);

      if (response.success) {
        setStep(3);
        Alert.alert(t.common.success, t.settlement.challanUploadedSuccess);
      } else {
        Alert.alert(t.common.error, response.error || t.settlement.failedToUploadChallan);
      }
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.settlement.failedToUploadChallan);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedOrderId('');
    setNotes('');
    setChallanFile(null);
    setSettlementId(null);
    setStep(1);
    loadAvailableOrders();
    loadMyRequests();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.colors.status.success;
      case 'rejected': return theme.colors.status.error;
      case 'pending': return theme.colors.status.warning;
      default: return theme.colors.text.tertiary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  orders.find(o => o.vendor_booking_id === selectedOrderId);

  // Loading screen
  if (loading && orders.length === 0 && step === 1) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.secondary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>{t.settlement.loadingAvailableOrders}</Text>
      </View>
    );
  }

  // Success screen
  if (step === 3) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
        contentContainerStyle={styles.scrollContent}
      >
        <StepIndicator currentStep={4} theme={theme} t={t} />

        <Animated.View entering={FadeIn.duration(400)} style={styles.successContainer}>
          <LinearGradient
            colors={[theme.colors.status.success + '15', theme.colors.status.success + '05']}
            style={styles.successIcon}
          >
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.status.success} />
          </LinearGradient>
          <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>Request Submitted Successfully!</Text>
          <Text style={[styles.successMessage, { color: theme.colors.text.secondary }]}>
            Your settlement request has been sent. It's now waiting for the equipment owner's approval. You'll be notified once it's reviewed.
          </Text>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={resetForm}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Create Another Request</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    );
  }

  // Upload Challan screen
  if (step === 2) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
        contentContainerStyle={styles.scrollContent}
      >
        <StepIndicator currentStep={2} theme={theme} t={t} />

        <View>
          <Animated.View entering={FadeInDown.duration(300)} style={[styles.section, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Upload Payment Challan</Text>
            </View>
            <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
              Upload proof of payment (Image or PDF)
            </Text>

            {challanFile ? (
              <View style={styles.filePreviewContainer}>
                {challanFile.type.startsWith('image/') ? (
                  <Image source={{ uri: challanFile.uri }} style={styles.imagePreview} />
                ) : (
                  <View style={[styles.pdfPreview, { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary }]}>
                    <Ionicons name="document-text" size={48} color={theme.colors.primary} />
                    <Text style={[styles.fileName, { color: theme.colors.text.primary }]}>{challanFile.name}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.removeFileButton, { backgroundColor: theme.colors.background.primary }]}
                  onPress={() => setChallanFile(null)}
                >
                  <Ionicons name="close-circle" size={28} color={theme.colors.status.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadArea}>
                <TouchableOpacity style={[styles.uploadOption, { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary }]} onPress={pickImage}>
                  <LinearGradient
                    colors={[theme.colors.primary + '15', theme.colors.primary + '05']}
                    style={styles.uploadIconContainer}
                  >
                    <Ionicons name="camera" size={32} color={theme.colors.primary} />
                  </LinearGradient>
                  <Text style={[styles.uploadOptionTitle, { color: theme.colors.text.primary }]}>{t.settlement.chooseImage}</Text>
                  <Text style={[styles.uploadOptionDescription, { color: theme.colors.text.tertiary }]}>{t.settlement.fromGallery}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.uploadOption, { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary }]} onPress={pickDocument}>
                  <LinearGradient
                    colors={[theme.colors.primary + '15', theme.colors.primary + '05']}
                    style={styles.uploadIconContainer}
                  >
                    <Ionicons name="document" size={32} color={theme.colors.primary} />
                  </LinearGradient>
                  <Text style={[styles.uploadOptionTitle, { color: theme.colors.text.primary }]}>{t.settlement.choosePDF}</Text>
                  <Text style={[styles.uploadOptionDescription, { color: theme.colors.text.tertiary }]}>{t.settlement.fromFiles}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: challanFile ? theme.colors.primary : theme.colors.border.medium },
                !challanFile && styles.disabledButton,
              ]}
              onPress={handleUploadChallan}
              disabled={loading || !challanFile}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>{t.settlement.uploadChallanButton}</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    );
  }

  // Step 1: Select Order screen
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
    >
      <StepIndicator currentStep={1} theme={theme} t={t} />

      {/* Select Order Section */}
      <View>
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={[styles.section, { backgroundColor: theme.colors.background.primary }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t.settlement.selectOrder}</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
            {t.settlement.chooseCompletedOrder}
          </Text>

          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={[theme.colors.text.tertiary + '15', theme.colors.text.tertiary + '05']}
                style={styles.emptyIcon}
              >
                <Ionicons name="receipt-outline" size={48} color={theme.colors.text.tertiary} />
              </LinearGradient>
              <Text style={[styles.emptyStateText, { color: theme.colors.text.primary }]}>{t.settlement.noOrdersAvailable}</Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.tertiary }]}>
                {t.settlement.completeOrderToSettle}
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order) => (
                <OrderCard
                  key={order.vendor_booking_id}
                  order={order}
                  isSelected={selectedOrderId === order.vendor_booking_id}
                  onPress={() => setSelectedOrderId(order.vendor_booking_id)}
                  theme={theme}
                  t={t}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Notes Section */}
      {orders.length > 0 && (
        <View>
          <Animated.View entering={FadeInDown.delay(200).duration(300)} style={[styles.section, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t.settlement.addNotesOptional}</Text>
            </View>
            <TextInput
              style={[styles.notesInput, { borderColor: theme.colors.border.light, color: theme.colors.text.primary, backgroundColor: theme.colors.background.secondary }]}
              placeholder={t.settlement.addNotesPlaceholder}
              placeholderTextColor={theme.colors.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Animated.View>
        </View>
      )}

      {/* Create Button */}
      {orders.length > 0 && (
        <View>
          <Animated.View entering={FadeInDown.delay(300).duration(300)}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: selectedOrderId ? theme.colors.primary : theme.colors.border.medium },
                !selectedOrderId && styles.disabledButton,
              ]}
              onPress={handleCreateSettlement}
              disabled={loading || !selectedOrderId}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>{t.settlement.createSettlementRequest}</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* My Requests Section */}
      <View>
        <Animated.View entering={FadeInDown.delay(400).duration(300)} style={[styles.section, { backgroundColor: theme.colors.background.primary, marginTop:20 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t.settlement.myRequests}</Text>
            {myRequests.length > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>{myRequests.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
            {t.settlement.pendingSettlementRequests}
          </Text>

          {myRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={[theme.colors.text.tertiary + '15', theme.colors.text.tertiary + '05']}
                style={styles.emptyIcon}
              >
                <Ionicons name="document-text-outline" size={48} color={theme.colors.text.tertiary} />
              </LinearGradient>
              <Text style={[styles.emptyStateText, { color: theme.colors.text.primary }]}>{t.settlement.noSettlementRequestsYet}</Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.tertiary }]}>
                {t.settlement.createSettlementRequestAbove}
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {myRequests.map((settlement) => (
                <SettlementRequestCard
                  key={settlement.settlement_id}
                  settlement={settlement}
                  onPress={() => {
                    setSelectedSettlement(settlement);
                    setShowDetailModal(true);
                  }}
                  theme={theme}
                  t={t}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View>
            <Animated.View entering={FadeInDown.duration(300)} style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border.light }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Settlement Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              {selectedSettlement && (
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Order</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{selectedSettlement.order_name || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Owner</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                      {selectedSettlement.owner_company
                        ? `${selectedSettlement.owner_company} (${selectedSettlement.owner_name})`
                        : selectedSettlement.owner_name}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Amount</Text>
                    <Text style={[styles.detailValue, styles.detailValueHighlight, { color: theme.colors.primary }]}>₹{Number(selectedSettlement.amount).toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Status</Text>
                    <View style={[styles.detailStatusBadge, { backgroundColor: getStatusBadgeColor(selectedSettlement.status) + '20' }]}>
                      <Text style={[styles.detailStatusText, { color: getStatusBadgeColor(selectedSettlement.status) }]}>{getStatusLabel(selectedSettlement.status)}</Text>
                    </View>
                  </View>

                  {selectedSettlement.rental_start_date && selectedSettlement.rental_end_date && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Rental Period</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                        {new Date(selectedSettlement.rental_start_date).toLocaleDateString('en-IN')} - {new Date(selectedSettlement.rental_end_date).toLocaleDateString('en-IN')}
                        {selectedSettlement.total_rental_days && ` (${selectedSettlement.total_rental_days} days)`}
                      </Text>
                    </View>
                  )}

                  {(selectedSettlement.sku_items_count || selectedSettlement.crew_items_count) && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Items</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                        {selectedSettlement.sku_items_count ? `${selectedSettlement.sku_items_count} Equipment` : ''}
                        {selectedSettlement.sku_items_count && selectedSettlement.crew_items_count && ', '}
                        {selectedSettlement.crew_items_count ? `${selectedSettlement.crew_items_count} Crew` : ''}
                      </Text>
                    </View>
                  )}

                  {selectedSettlement.notes && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Notes</Text>
                      <Text style={[styles.detailSectionContent, { color: theme.colors.text.primary }]}>{selectedSettlement.notes}</Text>
                    </View>
                  )}

                  {selectedSettlement.challan_image_url && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Challan</Text>
                      <Image source={{ uri: selectedSettlement.challan_image_url }} style={styles.challanImage} />
                    </View>
                  )}

                  {selectedSettlement.status === 'rejected' && selectedSettlement.rejection_reason && (
                    <View style={[styles.rejectionBox, { backgroundColor: theme.colors.status.error + '10' }]}>
                      <Text style={[styles.rejectionLabel, { color: theme.colors.status.error }]}>Rejection Reason</Text>
                      <Text style={[styles.rejectionText, { color: theme.colors.text.primary }]}>{selectedSettlement.rejection_reason}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Created</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                      {new Date(selectedSettlement.created_at).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {selectedSettlement.reviewed_at && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Reviewed</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                        {new Date(selectedSettlement.reviewed_at).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </Animated.View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for floating tab bar + Android navigation bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },

  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginBottom: 32,
  },

  // Section
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },

  // Order Card
  ordersList: {
    gap: 12,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 20,
    padding: 4,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderCardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderCardAmountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderCardAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  orderCardDetails: {
    gap: 8,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderDetailText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Notes Input
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Primary Button
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Upload Area
  uploadArea: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadOption: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadOptionDescription: {
    fontSize: 12,
  },

  // File Preview
  filePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  pdfPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  removeFileButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Success Container
  successContainer: {
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  // Settlement Request Card
  requestsList: {
    gap: 12,
  },
  settlementRequestCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settlementRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  settlementRequestLeft: {
    flex: 1,
    marginRight: 12,
  },
  settlementRequestTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  settlementRequestOwner: {
    fontSize: 13,
    fontWeight: '500',
  },
  settlementRequestStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settlementRequestStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  settlementRequestBody: {
    gap: 6,
  },
  settlementRequestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settlementRequestLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  settlementRequestValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  settlementRequestChallan: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailValueHighlight: {
    fontSize: 18,
  },
  detailStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailSectionContent: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  challanImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: 'contain',
    backgroundColor: '#F3F4F6',
  },
  rejectionBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  rejectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  rejectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
