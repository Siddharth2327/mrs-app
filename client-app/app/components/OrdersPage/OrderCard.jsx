import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const OrderCard = ({ order, onPress }) => {

  const getStatusConfig = (status) => {
    const configs = {
      delivered: {
        color: '#10B981',
        gradient: ['#ECFDF5', '#FFFFFF'],
        bgColor: '#ECFDF5',
      },
      dispatched: {
        color: '#8B5CF6',
        gradient: ['#F3E8FF', '#FFFFFF'],
        bgColor: '#F3E8FF',
      },
      packed: {
        color: '#F59E0B',
        gradient: ['#FEF3C7', '#FFFFFF'],
        bgColor: '#FEF3C7',
      },
      placed: {
        color: '#3B82F6',
        gradient: ['#EFF6FF', '#FFFFFF'],
        bgColor: '#EFF6FF',
      },
    };

    return configs[status?.toLowerCase()] || configs.placed;
  };

  const getIconName = (type) => {
    switch (type) {
      case 'transport': return 'car-outline';
      case 'enterprise': return 'cube-outline';
      case 'combined': return 'layers-outline';
      default: return 'bag-outline';
    }
  };

  // ✅ Updated Progress Logic
  const getProgressSteps = () => {
    const steps = ['Placed', 'Packed', 'Dispatched', 'Delivered'];
    const currentStatus = order.status || 'Placed';

    const currentIndex = steps.findIndex(
      s => s.toLowerCase() === currentStatus.toLowerCase()
    );

    return steps.map((step, index) => ({
      label: step,
      isCompleted: index <= currentIndex, // FIXED
      color: getStatusConfig(step.toLowerCase()).color,
    }));
  };

  const progressSteps = getProgressSteps();
  const statusConfig = getStatusConfig(order.status?.toLowerCase());

  // Get material image if available
  const getMaterialImage = () => {
    if (order.materialImage) return order.materialImage;
    if (order.materials?.[0]?.image) return order.materials[0].image;
    if (order.image) return order.image;
    return null;
  };

  const materialImage = getMaterialImage();

  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={statusConfig.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          {materialImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: materialImage }}
                style={styles.materialImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
              ]}
            >
              <Ionicons
                name={getIconName(order.type)}
                size={22}
                color={statusConfig.color}
              />
            </View>
          )}

          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={1}>
              {order.title ||
                order.materials?.[0]?.name ||
                order.materials?.[0] ||
                'Order'}
            </Text>

            <Text style={styles.orderId}>
              {order.id?.slice(0, 12) || 'MRS1234567'} •{' '}
              {order.date ||
                new Date(order.createdAt).toLocaleDateString(
                  'en-GB',
                  { day: 'numeric', month: 'short', year: 'numeric' }
                )}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94A3B8"
          />
        </View>

        {/* Status and Price */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusConfig.color },
              ]}
            >
              {order.status || 'Placed'}
            </Text>
          </View>

          <Text style={styles.price}>
            ₹{order.totalAmount || order.price || 0}
          </Text>
        </View>

        {/* Progress Tracker */}
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
                        borderColor: step.color,
                      },
                    ]}
                  >
                    {step.isCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={10}
                        color="white"
                      />
                    )}
                  </View>

                  {index < progressSteps.length - 1 && (
                    <View
                      style={[
                        styles.progressLine,
                        step.isCompleted && {
                          backgroundColor: step.color,
                        },
                      ]}
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.progressLabel,
                    step.isCompleted && {
                      color: step.color,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  materialImage: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  orderId: {
    fontSize: 12,
    color: '#64748B',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressContainer: {
    marginTop: 8,
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
    marginBottom: 8,
  },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressLine: {
    position: 'absolute',
    top: 10,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  progressLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OrderCard;