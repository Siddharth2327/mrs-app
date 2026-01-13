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
      signUp: async (name, phone, password) => {
        try {
          const email = `${phone}@riswana.app`;
          const userCredential = await auth().createUserWithEmailAndPassword(email, password);
          
          // Create user document in Firestore
          const userData = {
            name: name.trim(),
            phone: phone.trim(),
            email: email,
            createdAt: firestore.FieldValue.serverTimestamp(),
            membershipType: 'Member',
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
        // Don't persist user object as it contains non-serializable data
      }),
    }
  )
);

export default useAuthStore;