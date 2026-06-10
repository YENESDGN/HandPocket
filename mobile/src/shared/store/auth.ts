import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../api/supabase';
import { createUser, getMe, updateMe, deleteMe, uploadPushToken } from '../api/services/userService';
import type { User } from '../types';

async function registerPushToken(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    const granted =
      status === 'granted' ||
      (await Notifications.requestPermissionsAsync()).status === 'granted';
    if (!granted) return;
    // projectId is required in Expo SDK 53+ for standalone builds; falls back fine in Expo Go
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    await uploadPushToken(token);
  } catch {
    // Silently skip — push is best-effort; app works without it
  }
}

type UserRole = 'sender' | 'courier';

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  setAvatarUrl: (url: string) => void;
  updateProfile: (full_name: string, phone_number?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AVATAR_KEY = (userId: string) => `hp_avatar_${userId}`;

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  role: null,
  user: null,
  loading: false,
  error: null,

  signUp: async (email, password, fullName, role) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Kayıt tamamlanamadı');

      try {
        await createUser({ id: data.user.id, full_name: fullName, role, email });
      } catch {
        console.warn('Profile row could not be created — backend may be offline.');
      }

      set({ isLoggedIn: true, role, loading: false });
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      const message =
        raw.toLowerCase().includes('already registered') ||
        raw.toLowerCase().includes('user already exists')
          ? 'Kullanıcı Zaten Kayıtlı.'
          : raw || 'Kayıt başarısız';
      set({ loading: false, error: message });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Unblock the UI immediately after Supabase responds
      set({ isLoggedIn: true, loading: false });

      // Fetch profile + register push token in the background
      try {
        const profile = await getMe();
        const savedAvatar = await SecureStore.getItemAsync(AVATAR_KEY(profile.id));
        if (savedAvatar && !profile.avatar_url) profile.avatar_url = savedAvatar;
        set({ role: profile.role as UserRole, user: profile });
        registerPushToken();
      } catch {
        // Profile fetch failed (backend down / slow) — user is still logged in via Supabase
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Giriş başarısız';
      set({ loading: false, error: message });
      throw err;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ isLoggedIn: false, role: null, user: null });
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const profile = await getMe();
      const savedAvatar = await SecureStore.getItemAsync(AVATAR_KEY(profile.id));
      if (savedAvatar && !profile.avatar_url) profile.avatar_url = savedAvatar;

      set({ isLoggedIn: true, role: profile.role as UserRole, user: profile });
      registerPushToken();
    } catch {
      await supabase.auth.signOut();
    }
  },

  clearError: () => set({ error: null }),

  setAvatarUrl: (url) => {
    set((s) => ({ user: s.user ? { ...s.user, avatar_url: url } : s.user }));
    const userId = get().user?.id;
    if (userId) SecureStore.setItemAsync(AVATAR_KEY(userId), url);
  },

  updateProfile: async (full_name, phone_number) => {
    const updated = await updateMe({ full_name, phone_number });
    const savedAvatar = get().user?.avatar_url;
    set((s) => ({ user: { ...updated, avatar_url: savedAvatar ?? s.user?.avatar_url } }));
  },

  deleteAccount: async () => {
    await deleteMe();
    await supabase.auth.signOut();
    set({ isLoggedIn: false, role: null, user: null });
  },

  refreshUser: async () => {
    const profile = await getMe();
    const savedAvatar = get().user?.avatar_url;
    set((s) => ({ user: { ...profile, avatar_url: savedAvatar ?? s.user?.avatar_url } }));
  },
}));
