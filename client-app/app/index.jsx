import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from './components/Homepage/Header';
import DeliveryLocation from './components/Homepage/DeliveryLocation';
import SearchBar from './components/Homepage/SearchBar';
import ServiceCards from './components/Homepage/ServiceCards';
// import DiscountBanner from './components/Homepage/DiscountBanner';
import QuickMaterials from './components/Homepage/QuickMaterials';
import WhyChooseUs from './components/Homepage/WhyChooseUs';
import RecentOrders from './components/Homepage/RecentOrders';
import BottomNavigation from './components/Navigation/BottomNavigation';

const HomePage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <DeliveryLocation />
        <SearchBar />
        <ServiceCards />
        {/* <DiscountBanner /> */}
        <QuickMaterials />
        <WhyChooseUs />
        <RecentOrders />
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
  scrollView: {},
  bottomPadding: {
    height: 20,
  },
});

export default HomePage;
