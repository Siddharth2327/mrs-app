import React, { useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from './components/Homepage/Header';
import DeliveryLocation from './components/Homepage/DeliveryLocation';
import SearchBar from './components/Homepage/SearchBar';
import ServiceCards from './components/Homepage/ServiceCards';
import QuickMaterials from './components/Homepage/QuickMaterials';
import WhyChooseUs from './components/Homepage/WhyChooseUs';
import RecentOrders from './components/Homepage/RecentOrders';
import BottomNavigation from './components/Navigation/BottomNavigation';

const HomePage = () => {
  // Animation values for each section
  const deliveryAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const serviceAnim = useRef(new Animated.Value(0)).current;
  const materialsAnim = useRef(new Animated.Value(0)).current;
  const whyChooseAnim = useRef(new Animated.Value(0)).current;
  const ordersAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation sequence
    const animations = [
      { anim: deliveryAnim, delay: 0 },
      { anim: searchAnim, delay: 100 },
      { anim: serviceAnim, delay: 200 },
      { anim: materialsAnim, delay: 300 },
      { anim: whyChooseAnim, delay: 400 },
      { anim: ordersAnim, delay: 500 },
    ];

    animations.forEach(({ anim, delay }) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }).start();
    });
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <Animated.View style={createAnimatedStyle(deliveryAnim)}>
          <DeliveryLocation />
        </Animated.View>

        <Animated.View style={createAnimatedStyle(searchAnim)}>
          <SearchBar />
        </Animated.View>

        <Animated.View style={createAnimatedStyle(serviceAnim)}>
          <ServiceCards />
        </Animated.View>

        <Animated.View style={createAnimatedStyle(materialsAnim)}>
          <QuickMaterials />
        </Animated.View>

        <Animated.View style={createAnimatedStyle(whyChooseAnim)}>
          <WhyChooseUs />
        </Animated.View>

        <Animated.View style={createAnimatedStyle(ordersAnim)}>
          <RecentOrders />
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation activeTab="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 100,
  },
});

export default HomePage;