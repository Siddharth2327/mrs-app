import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: {}, // { materialId: { material data, quantity, subtotal } }

      // Add item to cart
      addItem: (material, quantity = 1) => {
        set((state) => {
          const newItems = { ...state.items };
          const existingItem = newItems[material.id];

          if (existingItem) {
            // Update existing item
            newItems[material.id] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
              subtotal: (existingItem.quantity + quantity) * material.price,
            };
          } else {
            // Add new item
            newItems[material.id] = {
              ...material,
              quantity,
              subtotal: material.price * quantity,
            };
          }

          return { items: newItems };
        });
      },

      // Update item quantity
      updateQuantity: (materialId, quantity) => {
        set((state) => {
          const newItems = { ...state.items };

          if (quantity === 0) {
            delete newItems[materialId];
          } else {
            const item = newItems[materialId];
            if (item) {
              newItems[materialId] = {
                ...item,
                quantity,
                subtotal: item.price * quantity,
              };
            }
          }

          return { items: newItems };
        });
      },

      // Remove item from cart
      removeItem: (materialId) => {
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[materialId];
          return { items: newItems };
        });
      },

      // Clear cart
      clearCart: () => set({ items: {} }),

      // Get cart item count
      getItemCount: () => {
        const { items } = get();
        return Object.values(items).reduce((sum, item) => sum + item.quantity, 0);
      },

      // Get cart total
      getTotal: () => {
        const { items } = get();
        return Object.values(items).reduce((sum, item) => sum + item.subtotal, 0);
      },

      // Get cart items as array
      getItemsArray: () => {
        const { items } = get();
        return Object.values(items);
      },

      // Check if item is in cart
      isInCart: (materialId) => {
        const { items } = get();
        return !!items[materialId];
      },

      // Get item quantity
      getItemQuantity: (materialId) => {
        const { items } = get();
        return items[materialId]?.quantity || 0;
      },

      // Increment quantity
      incrementQuantity: (materialId) => {
        const { items } = get();
        const item = items[materialId];
        if (item) {
          get().updateQuantity(materialId, item.quantity + 1);
        }
      },

      // Decrement quantity
      decrementQuantity: (materialId) => {
        const { items } = get();
        const item = items[materialId];
        if (item && item.quantity > 0) {
          get().updateQuantity(materialId, item.quantity - 1);
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;