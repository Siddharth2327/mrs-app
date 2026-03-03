import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const VehicleSelection = ({ vehicles, onSelectVehicle }) => {
  const handleVehiclePress = (vehicleId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectVehicle(vehicleId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Vehicles</Text>
      
      {vehicles.map((vehicle) => (
        <TouchableOpacity
          key={vehicle.id}
          style={styles.vehicleCard}
          onPress={() => handleVehiclePress(vehicle.id)}
          activeOpacity={0.7}
        >
          <View style={styles.vehicleIcon}>
            <Ionicons name={vehicle.icon} size={20} color="#1E3A5F" />
          </View>
          
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicle.name}</Text>
            <View style={styles.vehicleMeta}>
              <Text style={styles.metaText}>{vehicle.capacity}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{vehicle.time}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{vehicle.price}</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A5F',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
  },
});

export default VehicleSelection;