import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartPage() {
  const router = useRouter();
  const [deliveryOption, setDeliveryOption] = useState('own');
  
  // Get cart from global state (Zustand/Context later)
  const [cartItems, setCartItems] = useState([
    {
      id: 2,
      name: 'M-Sand',
      price: 55,
      quantity: 1,
      unit: 'per cubic ft',
      iconType: 'cube',
      iconColor: '#B0B0B0',
    },
    {
      id: 4,
      name: 'Steel Rods 8mm',
      price: 72,
      quantity: 2,
      unit: 'per kg',
      iconType: 'gear',
      iconColor: '#778899',
    },
  ]);

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleProceedToBuy = () => {
    router.push('/checkout');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstRate = 0.18;
  const gstAmount = Math.round(subtotal * gstRate);
  const grandTotal = subtotal + gstAmount;
  const formattedGrandTotal = grandTotal.toLocaleString('en-IN');

  const getIconComponent = (iconType, iconColor) => {
    const iconSize = 32;
    
    switch (iconType) {
      case 'cube':
        return <View style={[styles.iconCube, { backgroundColor: iconColor }]} />;
      case 'gear':
        return <MaterialCommunityIcons name="hexagon-multiple" size={iconSize} color={iconColor} />;
      default:
        return <View style={[styles.iconDefault, { backgroundColor: iconColor }]} />;
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar style="dark" />
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={80} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add materials from Enterprises</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/enterprises')}>
            <Text style={styles.emptyButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({cartItems.length})</Text>
        <TouchableOpacity style={styles.clearCart}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cartItemsContainer}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemIcon}>
                {getIconComponent(item.iconType, item.iconColor)}
              </View>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  ₹{item.price} × {item.quantity} {item.unit}
                </Text>
              </View>

              <View style={styles.itemControls}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={18} color="#1E293B" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={18} color="#1E293B" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Option</Text>
          
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryOption === 'own' && styles.deliveryOptionSelected,
              ]}
              onPress={() => setDeliveryOption('own')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="cube-outline" 
                size={24} 
                color={deliveryOption === 'own' ? '#10B981' : '#94A3B8'} 
              />
              <View style={styles.deliveryTextContainer}>
                <Text style={[
                  styles.deliveryTitle,
                  deliveryOption === 'own' && styles.deliveryTitleSelected,
                ]}>
                  Own Transport
                </Text>
                <Text style={styles.deliverySubtitle}>Pick up yourself</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryOption === 'site' && styles.deliveryOptionSelected,
              ]}
              onPress={() => setDeliveryOption('site')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="truck-outline" 
                size={24} 
                color={deliveryOption === 'site' ? '#10B981' : '#94A3B8'} 
              />
              <View style={styles.deliveryTextContainer}>
                <Text style={[
                  styles.deliveryTitle,
                  deliveryOption === 'site' && styles.deliveryTitleSelected,
                ]}>
                  Site Delivery
                </Text>
                <Text style={styles.deliverySubtitle}>We deliver to site</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          
          <View style={styles.billSummary}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST (18%)</Text>
              <Text style={styles.billValue}>₹{gstAmount.toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.billRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{formattedGrandTotal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceedToBuy} activeOpacity={0.9}>
          <Text style={styles.proceedButtonText}>
            Proceed to Buy • ₹{formattedGrandTotal}
          </Text>
        </TouchableOpacity>
        <Text style={styles.invoiceNote}>GST invoice available</Text>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={24} color="#94A3B8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/transports')}>
          <Ionicons name="car-outline" size={24} color="#94A3B8" />
          <Text style={styles.navText}>Transports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/enterprises')}>
          <Ionicons name="briefcase-outline" size={24} color="#94A3B8" />
          <Text style={styles.navText}>Enterprises</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="clipboard-check" size={24} color="#3B82F6" />
          <Text style={styles.navTextActive}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#94A3B8" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  cartItemsContainer: {
    paddingTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconCube: {
    width: 40,
    height: 40,
    borderRadius: 6,
    opacity: 0.5,
  },
  iconDefault: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.5,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E53935',
  },
  section: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
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
    borderColor: '#E8E8E8',
    backgroundColor: '#F8F9FA',
  },
  deliveryOptionSelected: {
    borderColor: '#1E3A5F',
    backgroundColor: '#F0F4FF',
  },
  deliveryTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  deliveryTitleSelected: {
    color: '#1E3A5F',
  },
  deliverySubtitle: {
    fontSize: 12,
    color: '#999',
  },
  billSummary: {
    gap: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 15,
    color: '#666',
  },
  billValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 4,
  },
  grandTotalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  proceedButton: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  invoiceNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    color: '#1E3A5F',
    fontWeight: '600',
  },
});