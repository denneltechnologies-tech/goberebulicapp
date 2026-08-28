import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { STORAGE_URL } from '../../../constants/config';
import { colors, radius, shadow, spacing, typography } from '../../../constants/theme';
import { ApiError } from '../../../services/api';
import { fetchCart, removeCartItem, updateCartItem } from '../../../services/cart';
import { useAuthStore } from '../../../stores/authStore';
import { useCartStore } from '../../../stores/cartStore';
import type { CartItem } from '../../../types';

export default function CartScreen() {
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const setCart = useCartStore((s) => s.setCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      if (cart === null) setLoading(true);
      const res = await fetchCart();
      setCart(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cart === null]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const changeQty = async (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) return;
    try {
      const res = await updateCartItem(item.id, next);
      setCart(res);
    } catch {
      // keep UI unchanged on error
    }
  };

  const remove = async (item: CartItem) => {
    try {
      const res = await removeCartItem(item.id);
      setCart(res);
    } catch {
      // ignore
    }
  };

  if (loading || !user) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  const itemCount = cart?.item_count ?? 0;

  return (
    <Screen>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {itemCount === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse our products and add something you love."
          actionLabel="Browse Products"
          onAction={() => router.push('/(app)/(tabs)')}
        />
      ) : (
        <FlatList
          data={cart?.items ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const imageUrl = item.product?.image_url ?? (item.product?.image ? `${STORAGE_URL}/${item.product.image}` : null);
            return (
              <View style={styles.item}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Ionicons name="cube-outline" color={colors.primary} size={22} />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product?.name ?? `Product #${item.product_id}`}
                  </Text>
                  <Text style={styles.itemPrice}>₦{Number(item.unit_price).toLocaleString()}</Text>
                  <View style={styles.qtyRow}>
                    <View style={styles.stepper}>
                      <PressableCircle icon="remove" onPress={() => changeQty(item, -1)} />
                      <Text style={styles.qty}>{item.quantity}</Text>
                      <PressableCircle icon="add" onPress={() => changeQty(item, 1)} />
                    </View>
                    <PressableRemove onPress={() => remove(item)} />
                  </View>
                </View>
                <Text style={styles.lineTotal}>₦{Number(item.line_total).toLocaleString()}</Text>
              </View>
            );
          }}
          ListFooterComponent={
            <View style={styles.footer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
                <Text style={styles.summaryValue}>₦{Number(cart?.subtotal ?? 0).toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>Calculated at checkout</Text>
              </View>
              <Button title="Proceed to Checkout" onPress={() => router.push('/(app)/checkout')} loading={false} style={styles.checkoutBtn} />
            </View>
          }
        />
      )}
    </Screen>
  );
}

function PressableCircle({ icon, onPress }: { icon: 'add' | 'remove'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={icon === 'add' ? 'Increase quantity' : 'Decrease quantity'}
      style={({ pressed }) => [styles.stepBtn, { borderColor: colors.primary }, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon === 'add' ? 'add' : 'remove'} color={colors.primaryDark} size={18} />
    </Pressable>
  );
}

function PressableRemove({ onPress }: { onPress: () => void }) {
  return (
    <Button title="Remove" variant="ghost" style={styles.removeBtn} onPress={onPress} />
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger, textAlign: 'center', padding: spacing.md },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.card,
  },
  itemImage: {
    width: 74,
    height: 74,
    borderRadius: radius.md,
    backgroundColor: colors.tint,
  },
  itemImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.sm + 2,
    marginRight: spacing.sm,
  },
  itemName: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 19,
  },
  itemPrice: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBtn: {
    width: 38,
    height: 34,
    borderRadius: radius.full,
    borderWidth: 1.5,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginLeft: spacing.sm,
  },
  lineTotal: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 15,
  },
  footer: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { color: colors.textMuted, fontSize: 15 },
  summaryValue: { color: colors.text, fontWeight: '600', fontSize: 15 },
  checkoutBtn: { marginTop: spacing.sm },
});