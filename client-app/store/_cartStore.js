import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      cartItems: [],
      cartType: null, // 'transport' or 'enterprise'

      // Computed values
      get cartCount() {
        return get().cartItems.length;
      },

      get cartTotal() {
        return get().cartItems.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
      },

      // Actions
      addToCart: (item) => {
        const { cartItems, cartType } = get();
        
        // Check if adding different type of item
        if (cartType && cartType !== item.type) {
          return {
            success: false,
            error: 'Cannot mix transport and enterprise items in cart',
          };
        }

        // Check if item already exists
        const existingItemIndex = cartItems.findIndex(
          (cartItem) => cartItem.id === item.id
        );

        if (existingItemIndex > -1) {
          // Update quantity
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += item.quantity || 1;
          set({ cartItems: updatedItems });
        } else {
          // Add new item
          set({
            cartItems: [...cartItems, { ...item, quantity: item.quantity || 1 }],
            cartType: item.type,
          });
        }

        return { success: true };
      },

      removeFromCart: (itemId) => {
        const { cartItems } = get();
        const updatedItems = cartItems.filter((item) => item.id !== itemId);
        set({
          cartItems: updatedItems,
          cartType: updatedItems.length === 0 ? null : get().cartType,
        });
      },

      updateQuantity: (itemId, quantity) => {
        const { cartItems } = get();
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        const updatedItems = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ cartItems: updatedItems });
      },

      incrementQuantity: (itemId) => {
        const { cartItems } = get();
        const item = cartItems.find((item) => item.id === itemId);
        if (item) {
          get().updateQuantity(itemId, item.quantity + 1);
        }
      },

      decrementQuantity: (itemId) => {
        const { cartItems } = get();
        const item = cartItems.find((item) => item.id === itemId);
        if (item) {
          get().updateQuantity(itemId, item.quantity - 1);
        }
      },

      clearCart: () => set({ cartItems: [], cartType: null }),

      // Get cart item by ID
      getCartItem: (itemId) => {
        const { cartItems } = get();
        return cartItems.find((item) => item.id === itemId);
      },

      // Check if item is in cart
      isInCart: (itemId) => {
        const { cartItems } = get();
        return cartItems.some((item) => item.id === itemId);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;