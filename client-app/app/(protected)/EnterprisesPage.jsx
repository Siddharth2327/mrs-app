import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';

import EnterprisesHeader from '../components/Enterprisespage/AppHeader';
import EnterprisesSearch from '../components/Enterprisespage/EnterprisesSearch';
import CategoryFilter from '../components/Enterprisespage/CategoryFilter';
import ProductCard from '../components/Enterprisespage/ProductCard';
import CartFooter from '../components/Enterprisespage/CartFooter';
import BottomNavigation from '../components/Navigation/BottomNavigation';
import useCartStore from '../../store/cartStore';

// Animated Product Card Wrapper
const AnimatedProductCard = ({ product, index, onAddToCart, onQuantityChange, cartQuantity }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 500,
      delay: index * 100, // Stagger by 100ms per card
      useNativeDriver: true,
    }).start();
  }, []);

  const animatedStyle = {
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
        onQuantityChange={onQuantityChange}
        cartQuantity={cartQuantity}
      />
    </Animated.View>
  );
};

export default function EnterprisesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation for header sections
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;

  // Zustand cart store
  const { items, addItem, updateQuantity, getItemCount, getTotal } = useCartStore();

  // Animate header sections on mount
  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch materials from Firebase
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('materials')
      .where('isDeleted', '==', false)
      .where('isAvailable', '==', true)
      .orderBy('name', 'asc')
      .onSnapshot(
        (snapshot) => {
          const fetchedMaterials = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMaterials(fetchedMaterials);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching materials:', err);
          setError('Failed to load materials');
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // Filter materials based on search and category
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || material.type === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = useCallback(
    (materialId, quantity) => {
      updateQuantity(materialId, quantity);
    },
    [updateQuantity]
  );

  const handleAddToCart = useCallback(
    (material) => {
      addItem(material, 1);
    },
    [addItem]
  );

  const cartItemCount = getItemCount();
  const cartTotal = getTotal();

  const handleViewCart = () => {
    router.push('/CartPage');
  };

  const handleBack = () => {
    router.back();
  };

  const createAnimatedStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <EnterprisesHeader title='Construction Materials' onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
        <BottomNavigation activeTab="Enterprises" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <EnterprisesHeader onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <BottomNavigation activeTab="Enterprises" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <EnterprisesHeader onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={createAnimatedStyle(searchAnim)}>
          <EnterprisesSearch value={searchQuery} onChangeText={setSearchQuery} />
        </Animated.View>

        <Animated.View style={createAnimatedStyle(filterAnim)}>
          <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </Animated.View>

        <View style={styles.productList}>
          {filteredMaterials.length > 0 ? (
            <View style={styles.grid}>
              {filteredMaterials.map((material, index) => (
                <View key={material.id} style={styles.gridItem}>
                  <AnimatedProductCard
                    product={material}
                    index={index}
                    onAddToCart={handleAddToCart}
                    onQuantityChange={handleQuantityChange}
                    cartQuantity={items[material.id]?.quantity || 0}
                  />
                </View>
              ))}
            </View>
          ) : (

            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No materials found</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <CartFooter itemCount={cartItemCount} totalPrice={cartTotal} onViewCart={handleViewCart} />

      <BottomNavigation activeTab="Enterprises" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  productList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
  },
  bottomPadding: {
    height: 180,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridItem: {
    width: '48%',
    marginBottom: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
  },
});