import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { colors, radius, shadow, spacing, typography } from '../../../constants/theme';
import { ApiError } from '../../../services/api';
import { fetchOrders } from '../../../services/orders';
import type { Order } from '../../../types';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchOrders();
      setOrders(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <EmptyState title="Something went wrong" message={error} icon="alert-circle-outline" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" message="Your orders will appear here once you checkout." actionLabel="Start Shopping" onAction={() => router.push('/(app)/(tabs)')} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => router.push(`/(app)/order/${item.id}`)}>
              <View style={styles.cardTop}>
                <View style={styles.orderIdRow}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="receipt-outline" color={colors.primaryDark} size={18} />
                  </View>
                  <View>
                    <Text style={styles.orderNumber}>{item.order_number}</Text>
                    <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                <View style={getStatusStyle(item.order_status)}>
                  <Text style={styles.badgeText}>{titleCase(item.order_status)}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.total}>₦{Number(item.total).toLocaleString()}</Text>
                <View style={styles.paymentWrap}>
                  <Ionicons
                    name={item.payment_status === 'SUCCESSFUL' || item.payment_status === 'paid' ? 'checkmark-circle' : 'time-outline'}
                    color={item.payment_status === 'SUCCESSFUL' || item.payment_status === 'paid' ? colors.success : colors.textMuted}
                    size={14}
                  />
                  <Text style={styles.payment}>
                    Payment: <Text style={styles.paymentValue}>{titleCase(item.payment_status)}</Text>
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

function titleCase(value: string | null | undefined): string {
  if (!value) return '—';
  const readable = value.replace(/_/g, ' ').replace(/-/g, ' ');
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function getStatusStyle(status: string) {
  if (status === 'completed' || status === 'delivered') return styles.badgeCompleted;
  if (status === 'cancelled' || status === 'failed') return styles.badgeCancelled;
  if (status === 'processing' || status === 'shipped') return styles.badgeProcessing;
  return styles.badgeDefault;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  pressed: { opacity: 0.9 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumber: { ...typography.section, fontWeight: '700', fontSize: 14.5 },
  meta: { color: colors.textMuted, fontSize: 12.5, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: radius.full },
  badgeDefault: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: radius.full },
  badgeCompleted: { backgroundColor: '#dcfce7', paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: radius.full },
  badgeCancelled: { backgroundColor: '#fee2e2', paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: radius.full },
  badgeProcessing: { backgroundColor: '#dbeafe', paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.dark },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm + 2,
  },
  total: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  paymentWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  payment: { color: colors.textMuted, fontSize: 12.5 },
  paymentValue: { color: colors.text, fontWeight: '700' },
});