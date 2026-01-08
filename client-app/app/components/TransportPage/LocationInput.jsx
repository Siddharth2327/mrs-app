import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet,
  Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const LocationInput = ({ 
  pickup, 
  destination, 
  onPickupChange, 
  onDestinationChange, 
  onPickupSelect, 
  onDestinationSelect 
}) => {
  const [pickupFocused, setPickupFocused] = useState(false);
  const [destinationFocused, setDestinationFocused] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);

  // Debounced Nominatim API search
  const fetchLocationSuggestions = useCallback(async (query, setSuggestions, setLoading) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=IN`,
        {
          headers: {
            'User-Agent': 'MBSConstructionApp/2.0',
          },
        }
      );
      const data = await response.json();
      
      const formatted = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.address,
      }));
      
      setSuggestions(formatted);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced pickup search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupFocused && pickup?.length > 1) {
        fetchLocationSuggestions(pickup, setPickupSuggestions, setLoadingPickup);
      } else {
        setPickupSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pickup, pickupFocused, fetchLocationSuggestions]);

  // Debounced destination search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destinationFocused && destination?.length > 1) {
        fetchLocationSuggestions(destination, setDestinationSuggestions, setLoadingDestination);
      } else {
        setDestinationSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [destination, destinationFocused, fetchLocationSuggestions]);

  const handlePickupSelect = (suggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPickupSelect(suggestion.display_name, { latitude: suggestion.lat, longitude: suggestion.lon });
    setPickupFocused(false);
    setPickupSuggestions([]);
    Keyboard.dismiss();
  };

  const handleDestinationSelect = (suggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDestinationSelect(suggestion.display_name, { latitude: suggestion.lat, longitude: suggestion.lon });
    setDestinationFocused(false);
    setDestinationSuggestions([]);
    Keyboard.dismiss();
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        if (pickupFocused) handlePickupSelect(item);
        else if (destinationFocused) handleDestinationSelect(item);
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="location-outline" size={20} color="#3B82F6" />
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item.display_name}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        {/* 🟢🔴 Dots + Line */}
        <View style={styles.dotsContainer}>
          <View style={styles.dotGreen} />
          <View style={styles.connectingLine} />
          <View style={styles.dotRed} />
        </View>

        {/* Inputs */}
        <View style={styles.inputs}>
          {/* Pickup Input */}
          <View style={[
            styles.inputWrapper, 
            pickup && styles.inputWrapperFilled,
            pickupFocused && styles.inputWrapperFocused
          ]}>
            <Ionicons name="radio-button-on" size={20} color="#10B981" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              value={pickup}
              onChangeText={onPickupChange}
              onFocus={() => setPickupFocused(true)}
              onBlur={() => setTimeout(() => setPickupFocused(false), 250)}
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Destination Input */}
          <View style={[
            styles.inputWrapper, 
            destination && styles.inputWrapperFilledRed,
            destinationFocused && styles.inputWrapperFocusedRed
          ]}>
            <Ionicons name="navigate" size={20} color="#EF4444" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Destination"
              value={destination}
              onChangeText={onDestinationChange}
              onFocus={() => setDestinationFocused(true)}
              onBlur={() => setTimeout(() => setDestinationFocused(false), 250)}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>
      </View>

      {/* Pickup Suggestions */}
      {pickupFocused && pickupSuggestions.length > 0 && (
        <FlatList
          data={pickupSuggestions}
          keyExtractor={(item, index) => `pickup-${item.lat}-${index}`}
          renderItem={renderSuggestion}
          style={styles.suggestionsList}
          maxHeight={180}
        />
      )}

      {/* Destination Suggestions */}
      {destinationFocused && destinationSuggestions.length > 0 && (
        <FlatList
          data={destinationSuggestions}
          keyExtractor={(item, index) => `dest-${item.lat}-${index}`}
          renderItem={renderSuggestion}
          style={styles.suggestionsList}
          maxHeight={180}
        />
      )}

      {/* Loading States */}
      {(loadingPickup || loadingDestination) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Finding locations...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  inputsContainer: {
    flexDirection: 'row',
  },
  dotsContainer: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 20,
  },
  dotGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  connectingLine: {
    width: 3,
    height: 48,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginVertical: 6,
  },
  dotRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  inputs: {
    flex: 1,
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWrapperFilled: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  inputWrapperFilledRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  inputWrapperFocused: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  inputWrapperFocusedRed: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    includeFontPadding: false,
  },
  suggestionsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 15,
    color: '#1E293B',
    flex: 1,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default LocationInput;
