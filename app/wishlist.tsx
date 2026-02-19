/**
 * Wishlist Screen
 * Shows all items added to wishlist with theme and translation support
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { useWishlistStore } from '../src/store/wishlistStore';
import { ScreenHeader } from '../src/components';

// Icons
const HeartFilledIcon = ({ color = '#565caa', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12084 20.84 4.61Z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrashIcon = ({ color = '#EF4444', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function WishlistScreen() {
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const wishlist = useWishlistStore((state) => state.wishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleRemoveFromWishlist = (itemId: string) => {
    removeFromWishlist(itemId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <ScreenHeader
        title={t.wishlist.title}
        subtitle={`${wishlist.length} ${t.units.items}`}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {wishlist.length === 0 ? (
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.emptyState}
          >
            <HeartFilledIcon color={theme.colors.border.medium} size={64} />
            <Text style={styles.emptyTitle}>{t.wishlist.empty_title}</Text>
            <Text style={styles.emptySubtitle}>{t.wishlist.empty_subtitle}</Text>
          </Animated.View>
        ) : (
          <View style={styles.itemsList}>
            {wishlist.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(100 + index * 50).duration(400)}
                style={styles.itemCard}
              >
                <View style={styles.itemImageContainer}>
                  <View
                    style={[
                      styles.itemImage,
                      {
                        backgroundColor:
                          index % 3 === 0
                            ? theme.colors.accent.pink
                            : index % 3 === 1
                            ? theme.colors.background.tertiary
                            : theme.colors.accent.amberLight,
                      },
                    ]}
                  >
                    <Text style={styles.itemImagePlaceholder}>📷</Text>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveFromWishlist(item.id)}
                      style={styles.removeButton}
                    >
                      <TrashIcon color={theme.colors.status.error} size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemMeta}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <Text style={styles.itemBrand}> • {item.brand}</Text>
                  </View>

                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.ratingStar}>⭐</Text>
                    <Text style={styles.reviewCount}>
                      ({item.reviews} {t.wishlist.reviews})
                    </Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <View style={styles.priceRow}>
                      <View style={styles.priceWithBadge}>
                        <Text style={styles.price}>₹{item.pricePerDay}</Text>
                        <Text style={styles.priceLabel}>{t.units.per_day}</Text>
                      </View>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{item.discount}% {t.wishlist.off}</Text>
                      </View>
                    </View>
                    <Text style={styles.originalPrice}>
                      ₹{item.originalPrice} {t.wishlist.per_day}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>{t.wishlist.add_to_cart}</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Dynamic bottom spacer for navigation bar */}
        <View style={{ height: 80 + insets.bottom }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      {wishlist.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.bottomBar}
        >
          <View style={styles.bottomBarInfo}>
            <Text style={styles.bottomBarText}>
              {wishlist.length} {t.wishlist.items_in_wishlist}
            </Text>
          </View>
          <TouchableOpacity style={styles.addAllButton}>
            <Text style={styles.addAllButtonText}>{t.wishlist.add_all_to_cart}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  itemsList: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  itemImageContainer: {
    width: '100%',
    height: 200,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholder: {
    fontSize: 80,
  },
  itemDetails: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  removeButton: {
    padding: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  itemBrand: {
    fontSize: 13,
    color: theme.colors.text.tertiary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginRight: 4,
  },
  ratingStar: {
    fontSize: 13,
  },
  reviewCount: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginLeft: 4,
  },
  priceContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceWithBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  discountBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  originalPrice: {
    fontSize: 13,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomBarInfo: {
    flex: 1,
  },
  bottomBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  addAllButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addAllButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
});
