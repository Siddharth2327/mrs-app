import firestore from '@react-native-firebase/firestore';
import { deductStockForOrder } from './materialService';

const ORDERS_COLLECTION = 'orders';
const PAGE_SIZE = 20;

/**
 * Get orders with pagination
 */
export const getOrders = async (lastVisible = null) => {
  try {
    let query = firestore()
      .collection(ORDERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(PAGE_SIZE);

    if (lastVisible) {
      query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === PAGE_SIZE;

    return { orders, lastVisible: lastDoc, hasMore };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time order updates
 */
export const subscribeToOrders = (callback) => {
  try {
    const unsubscribe = firestore()
      .collection(ORDERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(50) // Limit for real-time to avoid excessive reads
      .onSnapshot((snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(orders);
      }, (error) => {
        console.error('Error in orders subscription:', error);
      });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to orders:', error);
    throw error;
  }
};

/**
 * Update order status
 * Automatically deducts stock when status changes to 'delivered' for enterprise orders
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = firestore().collection(ORDERS_COLLECTION).doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }

    const orderData = orderDoc.data();
    const timestamp = new Date();

    await orderRef.update({
      status: newStatus,
      updatedAt: timestamp,
      statusHistory: firestore.FieldValue.arrayUnion({
        status: newStatus,
        timestamp: timestamp,
      }),
    });


    // If status is delivered and order is enterprise, deduct stock
    if (newStatus === 'delivered' && orderData.type === 'enterprise' && orderData.items) {
      try {
        await deductStockForOrder(orderData.items);
      } catch (stockError) {
        console.error('Error deducting stock:', stockError);
        // Don't throw error here - order status should still be updated
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get orders by type
 */
export const getOrdersByType = async (type) => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('type', '==', type)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching orders by type:', error);
    throw error;
  }
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status) => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw error;
  }
};

/**
 * Get orders by user ID
 */
export const getOrdersByUserId = async (userId) => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('userId', '==', userRef)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const doc = await firestore()
      .collection(ORDERS_COLLECTION)
      .doc(orderId)
      .get();

    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

/**
 * Get total orders count
 */
export const getTotalOrdersCount = async () => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .get();

    return snapshot.size;
  } catch (error) {
    console.error('Error fetching total orders count:', error);
    throw error;
  }
};

/**
 * Get orders count by type
 */
export const getOrdersCountByType = async () => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .get();

    let enterpriseCount = 0;
    let transportCount = 0;

    snapshot.docs.forEach(doc => {
      const order = doc.data();
      if (order.type === 'enterprise') {
        enterpriseCount++;
      } else if (order.type === 'transport') {
        transportCount++;
      }
    });

    return { enterpriseCount, transportCount, total: snapshot.size };
  } catch (error) {
    console.error('Error fetching orders count by type:', error);
    throw error;
  }
};

/**
 * Get orders within date range
 */
export const getOrdersByDateRange = async (startDate, endDate) => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching orders by date range:', error);
    throw error;
  }
};