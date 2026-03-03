import firestore from '@react-native-firebase/firestore';

const VEHICLES_COLLECTION = 'vehicles';
const PAGE_SIZE = 20;

/**
 * Get vehicles with pagination
 */
export const getVehicles = async (lastVisible = null) => {
  try {
    let query = firestore()
      .collection(VEHICLES_COLLECTION)
      .where('isDeleted', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(PAGE_SIZE);

    if (lastVisible) {
      query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();
    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === PAGE_SIZE;

    return { vehicles, lastVisible: lastDoc, hasMore };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

/**
 * Add a new vehicle
 */
export const addVehicle = async (vehicleData) => {
  try {
    const timestamp = firestore.FieldValue.serverTimestamp();
    const vehicle = {
      ...vehicleData,
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await firestore()
      .collection(VEHICLES_COLLECTION)
      .add(vehicle);

    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

/**
 * Update an existing vehicle
 */
export const updateVehicle = async (vehicleId, updates) => {
  try {
    await firestore()
      .collection(VEHICLES_COLLECTION)
      .doc(vehicleId)
      .update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

/**
 * Soft delete a vehicle
 */
export const softDeleteVehicle = async (vehicleId) => {
  try {
    await firestore()
      .collection(VEHICLES_COLLECTION)
      .doc(vehicleId)
      .update({
        isDeleted: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

/**
 * Toggle vehicle availability
 */
export const toggleVehicleAvailability = async (vehicleId, availability) => {
  try {
    await firestore()
      .collection(VEHICLES_COLLECTION)
      .doc(vehicleId)
      .update({
        availability,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error toggling vehicle availability:', error);
    throw error;
  }
};

/**
 * Update vehicle stock
 */
export const updateVehicleStock = async (vehicleId, newStock) => {
  try {
    await firestore()
      .collection(VEHICLES_COLLECTION)
      .doc(vehicleId)
      .update({
        stock: newStock,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error updating vehicle stock:', error);
    throw error;
  }
};

/**
 * Get low stock vehicles
 */
export const getLowStockVehicles = async () => {
  try {
    const snapshot = await firestore()
      .collection(VEHICLES_COLLECTION)
      .where('isDeleted', '==', false)
      .get();

    const outOfStock = [];
    const lowStock = [];

    snapshot.docs.forEach(doc => {
      const vehicle = { id: doc.id, ...doc.data() };
      if (vehicle.stock === 0) {
        outOfStock.push(vehicle);
      } else if (vehicle.stock <= vehicle.lowStockThreshold) {
        lowStock.push(vehicle);
      }
    });

    return { outOfStock, lowStock };
  } catch (error) {
    console.error('Error fetching low stock vehicles:', error);
    throw error;
  }
};

/**
 * Get active vehicles count
 */
export const getActiveVehiclesCount = async () => {
  try {
    const snapshot = await firestore()
      .collection(VEHICLES_COLLECTION)
      .where('isDeleted', '==', false)
      .where('availability', '==', true)
      .where('stock', '>', 0)
      .get();

    return snapshot.size;
  } catch (error) {
    console.error('Error fetching active vehicles count:', error);
    throw error;
  }
};

/**
 * Search vehicles by name
 */
export const searchVehicles = async (searchQuery) => {
  try {
    const snapshot = await firestore()
      .collection(VEHICLES_COLLECTION)
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
    console.error('Error searching vehicles:', error);
    throw error;
  }
};

/**
 * Get vehicle by ID
 */
export const getVehicleById = async (vehicleId) => {
  try {
    const doc = await firestore()
      .collection(VEHICLES_COLLECTION)
      .doc(vehicleId)
      .get();

    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    throw error;
  }
};