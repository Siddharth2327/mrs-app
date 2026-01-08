import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      icon: 'time-outline',
      title: 'Real-time Tracking',
      subtitle: 'Track your orders live',
      color: '#5B8DEE',
      bgColor: '#EFF6FF',
    },
    {
      id: 2,
      icon: 'shield-checkmark-outline',
      title: 'GST Compliant Payments',
      subtitle: 'Secure billing included',
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      id: 3,
      icon: 'flash-outline',
      title: 'Fast Delivery',
      subtitle: 'Same-day available',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why Choose Us</Text>
      <View style={styles.featuresContainer}>
        {features.map((feature) => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: feature.bgColor }]}>
              <Ionicons name={feature.icon} size={28} color={feature.color} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WhyChooseUs;
