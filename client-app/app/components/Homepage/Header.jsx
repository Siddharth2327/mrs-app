import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.header}>
      {/* Logo + Company Name */}
      <View style={styles.leftContent}>
        <Image 
          source={require('../../../assets/icon.png')}  // need to change logo
          style={styles.logo}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.companyName}>Riswana Transport</Text>
          <Text style={styles.memberLabel}>Member</Text>
        </View>
      </View>

      {/* Right Actions */}
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.memberButton}>
          <Ionicons name="crown" size={20} color="#FF8C42" />
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
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FF8C42',
    borderRadius: 6,
  },
  memberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default Header;
