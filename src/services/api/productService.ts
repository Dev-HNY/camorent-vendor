/**
 * Product/SKU Service
 * Handles all product, category, brand, and SKU related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '../../config/api';

// Response Types
export interface SKU {
  sku_id: string;
  name: string;
  id: string;
  brand: string;
  category_id: string;
  subcategory_id: string;
  price_per_day: string | number; // API returns string, convert to number when using
  primary_image_url: string;
  tags: string[];
  is_active: boolean;
  avg_rating: string | number; // API returns string, convert to number when using
  review_count: number;
}

export interface Category {
  category_id: string;
  name: string;
  id: string;
  description?: string;
  image_url: string;
  is_active: boolean;
}

export interface Subcategory {
  subcategory_id: string;
  category_id: string;
  cat_id: string;
  name: string;
  id: string;
  description?: string;
  image_url: string;
  is_active: boolean;
}

export interface Brand {
  brand_id: string;
  name: string;
  id: string;
  description?: string;
  image_url: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Request Parameters
export interface SKUSearchParams {
  q?: string;
  category_id?: string;
  subcategory_id?: string;
  sku_id?: string;
  brand?: string;
  tags?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
  selection?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
  page?: number;
  limit?: number;
  Price_type?: 'vendor' | 'customer'; // Added: vendor pricing for vendor app
}

export interface CategoryParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface SubcategoryParams {
  category_id?: string;
  subcategory_id?: string;
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface BrandParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

/**
 * Product Service
 */
export const productService = {
  /**
   * Search and filter SKUs
   */
  async searchSKUs(params: SKUSearchParams = {}): Promise<PaginatedResponse<SKU>> {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.subcategory_id) queryParams.append('subcategory_id', params.subcategory_id);
    if (params.sku_id) queryParams.append('sku_id', params.sku_id);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.tags) queryParams.append('tags', params.tags);
    if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params.selection) queryParams.append('selection', params.selection);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    // Default to vendor pricing for vendor app
    queryParams.append('Price_type', params.Price_type || 'vendor');

    const url = `${API_ENDPOINTS.SKUS.LIST}?${queryParams.toString()}`;

    try {
      const response = await apiClient.get<PaginatedResponse<SKU>>(url);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch SKUs');
    }
  },

  /**
   * Get SKU details by ID
   * @param skuId - The SKU ID
   * @param priceType - 'vendor' or 'customer' pricing (defaults to 'vendor' for vendor app)
   */
  async getSKUById(skuId: string, priceType: 'vendor' | 'customer' = 'vendor'): Promise<SKU> {
    try {
      const url = `${API_ENDPOINTS.SKUS.DETAIL(skuId)}?Price_type=${priceType}`;
      const response = await apiClient.get<SKU>(url);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch SKU details');
    }
  },

  /**
   * Get all categories
   */
  async getCategories(params: CategoryParams = {}): Promise<PaginatedResponse<Category>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const url = `${API_ENDPOINTS.SKUS.CATEGORIES}?${queryParams.toString()}`;

    try {
      const response = await apiClient.get<PaginatedResponse<Category>>(url);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(
        API_ENDPOINTS.SKUS.CATEGORY_DETAIL(categoryId)
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch category');
    }
  },

  /**
   * Get all subcategories
   */
  async getSubcategories(params: SubcategoryParams = {}): Promise<PaginatedResponse<Subcategory>> {
    const queryParams = new URLSearchParams();

    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.subcategory_id) queryParams.append('subcategory_id', params.subcategory_id);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const url = `${API_ENDPOINTS.SKUS.SUBCATEGORIES}?${queryParams.toString()}`;

    try {
      const response = await apiClient.get<PaginatedResponse<Subcategory>>(url);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch subcategories');
    }
  },

  /**
   * Get all brands
   */
  async getBrands(params: BrandParams = {}): Promise<PaginatedResponse<Brand>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const url = `${API_ENDPOINTS.SKUS.BRANDS}?${queryParams.toString()}`;

    try {
      const response = await apiClient.get<PaginatedResponse<Brand>>(url);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch brands');
    }
  },
};
