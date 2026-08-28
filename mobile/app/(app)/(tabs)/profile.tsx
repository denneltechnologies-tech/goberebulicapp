import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Screen } from '../../../components/Screen';
import { colors, radius, shadow, spacing, typography } from '../../../constants/theme';
import { useAuthStore } from '../../../stores/authStore';
import { useCartStore } from '../../../stores/cartStore';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const resetCart = useCartStore((s) => s.reset);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          resetCart();
          router.replace('/login');
        },
      },
    ]);
  };

  const menu: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    {
      icon: 'receipt-outline',
      label: 'My Orders',
      onPress: () => router.push('/(app)/(tabs)/orders'),
    },
    {
      icon: 'cart-outline',
      label: 'Shopping Cart',
      onPress: () => router.push('/(app)/(tabs)/cart'),
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      onPress: () => Alert.alert('Coming Soon', 'Payment methods management is not yet available.'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notifications are not yet available.'),
    },
    {
      icon: 'person-outline',
      label: 'Update Profile',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing is not yet available.'),
    },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroCircle} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name ?? 'G').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'User'}</Text>
          <Text style={styles.email}>{user?.email ?? '—'}{user?.phone ? `  •  ${user.phone}` : ''}</Text>
          <View style={styles.rolePill}>
            <Ionicons name="shield-checkmark-outline" color={colors.primaryDark} size={14} />
            <Text style={styles.roleText}>{user?.role ?? 'customer'}</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menu.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                idx < menu.length - 1 && styles.menuRowBorder,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} color={colors.primaryDark} size={20} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" color={colors.textMuted} size={18} />
            </Pressable>
          ))}
        </View>

        <Button title="Sign Out" variant="danger" style={styles.signOut} onPress={handleLogout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow.button,
  },
  heroCircle: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  name: {
    ...typography.heading,
    fontSize: 21,
    color: colors.white,
    marginTop: spacing.md,
  },
  email: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13.5,
    marginTop: 3,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginTop: spacing.sm + 2,
  },
  roleText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm + 2,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  signOut: {
    marginTop: spacing.lg,
  },
});