/**
 * Product Selection Screen
 * Allows vendors to select products with left sidebar categories, wishlist, and floating bottom bar
 */

import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlistStore } from '../src/store/wishlistStore';
import { useOrderStore } from '../src/store/orderStore';
import { productService, SKU, Category, Brand, Subcategory } from '../src/services/api';
import { useTranslation } from '../src/context/LanguageContext';
import { scaleWidth, scaleHeight, spacing, fontSize } from '../src/utils/responsive';
import {
  HeartIcon,
  ChevronDownIcon,
  getCategoryIconComponent,
  EmptyState,
  PackageIcon,
  SearchBar,
  SuccessModal,
  Skeleton,
} from '../src/components';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../src/context/ThemeContext';

// Modern SVG Icons
const ShoppingBagIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronLeftIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Memoized Product Card Component for Performance
interface ProductCardProps {
  product: SKU;
  cardWidth: number;
  selectedQuantity: number;
  isWishlisted: boolean;
  appTheme: any;
  styles: any;
  onAddProduct: (productId: string) => void;
  onRemoveProduct: (productId: string) => void;
  onToggleWishlist: (product: SKU) => void;
}

const ProductCard = memo<ProductCardProps>(({
  product,
  cardWidth,
  selectedQuantity,
  isWishlisted,
  appTheme,
  styles,
  onAddProduct,
  onRemoveProduct,
  onToggleWishlist,
}) => {
  const pricePerDay = typeof product.price_per_day === 'number'
    ? product.price_per_day
    : parseFloat(product.price_per_day);

  const avgRating = typeof product.avg_rating === 'number'
    ? product.avg_rating.toFixed(1)
    : parseFloat(product.avg_rating || '0').toFixed(1);

  return (
    <View style={[styles.productCard, { width: cardWidth }]}>
      <View style={styles.productImageContainer}>
        {product.primary_image_url ? (
          <View style={styles.productImage}>
            <Image
              source={{ uri: product.primary_image_url }}
              style={styles.productImageActual}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={[styles.productImage, { backgroundColor: appTheme.colors.background.tertiary }]}>
            <Text style={styles.productImagePlaceholder}>📷</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.favoriteIcon, { backgroundColor: appTheme.colors.background.primary }]}
          onPress={() => onToggleWishlist(product)}
        >
          <HeartIcon
            filled={isWishlisted}
            color={appTheme.colors.primary}
            size={18}
          />
        </TouchableOpacity>
        {/* Discount Badge on Image */}
        <View style={styles.imageDiscountBadge}>
          <Text style={styles.imageDiscountText}>15% OFF</Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Compact Rating */}
        <View style={styles.compactRatingContainer}>
          <Text style={styles.compactRatingText}>⭐ {avgRating}</Text>
          <Text style={styles.compactReviewCount}>({product.review_count})</Text>
        </View>

        {/* Simplified Price */}
        <View style={styles.simplifiedPriceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{pricePerDay}</Text>
            <Text style={styles.priceLabel}>/day</Text>
          </View>
          <Text style={styles.originalPrice}>₹{Math.round(pricePerDay * 1.15)}</Text>
        </View>

        {/* Compact Add Button */}
        {selectedQuantity > 0 ? (
          <View style={styles.compactQuantityControl}>
            <TouchableOpacity
              style={styles.compactQuantityButton}
              onPress={() => onRemoveProduct(product.sku_id)}
            >
              <Text style={styles.compactQuantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.compactQuantityText}>{selectedQuantity}</Text>
            <TouchableOpacity
              style={styles.compactQuantityButton}
              onPress={() => onAddProduct(product.sku_id)}
            >
              <Text style={styles.compactQuantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.compactAddButton}
            onPress={() => onAddProduct(product.sku_id)}
          >
            <Text style={styles.compactAddButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

ProductCard.displayName = 'ProductCard';

export default function ProductSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const { theme: appTheme, themeMode } = useTheme();
  const insets = useSafeAreaInsets();

  const orderName = params.orderName as string || t.ownerSelection.new_order;

  // Wishlist store
  const wishlist = useWishlistStore((state) => state.wishlist);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);

  // Order store
  const addProduct = useOrderStore((state) => state.addProduct);
  const removeProduct = useOrderStore((state) => state.removeProduct);
  const updateProductQuantity = useOrderStore((state) => state.updateProductQuantity);

  // State for API data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<SKU[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [isCategorySidebarCollapsed, setIsCategorySidebarCollapsed] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate product card width dynamically
  // Create dynamic styles based on current theme
  const styles = createStyles(appTheme);

  const getProductCardWidth = () => {
    const sidebarWidth = isCategorySidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
    const containerPadding = (spacing.xs + 4) * 2; // paddingHorizontal
    const cardMargins = (spacing.xs + 2) * 4; // marginHorizontal for 2 cards
    const availableWidth = SCREEN_WIDTH - sidebarWidth - containerPadding - cardMargins;
    return availableWidth / 2;
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const PRODUCTS_PER_PAGE = 10;

  // Modal states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch categories and brands on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories and brands in parallel
        const [categoriesResponse, brandsResponse] = await Promise.all([
          productService.getCategories({ is_active: true, limit: 50 }),
          productService.getBrands({ is_active: true, limit: 100 }),
        ]);

        setCategories(categoriesResponse.data);

        // Deduplicate brands by name (keep first occurrence)
        const uniqueBrands = brandsResponse.data.filter((brand, index, self) =>
          index === self.findIndex((b) => b.name === brand.name)
        );
        setBrands(uniqueBrands);

        // Set first category as selected (use string ID, not UUID)
        if (categoriesResponse.data.length > 0) {
          setSelectedCategory(categoriesResponse.data[0].id); // This is the string ID like "cameras"
        }
      } catch (error: any) {
        setErrorMessage('Failed to load categories and brands. Please try again.');
        setShowError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) return;

      try {
        const response = await productService.getSubcategories({
          category_id: selectedCategory,
          is_active: true,
          limit: 50,
        });

        setSubcategories(response.data);
        setSelectedSubcategory('All'); // Reset subcategory when category changes
      } catch (error: any) {
        // Error fetching subcategories - not critical
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // Fetch products when category, subcategory, or brand changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategory) return;

      try {
        setIsLoadingProducts(true);
        setCurrentPage(1);

        const response = await productService.searchSKUs({
          category_id: selectedCategory,
          subcategory_id: selectedSubcategory !== 'All' ? selectedSubcategory : undefined,
          brand: selectedBrand !== 'All' ? selectedBrand : undefined,
          is_active: true,
          page: 1,
          limit: PRODUCTS_PER_PAGE,
          sort: 'relevance',
        });

        setProducts(response.data);
        setHasMoreProducts(response.data.length === PRODUCTS_PER_PAGE);
      } catch (error: any) {
        setErrorMessage('Failed to load products. Please try again.');
        setShowError(true);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedBrand]);

  // Load more products (pagination)
  const loadMoreProducts = async () => {
    if (!hasMoreProducts || isLoadingMore || isLoadingProducts) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      const response = await productService.searchSKUs({
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory !== 'All' ? selectedSubcategory : undefined,
        brand: selectedBrand !== 'All' ? selectedBrand : undefined,
        is_active: true,
        page: nextPage,
        limit: PRODUCTS_PER_PAGE,
        sort: 'relevance',
      });

      if (response.data.length > 0) {
        setProducts((prev) => [...prev, ...response.data]);
        setCurrentPage(nextPage);
        setHasMoreProducts(response.data.length === PRODUCTS_PER_PAGE);
      } else {
        setHasMoreProducts(false);
      }
    } catch (error: any) {
      // Error loading more products - not critical
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAddProduct = useCallback((productId: string) => {
    const product = products.find(p => p.sku_id === productId);
    if (!product) return;

    const currentQuantity = selectedProducts[productId] || 0;
    const newQuantity = currentQuantity + 1;

    // Update local state
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));

    // Update order store
    if (currentQuantity === 0) {
      // First time adding this product
      addProduct({
        id: product.sku_id,
        name: product.name,
        category: product.category_id,
        brand: product.brand,
        pricePerDay: typeof product.price_per_day === 'number'
          ? product.price_per_day
          : parseFloat(product.price_per_day),
      });
    } else {
      // Update existing product quantity
      updateProductQuantity(productId, newQuantity);
    }
  }, [products, selectedProducts, addProduct, updateProductQuantity]);

  const handleRemoveProduct = useCallback((productId: string) => {
    const currentQuantity = selectedProducts[productId] || 0;
    const newQuantity = currentQuantity - 1;

    if (newQuantity <= 0) {
      // Remove from local state
      setSelectedProducts((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
      // Remove from order store
      removeProduct(productId);
    } else {
      // Update local state
      setSelectedProducts((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));
      // Update order store
      updateProductQuantity(productId, newQuantity);
    }
  }, [selectedProducts, removeProduct, updateProductQuantity]);

  const toggleWishlist = useCallback((product: SKU) => {
    if (isInWishlist(product.sku_id)) {
      removeFromWishlist(product.sku_id);
    } else {
      const pricePerDay = typeof product.price_per_day === 'number'
        ? product.price_per_day
        : parseFloat(product.price_per_day);
      const avgRating = typeof product.avg_rating === 'number'
        ? product.avg_rating
        : parseFloat(product.avg_rating || '0');

      addToWishlist({
        id: product.sku_id,
        name: product.name,
        category: product.category_id,
        brand: product.brand,
        rating: avgRating,
        reviews: product.review_count,
        pricePerDay: pricePerDay,
        originalPrice: pricePerDay * 1.15, // Calculate original price assuming 15% discount
        discount: 15,
      });
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  const getTotalItems = () => {
    return Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0);
  };

  const handleProceed = () => {
    // Navigate to date selection screen
    router.push({
      pathname: '/date-selection',
      params: {
        orderName: orderName || t.ownerSelection.new_order,
      },
    });
  };

  const handleWishlistPress = () => {
    router.push('/wishlist');
  };

  // Filter products by search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category_id.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={appTheme.colors.primary}
      />

      {/* Header */}
      <LinearGradient
        colors={[appTheme.colors.primary, '#4B4F8C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: `rgba(255, 255, 255, ${themeMode === 'dark' ? '0.25' : '0.15'})` }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeftIcon color={appTheme.colors.text.inverse} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ShoppingBagIcon color={appTheme.colors.text.inverse} size={24} />
          <Text style={[styles.headerTitle, { color: appTheme.colors.text.inverse }]} numberOfLines={1}>{orderName}</Text>
        </View>
        <TouchableOpacity style={[styles.wishlistButton, { backgroundColor: `rgba(255, 255, 255, ${themeMode === 'dark' ? '0.25' : '0.15'})` }]} onPress={handleWishlistPress}>
          <HeartIcon color={appTheme.colors.text.inverse} size={24} />
          {wishlist.length > 0 && (
            <View style={styles.wishlistBadge}>
              <Text style={styles.wishlistBadgeText}>{wishlist.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: appTheme.colors.background.secondary }]}>
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <SearchBar
            placeholder={t.products.searchProducts}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>
      </View>

      <View style={styles.content}>
        {/* Left Sidebar - Categories */}
        <View style={[styles.sidebar, isCategorySidebarCollapsed && styles.sidebarCollapsed]}>
          <TouchableOpacity
            style={styles.sidebarToggle}
            onPress={() => setIsCategorySidebarCollapsed(!isCategorySidebarCollapsed)}
          >
            <View style={[styles.toggleIcon, isCategorySidebarCollapsed && styles.toggleIconCollapsed]}>
              <ChevronDownIcon color={appTheme.colors.text.secondary} size={16} />
            </View>
          </TouchableOpacity>

          {!isCategorySidebarCollapsed && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryList}>
              {isLoading ? (
                <View style={{ padding: 12 }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} style={{ marginBottom: 12, alignItems: 'center' }}>
                      <Skeleton width={56} height={56} borderRadius={16} style={{ marginBottom: 8 }} />
                      <Skeleton width={60} height={12} borderRadius={4} />
                    </View>
                  ))}
                </View>
              ) : (
                categories.map((category) => {
                  const CategoryIconComponent = getCategoryIconComponent(category.name);
                  return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.id && styles.categoryItemActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <View style={[
                      styles.categoryIconContainer,
                      selectedCategory === category.id && { backgroundColor: `rgba(255, 255, 255, ${themeMode === 'dark' ? '0.3' : '0.2'})` },
                    ]}>
                      <CategoryIconComponent
                        size={24}
                        color={selectedCategory === category.id ? appTheme.colors.text.inverse : appTheme.colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === category.id && styles.categoryLabelActive,
                      ]}
                      numberOfLines={2}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}

          {isCategorySidebarCollapsed && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryListCollapsed}>
              {isLoading ? (
                <View style={{ padding: 12 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={{ marginBottom: 16, alignItems: 'center' }}>
                      <Skeleton width={40} height={40} borderRadius={12} />
                    </View>
                  ))}
                </View>
              ) : (
                categories.map((category) => {
                  const CategoryIconComponent = getCategoryIconComponent(category.name);
                  return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItemCollapsed,
                      selectedCategory === category.id && styles.categoryItemCollapsedActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <CategoryIconComponent
                      size={28}
                      color={selectedCategory === category.id ? appTheme.colors.text.inverse : appTheme.colors.primary}
                    />
                  </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const paddingToBottom = 100;
              if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                loadMoreProducts();
              }
            }}
            onMomentumScrollEnd={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const paddingToBottom = 100;
              if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                loadMoreProducts();
              }
            }}
            scrollEventThrottle={16}
          >
            {/* Brand Filter */}
            <View style={styles.filterSection}>
              {/* <View style={styles.filterHeader}>
                <FilterIcon color={theme.colors.text.secondary} size={18} />
                <Text style={styles.filterTitle}>Brand</Text>
              </View> */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  key="All"
                  style={[
                    styles.brandChip,
                    selectedBrand === 'All' && styles.brandChipActive,
                  ]}
                  onPress={() => setSelectedBrand('All')}
                >
                  <Text
                    style={[
                      styles.brandChipText,
                      selectedBrand === 'All' && styles.brandChipTextActive,
                    ]}
                  >
                    {t.products.allBrands}
                  </Text>
                </TouchableOpacity>
                {brands.map((brand, index) => (
                  <TouchableOpacity
                    key={`${brand.id}-${brand.name}-${index}`}
                    style={[
                      styles.brandChip,
                      selectedBrand === brand.name && styles.brandChipActive,
                    ]}
                    onPress={() => setSelectedBrand(brand.name)}
                  >
                    {brand.image_url && (
                      <Image
                        source={{ uri: brand.image_url }}
                        style={styles.brandLogo}
                        resizeMode="contain"
                      />
                    )}
                    <Text
                      style={[
                        styles.brandChipText,
                        selectedBrand === brand.name && styles.brandChipTextActive,
                      ]}
                    >
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Subcategory Filters */}
            {subcategories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subCategoryScroll}
              >
                <TouchableOpacity
                  key="All"
                  style={[
                    styles.subCategoryChip,
                    selectedSubcategory === 'All' && styles.subCategoryChipActive,
                  ]}
                  onPress={() => setSelectedSubcategory('All')}
                >
                  <Text
                    style={[
                      styles.subCategoryText,
                      selectedSubcategory === 'All' && styles.subCategoryTextActive,
                    ]}
                  >
                    {t.products.allBrands}
                  </Text>
                </TouchableOpacity>
                {subcategories.map((subcat) => (
                  <TouchableOpacity
                    key={subcat.id}
                    style={[
                      styles.subCategoryChip,
                      selectedSubcategory === subcat.id && styles.subCategoryChipActive,
                    ]}
                    onPress={() => setSelectedSubcategory(subcat.id)}
                  >
                    <Text
                      style={[
                        styles.subCategoryText,
                        selectedSubcategory === subcat.id && styles.subCategoryTextActive,
                      ]}
                    >
                      {subcat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Products Grid - 2 columns */}
            {isLoadingProducts ? (
              <View style={styles.productsContainer}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View key={i} style={[styles.productCard, { width: getProductCardWidth() }]}>
                    {/* Image Skeleton */}
                    <Skeleton width={getProductCardWidth() - 24} height={getProductCardWidth() - 24} borderRadius={12} style={{ marginBottom: 12 }} />

                    <View style={styles.productInfo}>
                      {/* Product Name Skeleton */}
                      <Skeleton width="90%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
                      <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />

                      {/* Rating Skeleton */}
                      <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 8 }} />

                      {/* Price Skeleton */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Skeleton width={60} height={20} borderRadius={4} style={{ marginRight: 8 }} />
                        <Skeleton width={50} height={16} borderRadius={4} />
                      </View>

                      {/* Add Button Skeleton */}
                      <Skeleton width={40} height={40} borderRadius={20} />
                    </View>
                  </View>
                ))}
              </View>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={<PackageIcon color={appTheme.colors.text.tertiary} size={48} />}
                title={searchQuery ? t.products.noProducts : t.products.noProductsAvailable}
                description={searchQuery ? t.products.tryAdjustingSearch : t.products.noProducts}
              />
            ) : (
              <View style={styles.productsContainer}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.sku_id}
                    product={product}
                    cardWidth={getProductCardWidth()}
                    selectedQuantity={selectedProducts[product.sku_id] || 0}
                    isWishlisted={isInWishlist(product.sku_id)}
                    appTheme={appTheme}
                    styles={styles}
                    onAddProduct={handleAddProduct}
                    onRemoveProduct={handleRemoveProduct}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}

                {/* Load more indicator */}
                {isLoadingMore && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={appTheme.colors.primary} />
                    <Text style={{ marginTop: 8, color: appTheme.colors.text.secondary, fontSize: 14 }}>
                      {t.products.loadingMore}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Dynamic bottom spacer for floating bar + navigation bar */}
            <View style={{ height: 120 + insets.bottom }} />
          </ScrollView>
        </View>
      </View>

      {/* Floating Bottom Action Bar */}
      {getTotalItems() > 0 && (
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ position: 'absolute', bottom: scaleHeight(20) + insets.bottom, left: '10%', right: '10%' }}>
          <View style={styles.floatingBottomBar}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.selectedProductsPreview}>
                {/* Show avatars of selected products */}
                <View style={styles.productAvatars}>
                  {Object.keys(selectedProducts).slice(0, 3).map((productId, index) => (
                    <View
                      key={productId}
                      style={[
                        styles.productAvatar,
                        {
                          zIndex: 10 - index,
                          marginLeft: index > 0 ? -12 : 0,
                        }
                      ]}
                    >
                      <Text style={styles.productAvatarText}>📷</Text>
                    </View>
                  ))}
                  {Object.keys(selectedProducts).length > 3 && (
                    <View style={[styles.productAvatar, styles.productAvatarMore, { marginLeft: -12 }]}>
                      <Text style={styles.productAvatarMoreText}>+{Object.keys(selectedProducts).length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity onPress={handleProceed} activeOpacity={0.9}>
                <LinearGradient
                  colors={[appTheme.colors.primary, '#4B4F8C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.selectDateButton}
                >
                  <Text style={[styles.selectDateText, { color: appTheme.colors.text.inverse }]}>{t.products.selectDate}</Text>
                  <Text style={[styles.selectDateArrow, { color: appTheme.colors.text.inverse }]}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Modals */}
      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
        icon="error"
        primaryButtonText="OK"
      />
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH_EXPANDED = scaleWidth(90);
const SIDEBAR_WIDTH_COLLAPSED = scaleWidth(50);

// Create styles function that accepts theme
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  wishlistButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wishlistBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.accent.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  wishlistBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: scaleWidth(90),
    backgroundColor: theme.colors.background.secondary,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.light,
    paddingTop: spacing.xs + 4,
  },
  sidebarCollapsed: {
    width: scaleWidth(50),
  },
  sidebarToggle: {
    alignItems: 'center',
    paddingVertical: spacing.xs + 4,
  },
  toggleIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  toggleIconCollapsed: {
    transform: [{ rotate: '90deg' }],
  },
  categoryList: {
    flex: 1,
  },
  categoryListCollapsed: {
    flex: 1,
  },
  categoryItem: {
    padding: spacing.sm + 4,
    marginBottom: 4,
    alignItems: 'center',
    borderRadius: scaleWidth(12),
    marginHorizontal: spacing.xs + 4,
  },
  categoryItemActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryIconContainer: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(10),
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  categoryItemCollapsed: {
    padding: spacing.xs + 2,
    marginBottom: spacing.xs + 4,
    alignItems: 'center',
    borderRadius: scaleWidth(12),
    marginHorizontal: spacing.xs,
  },
  categoryItemCollapsedActive: {
    backgroundColor: theme.colors.primary,
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaleHeight(120),
  },
  filterSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  filterTitle: {
    fontSize: fontSize.sm + 1,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginLeft: spacing.xs + 2,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: scaleWidth(18),
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    marginRight: spacing.xs + 4,
    backgroundColor: theme.colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  brandChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowOpacity: 0.15,
  },
  brandLogo: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    marginRight: spacing.xs + 2,
    borderRadius: scaleWidth(10),
  },
  brandChipText: {
    fontSize: fontSize.sm + 1,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  brandChipTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  subCategoryScroll: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm + 4,
  },
  subCategoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 4,
    borderRadius: scaleWidth(14),
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    marginRight: spacing.xs + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  subCategoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowOpacity: 0.15,
  },
  subCategoryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  subCategoryTextActive: {
    color: theme.colors.text.inverse,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xs + 4,
  },
  productCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: scaleWidth(16),
    marginHorizontal: spacing.xs + 2,
    marginBottom: spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: scaleHeight(100),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: scaleWidth(16),
    borderTopRightRadius: scaleWidth(16),
  },
  productImageActual: {
    width: '70%',
    height: '70%',
  },
  productImagePlaceholder: {
    fontSize: fontSize.xxxl + 8,
  },
  favoriteIcon: {
    position: 'absolute',
    top: spacing.xs + 4,
    right: spacing.xs + 4,
    borderRadius: scaleWidth(16),
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageDiscountBadge: {
    position: 'absolute',
    top: spacing.xs + 4,
    left: spacing.xs + 4,
    backgroundColor: '#22C55E',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: scaleWidth(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  imageDiscountText: {
    fontSize: fontSize.xs - 1,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: spacing.sm,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: spacing.xs,
    minHeight: scaleHeight(34),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 4,
  },
  ratingText: {
    fontSize: fontSize.xs + 1,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginRight: 3,
  },
  ratingStar: {
    fontSize: fontSize.xs + 1,
  },
  reviewCount: {
    fontSize: fontSize.xs,
    color: theme.colors.text.tertiary,
    marginLeft: 3,
  },
  priceContainer: {
    marginBottom: spacing.sm + 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  price: {
    fontSize: fontSize.md + 1,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  priceLabel: {
    fontSize: fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  priceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  originalPrice: {
    fontSize: fontSize.xs,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    flex: 1,
    flexShrink: 1,
  },
  discountBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: spacing.xs + 1,
    paddingVertical: 2,
    borderRadius: scaleWidth(4),
    flexShrink: 0,
  },
  discountText: {
    fontSize: fontSize.xs - 1,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: spacing.xs + 5,
    borderRadius: scaleWidth(10),
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: scaleHeight(3) },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    fontSize: fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: scaleWidth(10),
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: spacing.xs + 1,
    paddingHorizontal: spacing.xs + 2,
  },
  quantityButton: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: scaleWidth(6),
  },
  quantityButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  quantityText: {
    fontSize: fontSize.md + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  // Compact Product Card Styles
  compactRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  compactRatingText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginRight: 4,
  },
  compactReviewCount: {
    fontSize: fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  simplifiedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  compactQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: scaleWidth(8),
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    paddingVertical: 4,
    gap: spacing.sm,
  },
  compactQuantityButton: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: scaleWidth(6),
  },
  compactQuantityButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  compactQuantityText: {
    fontSize: fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
    minWidth: scaleWidth(24),
    textAlign: 'center',
  },
  compactAddButton: {
    backgroundColor: theme.colors.primary,
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  compactAddButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  bottomSpacer: {
    height: scaleHeight(20),
  },
  floatingBottomBar: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: scaleWidth(30),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 6,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(8) },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  selectedProductsPreview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productAvatar: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    backgroundColor: theme.colors.accent.pink,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background.elevated,
  },
  productAvatarText: {
    fontSize: fontSize.md + 2,
  },
  productAvatarMore: {
    backgroundColor: theme.colors.primary,
  },
  productAvatarMoreText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  selectDateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md + 4,
    borderRadius: scaleWidth(24),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  selectDateText: {
    fontSize: fontSize.sm + 2,
    fontWeight: '700',
    marginRight: spacing.xs + 2,
  },
  selectDateArrow: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
