import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useLocationStore from '../../../store/locationStore';

const DeliveryLocation = () => {
  const router = useRouter();
  const deliveryAddress = useLocationStore((state) => state.deliveryAddress);

  const handleChangeLocation = () => {
    // Navigate to location selection page
    router.push('/location-settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="location" size={18} color="#1E293B" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Deliver to</Text>
        <Text style={styles.location} numberOfLines={1}>
          {deliveryAddress?.city || 'Chennai'}, {deliveryAddress?.state || 'Tamil Nadu'}{' '}
          {deliveryAddress?.pincode || '600001'}
        </Text>
      </View>
      <TouchableOpacity onPress={handleChangeLocation} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.changeButton}>Change</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  changeButton: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default DeliveryLocation;