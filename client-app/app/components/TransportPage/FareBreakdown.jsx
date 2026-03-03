import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FareBreakdown = ({ baseFare, distance, pricePerKm }) => {
  const distanceFare = Math.round(distance * pricePerKm);
  const subtotal = baseFare + distanceFare;
  const discount = Math.round(subtotal * 0.1);
  const total = subtotal - discount;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fare Details</Text>
      
      <View style={styles.fareRow}>
        <Text style={styles.fareLabel}>Base Fare</Text>
        <Text style={styles.fareValue}>₹{baseFare}</Text>
      </View>

      <View style={styles.fareRow}>
        <Text style={styles.fareLabel}>Distance ({distance} km × ₹{pricePerKm})</Text>
        <Text style={styles.fareValue}>₹{distanceFare}</Text>
      </View>

      <View style={styles.fareRow}>
        <Text style={styles.fareLabel}>Discount (10%)</Text>
        <Text style={[styles.fareValue, styles.discountText]}>-₹{discount}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A5F',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fareLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  fareValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  discountText: {
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
  },
});

export default FareBreakdown;