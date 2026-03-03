import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DistanceInfo = ({ distance, duration }) => {
  if (!distance || !duration) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoItem}>
        <Ionicons name="navigate-outline" size={14} color="#64748B" />
        <Text style={styles.infoText}>{distance} km</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoItem}>
        <Ionicons name="time-outline" size={14} color="#64748B" />
        <Text style={styles.infoText}>{duration} min</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 16,
  },
});

export default DistanceInfo;