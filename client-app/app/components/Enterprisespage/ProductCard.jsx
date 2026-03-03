import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductCard = ({ product, onAddToCart, onQuantityChange, cartQuantity = 0 }) => {
  const handleIncrement = () => {
    onQuantityChange?.(product.id, cartQuantity + 1);
  };

  const handleDecrement = () => {
    if (cartQuantity > 0) {
      onQuantityChange?.(product.id, cartQuantity - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  const getColorByType = (type) => {
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

  const getIconComponent = () => {
    const iconType = product.iconType || product.type;
    const iconColor = product.iconColor || getColorByType(product.type);

    switch (iconType) {
      case 'sand':
        return <View style={[styles.iconCircle, { backgroundColor: '#F4A460' }]} />;
      case 'm-sand':
        return <View style={[styles.iconCube, { backgroundColor: '#B0B0B0' }]} />;
      case 'p-sand':
        return <View style={[styles.iconCircle, { backgroundColor: '#D8BFD8' }]} />;
      case 'steel':
        return <View style={[styles.iconGear, { backgroundColor: '#778899' }]} />;
      case 'bricks':
        return <View style={[styles.iconCube, { backgroundColor: '#CD5C5C' }]} />;
      case 'cement':
        return <View style={[styles.iconCube, { backgroundColor: '#808080' }]} />;
      default:
        return <View style={[styles.iconCircle, { backgroundColor: iconColor }]} />;
    }
  };

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <View style={styles.card}>
      {hasDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            Save ₹{product.originalPrice - product.price}
          </Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconFallback}>{getIconComponent()}</View>
        )}
      </View>

      <View style={styles.content}>
        {/* ✅ 2-Line Title */}
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        {/* ✅ Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              ₹{product.originalPrice}
            </Text>
          )}
          <Text style={styles.unit}>/{product.unit}</Text>
        </View>

        {/* ✅ Quantity / Add Button */}
        {cartQuantity > 0 ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecrement}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{cartQuantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrement}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },

  discountText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#92400E',
  },

  imageContainer: {
    width: '100%',
    height: 80,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  iconFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    opacity: 0.8,
  },

  iconCube: {
    width: 32,
    height: 32,
    borderRadius: 6,
    opacity: 0.8,
  },

  iconGear: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.8,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    lineHeight: 16,
    minHeight: 32, // keeps cards equal height
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    flexWrap: 'wrap',
  },

  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 4,
  },

  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },

  unit: {
    fontSize: 10,
    color: '#64748B',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },

  quantityText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 6,
    paddingVertical: 8,
    gap: 4,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductCard;