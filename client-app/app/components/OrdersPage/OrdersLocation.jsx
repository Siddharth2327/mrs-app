import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrdersLocation = ({ location, onChangeLocation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="location-outline" size={20} color="#3B82F6" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Deliver to</Text>
        <Text style={styles.location}>{location || 'Chennai, Tamil Nadu 600001'}</Text>
      </View>
      <TouchableOpacity 
        onPress={onChangeLocation}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.changeButton}>Change</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default OrdersLocation;
