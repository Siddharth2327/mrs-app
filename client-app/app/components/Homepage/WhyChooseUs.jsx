import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      icon: 'time-outline',
      title: 'Real-time Tracking',
      subtitle: 'Track your orders live',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      id: 2,
      icon: 'shield-checkmark-outline',
      title: 'Secure Payments',
      subtitle: 'GST billing included',
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

  const animValues = useRef(features.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animValues.map((animValue, index) =>
      Animated.spring(animValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  const createAnimatedStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why Choose Us</Text>
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <Animated.View key={feature.id} style={[styles.featureCard, createAnimatedStyle(animValues[index])]}>
            <View style={[styles.iconContainer, { backgroundColor: feature.bgColor }]}>
              <Ionicons name={feature.icon} size={24} color={feature.color} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 16,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default WhyChooseUs;