import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../components/Enterprisespage/AppHeader';
import DeliveryLocation from '../components/Homepage/DeliveryLocation';
import OrderFilterTabs from '../components/OrdersPage/OrderFilterTabs';
import OrderCard from '../components/OrdersPage/OrderCard';
import BottomNavigation from '../components/Navigation/BottomNavigation';
import useAuthStore from '../../store/authStore';
import useOrderStore from '../../store/orderStore';

// Animated Order Card Component
const AnimatedOrderCard = ({ order, index, onPress }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
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
      <OrderCard order={order} onPress={onPress} />
    </Animated.View>
  );
};

export default function OrdersPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');


  const user = useAuthStore((state) => state.user);
  const { orders, isLoading, subscribeToOrders } = useOrderStore();
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToOrders();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Animation values
  const deliveryLocationAnim = useRef(new Animated.Value(0)).current;
  const filterTabsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate header components
    Animated.stagger(150, [
      Animated.timing(deliveryLocationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(filterTabsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const createAnimatedStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });


  // Filter orders based on active filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Transport') return order.type === 'transport';
      if (activeFilter === 'Enterprise') return order.type === 'enterprise';
      if (activeFilter === 'Combined') return order.type === 'combined';
      return true;
    });
  }, [orders, activeFilter]);

  const handleOrderPress = useCallback(
    (order) => {
      router.push(`/orders/${order.id}`);
    },
    [router]
  );

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const hasOrders = filteredOrders.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <AppHeader
        title="My Orders"
        onBack={() => router.back()}
      />

      {/* Delivery Location */}
      <Animated.View style={createAnimatedStyle(deliveryLocationAnim)}>
        <DeliveryLocation />
      </Animated.View>

      {/* Filter Tabs */}
      <Animated.View style={createAnimatedStyle(filterTabsAnim)}>
        <OrderFilterTabs
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.ordersContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E3A5F" />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : hasOrders ? (
            filteredOrders.map((order, index) => (
              <AnimatedOrderCard
                key={order.id}
                order={order}
                index={index}
                onPress={() => handleOrderPress(order)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="clipboard-outline"
                size={64}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'All'
                  ? 'Your orders will appear here'
                  : `No ${activeFilter.toLowerCase()} orders yet`}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/EnterprisesPage')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>
                  Start Ordering
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation activeTab="Orders" />
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
  ordersContainer: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});