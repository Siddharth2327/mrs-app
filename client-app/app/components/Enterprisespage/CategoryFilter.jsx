import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const CategoryFilter = ({ selectedCategory: externalSelected, onSelectCategory }) => {
  const [localSelected, setLocalSelected] = useState('All');

  // Sync external state changes
  const selected = externalSelected || localSelected;

  const categories = [
    'All',
    'Sand',
    'M-Sand', 
    'P-Sand',
    'Steel',
    'Bricks',
    'Cement',
    'Tin Sheets',
  ];

  const handleSelect = useCallback((category) => {
    setLocalSelected(category);
    onSelectCategory?.(category);
  }, [onSelectCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selected === category && styles.categoryButtonActive,
            ]}
            onPress={() => handleSelect(category)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryText,
                selected === category && styles.categoryTextActive,
              ]}
              numberOfLines={1}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: '700',
  },
});

export default CategoryFilter;
