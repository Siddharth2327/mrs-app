import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {
  getOrders,
  updateOrderStatus,
  subscribeToOrders,
} from '../../../services/orderService';

const ORDER_STATUSES = ['placed', 'packed', 'dispatched', 'delivered'];

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  // Filter States
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // User data cache
  const [usersCache, setUsersCache] = useState({});

  useEffect(() => {
    loadOrders();
    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
      // Fetch user data for new orders
      newOrders.forEach(order => {
        if (order.userId && !usersCache[order.userId]) {
          fetchUserData(order.userId);
        }
      });
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterType, filterStatus, searchQuery]);

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        setUsersCache(prev => ({
          ...prev,
          [userId]: userDoc.data()
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const loadOrders = async (loadMore = false) => {
    try {
      if (loadMore) setLoadingMore(true);
      else setIsLoading(true);

      const { orders: newOrders, lastVisible, hasMore: moreAvailable } = await getOrders(
        loadMore ? lastDoc : null
      );

      if (loadMore) {
        setOrders([...orders, ...newOrders]);
      } else {
        setOrders(newOrders);
      }

      // Fetch user data for all orders
      newOrders.forEach(order => {
        if (order.userId && !usersCache[order.userId]) {
          fetchUserData(order.userId);
        }
      });

      setLastDoc(lastVisible);
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (filterType !== 'all') {
      filtered = filtered.filter((order) => order.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((order) => {
        const userData = usersCache[order.userId];
        const searchLower = searchQuery.toLowerCase();
        return (
          userData?.name?.toLowerCase().includes(searchLower) ||
          userData?.phone?.includes(searchQuery) ||
          order.id.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', 'Order status updated successfully');
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return '#3B82F6';
      case 'packed': return '#F59E0B';
      case 'dispatched': return '#8B5CF6';
      case 'delivered': return '#10B981';
      default: return '#64748B';
    }
  };

  const getNextStatus = (currentStatus) => {
    const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
    return currentIndex < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[currentIndex + 1] : null;
  };

  const renderOrderItem = ({ item }) => {
    const nextStatus = getNextStatus(item.status);
    const statusColor = getStatusColor(item.status);
    const userData = usersCache[item.userId] || {};

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.orderTypeRow}>
              <View style={[styles.typeBadge, item.type === 'enterprise' ? styles.enterpriseBadge : styles.transportBadge]}>
                <Text style={styles.typeBadgeText}>
                  {item.type === 'enterprise' ? 'Enterprise' : 'Transport'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.orderIdText}>#{item.id.substring(0, 8)}</Text>
            {userData.name && (
              <Text style={styles.userNameText}>{userData.name}</Text>
            )}
            {userData.phone && (
              <Text style={styles.userPhoneText}>📞 {userData.phone}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => openDetailsModal(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsButtonText}>View</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>₹{(item.totalAmount ?? 0).toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {item.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
            </Text>
          </View>
        </View>

        {nextStatus && (
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: getStatusColor(nextStatus) }]}
            onPress={() => openStatusModal(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>
              Move to {nextStatus.toUpperCase()}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or order ID..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        <View style={styles.filterRow}>
          {['all', 'enterprise', 'transport'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, filterType === type && styles.filterChipActive]}
              onPress={() => setFilterType(type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
            onPress={() => setFilterStatus('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
              all
            </Text>
          </TouchableOpacity>
          {ORDER_STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            loadOrders(true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color="#1E3A5F" style={styles.loader} /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />

      {/* Status Update Modal */}
      <Modal visible={showStatusModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            {selectedOrder && (
              <>
                <Text style={styles.currentStatusText}>
                  Current: {selectedOrder.status.toUpperCase()}
                </Text>

                <Text style={styles.selectStatusLabel}>Select New Status:</Text>
                {ORDER_STATUSES.map((status) => {
                  const isCurrentOrPast = ORDER_STATUSES.indexOf(status) <= ORDER_STATUSES.indexOf(selectedOrder.status);
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        isCurrentOrPast && styles.statusOptionDisabled,
                        { backgroundColor: getStatusColor(status) + '20' },
                      ]}
                      onPress={() => !isCurrentOrPast && handleUpdateStatus(selectedOrder.id, status)}
                      disabled={isCurrentOrPast}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        isCurrentOrPast && styles.statusOptionTextDisabled,
                        { color: getStatusColor(status) }
                      ]}>
                        {status.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowStatusModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Order Details</Text>
              {selectedOrder && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Order Information</Text>
                    <Text style={styles.detailItemText}>Order ID: {selectedOrder.id}</Text>
                    <Text style={styles.detailItemText}>Type: {selectedOrder.type}</Text>
                    <Text style={styles.detailItemText}>Status: {selectedOrder.status}</Text>
                    <Text style={styles.detailItemText}>
                      Date: {selectedOrder.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                    </Text>
                  </View>

                  {selectedOrder.userId && usersCache[selectedOrder.userId] && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Customer Details</Text>
                      <Text style={styles.detailItemText}>Name: {usersCache[selectedOrder.userId].name}</Text>
                      <Text style={styles.detailItemText}>Phone: {usersCache[selectedOrder.userId].phone}</Text>
                      {usersCache[selectedOrder.userId].email && (
                        <Text style={styles.detailItemText}>Email: {usersCache[selectedOrder.userId].email}</Text>
                      )}
                    </View>
                  )}

                  {selectedOrder.type === 'enterprise' && selectedOrder.items && (
                    <>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Items</Text>
                        {selectedOrder.items.map((item, index) => (
                          <View key={index} style={styles.itemDetailRow}>
                            <View style={styles.itemDetailLeft}>
                              <Text style={styles.itemDetailName}>{item.name}</Text>
                              <Text style={styles.itemDetailQty}>
                                Qty: {item.quantity} {item.unit}
                              </Text>
                            </View>
                            <Text style={styles.itemDetailPrice}>₹{item.subtotal}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Payment Summary</Text>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Subtotal:</Text>
                          <Text style={styles.summaryValue}>₹{selectedOrder.subtotal || 0}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>GST (18%):</Text>
                          <Text style={styles.summaryValue}>₹{selectedOrder.gst || 0}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
                          <Text style={styles.summaryTotalValue}>₹{selectedOrder.totalAmount || 0}</Text>
                        </View>
                      </View>

                      {selectedOrder.deliveryAddress && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailSectionTitle}>Delivery Address</Text>
                          <Text style={styles.detailItemText}>
                            {selectedOrder.deliveryAddress.address || 'N/A'}
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {selectedOrder.type === 'transport' && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Transport Details</Text>
                      <Text style={styles.detailItemText}>Vehicle: {selectedOrder.vehicletype || 'N/A'}</Text>
                      <Text style={styles.detailItemText}>Distance: {selectedOrder.distancekm || 0} km</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enterpriseBadge: {
    backgroundColor: '#DBEAFE',
  },
  transportBadge: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  orderIdText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  userNameText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: 2,
  },
  userPhoneText: {
    fontSize: 12,
    color: '#64748B',
  },
  detailsButton: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#1E3A5F',
    fontWeight: '700',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  updateButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  currentStatusText: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 16,
    fontWeight: '600',
  },
  selectStatusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusOption: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  statusOptionDisabled: {
    opacity: 0.4,
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusOptionTextDisabled: {
    textDecorationLine: 'line-through',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  detailItemText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 20,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemDetailLeft: {
    flex: 1,
  },
  itemDetailName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDetailQty: {
    fontSize: 12,
    color: '#64748B',
  },
  itemDetailPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A5F',
  },
});

export default OrdersSection;