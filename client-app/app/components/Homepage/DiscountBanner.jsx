import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DiscountBanner = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="star" size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>First Order Discount!</Text>
          <Text style={styles.subtitle}>Get 15% off on your first transport booking</Text>
        </View>
      </View>
      <View style={styles.codeContainer}>
        <Text style={styles.codeText}>FIRST15</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCD34D',      // ← Perfect orange
    borderRadius: 16,                // ← Matches cards
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',  // ← Glass effect
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,                     // ← Slightly larger
    fontWeight: '800',
    color: '#92400E',                 // ← Darker contrast
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
});

export default DiscountBanner;
