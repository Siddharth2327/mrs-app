import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const QuickMaterials = () => {
  const materials = [
    { id: 1, name: 'Sand', icon: 'sack', color: '#D4A574' },
    { id: 2, name: 'Bricks', icon: 'wall', color: '#D84315' },
    { id: 3, name: 'Steel', icon: 'hexagon-multiple', color: '#90A4AE' },
    { id: 4, name: 'Cement', icon: 'package-variant', color: '#8D6E63' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Materials</Text>
      <View style={styles.grid}>
        {materials.map((material) => (
          <TouchableOpacity key={material.id} style={styles.materialCard} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: material.iconContainerBg }]}>
              <MaterialCommunityIcons 
                name={material.icon} 
                size={32} 
                color={material.color} 
              />
            </View>
            <Text style={styles.materialName}>{material.name}</Text>
          </TouchableOpacity>
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
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // ← Perfect spacing
  },
  materialCard: {
    width: '23%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,              // ← Matches cards
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  materialName: {
    fontSize: 13,
    fontWeight: '600',              // ← Bolder
    color: '#1E293B',
    textAlign: 'center',
  },
});

export default QuickMaterials;
