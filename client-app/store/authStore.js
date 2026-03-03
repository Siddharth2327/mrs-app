import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      userData: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setUserData: (userData) => set({ userData }),

      setLoading: (isLoading) => set({ isLoading }),

      // Initialize auth listener
      initializeAuth: () => {
        const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            set({ user: firebaseUser, isAuthenticated: true });

            // Fetch user data from Firestore
            try {
              const userDoc = await firestore()
                .collection('users')
                .doc(firebaseUser.uid)
                .get();

              if (userDoc.exists) {
                set({ userData: userDoc.data() });
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          } else {
            set({ user: null, userData: null, isAuthenticated: false });
          }
          set({ isLoading: false });
        });

        return unsubscribe;
      },

      // Sign In
      signIn: async (phone, password) => {
        try {
          const email = `${phone}@riswana.app`;
          const userCredential = await auth().signInWithEmailAndPassword(email, password);

          // Fetch user data
          const userDoc = await firestore()
            .collection('users')
            .doc(userCredential.user.uid)
            .get();

          if (userDoc.exists) {
            set({ userData: userDoc.data() });
          }

          return { success: true };
        } catch (error) {
          console.error('Sign in error:', error);
          return { success: false, error: error.code };
        }
      },

      // Sign Up
      signUp: async (name, phone, password, email = '') => {
        try {
          const userEmail = email.trim() || `${phone}@riswana.app`;

          const userCredential = await auth().createUserWithEmailAndPassword(userEmail, password);

          // Create user document in Firestore
          const userData = {
            name: name.trim(),
            phone: phone.trim(),
            email: userEmail,
            role: 'member',
            addresses: [],
            createdAt: firestore.FieldValue.serverTimestamp(),
          };

          await firestore()
            .collection('users')
            .doc(userCredential.user.uid)
            .set(userData);

          set({ userData });
          return { success: true };
        } catch (error) {
          console.error('Sign up error:', error);
          return { success: false, error: error.code };
        }
      },

      // Sign Out
      signOut: async () => {
        try {
          await auth().signOut();
          await AsyncStorage.clear();
          set({ user: null, userData: null, isAuthenticated: false });
          return { success: true };
        } catch (error) {
          console.error('Sign out error:', error);
          return { success: false, error };
        }
      },

      // Update User Data
      updateUserData: async (updates) => {
        const { user, userData } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        try {
          await firestore()
            .collection('users')
            .doc(user.uid)
            .update(updates);

          set({ userData: { ...userData, ...updates } });
          return { success: true };
        } catch (error) {
          console.error('Update user data error:', error);
          return { success: false, error };
        }
      },

      // Get Default Address
      getDefaultAddress: () => {
        const { userData } = get();
        if (!userData?.addresses) return null;
        return userData.addresses.find(addr => addr.isDefault) || userData.addresses[0] || null;
      },

      // Add Address
      addAddress: async (address) => {
        const { user, userData } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        try {
          const newAddress = {
            ...address,
            id: Date.now().toString(),
            isDefault: userData?.addresses?.length === 0,
          };

          const updatedAddresses = [...(userData?.addresses || []), newAddress];

          await firestore()
            .collection('users')
            .doc(user.uid)
            .update({ addresses: updatedAddresses });

          set({ userData: { ...userData, addresses: updatedAddresses } });
          return { success: true, address: newAddress };
        } catch (error) {
          console.error('Add address error:', error);
          return { success: false, error };
        }
      },

      // Update Address
      updateAddress: async (addressId, updates) => {
        const { user, userData } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        try {
          const updatedAddresses = userData.addresses.map((addr) =>
            addr.id === addressId ? { ...addr, ...updates } : addr
          );

          await firestore()
            .collection('users')
            .doc(user.uid)
            .update({ addresses: updatedAddresses });

          set({ userData: { ...userData, addresses: updatedAddresses } });
          return { success: true };
        } catch (error) {
          console.error('Update address error:', error);
          return { success: false, error };
        }
      },

      // Delete Address
      deleteAddress: async (addressId) => {
        const { user, userData } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        try {
          const updatedAddresses = userData.addresses.filter((addr) => addr.id !== addressId);

          await firestore()
            .collection('users')
            .doc(user.uid)
            .update({ addresses: updatedAddresses });

          set({ userData: { ...userData, addresses: updatedAddresses } });
          return { success: true };
        } catch (error) {
          console.error('Delete address error:', error);
          return { success: false, error };
        }
      },

      // Set Default Address
      setDefaultAddress: async (addressId) => {
        const { user, userData } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        try {
          const updatedAddresses = userData.addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId,
          }));

          await firestore()
            .collection('users')
            .doc(user.uid)
            .update({ addresses: updatedAddresses });

          set({ userData: { ...userData, addresses: updatedAddresses } });
          return { success: true };
        } catch (error) {
          console.error('Set default address error:', error);
          return { success: false, error };
        }
      },

      // Reset store
      resetStore: () => set({
        user: null,
        userData: null,
        isAuthenticated: false,
        isLoading: false,
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userData: state.userData,
      }),
    }
  )
);

export default useAuthStore;