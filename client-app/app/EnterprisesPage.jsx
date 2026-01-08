import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';  // ← Navigation ready
import { SafeAreaView } from 'react-native-safe-area-context';

import EnterprisesHeader from './components/Enterprisespage/EnterprisesHeader';
import EnterprisesSearch from './components/Enterprisespage/EnterprisesSearch';
import CategoryFilter from './components/Enterprisespage/CategoryFilter';
import ProductCard from './components/Enterprisespage/ProductCard';
import CartFooter from './components/Enterprisespage/CartFooter';
import BottomNavigation from './components/Navigation/BottomNavigation';

export default function EnterprisesPage() {  // ← Better name
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});

  // Sample products (from planner [file:1])
  const products = [
    {
      id: 1,
      name: 'River Sand',
      description: 'Fine quality river sand for construction',
      price: 65,
      originalPrice: 75,
      discount: 10,
      unit: '/cubic ft',
      iconType: 'circle',
      iconColor: '#F4A460',
      category: 'Sand',
      stock: 150,
    },
    {
      id: 2,
      name: 'M-Sand',
      description: 'Manufactured sand, eco-friendly',
      price: 55,
      unit: '/cubic ft',
      iconType: 'cube',
      iconColor: '#B0B0B0',
      category: 'M-Sand',
      stock: 200,
    },
    {
      id: 3,
      name: 'P-Sand',
      description: 'Plastering sand for smooth finish',
      price: 60,
      unit: '/cubic ft',
      iconType: 'circle',
      iconColor: '#D8BFD8',
      category: 'P-Sand',
      stock: 120,
    },
    {
      id: 4,
      name: 'Steel Rods 8mm',
      description: 'TMT steel bars for reinforcement',
      price: 72,
      unit: '/kg',
      iconType: 'gear',
      iconColor: '#778899',
      category: 'Steel',
      stock: 500,
    },
    {
      id: 5,
      name: 'Steel Rods 10mm',
      description: 'High strength TMT bars',
      price: 75,
      originalPrice: 83,
      discount: 8,
      unit: '/kg',
      iconType: 'gear',
      iconColor: '#778899',
      category: 'Steel',
      stock: 300,
    },
    {
      id: 6,
      name: 'Red Clay Bricks',
      description: 'Standard construction bricks',
      price: 8,
      unit: '/piece',
      iconType: 'cube',
      iconColor: '#CD5C5C',
      category: 'Bricks',
      stock: 10000,
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = useCallback((productId, quantity) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (quantity === 0) {
        delete newCart[productId];
      } else {
        const product = products.find((p) => p.id === productId);
        if (product) {
          newCart[productId] = {
            ...product,
            quantity,
            subtotal: product.price * quantity,
          };
        }
      }
      return newCart;
    });
  }, [products]);

  const handleAddToCart = useCallback((product) => {
    handleQuantityChange(product.id, 1);
  }, [handleQuantityChange]);

  const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Object.values(cart).reduce((sum, item) => sum + item.subtotal, 0);

  const handleViewCart = () => {
    router.push('/cart');  // ← Future cart page
  };

  const handleBack = () => {
    router.back();  // ← Back to home
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <EnterprisesHeader onBack={handleBack} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EnterprisesSearch 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <View style={styles.productList}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onQuantityChange={handleQuantityChange}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No materials found</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <CartFooter 
        itemCount={cartItemCount}
        totalPrice={cartTotal}
        onViewCart={handleViewCart}
      />
      
      <BottomNavigation />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  bottomPadding: {
    height: 120,  // ← Space for CartFooter + BottomNav
  },
});
