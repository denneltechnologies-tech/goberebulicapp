import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ProductCard } from '../../../components/ProductCard';
import { Screen } from '../../../components/Screen';
import { colors, radius, shadow, spacing, typography } from '../../../constants/theme';
import { ApiError } from '../../../services/api';
import { fetchCategories, fetchProducts } from '../../../services/products';
import { useAuthStore } from '../../../stores/authStore';
import type { Category, Product } from '../../../types';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProducts = useCallback(async (reset = false, cat: number | null = selectedCategory, q = search) => {
    try {
      if (reset) setLoading(true);
      const targetPage = reset ? 1 : page;
      const res = await fetchProducts({
        page: targetPage,
        category_id: cat ?? undefined,
        search: q || undefined,
      });
      setProducts((prev) => (reset ? res.items : [...prev, ...res.items]));
      setPage(res.pagination.current_page + 1);
      setHasMore(res.pagination.current_page < res.pagination.last_page);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page, search, selectedCategory]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetchCategories();
      setCategories(res);
    } catch {
      // non-fatal
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadCategories();
    loadProducts(true);
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    loadCategories();
    loadProducts(true);
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadProducts(true);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory]);

  const onEndReached = () => {
    if (hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      loadProducts(false);
    }
  };

  const firstName = (user?.name ?? 'Shopper').split(' ')[0];

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.greetingTexts}>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.greetingSub}>Style for every day, delivered.</Text>
          </View>
          <Pressable style={styles.notifBtn} onPress={() => router.push('/(app)/(tabs)/profile')}>
            <Ionicons name="notifications-outline" color={colors.text} size={20} />
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <Ionicons name="search" color={colors.textMuted} size={18} />
          <TextInput
            style={styles.search}
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.textMuted}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" color={colors.textMuted} size={18} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroCircleA} />
              <View style={styles.heroCircleB} />
              <Text style={styles.heroEyebrow}>GOBE COLLECTION</Text>
              <Text style={styles.heroTitle}>New Season,{'\n'}New You</Text>
              <Text style={styles.heroSub}>Shop fresh styles, essentials & more — delivered to your door.</Text>
              <Pressable style={styles.heroCta} onPress={() => { setSearch(''); setSelectedCategory(null); }}>
                <Text style={styles.heroCtaText}>Shop Now</Text>
                <Ionicons name="arrow-forward" color={colors.primaryDark} size={16} />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Pressable
                style={[styles.chip, selectedCategory === null && styles.chipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Ionicons
                  name="grid-outline"
                  size={16}
                  color={selectedCategory === null ? colors.white : colors.textMuted}
                />
                <Text style={[styles.chipText, selectedCategory === null && styles.chipTextActive]}>All</Text>
              </Pressable>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.chip, selectedCategory === c.id && styles.chipActive]}
                  onPress={() => setSelectedCategory(c.id)}
                >
                  <Text style={[styles.chipText, selectedCategory === c.id && styles.chipTextActive]}>{c.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
          ) : (
            <View style={styles.center}><Text style={styles.empty}>No products found.</Text></View>
          )
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={colors.primary} style={styles.footerLoader} /> : null
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={(p) => router.push(`/(app)/product/${p.id}`)} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  greetingTexts: {
    flex: 1,
    marginLeft: spacing.sm + 2,
  },
  greeting: {
    ...typography.heading,
    fontSize: 18,
  },
  greetingSub: {
    ...typography.caption,
    fontSize: 12.5,
    marginTop: 1,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 46,
    ...shadow.card,
  },
  search: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    gap: spacing.sm + 2,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.button,
  },
  heroCircleA: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroCircleB: {
    position: 'absolute',
    bottom: -50,
    right: 60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: spacing.sm,
    lineHeight: 32,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: spacing.sm,
    maxWidth: 260,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  heroCtaText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  chips: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13.5,
  },
  chipTextActive: {
    color: colors.white,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  center: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
  },
  footerLoader: {
    padding: spacing.md,
  },
});