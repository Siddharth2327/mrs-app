import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Header = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {/* Logo + Company Name */}
      <View style={styles.leftContent}>
        <Image 
          source={require('../../../assets/icon.png')}  // change logo if needed
          style={styles.logo}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.companyName}>Riswana Transport</Text>
          <Text style={styles.memberLabel}>Delivering Trust</Text>
        </View>
      </View>

      {/* Right Actions */}
      <View style={styles.headerRight}>
        {/* Notification */}
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/auth')}
        >
          <Ionicons name="log-in-outline" size={18} color="#FF8C42" />
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 40,
    marginRight: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  memberLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C42',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FF8C42',
    borderRadius: 6,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C42',
  },
});

export default Header;
