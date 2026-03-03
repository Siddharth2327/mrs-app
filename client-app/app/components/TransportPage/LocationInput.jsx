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
      <View style={styles.suggestionIcon}>
        <Ionicons name="location-outline" size={16} color="#64748B" />
      </View>
      <Text style={styles.suggestionText} numberOfLines={2}>
        {item.display_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
        <View style={styles.dotsColumn}>
          <View style={styles.dotPickup} />
          <View style={styles.connectLine} />
          <View style={styles.dotDest} />
        </View>

        <View style={styles.inputsColumn}>
          <View style={[
            styles.inputBox,
            pickupFocused && styles.inputBoxFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor="#94A3B8"
              value={pickup}
              onChangeText={onPickupChange}
              onFocus={() => setPickupFocused(true)}
              onBlur={() => setTimeout(() => setPickupFocused(false), 200)}
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={[
            styles.inputBox,
            destinationFocused && styles.inputBoxFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Drop location"
              placeholderTextColor="#94A3B8"
              value={destination}
              onChangeText={onDestinationChange}
              onFocus={() => setDestinationFocused(true)}
              onBlur={() => setTimeout(() => setDestinationFocused(false), 200)}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>
      </View>

      {pickupFocused && pickupSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={pickupSuggestions}
            keyExtractor={(item, index) => `pickup-${item.lat}-${index}`}
            renderItem={renderSuggestion}
            scrollEnabled={false}
          />
        </View>
      )}

      {destinationFocused && destinationSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={destinationSuggestions}
            keyExtractor={(item, index) => `dest-${item.lat}-${index}`}
            renderItem={renderSuggestion}
            scrollEnabled={false}
          />
        </View>
      )}

      {(loadingPickup || loadingDestination) && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#1E3A5F" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  inputsWrapper: {
    flexDirection: 'row',
  },
  dotsColumn: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 16,
  },
  dotPickup: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  connectLine: {
    width: 2,
    height: 40,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  dotDest: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  inputsColumn: {
    flex: 1,
    gap: 10,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputBoxFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1E3A5F',
  },
  input: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
    padding: 0,
  },
  suggestionsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 12,
    color: '#1E293B',
    flex: 1,
    fontWeight: '500',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default LocationInput;