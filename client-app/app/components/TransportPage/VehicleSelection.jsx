import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const VehicleSelection = ({ vehicles, onSelectVehicle, selectedVehicleId }) => {
  const handleVehiclePress = (vehicle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectVehicle(vehicle);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Vehicle</Text>
        <View style={styles.vehicleCount}>
          <Text style={styles.countText}>{vehicles.length} vehicles</Text>
        </View>
      </View>
      
      {vehicles.map((vehicle) => {
        const isSelected = selectedVehicleId === vehicle.id;
        const totalPrice = vehicle.price?.toLocaleString('en-IN');
        
        return (
          <TouchableOpacity
            key={vehicle.id}
            style={[
              styles.vehicleCard,
              isSelected && styles.vehicleCardSelected,
            ]}
            onPress={() => handleVehiclePress(vehicle)}
            activeOpacity={0.9}
          >
            {/* Vehicle Icon */}
            <View style={[
              styles.vehicleIcon,
              isSelected && styles.vehicleIconSelected,
            ]}>
              <Text style={[
                styles.vehicleEmoji,
                isSelected && styles.vehicleEmojiSelected,
              ]}>
                {vehicle.emoji}
              </Text>
            </View>
            
            {/* Vehicle Info */}
            <View style={styles.vehicleInfo}>
              <Text style={[
                styles.vehicleName,
                isSelected && styles.vehicleNameSelected,
              ]}>
                {vehicle.name}
              </Text>
              <View style={styles.vehicleDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.detailText}>{vehicle.time}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={14} color="#64748B" />
                  <Text style={styles.detailText}>{vehicle.capacity}</Text>
                </View>
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={[
                styles.price,
                isSelected && styles.priceSelected,
              ]}>
                ₹{totalPrice}
              </Text>
              <Text style={styles.priceUnit}>
                ₹{vehicle.pricePerKm}/km
              </Text>
            </View>

            {/* Chevron */}
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isSelected ? "#10B981" : "#94A3B8"} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  vehicleCount: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vehicleCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  vehicleIcon: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleIconSelected: {
    backgroundColor: '#ECFDF5',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  vehicleEmoji: {
    fontSize: 36,
  },
  vehicleEmojiSelected: {
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  vehicleNameSelected: {
    color: '#059669',
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  priceSelected: {
    color: '#059669',
  },
  priceUnit: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default VehicleSelection;
