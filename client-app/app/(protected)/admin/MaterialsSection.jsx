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
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import {
  getMaterials,
  addMaterial,
  updateMaterial,
  softDeleteMaterial,
  toggleMaterialAvailability,
  uploadMaterialImage,
  deleteMaterialImage,
} from '../../../services/materialService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.48; // ~48% of screen height

const MATERIAL_TYPES = ['sand', 'cement', 'brick', 'steel', 'others'];
const UNIT_TYPES = ['per unit', 'per kg', 'per sack/bag', 'per piece', 'others'];

const EMPTY_FORM = {
  name: '',
  price: '',
  stock: '',
  lowStockThreshold: '',
  type: 'sand',
  unit: 'per unit',
  isAvailable: true,
  imageUrl: null,
  localImageUri: null,
};

const MaterialsSection = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [showImageSourceSheet, setShowImageSourceSheet] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [materials, searchQuery, filterType, filterStock, filterAvailability]);

  const loadMaterials = async (loadMore = false) => {
    try {
      if (loadMore) setLoadingMore(true);
      else setIsLoading(true);

      const {
        materials: newMaterials,
        lastVisible,
        hasMore: moreAvailable,
      } = await getMaterials(loadMore ? lastDoc : null);

      setMaterials(prev => (loadMore ? [...prev, ...newMaterials] : newMaterials));
      setLastDoc(lastVisible);
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Error loading materials:', error);
      Alert.alert('Error', 'Failed to load materials');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...materials];

    if (searchQuery.trim()) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    if (filterStock === 'out') {
      filtered = filtered.filter(m => m.stock === 0);
    } else if (filterStock === 'low') {
      filtered = filtered.filter(m => m.stock > 0 && m.stock <= m.lowStockThreshold);
    } else if (filterStock === 'normal') {
      filtered = filtered.filter(m => m.stock > m.lowStockThreshold);
    }

    if (filterAvailability === 'available') {
      filtered = filtered.filter(m => m.isAvailable);
    } else if (filterAvailability === 'unavailable') {
      filtered = filtered.filter(m => !m.isAvailable);
    }

    setFilteredMaterials(filtered);
  };

  const pickImageFromLibrary = () => {
    setShowImageSourceSheet(false);
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800 },
      response => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setFormData(prev => ({ ...prev, localImageUri: uri }));
        }
      }
    );
  };

  const pickImageFromCamera = () => {
    setShowImageSourceSheet(false);
    launchCamera(
      { mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800, saveToPhotos: false },
      response => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setFormData(prev => ({ ...prev, localImageUri: uri }));
        }
      }
    );
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, localImageUri: null, imageUrl: null }));
  };

  const previewUri = formData.localImageUri || formData.imageUrl;

  const handleAddEdit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter material name');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return;
    }
    if (!formData.lowStockThreshold || parseInt(formData.lowStockThreshold) < 0) {
      Alert.alert('Error', 'Please enter a valid low stock threshold');
      return;
    }

    try {
      setIsSaving(true);

      let finalImageUrl = formData.imageUrl;

      if (formData.localImageUri) {
        if (editingMaterial?.imageUrl) {
          await deleteMaterialImage(editingMaterial.imageUrl);
        }
        const tempId = editingMaterial?.id || `temp_${Date.now()}`;
        finalImageUrl = await uploadMaterialImage(formData.localImageUri, tempId);
      } else if (formData.imageUrl === null && editingMaterial?.imageUrl) {
        await deleteMaterialImage(editingMaterial.imageUrl);
        finalImageUrl = null;
      }

      const materialData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        type: formData.type,
        unit: formData.unit,
        isAvailable: formData.isAvailable,
        imageUrl: finalImageUrl,
      };

      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, materialData);
        Alert.alert('Success', 'Material updated successfully');
      } else {
        await addMaterial(materialData);
        Alert.alert('Success', 'Material added successfully');
      }

      closeModal();
      loadMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      Alert.alert('Error', 'Failed to save material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = material => {
    Alert.alert(
      'Delete Material',
      `Are you sure you want to delete "${material.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await softDeleteMaterial(material.id, material.imageUrl);
              Alert.alert('Success', 'Material deleted successfully');
              loadMaterials();
            } catch (error) {
              console.error('Error deleting material:', error);
              Alert.alert('Error', 'Failed to delete material');
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailability = async material => {
    try {
      await toggleMaterialAvailability(material.id, !material.isAvailable);
      loadMaterials();
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = material => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      price: material.price.toString(),
      stock: material.stock.toString(),
      lowStockThreshold: material.lowStockThreshold.toString(),
      type: material.type,
      unit: material.unit,
      isAvailable: material.isAvailable,
      imageUrl: material.imageUrl || null,
      localImageUri: null,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData(EMPTY_FORM);
  };

  const getStockStatus = material => {
    if (material.stock === 0) return { label: 'Out of Stock', color: '#EF4444' };
    if (material.stock <= material.lowStockThreshold) return { label: 'Low Stock', color: '#F59E0B' };
    return { label: 'In Stock', color: '#10B981' };
  };

  const renderMaterialItem = ({ item }) => {
    const stockStatus = getStockStatus(item);

    return (
      <View style={styles.materialCard}>
        <View style={styles.cardTop}>
          {/* Image Section - Left half */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.materialThumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.materialThumbnailPlaceholder}>
                <Text style={styles.thumbnailPlaceholderText}>No Image</Text>
              </View>
            )}
          </View>

          {/* Actions - Right side next to image */}
          <View style={styles.cardTopActions}>
            <TouchableOpacity
              style={styles.editButtonTop}
              onPress={() => openEditModal(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButtonTop}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.materialContent}>
          {/* Header */}
          <View style={styles.materialHeader}>
            <View style={styles.materialInfo}>
              <Text style={styles.materialName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.materialMeta}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
                  <Text style={styles.statusText}>{stockStatus.label}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.materialDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>₹{item.price} / {item.unit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Stock</Text>
              <Text style={styles.detailValue}>{item.stock} units</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alert Level</Text>
              <Text style={styles.detailValue}>{item.lowStockThreshold} units</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Available</Text>
              <Switch
                value={item.isAvailable}
                onValueChange={() => handleToggleAvailability(item)}
                trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
                thumbColor="#FFFFFF"
                style={styles.switch}
              />
            </View>
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
          placeholder="Search materials..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {MATERIAL_TYPES.map(type => (
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
        </ScrollView>

        <Text style={styles.filterLabel}>Stock:</Text>
        <View style={styles.filterRow}>
          {['all', 'out', 'low', 'normal'].map(stock => (
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
          {['all', 'available', 'unavailable'].map(avail => (
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

      {/* Materials List */}
      <FlatList
        data={filteredMaterials}
        keyExtractor={item => item.id}
        renderItem={renderMaterialItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasMore && !loadingMore) loadMaterials(true);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#1E3A5F" style={styles.loader} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No materials found</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add / Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingMaterial ? 'Edit Material' : 'Add Material'}
              </Text>

              <Text style={styles.inputLabel}>Product Image:</Text>

              {previewUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: previewUri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <View style={styles.imagePreviewActions}>
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={() => setShowImageSourceSheet(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.changeImageText}>Change Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={removeImage}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.removeImageText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={() => setShowImageSourceSheet(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.imagePickerIcon}>📷</Text>
                  <Text style={styles.imagePickerText}>Tap to add image</Text>
                  <Text style={styles.imagePickerSubtext}>JPG · PNG · up to 800×800</Text>
                </TouchableOpacity>
              )}

              <TextInput
                style={styles.input}
                placeholder="Material Name"
                placeholderTextColor="#94A3B8"
                value={formData.name}
                onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Price"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={text => setFormData(prev => ({ ...prev, price: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Stock Quantity"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.stock}
                onChangeText={text => setFormData(prev => ({ ...prev, stock: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Low Stock Threshold"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.lowStockThreshold}
                onChangeText={text => setFormData(prev => ({ ...prev, lowStockThreshold: text }))}
              />

              <Text style={styles.inputLabel}>Type:</Text>
              <View style={styles.dropdownContainer}>
                {MATERIAL_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.dropdownOption, formData.type === type && styles.dropdownOptionActive]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownText, formData.type === type && styles.dropdownTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Unit:</Text>
              <View style={styles.dropdownContainer}>
                {UNIT_TYPES.map(unit => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.dropdownOption, formData.unit === unit && styles.dropdownOptionActive]}
                    onPress={() => setFormData(prev => ({ ...prev, unit }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownText, formData.unit === unit && styles.dropdownTextActive]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Available:</Text>
                <Switch
                  value={formData.isAvailable}
                  onValueChange={value => setFormData(prev => ({ ...prev, isAvailable: value }))}
                  trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleAddEdit}
                  activeOpacity={0.8}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingMaterial ? 'Update' : 'Add'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Source Bottom Sheet */}
      <Modal
        visible={showImageSourceSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowImageSourceSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowImageSourceSheet(false)}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Select Image Source</Text>
            <TouchableOpacity style={styles.sheetOption} onPress={pickImageFromCamera} activeOpacity={0.7}>
              <Text style={styles.sheetOptionIcon}>📷</Text>
              <Text style={styles.sheetOptionText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={pickImageFromLibrary} activeOpacity={0.7}>
              <Text style={styles.sheetOptionIcon}>🖼️</Text>
              <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetCancelOption}
              onPress={() => setShowImageSourceSheet(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    flexGrow: 1,
  },
  // Material Card - Larger View
  materialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    height: CARD_HEIGHT,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    height: CARD_HEIGHT * 0.4,
  },
  imageContainer: {
    flex: 0.5,
  },
  materialThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  materialThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cardTopActions: {
    flex: 0.5,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  editButtonTop: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonTop: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  materialContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  materialHeader: {
    marginBottom: 14,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  materialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  materialDetails: {
    flex: 1,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  loader: {
    marginVertical: 16,
  },
  emptyContainer: {
    padding: 40,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '92%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  imagePicker: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  imagePickerIcon: {
    fontSize: 28,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  imagePickerSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  imagePreviewContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFC',
  },
  imagePreviewActions: {
    flexDirection: 'row',
    gap: 0,
  },
  changeImageButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  changeImageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  removeImageButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  removeImageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
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
    textTransform: 'capitalize',
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
    marginBottom: 8,
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetOptionIcon: {
    fontSize: 22,
  },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  sheetCancelOption: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  editButtonText: {
    fontSize: 13,
    color: '#1E3A5F',
    fontWeight: '700',
  },
  deleteButtonText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '700',
  },
});

export default MaterialsSection;
