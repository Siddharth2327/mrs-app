import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/Enterprisespage/AppHeader';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, userData, signOut } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Animation values
  const userCardAnim = useRef(new Animated.Value(0)).current;
  const accountSectionAnim = useRef(new Animated.Value(0)).current;
  const supportSectionAnim = useRef(new Animated.Value(0)).current;
  const logoutButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Staggered animations
      Animated.stagger(150, [
        Animated.timing(userCardAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(accountSectionAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(supportSectionAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoutButtonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, isAuthenticated]);

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

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              router.replace('/');
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
    );
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthContainer}>
          <Ionicons name="person-circle-outline" size={100} color="#1E3A5F" />
          <Text style={styles.notAuthTitle}>Not Logged In</Text>
          <Text style={styles.notAuthText}>
            Please login to view your profile and access all features
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFF" />
            <Text style={styles.loginButtonText}>Login / Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonAlt}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AppHeader
          title="Profile"
          onBack={() => router.back()}
        />

        {/* User Info Card */}
        <Animated.View style={[styles.userCard, createAnimatedStyle(userCardAnim)]}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={36} color="#1E3A5F" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.name || 'User'}</Text>
            <Text style={styles.userPhone}>{userData?.phone || ''}</Text>
            {userData?.email && !userData.email.includes('@riswana.app') && (
              <Text style={styles.userEmail}>{userData.email}</Text>
            )}
          </View>
        </Animated.View>

        {/* Account Settings */}
        <Animated.View style={[styles.section, createAnimatedStyle(accountSectionAnim)]}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuSection}>
            {/* Change Password */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/profile/change-password')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="lock-closed" size={18} color="#1E3A5F" />
                </View>
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Saved Addresses */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/profile/addresses')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="location" size={18} color="#1E3A5F" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemText}>Saved Addresses</Text>
                  <Text style={styles.menuItemSubtext}>
                    {userData?.addresses?.length || 0} addresses saved
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* My Orders */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/OrdersPage')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="receipt" size={18} color="#1E3A5F" />
                </View>
                <Text style={styles.menuItemText}>My Orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Admin Panel - Only visible to admin users */}
            {userData?.role === 'admin' && (
              <TouchableOpacity
                style={[styles.menuItem, styles.adminMenuItem]}
                onPress={() => router.push('/(protected)/admin')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="shield-checkmark" size={18} color="#16A34A" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={[styles.menuItemText, { color: '#16A34A', fontWeight: '700' }]}>
                      Admin Panel
                    </Text>
                    <Text style={styles.menuItemSubtext}>Manage app data</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#16A34A" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Support & Legal */}
        <Animated.View style={[styles.section, createAnimatedStyle(supportSectionAnim)]}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="help-circle" size={18} color="#64748B" />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="document-text" size={18} color="#64748B" />
                </View>
                <Text style={styles.menuItemText}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#64748B" />
                </View>
                <Text style={styles.menuItemText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View style={createAnimatedStyle(logoutButtonAnim)}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notAuthTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 12,
  },
  notAuthText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  backButtonAlt: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 14,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E3A5F',
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  menuSection: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  adminMenuItem: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuItemSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  bottomSpace: {
    height: 32,
  },
});