import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { createUser, getMe, updateMe, deleteMe } from '../services/userService';
import type { User } from '../types';

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

export const useAuthStore = create<AuthState>((set) => ({
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

            // Profile creation is best-effort — auth user is already created in Supabase
            try {
                await createUser({ id: data.user.id, full_name: fullName, role, email });
            } catch {
                console.warn('Profile row could not be created — backend may be offline.');
            }

            set({ isLoggedIn: true, role, loading: false });
        } catch (err: unknown) {
            const raw = err instanceof Error ? err.message : '';
            const message = raw.toLowerCase().includes('already registered') || raw.toLowerCase().includes('user already exists')
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

            const profile = await getMe();
            const savedAvatar = localStorage.getItem(`hp_avatar_${profile.id}`);
            if (savedAvatar && !profile.avatar_url) profile.avatar_url = savedAvatar;
            set({
                isLoggedIn: true,
                role: profile.role as UserRole,
                user: profile,
                loading: false,
            });
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
            const savedAvatar = localStorage.getItem(`hp_avatar_${profile.id}`);
            if (savedAvatar && !profile.avatar_url) profile.avatar_url = savedAvatar;
            set({
                isLoggedIn: true,
                role: profile.role as UserRole,
                user: profile,
            });
        } catch {
            await supabase.auth.signOut();
        }
    },

    clearError: () => set({ error: null }),

    setAvatarUrl: (url) => {
        set((s) => ({ user: s.user ? { ...s.user, avatar_url: url } : s.user }));
        const userId = useAuthStore.getState().user?.id;
        if (userId) localStorage.setItem(`hp_avatar_${userId}`, url);
    },

    updateProfile: async (full_name, phone_number) => {
        const updated = await updateMe({ full_name, phone_number });
        const savedAvatar = useAuthStore.getState().user?.avatar_url;
        set((s) => ({ user: { ...updated, avatar_url: savedAvatar ?? s.user?.avatar_url } }));
    },

    deleteAccount: async () => {
        await deleteMe();
        await supabase.auth.signOut();
        set({ isLoggedIn: false, role: null, user: null });
    },

    refreshUser: async () => {
        const profile = await getMe();
        const savedAvatar = useAuthStore.getState().user?.avatar_url;
        set((s) => ({ user: { ...profile, avatar_url: savedAvatar ?? s.user?.avatar_url } }));
    },
}));
