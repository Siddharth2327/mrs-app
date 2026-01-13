import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const pathname = usePathname(); // current route

  useEffect(() => {
    if (pathname === '/') setActiveTab('Home');
    else if (pathname === '/TransportPage') setActiveTab('Transports');
    else if (pathname === '/EnterprisesPage') setActiveTab('Enterprises');
    else if (pathname === '/OrdersPage') setActiveTab('Orders');
    else if (pathname === '/CartPage') setActiveTab('Cart');
  }, [pathname]);

  const tabs = [
    { id: 1, name: 'Home',        icon: 'home-outline',      activeIcon: 'home',        route: '/' },
    { id: 2, name: 'Transports',  icon: 'car-outline',       activeIcon: 'car',         route: '/TransportPage' },
    { id: 3, name: 'Enterprises', icon: 'briefcase-outline', activeIcon: 'briefcase',   route: '/EnterprisesPage' },
    { id: 4, name: 'Orders',      icon: 'clipboard-outline', activeIcon: 'clipboard',   route: '/OrdersPage' },
    { id: 5, name: 'Cart',        icon: 'cart-outline',      activeIcon: 'cart',        route: '/CartPage' },
  ];

  const handleTabPress = (tab) => {
    setActiveTab(tab.name);
    router.push(tab.route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => handleTabPress(tab)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === tab.name ? tab.activeIcon : tab.icon}
            size={24}
            color={activeTab === tab.name ? '#3B82F6' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.name && styles.activeTabText,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '700',
  },
});

export default BottomNavigation;
