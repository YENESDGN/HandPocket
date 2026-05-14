import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
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
                await api.post('/users', {
                    id: data.user.id,
                    full_name: fullName,
                    role,
                    email,
                });
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

            const { data: profile } = await api.get<User>('/users/me');
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
            const { data: profile } = await api.get<User>('/users/me');
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
}));
