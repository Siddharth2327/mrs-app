import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const OrderCard = ({ order, onPress }) => {
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#10B981';
      case 'Dispatched': return '#F59E0B';
      case 'Packed': return '#3B82F6';
      case 'Placed': return '#6B7280';
      default: return '#94A3B8';
    }
  };

  const getIconName = (type) => {
    switch (type) {
      case 'transport': return 'car-outline';
      case 'enterprise': return 'package-variant-outline';
      case 'combined': return 'truck-outline';
      default: return 'cube-outline';
    }
  };

  const getProgressSteps = () => {
    const steps = ['Placed', 'Packed', 'Dispatched', 'Delivered'];
    const currentIndex = steps.indexOf(order.status);
    
    return steps.map((step, index) => ({
      label: step,
      isCompleted: index < currentIndex,
      isActive: index === currentIndex,
      color: getStatusColor(step),
    }));
  };

  const progressSteps = getProgressSteps();
  const statusColor = getStatusColor(order.status);

  const handlePress = () => {
    onPress?.(order);
    router.push(`/orders/${order.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.95}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${statusColor}10` }]}>
          <Ionicons name={getIconName(order.type)} size={24} color={statusColor} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{order.title}</Text>
          <Text style={styles.orderId}>
            {order.orderId} • {order.date}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
        </View>
        <Text style={styles.price}>₹{order.price.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          {progressSteps.map((step, index) => (
            <View key={index} style={styles.progressStepContainer}>
              <View style={styles.progressStepWrapper}>
                <View
                  style={[
                    styles.progressDot,
                    step.isCompleted && { 
                      backgroundColor: step.color,
                      borderColor: step.color 
                    },
                    step.isActive && { 
                      backgroundColor: 'white',
                      borderColor: step.color,
                      borderWidth: 3 
                    },
                  ]}
                >
                  {step.isCompleted && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                {index < progressSteps.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      step.isCompleted && { backgroundColor: step.color },
                    ]}
                  />
                )}
              </View>
              <Text style={[
                styles.progressLabel,
                step.isCompleted && { color: step.color, fontWeight: '600' }
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: '#64748B',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressStepWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressLine: {
    position: 'absolute',
    top: 12.5,
    left: '50%',
    right: '-50%',
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    zIndex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OrderCard;
