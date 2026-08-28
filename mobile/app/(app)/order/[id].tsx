import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Screen } from '../../../components/Screen';
import { colors, radius, shadow, spacing, typography } from '../../../constants/theme';
import { ApiError } from '../../../services/api';
import { fetchOrder } from '../../../services/orders';
import { initializePayment, verifyPayment } from '../../../services/payment';
import * as WebBrowser from 'expo-web-browser';
import type { Order } from '../../../types';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchOrder(orderId);
      setOrder(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const retryPayment = async () => {
    setPaying(true);
    try {
      const init = await initializePayment(orderId, 'paystack');
      if (!init.authorization_url) {
        setError('Payment is not available for this order.');
        setPaying(false);
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(init.authorization_url, 'gobe-republic://paystack');
      if (result.type === 'success') {
        await verifyPayment(init.reference);
        await load();
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment could not be processed.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (error || !order) {
    return (
      <Screen style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" color={colors.danger} size={40} />
        </View>
        <Text style={styles.error}>{error ?? 'Order not found.'}</Text>
      </Screen>
    );
  }

  const paid = order.payment_status === 'SUCCESSFUL' || order.payment_status === 'paid';
  const canPay = order.payment_status === 'pending' || order.payment_status === 'failed';

  return (
    <Screen safeEdges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headCard}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.meta}>Placed {formatDate(order.created_at)}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.badge, orderStatusStyle(order.order_status)]}>
              <Ionicons name={orderStatusIcon(order.order_status)} color={colors.dark} size={13} />
              <Text style={styles.badgeText}>Order: {titleCase(order.order_status)}</Text>
            </View>
            <View style={[styles.badge, paid ? styles.badgePaid : styles.badgePending]}>
              <Ionicons name={paid ? 'checkmark-circle' : 'time-outline'} color={colors.dark} size={13} />
              <Text style={styles.badgeText}>Payment: {titleCase(order.payment_status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <View style={styles.sectionIcon}>
            <Ionicons name="bag-handle-outline" color={colors.primary} size={18} />
          </View>
          <Text style={styles.sectionTitle}>Items</Text>
        </View>
        <View style={styles.card}>
          {(order.items ?? []).map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × ₦{Number(item.unit_price).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.itemTotal}>₦{Number(item.total).toLocaleString()}</Text>
            </View>
          ))}
          <View style={[styles.divider]} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₦{Number(order.subtotal).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>₦{Number(order.delivery_fee).toLocaleString()}</Text>
          </View>
          <View style={[styles.totalRow, styles.summaryRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{Number(order.total).toLocaleString()}</Text>
          </View>
        </View>

        {order.delivery_information ? (
          <>
            <View style={styles.sectionHead}>
              <View style={styles.sectionIcon}>
                <Ionicons name="location-outline" color={colors.primary} size={18} />
              </View>
              <Text style={styles.sectionTitle}>Delivery</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.deliveryName}>{order.delivery_information.recipient_name}</Text>
              <Text style={styles.deliveryMeta}>{order.delivery_information.phone}</Text>
              <Text style={styles.deliveryMeta}>{order.delivery_information.address}</Text>
              {order.delivery_information.city ? (
                <Text style={styles.deliveryMeta}>{order.delivery_information.city}</Text>
              ) : null}
              {order.delivery_information.additional_notes ? (
                <Text style={styles.deliveryNotes}>“{order.delivery_information.additional_notes}”</Text>
              ) : null}
            </View>
          </>
        ) : null}

        {canPay ? (
          <Button title="Pay Now" onPress={retryPayment} loading={paying} style={styles.payBtn} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function titleCase(value: string | null | undefined): string {
  if (!value) return '—';
  const readable = value.replace(/_/g, ' ').replace(/-/g, ' ');
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function orderStatusStyle(status: string) {
  if (status === 'completed' || status === 'delivered') return styles.badgePaid;
  if (status === 'cancelled' || status === 'failed') return styles.badgeCancelled;
  if (status === 'processing' || status === 'shipped') return styles.badgeProcessing;
  return styles.badgePending;
}

function orderStatusIcon(status: string) {
  if (status === 'completed' || status === 'delivered') return 'checkmark-circle' as const;
  if (status === 'cancelled' || status === 'failed') return 'close-circle' as const;
  if (status === 'processing' || status === 'shipped') return 'cog' as const;
  return 'time-outline' as const;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  errorIcon: { marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: 16 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  headCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  orderNumber: { ...typography.heading, fontSize: 20 },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  statusRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  badgePaid: { backgroundColor: '#dcfce7' },
  badgePending: { backgroundColor: colors.primaryLight },
  badgeCancelled: { backgroundColor: '#fee2e2' },
  badgeProcessing: { backgroundColor: '#dbeafe' },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.dark },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { ...typography.heading, fontSize: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  itemInfo: { flex: 1, marginRight: spacing.md },
  itemName: { color: colors.text, fontWeight: '600', fontSize: 15 },
  itemMeta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  itemTotal: { color: colors.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  summaryLabel: { color: colors.textMuted, fontSize: 14 },
  summaryValue: { color: colors.text, fontWeight: '600', fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm + 2, marginTop: spacing.sm },
  totalLabel: { color: colors.text, fontWeight: '700', fontSize: 15 },
  totalValue: { color: colors.primaryDark, fontWeight: '800', fontSize: 15 },
  deliveryName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  deliveryMeta: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  deliveryNotes: { color: colors.text, fontStyle: 'italic', fontSize: 14, marginTop: spacing.sm },
  payBtn: { marginTop: spacing.lg },
});