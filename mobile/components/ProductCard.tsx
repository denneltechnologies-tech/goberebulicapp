import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing } from '../constants/theme';
import { STORAGE_URL } from '../constants/config';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const imageUrl = product.image_url ?? (product.image ? `${STORAGE_URL}/${product.image}` : null);
  const inactive = product.status !== 'active';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        inactive && styles.inactive,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(product)}
    >
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>{product.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {inactive ? (
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>Unavailable</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.category?.name ? (
          <Text style={styles.category} numberOfLines={1}>
            {product.category.name}
          </Text>
        ) : null}
        <Text style={styles.price}>₦{Number(product.price).toLocaleString()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.card,
  },
  inactive: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.tint,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.primary,
  },
  ribbon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15,23,42,0.72)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  ribbonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    padding: spacing.sm + 2,
  },
  name: {
    fontSize: 13.5,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 18,
  },
  category: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },
});