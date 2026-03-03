import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const MATERIALS_COLLECTION = 'materials';
const PAGE_SIZE = 20;

/**
 * Upload a material image to Firebase Storage
 * @param {string} localUri - Local file URI from image picker
 * @param {string} materialId - Material document ID (or temp name)
 * @returns {string} Download URL
 */
export const uploadMaterialImage = async (localUri, materialId) => {
  try {
    const filename = `materials/${materialId}_${Date.now()}.jpg`;
    const reference = storage().ref(filename);

    await reference.putFile(localUri);
    const downloadUrl = await reference.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading material image:', error);
    throw error;
  }
};

/**
 * Delete a material image from Firebase Storage by its URL
 * @param {string} imageUrl - The download URL of the image to delete
 */
export const deleteMaterialImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    const reference = storage().refFromURL(imageUrl);
    await reference.delete();
  } catch (error) {
    // Non-fatal: log but don't throw — image may have already been deleted
    console.warn('Could not delete material image:', error);
  }
};

/**
 * Get materials with pagination
 */
export const getMaterials = async (lastVisible = null) => {
  try {
    let query = firestore()
      .collection(MATERIALS_COLLECTION)
      .where('isDeleted', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(PAGE_SIZE);

    if (lastVisible) {
      query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();
    const materials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === PAGE_SIZE;

    return { materials, lastVisible: lastDoc, hasMore };
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

/**
 * Add a new material
 * Schema now includes: name, price, stock, lowStockThreshold, type, unit,
 *                      isAvailable, imageUrl, isDeleted, createdAt, updatedAt
 */
export const addMaterial = async (materialData) => {
  try {
    const timestamp = firestore.FieldValue.serverTimestamp();
    const material = {
      name: materialData.name,
      price: materialData.price,
      stock: materialData.stock,
      lowStockThreshold: materialData.lowStockThreshold,
      type: materialData.type,
      unit: materialData.unit,
      isAvailable: materialData.isAvailable,
      imageUrl: materialData.imageUrl || null,   // ← NEW FIELD
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await firestore()
      .collection(MATERIALS_COLLECTION)
      .add(material);

    return docRef.id;
  } catch (error) {
    console.error('Error adding material:', error);
    throw error;
  }
};

/**
 * Update an existing material
 * Pass imageUrl: null to clear the image, or a new URL to update it.
 */
export const updateMaterial = async (materialId, updates) => {
  try {
    await firestore()
      .collection(MATERIALS_COLLECTION)
      .doc(materialId)
      .update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

/**
 * Soft delete a material (also cleans up its image from Storage)
 */
export const softDeleteMaterial = async (materialId, imageUrl = null) => {
  try {
    // Delete image from Storage if present
    if (imageUrl) {
      await deleteMaterialImage(imageUrl);
    }

    await firestore()
      .collection(MATERIALS_COLLECTION)
      .doc(materialId)
      .update({
        isDeleted: true,
        imageUrl: null,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

/**
 * Toggle material availability
 */
export const toggleMaterialAvailability = async (materialId, isAvailable) => {
  try {
    await firestore()
      .collection(MATERIALS_COLLECTION)
      .doc(materialId)
      .update({
        isAvailable,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error toggling material availability:', error);
    throw error;
  }
};

/**
 * Update material stock
 */
export const updateMaterialStock = async (materialId, newStock) => {
  try {
    await firestore()
      .collection(MATERIALS_COLLECTION)
      .doc(materialId)
      .update({
        stock: newStock,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error updating material stock:', error);
    throw error;
  }
};

/**
 * Deduct stock for enterprise order items (called when order is delivered)
 */
export const deductStockForOrder = async (orderItems) => {
  try {
    const batch = firestore().batch();

    for (const item of orderItems) {
      const materialsSnapshot = await firestore()
        .collection(MATERIALS_COLLECTION)
        .where('name', '==', item.name)
        .where('isDeleted', '==', false)
        .limit(1)
        .get();

      if (!materialsSnapshot.empty) {
        const materialDoc = materialsSnapshot.docs[0];
        const currentStock = materialDoc.data().stock;
        const newStock = Math.max(0, currentStock - item.qty);

        batch.update(materialDoc.ref, {
          stock: newStock,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    await batch.commit();
  } catch (error) {
    console.error('Error deducting stock for order:', error);
    throw error;
  }
};

/**
 * Get low stock materials
 */
export const getLowStockMaterials = async () => {
  try {
    const snapshot = await firestore()
      .collection(MATERIALS_COLLECTION)
      .where('isDeleted', '==', false)
      .get();

    const outOfStock = [];
    const lowStock = [];

    snapshot.docs.forEach(doc => {
      const material = { id: doc.id, ...doc.data() };
      if (material.stock === 0) {
        outOfStock.push(material);
      } else if (material.stock <= material.lowStockThreshold) {
        lowStock.push(material);
      }
    });

    return { outOfStock, lowStock };
  } catch (error) {
    console.error('Error fetching low stock materials:', error);
    throw error;
  }
};

/**
 * Search materials by name
 */
export const searchMaterials = async (searchQuery) => {
  try {
    const snapshot = await firestore()
      .collection(MATERIALS_COLLECTION)
      .where('isDeleted', '==', false)
      .orderBy('name')
      .startAt(searchQuery)
      .endAt(searchQuery + '\uf8ff')
      .limit(20)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error searching materials:', error);
    throw error;
  }
};

/**
 * Get material by ID
 */
export const getMaterialById = async (materialId) => {
  try {
    const doc = await firestore()
      .collection(MATERIALS_COLLECTION)
      .doc(materialId)
      .get();

    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching material by ID:', error);
    throw error;
  }
};