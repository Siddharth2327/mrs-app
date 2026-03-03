import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ServiceCards = () => {
  const transportAnim = useRef(new Animated.Value(0)).current;
  const enterpriseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(transportAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(enterpriseAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const createAnimatedStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
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
      {/* 🚚 TRANSPORT CARD */}
      <AnimatedTouchable
        style={[styles.cardWrapper, createAnimatedStyle(transportAnim)]}
        onPress={() => router.push('/TransportPage')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#E8F0FE', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={[styles.iconContainer, styles.transportIcon]}>
            <Ionicons name="car-outline" size={26} color="#1E3A5F" />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Transports</Text>
            <Text style={styles.cardSubtitle}>Book and Rent vehicles for local & outstation trips</Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
        </LinearGradient>
      </AnimatedTouchable>

      {/* 📦 ENTERPRISES CARD */}
      <AnimatedTouchable
        style={[styles.cardWrapper, createAnimatedStyle(enterpriseAnim)]}
        onPress={() => router.push('/EnterprisesPage')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#FEF3C7', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={[styles.iconContainer, styles.enterpriseIcon]}>
            <Ionicons name="business-outline" size={26} color="#92400E" />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Enterprises</Text>
            <Text style={styles.cardSubtitle}>Order construction materials with delivery</Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
        </LinearGradient>
      </AnimatedTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  cardWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transportIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  enterpriseIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});

export default ServiceCards;