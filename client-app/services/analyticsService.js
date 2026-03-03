import firestore from '@react-native-firebase/firestore';

const ORDERS_COLLECTION = 'orders';
const MATERIALS_COLLECTION = 'materials';
const VEHICLES_COLLECTION = 'vehicles';

/**
 * Get comprehensive analytics data
 */
export const getAnalytics = async () => {
  try {
    const [
      ordersData,
      lowStockData,
      activeVehiclesCount,
    ] = await Promise.all([
      getOrdersAnalytics().catch(() => ({ totalRevenue: 0, totalOrders: 0, enterpriseOrders: 0, transportOrders: 0 })),
      getLowStockCounts().catch(() => ({ lowStock: 0, outOfStock: 0 })),
      getActiveVehiclesCount().catch(() => 0),
    ]);

    return {
      totalRevenue: ordersData.totalRevenue,
      totalOrders: ordersData.totalOrders,
      enterpriseOrders: ordersData.enterpriseOrders,
      transportOrders: ordersData.transportOrders,
      lowStockCount: lowStockData.lowStock,
      outOfStockCount: lowStockData.outOfStock,
      activeVehicles: activeVehiclesCount,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      enterpriseOrders: 0,
      transportOrders: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      activeVehicles: 0,
    };
  }
};

/**
 * Get orders analytics (revenue and counts)
 */
const getOrdersAnalytics = async () => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .get();

    let totalRevenue = 0;
    let totalOrders = 0;
    let enterpriseOrders = 0;
    let transportOrders = 0;

    snapshot.docs.forEach(doc => {
      const order = doc.data();
      totalOrders++;
      totalRevenue += order.total || 0;

      if (order.type === 'enterprise') {
        enterpriseOrders++;
      } else if (order.type === 'transport') {
        transportOrders++;
      }
    });

    return {
      totalRevenue,
      totalOrders,
      enterpriseOrders,
      transportOrders,
    };
  } catch (error) {
    console.error('Error fetching orders analytics:', error);
    throw error;
  }
};

/**
 * Get today's revenue
 */
export const getTodayRevenue = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('createdAt', '>=', today)
      .where('createdAt', '<', tomorrow)
      .get();

    let todayRevenue = 0;
    snapshot.docs.forEach(doc => {
      const order = doc.data();
      todayRevenue += order.total || 0;
    });

    return todayRevenue;
  } catch (error) {
    console.error('Error fetching today\'s revenue:', error);
    return 0;
  }
};

/**
 * Get this month's revenue
 */
export const getMonthRevenue = async () => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('createdAt', '>=', firstDayOfMonth)
      .where('createdAt', '<', firstDayOfNextMonth)
      .get();

    let monthRevenue = 0;
    snapshot.docs.forEach(doc => {
      const order = doc.data();
      monthRevenue += order.total || 0;
    });

    return monthRevenue;
  } catch (error) {
    console.error('Error fetching month\'s revenue:', error);
    return 0;
  }
};

/**
 * Get low stock counts (real-time)
 */
export const getLowStockCounts = (callback) => {
  try {
    // If callback is provided, set up real-time listener
    if (callback) {
      const unsubscribe = firestore()
        .collection(MATERIALS_COLLECTION)
        .where('isDeleted', '==', false)
        .onSnapshot((snapshot) => {
          let outOfStock = 0;
          let lowStock = 0;

          snapshot.docs.forEach(doc => {
            const material = doc.data();
            if (material.stock === 0) {
              outOfStock++;
            } else if (material.stock <= material.lowStockThreshold) {
              lowStock++;
            }
          });

          callback({ outOfStock, lowStock });
        }, (error) => {
          console.error('Error in low stock subscription:', error);
          callback({ outOfStock: 0, lowStock: 0 });
        });

      return unsubscribe;
    }

    // Otherwise, return a promise for one-time fetch
    return firestore()
      .collection(MATERIALS_COLLECTION)
      .where('isDeleted', '==', false)
      .get()
      .then(snapshot => {
        let outOfStock = 0;
        let lowStock = 0;

        snapshot.docs.forEach(doc => {
          const material = doc.data();
          if (material.stock === 0) {
            outOfStock++;
          } else if (material.stock <= material.lowStockThreshold) {
            lowStock++;
          }
        });

        return { outOfStock, lowStock };
      })
      .catch(error => {
        console.error('Error fetching low stock counts:', error);
        return { outOfStock: 0, lowStock: 0 };
      });
  } catch (error) {
    console.error('Error fetching low stock counts:', error);
    if (callback) {
      callback({ outOfStock: 0, lowStock: 0 });
      return () => {}; // Return empty unsubscribe function
    }
    return Promise.resolve({ outOfStock: 0, lowStock: 0 });
  }
};

