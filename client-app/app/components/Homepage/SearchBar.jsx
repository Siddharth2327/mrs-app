import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SearchBar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to enterprises page with search query
      router.push({
        pathname: '/EnterprisesPage',
        params: { search: searchQuery },
      });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push('/EnterprisesPage')}
      activeOpacity={0.7}
    >
      <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.icon} />
      <View style={styles.input}>
        <TextInput
          placeholder="Search transport or materials..."
          placeholderTextColor="#94A3B8"
          style={styles.inputText}
          editable={false}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
  },
  inputText: {
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 0,
  },
});

export default SearchBar;