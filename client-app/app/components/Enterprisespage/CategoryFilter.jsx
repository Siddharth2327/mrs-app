import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const CategoryFilter = ({ selectedCategory: externalSelected, onSelectCategory }) => {
  const [localSelected, setLocalSelected] = useState('All');

  const selected = externalSelected || localSelected;

  const categories = [
    { id: 'All', label: 'All', value: 'All' },
    { id: 'sand', label: 'Sand', value: 'sand' },
    { id: 'steel', label: 'Steel', value: 'steel' },
    { id: 'cement', label: 'Cement', value: 'cement' },
    { id: 'bricks', label: 'Bricks', value: 'brick' },
  ];

  const handleSelect = useCallback(
    (category) => {
      setLocalSelected(category);
      onSelectCategory?.(category);
    },
    [onSelectCategory]
  );

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
            key={category.id}
            style={[styles.categoryButton, selected === category.value && styles.categoryButtonActive]}
            onPress={() => handleSelect(category.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.categoryText, selected === category.value && styles.categoryTextActive]}
              numberOfLines={1}
            >
              {category.label}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#1E3A5F',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CategoryFilter;