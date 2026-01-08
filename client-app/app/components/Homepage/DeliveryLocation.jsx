import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DeliveryLocation = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="location-outline" size={20} color="#5B8DEE" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Deliver to</Text>
        <Text style={styles.location}>Chennai, Tamil Nadu 600001</Text>  
      </View>
      <TouchableOpacity>
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
    marginBottom: 8,  
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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

export default DeliveryLocation;
