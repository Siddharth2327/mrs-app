import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../../../store/authStore';
import AppHeader from '../../../components/Enterprisespage/AppHeader';

// Animated Address Card Component
const AnimatedAddressCard = ({ address, index, onSetDefault, onDelete, router }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const animatedStyle = {
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.addressCard, animatedStyle]}>
      {/* Address Header */}
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <Ionicons
            name={
              address.type === 'home'
                ? 'home'
                : address.type === 'work'
                ? 'briefcase'
                : 'location'
            }
            size={16}
            color="#1E3A5F"
          />
          <Text style={styles.addressType}>{address.label}</Text>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      {/* Address Details */}
      <Text style={styles.addressTitle}>{address.name}</Text>
      <Text style={styles.addressText}>{address.address}</Text>
      <Text style={styles.addressText}>
        {address.city}, {address.state} {address.pincode}
      </Text>
      {address.phone && (
        <Text style={styles.addressPhone}>Phone: {address.phone}</Text>
      )}

      {/* Action Buttons */}
      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetDefault(address.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            <Text style={[styles.actionButtonText, { color: '#10B981' }]}>
              Set Default
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/profile/addresses/edit-address?id=${address.id}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={16} color="#1E3A5F" />
          <Text style={[styles.actionButtonText, { color: '#1E3A5F' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(address.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function AddressesPage() {
  const router = useRouter();
  const { userData, updateUserData } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Animation for add button
  const addButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (userData?.addresses) {
      setAddresses(userData.addresses);
    }
  }, [userData]);

  useEffect(() => {
    // Animate add button
    Animated.timing(addButtonAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const createAnimatedStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      const result = await updateUserData({ addresses: updatedAddresses });
      
      if (result.success) {
        setAddresses(updatedAddresses);
        Alert.alert('Success', 'Default address updated');
      } else {
        Alert.alert('Error', 'Failed to update default address');
      }
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
              const result = await updateUserData({ addresses: updatedAddresses });
              
              if (result.success) {
                setAddresses(updatedAddresses);
                Alert.alert('Success', 'Address deleted');
              } else {
                Alert.alert('Error', 'Failed to delete address');
              }
            } catch (error) {
              console.error('Error deleting:', error);
              Alert.alert('Error', 'Something went wrong');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddNewAddress = () => {
    router.push('/profile/addresses/add-address');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AppHeader
          title="Saved Addresses"
          onBack={() => router.back()}
        />

        {/* Add New Address Button */}
        <Animated.View style={createAnimatedStyle(addButtonAnim)}>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddNewAddress}
            activeOpacity={0.7}
          >
            <View style={styles.addButtonIcon}>
              <Ionicons name="add" size={22} color="#1E3A5F" />
            </View>
            <Text style={styles.addButtonText}>Add New Address</Text>
            <Ionicons name="chevron-forward" size={18} color="#1E3A5F" />
          </TouchableOpacity>
        </Animated.View>

        {/* Addresses List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E3A5F" />
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptyText}>Add your first address to get started</Text>
          </View>
        ) : (
          <View style={styles.addressesList}>
            {addresses.map((address, index) => (
              <AnimatedAddressCard
                key={address.id}
                address={address}
                index={index}
                onSetDefault={handleSetDefault}
                onDelete={handleDeleteAddress}
                router={router}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E3A5F',
    borderStyle: 'dashed',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  addressesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  addressCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A5F',
    textTransform: 'capitalize',
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 32,
  },
});