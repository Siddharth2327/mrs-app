import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import useAuthStore from './_authStore';

const useOrderStore = create(
  persist(
    (set, get) => ({
      // State
      orders: [],
      activeOrders: [],
      completedOrders: [],
      isLoading: false,

      // Actions
      setOrders: (orders) => {
        const active = orders.filter(
          (order) => order.status !== 'completed' && order.status !== 'cancelled'
        );
        const completed = orders.filter(
          (order) => order.status === 'completed' || order.status === 'cancelled'
        );

        set({
          orders,
          activeOrders: active,
          completedOrders: completed,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Create new order
      createOrder: async (orderData) => {
        const user = useAuthStore.getState().user;
        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }

        set({ isLoading: true });

        try {
          const order = {
            ...orderData,
            userId: user.uid,
            status: 'pending',
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          };

          const docRef = await firestore().collection('orders').add(order);
          
          const newOrder = {
            id: docRef.id,
            ...order,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const { orders } = get();
          set({ orders: [newOrder, ...orders] });
          get().setOrders([newOrder, ...orders]);

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
        const user = useAuthStore.getState().user;
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

      // Update order status
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
        const user = useAuthStore.getState().user;
        if (!user) return null;

        const unsubscribe = firestore()
          .collection('orders')
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(
            (snapshot) => {
              const orders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString(),
                updatedAt: doc.data().updatedAt?.toDate().toISOString(),
              }));

              get().setOrders(orders);
            },
            (error) => {
              console.error('Error subscribing to orders:', error);
            }
          );

        return unsubscribe;
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
        // Only persist orders data, not loading states
        orders: state.orders,
      }),
    }
  )
);

export default useOrderStore;