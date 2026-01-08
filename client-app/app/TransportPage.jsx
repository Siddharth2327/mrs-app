import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet,  Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import TransportHeader from './components/TransportPage/TransportHeader';
import LocationInput from './components/TransportPage/LocationInput';
import DistanceInfo from './components/TransportPage/DistanceInfo';
import VehicleSelection from './components/TransportPage/VehicleSelection';
import PaymentMethod from './components/TransportPage/PaymentMethod';
import FareBreakdown from './components/TransportPage/FareBreakdown';
import BottomNavigation from './components/Navigation/BottomNavigation';

const { height } = Dimensions.get('window');

export default function TransportPage() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showVehicles, setShowVehicles] = useState(false);
  const mapRef = useRef(null);

  const vehicles = [
    { id: 1, name: 'Bike', emoji: '🏍️', capacity: '5 kg', time: '5 min', price: 686, pricePerKm: 8, baseFare: 30 },
    { id: 2, name: 'Car', emoji: '🚗', capacity: '4 passengers', time: '8 min', price: 1064, pricePerKm: 12, baseFare: 80 },
    { id: 3, name: '7 Seater', emoji: '🚐', capacity: '7 passengers', time: '10 min', price: 1462, pricePerKm: 16, baseFare: 150 },
    { id: 4, name: '9 Seater', emoji: '🚌', capacity: '9 passengers', time: '12 min', price: 1676, pricePerKm: 18, baseFare: 200 },
  ];

  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  useEffect(() => {
    if (pickupCoords && destCoords) {
      const dist = calculateDistance(pickupCoords, destCoords);
      setDistance(dist);
      setDuration(Math.round(dist * 2)); // Mock: 2 min per km
      setShowVehicles(true);

      // Update vehicle prices based on distance
      vehicles.forEach(vehicle => {
        vehicle.price = vehicle.baseFare + (dist * vehicle.pricePerKm);
      });

      // Fit map to show both markers
      mapRef.current?.fitToCoordinates([pickupCoords, destCoords], {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    } else {
      setShowVehicles(false);
    }
  }, [pickupCoords, destCoords]);

  const handlePickupSelect = (location, coords) => {
    setPickup(location);
    if (coords) {
      setPickupCoords(coords);
    }
  };

  const handleDestinationSelect = (location, coords) => {
    setDestination(location);
    if (coords) {
      setDestCoords(coords);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleBooking = () => {
    console.log('Booking:', {
      pickup,
      destination,
      vehicle: selectedVehicle,
      paymentMethod,
      distance,
      price: selectedVehicle?.price,
    });
    // Navigate to booking confirmation
  };

  const handleBack = () => {
    if (selectedVehicle) {
      setSelectedVehicle(null);
    } else {
      console.log('Go back to home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <TransportHeader 
        onBack={handleBack}
        subtitle={selectedVehicle ? 'Confirm & Pay' : 'Choose your vehicle'}
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 13.0827,
            longitude: 80.2707,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {pickupCoords && (
            <Marker coordinate={pickupCoords} pinColor="green" />
          )}
          {destCoords && (
            <Marker coordinate={destCoords} pinColor="red" />
          )}
          {pickupCoords && destCoords && (
            <Polyline
              coordinates={[pickupCoords, destCoords]}
              strokeColor="#1E3A5F"
              strokeWidth={3}
            />
          )}
        </MapView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!selectedVehicle ? (
          <>
            <LocationInput
              pickup={pickup}
              destination={destination}
              onPickupChange={setPickup}
              onDestinationChange={setDestination}
              onPickupSelect={handlePickupSelect}
              onDestinationSelect={handleDestinationSelect}
            />

            {showVehicles && (
              <>
                <DistanceInfo distance={distance} duration={duration} />
                <VehicleSelection 
                  vehicles={vehicles} 
                  onSelectVehicle={handleVehicleSelect}
                />
              </>
            )}
          </>
        ) : (
          <View style={styles.confirmContainer}>
            <DistanceInfo distance={distance} duration={duration} />
            
            {/* Selected Vehicle */}
            <View style={styles.selectedVehicleCard}>
              <View style={styles.vehicleIconLarge}>
                <Text style={styles.vehicleEmojiLarge}>{selectedVehicle.emoji}</Text>
              </View>
              <View style={styles.selectedVehicleInfo}>
                <Text style={styles.selectedVehicleName}>{selectedVehicle.name}</Text>
                <Text style={styles.selectedVehicleDetails}>
                  {selectedVehicle.capacity} • {selectedVehicle.time}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedVehicle(null)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.whiteCard}>
              <PaymentMethod onSelectMethod={setPaymentMethod} />
              <FareBreakdown 
                baseFare={selectedVehicle.baseFare}
                distance={distance}
                pricePerKm={selectedVehicle.pricePerKm}
              />
            </View>

            <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
              <Text style={styles.bookButtonText}>
                Pay ₹{selectedVehicle.price} • Book {selectedVehicle.name}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation activeTab="Transports" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mapContainer: {
    height: height * 0.3,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  confirmContainer: {
    paddingHorizontal: 16,
  },
  selectedVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  vehicleIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleEmojiLarge: {
    fontSize: 36,
  },
  selectedVehicleInfo: {
    flex: 1,
  },
  selectedVehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  selectedVehicleDetails: {
    fontSize: 14,
    color: '#666',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B8DEE',
  },
  whiteCard: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  bookButton: {
    backgroundColor: '#1E3A5F',
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 20,
  },
});

