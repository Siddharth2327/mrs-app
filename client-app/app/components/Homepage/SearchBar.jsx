import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search transport or materials..."
        placeholderTextColor="#94A3B8"  // ← Consistent gray
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',  // ← Perfect light gray
    borderRadius: 12,            // ← Matches design radius
    marginHorizontal: 20,        // ← Design spacing
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,         // ← Taller for touch target
  },
  icon: {
    marginRight: 12,             // ← Better spacing
  },
  input: {
    flex: 1,
    fontSize: 16,                // ← Readable size
    color: '#1E293B',            // ← Dark text
    paddingVertical: 0,          // ← Align with icon
  },
});

export default SearchBar;
