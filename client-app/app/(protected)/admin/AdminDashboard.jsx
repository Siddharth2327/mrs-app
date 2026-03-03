import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../store/authStore';
import MaterialsSection from './MaterialsSection';
import TransportSection from './TransportSection';
import OrdersSection from './OrdersSection';
import AnalyticsSection from './AnalyticsSection';
import { getLowStockCounts } from '../../../services/analyticsService';

const TABS = {
  ANALYTICS: 'analytics',
  MATERIALS: 'materials',
  TRANSPORT: 'transport',
  ORDERS: 'orders',
};

const AdminDashboard = () => {
  const router = useRouter();
  const { userData, user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState(TABS.ANALYTICS);
  const [isLoading, setIsLoading] = useState(true);
  const [lowStockCounts, setLowStockCounts] = useState({ outOfStock: 0, lowStock: 0 });

  // Role Guard - Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        if (!user) {
          router.replace('/auth');
          return;
        }

        if (!userData || userData.role !== 'admin') {
          Alert.alert(
            'Access Denied',
            'You do not have permission to access the Admin Dashboard.',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin role:', error);
        Alert.alert('Error', 'Failed to verify admin access');
        router.back();
      }
    };

    checkAdminRole();
  }, [user, userData]);

  // Real-time low stock monitoring
  useEffect(() => {
    if (!isLoading && userData?.role === 'admin') {
      const unsubscribe = getLowStockCounts((counts) => {
        setLowStockCounts(counts);
      });

      return () => unsubscribe && unsubscribe();
    }
  }, [isLoading, userData]);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth');
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text style={styles.loadingText}>Verifying access...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <Image 
          source={require('../../../assets/komban-logo-green.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Admin Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#1E3A5F" />
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome back, {userData?.name}</Text>
      </View>

      {/* Low Stock Alerts */}
      {(lowStockCounts.outOfStock > 0 || lowStockCounts.lowStock > 0) && (
        <View style={styles.alertsContainer}>
          {lowStockCounts.outOfStock > 0 && (
            <View style={styles.alertBadge}>
              <View style={styles.alertDot} />
              <Text style={styles.alertText}>{lowStockCounts.outOfStock} Out of Stock</Text>
            </View>
          )}
          {lowStockCounts.lowStock > 0 && (
            <View style={[styles.alertBadge, styles.alertBadgeWarning]}>
              <View style={[styles.alertDot, styles.alertDotWarning]} />
              <Text style={styles.alertText}>{lowStockCounts.lowStock} Low Stock</Text>
            </View>
          )}
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.ANALYTICS && styles.activeTab]}
            onPress={() => setActiveTab(TABS.ANALYTICS)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="stats-chart" 
              size={18} 
              color={activeTab === TABS.ANALYTICS ? '#1E3A5F' : '#64748B'} 
            />
            <Text style={[styles.tabText, activeTab === TABS.ANALYTICS && styles.activeTabText]}>
              Analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.MATERIALS && styles.activeTab]}
            onPress={() => setActiveTab(TABS.MATERIALS)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="cube" 
              size={18} 
              color={activeTab === TABS.MATERIALS ? '#1E3A5F' : '#64748B'} 
            />
            <Text style={[styles.tabText, activeTab === TABS.MATERIALS && styles.activeTabText]}>
              Materials
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.TRANSPORT && styles.activeTab]}
            onPress={() => setActiveTab(TABS.TRANSPORT)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="car" 
              size={18} 
              color={activeTab === TABS.TRANSPORT ? '#1E3A5F' : '#64748B'} 
            />
            <Text style={[styles.tabText, activeTab === TABS.TRANSPORT && styles.activeTabText]}>
              Transport
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.ORDERS && styles.activeTab]}
            onPress={() => setActiveTab(TABS.ORDERS)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="receipt" 
              size={18} 
              color={activeTab === TABS.ORDERS ? '#1E3A5F' : '#64748B'} 
            />
            <Text style={[styles.tabText, activeTab === TABS.ORDERS && styles.activeTabText]}>
              Orders
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === TABS.ANALYTICS && <AnalyticsSection />}
        {activeTab === TABS.MATERIALS && <MaterialsSection />}
        {activeTab === TABS.TRANSPORT && <TransportSection />}
        {activeTab === TABS.ORDERS && <OrdersSection />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 46,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 8,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A5F',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  alertsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  alertBadgeWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  alertDotWarning: {
    backgroundColor: '#F59E0B',
  },
  alertText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabScrollContent: {
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#1E3A5F',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});

export default AdminDashboard;
