import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Screen } from '../../../components/Screen';
import { STORAGE_URL } from '../../../constants/config';
import { colors, radius, shadow, spacing, typography } from '../../../constants/theme';
import { ApiError } from '../../../services/api';
import { addToCart } from '../../../services/cart';
import { fetchProduct } from '../../../services/products';
import { useAuthStore } from '../../../stores/authStore';
import { useCartStore } from '../../../stores/cartStore';
import type { Product } from '../../../types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const user = useAuthStore((s) => s.user);
  const setCart = useCartStore((s) => s.setCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchProduct(productId);
      setProduct(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      const cart = await addToCart(productId);
      setCart(cart);
      router.push('/(app)/(tabs)');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (error || !product) {
    return (
      <Screen style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" color={colors.danger} size={40} />
        </View>
        <Text style={styles.error}>{error ?? 'Product not found.'}</Text>
        <Button title="Back to Home" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  const imageUrl = product.image_url ?? (product.image ? `${STORAGE_URL}/${product.image}` : null);
  const unavailable = product.status !== 'active';

  return (
    <Screen safeEdges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Ionicons name="cube-outline" color={colors.primary} size={80} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          {product.category?.name ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{product.category.name}</Text>
            </View>
          ) : null}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₦{Number(product.price).toLocaleString()}</Text>
          {unavailable ? (
            <View style={styles.unavailablePill}>
              <Ionicons name="time-outline" color={colors.danger} size={14} />
              <Text style={styles.unavailableText}>Currently unavailable</Text>
            </View>
          ) : null}
          <View style={styles.divider} />
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.description}>
            {product.description ?? 'No description available.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={user ? 'Add to Cart' : 'Sign In to Buy'}
          onPress={handleAdd}
          loading={adding}
          style={styles.footerBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorIcon: {
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 16,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 120,
  },
  imageWrap: {
    width: '100%',
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
  info: {
    padding: spacing.lg,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginBottom: spacing.sm,
  },
  categoryText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  name: {
    ...typography.title,
    lineHeight: 32,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.sm,
  },
  unavailablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginTop: spacing.md,
  },
  unavailableText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  descLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  footerBtn: {
    ...shadow.button,
  },
});