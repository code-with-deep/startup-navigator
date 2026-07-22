'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: Omit<User, 'isBanned' | 'createdAt'> | null;
  isLoading: boolean;
  setUser: (user: Omit<User, 'isBanned' | 'createdAt'> | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null });
        window.location.href = '/';
      },
    }),
    {
      name: 'sn-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
