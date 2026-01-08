import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';  // ✅ ADDED

const ServiceCards = () => {
  return (
    <View style={styles.container}>
      {/* 🚚 TRANSPORT CARD → /TransportPage */}
      <Link href="/TransportPage" asChild style={styles.link}>
        <View style={styles.card}>
          <View style={[styles.iconContainer, styles.transportIcon]}>
            <Ionicons name="car-outline" size={28} color="#3B82F6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Transports</Text>
            <Text style={styles.cardSubtitle}>
              Book vehicles for local &amp; outstation trips
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </View>
      </Link>

      {/* 📦 ENTERPRISES CARD → /EnterprisesPage */}
      <Link href="/EnterprisesPage" asChild style={styles.link}>
        <View style={styles.card}>
          <View style={[styles.iconContainer, styles.enterpriseIcon]}>
            <Ionicons name="business-outline" size={28} color="#F59E0B" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Enterprises</Text>
            <Text style={styles.cardSubtitle}>
              Order construction materials with delivery
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </View>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 16,
  },
  link: {
    // Link styles (invisible wrapper)
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transportIcon: {
    backgroundColor: '#EFF6FF',
  },
  enterpriseIcon: {
    backgroundColor: '#FEF3C7',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 22,
  },
});

export default ServiceCards;
