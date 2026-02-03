/**
 * Wishlist State Management
 * Manages wishlist items across the app
 */

import { create } from 'zustand';

export interface WishlistProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  pricePerDay: number;
  originalPrice: number;
  discount: number;
}

interface WishlistState {
  wishlist: WishlistProduct[];

  // Actions
  addToWishlist: (product: WishlistProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],

  addToWishlist: (product) => {
    const { wishlist } = get();
    const exists = wishlist.find((p) => p.id === product.id);
    if (!exists) {
      set({ wishlist: [...wishlist, product] });
    }
  },

  removeFromWishlist: (productId) => {
    const { wishlist } = get();
    set({ wishlist: wishlist.filter((p) => p.id !== productId) });
  },

  isInWishlist: (productId) => {
    const { wishlist } = get();
    return wishlist.some((p) => p.id === productId);
  },

  clearWishlist: () => {
    set({ wishlist: [] });
  },
}));
