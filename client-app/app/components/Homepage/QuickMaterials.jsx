import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QuickMaterials = () => {
  const router = useRouter();

  const materials = [
    { id: 1, name: 'Sand', emoji: '🏖️', type: 'sand' },
    { id: 2, name: 'Bricks', emoji: '🧱', type: 'bricks' },
    { id: 3, name: 'Steel', emoji: '⚙️', type: 'steel' },
    { id: 4, name: 'Cement', emoji: '📦', type: 'cement' },
  ];

  // Create animation values for each material
  const animValues = useRef(materials.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animValues.map((animValue, index) =>
      Animated.timing(animValue, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  const handleMaterialPress = (type) => {
    router.push({
      pathname: '/EnterprisesPage',
      params: { category: type },
    });
  };

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
          outputRange: [0.8, 1],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Materials</Text>
      <View style={styles.grid}>
        {materials.map((material, index) => (
          <AnimatedTouchable
            key={material.id}
            style={[styles.materialCard, createAnimatedStyle(animValues[index])]}
            onPress={() => handleMaterialPress(material.type)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>{material.emoji}</Text>
            </View>
            <Text style={styles.materialName}>{material.name}</Text>
          </AnimatedTouchable>
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
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialCard: {
    width: '23%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 32,
  },
  materialName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});

export default QuickMaterials;