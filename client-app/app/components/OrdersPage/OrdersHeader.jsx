import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrdersHeader = ({ onNotificationPress, onMemberPress }) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Image 
          source={require('../../../assets/icon.png')}  // ← Fixed path from components/
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>My Orders</Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.memberButton}
          onPress={onMemberPress}
          activeOpacity={0.7}
        >
          <Ionicons name="crown" size={20} color="#F59E0B" />
          <Text style={styles.memberText}>Member</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 52,
    height: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  memberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
});

export default OrdersHeader;
