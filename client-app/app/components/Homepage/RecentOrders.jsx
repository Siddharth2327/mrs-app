import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useOrderStore from '../../../store/orderStore';
import useAuthStore from '../../../store/authStore';

const RecentOrders = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { activeOrders, fetchOrders } = useOrderStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const topTwoOrders = activeOrders.slice(0, 2);

  const handleViewAll = () => {
    router.push('/OrdersPage');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      'in-progress': '#8B5CF6',
      delivered: '#10B981',
      placed: '#3B82F6',
      packed: '#F59E0B',
      dispatched: '#8B5CF6',
    };
    return colors[status?.toLowerCase()] || '#64748B';
  };

  const getStatusText = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      delivered: 'Delivered',
      placed: 'Placed',
      packed: 'Packed',
      dispatched: 'Dispatched',
    };
    return labels[status?.toLowerCase()] || status || 'Unknown';
  };

  const handleOrderPress = (orderId) => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Orders</Text>
        {topTwoOrders.length > 0 && (
          <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isAuthenticated ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="clipboard-outline" size={28} color="#94A3B8" />
          </View>
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>Login to view orders</Text>
            <Text style={styles.emptySubtitle}>Track your orders after login</Text>
          </View>
        </View>
      ) : topTwoOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="clipboard-outline" size={28} color="#94A3B8" />
          </View>
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>No recent orders</Text>
            <Text style={styles.emptySubtitle}>Your orders will appear here</Text>
          </View>
        </View>
      ) : (
        <View style={styles.ordersContainer}>
          {topTwoOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order.id)}
              activeOpacity={0.8}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId} numberOfLines={1}>
                  Order #{order.id?.slice(0, 8) || 'N/A'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderDate}>
                {order.createdAt 
                  ? new Date(order.createdAt).toLocaleDateString('en-GB') 
                  : 'Recent'
                }
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emptyTextContainer: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 3,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  ordersContainer: {
    gap: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default RecentOrders;
