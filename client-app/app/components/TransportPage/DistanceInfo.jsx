import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DistanceInfo = ({ distance, duration }) => {
  if (!distance || !duration) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoItem}>
        <Ionicons name="git-compare-outline" size={20} color="#1E3A5F" />
        <Text style={styles.infoText}>{distance} km</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.infoItem}>
        <Ionicons name="time-outline" size={20} color="#1E3A5F" />
        <Text style={styles.infoText}>~{duration} min</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FE',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  separator: {
    width: 2,
    height: 20,
    backgroundColor: '#1E3A5F',
    marginHorizontal: 20,
    opacity: 0.3,
  },
});

export default DistanceInfo;