/**
 * Get active vehicles count - SIMPLIFIED to avoid index requirement
 */
const getActiveVehiclesCount = async () => {
  try {
    // Fetch all non-deleted vehicles and filter in JavaScript
    const snapshot = await firestore()
      .collection(VEHICLES_COLLECTION)
      .where('isDeleted', '==', false)
      .get();

    // Filter in JavaScript to avoid needing composite index
    let activeCount = 0;
    snapshot.docs.forEach(doc => {
      const vehicle = doc.data();
      if (vehicle.availability === true && vehicle.stock > 0) {
        activeCount++;
      }
    });

    return activeCount;
  } catch (error) {
    console.error('Error fetching active vehicles count:', error);
    return 0;
  }
};

/**
 * Get top selling material
 */
export const getTopSellingMaterial = async () => {
  try {
    const ordersSnapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('type', '==', 'enterprise')
      .get();

    const materialSales = {};

    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!materialSales[item.name]) {
            materialSales[item.name] = {
              name: item.name,
              totalQty: 0,
              totalRevenue: 0,
            };
          }
          materialSales[item.name].totalQty += item.qty || 0;
          materialSales[item.name].totalRevenue += (item.qty || 0) * (item.price || 0);
        });
      }
    });

    // Find top material by quantity sold
    let topMaterial = null;
    let maxQty = 0;

    Object.values(materialSales).forEach(material => {
      if (material.totalQty > maxQty) {
        maxQty = material.totalQty;
        topMaterial = material;
      }
    });

    return topMaterial;
  } catch (error) {
    console.error('Error fetching top selling material:', error);
    return null;
  }
};

/**
 * Get revenue by date range
 */
export const getRevenueByDateRange = async (startDate, endDate) => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    let revenue = 0;
    snapshot.docs.forEach(doc => {
      const order = doc.data();
      revenue += order.total || 0;
    });

    return revenue;
  } catch (error) {
    console.error('Error fetching revenue by date range:', error);
    return 0;
  }
};

/**
 * Get daily revenue for the last N days
 */
export const getDailyRevenueChart = async (days = 7) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .orderBy('createdAt', 'asc')
      .get();

    // Group revenue by day
    const revenueByDay = {};
    snapshot.docs.forEach(doc => {
      const order = doc.data();
      const orderDate = order.createdAt?.toDate?.();
      if (orderDate) {
        const dateKey = orderDate.toISOString().split('T')[0];
        if (!revenueByDay[dateKey]) {
          revenueByDay[dateKey] = 0;
        }
        revenueByDay[dateKey] += order.total || 0;
      }
    });

    // Convert to array format for charting
    const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return chartData;
  } catch (error) {
    console.error('Error fetching daily revenue chart:', error);
    return [];
  }
};

/**
 * Get material sales breakdown
 */
export const getMaterialSalesBreakdown = async () => {
  try {
    const ordersSnapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .where('type', '==', 'enterprise')
      .get();

    const materialSales = {};

    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!materialSales[item.name]) {
            materialSales[item.name] = {
              name: item.name,
              totalQty: 0,
              totalRevenue: 0,
              orderCount: 0,
            };
          }
          materialSales[item.name].totalQty += item.qty || 0;
          materialSales[item.name].totalRevenue += (item.qty || 0) * (item.price || 0);
          materialSales[item.name].orderCount++;
        });
      }
    });

    // Convert to array and sort by revenue
    const breakdown = Object.values(materialSales).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return breakdown;
  } catch (error) {
    console.error('Error fetching material sales breakdown:', error);
    return [];
  }
};

/**
 * Get order status distribution
 */
export const getOrderStatusDistribution = async () => {
  try {
    const snapshot = await firestore()
      .collection(ORDERS_COLLECTION)
      .get();

    const distribution = {
      placed: 0,
      packed: 0,
      dispatched: 0,
      delivered: 0,
    };

    snapshot.docs.forEach(doc => {
      const order = doc.data();
      if (distribution.hasOwnProperty(order.status)) {
        distribution[order.status]++;
      }
    });

    return distribution;
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    return { placed: 0, packed: 0, dispatched: 0, delivered: 0 };
  }
};