import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

const AnimatedTab = ({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Scale back to normal after bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={22}
          color={isActive ? '#1E3A5F' : '#94A3B8'}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabText,
          isActive && styles.activeTabText,
        ]}
      >
        {tab.name}
      </Text>
    </TouchableOpacity>
  );
};

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') setActiveTab('Home');
    else if (pathname === '/TransportPage') setActiveTab('Transports');
    else if (pathname === '/EnterprisesPage') setActiveTab('Enterprises');
    else if (pathname === '/OrdersPage') setActiveTab('Orders');
    else if (pathname === '/cart') setActiveTab('Cart');
    else if (pathname === '/profile') setActiveTab('Profile');
  }, [pathname]);

  const tabs = [
    { id: 1, name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/' },
    { id: 2, name: 'Transports', icon: 'car-outline', activeIcon: 'car', route: '/TransportPage' },
    { id: 3, name: 'Enterprises', icon: 'business-outline', activeIcon: 'business', route: '/EnterprisesPage' },
    { id: 4, name: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt', route: '/OrdersPage' },
    { id: 5, name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/profile' },
  ];

  const handleTabPress = (tab) => {
    setActiveTab(tab.name);
    router.push(tab.route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <AnimatedTab
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.name}
          onPress={() => handleTabPress(tab)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1E3A5F',
    fontWeight: '700',
  },
});

export default BottomNavigation;