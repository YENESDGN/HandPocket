import { create } from 'zustand';

type UserRole = 'sender' | 'courier';

interface AuthState {
    isLoggedIn: boolean;
    role: UserRole | null;
    login: (role: UserRole) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    role: null,
    login: (role: UserRole) => set({ isLoggedIn: true, role }),
    logout: () => set({ isLoggedIn: false, role: null }),
}));
