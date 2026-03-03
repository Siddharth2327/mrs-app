import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import useAuthStore from '../../../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ Added SafeAreaView import

export default function AddAddressPage() {
  const router = useRouter();
  const { userData, updateUserData } = useAuthStore();

  // Form fields
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState('home');
  const [isDefault, setIsDefault] = useState(false);

  // Map and location
  const [region, setRegion] = useState({
    latitude: 25.5941,
    longitude: 85.1376,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 25.5941,
    longitude: 85.1376,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location:', error);
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setRegion(newRegion);
      setMarkerPosition({ latitude, longitude });
      
      // Reverse geocode to get address
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RiswanaTransport/1.0',
          },
        }
      );
      const data = await response.json();
      
      if (data.address) {
        setAddress(data.display_name || '');
        setCity(data.address.city || data.address.town || data.address.village || '');
        setState(data.address.state || '');
        setPincode(data.address.postcode || '');
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RiswanaTransport/1.0',
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search location');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    
    setRegion(newRegion);
    setMarkerPosition({ latitude, longitude });
    setAddress(result.display_name);
    
    if (result.address) {
      setCity(result.address.city || result.address.town || result.address.village || '');
      setState(result.address.state || '');
      setPincode(result.address.postcode || '');
    }
    
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const validateForm = () => {
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter address label');
      return false;
    }
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter name');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter address');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return false;
    }
    if (!pincode.trim()) {
      Alert.alert('Error', 'Please enter pincode');
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const existingAddresses = userData?.addresses || [];
      
      // If this is set as default, remove default from other addresses
      const updatedExistingAddresses = existingAddresses.map(addr => ({
        ...addr,
        isDefault: isDefault ? false : addr.isDefault,
      }));

      const newAddress = {
        id: Date.now().toString(),
        label,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        type: addressType,
        latitude: markerPosition.latitude,
        longitude: markerPosition.longitude,
        isDefault: isDefault || existingAddresses.length === 0, // First address is default
        createdAt: new Date().toISOString(),
      };

      const allAddresses = [...updatedExistingAddresses, newAddress];
      const result = await updateUserData({ addresses: allAddresses });

      if (result.success) {
        Alert.alert('Success', 'Address saved successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to save address');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}> 
      <KeyboardAvoidingView
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header - Updated to match standard style */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Address</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
            >
              <Marker coordinate={markerPosition} />
            </MapView>
            
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#FF8C42" />
              ) : (
                <Ionicons name="locate" size={24} color="#FF8C42" />
              )}
            </TouchableOpacity>
          </View>

          {/* Search Location */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for area, street name..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLocation(text);
                }}
              />
              {searching && <ActivityIndicator size="small" color="#FF8C42" />}
            </View>
            
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => selectSearchResult(result)}
                  >
                    <Ionicons name="location-outline" size={20} color="#FF8C42" />
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {result.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Address Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[styles.typeButton, addressType === 'home' && styles.typeButtonActive]}
                onPress={() => setAddressType('home')}
              >
                <Ionicons
                  name="home"
                  size={20}
                  color={addressType === 'home' ? '#FFF' : '#64748B'}
                />
                <Text style={[styles.typeButtonText, addressType === 'home' && styles.typeButtonTextActive]}>
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, addressType === 'work' && styles.typeButtonActive]}
                onPress={() => setAddressType('work')}
              >
                <Ionicons
                  name="briefcase"
                  size={20}
                  color={addressType === 'work' ? '#FFF' : '#64748B'}
                />
                <Text style={[styles.typeButtonText, addressType === 'work' && styles.typeButtonTextActive]}>
                  Work
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, addressType === 'other' && styles.typeButtonActive]}
                onPress={() => setAddressType('other')}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={addressType === 'other' ? '#FFF' : '#64748B'}
                />
                <Text style={[styles.typeButtonText, addressType === 'other' && styles.typeButtonTextActive]}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Label *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Home, Office, Mom's place"
                value={label}
                onChangeText={setLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter receiver's name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="House no., Building name, Street"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter pincode"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {/* Set as Default */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveAddress}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: { // ✅ Added new style for KeyboardAvoidingView
    flex: 1,
  },
  // ✅ Updated header to match standard style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12, // ✅ Changed from 16 to 12
    backgroundColor: '#fff', // ✅ Changed from '#FFF' to lowercase
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // ✅ Changed from '#E2E8F0'
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18, // ✅ Changed from 20 to 18
    fontWeight: '700',
    color: '#333', // ✅ Changed from '#1E293B'
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  searchResults: {
    backgroundColor: '#FFF',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeButtonActive: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FF8C42',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpace: {
    height: 32,
  },
});
