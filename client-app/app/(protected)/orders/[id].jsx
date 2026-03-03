import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import { generateOrderReceipt } from '../../utils/receiptGenerator';
import useAuthStore from '../../../store/authStore';

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const user = useAuthStore((state) => state.user);
  const userData = useAuthStore((state) => state.userData);

  // Animation values
  const statusCardAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const itemsAnim = useRef(new Animated.Value(0)).current;
  const deliveryAnim = useRef(new Animated.Value(0)).current;
  const paymentAnim = useRef(new Animated.Value(0)).current;
  const receiptBtnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id) return;

    const unsubscribe = firestore()
      .collection('orders')
      .doc(id)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            setOrder({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate().toISOString(),
              updatedAt: doc.data().updatedAt?.toDate().toISOString(),
            });
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching order:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!loading && order) {
      // Staggered animations
      Animated.stagger(100, [
        Animated.timing(statusCardAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(itemsAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(deliveryAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(paymentAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(receiptBtnAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, order]);

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

  const handleDownloadReceipt = async () => {
    if (!order) return;

    setDownloadingReceipt(true);

    try {
      const userInfo = {
        name: userData?.name || user?.displayName || 'Customer',
        phone: userData?.phone || user?.phoneNumber || 'N/A',
      };

      const result = await generateOrderReceipt(order, userInfo);

      if (result.success) {
        Alert.alert(
          'Success',
          'Receipt downloaded successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to generate receipt. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Download receipt error:', error);
      Alert.alert(
        'Error',
        'An error occurred while generating the receipt.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      delivered: { color: '#10B981', gradient: ['#ECFDF5', '#F8FAFC'], icon: 'checkmark-circle' },
      dispatched: { color: '#8B5CF6', gradient: ['#F3E8FF', '#F8FAFC'], icon: 'rocket' },
      packed: { color: '#F59E0B', gradient: ['#FEF3C7', '#F8FAFC'], icon: 'cube' },
      placed: { color: '#3B82F6', gradient: ['#EFF6FF', '#F8FAFC'], icon: 'time' },
    };
    return configs[status?.toLowerCase()] || configs.placed;
  };

  const getProgressSteps = () => {
    const steps = ['Placed', 'Packed', 'Dispatched', 'Delivered'];
    const currentStatus = order?.status || 'Placed';
    const currentIndex = steps.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());

    return steps.map((step, index) => ({
      label: step,
      isCompleted: index < currentIndex,
      isActive: index === currentIndex,
      color: getStatusConfig(step.toLowerCase()).color,
      icon: getStatusConfig(step.toLowerCase()).icon,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(order.status?.toLowerCase());
  const progressSteps = getProgressSteps();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card with Gradient */}
        <Animated.View style={createAnimatedStyle(statusCardAnim)}>
          <LinearGradient
            colors={statusConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.color }]}>
                <Ionicons name={statusConfig.icon} size={28} color="#fff" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Order Status</Text>
                <Text style={[styles.statusValue, { color: statusConfig.color }]}>
                  {order.status || 'Placed'}
                </Text>
              </View>
            </View>

            <View style={styles.orderIdRow}>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderIdValue}>{order.id?.slice(0, 12)}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Download Receipt Button */}
        <Animated.View style={createAnimatedStyle(receiptBtnAnim)}>
          <TouchableOpacity
            style={styles.downloadReceiptButton}
            onPress={handleDownloadReceipt}
            disabled={downloadingReceipt}
            activeOpacity={0.8}
          >
            {downloadingReceipt ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.downloadReceiptText}>
              {downloadingReceipt ? 'Generating Receipt...' : 'Download Receipt'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Tracker */}
        <Animated.View style={[styles.section, createAnimatedStyle(progressAnim)]}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <View style={styles.progressContainer}>
            {progressSteps.map((step, index) => (
              <View key={index} style={styles.progressStep}>
                <View style={styles.progressDotWrapper}>
                  <View
                    style={[
                      styles.progressDotLarge,
                      step.isCompleted && {
                        backgroundColor: step.color,
                        borderColor: step.color,
                      },
                      step.isActive && {
                        backgroundColor: step.color,
                        borderColor: step.color,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    {step.isCompleted && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                    {step.isActive && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  {index < progressSteps.length - 1 && (
                    <View
                      style={[
                        styles.progressLineLarge,
                        (step.isCompleted || step.isActive) && { backgroundColor: step.color },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.progressStepContent}>
                  <Text
                    style={[
                      styles.progressStepLabel,
                      (step.isCompleted || step.isActive) && {
                        color: step.color,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
                  {step.isActive && step.label.toLowerCase() !== 'delivered' && (
                    <Text style={styles.progressStepTime}>In Progress</Text>
                  )}
                  {(step.isCompleted || (step.isActive && step.label.toLowerCase() === 'delivered')) && (
                    <Text style={styles.progressStepTime}>Completed</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Order Items */}
        <Animated.View style={[styles.section, createAnimatedStyle(itemsAnim)]}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsContainer}>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <Ionicons name="cube-outline" size={20} color="#64748B" />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity} {item.unit}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{item.subtotal}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Delivery Details */}
        <Animated.View style={[styles.section, createAnimatedStyle(deliveryAnim)]}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#64748B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Delivery Address</Text>
                <Text style={styles.detailValue}>
                  {order.deliveryAddress?.fullAddress || 'Chennai, Tamil Nadu 600001'}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Order Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Payment Summary */}
        <Animated.View style={[styles.section, createAnimatedStyle(paymentAnim)]}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentValue}>₹{order.subtotal || 0}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>GST (18%)</Text>
              <Text style={styles.paymentValue}>₹{order.gst || 0}</Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentTotalLabel}>Total Amount</Text>
              <Text style={styles.paymentTotalValue}>₹{order.totalAmount || 0}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerBackButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    borderRadius: 14,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  orderIdLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  orderIdValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'monospace',
  },
  downloadReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A5F',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadReceiptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  progressDotWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginRight: 14,
  },
  progressDotLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressLineLarge: {
    position: 'absolute',
    top: 32,
    left: 15,
    width: 2,
    height: 40,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  progressStepContent: {
    flex: 1,
    paddingTop: 4,
  },
  progressStepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 3,
  },
  progressStepTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  itemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  itemQuantity: {
    fontSize: 11,
    color: '#64748B',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 19,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  paymentTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  paymentTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A5F',
    letterSpacing: 0.3,
  },
  bottomPadding: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});