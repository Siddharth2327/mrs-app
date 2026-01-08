import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartFooter = ({ itemCount, totalPrice, onViewCart }) => {
  if (itemCount === 0) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onViewCart}
      activeOpacity={0.9}
    >
      <View style={styles.leftSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
        <Text style={styles.itemsText}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.priceText}>{formatPrice(totalPrice)}</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,              // ← Perfect above bottom nav
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  itemsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
});

export default CartFooter;
