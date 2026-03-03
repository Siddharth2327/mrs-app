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
  Switch,
  ScrollView,
} from 'react-native';
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  softDeleteVehicle,
  toggleVehicleAvailability,
} from '../../../services/vehicleService';

const UNIT_TYPES = ['per km', 'per day', 'per hour'];

const TransportSection = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    unit: 'per km',
    availability: true,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, searchQuery, filterStock, filterAvailability]);

  const loadVehicles = async (loadMore = false) => {
    try {
      if (loadMore) setLoadingMore(true);
      else setIsLoading(true);

      const { vehicles: newVehicles, lastVisible, hasMore: moreAvailable } = await getVehicles(
        loadMore ? lastDoc : null
      );

      if (loadMore) {
        setVehicles([...vehicles, ...newVehicles]);
      } else {
        setVehicles(newVehicles);
      }

      setLastDoc(lastVisible);
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    if (searchQuery.trim()) {
      filtered = filtered.filter((vehicle) =>
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStock === 'out') {
      filtered = filtered.filter((vehicle) => vehicle.stock === 0);
    } else if (filterStock === 'low') {
      filtered = filtered.filter(
        (vehicle) => vehicle.stock > 0 && vehicle.stock <= vehicle.lowStockThreshold
      );
    } else if (filterStock === 'normal') {
      filtered = filtered.filter((vehicle) => vehicle.stock > vehicle.lowStockThreshold);
    }

    if (filterAvailability === 'available') {
      filtered = filtered.filter((vehicle) => vehicle.availability);
    } else if (filterAvailability === 'unavailable') {
      filtered = filtered.filter((vehicle) => !vehicle.availability);
    }

    setFilteredVehicles(filtered);
  };

  const handleAddEdit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter vehicle name');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter valid price');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'Please enter valid number of vehicles');
      return;
    }
    if (!formData.lowStockThreshold || parseInt(formData.lowStockThreshold) < 0) {
      Alert.alert('Error', 'Please enter valid low stock threshold');
      return;
    }

    try {
      const vehicleData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        unit: formData.unit,
        availability: formData.availability,
      };

      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
        Alert.alert('Success', 'Vehicle updated successfully');
      } else {
        await addVehicle(vehicleData);
        Alert.alert('Success', 'Vehicle added successfully');
      }

      closeModal();
      loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Error', 'Failed to save vehicle');
    }
  };

  const handleDelete = (vehicle) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete "${vehicle.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await softDeleteVehicle(vehicle.id);
              Alert.alert('Success', 'Vehicle deleted successfully');
              loadVehicles();
            } catch (error) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'Failed to delete vehicle');
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailability = async (vehicle) => {
    try {
      await toggleVehicleAvailability(vehicle.id, !vehicle.availability);
      loadVehicles();
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      lowStockThreshold: '',
      unit: 'per km',
      availability: true,
    });
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      price: vehicle.price.toString(),
      stock: vehicle.stock.toString(),
      lowStockThreshold: vehicle.lowStockThreshold.toString(),
      unit: vehicle.unit,
      availability: vehicle.availability,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  const getStockStatus = (vehicle) => {
    if (vehicle.stock === 0) return { label: 'Out of Stock', color: '#EF4444' };
    if (vehicle.stock <= vehicle.lowStockThreshold) return { label: 'Low Stock', color: '#F59E0B' };
    return { label: 'Available', color: '#10B981' };
  };

  const renderVehicleItem = ({ item }) => {
    const stockStatus = getStockStatus(item);

    return (
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{item.name}</Text>
            <View style={styles.vehicleMeta}>
              <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
                <Text style={styles.statusText}>{stockStatus.label}</Text>
              </View>
              {!item.availability && (
                <View style={[styles.statusBadge, { backgroundColor: '#64748B' }]}>
                  <Text style={styles.statusText}>Unavailable</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.vehicleActions}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => openEditModal(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.vehicleDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>₹{item.price} {item.unit}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock:</Text>
            <Text style={styles.detailValue}>{item.stock} vehicles</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Low Stock Alert:</Text>
            <Text style={styles.detailValue}>{item.lowStockThreshold} vehicles</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Available for Booking:</Text>
            <Switch
              value={item.availability}
              onValueChange={() => handleToggleAvailability(item)}
              trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
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
          placeholder="Search vehicles..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Stock:</Text>
        <View style={styles.filterRow}>
          {['all', 'out', 'low', 'normal'].map((stock) => (
            <TouchableOpacity
              key={stock}
              style={[styles.filterChip, filterStock === stock && styles.filterChipActive]}
              onPress={() => setFilterStock(stock)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, filterStock === stock && styles.filterChipTextActive]}>
                {stock}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Availability:</Text>
        <View style={styles.filterRow}>
          {['all', 'available', 'unavailable'].map((avail) => (
            <TouchableOpacity
              key={avail}
              style={[styles.filterChip, filterAvailability === avail && styles.filterChipActive]}
              onPress={() => setFilterAvailability(avail)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, filterAvailability === avail && styles.filterChipTextActive]}>
                {avail}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vehicles List */}
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicleItem}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            loadVehicles(true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color="#1E3A5F" style={styles.loader} /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vehicles found</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Vehicle Name (e.g., 12 Wheel Truck)"
                placeholderTextColor="#94A3B8"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Price"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Stock Quantity"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Low Stock Threshold"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.lowStockThreshold}
                onChangeText={(text) => setFormData({ ...formData, lowStockThreshold: text })}
              />

              <Text style={styles.inputLabel}>Unit:</Text>
              <View style={styles.dropdownContainer}>
                {UNIT_TYPES.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.dropdownOption, formData.unit === unit && styles.dropdownOptionActive]}
                    onPress={() => setFormData({ ...formData, unit })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownText, formData.unit === unit && styles.dropdownTextActive]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Available for Booking:</Text>
                <Switch
                  value={formData.availability}
                  onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={closeModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleAddEdit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>
                    {editingVehicle ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  vehicleCard: {
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
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  vehicleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: '#1E3A5F',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  vehicleDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#1E3A5F',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  input: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownOptionActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  dropdownText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  dropdownTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#1E3A5F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TransportSection;