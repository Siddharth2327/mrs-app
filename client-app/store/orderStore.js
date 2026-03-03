import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import useAuthStore from './authStore';

const useOrderStore = create(
  persist(
    (set, get) => ({
      // State
      orders: [],
      activeOrders: [],
      completedOrders: [],
      isLoading: false,

      // Actions
      setOrders: (incomingOrders) => {
        set((state) => {

          const orderMap = new Map();

          // existing persisted orders
          state.orders.forEach(order => {
            orderMap.set(order.id, order);
          });

          // new incoming orders
          incomingOrders.forEach(order => {
            orderMap.set(order.id, order);
          });

          const mergedOrders = Array.from(orderMap.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          const active = mergedOrders.filter(
            (order) =>
              order.status !== 'delivered' &&
              order.status !== 'cancelled' &&
              order.status !== 'completed'
          );

          const completed = mergedOrders.filter(
            (order) =>
              order.status === 'delivered' ||
              order.status === 'cancelled' ||
              order.status === 'completed'
          );

          return {
            orders: mergedOrders,
            activeOrders: active,
            completedOrders: completed,
          };
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Create new order from cart
      createOrderFromCart: async (cartItems, deliveryOption, deliveryAddress) => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }

        set({ isLoading: true });

        try {
          // Calculate totals
          const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
          const gst = Math.round(subtotal * 0.18);
          const totalAmount = subtotal + gst;

          // Prepare order data
          const orderData = {
            userId: user.uid,
            type: 'enterprise', // or 'transport' based on cart type
            status: 'placed',
            title: cartItems[0]?.name || 'Order',
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              unit: item.unit,
              subtotal: item.subtotal,
            })),
            deliveryOption,
            deliveryAddress,
            subtotal,
            gst,
            totalAmount,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          };

          const docRef = await firestore().collection('orders').add(orderData);

          const newOrder = {
            id: docRef.id,
            ...orderData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          get().setOrders([newOrder]);

          set({ isLoading: false });
          return { success: true, orderId: docRef.id };
        } catch (error) {
          console.error('Error creating order:', error);
          set({ isLoading: false });
          return { success: false, error };
        }
      },

      // Fetch user orders
      fetchOrders: async () => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }

        set({ isLoading: true });

        try {
          const snapshot = await firestore()
            .collection('orders')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

          const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString(),
          }));

          get().setOrders(orders);
          set({ isLoading: false });
          return { success: true, orders };
        } catch (error) {
          console.error('Error fetching orders:', error);
          set({ isLoading: false });
          return { success: false, error };
        }
      },

      // Update order status (admin only - but can be called from user side)
      updateOrderStatus: async (orderId, status) => {
        try {
          await firestore()
            .collection('orders')
            .doc(orderId)
            .update({
              status,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });

          const { orders } = get();
          const updatedOrders = orders.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          );

          get().setOrders(updatedOrders);
          return { success: true };
        } catch (error) {
          console.error('Error updating order status:', error);
          return { success: false, error };
        }
      },

      // Cancel order
      cancelOrder: async (orderId) => {
        return await get().updateOrderStatus(orderId, 'cancelled');
      },

      // Get order by ID
      getOrderById: (orderId) => {
        const { orders } = get();
        return orders.find((order) => order.id === orderId);
      },

      // Subscribe to real-time order updates
      subscribeToOrders: () => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) return null;

        const unsubscribe = firestore()
          .collection('orders')
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(
            { includeMetadataChanges: true },   // 👈 ADD THIS
            (snapshot) => {

              // 🚫 Ignore local pending writes
              if (snapshot.metadata.hasPendingWrites) return;

              const orderMap = new Map();

              snapshot.docs.forEach((doc) => {
                const data = doc.data();

                orderMap.set(doc.id, {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt?.toDate()?.toISOString(),
                  updatedAt: data.updatedAt?.toDate()?.toISOString(),
                });
              });

              const freshOrders = Array.from(orderMap.values());

              get().setOrders(freshOrders);
            },
            (error) => {
              console.error('Error subscribing to orders:', error);
            }
          );

        return unsubscribe;
      },

      // Get orders by type
      getOrdersByType: (type) => {
        const { orders } = get();
        return orders.filter((order) => order.type === type);
      },

      // Get orders by status
      getOrdersByStatus: (status) => {
        const { orders } = get();
        return orders.filter((order) => order.status === status);
      },

      // Clear orders (on logout)
      clearOrders: () => set({
        orders: [],
        activeOrders: [],
        completedOrders: [],
      }),
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);

export default useOrderStore;