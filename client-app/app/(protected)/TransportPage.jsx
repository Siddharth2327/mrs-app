import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import TransportHeader from '../components/TransportPage/TransportHeader';
import LocationInput from '../components/TransportPage/LocationInput';
import DistanceInfo from '../components/TransportPage/DistanceInfo';
import VehicleSelection from '../components/TransportPage/VehicleSelection';
import PaymentMethod from '../components/TransportPage/PaymentMethod';
import FareBreakdown from '../components/TransportPage/FareBreakdown';
import BottomNavigation from '../components/Navigation/BottomNavigation';

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
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState([
    { id: 1, name: 'Bike', icon: 'bicycle-outline', capacity: '5 kg', time: '5 min', price: 686, pricePerKm: 8, baseFare: 30 },
    { id: 2, name: 'Mini', icon: 'car-outline', capacity: '4 passengers', time: '8 min', price: 1064, pricePerKm: 12, baseFare: 80 },
    { id: 3, name: 'Sedan', icon: 'car-sport-outline', capacity: '4 passengers', time: '10 min', price: 1262, pricePerKm: 14, baseFare: 120 },
    { id: 4, name: 'SUV', icon: 'bus-outline', capacity: '7 passengers', time: '12 min', price: 1676, pricePerKm: 18, baseFare: 200 },
  ]);

  const calculateDistance = (coord1, coord2) => {
    const R = 6371;
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
      setDuration(Math.round(dist * 2));
      setShowVehicles(true);

      const updatedVehicles = vehicles.map(vehicle => ({
        ...vehicle,
        price: vehicle.baseFare + (dist * vehicle.pricePerKm)
      }));
      setVehicles(updatedVehicles);
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

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
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
  };

  const handleBack = () => {
    if (selectedVehicle) {
      setSelectedVehicle(null);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <TransportHeader 
        onBack={handleBack}
        title={selectedVehicle ? 'Confirm Booking' : 'Book a Ride'}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <View style={styles.mockMap}>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapLabel}>Chennai</Text>
            </View>

            {pickupCoords && (
              <View style={[styles.marker, styles.pickupMarker]}>
                <View style={styles.markerDot} />
              </View>
            )}

            {destCoords && (
              <View style={[styles.marker, styles.destMarker]}>
                <View style={[styles.markerDot, styles.destDot]} />
              </View>
            )}

            {pickupCoords && destCoords && (
              <View style={styles.routeLine} />
            )}
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
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

              {showVehicles && distance && (
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
              <View style={styles.tripSummary}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryDot} />
                  <Text style={styles.summaryLabel}>Pickup</Text>
                </View>
                <Text style={styles.summaryValue} numberOfLines={1}>{pickup}</Text>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryRow}>
                  <View style={[styles.summaryDot, styles.summaryDotDest]} />
                  <Text style={styles.summaryLabel}>Drop</Text>
                </View>
                <Text style={styles.summaryValue} numberOfLines={1}>{destination}</Text>
              </View>

              <DistanceInfo distance={distance} duration={duration} />
              
              <View style={styles.selectedVehicleCard}>
                <View style={styles.vehicleHeader}>
                  <Text style={styles.sectionTitle}>Selected Vehicle</Text>
                  <TouchableOpacity onPress={() => setSelectedVehicle(null)}>
                    <Text style={styles.changeBtn}>Change</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.vehicleRow}>
                  <View style={styles.vehicleIconSmall}>
                    <Text style={styles.vehicleText}>{selectedVehicle.name}</Text>
                  </View>
                  <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleCapacity}>{selectedVehicle.capacity}</Text>
                    <Text style={styles.vehicleTime}>{selectedVehicle.time} away</Text>
                  </View>
                  <Text style={styles.vehiclePrice}>₹{selectedVehicle.price}</Text>
                </View>
              </View>

              <PaymentMethod onSelectMethod={setPaymentMethod} />
              
              <FareBreakdown 
                baseFare={selectedVehicle.baseFare}
                distance={distance}
                pricePerKm={selectedVehicle.pricePerKm}
              />

              <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
                <Text style={styles.bookButtonText}>
                  Confirm & Pay ₹{selectedVehicle?.price || 0}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNavigation activeTab="Transports" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.35,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  mockMap: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 10,
  },
  mapLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  marker: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  pickupMarker: {
    top: '25%',
    left: '20%',
  },
  destMarker: {
    top: '65%',
    right: '20%',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  destDot: {
    backgroundColor: '#EF4444',
  },
  routeLine: {
    position: 'absolute',
    top: '35%',
    left: '30%',
    width: 2,
    height: '35%',
    backgroundColor: '#1E3A5F',
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  confirmContainer: {
    paddingHorizontal: 16,
  },
  tripSummary: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  summaryDotDest: {
    backgroundColor: '#EF4444',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    color: '#1E293B',
    marginLeft: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  selectedVehicleCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A5F',
    textTransform: 'uppercase',
  },
  changeBtn: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconSmall: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 2,
  },
  vehicleTime: {
    fontSize: 11,
    color: '#64748B',
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  bookButton: {
    backgroundColor: '#1E3A5F',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
});