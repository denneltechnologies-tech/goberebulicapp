import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';
import { registerPushToken } from '../services/pushNotifications';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.boundary}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>!</Text>
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        We hit an unexpected problem. This won&apos;t stop you — tap below to continue.
      </Text>
      <Pressable style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  boundary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      registerPushToken().catch(() => {});
    }
  }, [user]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
