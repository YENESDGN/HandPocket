import { create } from 'zustand';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'hp_theme';

// ── Color palettes ────────────────────────────────────────────────────────────

export interface ThemeColors {
  bg: string;
  card: string;
  cardInner: string;
  primary: string;
  text: string;
  textMuted: string;
  textDim: string;
  border: string;
  borderDim: string;
  tabBar: string;
}

export const DARK: ThemeColors = {
  bg: '#004561',
  card: '#206988',
  cardInner: '#1a3a4a',
  primary: '#08b4fb',
  text: '#ffffff',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  border: 'rgba(255,255,255,0.1)',
  borderDim: 'rgba(255,255,255,0.06)',
  tabBar: '#004561',
};

export const LIGHT: ThemeColors = {
  bg: '#e8f4fd',
  card: '#ffffff',
  cardInner: '#d0eaf8',
  primary: '#08b4fb',
  text: '#0c2234',
  textMuted: '#406683',
  textDim: '#6b8fa8',
  border: 'rgba(8,100,150,0.12)',
  borderDim: 'rgba(8,100,150,0.06)',
  tabBar: '#ffffff',
};

// ── Store ─────────────────────────────────────────────────────────────────────

interface ThemeState {
  isDark: boolean;
  toggle: () => Promise<void>;
  loadSaved: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  loadSaved: async () => {
    const saved = await SecureStore.getItemAsync(THEME_KEY);
    // default to light if no preference saved yet
    const isDark = saved === 'dark';
    Appearance.setColorScheme(isDark ? 'dark' : 'light');
    set({ isDark });
  },

  toggle: async () => {
    const next = !get().isDark;
    Appearance.setColorScheme(next ? 'dark' : 'light');
    await SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light');
    set({ isDark: next });
  },
}));

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useThemeColors = (): ThemeColors => {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? DARK : LIGHT;
};
