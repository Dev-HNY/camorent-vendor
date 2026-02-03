/**
 * Order State Management
 * Manages current order creation flow and selected products
 */

import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  pricePerDay: number;
  quantity: number;
}

export interface Order {
  orderName: string;
  products: Product[];
  createdAt: string;
  status: 'draft' | 'pending' | 'confirmed' | 'approved' | 'completed' | 'return_pending';
  fromDate?: string;
  tillDate?: string;
}

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];

  // Actions
  createOrder: (orderName: string) => void;
  addProduct: (product: Omit<Product, 'quantity'>) => void;
  removeProduct: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  setRentalDates: (fromDate: string, tillDate: string) => void;
  clearCurrentOrder: () => void;
  confirmOrder: () => void;
  approveOrder: (orderName: string) => void;
  markAsReturnPending: (orderName: string) => void;
  markAsCompleted: (orderName: string) => void;
  getPickupDueCount: () => number;
  getReturnPendingCount: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentOrder: null,
  orders: [],

  createOrder: (orderName: string) => {
    set({
      currentOrder: {
        orderName,
        products: [],
        createdAt: new Date().toISOString(),
        status: 'draft',
      },
    });
  },

  addProduct: (product) => {
    const { currentOrder } = get();
    if (!currentOrder) return;

    const existingProductIndex = currentOrder.products.findIndex(
      (p) => p.id === product.id
    );

    if (existingProductIndex >= 0) {
      // Product already exists, increase quantity
      const updatedProducts = [...currentOrder.products];
      updatedProducts[existingProductIndex].quantity += 1;
      set({
        currentOrder: {
          ...currentOrder,
          products: updatedProducts,
        },
      });
    } else {
      // Add new product
      set({
        currentOrder: {
          ...currentOrder,
          products: [
            ...currentOrder.products,
            { ...product, quantity: 1 },
          ],
        },
      });
    }
  },

  removeProduct: (productId: string) => {
    const { currentOrder } = get();
    if (!currentOrder) return;

    set({
      currentOrder: {
        ...currentOrder,
        products: currentOrder.products.filter((p) => p.id !== productId),
      },
    });
  },

  updateProductQuantity: (productId: string, quantity: number) => {
    const { currentOrder } = get();
    if (!currentOrder) return;

    if (quantity <= 0) {
      get().removeProduct(productId);
      return;
    }

    const updatedProducts = currentOrder.products.map((p) =>
      p.id === productId ? { ...p, quantity } : p
    );

    set({
      currentOrder: {
        ...currentOrder,
        products: updatedProducts,
      },
    });
  },

  setRentalDates: (fromDate: string, tillDate: string) => {
    const { currentOrder } = get();
    if (!currentOrder) return;

    set({
      currentOrder: {
        ...currentOrder,
        fromDate,
        tillDate,
      },
    });
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },

  confirmOrder: () => {
    const { currentOrder, orders } = get();
    if (!currentOrder) return;

    const confirmedOrder = {
      ...currentOrder,
      status: 'confirmed' as const,
    };

    set({
      orders: [...orders, confirmedOrder],
      currentOrder: null,
    });
  },

  approveOrder: (orderName: string) => {
    const { orders } = get();
    set({
      orders: orders.map(order =>
        order.orderName === orderName
          ? { ...order, status: 'approved' }
          : order
      ),
    });
  },

  markAsReturnPending: (orderName: string) => {
    const { orders } = get();
    set({
      orders: orders.map(order =>
        order.orderName === orderName
          ? { ...order, status: 'return_pending' }
          : order
      ),
    });
  },

  markAsCompleted: (orderName: string) => {
    const { orders } = get();
    set({
      orders: orders.map(order =>
        order.orderName === orderName
          ? { ...order, status: 'completed' }
          : order
      ),
    });
  },

  getPickupDueCount: () => {
    const { orders } = get();
    return orders.filter(order => order.status === 'approved').length;
  },

  getReturnPendingCount: () => {
    const { orders } = get();
    return orders.filter(order => order.status === 'return_pending').length;
  },
}));
