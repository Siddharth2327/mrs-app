import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const PaymentMethod = ({ selectedMethod: externalSelectedMethod, onSelectMethod }) => {
  const [localSelectedMethod, setLocalSelectedMethod] = useState('upi');
  
  // Sync with parent
  const selectedMethod = externalSelectedMethod || localSelectedMethod;

  const paymentMethods = [
    {
      id: 'upi',
      icon: 'logo-google-pay',
      title: 'UPI',
      subtitle: 'GPay, PhonePe, Paytm',
      secure: true,
    },
    {
      id: 'card',
      icon: 'card-outline',
      title: 'Card',
      subtitle: 'Credit/Debit Card',
      secure: true,
    },
    {
      id: 'wallet',
      icon: 'wallet-outline',
      title: 'Wallet',
      subtitle: 'Amazon Pay, Freecharge',
      secure: true,
    },
    {
      id: 'cash',
      icon: 'cash-outline',
      title: 'Cash',
      subtitle: 'Pay driver',
      secure: false,
    },
  ];

  const handleSelect = (methodId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalSelectedMethod(methodId);
    onSelectMethod?.(methodId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      
      {paymentMethods.map((method) => {
        const isSelected = selectedMethod === method.id;
        
        return (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              isSelected && styles.methodCardSelected,
            ]}
            onPress={() => handleSelect(method.id)}
            activeOpacity={0.8}
          >
            {/* Icon */}
            <View style={[
              styles.iconContainer,
              isSelected && styles.iconContainerSelected,
            ]}>
              <Ionicons 
                name={method.icon} 
                size={24} 
                color={isSelected ? '#FFFFFF' : '#64748B'} 
              />
            </View>

            {/* Info */}
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodTitle,
                isSelected && styles.methodTitleSelected,
              ]}>
                {method.title}
              </Text>
              <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            </View>

            {/* Secure Badge */}
            {method.secure && (
              <View style={styles.secureBadge}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              </View>
            )}

            {/* Radio Button */}
            <View style={[
              styles.radioButton,
              isSelected && styles.radioButtonSelected,
            ]}>
              {isSelected && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#3B82F6',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  methodTitleSelected: {
    color: '#1E40AF',
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  secureBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
});

export default PaymentMethod;
