import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const useLocationStore = create(
  persist(
    (set, get) => ({
      // State
      currentLocation: null,
      deliveryAddress: {
        fullAddress: 'Chennai, Tamil Nadu 600001',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        latitude: 13.0827,
        longitude: 80.2707,
      },
      savedAddresses: [],
      isLocationLoading: false,
      locationPermissionGranted: false,

      // Actions
      setCurrentLocation: (location) => set({ currentLocation: location }),

      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      setLocationLoading: (isLoading) => set({ isLocationLoading: isLoading }),

      setLocationPermission: (granted) => set({ locationPermissionGranted: granted }),

      // Request location permission
      requestLocationPermission: async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          const granted = status === 'granted';
          set({ locationPermissionGranted: granted });
          return granted;
        } catch (error) {
          console.error('Error requesting location permission:', error);
          return false;
        }
      },

      // Get current location
      getCurrentLocation: async () => {
        const { locationPermissionGranted } = get();
        
        if (!locationPermissionGranted) {
          const granted = await get().requestLocationPermission();
          if (!granted) {
            return { success: false, error: 'Location permission denied' };
          }
        }

        set({ isLocationLoading: true });
        
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          set({ 
            currentLocation: location,
            isLocationLoading: false,
          });
          
          // Reverse geocode to get address
          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          if (address) {
            const fullAddress = `${address.name || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
            set({
              deliveryAddress: {
                fullAddress,
                city: address.city || '',
                state: address.region || '',
                pincode: address.postalCode || '',
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                street: address.street || '',
                name: address.name || '',
              },
            });
          }
          
          return { success: true, location };
        } catch (error) {
          console.error('Error getting current location:', error);
          set({ isLocationLoading: false });
          return { success: false, error };
        }
      },

      // Add saved address
      addSavedAddress: (address) => {
        const { savedAddresses } = get();
        const newAddress = {
          id: Date.now().toString(),
          ...address,
          createdAt: new Date().toISOString(),
        };
        set({ savedAddresses: [...savedAddresses, newAddress] });
        return newAddress;
      },

      // Update saved address
      updateSavedAddress: (id, updates) => {
        const { savedAddresses } = get();
        const updatedAddresses = savedAddresses.map((addr) =>
          addr.id === id ? { ...addr, ...updates } : addr
        );
        set({ savedAddresses: updatedAddresses });
      },

      // Delete saved address
      deleteSavedAddress: (id) => {
        const { savedAddresses } = get();
        const filteredAddresses = savedAddresses.filter((addr) => addr.id !== id);
        set({ savedAddresses: filteredAddresses });
      },

      // Set address as delivery address
      selectSavedAddress: (id) => {
        const { savedAddresses } = get();
        const address = savedAddresses.find((addr) => addr.id === id);
        if (address) {
          set({ deliveryAddress: address });
        }
      },

      // Geocode address (convert address string to coordinates)
      geocodeAddress: async (addressString) => {
        try {
          const locations = await Location.geocodeAsync(addressString);
          if (locations.length > 0) {
            return { success: true, location: locations[0] };
          }
          return { success: false, error: 'Address not found' };
        } catch (error) {
          console.error('Error geocoding address:', error);
          return { success: false, error };
        }
      },

      // Calculate distance between two points (in km)
      calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance.toFixed(2);
      },

      // Reset location store
      resetLocationStore: () => set({
        currentLocation: null,
        deliveryAddress: {
          fullAddress: 'Chennai, Tamil Nadu 600001',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          latitude: 13.0827,
          longitude: 80.2707,
        },
        savedAddresses: [],
        isLocationLoading: false,
      }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        deliveryAddress: state.deliveryAddress,
        savedAddresses: state.savedAddresses,
        locationPermissionGranted: state.locationPermissionGranted,
      }),
    }
  )
);

export default useLocationStore;