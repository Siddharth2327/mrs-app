import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FareBreakdown = ({ baseFare, distance, pricePerKm, total }) => {
  const distanceFare = Math.round(distance * pricePerKm);
  const finalTotal = total || (baseFare + distanceFare);
  const savings = Math.round(distanceFare * 0.1); // 10% discount

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fare Breakdown</Text>
      
      {/* Base Fare */}
      <View style={styles.fareRow}>
        <View style={styles.fareLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="home-outline" size={16} color="#3B82F6" />
          </View>
          <Text style={styles.fareLabel}>Base Fare</Text>
        </View>
        <Text style={styles.fareValue}>₹{baseFare.toLocaleString('en-IN')}</Text>
      </View>

      {/* Distance Fare */}
      <View style={styles.fareRow}>
        <View style={styles.fareLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="git-compare-outline" size={16} color="#10B981" />
          </View>
          <Text style={styles.fareLabel}>
            Distance ({distance} km × ₹{pricePerKm})
          </Text>
        </View>
        <Text style={styles.fareValue}>₹{distanceFare.toLocaleString('en-IN')}</Text>
      </View>

      {/* Discount */}
      <View style={styles.fareRow}>
        <View style={styles.fareLeft}>
          <View style={[styles.iconCircle, styles.discountCircle]}>
            <Ionicons name="pricetag-outline" size={16} color="#F59E0B" />
          </View>
          <Text style={styles.fareLabel}>First Ride Discount</Text>
        </View>
        <Text style={[styles.fareValue, styles.discountValue]}>
          -₹{savings.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{finalTotal.toLocaleString('en-IN')}</Text>
      </View>

      {/* Save Badge */}
      <View style={styles.saveBadge}>
        <Ionicons name="flash-outline" size={14} color="#10B981" />
        <Text style={styles.saveText}>Save ₹{savings.toLocaleString('en-IN')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountCircle: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  fareLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  fareValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  discountValue: {
    color: '#F59E0B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  saveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
});

export default FareBreakdown;
