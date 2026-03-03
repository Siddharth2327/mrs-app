import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartFooter = ({ itemCount, totalPrice, onViewCart }) => {
  if (itemCount === 0) return null;

  const formatPrice = (price) => {
    return `₹${price}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onViewCart} activeOpacity={0.9}>
      <View style={styles.leftSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
        <Text style={styles.itemsText}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.priceText}>{formatPrice(totalPrice)}</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 95,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  itemsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CartFooter;