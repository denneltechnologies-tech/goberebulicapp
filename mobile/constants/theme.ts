export const colors = {
  primary: '#f59e0b',
  primaryDark: '#b45309',
  primaryDeep: '#92400e',
  primaryLight: '#fef3c7',
  tint: '#fffbeb',
  background: '#f6f7f9',
  surface: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e5e7eb',
  danger: '#dc2626',
  success: '#16a34a',
  info: '#2563eb',
  white: '#ffffff',
  dark: '#0f172a',
  overlay: 'rgba(15, 23, 42, 0.05)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 16,
  xl: 22,
  full: 9999,
};

export const shadow = {
  card: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  button: {
    shadowColor: '#b45309',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export const typography = {
  title: { fontSize: 26, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.5 },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.3 },
  section: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
};