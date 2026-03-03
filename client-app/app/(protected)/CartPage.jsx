import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavigation from '../components/Navigation/BottomNavigation';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../../store/orderStore';

// Animated Cart Item Component with Quantity Controls
const AnimatedCartItem = ({ item, index, onRemove, onUpdateQuantity, getIconComponent }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleQuantityChange = (newQuantity) => {
    // Bounce animation on quantity change
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onUpdateQuantity(item.id, newQuantity);
  };

  const animatedStyle = {
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
      {
        scale: scaleAnim,
      },
    ],
  };

  return (
    <Animated.View style={[styles.cartItem, animatedStyle]}>
      {/* Item Number Badge */}
      <View style={styles.itemNumberBadge}>
        <Text style={styles.itemNumberText}>{index + 1}</Text>
      </View>

      <View style={styles.itemIcon}>{getIconComponent(item.type)}</View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>₹{item.price} per {item.unit}</Text>
        
        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={() => handleQuantityChange(Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="remove" 
              size={16} 
              color={item.quantity <= 1 ? '#CBD5E1' : '#1E3A5F'} 
            />
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Text style={styles.quantityUnit}>{item.unit}</Text>
          </View>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.quantity + 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color="#1E3A5F" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.itemTotal}>₹{item.subtotal}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.6}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function CartPage() {
  const router = useRouter();
  const [deliveryOption, setDeliveryOption] = useState('own');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemsArray } = useCartStore();
  const { createOrderFromCart, isLoading: orderLoading } = useOrderStore();

  const cartItems = getItemsArray();
  const subtotal = getTotal();
  const gstRate = 0.18;
  const gstAmount = Math.round(subtotal * gstRate);
  const grandTotal = subtotal + gstAmount;

  // Animations
  const deliveryAnim = useRef(new Animated.Value(0)).current;
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cartItems.length > 0) {
      Animated.stagger(200, [
        Animated.timing(deliveryAnim, {
          toValue: 1,
          duration: 500,
          delay: cartItems.length * 100 + 200,
          useNativeDriver: true,
        }),
        Animated.timing(summaryAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cartItems.length]);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeItem(itemId),
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || orderLoading) return;

    setIsPlacingOrder(true);

    try {
      // For now, using a default delivery address
      const deliveryAddress = deliveryOption === 'site' 
        ? { address: 'Default Site Address', city: 'City', pincode: '000000' }
        : null;

      const result = await createOrderFromCart(cartItems, deliveryOption, deliveryAddress);

      if (result.success) {
        Alert.alert(
          'Order Placed Successfully! 🎉',
          `Your order has been placed successfully.\nOrder ID: ${result.orderId}\n\n📄 To download your receipt, go to Orders page and open your order details.`,
          [
            {
              text: 'View Orders',
              onPress: () => {
                clearCart();
                router.replace('/OrdersPage');
              },
            },
            {
              text: 'Continue Shopping',
              onPress: () => {
                clearCart();
                router.replace('/EnterprisesPage');
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Order Failed',
          result.error || 'Failed to place order. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Commented out checkout navigation
  // const handleProceedToCheckout = () => {
  //   router.push('/checkout');
  // };

  const getIconComponent = (type) => {
    const getColorByType = () => {
      const colors = {
        sand: '#F4A460',
        'm-sand': '#B0B0B0',
        'p-sand': '#D8BFD8',
        steel: '#778899',
        bricks: '#CD5C5C',
        cement: '#808080',
      };
      return colors[type?.toLowerCase()] || '#E2E8F0';
    };

    const color = getColorByType();

    switch (type?.toLowerCase()) {
      case 'sand':
        return <View style={[styles.iconCircle, { backgroundColor: color }]} />;
      case 'm-sand':
      case 'cement':
      case 'bricks':
        return <View style={[styles.iconCube, { backgroundColor: color }]} />;
      case 'steel':
        return <View style={[styles.iconGear, { backgroundColor: color }]} />;
      default:
        return <View style={[styles.iconCircle, { backgroundColor: color }]} />;
    }
  };

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

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart (0)</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={80} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add materials from Enterprises</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/EnterprisesPage')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
        <BottomNavigation activeTab="Enterprises" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({cartItems.length})</Text>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Clear Cart',
              'Are you sure you want to remove all items?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: () => clearCart(),
                },
              ]
            );
          }}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cart Items */}
        <View style={styles.cartItemsContainer}>
          <Text style={styles.sectionHeader}>Items ({cartItems.length})</Text>
          {cartItems.map((item, index) => (
            <AnimatedCartItem
              key={item.id}
              item={item}
              index={index}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
              getIconComponent={getIconComponent}
            />
          ))}
        </View>

        {/* Delivery Option */}
        <Animated.View style={[styles.section, createAnimatedStyle(deliveryAnim)]}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={18} color="#1E293B" /> Delivery Option
          </Text>

          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[styles.deliveryOption, deliveryOption === 'own' && styles.deliveryOptionSelected]}
              onPress={() => setDeliveryOption('own')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="cube-outline"
                size={22}
                color={deliveryOption === 'own' ? '#1E3A5F' : '#64748B'}
              />
              <View style={styles.deliveryTextContainer}>
                <Text
                  style={[styles.deliveryTitle, deliveryOption === 'own' && styles.deliveryTitleSelected]}
                >
                  Own Transport
                </Text>
                <Text style={styles.deliverySubtitle}>Pick up yourself</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deliveryOption, deliveryOption === 'site' && styles.deliveryOptionSelected]}
              onPress={() => setDeliveryOption('site')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="car-outline"
                size={22}
                color={deliveryOption === 'site' ? '#1E3A5F' : '#64748B'}
              />
              <View style={styles.deliveryTextContainer}>
                <Text
                  style={[styles.deliveryTitle, deliveryOption === 'site' && styles.deliveryTitleSelected]}
                >
                  Site Delivery
                </Text>
                <Text style={styles.deliverySubtitle}>We deliver to you</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bill Summary */}
        <Animated.View style={[styles.section, createAnimatedStyle(summaryAnim)]}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="receipt-outline" size={18} color="#1E293B" /> Bill Summary
          </Text>

          <View style={styles.billSummary}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>₹{subtotal.toLocaleString()}</Text>
            </View>

            <View style={styles.billDivider} />

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST (18%)</Text>
              <Text style={styles.billValue}>₹{gstAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.billDivider} />

            <View style={styles.billRow}>
              <Text style={styles.billLabelTotal}>Total Amount</Text>
              <Text style={styles.billValueTotal}>₹{grandTotal.toLocaleString()}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer - Place Order Button */}
      <Animated.View style={[styles.footer, createAnimatedStyle(buttonAnim)]}>
        <TouchableOpacity 
          style={[styles.proceedButton, (isPlacingOrder || orderLoading) && styles.proceedButtonDisabled]} 
          onPress={handlePlaceOrder} 
          activeOpacity={0.9}
          disabled={isPlacingOrder || orderLoading}
        >
          {isPlacingOrder || orderLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.proceedButtonText}>Place Order • ₹{grandTotal.toLocaleString()}</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.invoiceNote}>
          <Ionicons name="shield-checkmark-outline" size={12} color="#94A3B8" /> GST invoice will be generated
        </Text>
      </Animated.View>

      <BottomNavigation activeTab="Enterprises" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    marginLeft: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cartItemsContainer: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemNumberBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  itemNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  itemIcon: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    opacity: 0.8,
  },
  iconCube: {
    width: 38,
    height: 38,
    borderRadius: 6,
    opacity: 0.8,
  },
  iconGear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    opacity: 0.8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  itemPrice: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  quantityDisplay: {
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  quantityUnit: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: -2,
    fontWeight: '600',
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A5F',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  removeButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  section: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  deliveryOptionSelected: {
    borderColor: '#1E3A5F',
    backgroundColor: '#F0F4FF',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  deliveryTitleSelected: {
    color: '#1E3A5F',
  },
  deliverySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  billSummary: {
    gap: 0,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  billLabelTotal: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  billValueTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E3A5F',
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 24,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  proceedButton: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  proceedButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  proceedButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  invoiceNote: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});